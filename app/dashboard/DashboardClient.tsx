"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Balance = {
  userId: string;
  userName: string;
  amount: number;
  currency: string;
};

type Group = {
  id: string;
  name: string;
  currency: string;
};

type DashboardData = {
  balances: Balance[];
  groups: Group[];
  totalOwed: number;
  totalOwing: number;
};

export default function DashboardClient({ userName }: { userId: string; userName: string }) {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-6 text-gray-600">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Hi, {userName}</h1>
      <p className="text-gray-600 mb-6">Here's where you stand</p>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-sm text-red-500 font-medium">You owe</p>
          <p className="text-2xl font-bold text-red-600">${data.totalOwed.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">You're owed</p>
          <p className="text-2xl font-bold text-green-600">${data.totalOwing.toFixed(2)}</p>
        </div>
      </div>

      {/* Balances */}
      {data.balances.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Balances</h2>
          <div className="flex flex-col gap-2">
            {data.balances.map((b) => (
              <div
                key={b.userId}
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex justify-between items-center"
              >
                <span className="font-medium text-gray-900">{b.userName}</span>
                <span className={b.amount > 0 ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                  {b.amount > 0
                    ? `owes you ${b.currency} ${b.amount.toFixed(2)}`
                    : `you owe ${b.currency} ${Math.abs(b.amount).toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.balances.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-600 mb-8">
          All settled up!
        </div>
      )}

      {/* Groups */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Your Groups</h2>
          <Link href="/groups/new" className="text-sm text-green-600 hover:underline font-medium">
            + New group
          </Link>
        </div>
        {data.groups.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-600">
            No groups yet.{" "}
            <Link href="/groups/new" className="text-green-600 hover:underline">
              Create one
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.groups.map((g) => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <span className="font-medium text-gray-900">{g.name}</span>
                <span className="text-sm text-gray-700 font-medium">{g.currency}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
