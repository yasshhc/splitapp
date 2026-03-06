import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import DirectExpenseForm from "./DirectExpenseForm";
import { prisma } from "@/lib/prisma";

export default async function DirectExpensePage({ params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { userId } = await params;

  const friend = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });

  if (!friend) redirect("/friends");

  return (
    <div>
      <Navbar />
      <DirectExpenseForm
        friendId={friend.id}
        friendName={friend.name}
        currentUserId={session.user.id!}
        currentUserName={session.user.name!}
      />
    </div>
  );
}
