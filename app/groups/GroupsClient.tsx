"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Group = { id: string; name: string; currency: string; members: { user: { name: string } }[] };

export default function GroupsClient() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    fetch("/api/groups").then((r) => r.json()).then(setGroups);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Link
          href="/groups/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          + New group
        </Link>
      </div>
      {groups.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
          No groups yet.{" "}
          <Link href="/groups/new" className="text-green-600 hover:underline">
            Create one
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="bg-white border border-gray-200 rounded-lg px-4 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">{g.name}</span>
                <span className="text-sm text-gray-600">{g.currency}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                {g.members.length} member{g.members.length !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
