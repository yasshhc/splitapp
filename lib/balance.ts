import { prisma } from "./prisma";

export type Balance = {
  userId: string;
  userName: string;
  amount: number; // positive = they owe you, negative = you owe them
  currency: string;
};

// Get simplified balances between current user and all others (across all groups + direct)
export async function getUserBalances(currentUserId: string): Promise<Balance[]> {
  const balanceMap = new Map<string, { name: string; amount: number; currency: string }>();

  // Get all expenses where user is involved
  const participations = await prisma.expenseParticipant.findMany({
    where: { userId: currentUserId },
    include: {
      expense: {
        include: {
          payer: true,
          participants: { include: { user: true } },
        },
      },
    },
  });

  for (const p of participations) {
    const expense = p.expense;
    if (expense.paidBy === currentUserId) continue; // skip if you paid

    // You owe the payer your share
    const payerId = expense.paidBy;
    const existing = balanceMap.get(payerId) ?? { name: expense.payer.name, amount: 0, currency: expense.currency };
    existing.amount -= p.shareAmount; // negative = you owe them
    balanceMap.set(payerId, existing);
  }

  // Get all expenses YOU paid and others owe you
  const expensesPaid = await prisma.expense.findMany({
    where: { paidBy: currentUserId },
    include: {
      participants: { include: { user: true } },
    },
  });

  for (const expense of expensesPaid) {
    for (const p of expense.participants) {
      if (p.userId === currentUserId) continue; // skip yourself
      const existing = balanceMap.get(p.userId) ?? { name: p.user.name, amount: 0, currency: expense.currency };
      existing.amount += p.shareAmount; // positive = they owe you
      balanceMap.set(p.userId, existing);
    }
  }

  // Apply settlements
  const settlementsFrom = await prisma.settlement.findMany({
    where: { fromUserId: currentUserId },
    include: { toUser: true },
  });

  for (const s of settlementsFrom) {
    const existing = balanceMap.get(s.toUserId) ?? { name: s.toUser.name, amount: 0, currency: s.currency };
    existing.amount += s.amount; // you paid them, so their debt to you decreases
    balanceMap.set(s.toUserId, existing);
  }

  const settlementsTo = await prisma.settlement.findMany({
    where: { toUserId: currentUserId },
    include: { fromUser: true },
  });

  for (const s of settlementsTo) {
    const existing = balanceMap.get(s.fromUserId) ?? { name: s.fromUser.name, amount: 0, currency: s.currency };
    existing.amount -= s.amount; // they paid you
    balanceMap.set(s.fromUserId, existing);
  }

  const balances: Balance[] = [];
  for (const [userId, data] of balanceMap.entries()) {
    if (Math.abs(data.amount) > 0.001) {
      balances.push({ userId, userName: data.name, amount: data.amount, currency: data.currency });
    }
  }

  return balances;
}

// Get balances within a specific group
export async function getGroupBalances(groupId: string, currentUserId: string): Promise<Balance[]> {
  const balanceMap = new Map<string, { name: string; amount: number; currency: string }>();

  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: {
      payer: true,
      participants: { include: { user: true } },
    },
  });

  const groupCurrency = (await prisma.group.findUnique({ where: { id: groupId } }))?.currency ?? "USD";

  for (const expense of expenses) {
    for (const p of expense.participants) {
      if (p.userId === currentUserId && expense.paidBy !== currentUserId) {
        // You owe payer
        const key = expense.paidBy;
        const existing = balanceMap.get(key) ?? { name: expense.payer.name, amount: 0, currency: groupCurrency };
        existing.amount -= p.shareAmount;
        balanceMap.set(key, existing);
      } else if (p.userId !== currentUserId && expense.paidBy === currentUserId) {
        // They owe you
        const existing = balanceMap.get(p.userId) ?? { name: p.user.name, amount: 0, currency: groupCurrency };
        existing.amount += p.shareAmount;
        balanceMap.set(p.userId, existing);
      }
    }
  }

  // Apply group settlements
  const settlementsFrom = await prisma.settlement.findMany({
    where: { groupId, fromUserId: currentUserId },
    include: { toUser: true },
  });
  for (const s of settlementsFrom) {
    const existing = balanceMap.get(s.toUserId) ?? { name: s.toUser.name, amount: 0, currency: groupCurrency };
    existing.amount += s.amount;
    balanceMap.set(s.toUserId, existing);
  }

  const settlementsTo = await prisma.settlement.findMany({
    where: { groupId, toUserId: currentUserId },
    include: { fromUser: true },
  });
  for (const s of settlementsTo) {
    const existing = balanceMap.get(s.fromUserId) ?? { name: s.fromUser.name, amount: 0, currency: groupCurrency };
    existing.amount -= s.amount;
    balanceMap.set(s.fromUserId, existing);
  }

  const balances: Balance[] = [];
  for (const [userId, data] of balanceMap.entries()) {
    if (Math.abs(data.amount) > 0.001) {
      balances.push({ userId, userName: data.name, amount: data.amount, currency: data.currency });
    }
  }

  return balances;
}
