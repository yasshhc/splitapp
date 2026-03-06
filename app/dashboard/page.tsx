import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <Navbar />
      <DashboardClient userId={user!.id} userName={user!.name} />
    </div>
  );
}
