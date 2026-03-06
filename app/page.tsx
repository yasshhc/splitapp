import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">SplitApp</h1>
        <p className="text-gray-500 text-lg mb-8">
          Split expenses with friends and groups. Track who owes what — simply.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/auth/signup"
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
