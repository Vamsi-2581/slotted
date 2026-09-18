# `drag` — autoavaliação

Onda 9, rodada 16. Módulo `@slotted/core/drag`, sem UI. Inventário em
`2026-09-15-drag-capability-inventory.md`, desenho em `2026-09-15-drag-design.md`.

## Evidência

- Testes: `packages/core/src/drag/{positions,keys,geometry,drag}.test.ts`,
  70 casos; `tools/harness/core.test.mjs`, 2 casos. `turbo run verify` em
  `@slotted/core` (68 arquivos, 1317 casos) e `@slotted/harness` (85 casos).
- Harness: `/home/dreco/dev/slotted/tools/harness/out/drag.html`, construído
  por `node tools/harness/core.mjs drag`. Oito cenas: `list`, `list-dragging`,
  `boards`, `boards-dragging`, `chips`, `tree`, `tree-dragging`, `grid`,
  `scroll`. As cenas `*-dragging` abrem uma sessão ao carregar.
- Capturas lidas (`scratchpad/shots/`): página inteira em dark 420, high-contrast
  420, light 240, light dense 420, light rtl 420; cenas em light 420; `grid`
  em light 240; `tree-dragging` em high-contrast 420 (antes e depois da
  correção do anel de `on`).
- Ponteiro, dirigido pelo protocolo DevTools num Chrome real
  (`scratchpad/drive.mjs`): arrasto de "Tag the build" sobre `Archive`
  (`data-drop-invalid` pintado, pré-visualização com borda de perigo), soltar
  em `Done` (modelo `todo:t1,t3 / done:t2,d1`, foco em `t2`, pré-visualização
  removida), ponteiro na borda inferior da lista de 12 (`scrollTop` 163 após
  200 ms).
- Teclado, dirigido pelo protocolo DevTools (`scratchpad/keys.mjs`): `Space`,
  `ArrowDown`×2, `Space` → `backlog:export,audit,auth,sso,i18n`; `Escape`
  devolve a ordem; `Alt`+`ArrowRight`×2 em `chips` → `to:bruno,carla,ana,diego`;
  `ArrowRight`×2 em `boards` circula `todo → done → (archive recusado) → todo`;
  `ArrowUp` em `tree` pousa em "on Specs" e salta o arquivo que recusa `on`.

## As onze dimensões

| Dimensão            | Estado | A mudança que mais melhoraria                                                                                                                                                                                                                                                             | Feita |
| ------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Ícones              | n/a    | O módulo não desenha. A alça do harness usa `--slotted-icon-ellipsis` rodado 90°; um glifo `grip-vertical` na escala de ícones é a mudança, e pertence ao primeiro consumidor que desenha uma alça (`data-grid`), não a um módulo sem folha.                                                | não   |
| Motion              | n/a    | Sem folha. A pré-visualização segue o ponteiro por `translate` sem transição, porque uma transição entre dois `pointermove` atrasa a mão. O harness transita opacidade e cor de fundo pela escala.                                                                                          | —     |
| Responsividade      | n/a    | Sem folha. O harness a 240 px quebra palavras da grade (`overflow-wrap: anywhere`), corrigido na captura.                                                                                                                                                                                  | sim   |
| Refinamento         | n/a    | A linha de inserção do harness no índice 0 toca o padding do contentor. Um recuo de um passo resolveria; a linha é do harness, e a família que a desenhar (`listbox`) decide a sua.                                                                                                        | não   |
| Tokens              | n/a    | O módulo lê um token: `--slotted-z-index-toast` na pré-visualização, com fallback literal porque o elemento pode estar num documento sem o tema. O harness só lê tokens de fundação.                                                                                                       | —     |
| Padrões             | passa  | Não há padrão APG para arrasto. A transcrição no inventário cobre WCAG 2.5.7, o listbox rearranjável (Alt+seta, região viva com posição e contagem) e o sensor de teclado de dnd kit/react-beautiful-dnd. A mudança: `aria-keyshortcuts` gerado por `DRAG_KEYS` — é do binding, não do módulo. | não   |
| Acessibilidade      | passa  | Anúncio por passo no teclado, pegar/soltar/cancelar no ponteiro; foco devolvido ao item no lugar novo; `Escape` cancela sem fechar o diálogo. A mudança: o gesto de leitor de tela em toque (React Aria) — não verificável nesta máquina; o consumidor mapeia `click` na alça para `pickUp`. | não   |
| API nativa          | passa  | Pointer Events com `setPointerCapture`; `touchmove` não passivo só durante a sessão; modificadores lidos como a plataforma (`Ctrl`/`Option` copia, `Shift` move). A mudança: `attachDraggable` aceitar um `AbortSignal` além de devolver o `detach` — sem consumidor que o peça.             | não   |
| Capacidade          | passa  | 24 linhas de table stakes: 20 `adopt`/`adapt`, 4 `decline` com dono ou composição. A mudança: `onDragMove` com o ponto a cada frame para uma família que desenha a própria pré-visualização — hoje `state.point` chega por `subscribe`, que é o mesmo dado sem um segundo evento.          | não   |
| Integração          | n/a    | Sem binding nesta sessão. As duas tabelas de `frameworks.md` são respondidas pelo primeiro consumidor (`data-grid`), como `positioner` foi por `usePositioner`/`SlPositioner`. O que o módulo já fixa: `items()`, `element()` e `itemElement()` são funções, lidas quando a sessão pergunta. | —     |
| Documentação        | n/a    | Sem página de referência. O desenho tem o exemplo de uso; o harness é a demonstração. A mudança: uma página de referência do módulo em Storybook — pertence à onda em que `data-grid` o expõe.                                                                                             | não   |

