# Checkpoint — defeitos registados

- Plano: `docs/history/plans/2026-10-15-registered-defects.md`.
- Ramo `main`. Fatia 1 concluída e commitada (ver `git log --oneline -3`).

## Concluído

- Item 1: `SlCheckbox.tabIndex`; `data-grid` Angular com uma paragem de Tab (teste nos dois bindings).
- Item 2: `now` em `EventCalendar` e `slEventCalendar` (teste nos dois bindings).
- `apps/docs/LIBRARY-FEEDBACK.md`: nove linhas `open` passam a `fixed` com evidência; linha nova do item 1.

## Verificação

- `pnpm check` exit 0; `ng test slotted-angular` 3181/3181; React `event-calendar`, `data-grid`, `checkbox` 184/184.

## Próxima ação

Fatia 2 do plano: verificar e corrigir os itens 3 (combobox `scrollIntoView`), 4 (calendar React `focusedDate`) e 5 (date-picker React `reset()`), cada um com o teste que o reproduz.
