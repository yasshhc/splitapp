import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Join via shareable group link token
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const group = await prisma.group.findUnique({ where: { inviteToken: token } });
  if (!group) return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });

  const alreadyMember = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: session.user.id } },
  });
  if (alreadyMember) return NextResponse.json({ message: "Already a member", groupId: group.id });

  await prisma.groupMember.create({ data: { groupId: group.id, userId: session.user.id } });
  return NextResponse.json({ message: "Joined group", groupId: group.id });
}
