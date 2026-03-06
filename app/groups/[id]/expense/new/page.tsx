import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ExpenseForm from "./ExpenseForm";
import { prisma } from "@/lib/prisma";

export default async function NewExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  const { id } = await params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: { members: { include: { user: { select: { id: true, name: true } } } } },
  });

  if (!group) redirect("/groups");

  return (
    <div>
      <Navbar />
      <ExpenseForm
        groupId={id}
        groupCurrency={group.currency}
        members={group.members.map((m) => m.user)}
        currentUserId={user!.id}
      />
    </div>
  );
}
