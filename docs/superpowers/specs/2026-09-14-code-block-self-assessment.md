# Autoavaliação — `code-block`

Contra `.claude/skills/component/references/rubric.md` (onze dimensões) e
`docs/component-features.md` §18. Inventário em
`2026-09-14-code-block-capability-inventory.md`, desenho em
`2026-09-14-code-block-design.md`.

Capturas lidas em
`/tmp/claude-1000/-home-dreco-dev-slotted/d7d6d98f-d963-4fa1-93b6-80a949213528/scratchpad/shots/`:
harness `code-block-*.png` (light 720 e 240; dark, high-contrast, dense e rtl
a 420; foco em `copy` em light e em `reveal` em dark) e página de referência
React `react-codeblock-{1280,720}-{light,dark}-N.png`,
`react-codeblock-1280-dense-N.png` e recortes `cb-r-*.png`.

---

## As onze dimensões

| #   | Dimensão       | Estado | A mudança que mais a melhoraria                                                                                                                                                                                                                                                                                | Feita                                                                                                                                                                                                                   |
| --- | -------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Ícones         | passa  | Copy e o check são máscaras de `--slotted-icon-copy` e `--slotted-icon-check`; o wrap é `--slotted-icon-text-wrap`, glyph novo desta fatia (commit `0458a24`); o glifo do ficheiro vem de `fileKind` (`--slotted-icon-file-*`). A melhoria: um glyph por linguagem no lugar da folha de texto.                | não — a espécie do ficheiro é o que `upload` já classifica; um logótipo por linguagem é uma segunda escala de ícones, fora da foundation                                                                               |
| 2   | Movimento      | passa  | Controles em `--slotted-control-transition-duration`; o véu do colapso e o `data-dim` do foco em `--slotted-duration-medium`; o check da cópia em `--slotted-duration-short`; o desfoque sai sob reduced motion e o esmaecer fica. A melhoria: a altura ao revelar animar em vez de saltar.                  | não, por decisão (desenho §7): as linhas escondidas ficam no DOM sob uma máscara de altura fixa; animar `max-block-size` sobre quarenta linhas é uma página a saltar                                                     |
| 3   | Responsividade | passa  | O corpo é um `scroll-area` de dois eixos; sob wrap a continuação indenta ao próprio indent em `ch`; a 240px o cabeçalho trunca o título e mantém os controles. A melhoria: sem cabeçalho, os controles flutuantes cederem lugar ao código quando a caixa tem menos de 20ch.                                      | não — a 240px os dois controles ocupam 4ch da primeira linha, que rola por baixo deles (captura `…240.png`); a régua para esconder controles seria um número sem token                                                   |
| 4   | Refinamento    | passa  | Uma linha é uma fila da grelha (número, marcador, texto), por isso os tokens que chegam tarde não movem nada; a goteira mede `<digits>ch`; as marcas tingem a 7,5 % do texto do tom com uma barra na ponta. A melhoria: o `reveal` desenhar o véu sobre a última linha inteira e não sobre meia linha.        | feita em parte: a máscara desvanece só a última linha visível (`--slotted-code-block-collapse`), e o corte a meio de "}," na cena `collapse` é o que Carbon e Mantine desenham; registado como decisão                   |
| 5   | Tokens         | passa  | 73 propriedades lidas, todas em `code-block.tokens.json`; a escala `--slotted-code-*` (12 escopos) é do tema (commit `d300090`) e cai para `--slotted-text` sob forced-colors; um literal no contrato (`gutter digits`). A melhoria: `--slotted-code-block-tab-size` como token de família em vez de runtime.     | feita: é token de família (`tab-size: var(--slotted-code-block-tab-size, 2)`); as quatro propriedades de runtime são só as que o binding mede                                                                           |
| 6   | Padrões        | passa  | Nenhum papel na raiz (o `textbox` do Carbon recusado no contrato); corpo Scrollable Region do APG com nome e parada só ao transbordar; `wrap` é Toggle Button (`aria-pressed`); `reveal` é Disclosure (`aria-expanded`, `aria-controls`). A melhoria: Escape no bloco revelado dobrar só quando o foco está no corpo. | não — Escape dobra a partir de qualquer parte do bloco e leva o foco ao corpo, que fica com a parada de tabulação enquanto o resto transborda; o desenho §9 regista                                                                             |
| 7   | Acessibilidade | passa  | Goteira e sinais `aria-hidden` e `user-select: none`; "Copied"/"Copy failed" pelo live-announcer; `aria-busy` em loading; HTML de motor nunca entra (`<script>` são seis caracteres). A melhoria: o nome da região dizer a linguagem quando não há título.                                                | não — "Code" é o que o consumidor ouve sem título; a linguagem é `class="language-x"` e `data-language`, lidos por quem os pede; um nome "TS code" seria uma frase gerada sem tradução                                   |
| 8   | API nativa     | passa  | React: `ComponentPropsWithRef<'div'>` sem `title`, `preProps` para o `pre`, `ref` com `copy()`/`scrollToLine(n)`/`root`, `renderLine`/`renderToken`. Angular: `input()`/`model()`/`output()`, `default*` para o não controlado, `exportAs`, `ng-template[slCodeBlockLine]`, `[slCodeBlockAction]`. A melhoria: `renderToken` no Angular. | não — um template por token multiplica `ngTemplateOutlet` por cada palavra; `slCodeBlockLine` recebe a linha inteira, que é onde o Angular idiomático substitui                                                       |
| 9   | Capacidade     | passa  | 17 requisitos de base: 14 adotados ou adaptados, 3 recusados com o dono nomeado (`inline` é `prose` e `kbd`; terminal frame é `title` com um prompt no código; `disabled` não existe num bloco que ninguém edita). Sete diferenciais e as lacunas do inventário §4. A melhoria: `marks` aceitar intervalos por texto (`/regex/`). | não — Expressive Code fá-lo por marcador de texto; aqui os intervalos são linhas porque `data-line` é o que o CSS tinge, e um intervalo por texto pediria tokens por coluna                                             |
| 10  | Integração     | passa  | Ambas as tabelas de `frameworks.md` respondidas (desenho §10 e §11). Assimetria registada: `CodeBlockDefaultsProvider` no React, `provideCodeBlockDefaults()` por DI no Angular; sem forms em nenhum, porque não há valor de formulário. A melhoria: o motor do provider ser lido de forma preguiçosa.        | feita: `highlight` é uma função que o bloco só chama quando há código; um provider com `import()` dentro resolve-a na primeira chamada                                                                                  |
| 11  | Documentação   | passa  | Duas páginas com import, anatomia (17 partes), 16 cenas com legenda e código, inputs, outputs, composição, cinco frases de acessibilidade, tokens. `audit.mjs` limpo a 1280 e 620 no React, docs e story. A melhoria: a página Angular lida na imagem.                                                       | não pôde: o Storybook em :6007 responde "Unexpected token 'export'" em todas as famílias (também `timeline`) e precisa de reinício; as páginas Angular passaram `referencePageErrors`, `snippetFormatErrors` e 16 specs |

