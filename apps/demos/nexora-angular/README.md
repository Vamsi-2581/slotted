# Nexora Operations — Angular client

The reference application's Angular client (`@slotted/demo-nexora-angular`), written as a
consumer of the published packages. Domain and scope: `docs/nexora-op-demo-domain.md` at the
repository root; the Shell's design: `docs/superpowers/specs/2026-09-17-nexora-shell-design.md`.

## Installation contract

Every `@slotted/*` dependency is a tarball from `../.registry`, written by `pnpm pack:beta` at
the repository root. The simulated backend, `@slotted/demo-nexora-operations`
(`../nexora-operations`), links by workspace and runs in-process in the browser.

```sh
# at the repository root
pnpm pack:beta        # once, and after every library change worth consuming
pnpm install

# here
pnpm start            # http://localhost:4250, also on 0.0.0.0 and devserver.local
pnpm test
pnpm build:demo
```

| Package                              | Role                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `@slotted/angular`                   | components, one secondary entry point per family; CSS inlined per component                 |
| `@slotted/core`                      | peer dependency of `@slotted/angular`, installed explicitly                                 |
| `@slotted/theme-default`             | token values per theme, scheme and density; the only stylesheet imported                    |
| `@slotted/demo-nexora-operations`    | the simulated backend, by workspace link; `scale: 'light'` by default, `?scale=demo` in the URL |
| `@fontsource-variable/geist`, `-mono`| the faces the theme names; the theme ships no font                                          |
| `@ng-icons/core`, `@ng-icons/lucide` | the glyphs; the library ships no icon catalogue                                             |

Where each part of the contract is written:

- `src/styles.css` — `@layer slotted, app;` before any import; the theme stylesheet; the brand
  as accent tokens retuned per scheme inside `@layer app`.
- `src/index.html` — `data-slotted-theme`, `data-slotted-scheme` and `data-slotted-density` on
  `html`. Without `data-slotted-theme` no token is defined and nothing paints. The scheme is only
  ever an attribute: the theme reads no `prefers-color-scheme`.
- `src/app/app.config.ts` — `provideNexoraBackend()`, and one `provide*Defaults` per family that
  speaks, with English messages.
- `angular.json` › `serve.options.prebundle.exclude` — the backend is TypeScript source; Vite's
  optimizer cannot resolve its extensionless imports.

## What the Shell keeps in the browser

The backend is memory only: a reload re-seeds. The client keeps, in `localStorage`, the active
persona and scenario (`nexora:demo`), preferences per user (`nexora:preferences:<userId>`),
recent search hits and the navigation state. `?scale=light|demo` on the URL picks the seed size.

## Moving to a newer beta

1. At the repository root: `pnpm release:beta`.
2. Here: replace the version in the three `file:` specifiers in `package.json`, then
   `pnpm install` at the root.
3. Build. What broke is an API change the library has to answer for — in
   `LIBRARY-FEEDBACK.md`, in a migration note, or by reverting it.

## Screenshots

With `pnpm start` running, `node tools/shoot.mjs <url> <out.png> [dark]` captures a page through
headless Chrome; `screenshots/` is git-ignored.
