# shadcn-implementation

## What This Branch Does

Replaces all custom Tailwind UI with [shadcn/ui](https://ui.shadcn.com) components for a consistent, accessible, and production-ready design system.

---

## Components Added

| Component | Used In |
|-----------|---------|
| `Button` | All pages — primary actions, nav links, form submits |
| `Input` | All forms — auth, expenses, invites, settle, search |
| `Label` | All form fields |
| `Card` | Dashboard, group detail, friends, auth pages |
| `Badge` | Balance amounts, currency labels, member tags |
| `Separator` | List rows (balances, expenses, groups) |
| `Tabs` | Group detail page (Balances / Expenses) |
| `Select` | Currency picker, paid-by selector, split type |
| `Sonner` | Toast notifications (success/error feedback) |

---

## Other Changes

### Icons (lucide-react)
- `TrendingUp / TrendingDown` — balance summary cards
- `Plus` — add group, add expense CTAs
- `ChevronRight` — group list navigation
- `Users / UserRound` — invite section, friends page
- `Mail / Copy / Search` — invite form, share link, friend search
- `LogOut / LayoutDashboard` — navbar

### Dark Mode
- Added `next-themes` with `ThemeProvider`
- All components use shadcn CSS variables (`--background`, `--foreground`, `--muted`, etc.)
- Works with system preference automatically

### Toast Notifications (Sonner)
Every user action now has feedback:
- Expense added → `toast.success`
- Payment recorded → `toast.success`
- Invite sent → `toast.success` or `toast.error`
- Link copied → `toast.success`
- Auth error → `toast.error`

### Loading States
- Skeleton `animate-pulse` placeholders on dashboard, groups, friends while data loads

### Empty States
Every list has a proper empty state with icon + description + CTA button.

---

## Files Changed

```
app/layout.tsx                              → Added ThemeProvider + Toaster
app/page.tsx                                → shadcn Button
app/auth/login/page.tsx                     → Card, Input, Label, Button
app/auth/signup/page.tsx                    → Card, Input, Label, Button
app/dashboard/DashboardClient.tsx           → Card, Badge, Separator, Button
app/groups/GroupsClient.tsx                 → Card, Badge, Separator, Button
app/groups/new/page.tsx                     → Card, Input, Label, Select, Button
app/groups/[id]/GroupClient.tsx             → Card, Tabs, Badge, Input, Separator, Button
app/groups/[id]/expense/new/ExpenseForm.tsx → Card, Input, Label, Select, Button, Separator
app/groups/[id]/settle/SettleForm.tsx       → Card, Input, Label, Select, Button
app/friends/FriendsClient.tsx               → Card, Badge, Input, Separator, Button
app/friends/[userId]/expense/new/...        → Card, Input, Label, Select, Button
app/friends/[userId]/settle/...             → Card, Input, Label, Select, Button
components/Navbar.tsx                       → Button, Separator, lucide icons
```

---

## How to Merge Into Main

```bash
git checkout main
git merge shadcn-implementation
git push origin main
```
