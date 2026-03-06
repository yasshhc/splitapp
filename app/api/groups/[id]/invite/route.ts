import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Invite by email
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { email } = await req.json();

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Check if user already exists and add them directly
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const alreadyMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: existingUser.id } },
    });
    if (alreadyMember) return NextResponse.json({ error: "Already a member" }, { status: 400 });

    await prisma.groupMember.create({ data: { groupId: id, userId: existingUser.id } });
    return NextResponse.json({ message: "User added to group" });
  }

  // Create invite for non-existing user
  const invite = await prisma.groupInvite.create({
    data: { groupId: id, email, invitedBy: user.id },
  });

  return NextResponse.json({ inviteToken: invite.token, message: "Invite created" });
}
