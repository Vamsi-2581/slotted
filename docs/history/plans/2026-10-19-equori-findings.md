# Findings do equori — triagem e plano

Fonte: 15 findings do projeto consumidor equori, recebidos em 2026-10-19 sobre `v0.1.0-beta.2`
(`990f54a5`). Uma fatia fecha até três tarefas. Cada defeito e cada feature leva o teste que
falha antes da mudança. React e Angular recebem a mesma mudança de contrato.

## Triagem

| #   | Família            | Tipo     | Estado na triagem                                                                                                                                        |
| --- | ------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | app-shell          | defeito  | Confirmado. O efeito de `resize` fecha ao entrar em `overlay` e nada reabre ao sair (`app-shell.tsx`, `app-shell.ts`).                                   |
| 2   | app-shell          | defeito  | Confirmado. `overlay` e `data-open` não leem a presença de `AppShellNav`; o mesmo vale para o painel `aside`.                                            |
| 3   | app-shell          | defeito  | Confirmado. A região `nav` tem `overflow: hidden`; os parts `nav-header`, `nav-body`, `nav-footer` existem e a documentação não os nomeia para o rodapé. |
| 4   | table + menu       | defeito  | Por medir. Hipótese: cada `TableColumnHeader` monta um `Tooltip whenClipped`; a medição corre em mudanças de foco.                                       |
| 5   | table              | feature  | `TableGroupRow`; `TableRow` `interactive`, `selected`, `onAction`.                                                                                       |
| 6   | table              | defeito  | Confirmado. `inset-block-start` lê `--slotted-table-sticky-offset` também sob `stickyTo="scroll"`; `page.css` liga esse token a `--slotted-page-sticky-top`. |
| 7   | button             | feature  | Válida. `tone="neutral"` (nome já usado por `chart`), solid em `--slotted-surface-inverse`; tokens novos `--slotted-surface-inverse-hover` e `-active`. |
| 8   | chart              | melhoria | Confirmado. `option.ts` posiciona cada rótulo de linha `x` sem colisão.                                                                                   |
| 9   | currency-field     | feature  | `size="display"`, `variant="underline"`.                                                                                                                  |
| 10  | segmented-control, toggle-group | feature | `variant="underline"`; `appearance="chips"`.                                                                                              |
| 11  | list               | melhoria | `ListSection` com conteúdo final e variante `plain` do rótulo.                                                                                           |
| 12  | entity-picker      | defeito  | Por medir.                                                                                                                                               |
| 13  | theme              | feature  | Tokens `--slotted-state-hover`, `-pressed`, `-selected`.                                                                                                 |
| 14  | theme              | feature  | Tokens `--slotted-letter-spacing-tight`, `-tighter`.                                                                                                     |
| 15  | dialog (docs)      | docs     | Confirmado. O inset é privado (`--_padding-inline`); a anatomia não nomeia o dono.                                                                       |

## Fatias

1. app-shell: 1, 2, 3.
2. table e entity-picker: 6, 4, 12.
3. table: 5.
4. tokens e button: 13, 14, 7.
5. segmented-control, toggle-group, list: 10, 11.
6. currency-field, chart, dialog: 9, 8, 15.
7. Ecrã de comparação temporário fora do repositório (o eslint e o tsc da raiz leem `tmp/`): antes = `v0.1.0-beta.2` publicada, depois = workspace empacotado.

## Resultado

| #   | Estado |
| --- | ------ |
| 1   | Corrigido: reabre ao sair de `overlay` com `reason="resize"`; React e Angular. |
| 2   | Corrigido: véu, camada e `data-open` só com a região escrita (nav e aside). |
| 3   | Corrigido: `nav` com `overflow-y: auto`; docs nomeiam `nav-footer`. |
| 4   | Corrigido na causa medida: o positioner coalesce pedidos da mesma tarefa (4 → 1 cálculo por abertura). A tabela não mede nada na abertura. |
| 5   | Feito com desvio: `aria-current` em vez de `aria-selected`; sem faixa lateral (R1). `isRowAction` em `@slotted/core/pointer-intent`. |
| 6   | Corrigido: offset só sob `stickyTo="page"`. |
| 7   | Feito: `neutral` como sexto tom do tema; `--slotted-surface-inverse-hover`/`-active`. |
| 8   | Feito: `placeLineLabels`, `labelPlacement`, `priority`, `notes` no tooltip. |
| 9   | Feito com desvio: eixo `appearance="display"` (size e variant são vocabulário partilhado); parte `symbol`; `currencyAffix` no core. |
| 10  | Feito: `variant="underline"`; `variant="chips"` (toggle-group e toggle); nome pelo rótulo do `Field`. |
| 11  | Feito: `end` e `labelVariant="ruled"` (`plain` já é valor do eixo da raiz). |
| 12  | Parcial: beneficia do item 4; o 1 s do equori não se reproduziu. |
| 13  | Feito no tema; as famílias existentes ainda não leem os tokens. |
| 14  | Feito; lidos pelo stat-card e pelo currency-field display. |
| 15  | Feito: `--slotted-dialog-padding-*` (entrada), `--slotted-dialog-inset-*` (saída), `specs/panel-inset.test.mjs` para dialog, popover e tour, cena `layout`. |
| 16  | Defeito encontrado no ecrã de comparação: o build do `@slotted/react` embutia o `react-dom` CommonJS (`require("react")` em runtime). Externos corrigidos, `react-dom` peer, guarda em `package-boundary.verify.mjs`. Afeta a beta.2 publicada. |
