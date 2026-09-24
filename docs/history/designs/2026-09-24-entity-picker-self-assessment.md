# `entity-picker` — autoavaliação

Data: 2026-09-24. Lê-se ao lado de `2026-09-24-entity-picker-design.md`. Evidência: contrato e
teste em `specs/components/entity-picker/`, `packages/core/src/entity-picker/entity-picker.test.ts`
(35), `packages/react/src/entity-picker/entity-picker.test.tsx` (25) e `.stories.test.ts` (4),
`packages/angular/entity-picker/src/entity-picker.spec.ts` (13) e `.stories.spec.ts` (4), o harness
`tools/harness/out/entity-picker.html` (10 cenas, `audit.mjs` sem achados) e a página React lida
renderizada em `http://localhost:6006/iframe.html?viewMode=docs&id=components-entity-picker--reference`
(1280 e 720 px, claro e escuro; `audit.mjs` 27 palcos, sem achados a 1280 e 620 px).

## 1. Rubrica

| Dimensão | Estado | Mudança que mais melhoraria | Feita |
| --- | --- | --- | --- |
| Icons | Chevron, x, check, `plus` na oferta de criar, `rotate-ccw` na de repetir, `circle-alert` no erro e no chip sem registo; todos por máscara, com `forced-color-adjust: none`. | Uma estrela na linha de um favorito. | Não: a fundação não tem glifo `star` e um glifo novo muda a fundação; o cabeçalho "Favorites" diz o mesmo (contrato `declined.favoriteMark`). |
| Motion | Entrada do popup pela gramática das camadas (`overlay-motion.test.mjs`); chevron gira; linhas recuam com transição numa busca nova; nenhum loop próprio (o anel e o esqueleto são das famílias `spinner` e `skeleton`). | Transição do esqueleto de um chip para o nome resolvido. | Não: `loading-states` §3 pede que a troca ocupe a mesma caixa, não que se anime; uma transição atrasa a leitura do nome. |
| Responsiveness | Campo numa linha a qualquer largura (decisão do gate visual): âmbito a `min(11rem, 45%)` com reticências, chips recolhidos em "+N", primeiro chip encolhe só quando é o único visível. Capturas 240, 420, 720; página a 360 px. | O âmbito numa linha própria abaixo de 20rem. | Retirado no gate: um campo de duas linhas quebra o ritmo de um formulário. |
| Refinement | Registo de duas linhas com avatar a ocupar ambas; marca e `meta` na linha do nome (`audit.mjs`: zero desvios); `meta` limitado a `fit-content(25%)`; identificador por baixo do `meta`; nomes RTL alinhados pela página. | O chip em resolução crescia ao resolver. | Sim: mantém o botão de remover durante a espera, e pode ser retirado antes de resolver. |
| Tokens | 49 tokens de família lidos com omissão na fundação; seis literais registados em `contract.json` `literals`; `entity-picker.tokens.json` exato (`tokens.test.mjs`). | Um passo da escala de avatares para a face no chip. | Não: a face é a altura interior do controlo menos um passo de ar, uma proporção e não uma escala nova. |
| Patterns | Combobox APG com popup listbox; chips como linha de grelha (padrão de `multi-select`); `aria-activedescendant`, `aria-autocomplete="list"`, `aria-multiselectable`, `aria-setsize` com `total`. Tabela de teclas no contrato, decidida em `entityPickerKey` e testada no core. Partidas: `Enter` em multiple alterna e mantém aberto (a de `multi-select`); sem completar em linha. | Ofertas de criar e repetir como botões. | Não: um botão no popup fica fora do alcance do teclado com o foco no input; opções usam a mesma máquina. |
| Accessibility | Nome acessível de opção e chip inclui o identificador; id sem registo anunciado como "Unavailable, id"; erro, adições, remoções e limite pelo anunciador partilhado; esqueletos `aria-hidden`; foco após remoção por `createRemovalFocus`. | Verificar com um leitor de ecrã real. | Não: esta máquina não tem leitor de ecrã; os nomes e relações estão testados nas duas ligações. |
| Native API | React: atributos e handlers nativos chegam ao `input` e compõem; `ref` no input; `handleRef` com `focus`, `open`, `close`, `refresh`; `render` na raiz. Angular: `exportAs`, `HostAttributeToken` para `id`, `focus()`/`refresh()`. | Mesmo nome para a criação nas duas ligações. | Não: React usa `onCreate` que devolve o registo; Angular separa a notificação (`create` output) de quem faz o registo (`[createEntity]`), porque um `output()` não devolve valor. Assimetria registada. |
| Capability | §1.2 do desenho: todas as linhas `adopt`/`adapt` entregues; recusas com dono. Cinco modelos de estado com par controlado/não controlado e razões. | Virtualização da lista. | Não: diferida para `collection`, como em `combobox`; `hasMore` responde ao volume. |
| Ecosystem integration | React: provider, `useId`, sessões feitas num efeito (seguro em StrictMode, testado), `input` oculto por id. Angular: `model()` + pedidos, `ControlValueAccessor` + `Validator` (`required`, `unresolved`), `provideEntityPickerDefaults`, `DestroyRef`, signals, `OnPush`. | A sessão React morria no ensaio de desmontagem do StrictMode. | Sim: encontrado na story; sessões criadas e fechadas pelo mesmo efeito; teste em StrictMode. |
| Documentation | Duas páginas com os 18 cenários, API, eventos, composição e acessibilidade; testes de página passam nas duas ligações. Página React lida renderizada e medida. | Ler a página Angular renderizada. | Não: o Storybook Angular lê o programa uma vez ao arrancar e serve a story nova sem compilar; precisa de reinício (pedido no gate). |