---

## §18, ponto a ponto

1. **Propósito, usos e antiusos** — desenho §1: um bloco de código com tokens
   de um motor de fora; não é `prose` (que desenha a cerca), `kbd`, um editor
   nem um terminal.
2. **Anatomia** — 17 partes no contrato, uma linha cada nas duas páginas.
3. **Contrato controlado/não controlado** — dois modelos sobre
   `@slotted/core/state`: `pressed` (`wrap`/`defaultWrap`; razões pointer,
   keyboard, programmatic) e `revealed` (`revealed`/`defaultRevealed`;
   pointer, keyboard, escape, programmatic). `onCopy`/`(copyRequest)` é um
   pedido depois do facto, com `copied` e a razão. React `on*Change(value,
   request)`; Angular `[(x)]` e `(xChangeRequest)`.
4. **Matriz de estados** — `loading` > `wrap` > `revealed` > marcas (`focus`
   esmaece o resto; `highlight`, `error`, `warning`, `add`, `remove` tingem)
   > `hover` > `focus-visible`. `loading` não desenha `copy`; `data-complete`
   dura dois segundos.
5. **Teclado, foco, ARIA** — desenho §9; testes React e Angular (Tab até ao
   corpo só ao transbordar, Enter/Space nos controles, Escape dobra e mantém o
   foco, pedido cancelado não move).
6. **Recipes** — `lineNumbers`, `marks` (6 espécies), `wrap`, `collapseAfter`,
   `maxLines`, `title`; densidade por `--slotted-code-block-font-size`.
7. **Responsivo, RTL, locale, reduced motion** — capturas `240`, `rtl`,
   `dense`, `high-contrast`; `pre` é `direction: ltr` seja qual for a página;
   o desfoque sai sob reduced motion.
8. **Loading, empty, error, extremo** — `loading` (skeletons a seis linhas,
   `aria-busy`); string vazia é uma linha numerada; erro do motor em
   `onHighlightError` com o texto puro no lugar; cena `content` com 400
   caracteres, árabe em RTL e `<script>`.
9. **SSR e desempenho** — `useId`; o motor corre em efeito e o texto puro é o
   primeiro paint; `ResizeObserver` do `scroll-area` só em efeito; o indent
   da continuação mede-se uma vez por linha.
10. **Exemplos** — 16 cenas por página, um domínio (`group.ts` de
    `@slotted/core/filter`, um diff de CSS, um log de 40 linhas).
11. **Testes partilhados** — 18 React, 16 Angular, 8 core (`code.ts`), 17
    contrato, 11 folha, 4 + 4 páginas.
12. **Estabilidade** — família nova; nenhuma quebra de contrato.

---

## O que a máquina não pôde verificar

- A página Angular na imagem (dimensão 11).
- Prism e Shiki reais: `fromPrismTokens` e `fromShikiTokens` são testados
  com as formas de token dos dois motores, não com os motores instalados.

## Fora desta família, visto durante o trabalho

- Os mesmos itens registados em `2026-09-14-filter-bar-self-assessment.md`.
