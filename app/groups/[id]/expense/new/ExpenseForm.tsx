"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type Member = { id: string; name: string };
type Participant = { userId: string; included: boolean; shares: number; percent: number };

export default function ExpenseForm({ groupId, groupCurrency, members, currentUserId }: {
  groupId: string; groupCurrency: string; members: Member[]; currentUserId: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    description: "", amount: "", paidBy: currentUserId,
    date: new Date().toISOString().split("T")[0],
    splitType: "equally" as "equally" | "percent" | "shares",
  });
  const [participants, setParticipants] = useState<Participant[]>(
    members.map((m) => ({ userId: m.id, included: true, shares: 1, percent: parseFloat((100 / members.length).toFixed(2)) }))
  );
  const [loading, setLoading] = useState(false);

  function toggleParticipant(userId: string) {
    setParticipants((prev) => prev.map((p) => p.userId === userId ? { ...p, included: !p.included } : p));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const included = participants.filter((p) => p.included);
    if (!included.length) { toast.error("Select at least one participant"); return; }
    setLoading(true);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: form.description, amount: parseFloat(form.amount),
        currency: groupCurrency, paidBy: form.paidBy, groupId, date: form.date,
        splitType: form.splitType,
        participants: included.map((p) => ({ userId: p.userId, shares: p.shares, percent: p.percent })),
      }),
    });
    if (!res.ok) { toast.error("Failed to add expense"); setLoading(false); return; }
    toast.success("Expense added!");
    router.push(`/groups/${groupId}`);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add expense</CardTitle>
          <CardDescription>Split a cost with group members</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="e.g. Dinner at Mario's" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount ({groupCurrency})</Label>
                <Input type="number" step="0.01" min="0" placeholder="0.00"
                  value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Paid by</Label>
              <Select value={form.paidBy} onValueChange={(v) => setForm({ ...form, paidBy: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Split type</Label>
              <div className="flex gap-2">
                {(["equally", "percent", "shares"] as const).map((t) => (
                  <Button key={t} type="button" variant={form.splitType === t ? "default" : "outline"}
                    size="sm" className="flex-1 capitalize" onClick={() => setForm({ ...form, splitType: t })}>
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Participants</Label>
              <div className="space-y-2">
                {members.map((m) => {
                  const p = participants.find((p) => p.userId === m.id)!;
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <input type="checkbox" checked={p.included} onChange={() => toggleParticipant(m.id)}
                        className="h-4 w-4 accent-primary rounded" />
                      <span className="flex-1 text-sm font-medium">{m.name}</span>
                      {p.included && form.splitType === "shares" && (
                        <Input type="number" min="1" value={p.shares}
                          onChange={(e) => setParticipants((prev) => prev.map((pp) => pp.userId === m.id ? { ...pp, shares: parseFloat(e.target.value) } : pp))}
                          className="w-20 h-8 text-sm" />
                      )}
                      {p.included && form.splitType === "percent" && (
                        <div className="flex items-center gap-1">
                          <Input type="number" min="0" max="100" value={p.percent}
                            onChange={(e) => setParticipants((prev) => prev.map((pp) => pp.userId === m.id ? { ...pp, percent: parseFloat(e.target.value) } : pp))}
                            className="w-20 h-8 text-sm" />
                          <span className="text-muted-foreground text-sm">%</span>
                        </div>
                      )}
                      {p.included && form.splitType === "equally" && (
                        <span className="text-sm text-muted-foreground">
                          {groupCurrency} {form.amount ? (parseFloat(form.amount) / participants.filter(pp => pp.included).length).toFixed(2) : "—"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Adding..." : "Add expense"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
