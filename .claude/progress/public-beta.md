# Checkpoint — preparação da beta pública

- Plano: caminho mínimo da conversa de 2026-10-14 (sem arquivo de plano). Passos: 1 integrar e CI verde; 2 manifests e READMEs; 3 publicar com tag `beta`; 4 docs das famílias usadas pela Nexora.
- Ramo `review/implementation-pass-1`, HEAD `4aab16a8`, enviado a `origin`. PR #1: https://github.com/andrelopes-code/slotted/pull/1.
- Árvore: 898 entradas não commitadas, todas de outras sessões. O `git reset --mixed` para `4aab16a8` moveu só o ramo e o índice.

## Concluído

- Fatia 1 (`12ca0aff`): checks, manifests sem `private`, READMEs, `.d.ts` de `@slotted/react` sem `@slotted/styles`.
- Fatia 2: token npm (`dreco - owner` em `slotted`); PR #1.
- Fatia 3 (`4aab16a8`), construída num clone limpo de HEAD (scratchpad `ci/`):
  - `demos/nexora` com `pnpm-workspace.yaml` e `pnpm-lock.yaml` próprios; `demos/*/*` fora do workspace da raiz; `demo:refresh` e `demo:nexora` por `--dir`.
  - `.github/workflows/ci.yml`: `pnpm build` antes de `pnpm check:full`.
  - `.prettierignore`: `packages/theme/src/generated` (o `prettier --write` da fatia 1 tinha deixado os gerados stale; regenerados na árvore principal).
  - `@slotted/react` exports: 7 mortos removidos, 20 famílias acrescentadas, entradas do vite derivadas (trabalho de outra sessão, com `entry-points.test.ts`).
  - cascader desenha o match com `highlight` (React e Angular); `kbd` em `NOT_FIELDS`.
  - agent-docs: `ngc` da raiz; erro de spawn nomeado; teste do subcaminho não exportado autossuficiente.
  - snippet `text-field-angular-password` na forma do Prettier.

## Verificação

- Clone limpo em `4aab16a8`: `pnpm install --frozen-lockfile` exit 0; `pnpm build` exit 0; `pnpm check` exit 0 (contracts 2178/2178). `turbo run verify --continue` antes das duas últimas correções: falhas listadas abaixo.
- Árvore principal: styles 1668/1668; React cascader 28/28; Angular cascader 13/13; agent-docs 31/31; theme `generate --check` exit 0; demo `ng build` exit 0; backend do demo 81/81.

## Problemas conhecidos

- Falhas em HEAD que passam só com trabalho não commitado de outras sessões (os mesmos ficheiros estão `M` na árvore principal):
  - React: `dialog.test.tsx` ("closes on the platform way back"), `date-picker.test.tsx` ("writes the date into the field and closes"), `table.test.tsx` ("draws one range picker for a time between"), `table.stories.test.ts` (snippets formatados). Árvore principal: 135/135.
  - Angular: `dialog.spec.ts`, `date-range-picker.spec.ts`, `table.spec.ts`, `column-manager.spec.ts`. Árvore principal: 181/182 antes do snippet do text-field, 4/4 depois.
- O demo agora tem `node_modules` próprio; um dev server do demo aberto antes de 2026-10-15 precisa de reinício. O lockfile do demo resolveu `@angular/core` 22.1.8 e `@angular/build` 22.2.2 dentro das faixas do seu `package.json`.
- Runner `ubuntu-latest` migra para Ubuntu 26 a partir de 2026-10-19.

- CI do PR em `4aab16a8` (run 38731052034, 9m34s): install, `pnpm build` e `pnpm check` passam; `turbo run verify` falha só em `@slotted/angular#verify`, 22/3048 em 8 ficheiros: event-calendar 14 (`[role='grid']` ausente em `event-calendar.spec.ts:160`), breadcrumb 2 (colapso com 0 itens escondidos em `breadcrumb.spec.ts:114`), table, menu, entity-picker, dialog, date-range-picker, action-bar 1 cada. No clone local o mesmo HEAD falha só em dialog, date-range-picker, table, column-manager e text-field (corrigido); event-calendar, breadcrumb, menu, entity-picker e action-bar falham só no runner. Log: scratchpad `ci-run.log`.

## Próxima ação

Integrar o trabalho das outras sessões: com as sessões paradas, `pnpm build && pnpm check:full` na árvore principal; se exit 0, `git add -A && git commit` e `git push origin review/implementation-pass-1`; depois `gh run watch` no PR #1.
