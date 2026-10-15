# Nexora Shared Platform Design

**Status:** Approved architectural direction; awaiting review of this written specification

**Date:** 2026-09-15

**Normative product contract:** [`demos/nexora/domain.md`](../../nexora-op-demo-domain.md)

## 1. Purpose

Build the complete UI-independent platform for Nexora Operations before the React reference client. This is not a fixture collection or a generic mock server. It is a deterministic synthetic enterprise system whose business rules, history, scale, data relationships, and failure modes are credible enough that a later client can behave like a real commercial operations product.

The existing Nexora domain specification remains authoritative for product behavior. This document defines how to implement that contract in the repository without duplicating the product rules or weakening their normative language.

## 2. Scope

This program delivers:

- the complete V1 domain model and common value types;
- every V1 business operation and cross-domain effect;
- realistic curated and generated data at the specified mature scale;
- named deterministic scenarios and personas;
- in-memory and IndexedDB persistence;
- query indexes and derived projections;
- a transport-independent application API;
- an HTTP-like MSW adapter;
- stable errors, authorization, idempotency, conflicts, latency, and failure simulation;
- domain, data, persistence, API, statistical, reconciliation, and performance tests.

It does not deliver React or Angular applications, routes, screens, UI view models, component adapters, presentation state, or visual styling. Capabilities explicitly deferred by section 87 of the normative product contract remain deferred.

## 3. Quality Standard

Completion is measured by the normative Definition of Done and minimum automated domain test matrix, not by package existence or TypeScript compilation.

The implementation must satisfy these principles:

1. **Business truth precedes presentation.** UI needs cannot bypass domain rules.
2. **Randomness is not realism.** Generated values follow explicit distributions, correlations, chronology, and causal relationships.
3. **Every total is explainable.** KPIs and balances reconcile to underlying records.
4. **Scale is real.** A reported collection total represents stable inspectable records, not a small array paired with an invented count.
5. **Mutations have consequences.** Related entities, ledgers, projections, activity, and audit change atomically.
6. **Imperfection is intentional.** Missing values, conflicts, failed operations, partial states, long content, and restricted records are stable fixtures.
7. **The world is reproducible.** Seed, scenario, seed version, schema version, and demo clock fully determine initial state.
8. **Framework neutrality is enforced.** Shared packages contain no React, Angular, DOM, CSS, or UI-library imports.

## 4. Repository Architecture

The program introduces three workspace packages:

```text
packages/nexora-domain     @slotted/nexora-domain
          ^
          |
packages/nexora-data       @slotted/nexora-data
          ^
          |
packages/nexora-api        @slotted/nexora-api
          ^
          |
apps/nexora                future React reference client; outside this scope
```

The dependency direction is strict:

- `nexora-domain` has no dependency on the other Nexora packages or browser APIs;
- `nexora-data` depends on `nexora-domain`;
- `nexora-api` depends on `nexora-domain` and `nexora-data`;
- no dependency points from a shared package toward a reference client;
- package-layer verification and TypeScript project references enforce these rules.

The existing empty `demos/nexora-op-react` placeholder is not used by this program. The future client follows the normative name `apps/nexora`; moving or removing the placeholder is a separate, explicit change so unrelated work is not overwritten.

## 5. Package Responsibilities

### 5.1 `@slotted/nexora-domain`

This package owns business truth:

- branded internal IDs and human-readable business numbers;
- money, currency, quantity, time, pagination-neutral domain errors, and entity metadata;
- identity, CRM, catalog, pricing, approvals, sales, inventory, fulfillment, procurement, finance, support, workflow, activity, analytics, and permissions;
- aggregate state, invariants, policies, calculations, and legal state transitions;
- pure domain operations and domain events;
- stable domain fixture keys, but no generated fixture content.

Domain functions receive all nondeterministic inputs explicitly. They never read `Date.now()`, construct the current date, call `Math.random()`, access storage, or perform network work.

An operation returns a decision rather than persisting directly:

```ts
interface DomainDecision<TState, TEvent> {
  readonly state: TState;
  readonly events: readonly TEvent[];
}
```

