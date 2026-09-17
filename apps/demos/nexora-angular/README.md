# Nexora Operations

Reference application for the Slotted UI library, written as a consumer of the
published packages. Domain and scope: `docs/nexora-op-demo-domain.md` at the
repository root.

## Installation contract

This app is one workspace package of the product monorepo at `apps/demos/nexora`
(`pnpm-workspace.yaml` there marks the root). Every `@slotted/*` dependency is a tarball from `../../../.registry`,
written by `pnpm pack:beta` at the repository root. Nothing links to
`packages/`.

```sh
# at the repository root
pnpm pack:beta

# here
cd ../.. && pnpm install
pnpm start
```

`pnpm start:fresh` runs the three steps in sequence. It rebuilds every package
(about one minute) before serving, so it is the command after a library change
and `pnpm start` is the command otherwise.

What a consumer installs, and why:

| Package                              | Role                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `@slotted/angular`                   | components, one secondary entry point per family; CSS inlined per component |
| `@slotted/core`                      | peer dependency of `@slotted/angular`, installed explicitly                 |
| `@slotted/theme-default`             | token values per theme, scheme and density; the only stylesheet imported    |
| `@fontsource-variable/geist`         | the sans face the theme names; the theme ships no font                      |
| `@fontsource-variable/geist-mono`    | the mono face                                                               |
| `@ng-icons/core`, `@ng-icons/lucide` | the glyphs; the library ships no icon catalogue                             |

Where each part of the contract is written:

- `src/styles.css` — `@layer slotted, app;` before any import; the theme
  stylesheet; the brand as accent tokens retuned per scheme inside `@layer app`.
- `src/index.html` — `data-slotted-theme`, `data-slotted-scheme` and
  `data-slotted-density` on `html`. Without `data-slotted-theme` no token is
  defined and nothing paints. The scheme is only ever an attribute: the theme
  reads no `prefers-color-scheme`.
- `src/app/app.config.ts` — one `provide*Defaults` per family that speaks, with
  English messages.

## Moving to a newer beta

1. At the repository root: `pnpm release:beta`.
2. Here: replace the version in the three `file:` specifiers in `package.json`,
   then `pnpm install`.
3. Build. What broke is an API change the library has to answer for — in the
   changelog, in a migration note, or by reverting it.
