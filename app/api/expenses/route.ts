import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Participant = {
  userId: string;
  shares?: number;
  percent?: number;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { description, amount, currency, paidBy, groupId, date, participants, splitType } = await req.json();

  if (!description || !amount || !paidBy || !participants?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Calculate share amounts based on split type
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

  const expense = await prisma.expense.create({
    data: {
      description,
      amount,
      currency: currency ?? "USD",
      paidBy,
      groupId: groupId ?? null,
      date: date ? new Date(date) : new Date(),
      participants: {
        create: participantsWithShares,
      },
    },
    include: {
      payer: { select: { id: true, name: true } },
      participants: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json(expense);
}
