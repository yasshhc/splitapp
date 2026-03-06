import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <div>
      <Navbar />
      <DashboardClient userId={session.user.id!} userName={session.user.name!} />
    </div>
  );
}
