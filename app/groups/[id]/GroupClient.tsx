"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Member = { user: { id: string; name: string; email: string } };
type Balance = { userId: string; userName: string; amount: number; currency: string };
type Expense = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  payer: { id: string; name: string };
  participants: { user: { id: string; name: string }; shareAmount: number }[];
};

type GroupData = {
  id: string;
  name: string;
  currency: string;
  inviteToken: string;
  members: Member[];
  expenses: Expense[];
  balances: Balance[];
};

export default function GroupClient({ groupId, currentUserId }: { groupId: string; currentUserId: string }) {
  const [group, setGroup] = useState<GroupData | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [tab, setTab] = useState<"balances" | "expenses">("balances");

  useEffect(() => {
    fetch(`/api/groups/${groupId}`).then((r) => r.json()).then(setGroup);
  }, [groupId]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/groups/${groupId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    const data = await res.json();
    setInviteMsg(data.message ?? data.error);
    setInviteEmail("");
    fetch(`/api/groups/${groupId}`).then((r) => r.json()).then(setGroup);
  }

  if (!group) return <div className="p-6 text-gray-600">Loading...</div>;

  const shareLink = `${window.location.origin}/groups/invite/${group.inviteToken}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-sm text-gray-600">{group.currency} · {group.members.length} members</p>
        </div>
        <Link
          href={`/groups/${groupId}/expense/new`}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          + Add expense
        </Link>
      </div>

      {/* Invite */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-gray-900 mb-2">Invite members</p>
        <form onSubmit={handleInvite} className="flex gap-2 mb-2">
          <input
            type="email"
            placeholder="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
            Invite
          </button>
        </form>
        {inviteMsg && <p className="text-xs text-gray-700">{inviteMsg}</p>}
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1">Or share this link:</p>
          <div className="flex gap-2 items-center">
            <input
              readOnly
              value={shareLink}
              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50 text-gray-700"
            />
            <button
              onClick={() => navigator.clipboard.writeText(shareLink)}
              className="text-xs text-green-600 hover:underline"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Members</p>
        <div className="flex gap-2 flex-wrap">
          {group.members.map((m) => (
            <span key={m.user.id} className="bg-gray-100 text-gray-900 text-sm px-3 py-1 rounded-full">
              {m.user.name}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {(["balances", "expenses"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium capitalize transition ${
              tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "balances" && (
        <div className="flex flex-col gap-2">
          {group.balances.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-600">
              All settled up!
            </div>
          ) : (
            group.balances.map((b) => (
              <div key={b.userId} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex justify-between items-center">
                <span className="font-medium text-gray-900">{b.userName}</span>
                <div className="flex items-center gap-3">
                  <span className={b.amount > 0 ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                    {b.amount > 0
                      ? `owes you ${b.currency} ${b.amount.toFixed(2)}`
                      : `you owe ${b.currency} ${Math.abs(b.amount).toFixed(2)}`}
                  </span>
                  <Link
                    href={`/groups/${groupId}/settle?with=${b.userId}`}
                    className="text-xs text-green-600 hover:underline"
                  >
                    Settle
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "expenses" && (
        <div className="flex flex-col gap-2">
          {group.expenses.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-600">
              No expenses yet.
            </div>
          ) : (
            group.expenses.map((exp) => (
              <div key={exp.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{exp.description}</span>
                  <span className="font-semibold text-gray-900">{exp.currency} {exp.amount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">
                  Paid by {exp.payer.id === currentUserId ? "you" : exp.payer.name} ·{" "}
                  {new Date(exp.date).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
