"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinGroupClient({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.groupId) {
          setStatus("done");
          setMessage(data.message);
          setTimeout(() => router.push(`/groups/${data.groupId}`), 1500);
        } else {
          setStatus("error");
          setMessage(data.error ?? "Invalid link");
        }
      });
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-sm w-full">
        {status === "loading" && <p className="text-gray-500">Joining group...</p>}
        {status === "done" && <p className="text-green-600 font-medium">{message} — redirecting...</p>}
        {status === "error" && <p className="text-red-500">{message}</p>}
      </div>
    </div>
  );
}
