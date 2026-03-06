import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { toUserId, amount, currency, groupId, note } = await req.json();

  if (!toUserId || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const settlement = await prisma.settlement.create({
    data: {
      fromUserId: user.id,
      toUserId,
      amount,
      currency: currency ?? "USD",
      groupId: groupId ?? null,
      note: note ?? null,
    },
    include: {
      fromUser: { select: { id: true, name: true } },
      toUser: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(settlement);
}
