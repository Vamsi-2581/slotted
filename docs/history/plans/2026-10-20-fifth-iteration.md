# Quinta iteração — tipo do valor do stat-card e foco por ponteiro em regiões focáveis

Fonte: três pedidos recebidos em 2026-10-20 sobre `main` (`af73b553`, `v0.1.0-beta.4`). Uma fatia
fecha as três tarefas. Cada defeito e melhoria leva o teste que falha antes da mudança. React e
Angular recebem a mesma mudança de contrato quando a família existe nos dois.

## Triagem

| #   | Família / material                         | Tipo     | Estado na triagem                                                                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | stat-card                                  | melhoria | Confirmado (React): `StatCardValueProps.value?: number \| string` e `StatCardDeltaProps.value?: number`; `tsconfig.base.json` liga `exactOptionalPropertyTypes`. Angular já declara `input<number \| string \| undefined>` e `input<number \| undefined, unknown>`.                                                                                                  |
| 2   | app-shell                                  | defeito  | Confirmado: `AppShellMain` (React, `tabIndex ?? -1`) e `slAppShellMain` (Angular, host `tabindex: '-1'`) escrevem o atributo sempre; `[data-part='main']:focus-visible` desenha o anel. `focusMain()` existe nos dois bindings e chama `main.focus()`.                                                                                                             |
| 3   | table, scroll-area, chart; `@slotted/core` | melhoria | Confirmado: `scroll` (table, `tabindex="0"` quando transborda), `viewport` (scroll-area, quando ligado) e `table-region` (chart, sempre) usam `:focus-visible` simples em `table.css`, `scroll-area.css` (`:has(> viewport:focus-visible)`) e `chart.css`. O utilitário vai para `@slotted/core/focus` como `createFocusOrigin`, no padrão `create*` dos outros módulos de core. |

## Fatias

1. As três tarefas: 1, 2, 3.

## Resultado

| #   | Estado |
| --- | ------ |
| 1   |        |
| 2   |        |
| 3   |        |

## Problemas conhecidos
