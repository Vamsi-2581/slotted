# Plano — gestão de colunas e de vistas do `data-grid`

Design: `docs/history/designs/2026-09-23-column-management-design.md`.

| Fatia | Tarefa | Caminhos | Verificação |
| ----- | ------ | -------- | ----------- |
| 1 | T1 `core/grid`: `description`, `priority`, `columnsHiddenBySpace`, `columnStateChanges`, `GridView.density` versionado, `saved-views.ts` | `packages/core/src/grid/` | `npx vitest run packages/core/src/grid` |
| 1 | T2 registos das famílias novas | `packages/react/{package.json,src/index.ts,vite.config.ts}`, `packages/styles/package.json` | `pnpm --filter @slotted/core typecheck` |
| 2 | T3 extensões do `data-grid` (§5) nos dois bindings, estilos, contrato, páginas | `packages/*/data-grid`, `packages/styles/src/data-grid`, `specs/components/data-grid` | specs da família, `node --test specs/components/data-grid` |
| 2 | T4 família `column-manager` (§3) | `packages/*/column-manager`, `packages/styles/src/column-manager`, `specs/components/column-manager` | idem |
| 2 | T5 família `saved-views` (§4) | `packages/*/saved-views`, `packages/styles/src/saved-views`, `specs/components/saved-views` | idem |
| 3 | T6 `pnpm demo:refresh`; demo Nexora (§6); `LIBRARY-FEEDBACK.md` | `demos/nexora/angular` | `pnpm test`, `pnpm build:demo` |
| 4 | T7 `pnpm check:affected`; cenários CDP; capturas 1280/390 claro e escuro | `demos/nexora/angular/tools/` | saída dos comandos |
| 4 | T8 revisão independente do diff; correções; `build-order.md` | — | revisão do diff corrigido |

T3, T4 e T5 correm em paralelo: caminhos disjuntos, e os registos partilhados são
escritos em T2.
