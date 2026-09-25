# Correções da revisão de telas da Nexora (itens 1–16)

Origem: revisão de telas de 2026-09-24. A triagem segue o skill `demo-triage`; os estados de espera seguem o skill `loading-states`.

## Decisões do utilizador

- 5: abaixo de 600 px, o page-header não é sticky e `slPage fill` passa a scroll de página. A LP-07 ganha a exceção compacta.
- 12: mantém-se o recolhimento do header pelo scroll contido do corpo `fill`. Textarea e scrollers pequenos deixam de o acionar.
- 14: um splitter entre fila e depósito a partir de 600 px, com `min="17rem"`, `max="32rem"` e padrão de 24rem, gravado em `resizeEnd`.
- 16: com `pointer: coarse`, o alvo do controlo interno tem 44×44 px e é invisível. Fundo e anel de foco ficam quadrados.

## Tarefas

| Bloco | Tarefa | Lado | Superfície |
|---|---|---|---|
| 1 | 11 tags dentro de list-item | pacote | `packages/styles/src/list-item` |
| 1 | 10 grelha atrás do erro/vazio do chart | pacote | `packages/styles/src/chart` |
| 1 | 2 ações do page-header não voltam ao alargar | pacote | `page-header.css`, contrato de toolbar |
| 1 | 1 filter-bar quebrada ao lado de `end` | pacote | filter-bar: CSS e as duas bindings |
| 2 | 16 alvo de toque dos controlos internos | pacote | stylesheets com controlos internos |
| 2 | 5 page/page-header compactos | pacote | page, page-header, sticky-header |
| 2 | 12 alcance do scroll contido | pacote | `core/sticky-header` |
| 3 | 15 skeleton da navegação | demo e doc | `shell-layout.html`, `side-navigation.docs.ts` |
| 3 | 13 paginação ao fim | demo | `reconciliation-page.ts` |
| 3 | 7 date-picker nos formulários | demo | 8 usos |
| 4 | 4 campos na tabela de SKU | demo | `po-lines.ts` |
| 4 | 3 `slPage [loading]` e Refresh | demo | páginas de registo |
| 4 | 9 larguras por tipo de página | demo | `width` dos `slPage` |
| 5 | 8 backend e região de skeleton | demo e backend | `operations.ts`, overview |
| 5 | 14 splitter na reconciliação | demo | `reconciliation-page.ts` |
| 5 | guidelines AF-07, LA-05, OV-04, datas, larguras, LP-07 | guideline | `demos/nexora/guidelines` |

Cada correção de pacote leva um teste que falha antes e passa depois. Depois de cada correção de pacote corre `pnpm demo:refresh`. Cada correção tem uma linha em `demos/nexora/angular/LIBRARY-FEEDBACK.md`.
