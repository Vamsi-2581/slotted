# Autoavaliação — `side-navigation`

Contra `.claude/skills/component/references/rubric.md` (onze dimensões) e
`docs/component-features.md` §18. Escrita antes do gate de release, em 15 de
setembro de 2026.

Evidência: harness `tools/harness/out/side-navigation.html`; capturas em
`/tmp/claude-1000/-home-dreco-dev-slotted/2824ed19-c571-4265-a61a-411694d119f4/scratchpad/shots/`;
testes `specs/components/side-navigation/contract.test.mjs` (16),
`packages/styles/src/side-navigation/side-navigation.styles.test.mjs` (7),
`packages/react/src/side-navigation/side-navigation.test.tsx` (19),
`packages/angular/side-navigation/src/side-navigation.spec.ts` (13),
`packages/core/src/text/text.test.ts` (8), e as duas specs de páginas de
referência (4 + 4).

## As onze dimensões

| # | Dimensão | Estado | A mudança que mais a melhoraria | Feita |
| - | -------- | ------ | ------------------------------- | ----- |
| 1 | Icons | O chevron é a máscara `--slotted-icon-chevron-right`, pintado em `currentColor` com `forced-color-adjust: none`; fechado aponta na direção de leitura, aberto para baixo, espelhado em RTL (`hybrid` rtl). A marca de cada destino é do consumidor. | Um ponto na marca desenhado como máscara `--slotted-icon-dot` em vez de um `::after` circular. | Não: o ponto é um círculo de 6 px sem tinta a preservar; uma máscara acrescentaria um token lido por uma regra. |
| 2 | Motion | Quatro movimentos, cada um num token (comentário de `item` na folha): trilho `0fr → 1fr` em `medium`; filas do grupo entram em `short` com um passo de atraso e saem antes de o trilho dobrar; chevron um quarto de volta em `medium`, a duração do trilho; o `item` empacota os trilhos no início (`align-content: start`) — medido, o trilho `auto` esticado tomava o espaço livre a meio da transição e a fila saltava de 34 para 60 px; chão e tinta em `control-transition-duration`, press em `instant`; flyout na regra R7 (`overlay-motion.test.mjs`). O rótulo a sair para a calha não anima: a largura da região é o que anima. | Um `@starting-style` no grupo movido para o flyout, para que as filas entrem também ali. | Não: a camada já entra por `slotted-side-navigation-enter-from-start`; uma segunda entrada dentro dela seriam dois movimentos para uma mudança. |
| 3 | Responsiveness | Contentor próprio (`slotted-side-navigation`, `inline-size`), consulta a 96 px literal comparada ao contrato pelo teste de estilo; a 240 e a 420 a coluna é a mesma; a 50 px é a calha (`compact`). | Um segundo passo entre 96 e ~140 px que dobrasse `count` e `end` no ponto antes de cortar o rótulo. | Não, e a decisão está no contrato (`truncate.priority`): a única parte que encolhe é o rótulo, e uma coluna de 96–140 px não é uma largura que um produto entrega. |
| 4 | Refinement | Filas em 34/28/26 px por densidade; marca na coluna da casca; título de secção na tinta da marca; guia sob o centro da marca ou na aresta do texto do pai; contadores tabulares alinhados à coluna do chevron; descrição com folga de 2 px e tinta própria na fila corrente; foco por anel interior. `text-box: trim-both cap alphabetic` no rótulo, na descrição, no contador e no título de secção, sob `@supports`, com o meio-entrelinha devolvido em `padding-block`: a caixa que o trilho centra é simétrica à volta da tinta, e as versais ficam no centro da marca (medido a 300 %: 1 px mais abaixo em `md`, o que o revisor lia como «mais para cima»). Lido em light, dark, high-contrast, dense, rtl, 240, com foco, e a 300 %. `actions` com um passo de ar antes e depois; título de secção com 4 px de margem sobre a primeira fila, porque com a fila corrente os dois chãos ficavam a um pixel. | O ponto do contador em compacto sentado 1 px mais para dentro do quadrado da marca. | Sim: `inset-block-start`/`inset-inline-end` em `--slotted-space-2`, lido no `compact` dark com foco. |
| 5 | Tokens | 79 propriedades lidas, 30 da família com recurso na fundação; as seis de `app-shell` com recurso na escala de controlo; sem literal fora dos isentos (`tokens.test`, `fallbacks.test`). | `--slotted-side-navigation-flyout-min-measure` composto de um passo de espaço em vez de `12rem`. | Não: `12rem` é uma medida, como `--slotted-tooltip-measure: 18rem`, e a escala de espaço não tem um passo de 192 px. |
| 6 | Patterns | Disclosure Navigation Menu with Top-Level Links, transcrito: onze teclas com fonte, foco e veredito (`contract.keyboard`, desenho §4); `Space` num link é a única partida, escrita com o custo; papel nenhum, o DOM do exemplo. | A tecla `*` do tree para abrir todos os irmãos. | Não: é do padrão treeview, que o próprio APG recusa para navegação. |
| 7 | Accessibility | `nav` nomeado ou `div` na casca; `aria-current` só no `link`; `aria-expanded`/`aria-controls` no `trigger` e `aria-labelledby` do grupo e do trigger híbrido; `aria-disabled` com `href` mantido; grupo fechado em `visibility: hidden`; rótulo em compacto por `clip-path`; nome inteiro em `aria-label` no corte pelo meio; tooltip por hover, foco visível e press-and-hold. | Anunciar pelo `live-announcer` «Entregas, aberto» quando um grupo abre por teclado. | Não: `aria-expanded` já muda no botão focado e é lido; um anúncio seria duplicado (§2.8). |
| 8 | Native API | React: `ComponentPropsWithRef<'a' \| 'button' \| 'ul' \| 'li' \| …>` estendido; `render` em catorze partes; handlers compostos, `preventDefault` recusa. Angular: diretivas nos elementos do consumidor, `routerLink` no mesmo `a`, `aria-current` do router lido por `HostAttributeToken`, `model()` nos três valores. | `render` no `indicator`. | Não: é uma máscara sem conteúdo; um consumidor que quer outra marca esconde-a por CSS. |
| 9 | Capability | 17 partes, 8 eixos, 3 modelos de estado; inventário com 31 linhas de table stakes, 6 diferenciadores, 8 lacunas; o item de comando como `button` acrescentado no gate. | A ligação do flyout ao híbrido em compacto (hoje o trigger híbrido some). | Não, escrito em `compact.hybrid`: a marca é o link e os filhos chegam pela rota. |
| 10 | Ecosystem integration | React: par controlado/não para os três valores, provider, `render`, `ref` com handle (`focus`, `expand`, `collapse`, `root`), `useId`, estados no DOM, tipos nativos. Angular: `model()`, `provideSideNavigationDefaults`, `exportAs` em cinco, projeção, signals sem `markForCheck`, `DestroyRef`, `HostAttributeToken` para `aria-label` e `aria-current`, entry point `@slotted/angular/side-navigation`. Sem `ControlValueAccessor`: não é um controlo de formulário. Assimetria registada: Angular não tem `default*`. | Ler `SlAppShellNav` também para virar o flyout para `inline-start` quando `navSide="end"`. | Não: o `positioner` vira por `flip` quando não há espaço em `inline-end`, que é o caso de uma coluna na aresta final. |
| 11 | Documentation | Duas páginas com importação, anatomia de 17 linhas, 17 cenas com legenda e fonte, 19 entradas, 4 saídas, composição, 6 frases de acessibilidade, DOM e tema. React lida renderizada a 1280 em light e dark e a 620 (`audit.mjs`: 28 palcos, nenhum colapsado, nenhum a transbordar); `size` e `content` passaram a uma coluna por cena, porque a 200 px uma coluna de destinos não se lê. Angular: o Storybook reiniciado ainda não escutava em 6007 treze minutos depois; a página fica por ler. | Ler a página Angular e correr o `audit.mjs` nela. | Pendente do Storybook Angular. |

