# `drawer` como bottom sheet — autoavaliação

Data: 2026-09-25. Âmbito: a reabertura descrita em
`2026-09-25-drawer-bottom-sheet-design.md`. O resto da família mantém a avaliação de
`2026-09-04-drawer-self-assessment.md` e `2026-09-12-splitter-and-drawer-self-assessment.md`.

## Evidência

| Tipo                          | Onde                                                                                                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contrato                      | `specs/components/drawer/contract.test.mjs`, 46/46                                                                                                                                       |
| Core                          | `packages/core/src/extent/sheet.test.ts`, `measure/keyboard-inset.test.ts`; `src/extent` e `src/measure`, 75/75                                                                          |
| React                         | `packages/react/src/drawer`, 55/55; `app-shell`, `detail-panel`, `master-detail`, 58/58; `filter-bar`, `column-manager`, 52/52                                                          |
| Angular                       | `packages/angular/drawer/src`, 44/44, com um tsconfig restrito ao `drawer`: o `ng test` do projeto não compila por 29 erros em `dashboard-grid`, obra de outra sessão                    |
| Capturas do harness           | `sheet`, `sheet-long`, `sheet-undimmed`, `sheet-keyboard`, `side-top` a 420 claro; `sheet` a 720, escuro, alto contraste, RTL, dense; `sheet-long` a 240                                  |
| Cenário no navegador (React e Angular) | Chrome headless com toque emulado, sobre as stories `sheet`, `scrim-from` e `keyboard`: arremesso fecha; lista rolada rola; gesto para cima cresce até ao conteúdo antes de rolar; clique no grabber volta à paragem mais baixa; sem scrim a página responde; a paragem do meio escurece; o teclado simulado levanta a folha 260 px. 9/9 nos dois |
| Audit das páginas             | `tools/harness/audit.mjs`, 6006 e 6007, a 1280 e 620 px: 26 cenas, sem achados                                                                                                           |

## Dimensões

Cada linha nomeia a mudança que mais melhoraria a dimensão e se foi feita.

| Dimensão               | Estado                                                                                                                                                                  | Mudança nomeada                                                                                                                                                             | Feita |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1. Ícones              | Sem ícone novo; o grabber é a pílula do `resizer`, `aria-hidden`                                                                                                         | Nenhuma: o grabber não é um glifo                                                                                                                                             | —     |
| 2. Movimento           | A folha assenta com `--_move`; sem transição durante o gesto; `interpolate-size` transiciona a altura `auto`; o scrim de `scrimFrom` esmaece                               | Mola na soltura, em vez da curva de entrada: as folhas nativas usam mola (Compose `tween(300)`, gorhom spring). Não feita: a escala de movimento não tem mola, e acrescentá-la é uma decisão de fundação | não   |
| 3. Responsividade      | 40 rem de largura máxima, centrada; 240 px segura a lista longa                                                                                                          | O teclado virtual encolhe a célula e o limite `100%` com ela                                                                                                                 | sim   |
| 4. Refinamento         | Capturas limpas nos três esquemas                                                                                                                                        | O intervalo entre o grabber e o título (≈36 px) é maior que o de Material (48 dp de pega incluindo o título a seguir). Não feita: é a geometria do `resizer` de 2026-09-12, partilhada com `splitter` | não   |
| 5. Tokens              | Um token novo, `--slotted-drawer-sheet-inline-size`, que resolve em `--slotted-drawer-extent-xl`; uma propriedade de runtime, `--slotted-keyboard-inset`                  | Nenhuma                                                                                                                                                                      | —     |
| 6. Padrões             | Dialog (Modal) e Window Splitter mantidos; cada paragem alcançável por setas, a do conteúdo incluída                                                                    | Um nome de ação para o toque no grabber (`aria-roledescription` ou uma descrição). Não feita: o separador já diz valor e limites, e um nome extra repetiria `aria-valuenow` | não   |
| 7. Acessibilidade      | O gesto do corpo nunca é o único caminho: teclado, grabber e fecho explícito cobrem-no                                                                                  | O mínimo do intervalo inclui o repouso do conteúdo (`floor`), para `aria-valuenow` não mentir abaixo de `minExtent`                                                          | sim   |
| 8. API nativa          | React: props e contexto; Angular: `input()`, sinais e efeitos com limpeza                                                                                                | O helper das stories Angular dava a todas as caixas o mesmo `#box`; cada caixa tem agora a sua referência                                                                    | sim   |
| 9. Capacidade          | As 19 linhas de table stakes resolvidas: 15 adopt/adapt, 2 declinadas com substituição escrita, 2 já existentes                                                           | Passagem de scroll a meio do gesto, como Material. Não feita: o `touchmove` deixa de ser cancelável quando o scroll começa, e a plataforma não oferece nested scrolling       | não   |
| 10. Integração         | `drag` nos dois providers de defaults; `scrimFrom` por instância; listeners desfeitos por efeito e por `DestroyRef`                                                      | Medida das paragens partilhada no core (`measureSheetStops`) em vez de duas cópias                                                                                          | sim   |
| 11. Documentação       | Três cenas novas nas duas páginas, com código; tabela de API com `drag`, `scrimFrom` e `size="content"`; frase de acessibilidade do gesto                                | Uma cena operável com lista longa e duas paragens, porque a passagem só se vê com conteúdo que rola                                                                         | sim   |

## Secção 18

- **Anatomia:** sem partes novas. Estados no DOM: `data-undimmed`, `data-drag`,
  `data-size="content"`.
- **Controlado e não controlado:** `extent` mantém o par; `undefined` é a paragem do
  conteúdo. O arraste do corpo pede uma vez, na soltura; o do separador continua a pedir
  por movimento, que é o que um redimensionamento contínuo precisa.
- **Matriz de estados:** aberto, a arrastar (separador ou corpo), sem scrim (abaixo de
  `scrimFrom`), com teclado (recuo > 0), a carregar. Com `data-dragging` nada transiciona.
- **Densidade e direção:** a folha não muda com a densidade além do botão de fecho; em RTL
  o espelho é o do resto da família, e o gesto é vertical.
- **Carregar, vazio, erro, conteúdo extremo:** `loading` mantém o piso do corpo; conteúdo
  que chega com a folha aberta transiciona por `interpolate-size`; conteúdo mais alto que
  a camada para a 4 rem do topo e rola; um nome sem espaços quebra por
  `overflow-wrap: anywhere`, como antes.

## O que esta máquina não verifica

Um teclado virtual real (Android Chrome e iOS Safari) e o toque num ecrã físico. No seu
lugar: `observeKeyboardInset` testado contra um `visualViewport` falso, a story que escreve
os 260 px que o binding escreveria, e o gesto verificado com toque emulado pelo protocolo
DevTools.
