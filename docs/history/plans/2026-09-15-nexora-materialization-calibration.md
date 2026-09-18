# Nexora Materialization Calibration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reproducible multi-browser scale laboratory that proves how Nexora can expose its canonical and Enterprise datasets without fabricated totals, unbounded main-thread work, or incomplete query semantics.

**Architecture:** A private `@slotted/nexora-benchmark` workspace tool generates representative cross-domain records from namespaced seeds and runs four storage strategies behind one query contract: full, partitioned, on-demand, and hybrid. A deterministic Playwright scenario executes each strategy in Chromium, Firefox, and WebKit, records correctness and performance metrics, and produces a checked-in recommendation and budget manifest without introducing production domain behavior.

**Tech Stack:** TypeScript 6.0.3, Vitest 4.1.11, Vite 8.2.2, Dexie 4.4.6, fake-indexeddb 6.2.5, Playwright 1.63.0, Node.js 24, pnpm 11.24.0

**Spec:** `docs/history/designs/2026-09-15-nexora-shared-platform-design.md`

## Global Constraints

- The normative product contract is `demos/nexora/domain.md`; benchmark shapes approximate its storage and query pressure but do not implement or redefine its business rules.
- The tool must remain private and must not be imported by `packages/nexora-domain`, `packages/nexora-data`, `packages/nexora-api`, or any future client.
- No React, Angular, Slotted UI component, DOM presentation, or product screen belongs in this subproject.
- The canonical calibration profile fixes section 22.2's approximate mature volumes at their stated lower bounds; the Enterprise profile applies section 77.3 multipliers: customers and their contacts ×4, SKUs ×3, transaction history ×5, and suppliers unchanged.
- Every strategy must expose stable addressable records. A small materialized array paired with an invented total is a correctness failure.
- Generation must use explicit seed and demo time; generator code must not call `Math.random()` or `Date.now()`.
- Browser automation is restricted to the named deterministic scenario `nexora-materialization-calibration-v1`, with explicit correctness and performance assertions.
- Unit and smoke verification must remain suitable for `pnpm check:full`; full canonical/Enterprise calibration runs only through explicit benchmark scripts and the dedicated workflow.
- Existing user-owned changes and `demos/nexora-op-react` remain untouched.
- Tests are written before implementation. Except for `pnpm format`, verification commands do not modify files.

## File Map

```text
package.json                                      root benchmark entry points
.github/workflows/nexora-benchmark.yml            explicit multi-engine calibration workflow
tools/nexora-benchmark/package.json               private workspace package and scripts
tools/nexora-benchmark/tsconfig.json              Node/test typecheck
tools/nexora-benchmark/tsconfig.worker.json       isolated Web Worker typecheck
tools/nexora-benchmark/vite.config.ts             browser laboratory bundle
tools/nexora-benchmark/vitest.config.ts           Node/fake-IndexedDB unit suite
tools/nexora-benchmark/index.html                  non-visual browser entry document
tools/nexora-benchmark/src/contracts.ts            shared profiles, strategy, probe, and metric types
tools/nexora-benchmark/src/profiles.ts             smoke, canonical, and Enterprise counts
tools/nexora-benchmark/src/profiles.test.ts        profile count and multiplier tests
tools/nexora-benchmark/src/random.ts               namespaced deterministic PRNG
tools/nexora-benchmark/src/records.ts              representative record unions
tools/nexora-benchmark/src/generate.ts             causal streaming batch generator
tools/nexora-benchmark/src/generate.test.ts        determinism, count, relation, and chronology tests
tools/nexora-benchmark/src/query-contract.ts       common readiness and query semantics
tools/nexora-benchmark/src/digest.ts               stable correctness digest
tools/nexora-benchmark/src/strategies/database.ts  Dexie schema and database lifecycle
tools/nexora-benchmark/src/strategies/full.ts      eager whole-dataset candidate
tools/nexora-benchmark/src/strategies/partitioned.ts bounded persistent partition candidate
tools/nexora-benchmark/src/strategies/on-demand.ts generated immutable-history candidate
tools/nexora-benchmark/src/strategies/hybrid.ts    operational plus background-history candidate
tools/nexora-benchmark/src/strategies/contract.test.ts shared fake-IndexedDB contract suite
tools/nexora-benchmark/src/browser/protocol.ts     main-thread/worker message contract
tools/nexora-benchmark/src/browser/worker.ts       off-main-thread strategy execution
tools/nexora-benchmark/src/browser/entry.ts        named scenario browser API
tools/nexora-benchmark/src/browser/entry.test.ts   protocol and readiness tests
tools/nexora-benchmark/scripts/report.mjs          aggregation, qualification, and recommendation
tools/nexora-benchmark/scripts/report.test.mjs     percentile and decision tests
tools/nexora-benchmark/scripts/calibrate.mjs       Vite/Playwright multi-engine runner
tools/nexora-benchmark/baselines/reference.json   measured environment and raw aggregates
tools/nexora-benchmark/budgets/reference.json     derived regression thresholds
tools/nexora-benchmark/reports/materialization-decision.md generated architectural evidence
```

