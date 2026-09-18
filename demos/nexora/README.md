# Nexora

Reference application for the library: an operations product built only from
the published `@slotted/*` packages, used to calibrate the kit against a real
screen and to demonstrate it.

| Directory   | Package                        | Role                                                                 |
| ----------- | ------------------------------ | -------------------------------------------------------------------- |
| `angular/`  | `@slotted/demo-nexora-angular` | The Angular application. Installs the library from `../../.registry` |
| `backend/`  | `@slotted/demo-nexora-backend` | In-process simulated API and deterministic seed. Workspace package.  |
| `domain.md` | —                              | Domain and product specification. Part II is normative for `backend` |

`angular/LIBRARY-FEEDBACK.md` is the ledger of package defects and gaps seen
from this application; `AGENTS.md` › "Demo Feedback Loop" says how an entry is
triaged. `CONTRIBUTING.md` › "The beta channel" says how the tarballs are
written.
