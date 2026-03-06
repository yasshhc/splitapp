"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "SGD"];

export default function DirectExpenseForm({
  friendId,
  friendName,
  currentUserId,
  currentUserName,
}: {
  friendId: string;
  friendName: string;
  currentUserId: string;
  currentUserName: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    description: "",
    amount: "",
    currency: "USD",
    paidBy: currentUserId,
    date: new Date().toISOString().split("T")[0],
    splitType: "equally" as "equally" | "percent" | "shares",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const amt = parseFloat(form.amount);
    const participants =
      form.splitType === "equally"
        ? [{ userId: currentUserId }, { userId: friendId }]
        : [
            { userId: currentUserId, shares: 1, percent: 50 },
            { userId: friendId, shares: 1, percent: 50 },
          ];

    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: form.description,
        amount: amt,
        currency: form.currency,
        paidBy: form.paidBy,
        groupId: null,
        date: form.date,
        splitType: form.splitType,
        participants,
      }),
    });

    router.push("/friends");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Add expense</h1>
      <p className="text-gray-500 text-sm mb-6">Between you and {friendName}</p>
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            placeholder="e.g. Lunch"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Paid by</label>
          <select
            value={form.paidBy}
            onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
          >
            <option value={currentUserId}>{currentUserName} (you)</option>
            <option value={friendId}>{friendName}</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
        >
          {loading ? "Saving..." : "Add expense"}
        </button>
      </form>
    </div>
  );
}
