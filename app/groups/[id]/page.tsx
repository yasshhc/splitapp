import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import GroupClient from "./GroupClient";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;
  return (
    <div>
      <Navbar />
      <GroupClient groupId={id} currentUserId={user!.id} />
    </div>
  );
}