## §18 — critérios de pronto

1. **Propósito, usos e antiusos.** Coluna de destinos de uma aplicação;
   secundária numa página; calha. Não é barra horizontal (`top-navigation`),
   nem navegação inferior, nem drill-down (`command-palette`), nem árvore de
   dados (`tree`). Inventário §2, `declined` no contrato.
2. **Anatomia.** 17 partes estáveis, `data-ui`/`data-part`, elementos em
   `element`.
3. **Contrato controlado/não controlado e razões.** `value`, `expanded`,
   `flyout`; cada pedido com `previous`, `reason`, `source`, `cancel()`.
   Razões: `expanded` pointer/keyboard/select/escape/programmatic; `flyout`
   + outsidePress/blur/resize; `value` pointer/keyboard/programmatic.
4. **Matriz de estados.** `current` (link; item pai só fechado ou compacto),
   `expanded`, `open` (flyout), `disabled`, hover, active, focus-visible.
   Precedência: disabled > current > active > hover; hover e active guardam-se
   por `:not([data-disabled])` e `:not([data-current])`.
5. **Teclado, foco, ARIA, toque, leitor.** Tabela de onze teclas; foco
   devolvido ao trigger no Escape; tooltip por press-and-hold no toque; DOM
   do exemplo APG sem papéis. Não verificado nesta máquina: um leitor de ecrã
   e um ecrã tátil — o que se verificou em seu lugar foram os atributos no DOM
   nos 32 testes de comportamento.
