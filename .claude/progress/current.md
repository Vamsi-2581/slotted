# Checkpoint

- Entrada: `/home/dreco/findings.v2` (32 achados do equori sobre beta.10). Sem ficheiro de plano: o agrupamento e a ordem abaixo são o plano.
- Branch: main. Base `2a73d2a9` (chore(release): v0.1.0-beta.10).

## Agrupamento por família

Numeração = ordem do bloco no ficheiro de entrada. O bloco 17 é substituído pelo 33 ("amended list"); total 32.

| Família | Achados |
| --- | --- |
| material/backdrop (page-header, command-palette, page/detail-panel footer, toast, dialog, theme) | 1 PageHeader material quando stuck; 4 CommandPalette material; 6 footer de Page/DetailPanel como material; 23 toast backdrop-filter; 5 dialog: transição de opacidade vs backdrop-filter; 7 `--slotted-material-backdrop` por esquema |
| page-header | 8 transição do ground em `plain`/`floating`; 32 PageHeaderActions `placement` |
| docs | 2 Section `sticky` / Page `ground` (`--slotted-page-ground`); 21 drawer: default de `size` em duas formas; 33 (substitui 17) data-grid: props comparadas por identidade |
| spinner | 10 máscaras `data:` sob CSP; 11 animação SMIL no main thread; 12 tokens públicos `--slotted-spinner-arc/track` |
| data-grid | 16 `messages`/renderers inline re-renderizam todas as linhas; 29 `tree` inline idem; 24 load-more com ancestral que rola; 25 resizer da última coluna transborda; 3 `resizeMode="deferred"` |
| drawer | 19 arrasto do bottom sheet re-renderiza; 20 estado `data-expanded`; (21 em docs) |
| detail-panel | 13 + 14 count do DetailPanelSection fora do heading (tratados juntos) |
| app-shell | 15 AppShellFooter perde o ref com `render` |
| tabs | 18 marcador por transform |
| button | 26 rótulo quebra dentro da palavra |
| action-bar | 27 abaixo de 24rem empilha e esconde o overflow |
| toolbar | 28 nome do overflow em inglês fixo |
| theme | 9 `themeConformance` `thresholds.layerStep`; (7 em material) |
| guidelines | 22 LA-03 para todo título + regra do footer action-bar; 30 LP-12 vs LP-14 |
| agent | 31 compose-screen, passo Done e regra de identidade do data-grid |

O pedido cita "quatro de Spinner"; o ficheiro tem três blocos de Spinner (10, 11, 12).

## Ordem de execução (fatias de até três achados)

1. 1, 4, 23 — material: PageHeader, CommandPalette, toast
2. 6, 5, 7 — material: footers, dialog, token por esquema
3. 8, 32, 2 — page-header e docs de `--slotted-page-ground`
4. 10, 11, 12 — spinner
5. 16, 29, 33 — data-grid identidade de props (código + docs)
6. 24, 25, 3 — data-grid load-more, resizer, resize deferred
7. 19, 20, 21 — drawer
8. 13+14, 15 — detail-panel count, app-shell footer ref
9. 26, 27, 28 — button, action-bar, toolbar
10. 22, 30, 9 — guidelines e themeConformance
11. 31, 18 — agent compose-screen, tabs

## Tabela de entrega

