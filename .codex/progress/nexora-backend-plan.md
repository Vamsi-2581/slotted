# Nexora Operations — simulated backend plan

Source of truth: `/home/dreco/dev/slotted/docs/nexora-op-demo-domain.md` (Part II normative, sections 52–92).
Location: `apps/demos/nexora-operations/` (private workspace package `@slotted/demo-nexora-operations`).
Consumer: the future React client under the same directory. The client calls the typed in-process API; no HTTP transport in V1.

Layout:

```
apps/demos/nexora-operations/
  backend/domain/   types, ids, business numbers, money, quantity, time, permissions, roles, personas, errors
  backend/data/     PRNG, distributions, vocabularies, seed (tenant, master, transactions, curated, edge cases), scenarios, demo clock
  backend/api/      store, query engine, list/detail/search, commands, projections, latency profile
  backend/index.ts  createNexoraBackend()
```

Scale: canonical counts from section 75. Operational tier (trailing 120 days + all open + curated) is materialized. Historical tier is a compact skeleton index expanded on demand.

## Tasks

- [ ] T1 Scaffold + domain layer (types for every section 89/56–71 entity, helpers, permission catalog, roles, personas).
- [ ] T2 Data core: PRNG, distributions, vocabularies, tenant seed (org, users, teams, roles, assignments, warehouses, locations, price lists, categories).
- [ ] T3 Master data: products, SKUs, suppliers, mappings, customers, contacts, addresses, price entries, contract prices.
- [ ] T4 Transaction engine: timeline skeleton, orders/lines/quotes, reservations, shipments, movements, invoices, payments, credit memos, returns, POs, receipts, tickets, bank transactions, approvals, workflows, notifications, tasks, activity, audit.
- [ ] T5 Curated flagship narrative (Meridian) + 35 edge-case fixtures with keys.
- [ ] T6 Projections: inventory balance, customer finance, order derived states, invoice settlement/collection, supplier performance, KPIs, account health.
- [ ] T7 Store + API: query engine, list/detail/search for every GET endpoint, session/persona, authorization, errors, latency, idempotency, concurrency.
- [ ] T8 Commands: section 79 operation catalog.
- [ ] T9 Scenarios, demo clock advance, reset, optional IndexedDB persistence.
- [ ] T10 README for the client + `pnpm --filter @slotted/demo-nexora-operations test` green.
- [ ] T11 Remove `tools/nexora-benchmark` and its root scripts (evidence remains in git history).
