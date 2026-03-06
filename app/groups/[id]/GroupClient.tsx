"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Copy, Mail, Users } from "lucide-react";

type Member = { user: { id: string; name: string; email: string } };
type Balance = { userId: string; userName: string; amount: number; currency: string };
type Expense = {
  id: string; description: string; amount: number; currency: string; date: string;
  payer: { id: string; name: string };
  participants: { user: { id: string; name: string }; shareAmount: number }[];
};
type GroupData = { id: string; name: string; currency: string; inviteToken: string; members: Member[]; expenses: Expense[]; balances: Balance[] };

export default function GroupClient({ groupId, currentUserId }: { groupId: string; currentUserId: string }) {
  const [group, setGroup] = useState<GroupData | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");

  const reload = () => fetch(`/api/groups/${groupId}`).then((r) => r.json()).then(setGroup);
  useEffect(() => { reload(); }, [groupId]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/groups/${groupId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    const data = await res.json();
    if (data.error) toast.error(data.error);
    else toast.success(data.message ?? "Invited!");
    setInviteEmail("");
    reload();
  }

  if (!group) return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
    </div>
  );

  const shareLink = `${window.location.origin}/groups/invite/${group.inviteToken}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
            {group.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
            <p className="text-sm text-muted-foreground">{group.currency} · {group.members.length} members</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/groups/${groupId}/expense/new`} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add expense
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" /> Invite members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input type="email" placeholder="friend@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="flex-1" />
            <Button type="submit" variant="secondary" className="gap-1.5">
              <Mail className="h-4 w-4" /> Invite
            </Button>
          </form>
          <div className="flex items-center gap-2">
            <Input readOnly value={shareLink} className="flex-1 text-xs text-muted-foreground" />
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0"
              onClick={() => { navigator.clipboard.writeText(shareLink); toast.success("Link copied!"); }}>
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        {group.members.map((m) => (
          <Badge key={m.user.id} variant="secondary" className="gap-1.5 py-1 px-3">
            <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
              {m.user.name[0].toUpperCase()}
            </span>
            {m.user.name}
          </Badge>
        ))}
      </div>

      <Tabs defaultValue="balances">
        <TabsList className="w-full">
          <TabsTrigger value="balances" className="flex-1">Balances</TabsTrigger>
          <TabsTrigger value="expenses" className="flex-1">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="mt-4">
          {group.balances.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="font-medium">All settled up!</p>
                <p className="text-sm text-muted-foreground">No outstanding balances in this group</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                {group.balances.map((b, i) => (
                  <div key={b.userId}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                          {b.userName[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{b.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={b.amount > 0 ? "default" : "destructive"}>
                          {b.amount > 0 ? `owes you ${b.currency} ${b.amount.toFixed(2)}` : `you owe ${b.currency} ${Math.abs(b.amount).toFixed(2)}`}
                        </Badge>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/groups/${groupId}/settle?with=${b.userId}`}>Settle</Link>
                        </Button>
                      </div>
                    </div>
                    {i < group.balances.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          {group.expenses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="font-medium">No expenses yet</p>
                <p className="text-sm text-muted-foreground mb-3">Add the first expense to this group</p>
                <Button asChild size="sm"><Link href={`/groups/${groupId}/expense/new`}>Add expense</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                {group.expenses.map((exp, i) => (
                  <div key={exp.id}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-medium">{exp.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Paid by {exp.payer.id === currentUserId ? "you" : exp.payer.name} · {new Date(exp.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-semibold">{exp.currency} {exp.amount.toFixed(2)}</span>
                    </div>
                    {i < group.expenses.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
