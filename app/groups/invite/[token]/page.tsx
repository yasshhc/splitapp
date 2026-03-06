import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import JoinGroupClient from "./JoinGroupClient";

export default async function JoinGroupPage({ params }: { params: Promise<{ token: string }> }) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { token } = await params;
  return <JoinGroupClient token={token} />;
}
