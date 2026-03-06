"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, ChevronRight, Users } from "lucide-react";

type Group = { id: string; name: string; currency: string; members: { user: { name: string } }[] };

export default function GroupsClient() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/groups").then((r) => r.json()).then((d) => { setGroups(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-3">
      {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground text-sm mt-1">{groups.length} group{groups.length !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild><Link href="/groups/new" className="gap-1.5"><Plus className="h-4 w-4" /> New group</Link></Button>
      </div>

      {groups.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">No groups yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create a group to start splitting expenses</p>
            <Button asChild><Link href="/groups/new">Create your first group</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {groups.map((g, i) => (
              <div key={g.id}>
                <Link href={`/groups/${g.id}`} className="flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {g.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.members.length} member{g.members.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{g.currency}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
                {i < groups.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
