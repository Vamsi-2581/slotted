# App shell — autoavaliação, segunda passagem

Contra `.claude/skills/component/references/rubric.md` e
`docs/component-features.md` §18. Desenho em
`2026-09-14-app-shell-redesign-design.md`; inventário revisto na §7 de
`2026-09-13-app-shell-capability-inventory.md`.

## As onze dimensões

| Dimensão                | A mudança que mais a melhorava                                                                                                          | Feita                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Ícones                  | O controlo do painel desenhar o par `panel-open`/`panel-close` virado, em vez de um terceiro glifo                                      | Sim. `aside-toggle` reutiliza o par com `scale: -1 1`; `forced-color-adjust: none` nos dois controlos; `masked-glyph.test.mjs` limpo         |
| Movimento               | A camada do painel entrar e sair com o mesmo par de easings da navegação                                                                | Sim. `translate` com `--slotted-easing-enter`/`-exit`, `visibility` em degrau; colapsa sob `prefers-reduced-motion` pela escala               |
| Responsividade          | O painel em linha a uma largura estreita não tomar a altura toda da casca                                                               | Sim. `max-block-size: 50cqb` sob `scroll="content"`, com `container-type: size` só nesse eixo; medido no Storybook a 360 px                    |
| Refinamento             | A fila de navegação a 13 px com entrelinha da escala, e a linha da conta com ar próprio                                                 | Sim, e a causa era do workbench: o reset revertia `font-size` das primitivas. Medido antes: `16px`, `Arial`; depois: `13px`, Geist            |
| Tokens                  | Publicar o tipo de uma fila, para que uma lista de produto não declare a sua própria escala                                             | Sim. `--slotted-app-shell-row-height`, `-row-font-size`, `-row-line-height`, compostos da escala de tipo; `tokens.json` regenerado              |
| Padrões                 | O segundo controlo Disclosure com `aria-controls`, `aria-expanded` e nome próprio, ligado pelo contexto                                  | Sim. `AppShellAsideToggle` / `button[slAppShellAsideToggle]`; foco volta ao controlo que abriu; teste em ambos os bindings                    |
| Acessibilidade          | O skip link do painel deixar de apontar para uma região fechada                                                                          | Sim. Escrito só com `regions.aside && asideOpen`; teste `writes no skip link to a pane the reader closed` nos dois bindings                    |
| API nativa              | O `aside` aceitar `aria-label` do consumidor e escrever o seu próprio `data-open`                                                        | Sim. `HostAttributeToken('aria-label')` em Angular, prop em React; `data-open` na região, `data-open` da raiz continua a ser a navegação      |
| Capacidade              | O painel abrir e fechar como região, em vez de ser uma coluna fixa que um `drawer` interno não consegue fechar                            | Sim. `open.aside` com `asideOpen`/`defaultAsideOpen`/`onAsideOpenChange`, `asideMode`, `openAside()`/`closeAside()`; inventário §7            |
| Integração de ecossistema | Angular: `asideOpen` como `model()` e `asideOpenChangeRequest` como `output()`; React: o handle com as duas ações novas                | Sim. `provideAppShellDefaults({ asideMode })` e `AppShellDefaultsProvider asideMode`; ambos testados                                            |
| Documentação            | Três produtos em vez de um, e uma cena por capacidade nova (`banner`, `aside`)                                                          | Sim. Dezoito cenas em cada binding; `audit.mjs` limpo a 1280 e a 620 na página React; a página Angular espera o reinício do Storybook            |

O detalhe que mudaria com mais uma hora: a coluna de estado da tabela de Aurora
a 1280 px com o painel `md` aberto rola horizontalmente dentro do seu próprio
rolador; a tabela passou a quatro colunas para o cartão a 1280 px não cortar
uma pílula ao meio. A rota ficou no painel. Feito.

## Secção 18

1. **Propósito.** A moldura exterior de uma rota. Não é uma lista de destinos
   (`side-navigation`), uma barra com marca e conta (`top-navigation`), nem
   migalhas (`page-header`). Passa a ser o dono do estado do painel secundário,
   que a primeira passagem tinha diferido para `drawer`.