---

### Task 1: Establish the benchmark package and immutable scale profiles

**Files:**

- Create: `tools/nexora-benchmark/package.json`
- Create: `tools/nexora-benchmark/tsconfig.json`
- Create: `tools/nexora-benchmark/tsconfig.worker.json`
- Create: `tools/nexora-benchmark/vite.config.ts`
- Create: `tools/nexora-benchmark/vitest.config.ts`
- Create: `tools/nexora-benchmark/src/contracts.ts`
- Create: `tools/nexora-benchmark/src/profiles.ts`
- Create: `tools/nexora-benchmark/src/profiles.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Produces: `ScaleProfile`, `ScaleCounts`, `StrategyName`, `ReadinessState`, `ProbeName`, `ProbeResult`, `StrategyMetrics`, `CalibrationRun`, and `CalibrationBudget`.
- Produces: `SCALE_PROFILES.smoke`, `SCALE_PROFILES.canonical`, and `SCALE_PROFILES.enterprise` as deeply readonly values.

- [x] **Step 1: Create the private package configuration**

Create `tools/nexora-benchmark/package.json` with these exact scripts and versions:

```json
{
  "name": "@slotted/nexora-benchmark",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit --pretty false",
    "verify": "pnpm test && pnpm typecheck && pnpm build",
    "benchmark:smoke": "node scripts/calibrate.mjs --mode=smoke --profile=smoke --samples=1",
    "benchmark:record": "node scripts/calibrate.mjs --mode=record --profile=canonical,enterprise --samples=3",
    "benchmark:verify": "node scripts/calibrate.mjs --mode=verify --profile=canonical --samples=3"
  },
  "dependencies": {
    "dexie": "4.4.6"
  },
  "devDependencies": {
    "@types/node": "24.13.3",
    "fake-indexeddb": "6.2.5",
    "playwright": "1.63.0",
    "typescript": "6.0.3",
    "vite": "8.2.2",
    "vitest": "4.1.11"
  }
}
```

Add these root scripts to `package.json`:

```json
{
  "benchmark:nexora:smoke": "pnpm --filter @slotted/nexora-benchmark benchmark:smoke",
  "benchmark:nexora:record": "pnpm --filter @slotted/nexora-benchmark benchmark:record",
  "benchmark:nexora:verify": "pnpm --filter @slotted/nexora-benchmark benchmark:verify"
}
```

Create repository-conventional TypeScript and Vitest configs. Keep worker globals in `tsconfig.worker.json`; exclude `src/browser/worker.ts` from the Node/test config. The worker project is added to the `typecheck` script in Task 4, after its first source file exists. Configure Vite to build `index.html` without a framework plugin.

Run: `pnpm install`

Expected: the workspace package resolves and `pnpm-lock.yaml` records only the declared exact dependencies.

- [x] **Step 2: Write the failing profile tests**

Create `src/profiles.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { SCALE_PROFILES } from './profiles';