Domain errors use a closed discriminated union with stable machine codes. User-facing copy remains outside the domain.

### 5.2 `@slotted/nexora-data`

This package owns the synthetic world and its storage:

- versioned population specifications;
- curated flagship records;
- deterministic generators and weighted distributions;
- chronological transaction-history generation;
- intentional edge-case fixtures;
- named scenario overlays;
- persistence contracts and adapters;
- query indexes, projections, and reconciliation manifests;
- deterministic reset and migration orchestration.

It provides two adapters behind the same asynchronous database contract:

- an in-memory adapter for fast deterministic tests;
- a Dexie-backed IndexedDB adapter for the browser runtime.

Dexie is an internal implementation dependency, selected for explicit multi-table IndexedDB transaction scopes. No Dexie type crosses the package boundary. The implementation follows the official [`Dexie.transaction()` contract](https://dexie.org/docs/Dexie/Dexie.transaction()).

### 5.3 `@slotted/nexora-api`

This package owns application behavior:

- commands and queries;
- request DTO validation and response serialization;
- authentication context, authorization, and record-level scope;
- transaction orchestration;
- optimistic concurrency and idempotency;
- stable API error envelopes;
- pagination, sorting, filtering, saved views, and full-text search;
- latency, conflict, dependency degradation, and partial-failure simulation;
- transport adapters.

The primary browser transport adapter uses MSW 2 request interception as documented by the official [browser integration](https://mswjs.io/docs/integrations/browser/). MSW handlers are thin translations into transport-independent application services; business behavior is never implemented in a handler.

## 6. Internal Domain Boundaries

The three workspace packages use the same internal domain vocabulary:

```text
common
identity + permissions
crm
catalog + pricing
approvals
sales
inventory + fulfillment
procurement
finance
support
workflow
activity + audit + notifications
analytics
```

These are internal modules, not separate workspace packages. Each module exposes a deliberate public surface through package subpath exports. Cross-module imports use public module contracts rather than deep private paths.

Shared engines are introduced only where the product contract already requires them: approvals, permissions, activity/audit, workflow conditions, time, money, and IDs. Similar-looking domain behavior is not generalized until its invariants are genuinely identical.

## 7. Common Kernel

The common kernel is implemented before business modules and contains no vague primitives:

- IDs are branded strings with deterministic constructors for generated data;
- business numbers use the specified prefixes and sequences independently of internal IDs;
- money uses integer minor units plus an ISO currency code and explicit rounding policies;
- quantities use fixed precision and explicit unit semantics;
- percentages and rates define their scale and rounding point;
- business time is supplied through `DemoClock` and serialized as ISO-8601 instants;
- local dates remain distinct from instants;
- every mutable entity carries version and audit metadata;
- soft deletion preserves historical referential integrity.

Floating-point arithmetic is prohibited for persisted commercial totals. Native current time and ambient randomness are prohibited throughout the three shared packages except inside explicitly injected runtime adapters.

## 8. Domain Operation Model

All mutations follow the same lifecycle:

```text
request
  -> validate DTO
  -> authenticate and authorize
  -> open transaction
  -> load aggregates and versions
  -> evaluate domain operation
  -> apply cross-domain effects
  -> append domain, activity, and audit events
  -> update indexes and projections
  -> commit atomically
  -> serialize response
```

The application layer coordinates; the domain layer decides. Cross-domain effects are explicit application services with domain-specific names, not an untyped event bus. For example, recording a payment coordinates payment allocation, invoice settlement, customer exposure, finance projections, activity, and audit within one transaction.

Commands use optimistic concurrency whenever a stale write could lose operator work. Retried externally visible commands require idempotency keys. A failed transaction leaves no partial domain, projection, activity, or audit writes.

## 9. Realistic Data Engine

### 9.1 Population specification

Every seed profile is a versioned declarative population specification containing:

- target counts by entity and period;
- weighted categorical distributions;
- continuous value distributions and bounds;
- correlation rules;
- temporal patterns and seasonality;
- relationship cardinalities;
- lifecycle and failure rates;
- named fixture requirements;
- reconciliation and statistical acceptance thresholds.

The canonical mature profile targets at least the volumes in section 22.2 of the normative contract: 4,800 customers, 11,000 contacts, 1,200 suppliers, 18,000 SKUs, 80,000 sales orders, 250,000 order lines, 600,000 stock movements, 15,000 purchase orders, 45,000 invoices, 35,000 payments, 20,000 support tickets, and high-volume activity and audit histories.

### 9.2 Deterministic randomness

The generator uses a splittable namespaced pseudorandom source:

```text
nexora-v1
  /crm/customer/000012
  /sales/order/2025/000447
  /inventory/movement/warehouse-us-03/000921
```

Adding a generator in one namespace cannot shift IDs, names, values, or dates in another. Stable IDs derive from seed version, namespace, and ordinal; business numbers derive from their own deterministic sequences.

### 9.3 Generation pipeline

Generation proceeds in causal order:

1. tenant, demo clock, users, teams, roles, and permissions;
2. warehouses, suppliers, product catalog, SKUs, and price lists;
3. customers, contacts, addresses, commercial terms, and curated accounts;
4. historical demand and quotes;
5. orders, approvals, reservations, shipments, and returns;
6. purchase orders, receipts, and stock movements;
7. invoices, payments, allocations, credits, refunds, and bank transactions;
8. tickets, conversations, SLA events, workflows, notifications, activity, and audit;
9. indexes, projections, KPI snapshots, and reconciliation manifests;
10. intentional edge cases and scenario overlays, followed by full revalidation.

Later records are derived from earlier business events. The generator never creates an invoice, payment, shipment, or balance independently of the records that justify it.

### 9.4 Correlation model

Realism is encoded in named rules rather than scattered random ranges. Examples include:

- customer segment influences order frequency, order value, negotiated pricing, payment terms, support volume, and credit exposure;
- a small stable customer cohort produces a large share of revenue;
- product category influences price, margin, lead time, seasonality, substitution, failure rate, and stock policy;
- a small SKU cohort produces most order lines and stock movements;
- supplier reliability influences promised dates, late receipts, shortages, and supplier projections;
- credit risk influences holds, approval frequency, overdue invoices, and collection activity;
- order state constrains allocation, shipment, invoice, return, and payment histories;
- ticket priority and customer tier influence SLA policy without guaranteeing a favorable outcome.

Every rule has a measurable expectation and a statistical test with a documented tolerance. Exact category counts are used where the product story requires them; bounded statistical tolerances are used where natural variation is intentional.

### 9.5 Curated and edge-case records

Flagship records such as Meridian Controls Group are authored as coherent cross-module stories, not patched display objects. Their orders, shipments, invoices, payments, tickets, notes, and timeline events are ordinary persisted entities that pass the same invariants as generated data.

Each required edge case has a stable developer-facing fixture key. A fixture catalog records its purpose, involved entity IDs, expected state, and supported scenario. Tests fail if an edge case becomes undiscoverable or stops satisfying its stated condition.

## 10. Scale and Materialization

The logical dataset is never represented by fabricated totals. Every count refers to deterministic, addressable records.

The storage strategy is hybrid:

- master data, curated stories, open operational records, recent history, mutable records, and all current balances are materialized in IndexedDB;
- large immutable historical partitions are generated deterministically in bounded chunks and persisted on initialization or profile activation;
- initialization runs off the main thread and reports progress through a runtime-neutral async interface;
- query execution reads indexes and pages, never whole tables into memory;
- aggregate projections are produced from the same records and include reconciliation metadata;
- once generated, a partition is immutable for its seed version; mutations use normal mutable records and transaction rules;
- additive schema changes that preserve existing field meaning use an explicit tested migration; any change that removes data, changes an invariant, reinterprets a value, or invalidates generated relationships performs a deterministic rebuild instead.

The canonical profile must be usable immediately after its required operational subset is ready, while historical partitions continue loading. API queries declare whether they require complete history and return an explicit initializing state until the necessary partition is committed. They never silently return partial results as complete.

The Enterprise Scale scenario uses the contract multipliers rather than duplicating hand-authored data. It is activated only through an explicit profile-selection and preparation operation; the API does not report the profile active until every required partition and projection is committed. Once active it obeys the same correctness and inspectability guarantees.

## 11. Persistence and Transactions

The database contract exposes typed tables, transactions, migrations, snapshots, reset, and integrity inspection. It does not expose IndexedDB concepts to domain or API consumers.

Persisted metadata includes schema version, seed version, scenario ID, demo clock, active persona, initialization time, population profile, and generation status by partition.

Transactions declare their read and write sets. The IndexedDB adapter maps them to Dexie transaction scopes; the in-memory adapter enforces the same atomicity and version checks. Projection and event writes participate in the originating mutation transaction.

Reset performs exactly the normative sequence: clear mutable state, restore the canonical seed, apply the selected scenario, reset the demo clock and persona, clear idempotency entries and transient failures, rebuild projections, and verify the resulting manifest.

## 12. Queries, Indexes, and Projections

The query engine is server-like even though it runs locally:

- filtering and sorting use typed field catalogs;
- cursor or offset pagination has stable deterministic tie-breakers;
- full-text search uses normalized indexed fields and deterministic ranking;
- record-level permission scope is applied before totals and facets are calculated;
- saved views store versioned filter and column contracts, not executable predicates;
- projections are incrementally updated by mutations and fully rebuildable from source records;
- dashboard KPIs expose the as-of demo time and reconciliation metadata.

Indexes are selected from named application queries in the normative route and workflow map. No index or projection exists solely as speculative infrastructure.

## 13. API Semantics

Application services expose typed commands and queries independently of HTTP. The MSW adapter maps HTTP-like requests to those services and produces a consistent response envelope.

Errors are stable and structured:

- validation errors identify fields and rule codes;
- conflicts include current version and safe recovery metadata;
- permission errors distinguish missing capability from record scope;
- not-found responses do not leak unauthorized existence;
- degraded dependency and server errors carry retryability and correlation IDs;
- partial failures identify succeeded and failed members without concealing committed work.

Simulation behavior required by a named scenario is deterministic. Optional development-only controls can inject latency or one-shot failures, but they are not part of V1 completion, are excluded from domain behavior, and must be resettable if implemented.

## 14. Authorization, Idempotency, and Concurrency

Permissions are evaluated in the application layer against the seeded persona, organization, team, warehouse scope, and target record. Domain rules remain valid even if authorization is bypassed in a test; authorization never substitutes for an invariant.

Every mutation checks entity versions before committing. Bulk operations report per-record conflicts according to the normative partial-success contract. Every create command and every action command with externally visible side effects requires an idempotency key and stores its result in the same transactional boundary as the mutation. Versioned replacement or patch commands use the entity version as their replay guard.

Security-sensitive tests prove that list totals, search, related entities, exports, and not-found behavior respect record scope, not only that mutation buttons would eventually be hidden by a UI.

## 15. Verification Strategy

### 15.1 Domain correctness

- unit tests for every value object, policy, invariant, and transition;
- table-driven lifecycle tests;
- arithmetic and rounding tests at currency and quantity boundaries;
- invariant/property tests across generated valid inputs;
- negative tests proving illegal transitions and over-allocation are rejected.

### 15.2 Data realism

- exact count checks for canonical profiles;
- distribution and correlation checks with declared tolerances;
- chronological and referential-integrity checks;
- fixture catalog discoverability tests;
- golden checks for flagship IDs, balances, totals, and timeline milestones;
- same seed, scenario, and clock producing byte-stable canonical manifests;
- different namespaces remaining stable when an unrelated generator changes.

### 15.3 Cross-domain reconciliation

- order totals reconcile with lines, pricing, discounts, and tax;
- allocations, shipments, returns, and stock ledgers reconcile by SKU and warehouse;
- purchase receipts reconcile with inbound and on-hand quantities;
- invoices, allocations, reversals, credits, refunds, and customer exposure reconcile;
- SLA projections reconcile with business-hour event histories;
- every committed mutation has the required activity and audit evidence;
- KPIs reconcile to their underlying query populations.

### 15.4 Adapter and API contracts

The same database and application-service contract suites run against in-memory and IndexedDB adapters. MSW tests verify serialization and HTTP semantics separately from business behavior. Fault, latency, idempotency, authorization, conflict, reset, and migration tests cover explicit deterministic scenarios.

### 15.5 Scale and performance

Benchmark gates cover canonical and Enterprise Scale profiles:

- initialization time and progress behavior;
- peak main-thread blocking time;
- persisted size and peak memory;
- common list, search, filter, and dashboard query latency;
- mutation and projection-update latency;
- reset and projection-rebuild time.

Before the materialization architecture is frozen, a calibration subproject must record exact budgets for the repository's browser support matrix and CI reference hardware in a checked-in benchmark manifest. It compares at least full materialization, partitioned materialization, and deterministic on-demand generation using a representative cross-domain dataset. The selected strategy must meet the manifest on Chromium, Firefox, and WebKit-class engines. A recorded budget can change only with a committed benchmark result and rationale; correctness, inspectability, or record counts cannot be reduced to make a benchmark pass.

## 16. Implementation Decomposition

The scope is too large for a single safe implementation plan. It is delivered as an ordered program of bounded subprojects, each with its own plan and checkpoint:

1. materialization calibration, browser benchmark manifest, and scale proof;
2. workspace boundaries, common kernel, demo clock, errors, and test harnesses;
3. identity, permissions, personas, tenant, and authorization foundations;
4. catalog, pricing, suppliers, warehouses, and commercial master data;
5. CRM and curated customer histories;
6. sales, approvals, order pricing, and reservations;
7. inventory, fulfillment, returns, and procurement;
8. finance, payments, reconciliation, credits, and refunds;
9. support, SLA, workflow, activity, audit, and notifications;
10. deterministic population engine, correlations, flagship stories, and edge catalog;
11. persistence, partition generation, migrations, indexes, and projections;
12. application commands, queries, transaction orchestration, and authorization;
13. MSW transport, latency/failure simulation, concurrency, and idempotency;
14. full-scale generation, cross-domain reconciliation, and performance hardening.

A thin data or API contract is interleaved only when it is required to test the current domain subproject; it cannot introduce behavior belonging to a later subproject. No subproject is declared complete without its domain, realistic data, integration behavior, and relevant verification. Checkpoints divide execution; they do not relax the final scope.

## 17. Completion Criteria

The shared platform is complete when:

- all non-UI V1 requirements in the normative contract are implemented;
- section 86 Definition of Done is satisfied;
- every test in section 92 has an automated equivalent;
- canonical and Enterprise Scale datasets meet their counts and statistical contracts;
- flagship stories and all required edge fixtures are discoverable and reconciled;
- both persistence adapters pass the shared contract suite;
- API behavior is transport-independent and the MSW adapter passes its contract tests;
- initialization, common queries, and mutations meet recorded browser budgets;
- `pnpm check:affected` passes for shared packages and dependents;
- no shared package imports React, Angular, UI components, or presentation code;
- reset reproduces the exact seed manifest and KPI values.

Only after these conditions are evidenced should the React reference client rely on the shared platform without redefining business behavior.

## 18. Recorded Decisions

- Build the entire UI-independent V1 platform before relying on screen implementation.
- Deliver by complete capability slices while preserving full program scope.
- Keep three workspace packages rather than one monolith or one package per domain.
- Use pure domain decisions, explicit application orchestration, and transactional side effects.
- Use namespaced deterministic generation with measurable realism contracts.
- Represent real addressable scale; never pair a small fixture array with fabricated totals.
- Use in-memory and Dexie-backed IndexedDB adapters behind one contract.
- Use MSW 2 only as the HTTP-like transport adapter.
- Generate and persist large datasets in bounded background partitions with explicit readiness.
- Require reconciliation, statistical, adapter-contract, authorization, and performance evidence before completion.
