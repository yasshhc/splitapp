export type AuditLog = {
  id: string;
  action: string;
  changedAt: string;
  user: { id: string; name: string };
  snapshot: Record<string, unknown>;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  notes?: string | null;
  category?: string | null;
  payer: { id: string; name: string };
  group?: { id: string; name: string } | null;
  participants: { user: { id: string; name: string }; shareAmount: number }[];
  auditLogs?: AuditLog[];
};

export type ExpenseFilter = {
  OR?: Array<Record<string, unknown>>;
  groupId?: string | null;
  description?: { contains: string; mode: "insensitive" };
  date?: { gte?: Date; lte?: Date };
  paidBy?: string;
  participants?: { some: { userId: string } };
};