## 2. Secção 18

1. **Propósito:** escolher um ou vários registos de uma coleção remota. **Antiuso:** conjunto
   curto e conhecido (`select`), texto livre (`combobox`), strings que o leitor escreve
   (`multi-select`, `tags-input`), árvore (`hierarchical-picker`).
2. **Anatomia:** 28 partes, `members['entity-picker'].parts`; um chip é um `tag`, a face um
   `avatar`, o âmbito um `select`.
3. **Controlado e não controlado:** `value` (id ou ids, o pedido leva `entities`),
   `inputValue`, `open`, `highlightedValue`, `scope`. O valor é o id porque é o que um
   servidor guarda; o registo chega no pedido e na cache.
4. **Estados:** `open`, `disabled`, `readonly`, `invalid`, `required`, `loading`, `selected`,
   `current`, `complete`; `disabled` retira remoções e popup; `readonly` mantém o texto e retira
   o popup; `complete` bloqueia os não escolhidos com `aria-disabled`.
5. **Teclado, foco, ARIA:** contrato `keyboard`; `entityPickerKey` testado no core; testes nas
   duas ligações (Enter, Escape em três passos, Backspace duplo, setas saltando desativados).
   **Toque:** botões com alvo recuperado por halo e alvo confortável em ponteiro grosso.
   **Leitor de ecrã:** não verificado nesta máquina.
6. **Tamanho e densidade:** `size` sm/md/lg; densidade pela geometria de controlo e pela
   escala de avatares (captura dense).
7. **Responsivo, RTL, locale, reduced motion:** uma linha a qualquer largura; RTL espelhado
   com nomes ordenados pelo próprio conteúdo; filtro local com `Intl.Collator`; reduced
   motion herda a gramática das camadas.
8. **Loading, empty, error, disabled, extremo:** esqueleto de registo na primeira página,
   linhas recuadas numa busca nova, esqueleto de uma linha na seguinte, 200/400 ms; vazio;
   erro com opção de repetir; id por resolver e id sem registo; nome de nove palavras,
   endereço longo, nome árabe, token sem espaços.
9. **SSR e performance:** ids por `useId`; popup só montado aberto; nenhuma medição no render;
   sem virtualização (paginação).
10. **Exemplos:** 18 cenários por página, domínio de um CRM.
11. **Testes partilhados:** o mesmo comportamento em `entity-picker.test.tsx` e
    `entity-picker.spec.ts`; busca, cache, secções e teclas uma vez em
    `@slotted/core/entity-picker`.
12. **Changelog e migração:** família nova; não há consumidor a migrar.

## 3. Defeitos de ferramentas partilhadas vistos e não corrigidos aqui

- As tabelas de anatomia e de API do workbench cortam a última coluna à direita a 1280 px em
  todas as páginas (a de `transfer` também); é um contentor de rolagem horizontal com a barra
  oculta no Chrome headless.