describe('Nexora calibration scale profiles', () => {
  it('preserves every canonical mature-data count', () => {
    expect(SCALE_PROFILES.canonical.counts).toEqual({
      customers: 4_800,
      contacts: 11_000,
      suppliers: 1_200,
      skus: 18_000,
      salesOrders: 80_000,
      salesOrderLines: 250_000,
      stockMovements: 600_000,
      purchaseOrders: 15_000,
      invoices: 45_000,
      payments: 35_000,
      supportTickets: 20_000,
    });
  });

  it('applies Enterprise multipliers only to their declared families', () => {
    expect(SCALE_PROFILES.enterprise.counts).toEqual({
      customers: 19_200,
      contacts: 44_000,
      suppliers: 1_200,
      skus: 54_000,
      salesOrders: 400_000,
      salesOrderLines: 1_250_000,
      stockMovements: 3_000_000,
      purchaseOrders: 75_000,
      invoices: 225_000,
      payments: 175_000,
      supportTickets: 100_000,
    });
  });
});
```

- [x] **Step 3: Run the tests and observe the missing module failure**

Run: `pnpm --filter @slotted/nexora-benchmark exec vitest run src/profiles.test.ts`

Expected: FAIL because `./profiles` does not exist.

- [x] **Step 4: Implement the contracts and profiles**

Define the contracts with exact string unions and readonly fields:

```ts
export type StrategyName = 'full' | 'partitioned' | 'on-demand' | 'hybrid';
export type ReadinessState = 'empty' | 'operational' | 'complete' | 'failed';
export type ProbeName =
  | 'orders-page'
  | 'customer-360'
  | 'inventory-ledger'
  | 'finance-summary'
  | 'historical-point-lookup';

export interface ScaleCounts {
  readonly customers: number;
  readonly contacts: number;
  readonly suppliers: number;
  readonly skus: number;
  readonly salesOrders: number;
  readonly salesOrderLines: number;
  readonly stockMovements: number;
  readonly purchaseOrders: number;
  readonly invoices: number;
  readonly payments: number;
  readonly supportTickets: number;
}

export interface ScaleProfile {
  readonly id: 'smoke' | 'canonical' | 'enterprise';
  readonly seed: string;
  readonly demoTime: string;
  readonly counts: ScaleCounts;
}

export interface ProbeResult {
  readonly probe: ProbeName;
  readonly visibleRecords: readonly string[];
  readonly total: number;
  readonly completeness: 'complete' | 'not-ready';
  readonly digest: string;
}
```

Use `nexora-calibration-v1` and `2026-09-15T15:00:00.000Z` for every profile. Freeze the top-level profile and nested counts objects.

- [x] **Step 5: Run focused and package checks**

Run: `pnpm --filter @slotted/nexora-benchmark exec vitest run src/profiles.test.ts`

Expected: PASS with 2 tests.

Run: `pnpm --filter @slotted/nexora-benchmark typecheck`

Expected: PASS.

- [x] **Step 6: Commit the package foundation**

```bash
git add package.json pnpm-lock.yaml tools/nexora-benchmark
git commit -m "test(nexora): establish scale calibration profiles"
```

### Task 2: Generate deterministic representative records in causal batches

**Files:**

- Create: `tools/nexora-benchmark/src/random.ts`
- Create: `tools/nexora-benchmark/src/records.ts`
- Create: `tools/nexora-benchmark/src/generate.ts`
- Create: `tools/nexora-benchmark/src/generate.test.ts`

**Interfaces:**

- Consumes: `ScaleProfile` and `SCALE_PROFILES` from Task 1.
- Produces: `CalibrationRecord`, `RecordTable`, `RecordBatch`, `GenerationSummary`, `createNamespacedRandom(seed, namespace)`, and `generateCalibrationBatches(profile, batchSize)`.
- `GenerationSummary` contains the exact emitted count per `RecordTable`, the maximum emitted batch size, and the first/last timestamp.
- `generateCalibrationBatches` returns `Generator<RecordBatch, GenerationSummary>` and never retains all generated records.

- [x] **Step 1: Write failing tests for determinism, counts, relationships, and chronology**

The tests must assert all of these behaviors:

```ts
it('repeats IDs and payloads for the same seed', () => {
  const first = collectSmoke('nexora-calibration-v1');
  const second = collectSmoke('nexora-calibration-v1');
  expect(second).toEqual(first);
});