2. **Anatomia.** Vinte partes: `root`, `skip`, `banner`, `brand`, `centre`,
   `actions`, `nav-toggle`, `nav`, `nav-header`, `nav-body`, `nav-footer`,
   `scrim`, `main`, `aside`, `aside-header`, `aside-body`, `aside-footer`,
   `aside-toggle`, `footer`, `layer`.
3. **Contrato.** Duas regiões sob `open`: `navOpen`/`defaultNavOpen`/
   `onNavOpenChange` e `asideOpen`/`defaultAsideOpen`/`onAsideOpenChange`, ambos
   sobre `createControllable`. Angular: dois `model()` e dois `output()` de
   pedido. Razões da navegação: `pointer`, `keyboard`, `escape`, `outsidePress`,
   `select`, `resize`, `programmatic`; do painel, as mesmas sem `select`.
4. **Matriz de estados.** `open` em duas regiões × modo resolvido
   (`inline`/`overlay`/indecidido) × `collapsedTo` na navegação. Controlos:
   `hover`, `active`, `focus-visible`; `aria-expanded` no `aside-toggle` é o
   seletor do seu próprio glifo, porque o controlo pode estar fora da região.
5. **Teclado, foco, ARIA.** Disclosure em dois controlos; Landmark Regions em
   cinco regiões; `Escape` em captura pela pilha de `dismissable-layer`; foco
   contido e devolvido ao controlo que abriu; `inert` nos irmãos da camada.
   Ordem de foco: `skip`, `banner`, `nav-toggle`, `nav`, `main`, `aside`,
   `aside-toggle`, `footer`.
6. **Recipes.** Catorze eixos por tokens. Densidade pelo tema. Seis medidas de
   fila publicadas.
7. **Responsivo, RTL, reduced motion.** `@container` a 768 px; painel em linha
   cai para baixo do conteúdo a ≤50 % da casca; `dir="rtl"` espelha a grelha e
   vira os dois glifos; capturas `rtl` e `dense` lidas.
8. **Loading, empty, error, extremo.** Cena «An empty content region»;
   rótulos alemães truncam na fila; painel fechado sem calha; barra com
   `actions` que não encolhe e `centre` que cede primeiro.
9. **SSR.** `data-nav-mode` e `data-aside-mode` ausentes até a medida;
   `useId` / sequência estável em Angular.
10. **Exemplos.** Três produtos — Aurora, Cadence, Átrio — em dezoito cenas por
    binding.
11. **Testes partilhados.** React 35 (31 comportamento + 4 histórias); Angular
    20 (16 + 4); contrato 26; estilo 15; workbench 44 + 25.
12. **Quebra de contrato.** Registada em §10 do desenho: `declined.asideOpen`
    sai; `aside` fechado passa a `display: none` (omissão aberto); `data-open`
    no `aside`; `stateModel.open` passa a conjunto.

## Provas

- Harness: `tools/harness/out/app-shell.html`; capturas em
  `tools/harness/out/app-shell-shots/` — `default` 1080 em light, dark,
  high-contrast, rtl, dense; página 420 em light, dark, high-contrast; 240
  light; foco em `nav-toggle` (dark) e `aside-toggle` (light); `rail`,
  `primary-nav` (dark), `nav-end`, `overlay`, `aside-overlay`.
- Páginas: `tools/harness/out/app-shell-pages/react-playground-v2.png`,
  `react-aside-v2.png`, `react-aside-narrow.png`, `react-rail-v2.png`,
  `react-banner-scene-v2.png`, `react-theming-v2.png`.
- `audit.mjs` React: 42 palcos, zero achados a 1280 e a 620.
- Angular Storybook em 6007 serve a história da primeira passagem (lê os
  pontos de entrada uma vez, no arranque); a página nova espera o reinício.

## O que a revisão apanhou e o código não

- A fila a 16 px era o reset do workbench, não a folha da família. A correção
  é uma cláusula `:not([class*='slotted-demo-'])`, com teste.
- A primeira passagem tinha o painel como coluna fixa; nenhum teste dizia que
  um `drawer` fechado lá dentro deixa a coluna vazia.

## Fora desta família, e não tocado

- `page-header tokens.json disagrees with its stylesheets`.
- `verify-docs-snippets`: nove ids de `segmented-control`, `splitter`,
  `toggle-group` e `action-bar`.
- `eslint`: dois `no-unused-vars` em `toggle-group`, ambos em HEAD.
