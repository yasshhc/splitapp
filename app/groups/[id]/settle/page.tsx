import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SettleForm from "./SettleForm";
import { prisma } from "@/lib/prisma";

export default async function SettlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ with?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const { with: withUserId } = await searchParams;

  const group = await prisma.group.findUnique({
    where: { id },
    include: { members: { include: { user: { select: { id: true, name: true } } } } },
  });

  if (!group) redirect("/groups");

  const otherMembers = group.members
    .map((m) => m.user)
    .filter((u) => u.id !== session.user.id);

  return (
    <div>
      <Navbar />
      <SettleForm
        groupId={id}
        groupCurrency={group.currency}
        members={otherMembers}
        currentUserId={session.user.id!}
        preselectedUserId={withUserId}
      />
    </div>
  );
}
