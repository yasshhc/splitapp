"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

type Member = { id: string; name: string };

type Participant = {
  userId: string;
  included: boolean;
  shares: number;
  percent: number;
};

export default function ExpenseForm({
  groupId,
  groupCurrency,
  members,
  currentUserId,
}: {
  groupId: string;
  groupCurrency: string;
  members: Member[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    description: "",
    amount: "",
    paidBy: currentUserId,
    date: new Date().toISOString().split("T")[0],
    splitType: "equally" as "equally" | "percent" | "shares",
    notes: "",
    category: "",
  });

  const [participants, setParticipants] = useState<Participant[]>(
    members.map((m) => ({ userId: m.id, included: true, shares: 1, percent: 100 / members.length }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleParticipant(userId: string) {
    setParticipants((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, included: !p.included } : p))
    );
  }

  function updateParticipant(userId: string, field: "shares" | "percent", value: number) {
    setParticipants((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, [field]: value } : p))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const included = participants.filter((p) => p.included);
    if (included.length === 0) {
      setError("Select at least one participant");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: form.description,
        amount: parseFloat(form.amount),
        currency: groupCurrency,
        paidBy: form.paidBy,
        groupId,
        date: form.date,
        splitType: form.splitType,
        notes: form.notes || null,
        category: form.category || null,
        participants: included.map((p) => ({
          userId: p.userId,
          shares: p.shares,
          percent: p.percent,
        })),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push(`/groups/${groupId}`);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add expense</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            placeholder="e.g. Dinner"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({groupCurrency})</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Paid by</label>
          <select
            value={form.paidBy}
            onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            >
              <option value="">None</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              placeholder="Optional notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Split type</label>
          <div className="flex gap-2">
            {(["equally", "percent", "shares"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, splitType: t })}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                  form.splitType === t
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
          <div className="flex flex-col gap-2">
            {members.map((m) => {
              const p = participants.find((p) => p.userId === m.id)!;
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={p.included}
                    onChange={() => toggleParticipant(m.id)}
                    className="accent-green-600"
                  />
                  <span className="flex-1 text-sm">{m.name}</span>
                  {p.included && form.splitType === "shares" && (
                    <input
                      type="number"
                      min="1"
                      value={p.shares}
                      onChange={(e) => updateParticipant(m.id, "shares", parseFloat(e.target.value))}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  )}
                  {p.included && form.splitType === "percent" && (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={p.percent}
                      onChange={(e) => updateParticipant(m.id, "percent", parseFloat(e.target.value))}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

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
