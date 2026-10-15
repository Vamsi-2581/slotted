# Gestão de colunas — autoavaliação

Famílias: `column-manager` (nova), `saved-views` (nova), extensões de `data-grid`.
Design: `2026-09-23-column-management-design.md`. Critério: `.claude/skills/component/references/rubric.md`.

## Rubrica

| Dimensão | Estado | Mudança que mais melhoraria | Feita |
| --- | --- | --- | --- |
| Icons | Glifos do tema por máscara: alça, fixar, busca, ajuda (`circle-help`), marca padrão (`pin`, sem estrela no conjunto). | Glifo de estrela para a vista padrão. | Não: exige glifo novo no tema. |
| Motion | Camadas herdam o movimento de `popover` e `drawer`; nenhuma duração própria. | Transição da linha arrastada no manager. | Não. |
| Responsiveness | Manager: rodapé 2×2 abaixo de 20 rem, drawer no telemóvel da demo. Grid: colunas ocultas por espaço a 390 px. `filter-bar`: controlos de `end` em linha própria abaixo de 36 rem. | Captura do drawer no harness. | Não: verificado só na demo (captura `orders-390-*-manager.png`). |
| Refinement | Capturas lidas e corrigidas pelos três lanes (listas nos relatórios); demo lida a 1280 e 390, claro e escuro. | Alinhar "Save as new view…" como ação secundária visível no rodapé do painel. | Não. |
| Tokens | Dois tokens de componente por família nova; o resto lê fundação. | — | — |
| Patterns | Manager: ordem nativa de Tab; `Alt+ArrowUp/Down` como `moveBy` de `@slotted/core/drag`. Grid: `F2` entra no cabeçalho (`cursor.focusInside`). | Modelo de grelha de disposição no manager (uma paragem de Tab). | Não: decisão registada no design §3.7. |
| Accessibility | `aria-describedby` do `columnheader` para a descrição sempre no DOM; contagem no nome do gatilho; anúncios de mover, ocultar, aplicar e salvar. | Verificação com leitor de ecrã real. | Não: esta máquina não tem leitor de ecrã. |
| Native API | Botões, `form` com submissão implícita no nome da vista, `input[type=checkbox]` via `checkbox`. | — | — |
| Capability | Inventário §1 coberto; `table` fica fora (reabertura em `build-order.md`). | `column-manager` para `table`. | Não: `table` não expõe `columnState`. |
| Ecosystem integration | Angular: `model()`, `output()`, `provide*Defaults`, `exportAs`. React: controlado/não controlado, `ref` com handle, provider. `usePersistedGridView.setView` para aplicar uma vista numa escrita. | `persistedGridView` com modo só-colunas (linha no ledger da demo). | Não. |
| Documentation | Páginas de referência nos dois bindings com um cenário por entrada do contrato; `referencePageErrors` passa. | Leitura das páginas no Storybook e `audit.mjs`. | Não: nenhum Storybook estava a correr. |

## Secção 18

- Anatomia: design §3.2 e §4.2, mais as partes acrescentadas em §3.9 e §4.8.
- Controlado e não controlado: `columnState`/`defaultColumnState` e `open`/`defaultOpen` no manager; `state`/`defaultState` e `open`/`defaultOpen` em `saved-views`. `defaultColumnState` é também o alvo de "Restaurar padrão".
- Densidade e direção: capturas `dense` e `rtl` dos harnesses; `data-grid` escreve `data-slotted-density` no root.
- Vazio, erro e conteúdo extremo: busca sem resultado no manager; nomes longos e duplicados em `saved-views`; rótulos alemães longos no harness do manager.

## Evidência

- Testes: core 37; `data-grid` Angular e React com os testes listados no relatório de T3; `column-manager` Angular 18, React 19; `saved-views` Angular 21, React 27; `filter-bar` Angular 28, estilos 15.
- Cenários de navegador: `demos/nexora/angular/tools/column-scenarios.mjs`, 7/7.
