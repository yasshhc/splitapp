import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-2">S</div>
          <h1 className="text-4xl font-bold tracking-tight">SplitApp</h1>
          <p className="text-muted-foreground text-lg">
            Split expenses with friends and groups. Track who owes what — simply.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/signup">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Log in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