| Achado | Decisão | Commit | Validado em equori | Divergência da proposta |
| --- | --- | --- | --- | --- |
| Feature — page-header family, material ground when stuck. | corrigir como proposto | `1d1e528d` | sim | O pill mantém a superfície opaca: metade dele fica abaixo da raiz, fora do alcance do filtro. |
| Improvement — command-palette family, material surface. | corrigir com outra forma | `205acdb1` | sim | Só o token `--slotted-command-palette-backdrop-filter`; prop `material` recusada: a necessidade é do tema, que já escreve `--slotted-command-palette-surface` e `--slotted-command-palette-footer-surface`. |
| Improvement — toast: add --slotted-toast-backdrop-filter, as page-header has --slotted-page-header-backdrop-filter. | corrigir como proposto | `53a39311` | sim | — |
| Feature — page and detail-panel families, footer as a material. | corrigir com outra forma | `24a6a7e9` | sim | Tokens como propostos; sem troca do fade pelo translate: medido no Chromium, a opacidade do próprio elemento não suprime o seu filtro (contraste 136 contra 137 com opacidade estática), só a de um ancestral (255). Prop `material` em Page/DetailPanel recusada: o tema já escreve os quatro tokens. |
| Bug — dialog family, content enter/exit transition vs. backdrop-filter. | corrigir com outra forma | `77699cc9` | sim | Sob `surface="plain"` a parte `content` fica opaca e os filhos fazem o fade; painel pintado ganha `--slotted-dialog-backdrop-filter` e mantém o próprio fade (a opacidade própria não suprime o filtro). Sem transição de `blur(0)`. |
| Improvement — token --slotted-material-backdrop, per-scheme value. | corrigir com outra forma | `c4731353` | sim | O token passa de `base` a `scheme` (obrigatório em cada esquema, como `--slotted-surface-material`), sem default em `base`. Tema padrão: claro `saturate(1.8) blur(6px)`, escuro `saturate(1.6) blur(20px)`, alto contraste `none`. |
| Improvement — PageHeader, variant "plain" (and the stuck state of "floating"). | corrigir com outra forma | `fec78992` | sim | Só `background-color` na transição; a sombra do `floating` fica sem transição, pelo motivo do contrato (sombra a desaparecer sobre a área que reabre é artefacto). |
| Improvement — page-header: a toolbar of actions under a rich title on a narrow header. | corrigir com outra forma | `922780ef` | sim | Sem a prop `placement`: o comportamento `auto` passa a ser o da família por CSS (`:has`), e um título rico inclui o visual, como na LA-03; `title-row` e `own-row` recusados por não haver necessidade declarada. |
| Improvement — docs for Section `sticky` and Page `ground`. | corrigir como proposto | `5e6ba92f` | não aplicável | O exemplo entra na cena `hosts` do detail-panel (onde está o `scroll="self"`), não numa cena nova. |
| Bug — Spinner family, mask images. | corrigir com outra forma | `d34d0727` | sim | O anel passa a SVG inline no span (46 lugares, React e Angular) traçado por CSS, sem imagem nenhuma. Medido: sob a CSP o anel some (não vira quadrado); o Button de texto com movimento permitido mostra a faixa e esconde o anel, por isso o teste emula movimento reduzido. |
| Bug — Spinner family, animation. | corrigir com outra forma | `d34d0727` | sim | Causa medida (screencast com o main thread bloqueado 2 s): 0 frames antes, 101 depois; calibração com `rotate` em CSS: 102. O giro é `rotate` na caixa (compositor); o dash continua no main thread e congela sob carga. Medida em `tools/harness/scenarios/spinner-busy.mjs`, não em `vitest.perf`: o CDP do vitest corre no main thread bloqueado. |
| Improvement — Spinner tokens. | recusar | — | não aplicável | Sem imagens para substituir: o anel não usa mais `--_arc`/`--_track`, e a CSP fica resolvida na própria família. |
| Bug — data-grid: inline `messages`, `renderGroup` or renderer props re-render every mounted row. | corrigir como proposto | `e65fbf36` | sim | `useMessages` (partilhado por todas as famílias React) compara textos por valor e chama funções pela versão mais recente; renderers lidos por ref, as linhas respondem à presença e aos ids de coluna dos `cellRenderers`/`editorRenderers`. |
| Bug — data-grid: an inline `tree` object re-renders every row. | corrigir como proposto | `e65fbf36` | sim | — |
| Improvement — docs: data-grid props whose identity invalidates every row (amended list). | corrigir com outra forma | `5a8fd36d` | sim | Com 16 e 29 corrigidos, a lista medida passou a `columns`, `disabledKeys` e `rowKey` função (30 linhas re-renderizadas cada); renderers, `messages` e `tree` saem da lista. A regra entra em "Rules" (a geração não tem secção "Performance"). A verificação recusa essas três props inline nos exemplos. Substitui o bloco 17. |
| Bug — data-grid: the last column's resizer overflows the frame and adds a horizontal scroll. | corrigir com outra forma | `bab841e5` | sim | O resizer já ficava dentro da linha para `:last-child`; a causa medida é o cabeçalho de pop-in depois da última coluna (colunas com `priority`). O seletor passa ao último cabeçalho de coluna. |
| Bug — data-grid: scroll-triggered load-more fires until hasMore is false when the grid does not scroll. | corrigir como proposto | `71d10caa` | sim, com efeito no equori | A marca observada cobre da linha `length - loadMoreThreshold` até o fim do corpo (um ponto era saltado por um scroll até o fim). Também no Angular. Sem `IntersectionObserver` (jsdom) a grelha não pede sozinha: 3 testes de `transactions-page.test.tsx` do equori dependiam do pedido da página 2 no mount em jsdom e passam a precisar de um stub do observer. |
| Improvement — data-grid family, pointer column resize. | corrigir como proposto | `c9f69177` | sim | Também no Angular, que ganha Escape durante o arrasto (restaura em `live`). O anúncio de largura existente é só do teclado; o release não anuncia. |
| Bug — docs: drawer's default size is stated two ways. | corrigir com outra forma | `dbf0a70b` | sim | A verificação já existia (`referencePageErrors` compara cada default do contrato com a linha de props, por membro: 742 linhas React e 474 Angular, 0 divergências); o contrato passa a dizer o default por lado e ela passa a falhar até as duas tabelas o dizerem. A tabela de eixos escreve como frase um default que não é valor do eixo. |
| Bug — drawer: dragging a bottom sheet re-renders the drawer and relayouts it on every pointer move. | corrigir com outra forma | `4e0ffb40` | sim | A posição vai para `--slotted-drawer-extent` no layer em píxeis (o tamanho muda, não um `transform`: um transform não faz o sheet crescer acima do tamanho atual); medido 59 renders antes, 0 depois, e 0 leituras de layout. Também no Angular. |
| Feature — drawer: a state for a bottom sheet that reached the top of the screen. | corrigir com outra forma | `a245f1d9` | sim | `data-expanded` quando a extensão é o layer inteiro (1), não `maxExtent`: um `maxExtent` abaixo de 1 deixa espaço acima. O grabber fica (é o separador focável do teclado). Também no Angular. |
| Improvement — detail-panel: DetailPanelSection count renders inside SectionHeading. | corrigir como proposto | `b2f25275` | sim | Tratado junto com o seguinte: a contagem vai para `SectionTags`. Também no Angular. |
| Bug — detail-panel/section: the count badge is misaligned with the uppercase section heading. | corrigir como proposto | `b2f25275` | sim | Medido 0,99 px antes e ≤ 0,5 px depois, só com a mudança para `SectionTags`. |
| Bug — app-shell: AppShellFooter drops its ref when render is given. | corrigir como proposto | `44563699` | sim | A causa é o helper `part()` partilhado: todas as partes e a raiz da shell perdiam o ref com `render`. O tipo do ref nas props de `render` é `RefCallback`, para caber no spread de qualquer elemento. |
| Bug — button: a label that does not fit breaks inside a word. | corrigir com outra forma | `7ce63271` | sim | `nowrap` por omissão, como proposto; o rótulo multi-linha opt-in é recusado (sem necessidade declarada). Um botão segurado mais estreito que o rótulo pelo contentor (`max-inline-size: 100%`) corta com reticências em vez de derramar o texto. |
| Bug — action-bar: below 24rem every action stacks and the overflow control is hidden. | corrigir com outra forma | `0ff056dc` | sim | Sem a prop `narrow`: a composição decide — com `ActionBarOverflow` a barra mantém uma linha e dobra; sem ele empilha como antes. Quantas ações dobram depende da largura dos rótulos (no teste em inglês, uma). |
| Bug — toolbar: the overflow control's default name is hard-coded English. | corrigir com outra forma | `a8be9044` | sim | Famílias `toolbar` e `actionBar` no catálogo com plural ICU e pt-BR; sem prop `messages` nova: a sobreposição por instância continua a ser `label`, e a global o catálogo do `SlottedProvider`. Também no Angular. |
| Improvement — @slotted/theme/conformance, themeConformance. | corrigir como proposto | `027d820d` | sim | — |
| Improvement — guideline: actions that do not fit on a phone, under any title and in a form's footer. | corrigir com outra forma | `394f3131` | não aplicável | LA-03 fica `SHOULD` (o processo das guidelines não deixa mudar o nível sem retirar o id); a regra do rodapé é LA-07 `MUST`. Texto sem nomes de binding (exigido pelo teste de conteúdo). A avaliação `pnpm eval:agent-docs` fica para o release. |
| Improvement — guideline: LP-12's phone layout and LP-14's windowing contradict for a paged or long list. | corrigir com outra forma | `15dd870d` | não aplicável | Com o achado 24, o próximo pedido já é contra o scroller da página; o janelamento contra um ancestral não existe, por isso LP-12/LP-14 dizem que abaixo de 600 px a grelha não janela e a loja vem em páginas. O "interim" proposto (`hasMore` só a partir de 600) é dispensado. A avaliação fica para o release. |
| Improvement — agent: compose-screen's Done step measures only region switches. | corrigir com outra forma | `ff0dffc3` | não aplicável | "Montar no máximo duas telas" contradiz LP-12 abaixo de 600 px (uma página de 30 linhas são 2,5 telas de 667 px): o critério passa a "não mais linhas que a janela ou as páginas pedidas". "Custa várias vezes mais" troca-se pela medida de LP-14 (93 ms contra 160 ms). Em Compose ficam só as props ainda comparadas por identidade (medidas no achado 33). A avaliação fica para o release. |
| Bug — tabs: the marker transitions layout properties and drops its animation under main-thread work. | corrigir com outra forma | `22a22a75` | não | FLIP em vez de `scaleX` permanente: em repouso o marcador fica por `left`/`inline-size` (raio intacto) e a troca de aba anima `translate` e `scale` de volta a zero; medido com o main thread ocupado 300 ms: 0 frames antes, 13 depois. O cenário `tools/harness/scenarios/tabs-marker.mjs` foi atualizado e não corrido: o seu `launch()` abre o Chrome com `--remote-debugging-port`. |

