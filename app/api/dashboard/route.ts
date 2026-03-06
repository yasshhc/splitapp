import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserBalances } from "@/lib/balance";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [balances, groups] = await Promise.all([
    getUserBalances(session.user.id),
    prisma.groupMember.findMany({
      where: { userId: session.user.id },
      include: { group: { select: { id: true, name: true, currency: true } } },
    }),
  ]);

  const totalOwed = balances.filter((b) => b.amount < 0).reduce((s, b) => s + Math.abs(b.amount), 0);
  const totalOwing = balances.filter((b) => b.amount > 0).reduce((s, b) => s + b.amount, 0);

  return NextResponse.json({
    balances,
    groups: groups.map((m) => m.group),
    totalOwed,
    totalOwing,
  });
}
