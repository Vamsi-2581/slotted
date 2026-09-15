const MIB = 1024 * 1024;
const PROBES = [
  'orders-page',
  'customer-360',
  'inventory-ledger',
  'finance-summary',
  'historical-point-lookup',
];

function sorted(values) {
  if (values.length === 0) throw new RangeError('At least one sample is required');
  return [...values].sort((left, right) => left - right);
}

export function median(values) {
  const ordered = sorted(values);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0 ? (ordered[middle - 1] + ordered[middle]) / 2 : ordered[middle];
}

export function nearestRankP95(values) {
  const ordered = sorted(values);
  return ordered[Math.max(0, Math.ceil(ordered.length * 0.95) - 1)];
}

function distribution(values) {
  return { median: median(values), p95: nearestRankP95(values) };
}

function readinessIsTruthful(run) {
  const rank = { empty: 0, operational: 1, complete: 2, failed: 3 };
  const monotonic = run.readiness.every(
    (item, index) => index === 0 || rank[item.state] >= rank[run.readiness[index - 1].state],
  );
  const operational = run.readiness.find((item) => item.state === 'operational');
  const complete = run.readiness.find((item) => item.state === 'complete');
  return Boolean(
    monotonic &&
    operational &&
    complete &&
    operational.atMs <= complete.atMs &&
    run.metrics.probes.every((probe) => probe.result.completeness === 'complete'),
  );
}

function groupRuns(runs) {
  const groups = new Map();
  for (const run of runs) {
    const key = `${run.profile}\u0000${run.browser}\u0000${run.strategy}`;
    const group = groups.get(key) ?? [];
    group.push(run);
    groups.set(key, group);
  }
  return groups;
}

function referenceFor(runs, profile, browser) {
  return (
    runs.find(
      (run) => run.profile === profile && run.browser === browser && run.strategy === 'full',
    ) ?? runs.find((run) => run.profile === profile && run.browser === browser)
  );
}

export function aggregateRuns(runs) {
  if (runs.length === 0) return [];
  const aggregates = [];
  for (const group of groupRuns(runs).values()) {
    const first = group[0];
    const reference = referenceFor(runs, first.profile, first.browser);
    if (!reference) throw new Error(`Missing reference for ${first.profile}/${first.browser}`);
    const referenceProbes = new Map(
      reference.metrics.probes.map((probe) => [probe.probe, probe.result.digest]),
    );
    aggregates.push({
      profile: first.profile,
      browser: first.browser,
      strategy: first.strategy,
      samples: group.length,
      digestMatches: group.every((run) => run.digest === reference.digest),
      queryDigestsMatch: group.every((run) =>
        run.metrics.probes.every(
          (probe) => referenceProbes.get(probe.probe) === probe.result.digest,
        ),
      ),
      readinessTruthful: group.every(readinessIsTruthful),
      failedRuns: group.filter((run) => run.failed).length,
      leakedDatabases: group.filter((run) => run.leakedDatabase).length,
      backgroundActive: group.filter((run) => run.backgroundActive).length,
      operationalReadyMs: distribution(group.map((run) => run.metrics.operationalReadyMs)),
      completeReadyMs: distribution(group.map((run) => run.metrics.completeReadyMs)),
      maxWorkerBatchMs: Math.max(...group.map((run) => run.metrics.maxWorkerBatchMs)),
      maxMainThreadGapMs: Math.max(...group.map((run) => run.metrics.maxMainThreadGapMs)),
      storageBytes: distribution(group.map((run) => run.metrics.storageBytes)),
      probeP95Ms: Object.fromEntries(
        PROBES.map((probe) => [
          probe,
          nearestRankP95(
            group.map(
              (run) => run.metrics.probes.find((metric) => metric.probe === probe).durationMs,
            ),
          ),
        ]),
      ),
    });
  }
  return aggregates.sort(
    (left, right) =>
      left.profile.localeCompare(right.profile) ||
      left.browser.localeCompare(right.browser) ||
      left.strategy.localeCompare(right.strategy),
  );
}

