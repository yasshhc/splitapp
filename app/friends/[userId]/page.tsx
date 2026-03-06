import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import ExpenseHistoryList from "@/components/ExpenseHistoryList";

export default async function FriendDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { userId: friendId } = await params;

  const friend = await prisma.user.findUnique({
    where: { id: friendId },
    select: { id: true, name: true },
  });

  if (!friend) redirect("/friends");

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{friend.name}</h1>
            <p className="text-sm text-gray-500">Direct expense history</p>
          </div>
          <Link
            href={`/friends/${friendId}/expense/new`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            + Add expense
          </Link>
        </div>
        <ExpenseHistoryList
          scope="friend"
          entityId={friendId}
          currentUserId={session.user.id!}
          members={[
            { id: session.user.id!, name: "You" },
            { id: friend.id, name: friend.name },
          ]}
        />
      </div>
    </div>
  );
}
