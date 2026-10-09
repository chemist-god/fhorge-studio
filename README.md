# FORGE Studio

A premium gym website and member portal for FORGE Studio in Accra, Ghana.

The pre-development blueprint is available in [docs/architecture.md](docs/architecture.md). It covers the system architecture, database schema, ERD, folder structure, feature breakdown, development milestones, API design, and deployment strategy.

## M0 Foundation

M0 is implemented without feature UIs. It includes the Next.js 15/TypeScript shell, tenant-aware Drizzle schema and generated migration, Better Auth route foundation, gym-scoped RBAC contracts, Zod validators, feature flags, Macho public-data tool contracts, Stripe/Resend/R2/PostHog integration clients, seed scripts, and Vitest coverage for authorization and flags.

```bash
npm install
cp .env.example .env
npm run typecheck
npm test
npm run db:generate
npm run db:migrate
npm run db:seed
```

`DATABASE_URL` and the service credentials in `.env` must be configured before migration or seed commands. The launch billing catalog is USD: Base `$129`, Plus `$169`, and Unlimited `$219`.