it('does not shift customers when transaction counts change', () => {
  const base = firstIds(generateCalibrationBatches(SCALE_PROFILES.smoke, 64), 'customers', 20);
  const changed = firstIds(
    generateCalibrationBatches(withSalesOrders(SCALE_PROFILES.smoke, 999), 64),
    'customers',
    20,
  );
  expect(changed).toEqual(base);
});

it('emits the exact smoke counts', () => {
  expect(countTables(generateCalibrationBatches(SCALE_PROFILES.smoke, 64))).toEqual(
    SCALE_PROFILES.smoke.counts,
  );
});

it('never references a future or missing parent', () => {
  expect(validateRelationshipsAndChronology(SCALE_PROFILES.smoke)).toEqual([]);
});
```

Use a smoke profile of 64 customers, 128 contacts, 32 suppliers, 256 SKUs, 400 orders, 1,200 lines, 3,000 movements, 100 purchase orders, 240 invoices, 180 payments, and 120 tickets.

Define `collectSmoke`, `firstIds`, `withSalesOrders`, `countTables`, and `validateRelationshipsAndChronology` as local test helpers in `generate.test.ts`. They must consume the public generator rather than reaching into generator internals; `withSalesOrders` returns a copied frozen profile with only `salesOrders` changed.

- [x] **Step 2: Run the generator test and verify red state**

Run: `pnpm --filter @slotted/nexora-benchmark exec vitest run src/generate.test.ts`

Expected: FAIL because the generator modules do not exist.

- [x] **Step 3: Implement a namespaced PRNG and representative record union**

Implement a stable 64-bit seed hash plus SplitMix64 stream using `bigint`. Expose only `nextFloat()`, `integer(min, max)`, `pick(values)`, and `fork(namespace)`. `fork` hashes the root seed and full namespace rather than consuming the parent stream.

Define specific record interfaces for customer, contact, supplier, SKU, sales order, sales order line, stock movement, purchase order, invoice, payment, and support ticket. Each interface includes realistic indexed fields, foreign keys, ISO timestamps, status, monetary/quantity fields, and enough synthetic text to approximate final serialized record size. `CalibrationRecord` is their discriminated union; do not replace it with a generic key/value row.

- [x] **Step 4: Implement causal streaming generation**

Generate tables in this order:

```ts
export const GENERATION_ORDER = [
  'customers',
  'contacts',
  'suppliers',
  'skus',
  'salesOrders',
  'salesOrderLines',
  'stockMovements',
  'purchaseOrders',
  'invoices',
  'payments',
  'supportTickets',
] as const;
```

Assign each record a stable namespace-derived ID and a monthly partition key. Derive child timestamps at or after their parent timestamp and no later than `profile.demoTime`. Use deterministic weighted statuses and skewed references so a small stable cohort of customers and SKUs receives most transactions. The generator is a calibration model, so document every approximation in `records.ts` and do not export it as Nexora product data.

- [x] **Step 5: Run focused tests and typecheck**

Run: `pnpm --filter @slotted/nexora-benchmark exec vitest run src/generate.test.ts`

Expected: PASS with determinism, namespace isolation, exact-count, relationship, chronology, and bounded-batch tests.

Run: `pnpm --filter @slotted/nexora-benchmark typecheck`

Expected: PASS.

- [x] **Step 6: Commit deterministic generation**

```bash
git add tools/nexora-benchmark/src
git commit -m "feat(nexora): generate deterministic scale workloads"
```

### Task 3: Implement four materialization strategies behind one correctness contract

**Files:**

- Create: `tools/nexora-benchmark/src/query-contract.ts`
- Create: `tools/nexora-benchmark/src/digest.ts`
- Create: `tools/nexora-benchmark/src/strategies/database.ts`
- Create: `tools/nexora-benchmark/src/strategies/full.ts`
- Create: `tools/nexora-benchmark/src/strategies/partitioned.ts`
- Create: `tools/nexora-benchmark/src/strategies/on-demand.ts`
- Create: `tools/nexora-benchmark/src/strategies/hybrid.ts`
- Create: `tools/nexora-benchmark/src/strategies/contract.test.ts`

**Interfaces:**

- Consumes: `ScaleProfile`, record batches, and `StrategyName`.
- Produces: `createStrategy(name, options): MaterializationStrategy`.
- Produces: a shared readiness/query lifecycle used unchanged by browser calibration.

```ts
export interface MaterializationStrategy {
  readonly name: StrategyName;
  prepare(profile: ScaleProfile, observer: StrategyObserver): Promise<StrategySession>;
}