export function qualifyStrategy(aggregate) {
  const reasons = [];
  if (!aggregate.digestMatches) {
    reasons.push('correctness digest differs from the reference strategy');
  }
  if (!aggregate.queryDigestsMatch) {
    reasons.push('one or more query digests differ from the reference strategy');
  }
  if (!aggregate.readinessTruthful) {
    reasons.push('readiness or query completeness is not truthful');
  }
  if (aggregate.maxWorkerBatchMs > 50) reasons.push('worker batch exceeded 50ms');
  if (aggregate.maxMainThreadGapMs > 50) {
    reasons.push('main-thread heartbeat gap exceeded 50ms');
  }
  if (aggregate.failedRuns > 0) reasons.push('one or more calibration runs failed');
  if (aggregate.leakedDatabases > 0) reasons.push('one or more calibration databases leaked');
  if (aggregate.backgroundActive > 0) reasons.push('background work remained active');
  return { qualified: reasons.length === 0, reasons };
}

function strategySummaries(aggregates) {
  const byStrategy = new Map();
  for (const aggregate of aggregates) {
    const items = byStrategy.get(aggregate.strategy) ?? [];
    items.push(aggregate);
    byStrategy.set(aggregate.strategy, items);
  }
  return [...byStrategy].map(([strategy, items]) => {
    const qualifications = items.map(qualifyStrategy);
    return {
      strategy,
      items,
      qualified: qualifications.every((result) => result.qualified),
      reasons: [...new Set(qualifications.flatMap((result) => result.reasons))],
      blockingMs: Math.max(
        ...items.flatMap((item) => [item.maxWorkerBatchMs, item.maxMainThreadGapMs]),
      ),
      queryP95Ms: Math.max(...items.flatMap((item) => Object.values(item.probeP95Ms))),
      operationalReadyMs: Math.max(...items.map((item) => item.operationalReadyMs.p95)),
      completeReadyMs: Math.max(...items.map((item) => item.completeReadyMs.p95)),
      storageBytes: Math.max(...items.map((item) => item.storageBytes.p95)),
    };
  });
}

export function recommendMaterialization(aggregates) {
  const summaries = strategySummaries(aggregates);
  const qualified = summaries
    .filter((item) => item.qualified)
    .sort(
      (left, right) =>
        left.blockingMs - right.blockingMs ||
        left.queryP95Ms - right.queryP95Ms ||
        left.operationalReadyMs - right.operationalReadyMs ||
        left.completeReadyMs - right.completeReadyMs ||
        left.storageBytes - right.storageBytes ||
        left.strategy.localeCompare(right.strategy),
    );
  return {
    strategy: qualified[0]?.strategy ?? null,
    qualified: qualified.map((item) => item.strategy),
    rejected: summaries
      .filter((item) => !item.qualified)
      .map((item) => ({ strategy: item.strategy, reasons: item.reasons }))
      .sort((left, right) => left.strategy.localeCompare(right.strategy)),
  };
}

export function deriveDurationBudget(p95) {
  return Math.ceil((p95 * 1.25) / 10) * 10;
}

function deriveByteBudget(p95) {
  return Math.ceil((p95 * 1.25) / MIB) * MIB;
}

