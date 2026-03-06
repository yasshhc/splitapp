"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { UserRound, Search } from "lucide-react";

type Balance = { userId: string; userName: string; amount: number; currency: string };
type User = { id: string; name: string; email: string };

export default function FriendsClient({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then((d) => setBalances(d.balances ?? []));
  }, []);

  useEffect(() => {
    if (!query) { setResults([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(query)}`).then((r) => r.json()).then(setResults);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Friends</h1>
        <p className="text-muted-foreground text-sm mt-1">Direct expenses between you and others</p>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-3 relative">
          <p className="text-sm font-medium">Add expense with someone</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {results.length > 0 && (
            <Card className="absolute left-4 right-4 shadow-lg z-10 mt-1">
              <CardContent className="p-0">
                {results.map((u, i) => (
                  <div key={u.id}>
                    <button
                      onClick={() => { setQuery(""); setResults([]); router.push(`/friends/${u.id}/expense/new`); }}
                      className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {u.name[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{u.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                    </button>
                    {i < results.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Balances</h2>
        {balances.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <UserRound className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">No balances yet</p>
              <p className="text-sm text-muted-foreground">Search for someone above to add an expense</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              {balances.map((b, i) => (
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
                        {b.amount > 0
                          ? `owes you ${b.currency} ${b.amount.toFixed(2)}`
                          : `you owe ${b.currency} ${Math.abs(b.amount).toFixed(2)}`}
                      </Badge>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/friends/${b.userId}/settle`}>Settle</Link>
                      </Button>
                    </div>
                  </div>
                  {i < balances.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
