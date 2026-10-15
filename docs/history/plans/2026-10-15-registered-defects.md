# Defeitos registados — triagem e plano

Fontes: as secções de pendências de `.claude/progress/*.md` e as linhas `open` de
`demos/nexora/angular/LIBRARY-FEEDBACK.md` e `apps/docs/LIBRARY-FEEDBACK.md`, lidas em
2026-10-15 depois da integração em `main` (`8e5a3c27`). Uma fatia fecha até três itens, cada
defeito com o teste que o reproduz antes da correção.

## Já corrigidos no código, ainda `open` num ledger

| Ledger                    | Família             | Evidência                                                                                |
| ------------------------- | ------------------- | ---------------------------------------------------------------------------------------- |
| `apps/docs` 23            | notification-center | `notification-center-defaults.tsx`; o português só aparece com o catálogo `pt-BR`.        |
| `apps/docs` 42            | field-group         | `SlFieldGroup` desenha descrição e erro só sob `@if`.                                     |
| `apps/docs` 45            | field-group         | `FieldGroupContent` escreve `data-part="content"` (`field-group-parts.tsx:78`).           |
| `apps/docs` 78            | inline              | `[attr.align]: null` no host (`packages/angular/inline/src/inline.ts:45`).                |
| `apps/docs` 129           | table / checkbox    | `TableSelect` e `TableSelectAll` nomeiam por `VisuallyHidden`.                            |
| `apps/docs` 131           | dialog              | "closes on the platform way back" passa na suíte completa dos dois bindings.             |
| `apps/docs` 148           | tooltip (Angular)   | `tooltip-parts.ts:215` injeta `SLOTTED_PORTAL_CONTAINER`.                                 |
| `apps/docs` 149           | popover             | `PopoverClose` e `slPopoverClose` cedem o nome ao texto visível.                          |

## Defeitos confirmados

1. data-grid (Angular): o `<input type="checkbox">` de cada célula de seleção fica na ordem de
   Tab; o grid deixa de ter uma paragem. React escreve `tabIndex={current ? 0 : -1}` no
   checkbox. `SlCheckbox` não tem `tabIndex`.
2. event-calendar: sem entrada `now`; o hoje vem do relógio e nenhuma página datada o fixa
   (`apps/docs` 18).

## Por verificar (defeito provável)

3. combobox: `scrollIntoView` em `scrollToKey` e `revealOption` (`apps/docs` 65).
4. calendar (React): `focusedDate` controlado, ArrowRight a partir de 30 de setembro
   (`apps/docs` 97).
5. date-picker (React): `reset()` nativo do formulário ignorado (`apps/docs` 85).
6. Alvos de toque: `filter-bar` `remove` e `more` a 24px; `stat-card` `action` a 21px;
   `page-header` `back` a 24px (`demos/nexora` 67, 130).
7. table: identificador partido a meio sob `layout="fixed"` num telemóvel (`demos/nexora` 73).
8. side-navigation: hover quase invisível sobre o fundo de `inset`.
9. number-field: marca `scrub` de mais de um carácter em rtl.

## Decisões do utilizador (não são correções)

- drawer: `aria-labelledby` no markup de servidor em `mode="inline"`; scrim de um drawer não
  modal (`apps/docs` 139, 140).
- multi-select: o nome do grid leva o rótulo e a contagem (`apps/docs` 107).
- dialog (Angular): foco ao fechar duas camadas empilhadas juntas (`apps/docs` 130).
- menu: tipagem de `render` do trigger contra `ButtonProps.children` (`apps/docs` 13).
- tabs e data-grid num telemóvel: rótulos curtos e controlos do cabeçalho filtrado
  (`demos/nexora` 68, 72).

## Resultado (2026-10-15)

| Item | Estado |
| ---- | ------ |
| 1 data-grid (Angular) tabindex | corrigido, `6e2d3b08` |
| 2 event-calendar `now` | corrigido, `98bfd5a9` |
| 3 combobox `scrollIntoView` e `[hidden]` | corrigido, `c7f5b79f`; `revealWithin` em `@slotted/core/collection` |
| 4 calendar (React) `focusedDate` | já corrigido e testado |
| 5 date-picker (React) `reset()` | já corrigido e testado |
| 6 alvos de toque | `stat-card` corrigido, `9faca9dc`; `filter-bar` e `page-header` já corrigidos |
| 7 table, identificador partido | defeito da demo: `text="nowrap"`, `9936ba65` |
| 8 side-navigation sobre `inset` | corrigido no `app-shell`, `e4162557` |
| 9 number-field `scrub` em rtl | corrigido, `8c20f397` |
| menu, tipagem de `render` | corrigido, `eb7712ad` |
| dialog (Angular), camadas empilhadas | já corrigido e testado |
| drawer inline, nome | corrigido, `cb9d5b0f`; contrato `wiring.aria-labelledby` |
| drawer não modal, scrim | decidido pelo contrato (`anatomy.backdrop`, `scrimFrom`) |
| multi-select, nome do grid | corrigido, `6dc1b417` |

## Abertos, que não são defeitos

- tabs num telemóvel: a faixa rola com um chevron, a resposta da família; rótulos curtos são
  conteúdo do consumidor (`demos/nexora` 72).
- data-grid num ponteiro grosso: dois controlos visíveis no cabeçalho filtrado estreitam o nome
  (`demos/nexora` 68); pede uma decisão de desenho.
- data-grid na página de referência (`apps/docs` 14): documentação, pausada pelo utilizador.
