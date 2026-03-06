import { getCurrentUser } from "@/lib/auth";
import JoinGroupClient from "./JoinGroupClient";

export default async function JoinGroupPage({ params }: { params: Promise<{ token: string }> }) {
  await getCurrentUser();

  const { token } = await params;
  return <JoinGroupClient token={token} />;
}
