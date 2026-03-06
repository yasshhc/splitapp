import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import DirectSettleForm from "./DirectSettleForm";
import { prisma } from "@/lib/prisma";

export default async function DirectSettlePage({ params }: { params: Promise<{ userId: string }> }) {
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
      <DirectSettleForm friendId={friend.id} friendName={friend.name} />
    </div>
  );
}
