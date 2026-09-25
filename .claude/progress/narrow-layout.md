# Checkpoint — layout estreito

- Plano: `docs/history/plans/2026-09-23-narrow-layout.md`
- Design: `docs/history/designs/2026-09-23-narrow-layout-design.md`
- HEAD `e4458ca0`, ramo `review/implementation-pass-1`. Working tree com trabalho do utilizador por commitar; nada commitado por esta sessão.
- Tarefas concluídas: T1–T7, T3b (`columnOverflow: 'auto'` + layout do pop-in), alinhamento do passo `medium` de `top-navigation` a 600px.
- Estado dos testes (última corrida):
  - `lint`, `test:contracts` (1866/1866), `test:package-layers`, `test:release`, `test:docs`: passam.
  - `format:check`: falha em 9 ficheiros fora deste trabalho (date-range-picker, datetime-range-picker, field-surface.test, pagination, saved-views.styles.test, segmented-control ×2, table.styles.test, time-range-picker).
  - `typecheck`: falha só em `tmp/backup-customers-views/customers-page.ts` (cópia fora dos pacotes, 23/09 11:29).
  - Styles: 1385/1385. Demo: `demo:refresh` e `ng build` passam; `ng test` 38/40, `catalog-routes` e `crm-routes` com timeout de 5s sob carga 8 (passam isoladas, 8,4s e 9,6s).
- Problemas conhecidos:
  - `page` com `container-type` é o bloco de contenção de `position: fixed` não portalizado (fallback de fullscreen do `chart`, `progress-indicator placement="page"` dentro de uma página).
  - React com pop-in re-renderiza as linhas montadas a cada redimensionamento.
  - O harness não emula `(pointer: coarse)`; o ramo tátil de `'auto'` está coberto só por testes unitários.
  - `column-scenarios.mjs` atualizado e não executado.
  - `pnpm-lock.yaml` alterado pelo `demo:refresh` (Angular 22.1.4 → 22.1.7).
- Próxima ação: validação do utilizador.
