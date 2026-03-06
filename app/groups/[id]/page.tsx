import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import GroupClient from "./GroupClient";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/auth/login");
  const { id } = await params;
  return (
    <div>
      <Navbar />
      <GroupClient groupId={id} currentUserId={session.user.id!} />
    </div>
  );
}