## Concluído
- Fatia 1: achados 1, 4, 23.
- Fatia 2: achados 6, 5, 7.
- Fatia 3: achados 8, 32, 2.
- Fatia 4: achados 10, 11, 12.
- Fatia 5: achados 16, 29, 33 (+17).
- Fatia 6: achados 25, 24, 3.
- Fatia 7: achados 21, 19, 20.
- Fatia 8: achados 13+14, 15.
- Fatia 9: achados 26, 27, 28.
- Fatia 10: achados 9, 22, 30.
- Fatia 11: achados 31, 18.

## Estado git
- Branch main, HEAD `22a22a75`. Árvore: só o trabalho do usuário e este ficheiro. Árvore: só o trabalho do usuário (ver Problemas conhecidos) e este ficheiro.

## Em curso
- Nada. Verificação final interrompida a pedido do usuário (custo de tokens).

## Testes
- Fatia 1: React page-header unit+detail-panel 54/54, browser page-header 4/4, command-palette 5/5, toast 3/3; Angular page-header+detail-panel 47/47; styles 1707/1707; contratos page-header 70/70; theme vitest 99/99; agent-docs skills+content 70/70; `pnpm check` verde.
- Fatia 2: React page browser 3/3, dialog+command-palette browser 14/14; styles 1708/1708; contratos dialog 30/30; theme vitest 101/101, node 109/109 (proof regenerado com `UPDATE_PROOF=1`); themes 92/92; `pnpm check` verde.
- Fatia 3: React page-header browser 6/6, unit section+detail-panel 36/36; Angular section+detail-panel 31/31; styles page-header 35/35 + motion/tokens; agent-docs guidelines+content 77/77; `pnpm check` verde.
- Fatia 4: React unit de 16 famílias com anel 681/681, browser 12/12 (inclui `button-csp`); Angular de 17 famílias 510/510; styles 1708/1708; cenário `spinner-busy` verde (101 frames distintos); `pnpm check` verde.
- Fatia 5: React unit completo 4135/4135; data-grid unit 102/102, browser 3/3; `pnpm check` verde.
- Fatia 6: React data-grid unit 102/102, browser 7/7; Angular data-grid 90/90; styles data-grid 39/39; contratos data-grid 23/23; `pnpm check` verde.
- Fatia 7: React drawer unit 61/61, browser 2/2 (+ dialog 10/10); Angular drawer 51/51; contratos drawer 46/46; agent-docs render 22/22; `pnpm check` verde.
- Fatia 8: React detail-panel unit 21/21, browser 2/2; app-shell 64/64; Angular detail-panel 19/19; `pnpm check` verde.
- Fatia 9: React button browser 4/4, action-bar browser 1/1 e unit 24/24, toolbar+action-bar+page-header+detail-panel unit 109/109; Angular toolbar+action-bar 39/39, action-bar 16/16; core i18n 38/38; `test:i18n` 0 violações; `pnpm check` verde.
- Equori (fatia 9): igual às fatias 6 a 8 (867/871; mesmas 4 falhas).
- Fatia 10: theme node 110/110, themes conformance 41/41; agent-docs 137/137; `pnpm check` verde.
- Equori (fatia 10): igual às fatias 6 a 9 (867/871; mesmas 4 falhas).
- Fatia 11: agent-docs 137/137; core indicator 6/6; React tabs unit 42/42, browser tabs+page-header 7/7; Angular tabs 33/33; styles tabs+motion+logical 35/35.
- Equori (fatia 8): igual às fatias 6 e 7 (867/871; mesmas 4 falhas).
- Equori (fatia 7): igual à fatia 6 (867/871; mesmas 4 falhas).
- Equori (fatia 6): web-build e web-static verdes; web-test 867/871 — `manifest.json` (local) e 3 testes de `transactions-page.test.tsx` que esperavam a página 2 no mount em jsdom (ver achado 24).
- Equori (fatia 5): web-build e web-static verdes; web-test 870/871, só `manifest.json` (local de equori).
- Equori (fatia 4): web-build e web-static verdes; web-test 870/871, só `manifest.json` (local de equori).
- Equori (fatia 3): web-build verde; web-static falha só em `src/ui/speed-dial.test.tsx` (ficheiro não rastreado de equori, sem o módulo); web-test 856/858 — `manifest.json` (local de equori) e `account-form-page` por timeout, re-executado 11/11.
- Equori (fatia 2): `make web-check` — web-build e web-static verdes; web-test 856/858: `manifest.json` (alteração local de equori) e `account-form-page` por timeout de 15 s sob carga, re-executado à parte 11/11.
- Equori (fatia 1): `make web-check` — web-build e web-static verdes; web-test 735/736: a falha é `src/testing/document.test.ts > manifest.json`, com `web/public/manifest.json` alterado localmente em equori (alheio ao slotted); 7 ficheiros sem worker por timeout, re-executados à parte: 122/122.

