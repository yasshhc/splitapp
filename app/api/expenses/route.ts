import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ExpenseFilter } from "@/types/expense";

type Participant = {
  userId: string;
  shares?: number;
  percent?: number;
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const paidBy = searchParams.get("paidBy");
  const sortBy = searchParams.get("sortBy") ?? "date";
  const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";

  const userId = session.user.id;

  const andConditions: ExpenseFilter[] = [
    { OR: [{ paidBy: userId }, { participants: { some: { userId } } }] },
  ];
  if (search) {
    andConditions.push({
      OR: [
        { description: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  if (from) andConditions.push({ date: { gte: new Date(from) } });
  if (to) andConditions.push({ date: { lte: new Date(to) } });
  if (paidBy) andConditions.push({ paidBy });

  try {
    const expenses = await prisma.expense.findMany({
      where: { AND: andConditions },
      include: {
        payer: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
        participants: { include: { user: { select: { id: true, name: true } } } },
        auditLogs: {
          orderBy: { changedAt: "desc" },
          include: { user: { select: { id: true, name: true } } },
        },
      },
      orderBy: sortBy === "amount" ? { amount: order } : { date: order },
    });

    return NextResponse.json(expenses);
  } catch (err) {
    console.error("[GET /api/expenses]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { description, amount, currency, paidBy, groupId, date, participants, splitType, notes, category } = await req.json();

  if (!description || !amount || !paidBy || !participants?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let participantsWithShares: { userId: string; shareAmount: number }[] = [];

  if (splitType === "equally") {
    const share = amount / participants.length;
    participantsWithShares = participants.map((p: Participant) => ({ userId: p.userId, shareAmount: share }));
  } else if (splitType === "percent") {
    participantsWithShares = participants.map((p: Participant) => ({
      userId: p.userId,
      shareAmount: amount * ((p.percent ?? 0) / 100),
    }));
  } else if (splitType === "shares") {
    const totalShares = participants.reduce((sum: number, p: Participant) => sum + (p.shares ?? 0), 0);
    participantsWithShares = participants.map((p: Participant) => ({
      userId: p.userId,
      shareAmount: amount * ((p.shares ?? 0) / totalShares),
    }));
  } else {
    return NextResponse.json({ error: "Invalid splitType" }, { status: 400 });
  }

  try {
    const [expense] = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          description,
          amount,
          currency: currency ?? "USD",
          paidBy,
          groupId: groupId ?? null,
          date: date ? new Date(date) : new Date(),
          notes: notes ?? null,
          category: category ?? null,
          participants: {
            create: participantsWithShares,
          },
        },
        include: {
          payer: { select: { id: true, name: true } },
          participants: { include: { user: { select: { id: true, name: true } } } },
        },
      });

      await tx.expenseAuditLog.create({
        data: {
          expenseId: expense.id,
          changedBy: session.user.id,
          action: "created",
          snapshot: JSON.parse(JSON.stringify(expense)),
        },
      });

      return [expense];
    });

    return NextResponse.json(expense);
  } catch (err) {
    console.error("[POST /api/expenses]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
