import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ExpenseHistoryClient from "./ExpenseHistoryClient";

export default async function ExpensesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <div>
      <Navbar />
      <ExpenseHistoryClient currentUserId={session.user.id!} />
    </div>
  );
}
