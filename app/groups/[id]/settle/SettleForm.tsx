"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Member = { id: string; name: string };

export default function SettleForm({ groupId, groupCurrency, members, preselectedUserId }: {
  groupId: string; groupCurrency: string; members: Member[]; currentUserId: string; preselectedUserId?: string;
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
    toast.success("Payment recorded!");
    router.push(`/groups/${groupId}`);
  }

  const toName = members.find((m) => m.id === toUserId)?.name ?? "";

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Settle up</CardTitle>
          <CardDescription>{toName ? `Recording payment to ${toName}` : "Record a payment"}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pay to</Label>
              <Select value={toUserId} onValueChange={setToUserId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount ({groupCurrency})</Label>
              <Input type="number" step="0.01" min="0" placeholder="0.00"
                value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input placeholder="e.g. Cash payment" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Recording..." : "Record payment"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
