import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;

  // Verify membership
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const paidBy = searchParams.get("paidBy") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "date";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  const expenses = await prisma.expense.findMany({
    where: {
      groupId,
      description: search ? { contains: search, mode: "insensitive" } : undefined,
      date: from || to
        ? { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined }
        : undefined,
      paidBy: paidBy || undefined,
    },
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
}