export interface StrategySession {
  readiness(): Promise<ReadinessSnapshot>;
  runProbe(name: ProbeName): Promise<ProbeResult>;
  correctnessDigest(): Promise<string>;
  storageEstimate(): Promise<number>;
  dispose(): Promise<void>;
}

export interface StrategyObserver {
  onBatch(sample: { readonly records: number; readonly durationMs: number }): void;
  onReadiness(snapshot: ReadinessSnapshot): void;
}

export interface ReadinessSnapshot {
  readonly state: ReadinessState;
  readonly committedCounts: Readonly<ScaleCounts>;
  readonly committedPartitions: number;
  readonly pendingPartitions: number;
}
```

- [x] **Step 1: Write a parameterized failing contract suite**

Run every strategy against a fresh fake IndexedDB database and require:

```ts
describe.each(['full', 'partitioned', 'on-demand', 'hybrid'] as const)('%s strategy', (name) => {
  it('exposes no fabricated totals at operational readiness', async () => {
    const session = await prepareSmoke(name);
    const page = await session.runProbe('orders-page');
    expect(page.visibleRecords).toHaveLength(50);
    expect(page.total).toBe(SCALE_PROFILES.smoke.counts.salesOrders);
    expect(page.completeness).toBe('complete');
  });

  it('converges on the reference digest', async () => {
    const session = await prepareSmoke(name);
    await waitForComplete(session);
    expect(await session.correctnessDigest()).toBe(await referenceDigest());
  });
});
```

Add explicit tests for monotonic readiness, bounded batch size, stable pagination tie-breakers, deep historical lookup, database deletion on `dispose`, and a `not-ready` probe result when a query genuinely requires an uncommitted partition.

Define `prepareSmoke`, `waitForComplete`, and `referenceDigest` as local contract-suite helpers. `referenceDigest` is calculated from a completed `full` smoke session once per test run; it is not a handwritten digest and is not imported by implementation code.

- [x] **Step 2: Run the strategy contract and verify red state**

Run: `pnpm --filter @slotted/nexora-benchmark exec vitest run src/strategies/contract.test.ts`

Expected: FAIL because the strategy factory and query contract do not exist.

- [x] **Step 3: Implement the Dexie calibration schema and query probes**

Create one table per representative record family plus metadata and partitions. Index stable IDs, partition keys, parent foreign keys, common status/filter keys, and chronological sort keys. Generate a unique database name from strategy, profile, browser-run ID, and sample number.

Implement exactly five probes:

1. 50-row order page with status filter and deterministic descending tie-breaker;
2. customer 360 related-count and recent-activity read;
3. SKU/warehouse inventory-ledger page;
4. finance summary derived from invoice/payment rows;
5. deep historical point lookup by stable ID.

`correctnessDigest` hashes sorted probe outputs, exact table counts, and representative first/middle/last IDs. It does not hash physical storage order.

- [x] **Step 4: Implement the four candidates**

- `full` collects each complete table then writes it in one declared transaction;
- `partitioned` consumes bounded generator batches and commits monthly partitions independently;
- `on-demand` materializes master data and deterministic locator indexes, then generates immutable historical partitions before answering a dependent query;
- `hybrid` materializes master data, open records, recent 12-month history, and current balances first, then persists older history in background partitions while supporting explicit on-demand promotion.

Every candidate returns `operational` and `complete` only when the readiness definitions are true. Background work is cancellable through `dispose` and cannot continue writing after disposal.

- [x] **Step 5: Prove shared correctness**

Run: `pnpm --filter @slotted/nexora-benchmark exec vitest run src/strategies/contract.test.ts`

Expected: PASS for all four strategies and all five probes.

Run: `pnpm --filter @slotted/nexora-benchmark test`

Expected: PASS.

- [x] **Step 6: Commit storage candidates**

```bash
git add tools/nexora-benchmark/src
git commit -m "feat(nexora): compare materialization strategies"
```

### Task 4: Run the named calibration scenario off the main thread

**Files:**

- Create: `tools/nexora-benchmark/index.html`
- Create: `tools/nexora-benchmark/src/browser/protocol.ts`
- Create: `tools/nexora-benchmark/src/browser/worker.ts`
- Create: `tools/nexora-benchmark/src/browser/entry.ts`
- Create: `tools/nexora-benchmark/src/browser/entry.test.ts`
- Modify: `tools/nexora-benchmark/vite.config.ts`

**Interfaces:**

- Consumes: strategy factory and profiles.
- Produces: `window.runNexoraCalibration(request): Promise<CalibrationRun>` only on the laboratory page.
- Produces: `CalibrationWorkerRequest` and `CalibrationWorkerEvent` discriminated unions.
- Produces: pure `createRunState(runId)` and `reduceWorkerEvent(state, event)` functions used by the browser entry and its unit tests.

- [x] **Step 1: Write failing protocol and readiness tests**

Test exact message correlation, invalid request rejection, progress monotonicity, worker cancellation, and failure serialization:

```ts
it('rejects events belonging to another run', () => {
  const state = createRunState('run-17');
  expect(() => reduceWorkerEvent(state, { type: 'ready', runId: 'run-18' })).toThrow(
    'Worker event run-18 does not belong to run-17',
  );
});
```

- [x] **Step 2: Run the browser protocol test and verify red state**

Run: `pnpm --filter @slotted/nexora-benchmark exec vitest run src/browser/entry.test.ts`

Expected: FAIL because the browser protocol is absent.

- [x] **Step 3: Implement the worker protocol and scenario entry**

The request contains scenario ID, run ID, profile ID, strategy, sample number, and explicit timeout. The worker emits progress, readiness, per-probe metrics, storage estimate, digest, completion, or a serialized failure. Reject any scenario ID other than `nexora-materialization-calibration-v1`.

Collect:

- time to operational readiness;
- time to complete readiness;
- duration of every generation/write batch;
- duration and result digest of each query probe;
- estimated IndexedDB bytes;
- maximum main-thread heartbeat gap while worker work runs;
- correctness digest and readiness transitions.

The HTML contains no product UI. It imports `entry.ts` and exposes a readiness promise so the runner never races module initialization.

Extend the package's `typecheck` script at this point:

```json
{
  "typecheck": "tsc -p tsconfig.json --noEmit --pretty false && tsc -p tsconfig.worker.json --noEmit --pretty false"
}
```

- [x] **Step 4: Run tests, typechecks, and bundle build**

Run: `pnpm --filter @slotted/nexora-benchmark exec vitest run src/browser/entry.test.ts`

Expected: PASS.

Run: `pnpm --filter @slotted/nexora-benchmark typecheck`

Expected: PASS for both Node and worker projects.

Run: `pnpm --filter @slotted/nexora-benchmark build`

Expected: PASS and a Vite bundle under `tools/nexora-benchmark/dist`.

- [x] **Step 5: Commit the browser laboratory**

```bash
git add tools/nexora-benchmark
git commit -m "feat(nexora): run calibration work off main thread"
```

### Task 5: Aggregate samples and derive a reproducible recommendation

**Files:**

- Create: `tools/nexora-benchmark/scripts/report.mjs`
- Create: `tools/nexora-benchmark/scripts/report.test.mjs`
- Create: `tools/nexora-benchmark/scripts/calibrate.mjs`

**Interfaces:**

- Consumes: browser `CalibrationRun` values.
- Produces: `aggregateRuns`, `qualifyStrategy`, `recommendMaterialization`, `deriveDurationBudget`, and `deriveBudgets` from `report.mjs`.
- Produces: CLI modes `smoke`, `record`, and `verify`.

- [x] **Step 1: Write failing aggregation and recommendation tests**

Cover median, nearest-rank p95, correctness rejection, main-thread rejection, deterministic ranking, and 25% regression headroom:

```js
test('rejects a fast strategy with a mismatched digest', () => {
  const candidate = strategyAggregate({ strategy: 'full', digestMatches: false });
  assert.deepEqual(qualifyStrategy(candidate), {
    qualified: false,
    reasons: ['correctness digest differs from the reference strategy'],
  });
});

