import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import FriendsClient from "./FriendsClient";

export default async function FriendsPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");
  return (
    <div>
      <Navbar />
      <FriendsClient currentUserId={session.user.id!} />
    </div>
  );
}
