import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import GroupsClient from "./GroupsClient";

export default async function GroupsPage() {
  await getCurrentUser();
  return (
    <div>
      <Navbar />
      <GroupsClient />
    </div>
  );
}
