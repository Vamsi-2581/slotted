# Checkpoint — carousel (`/component carousel` + `/reui carousel build`)

- Plano: `docs/history/designs/2026-10-01-carousel-design.md`; dossiê `2026-10-01-carousel-reui-dossier.md`; autoavaliação `2026-10-01-carousel-self-assessment.md`.
- Ramo `review/implementation-pass-1`. Outras sessões editam o tree em paralelo; os registos partilhados foram commitados só com o hunk da família (blob do HEAD com a inserção).

## Concluído

Passos 1–15. Commits `18376e06` (schema `playback`), `c99cb8b9` (contrato), `0ff5b35b` (estilos e harness), `ede0f12d` (`@slotted/core/carousel`), `3918f053` (React), `b9523076` (Angular), `94481e95` (documentos).

## Passe ReUI de movimento

Scroll numa mola criticamente amortecida (rigidez 8 / duração longa) que herda a velocidade da mão ou do movimento interrompido; soltura sem salto; flick acima de 0,25 px/ms; resistência elástica nas pontas (`--slotted-carousel-overscroll`); snap desligado no mesmo task (`data-moving`). Dossiê `2026-10-01-carousel-motion-reui-dossier.md`; traços em `scratchpad/trace-*.json`.

## Testes

Contrato 17/17; core 2078/2078; React da família 24/24; Angular da família 16/16; cenário no Chrome 7/7 nos dois bindings; `audit.mjs` limpo a 1280 e 620 nas duas páginas; `typecheck`, `test:contracts`, `test:package-layers`, `test:release`, `test:docs` verdes.

## Problemas conhecidos fora da família

`eslint .` (`message-demo.tsx`), styles (`kbd` field-surface, `cascader` marca), React (`date-picker`, `dialog`, `table`), Angular `entry-points.source` (`context-menu`).

## Próxima ação

Nenhuma da família. Os Storybooks em 6006 e 6007 precisam de reinício para ver o novo subpath de `@slotted/styles` e o entry point Angular.
