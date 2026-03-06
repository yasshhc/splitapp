"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = { id: string; name: string };

export default function SettleForm({
  groupId,
  groupCurrency,
  members,
  preselectedUserId,
}: {
  groupId: string;
  groupCurrency: string;
  members: Member[];
  currentUserId: string;
  preselectedUserId?: string;
}) {
  const router = useRouter();
  const [toUserId, setToUserId] = useState(preselectedUserId ?? members[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/settlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId, amount: parseFloat(amount), currency: groupCurrency, groupId, note }),
    });
    router.push(`/groups/${groupId}`);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settle up</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pay to</label>
          <select
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({groupCurrency})</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
          <input
            type="text"
            placeholder="e.g. Cash payment"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
        >
          {loading ? "Recording..." : "Record payment"}
        </button>
      </form>
    </div>
  );
}
