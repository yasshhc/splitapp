import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import GroupsClient from "./GroupsClient";

export default async function GroupsPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");
  return (
    <div>
      <Navbar />
      <GroupsClient />
    </div>
  );
}
