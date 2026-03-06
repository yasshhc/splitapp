import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import FriendsClient from "./FriendsClient";

export default async function FriendsPage() {
  const user = await getCurrentUser();
  return (
    <div>
      <Navbar />
      <FriendsClient currentUserId={user!.id} />
    </div>
  );
}