test('rounds recorded p95 budgets to the next 10 milliseconds with 25% headroom', () => {
  assert.equal(deriveDurationBudget(81), 110);
});
```

Use this ranking priority after hard qualification: correctness, readiness truthfulness, maximum main-thread batch, query p95, operational readiness, complete readiness, persisted bytes. Encode the priority in the function rather than selecting a preferred strategy by name.

Define `strategyAggregate` as a local test fixture builder that starts from one complete, digest-matching, 10 ms aggregate and applies the supplied field overrides. Production code must not export it.

- [x] **Step 2: Run report tests and verify red state**

Run: `pnpm --filter @slotted/nexora-benchmark exec vitest run scripts/report.test.mjs`

Expected: FAIL because `report.mjs` does not exist.

- [x] **Step 3: Implement report aggregation and qualification**

Hard-reject a strategy when:

- any table count, query digest, or final correctness digest differs from the reference;
- it labels incomplete results as complete;
- a generator/write batch exceeds 50 ms on the worker or a main-thread heartbeat gap exceeds 50 ms;
- a run fails, times out, leaks a database, or leaves background work active.

For qualified strategies, calculate per-browser median and nearest-rank p95. `deriveBudgets` takes the worse p95 across recorded engines, multiplies by 1.25, and rounds duration values upward to 10 ms and byte values upward to 1 MiB. Environment metadata records OS, architecture, CPU model, logical cores, memory, Node, Playwright, browser versions, profile, seed, sample count, and git commit.

- [x] **Step 4: Implement the Playwright runner**

`calibrate.mjs` must:

1. parse and validate CLI mode, profiles, sample count, and optional browser list;
2. start one Vite server on an ephemeral localhost port;
3. launch Chromium, Firefox, and WebKit sequentially;
4. create a fresh browser context and database run ID per sample;
5. invoke only `nexora-materialization-calibration-v1` through `page.evaluate`;
6. fail immediately on page error, console error, timeout, or correctness rejection;
7. always close contexts, browsers, and Vite in `finally` blocks;
8. print a concise table and write JSON/Markdown only in `record` mode;
9. compare with checked-in budgets without rewriting files in `verify` mode;
10. run only Chromium, smoke profile, and one sample in `smoke` mode.

- [x] **Step 5: Run report tests and CLI argument tests**

Run: `pnpm --filter @slotted/nexora-benchmark exec vitest run scripts/report.test.mjs`

Expected: PASS.

Run: `pnpm --filter @slotted/nexora-benchmark typecheck`

Expected: PASS.

- [x] **Step 6: Commit measurement and reporting**

```bash
git add tools/nexora-benchmark/scripts tools/nexora-benchmark/package.json
git commit -m "feat(nexora): report scale calibration evidence"
```

### Task 6: Record browser evidence and wire the explicit calibration workflow

**Files:**

- Create: `tools/nexora-benchmark/baselines/reference.json`
- Create: `tools/nexora-benchmark/budgets/reference.json`
- Create: `tools/nexora-benchmark/reports/materialization-decision.md`
- Create: `.github/workflows/nexora-benchmark.yml`

**Interfaces:**

- Consumes: completed benchmark runner and report logic.
- Produces: recorded evidence used by the next Nexora data/persistence plan.

- [x] **Step 1: Install the three pinned Playwright engines**

Run: `pnpm --filter @slotted/nexora-benchmark exec playwright install chromium firefox webkit`

Expected: Chromium, Firefox, and WebKit for Playwright 1.63.0 install successfully.

- [x] **Step 2: Run a smoke scenario before the expensive calibration**

Run: `pnpm benchmark:nexora:smoke`

Expected: PASS for all four strategies in Chromium, with identical correctness digests and no batch or heartbeat gap above 50 ms.

- [x] **Step 3: Record canonical and Enterprise evidence**

Run: `pnpm benchmark:nexora:record`

Expected: PASS after three clean samples per strategy, profile, and engine. The command creates the three declared evidence files. The Markdown report names qualified and rejected candidates, includes rejection evidence, selects the highest-ranked qualified strategy or composition, and records exact partition/batch parameters for the next persistence plan.

- [x] **Step 4: Prove the recorded budgets are enforceable without mutation**

Run: `pnpm benchmark:nexora:verify`

Expected: PASS against `budgets/reference.json`; `git status --short` shows no benchmark output changes from verify mode.

- [x] **Step 5: Add the dedicated workflow**

Create `.github/workflows/nexora-benchmark.yml` with `workflow_dispatch` only. Reuse the repository's checkout, pnpm, and Node setup action majors. Install dependencies with `pnpm install --frozen-lockfile`, install all three Playwright engines with `--with-deps`, run `pnpm benchmark:nexora:verify`, and append `reports/materialization-decision.md` to `$GITHUB_STEP_SUMMARY`. Do not add this expensive run to the normal `pull_request` CI job.

- [x] **Step 6: Run the tool and repository verification gates**

Run: `pnpm --filter @slotted/nexora-benchmark verify`

Expected: unit tests, both TypeScript projects, and Vite build pass.

Run: `pnpm check:full`

Expected: PASS. This full gate is required because the task adds a workspace tool, root scripts, lockfile entries, and a workflow.

- [x] **Step 7: Commit the calibration evidence and workflow**

```bash
git add .github/workflows/nexora-benchmark.yml tools/nexora-benchmark/baselines tools/nexora-benchmark/budgets tools/nexora-benchmark/reports
git commit -m "docs(nexora): record materialization calibration"
```

## Execution Slices

Apply the repository's maximum-three-task slice rule:

- Slice 1: Tasks 1–3, then update `.codex/progress/current.md`.
- Slice 2: Tasks 4–6, then update `.codex/progress/current.md`.

If canonical or Enterprise calibration exceeds an execution breaker, preserve the completed smoke/canonical evidence, record the exact active browser/profile/strategy/sample, and resume with that materially different remaining run rather than restarting prior samples.
