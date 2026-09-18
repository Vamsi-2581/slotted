# Autoavaliação — `filter-bar`

Contra `.claude/skills/component/references/rubric.md` (onze dimensões) e
`docs/component-features.md` §18. Inventário em
`2026-09-14-filter-bar-capability-inventory.md`, desenho em
`2026-09-14-filter-bar-design.md`.

Capturas lidas em
`/tmp/claude-1000/-home-dreco-dev-slotted/d7d6d98f-d963-4fa1-93b6-80a949213528/scratchpad/shots/`:
harness `filter-bar-*.png` (light, dark e high-contrast a 720 e 420; light a
240; dense; rtl; foco no pill, no chip, no `remove` do construtor) e página de
referência React `react-filterbar-{1280,720}-{light,dark}-N.png`,
`react-filterbar-1280-dense-N.png` e recortes `fb-r-*.png`.

---

## As onze dimensões

| #   | Dimensão       | Estado | A mudança que mais a melhoraria                                                                                                                                                                                                                                                                                       | Feita                                                                                                                                                                                                           |
| --- | -------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Ícones         | passa  | O chevron do pill, o mais do `add`, a lupa da busca e o X do chip são máscaras de `--slotted-icon-*`; o anel de `loading` é o de `spinner`. A melhoria: um glyph de filtro (funil) no `summary` da composição estreita, ao lado da contagem.                                                                          | não — o glyph não existe na escala e um novo pede a sua própria entrada no contrato de tokens; "Filters (n)" em texto é o que Polaris e PatternFly desenham                                                     |
| 2   | Movimento      | passa  | Pill e chip mudam de cor em `--slotted-control-transition-duration`; o chevron roda em `--slotted-duration-short`; o drawer e o popover trazem o movimento das famílias que são. A melhoria: os chips dobrados entrarem com opacidade ao revelar, em vez de aparecerem.                                                | não, por decisão: `[data-folded]` é `display: none` (dobra, não truncagem) e uma transição de entrada precisaria de `@starting-style`, que a foundation ainda não regista                                        |
| 3   | Responsividade | passa  | Raiz é o contentor, `frame` a grelha; três composições por container query (≥64rem, 36–64rem, <36rem). O ponto estreito desceu de 40 para 36rem nesta fatia: o palco da página de referência mede 39rem e mostrava a dobra em todas as demonstrações. A melhoria: a composição média pôr `end` na linha da toolbar. | não — `end` ao lado da busca é o que mantém a ordenação visível sem rolar a toolbar; registado no desenho §10                                                                                                    |
| 4   | Refinamento    | passa  | Pill cheio com a borda e o fundo de acento, frase em `regular` a seguir ao nome em `medium`; chip com o mesmo par de pesos; `actions` (Apply/Reset) fecham a linha da toolbar pela ponta. A melhoria: o anel de foco do pill cheio ter um matiz distinto da borda de acento.                                          | não — o anel é o da foundation (`--slotted-focus-ring-color`, `-width`, `-offset`), e um anel por estado seria uma cor sem token; o offset de 2px separa-o da borda em light e dark (captura `…focus-data-part-pill…`)                      |
| 5   | Tokens         | passa  | 69 propriedades lidas, todas em `filter-bar.tokens.json`; literais no contrato: `chip-max` (18rem), `search-max` (28rem), ponto estreito (36rem). A melhoria: `--slotted-filter-bar-search-size` sobrou no tokens.json depois da grelha e falhou o teste partilhado.                                                  | feita: removido                                                                                                                                                                                                 |
| 6   | Padrões        | passa  | Raiz `role="search"`, `bar` Toolbar do APG com anel rotativo, `chips` Grid com foco de remoção, pill Dialog (`aria-haspopup`, `aria-expanded`), construtor modal em `drawer`. Transcrição tecla a tecla no desenho §7. A melhoria: Home/End na grelha de chips saltarem para o primeiro e último chip revelado, não dobrado. | feita: os chips dobrados saem do anel por `display: none`, e `createRovingTabindex` só lista os visíveis                                                                                                        |
| 7   | Acessibilidade | passa  | Nome do chip "<campo>: <frase>" igual ao anúncio de `table`; `remove` anuncia "Remove <frase>"; contagem em `aria-live="polite"`; recusa de Apply anunciada com foco no pill; pills e chips dobrados com `visibility: hidden`. A melhoria: o `summary` estreito anunciar a mudança de contagem ao mudar a árvore.  | não — a contagem de resultados já é a região viva; um segundo anúncio por mudança seria dois anúncios pela mesma ação                                                                                            |
| 8   | API nativa     | passa  | React: `ComponentPropsWithRef<'div'>` na raiz, `ref` com `focusSearch()`/`open()`/`root`, handler do consumidor antes do da família. Angular: `input()`/`model()`/`output()`, `HostAttributeToken` para `aria-label`, `exportAs`, `default*` para o não controlado, `provideFilterBarDefaults()`. A melhoria: `renderOperand` no Angular com o mesmo contexto do React. | feita: `ng-template[slFilterBarOperand]` com `$implicit`, `field`, `operator`, `index`, `value`, `set`, `apply`, `label`, `size`                                                                                |
| 9   | Capacidade     | passa  | 19 requisitos de base: 16 adotados ou adaptados, 3 recusados com o dono nomeado (ordenação e seletor de colunas no slot `end`; linguagem de consulta em `search` de `table`). Sete diferenciais e sete lacunas. A melhoria: `savePreset` pedir o nome dentro da família.                                                | não, por decisão (desenho §6): o nome é da aplicação, que tem o seu diálogo; a família entrega a árvore                                                                                                          |
| 10  | Integração     | passa  | Ambas as tabelas de `frameworks.md` respondidas (desenho §11 e §12). Assimetria registada: `sticky` escreve `--slotted-page-sticky-top` no elemento pai nos dois; corrigido nesta fatia o segundo `publish` que somava a própria altura duas vezes (teste em cada binding). A melhoria: o Angular expor `ngModel` na busca. | não — a busca é `[(query)]`, um model; `ngModel` seria um segundo canal para o mesmo valor                                                                                                                      |
| 11  | Documentação   | passa  | Duas páginas com import, anatomia (29 partes), 17 cenas com legenda e código, inputs, outputs, composição, seis frases de acessibilidade, tokens. `audit.mjs` limpo a 1280 e 620 no React, docs e story. A melhoria: a página Angular lida na imagem.                                                                | não pôde: o Storybook em :6007 responde "Unexpected token 'export'" em todas as famílias (também `timeline`) e precisa de reinício; as páginas Angular passaram `referencePageErrors`, `snippetFormatErrors` e 23 specs |

