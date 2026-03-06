"use client";
import { useEffect, useState, useCallback } from "react";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import type { Expense, AuditLog } from "@/types/expense";

type Props = {
  scope: "global" | "group" | "friend";
  entityId?: string;
  currentUserId: string;
  members?: { id: string; name: string }[];
};

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-orange-100 text-orange-700",
  Travel: "bg-blue-100 text-blue-700",
  Utilities: "bg-purple-100 text-purple-700",
  Entertainment: "bg-pink-100 text-pink-700",
  Other: "bg-gray-100 text-gray-600",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ExpenseHistoryList({ scope, entityId, currentUserId, members = [] }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (paidBy) params.set("paidBy", paidBy);
    params.set("sortBy", sortBy);
    params.set("order", order);

    if (scope === "global") return `/api/expenses?${params}`;
    if (scope === "group") return `/api/groups/${entityId}/expenses?${params}`;
    if (scope === "friend") return `/api/friends/${entityId}/expenses?${params}`;
    return `/api/expenses?${params}`;
  }, [scope, entityId, debouncedSearch, from, to, paidBy, sortBy, order]);

  useEffect(() => {
    setLoading(true);
    fetch(buildUrl())
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setExpenses(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [buildUrl, scope]);

  const toggleOrder = () => setOrder((o) => (o === "desc" ? "asc" : "desc"));

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Search description or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-gray-900"
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
          </div>
          {members.length > 0 && (
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Paid by</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                <option value="">Anyone</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id === currentUserId ? "You" : m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Sort by</label>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
              <button
                onClick={toggleOrder}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                title={order === "desc" ? "Descending" : "Ascending"}
              >
                {order === "desc" ? "↓" : "↑"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expense list */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : expenses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          No expenses found.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {expenses.map((exp) => (
            <button
              key={exp.id}
              onClick={() => setSelectedExpense(selectedExpense?.id === exp.id ? null : exp)}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-left hover:border-green-300 transition w-full"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 truncate">{exp.description}</span>
                    {exp.category && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          CATEGORY_COLORS[exp.category] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {exp.category}
                      </span>
                    )}
                    {exp.group && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        {exp.group.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Paid by {exp.payer.id === currentUserId ? "you" : exp.payer.name} ·{" "}
                    {new Date(exp.date).toLocaleDateString()}
                  </p>
                  {exp.notes && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{exp.notes}</p>
                  )}
                </div>
                <span className="font-semibold text-gray-900 ml-4 shrink-0">
                  {exp.currency} {exp.amount.toFixed(2)}
                </span>
              </div>

              {/* Audit log drawer */}
              {selectedExpense?.id === exp.id && exp.auditLogs && exp.auditLogs.length > 0 && (
                <div
                  className="mt-3 pt-3 border-t border-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-xs font-semibold text-gray-600 mb-2">Audit log</p>
                  <div className="flex flex-col gap-1.5">
                    {exp.auditLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-2 text-xs text-gray-500">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            log.action === "created"
                              ? "bg-green-50 text-green-700"
                              : log.action === "deleted"
                              ? "bg-red-50 text-red-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {log.action}
                        </span>
                        <span>by {log.user.name}</span>
                        <span>· {new Date(log.changedAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedExpense?.id === exp.id && (!exp.auditLogs || exp.auditLogs.length === 0) && (
                <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <p className="text-xs text-gray-400">No audit history available.</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
