import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGroupBalances } from "@/lib/balance";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      expenses: {
        include: {
          payer: { select: { id: true, name: true } },
          participants: { include: { user: { select: { id: true, name: true } } } },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const balances = await getGroupBalances(id, session.user.id);

  return NextResponse.json({ ...group, balances });
}