---

## §18, ponto a ponto

1. **Propósito, usos e antiusos** — desenho §1: uma barra sobre uma listagem
   que edita uma árvore de condições; não é `toolbar`, `table` (que tem o
   filtro de coluna), `tags-input` nem `search`.
2. **Anatomia** — 29 partes no contrato, uma linha cada nas duas páginas.
3. **Contrato controlado/não controlado** — cinco modelos sobre
   `@slotted/core/state`: `value`/`defaultValue` (razões pointer, keyboard,
   clear, remove, select, submit, programmatic), `query`/`defaultQuery`
   (keyboard, clear, submit, programmatic), `preset`/`defaultPreset` (select,
   clear, programmatic), `open`/`defaultOpen` (pointer, keyboard, escape,
   outsidePress, dismiss, submit, programmatic), `revealed`/`defaultRevealed`
   (pointer, keyboard, programmatic). React `on*Change(value, request)`;
   Angular `[(x)]` e `(xChangeRequest)`.
4. **Matriz de estados** — `disabled` > `loading` > `invalid` > `dirty` >
   `open` > `hover` > `focus-visible`. Sob `disabled` o pill cheio perde o
   acento (corrigido nesta fatia). `loading` mantém os controles e desliga
   Apply.
5. **Teclado, foco, ARIA** — desenho §7; testes React (três paradas, setas,
   Delete com foco de remoção, Escape na busca, atalho fora de campo
   editável) e Angular (os mesmos).
6. **Recipes** — `size` (3), `apply` (2), densidade pelo `control-gap`.
7. **Responsivo, RTL, locale, reduced motion** — capturas `240`, `rtl`,
   `dense`, `high-contrast`; `Intl.NumberFormat(locale)` na contagem;
   transições sob `--slotted-control-transition-duration`, que colapsa sob
   reduced motion.
