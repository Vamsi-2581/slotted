# Checkpoint — fila das entradas (1/4 concluída)

- Ramo `review/implementation-pass-1`. `text-field` entregue: `b7d84ef6` (glifo `caps-lock`), `5b914ec5` (família), `5ecee204` (página Angular).
- Documentos: `docs/history/designs/2026-09-30-text-field-{rebuild-design,reui-dossier,self-assessment}.md`.
- `audit.mjs` sem achados nas duas páginas a 1280 e 620 px. Storybook Angular reiniciado nesta sessão (tarefa em segundo plano).

## Problemas conhecidos, de outras sessões

- `pnpm typecheck` e `ng test`: `requiredMark` em `field.spec.ts`, `field-group.spec.ts`, `field.test.tsx`, `field-group.test.tsx`.
- `prettier --check`: `filter-bar.spec.ts`, `filter-bar.ts`, `menu.css`.
- `field-surface.test.mjs`: `kbd` (commit `2e39b9d4`).
- Specs Angular de `text-field` não correram depois das histórias por causa do primeiro item.

## Próxima ação

`/component textarea` + `prompt-composer` (fila, item 2): ler `specs/components/textarea/contract.json` e `docs/process/build-order.md` › `prompt-composer`, depois o inventário (faixas `block-start`/`block-end` do ReUI `c-input-group-17..19, 26, 33, 34`).
