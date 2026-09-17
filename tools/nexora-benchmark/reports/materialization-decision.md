# Nexora materialization calibration decision

Git HEAD marker captured during recording: `866f0733d229d180a143be93c37b1f6525e85778` on linux 6.8.0-138-generic/x64, Node v24.15.0, Playwright 1.63.0; tracked benchmark source changes: yes.

## Recommendation

**on-demand** is the highest-ranked candidate under the recorded hard gates and lexicographic performance priorities. The selected locator-first composition persists deterministic locator metadata rather than eager domain rows, uses 32-record virtual batches in Chromium and Firefox, 4-record virtual batches in WebKit, and retains cooperative yields plus indexed/direct probe plans.

## Measured evidence

| Profile | Browser | Strategy | Result | Operational p95 | Complete p95 | Worker max | Main gap max | Stored bytes p95 |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| canonical | chromium | full | qualified | 219545.9 ms | 219545.9 ms | 5.4 ms | 35.3 ms | 323314102 |
| canonical | chromium | hybrid | qualified | 98443.1 ms | 355378.4 ms | 17.2 ms | 9.7 ms | 323317312 |
| canonical | chromium | on-demand | qualified | 246.1 ms | 246.1 ms | 15.0 ms | 29.7 ms | 5015 |
| canonical | chromium | partitioned | qualified | 32569.6 ms | 382930.5 ms | 22.7 ms | 15.1 ms | 323314102 |
| canonical | firefox | full | rejected | — | — | — | — | null |
| canonical | firefox | hybrid | rejected | — | — | — | — | null |
| canonical | firefox | on-demand | qualified | 145.0 ms | 145.0 ms | 27.0 ms | 24.0 ms | 5015 |
| canonical | firefox | partitioned | rejected | — | — | — | — | null |
| canonical | webkit | full | rejected | — | — | — | — | null |
| canonical | webkit | hybrid | rejected | — | — | — | — | null |
| canonical | webkit | on-demand | qualified | 83.0 ms | 83.0 ms | 12.0 ms | 36.0 ms | 5015 |
| canonical | webkit | partitioned | rejected | — | — | — | — | null |
| enterprise | chromium | full | rejected | — | — | — | — | null |
| enterprise | chromium | hybrid | rejected | — | — | — | — | null |
| enterprise | chromium | on-demand | qualified | 99.3 ms | 99.3 ms | 20.2 ms | 11.0 ms | 5028 |
| enterprise | chromium | partitioned | rejected | — | — | — | — | null |
| enterprise | firefox | full | rejected | — | — | — | — | null |
| enterprise | firefox | hybrid | rejected | — | — | — | — | null |
| enterprise | firefox | on-demand | qualified | 110.0 ms | 110.0 ms | 16.0 ms | 11.0 ms | 5028 |
| enterprise | firefox | partitioned | rejected | — | — | — | — | null |
| enterprise | webkit | full | rejected | — | — | — | — | null |
| enterprise | webkit | hybrid | rejected | — | — | — | — | null |
| enterprise | webkit | on-demand | qualified | 82.0 ms | 82.0 ms | 21.0 ms | 46.0 ms | 5028 |
| enterprise | webkit | partitioned | rejected | — | — | — | — | null |

## Rejected candidates

- **full:** one or more calibration runs failed: host-memory-ceiling (3/3 runs) — canonical-firefox-full-1 reached the host memory safety ceiling (8573964288 available bytes, 1077248 swap bytes); one or more calibration runs failed: host-memory-ceiling (3/3 runs) — canonical-webkit-full-1 reached the host memory safety ceiling (8572297216 available bytes, 167661568 swap bytes); one or more calibration runs failed: host-memory-ceiling (3/3 runs) — enterprise-chromium-full-1 reached the host memory safety ceiling (8560496640 available bytes, 81920 swap bytes); one or more calibration runs failed: host-memory-ceiling (3/3 runs) — enterprise-firefox-full-1 reached the host memory safety ceiling (8581869568 available bytes, 159653888 swap bytes); one or more calibration runs failed: host-memory-ceiling (3/3 runs) — enterprise-webkit-full-1 reached the host memory safety ceiling (8325525504 available bytes, 167866368 swap bytes)
- **hybrid:** one or more calibration runs failed: calibration-timeout (3/3 runs) — page.evaluate: Calibration canonical-firefox-hybrid-1 timed out; one or more calibration runs failed: host-memory-ceiling (3/3 runs) — canonical-webkit-hybrid-1 reached the host memory safety ceiling (8582676480 available bytes, 167821312 swap bytes); one or more calibration runs failed: host-memory-ceiling (3/3 runs) — enterprise-chromium-hybrid-1 reached the host memory safety ceiling (8546426880 available bytes, 978944 swap bytes); one or more calibration runs failed: calibration-timeout (3/3 runs) — page.evaluate: Calibration enterprise-firefox-hybrid-1 timed out; one or more calibration runs failed: host-memory-ceiling (3/3 runs) — enterprise-webkit-hybrid-1 reached the host memory safety ceiling (8579702784 available bytes, 167882752 swap bytes)
- **partitioned:** one or more calibration runs failed: calibration-timeout (3/3 runs) — page.evaluate: Calibration canonical-firefox-partitioned-1 timed out; one or more calibration runs failed: host-memory-ceiling (3/3 runs) — canonical-webkit-partitioned-1 reached the host memory safety ceiling (8581844992 available bytes, 167784448 swap bytes); one or more calibration runs failed: host-memory-ceiling (2/3 runs) — enterprise-chromium-partitioned-1 reached the host memory safety ceiling (8343138304 available bytes, 200704 swap bytes); indexeddb-quota-exceeded (1/3 runs) — page.evaluate: AbortError: QuotaExceededError ; one or more calibration runs failed: calibration-timeout (3/3 runs) — page.evaluate: Calibration enterprise-firefox-partitioned-1 timed out; one or more calibration runs failed: host-memory-ceiling (3/3 runs) — enterprise-webkit-partitioned-1 reached the host memory safety ceiling (8584892416 available bytes, 167874560 swap bytes)

## Evidence provenance

- Selected-strategy samples: 18; each executes the locator-first composition described above.
- Non-selected candidate samples retained: 54; failed trials remain explicit failures rather than imputed measurements.
- The Git marker identifies the HEAD observed by the runner. The checked-in implementation and evidence changeset is the reproducible source of truth when tracked benchmark source changes are reported above.

## Reproducibility

- Seed: `nexora-calibration-v1`
- Samples per browser/strategy/profile: 3
- CPU: Intel(R) Xeon(R) CPU E5-2683 v4 @ 2.10GHz; 4 logical cores
- Memory: 33655816192 bytes
- Browser versions: chromium 153.0.8010.12, firefox 155.0, webkit 26.6