export function deriveBudgets(aggregates) {
  const groups = new Map();
  for (const aggregate of aggregates) {
    if (!qualifyStrategy(aggregate).qualified) continue;
    const key = `${aggregate.profile}\u0000${aggregate.strategy}`;
    const group = groups.get(key) ?? [];
    group.push(aggregate);
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((items) => ({
      profile: items[0].profile,
      strategy: items[0].strategy,
      operationalReadyMs: deriveDurationBudget(
        Math.max(...items.map((item) => item.operationalReadyMs.p95)),
      ),
      completeReadyMs: deriveDurationBudget(
        Math.max(...items.map((item) => item.completeReadyMs.p95)),
      ),
      maxWorkerBatchMs: deriveDurationBudget(
        Math.max(...items.map((item) => item.maxWorkerBatchMs)),
      ),
      maxMainThreadGapMs: deriveDurationBudget(
        Math.max(...items.map((item) => item.maxMainThreadGapMs)),
      ),
      storageBytes: deriveByteBudget(Math.max(...items.map((item) => item.storageBytes.p95))),
      probeP95Ms: Object.fromEntries(
        PROBES.map((probe) => [
          probe,
          deriveDurationBudget(Math.max(...items.map((item) => item.probeP95Ms[probe]))),
        ]),
      ),
    }))
    .sort(
      (left, right) =>
        left.profile.localeCompare(right.profile) || left.strategy.localeCompare(right.strategy),
    );
}

function milliseconds(value) {
  return `${value.toFixed(1)} ms`;
}

export function renderDecisionReport({ environment, aggregates, recommendation }) {
  const rows = aggregates
    .map((item) => {
      const qualification = qualifyStrategy(item);
      return `| ${item.profile} | ${item.browser} | ${item.strategy} | ${qualification.qualified ? 'qualified' : 'rejected'} | ${milliseconds(item.operationalReadyMs.p95)} | ${milliseconds(item.completeReadyMs.p95)} | ${milliseconds(item.maxWorkerBatchMs)} | ${milliseconds(item.maxMainThreadGapMs)} | ${item.storageBytes.p95} |`;
    })
    .join('\n');
  const rejected = recommendation.rejected.length
    ? recommendation.rejected
        .map((item) => `- **${item.strategy}:** ${item.reasons.join('; ')}`)
        .join('\n')
    : '- None.';
  return `# Nexora materialization calibration decision

Recorded from commit \`${environment.gitCommit}\` on ${environment.os}/${environment.arch}, Node ${environment.node}, Playwright ${environment.playwright}.

## Recommendation

**${recommendation.strategy ?? 'No strategy qualified'}** is the highest-ranked candidate under the recorded hard gates and lexicographic performance priorities. The next persistence plan must retain the recorded 512-record worker batch and 12-month hybrid operational window when hybrid is selected.

## Measured evidence

| Profile | Browser | Strategy | Result | Operational p95 | Complete p95 | Worker max | Main gap max | Stored bytes p95 |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
${rows}

## Rejected candidates

${rejected}

## Reproducibility

- Seed: \`${environment.seed}\`
- Samples per browser/strategy/profile: ${environment.samples}
- CPU: ${environment.cpu}; ${environment.logicalCores} logical cores
- Memory: ${environment.memoryBytes} bytes
- Browser versions: ${Object.entries(environment.browserVersions)
    .map(([name, version]) => `${name} ${version}`)
    .join(', ')}
`;
}

export function verifyAgainstBudgets(aggregates, budgets) {
  const failures = [];
  for (const budget of budgets) {
    const matches = aggregates.filter(
      (item) => item.profile === budget.profile && item.strategy === budget.strategy,
    );
    if (matches.length === 0) {
      failures.push(`missing ${budget.profile}/${budget.strategy} aggregate`);
      continue;
    }
    for (const aggregate of matches) {
      const prefix = `${aggregate.profile}/${aggregate.browser}/${aggregate.strategy}`;
      const checks = [
        ['operationalReadyMs', aggregate.operationalReadyMs.p95, budget.operationalReadyMs],
        ['completeReadyMs', aggregate.completeReadyMs.p95, budget.completeReadyMs],
        ['maxWorkerBatchMs', aggregate.maxWorkerBatchMs, budget.maxWorkerBatchMs],
        ['maxMainThreadGapMs', aggregate.maxMainThreadGapMs, budget.maxMainThreadGapMs],
        ['storageBytes', aggregate.storageBytes.p95, budget.storageBytes],
      ];
      for (const [metric, actual, limit] of checks) {
        if (actual > limit) failures.push(`${prefix} ${metric} ${actual} > ${limit}`);
      }
      for (const probe of PROBES) {
        if (aggregate.probeP95Ms[probe] > budget.probeP95Ms[probe]) {
          failures.push(
            `${prefix} ${probe} p95 ${aggregate.probeP95Ms[probe]} > ${budget.probeP95Ms[probe]}`,
          );
        }
      }
    }
  }
  return failures;
}