8. **Loading, empty, error, extremo** — `loading`; sem regras a barra é busca
   + pills vazios + `add`; erro é a recusa de Apply com `data-invalid`; cena
   `content` com onze valores, campo desconhecido, rótulo árabe ao lado de
   data ISO.
9. **SSR e desempenho** — `useId`; `ResizeObserver` só em efeito; o
   debounce da busca é um `setTimeout` limpo no unmount; a árvore normaliza
   uma vez por pedido.
10. **Exemplos** — 17 cenas por página, um domínio (pedidos de um
    marketplace, 8 linhas).
11. **Testes partilhados** — 22 React, 19 Angular, 16 core (`group.ts`), 15
    contrato, 10 folha, 4 + 4 páginas.
12. **Estabilidade** — família nova; nenhuma quebra de contrato. A capacidade
    `invalid` saiu do contrato antes do primeiro commit da ligação: é um
    estado, não uma capacidade com modelo.

---

## Corrigido depois do gate de release

- O editor que um pill abre (`[data-ui='filter-bar'][data-part='rule']`)
  apanhava a regra da raiz (`container-type: inline-size`) e media 0px dentro
  do popover: cada controle quebrava palavra a palavra. A regra da raiz passou
  a `[data-part='root']`; o editor é uma coluna a `--slotted-filter-bar-editor-size`
  (18rem, literal no contrato), dentro de `PopoverBody`/`slPopoverBody`, com
  o rótulo próprio `clearRule` ("Clear"). Cena `editor` no harness
  (`filter-bar-editor-{light,dark}-comfortable-ltr-420.png`); teste na folha.
- O construtor abria no portal partilhado (`body`), fora do
  `[data-slotted-theme]` que a página de referência põe no preview, e
  desenhava-se com as cores de sistema. `container` é agora input/prop da
  família, passado ao drawer; as páginas passam a raiz do tema, e as cenas
  `builder` e `groups` abrem-no numa caixa alta como a página de `drawer`.
- O `multi-select` do operando de conjunto recebe `items`, para o tag mostrar
  o rótulo da opção e não o valor.
- Revisão do utilizador: o construtor lia-se como uma pilha de controles e o
  cabeçalho "and | or of the following" como um fragmento. Refeito à maneira
  de Notion, Airtable e AG Grid: cabeçalho "Match [All | Any] of the
  following"; cada linha começa com a palavra que a junta à anterior ("Where",
  depois "and"/"or"), numa grelha de duas colunas (`rules`, `conjunction`,
  31→32 partes com `search-icon`); um grupo aninhado é uma caixa sobre a
  superfície afundada com o seu Remove group no cabeçalho; Add rule e Add
  group levam o glifo de mais; o drawer passa a `xl` para uma regra caber
  numa linha. A busca leva a lupa (`--slotted-icon-search`) no adorno
  inicial. Rótulos novos: `matchAll`, `matchAny`, `where` (Angular também
  `match`). Cena `builder` do harness refeita (720 light, 420 dark).
- Construtor a três níveis: cada grupo passa a container da mesma
  `slotted-filter-bar-builder`, para uma regra empilhar contra a largura do
  próprio grupo; caixas alternam a superfície por profundidade.
- Fundação, a pedido do utilizador: `--slotted-control-inner-size-*`
  (`docs/token-foundation.md`, Control geometry), lida por `kbd` e `tag`
  dentro de um controle e escrita por `text-field`, `multi-select` e
  `tags-input`. O kbd da busca passa de 24px para 20/18px em compact/dense.

## O que a máquina não pôde verificar

- A página Angular na imagem (dimensão 11).
- Leitor de ecrã real sobre a grelha de chips e o foco de remoção; em seu lugar,
  os atributos e o destino do foco nos testes.

## Fora desta família, visto durante o trabalho

- `pnpm lint`: dois erros em `toggle-group`. `pnpm test:docs`: ids de trechos
  em `segmented-control`, `splitter`, `toggle-group`, `action-bar`.
  `packages/styles`: `page-header` em `tokens`. Todos de outras faixas.
- O Storybook Angular (:6007, processo de 14 de setembro) responde
  "Unexpected token 'export'" em todas as páginas.