6. **Recipes por tokens.** `size` em três passos, densidade pela escala de
   controlo, esquemas pela fundação, 30 tokens da família.
7. **Responsivo, RTL, locale, reduced motion.** Contentor próprio a 96 px;
   propriedades lógicas e chevron espelhado; strings em `messages`; os quatro
   movimentos colapsam pela query do tema.
8. **Loading, vazio, erro, desativado, conteúdo extremo.** `skeleton`;
   vazio recusado (`declined.empty`); erro não se aplica; `disabled` por
   item; cena `content` com cinco cortes.
9. **SSR, desempenho, virtualização.** Ids por `useId`/fábrica; compacto
   decidido pela folha antes do script; um `ResizeObserver` por coluna;
   virtualização recusada (`declined.virtualization`).
10. **Exemplos.** 17 cenas por binding, num produto (Aurora Logística); a
    casca em `shell`; as demonstrações de `app-shell` reescritas sobre a
    família.
11. **Testes partilhados.** Os mesmos 13 comportamentos nos dois bindings,
    mais 6 só em React (render, handle, provider composto).
12. **Changelog e migração.** Família nova: sem quebra. As demonstrações de
    `app-shell` perdem `NavItem`/`NavGroup` (`app-shell-demo/shared.tsx`),
    que não eram API pública.

## Decisões tomadas sem o revisor

- Flyout composto do núcleo, mantido (Ant, UI5); `compactAt: 96`;
  `useAppShellIfPresent()` exportado de `app-shell` (seis linhas).
- `truncate: end | middle | none`, omissão `end`; `@slotted/core/text` novo.
- Fila de comando como `button[slSideNavigationLink]` / `SideNavigationLink`
  sem `href`.
- Aresta do item corrente em `--slotted-border-subtle`.
- Razão de um irmão fechado sob `multiple=false`: a do gesto que abriu o
  outro, porque o pedido carrega o conjunto inteiro.

## O que esta máquina não verificou

Leitor de ecrã, ecrã tátil, as páginas de referência renderizadas (Storybooks
sem a família até reiniciarem), e o `pnpm check:full` com a outra sessão a
escrever.