## §18, ponto a ponto

1. **Propósito e antiuso.** Reordenar, mover entre contentores, soltar sobre um
   item, soltar num contentor vazio. Antiuso: posição livre `{x, y}`, eixo
   travado, fronteira (`splitter` e `state.point`); arrasto nativo entre
   janelas e ficheiros (`upload`).
2. **Anatomia.** Sem partes. A superfície é `createDragController`,
   `registerContainer`, `pickUp`/`move`/`moveTo`/`drop`/`cancel`/`moveBy`,
   `handleKeydown`, `attachDraggable`, `subscribe`, `state`, `messages`,
   `destroy`; as puras `containerPositions`, `resolvePoint`, `intentForKey`,
   `operationForModifiers`.
3. **Contrato de estado.** O módulo não guarda o valor do consumidor: o
   modelo é `items()` e a mudança é `onDrop`, com `reason` em
   `keyboard | pointer | programmatic`. `onDragStart` é cancelável como
   `ChangeRequest`. Uma solicitação pelo valor que o consumidor já tem —
   soltar na posição de identidade — não é emitida.
4. **Matriz de estados.** `idle`, `dragging` × `target` (`null`, `between`,
   `on`, `root`) × `valid` × `operation` (`move`, `copy`, `link`) × `reason`.
   Os três atributos do vocabulário (`dragging`, `drop-target`,
   `drop-invalid`) derivam de `state` e são do binding.
5. **Teclado, foco, ARIA, toque.** Tabela em `design.md` §3; testada em
   `keys.test.ts` e dirigida em Chrome. Foco: devolvido no frame seguinte por
   `itemElement`. ARIA: sem estado (`aria-grabbed` foi descontinuado);
   `messages.instructions` para `aria-describedby`, região viva partilhada.
   Toque: espera de 250 ms, deslize antes disso é rolagem, `touchmove`
   prevenido depois. Não verificado num dispositivo de toque real nem com
   leitor de tela — dito no gate.
6. **Recipes.** n/a.
7. **Responsivo, RTL, locale, reduced motion.** RTL: setas inline lidas de
   `direction` computada do contentor (`keys.test.ts`, `drag.test.ts`
   "reads the direction"). Locale: todas as frases vêm de `messages`, com
   rótulos do consumidor. Reduced motion: o módulo não anima.
8. **Loading, empty, error, extremo.** Contentor vazio → `root`; nenhum lugar
   → `messages.nowhere`; fonte que perde o item a meio → cancelamento; item
   sem elemento (virtualizado) → saltado na resolução do ponteiro; segundo
   ponteiro ignorado; aba oculta → cancelamento.
9. **SSR, desempenho, virtualização.** Nada é criado fora de uma sessão; o
   módulo não cria o elemento de instruções para que o `id` seja do binding.
   Medição só do que o consumidor aponta; auto-scroll por frame e só enquanto
   há sessão de ponteiro.
10. **Exemplos.** O harness: lista, quadro com contentor que recusa, chips
    horizontais com `Alt`+seta, árvore com `on` e dwell, grade 3×2, lista
    rolável.
11. **Testes partilhados entre bindings.** Sem bindings. Os 70 casos são o
    contrato que ambos herdarão.
12. **Changelog e migração.** Módulo novo, sem consumidor. `tags-input` e
    `multi-select` migram o `Alt`+seta para `moveBy` quando forem reabertos
    (`docs/process/build-order.md`, reaberturas).

## Decisões tomadas

- O teclado define a sessão; o ponteiro deriva. Um solto de ponteiro e um de
  teclado são o mesmo evento.
- Sem `blocked` nas mensagens: o teclado nunca cai em posição recusada; o
  ponteiro anuncia só pegar, soltar e cancelar.
- A posição de identidade é o início da sessão e nunca é um drop.
- `Escape` em `window`, fase de captura, com `stopPropagation` — registrado no
  briefing porque muda o que `dismissable-layer` vê.
- O módulo não escreve atributos em elementos registrados; a
  pré-visualização é o único elemento que cria.
- A pré-visualização é clonada **antes** de a sessão ser publicada; clonada
  depois, carregava `data-dragging` e a linha de inserção (visto na captura
  `drive-archive`, corrigido).
- `dropped` é anunciado antes de `onDrop`; anunciado depois, lia o rótulo e a
  contagem do modelo já alterado ("t2 dropped, position 1 of 3").
- Fora de `packages/core/src/index.ts`, como `filter`.
- `tools/harness/core.mjs` com `vite` como devDependency de
  `@slotted/harness`: a página leva o módulo empacotado num `importmap`
  `data:`, porque uma página `file:` não importa um módulo `file:` vizinho.

## O que a máquina não pôde verificar

- Um dispositivo de toque: a espera de 250 ms e o `touchmove` prevenido foram
  testados com `PointerEvent` sintéticos em jsdom, não com um dedo.
- Um leitor de tela: a região viva é a de `live-announcer`, já verificada
  por `toast`; o texto de cada passo está nas capturas em `[data-status]`.

## Fora deste módulo, visto durante o trabalho

- `pnpm format:check` e `pnpm lint` falham fora deste módulo:
  `packages/styles/src/side-navigation/*`, `specs/components/side-navigation/contract.json`
  (outra sessão, em curso) e `packages/react/src/toggle-group/toggle-group.tsx`,
  `packages/styles/src/toggle-group/toggle-group.styles.test.mjs` (dois
  `no-unused-vars`, já em `HEAD`). Nenhum é deste módulo.
