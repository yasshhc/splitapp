import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Join via shareable group link token
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const group = await prisma.group.findUnique({ where: { inviteToken: token } });
  if (!group) return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });

  const alreadyMember = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: user.id } },
  });
  if (alreadyMember) return NextResponse.json({ message: "Already a member", groupId: group.id });

  await prisma.groupMember.create({ data: { groupId: group.id, userId: user.id } });
  return NextResponse.json({ message: "Joined group", groupId: group.id });
}
