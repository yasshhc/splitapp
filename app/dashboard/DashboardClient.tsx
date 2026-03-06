"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingDown, TrendingUp, Plus, ChevronRight } from "lucide-react";

type Balance = { userId: string; userName: string; amount: number; currency: string };
type Group = { id: string; name: string; currency: string };
type DashboardData = { balances: Balance[]; groups: Group[]; totalOwed: number; totalOwing: number };

export default function DashboardClient({ userName }: { userId: string; userName: string }) {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hi, {userName} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your current balance overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4" /> You owe
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">${data.totalOwed.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> You're owed
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">${data.totalOwing.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Balances */}
      {data.balances.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Balances</h2>
          <Card>
            <CardContent className="p-0">
              {data.balances.map((b, i) => (
                <div key={b.userId}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                        {b.userName[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{b.userName}</span>
                    </div>
                    <Badge variant={b.amount > 0 ? "default" : "destructive"} className="font-medium">
                      {b.amount > 0
                        ? `+${b.currency} ${b.amount.toFixed(2)}`
                        : `-${b.currency} ${Math.abs(b.amount).toFixed(2)}`}
                    </Badge>
                  </div>
                  {i < data.balances.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {data.balances.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium">All settled up!</p>
            <p className="text-sm text-muted-foreground">No outstanding balances</p>
          </CardContent>
        </Card>
      )}

      {/* Groups */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Your Groups</h2>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href="/groups/new"><Plus className="h-4 w-4" /> New group</Link>
          </Button>
        </div>
        {data.groups.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <p className="font-medium">No groups yet</p>
              <p className="text-sm text-muted-foreground mb-3">Create a group to start splitting</p>
              <Button asChild size="sm"><Link href="/groups/new">Create group</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              {data.groups.map((g, i) => (
                <div key={g.id}>
                  <Link href={`/groups/${g.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {g.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{g.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{g.currency}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                  {i < data.groups.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
