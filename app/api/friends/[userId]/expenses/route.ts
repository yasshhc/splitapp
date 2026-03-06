import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ExpenseFilter } from "@/types/expense";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId: friendId } = await params;
  const currentUserId = session.user.id;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const paidBy = searchParams.get("paidBy");
  const sortBy = searchParams.get("sortBy") ?? "date";
  const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";

  const andConditions: ExpenseFilter[] = [
    { groupId: null },
    { participants: { some: { userId: currentUserId } } },
    { participants: { some: { userId: friendId } } },
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
    console.error("[GET /api/friends/[userId]/expenses]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
