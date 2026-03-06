"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Balance = { userId: string; userName: string; amount: number; currency: string };
type User = { id: string; name: string; email: string };

export default function FriendsClient({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setBalances(d.balances ?? []));
  }, []);

  useEffect(() => {
    if (!query) { setResults([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then(setResults);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  function goToDirectExpense(userId: string) {
    router.push(`/friends/${userId}/expense/new`);
  }

  const friendIds = new Set(balances.map((b) => b.userId));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Friends & Direct Expenses</h1>

      {/* Search to add direct expense */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 relative">
        <p className="text-sm font-medium text-gray-700 mb-2">Add expense with someone</p>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
        />
        {results.length > 0 && (
          <div className="absolute left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10">
            {results.map((u) => (
              <button
                key={u.id}
                onClick={() => { setQuery(""); setResults([]); goToDirectExpense(u.id); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex justify-between items-center"
              >
                <span className="font-medium text-sm">{u.name}</span>
                <span className="text-xs text-gray-600">{u.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Balances */}
      <h2 className="text-lg font-semibold mb-3">Balances</h2>
      {balances.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-600">
          No balances yet. Add an expense with someone above.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {balances.map((b) => (
            <div key={b.userId} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="font-medium text-gray-900">{b.userName}</span>
              <div className="flex items-center gap-3">
                <span className={b.amount > 0 ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                  {b.amount > 0
                    ? `owes you ${b.currency} ${b.amount.toFixed(2)}`
                    : `you owe ${b.currency} ${Math.abs(b.amount).toFixed(2)}`}
                </span>
                <Link href={`/friends/${b.userId}`} className="text-xs text-gray-500 hover:underline">
                  History
                </Link>
                <Link href={`/friends/${b.userId}/settle`} className="text-xs text-green-600 hover:underline">
                  Settle
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
