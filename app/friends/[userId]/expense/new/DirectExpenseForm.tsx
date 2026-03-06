"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "SGD"];

export default function DirectExpenseForm({ friendId, friendName, currentUserId, currentUserName }: {
  friendId: string; friendName: string; currentUserId: string; currentUserName: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    description: "", amount: "", currency: "USD", paidBy: currentUserId,
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: form.description, amount: parseFloat(form.amount),
        currency: form.currency, paidBy: form.paidBy, groupId: null, date: form.date,
        splitType: "equally",
        participants: [{ userId: currentUserId }, { userId: friendId }],
      }),
    });
    toast.success("Expense added!");
    router.push("/friends");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add expense</CardTitle>
          <CardDescription>Between you and {friendName}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="e.g. Lunch" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" step="0.01" min="0" placeholder="0.00"
                  value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Paid by</Label>
              <Select value={form.paidBy} onValueChange={(v) => setForm({ ...form, paidBy: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentUserId}>{currentUserName} (you)</SelectItem>
                  <SelectItem value={friendId}>{friendName}</SelectItem>
                </SelectContent>
              </Select>
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
