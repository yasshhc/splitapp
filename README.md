# SplitApp

A web-based expense splitting app — split costs with friends and groups, track who owes what, and settle up easily.

## Features (V1)

- **Accounts** — Signup/login with email and password
- **Groups** — Create groups, invite members via email, shareable link, or username search
- **Direct Expenses** — Log expenses between just two people (no group needed)
- **Expense Splitting** — Split equally, by percentage, or by shares
- **Simplified Balances** — Dashboard shows "You owe X $50" / "Y owes you $30" across all groups and friends
- **Settle Up** — Record payments between members
- **Multi-currency** — Set currency per group; supports USD, EUR, GBP, INR, AUD, CAD, JPY, SGD

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL (Neon.tech) |
| ORM | Prisma v5 |
| Auth | NextAuth.js v5 |
| Styling | Tailwind CSS |
| Hosting | Vercel |

## Project Structure

```
/app
  /api               → API routes (auth, groups, expenses, settlements, dashboard)
  /auth              → Login & signup pages
  /dashboard         → Main dashboard (balances + groups overview)
  /groups            → Group list, group detail, add expense, settle up
  /friends           → Direct expenses between two users
/components
  Navbar.tsx         → Top navigation bar
/lib
  prisma.ts          → Prisma client singleton
  auth.ts            → NextAuth config
  balance.ts         → Debt simplification logic
/prisma
  schema.prisma      → Database schema
/types
  next-auth.d.ts     → Session type augmentation
```

## Database Schema

```
User               → id, name, email, password, defaultCurrency
Group              → id, name, currency, inviteToken, createdBy
GroupMember        → groupId, userId
GroupInvite        → groupId, email, token, status
Expense            → id, description, amount, currency, paidBy, groupId (nullable), date
ExpenseParticipant → expenseId, userId, shareAmount
Settlement         → fromUserId, toUserId, amount, currency, groupId (nullable), note
```

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/splitapp.git
cd splitapp
npm install
```

### 2. Set up environment variables

Create a `.env` file:

```env
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Get a free PostgreSQL database at [neon.tech](https://neon.tech).  
Generate a secret: `openssl rand -base64 32`

### 3. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready code |
| `feature/[name]` | New features (e.g. `feature/expense-history`) |
| `fix/[name]` | Bug fixes (e.g. `fix/balance-calculation`) |

Always branch off `main`. Open a PR to merge back.

## Roadmap

### V1.1
- [ ] Expense history per group
- [ ] Edit / delete expenses
- [ ] User profile / settings page

### V1.2
- [ ] Notifications (email or in-app)
- [ ] Activity feed per group
- [ ] Export to CSV

### V2
- [ ] Payment integrations (Stripe, Venmo link)
- [ ] Mobile app (React Native)