## Problemas conhecidos
- `pnpm check:full` (5.ª execução, HEAD `b9c4e8fb`): gates, styles, theme, core, agent-docs e storybook-workbench verdes; React 4140/4141 — `select.stories.test.ts > opens on a story of its own` excedeu 5 s com React e Angular a verificar em paralelo, e passa isolado (6/6). Angular verify e `test:perf` sem resultado registado.
- Fatia 11 sem validação em equori.
- Equori: 3 testes de `transactions-page.test.tsx` precisam de um stub de `IntersectionObserver` em jsdom (achado 24); `manifest.json` falha por alteração local de equori.
- O cache incremental do typecheck (`node_modules/.cache/tsc/root.tsbuildinfo`) produziu 207 erros falsos (TS7022/TS2502 nos stories) depois de mudanças em `*.tokens.json`; sem o cache, 0 erros. Contorno: apagar o ficheiro.
- Trabalho do usuário fora desta tarefa, não commitado: `CONTRIBUTING.md`, `package.json` (`sync:equori`), `scripts/sync-consumer*.mjs`.

- `pnpm check:full` fica para o fim da tarefa: os achados 7 (contrato de tokens, compilador do tema) e 1 (contrato da família) são transversais.

## Próxima ação exata
`pnpm exec turbo run verify --filter @slotted/angular` e `pnpm --filter @slotted/react test:perf`, uma vez cada; depois `pnpm sync:equori` e `cd ../equori && make web-check`.
