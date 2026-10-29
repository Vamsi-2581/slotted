# Checkpoint

- Plano: nenhum. Fila: issues GitHub com o rótulo `finding` (`gh issue list --label finding --state open`).

## Fila de findings

| # | Finding | Estado |
| - | ------- | ------ |
| 2 | tokens backdrop-filter: overlays do chart, footer do drawer | commit `a8e54300` (push, issue fechada) |
| 3 | page footer: fade suprime o blur | commit `d5bf4708` (push, issue fechada); inclui correção em `@slotted/core/presence`: `setNode(null)` a meio da saída espera um frame |
| 9 | parseMarkdown: tabelas GFM | commit `947b319c` (push, issue fechada) |
| 7 | data-grid: nome do checkbox de seleção | já respondido: coluna `rowHeader: true` (`rowLabelOf`, React e Angular, desde 2026-09-18) ; fechada com comentário |
| 8 | dialog: form à volta das partes | já respondido desde `v0.1.0-beta.9` (`ef08d483`): `<form>` filho de `DialogContent` (`display: contents`) ou `render` para form; docs nos dois frameworks ; fechada com comentário |
| 6 | data-grid server mode: agrupamento | já respondido desde `v0.1.0-beta.9`: `groupInOrder` agrupa linhas consecutivas pela ordem dada; teste `data-grid.test.tsx:396` ; fechada com comentário |
| 4 | glyph calendar no slot start do button | commit `96d3f3c7` (push, issue fechada): offset já correto desde beta.10; teste browser cobre sm/md/lg e falha com offset [0, 0] |
| 12 | glyph `pencil` | commit `edfeb3c5` push, issue fechada |
| 13 | stat-card `emphasis="whole"` | commit `0d6a6f54` push, issue fechada |
| 14 | drawer bottom sheet: entrada ultrapassa o stop | commit `c30f883f` push, issue fechada: snap desligado durante a viagem, offset inline no primeiro frame, snap desligado antes de interromper a saída |
| 5 | data-grid: `aria-busy` reestiliza todas as linhas | commit `b1b64637` push, issue fechada: custo já limitado desde beta.10 (2 e 1 elementos); teste de desempenho com controlo; harness lê o trace por stream |
| 16 | drawer bottom sheet: entrada começa à velocidade máxima | commit `cb1cf2fa` push, issue fechada: tokens `--slotted-drawer-slide-easing` (fallback standard) e `--slotted-drawer-slide-exit-easing` (fallback exit); 1.º frame 3,1 % contra 45,8 % |
| 15 | alert: AlertActions passa tom e tamanho aos botões | commit `98afe47f` push, issue fechada: `ButtonDefaultsProvider` (React) e `BUTTON_DEFAULTS_TOKEN` (Angular) no part de ações, tone = tom resolvido do alert, size = sm, variant herdado; contrato `provides.buttonDefaults` [tone, size] e `actionsPaint` |

## Estado

- Git: branch main, HEAD `4a7e40c8` (`chore(release): v0.1.0-beta.23`) = origin/main; checkpoint por commitar.
- Testes (#15): React alert unit 32/32 e browser 7/7, Angular alert 30/30, bundle Angular 11/11, contrato alert 17/17, `pnpm check` verde, CI `40777597574` verde.
- Problema aberto, não reproduzido: no telefone do utilizador, a 1.ª abertura após trocar `snapPoints` no lab foi a 100 %; Chromium 390×844 com CPU 6× e toques dá a mesma altura nas duas aberturas. Não testado: Safari iOS, barra de endereço do Chrome Android.
- Problemas conhecidos: `pnpm typecheck` incremental emite falsos erros circulares em `*.stories.tsx`; apagar `node_modules/.cache/tsc/root.tsbuildinfo`. `stash@{0}` pertence ao utilizador.
- Próxima ação: `gh issue list --label finding --state open` quando chegarem findings novos (fila vazia em 2026-10-28).

- Release `v0.1.0-beta.23`: workflow `40780722946`; os seis pacotes em `latest` = `0.1.0-beta.23`.

## Sessão 2026-10-29 (2)

Fila: #19–#26. Fatias: (1) menu #23 #24 #25; (2) form/field #22 #20 #21; (3) guideline #19; (4) select #26.

| Item | Commit | Estado |
| ---- | ------ | ------ |
| #23 #24 #25 menu: aria-labelledby no rótulo de item descrito; partes como filhos sem rótulo aninhado (React); docs/stories radio com descrição | `d39dbf9d` | push, issues fechadas |
| #20 #21 #22 form/field: `--slotted-form-section-gap`, `--slotted-form-measure`, `FormAside`/`slFormAside` (grelha a partir de 75rem, sticky), `Field width` short/medium/full | `54ff55f2` | push |
| #19 forms.md FM-18 a FM-24 | `5a5e62ea` | push, issue fechada |
| #26 select: valor "" nomeado no controlo fechado (chave de recolha `null` em vez de string vazia); spec Angular de guarda | `4d1c5030` | push, issue fechada |

- Testes: React suite completa 4376/4378 (entity-picker e dialog-presence falham só sob carga, passam isolados), Angular form+field+menu 97/97, contratos 2184/2184, agent-docs 227/227, `pnpm check` verde (typecheck após apagar `node_modules/.cache/tsc/root.tsbuildinfo`).
- Limites conhecidos: um `id` dado pelo consumidor a `MenuItemLabel` dentro de um item descrito quebra `aria-labelledby`; o aside cobre 100 filhos diretos do form (`grid-row: 1 / span 100`).
- Não feito: `pnpm demo:refresh`; exemplos visuais de `width` e `FormAside` nas páginas de docs (só props e partes documentadas).
- Fila vazia (2026-10-29). CI `40874055360` (`4d1c5030`) falhou: `form.tokens.json` listava `--slotted-page-sticky-top`, valor escrito por script (`packages/styles/src/tokens.test.mjs`); corrigido no commit seguinte.
- CI `40880476655` (`2c701ebc`) verde.
- Release `v0.1.0-beta.25` (`1098f697`): workflow `40885120929`; os seis pacotes em `latest` = `0.1.0-beta.25`.
- Próxima ação: `pnpm demo:refresh` quando pedido; `gh issue list --label finding --state open` quando chegarem findings novos.
- Problemas conhecidos: `pnpm typecheck` incremental emite falsos erros circulares em `*.stories.tsx`; apagar `node_modules/.cache/tsc/root.tsbuildinfo`. `stash@{0}` pertence ao utilizador.

## Sessão 2026-10-29 (3)

Fila: #27 #28 #29.

| Item | Commit | Estado |
| ---- | ------ | ------ |
| #27 select: `className` e `style` de `SelectTrigger` na moldura (React; Angular já no host `sl-select`) | `89feab20` | push, issue fechada |
| #28 #29 dismissable-layer: `CloseWatcher` onde existe (sem entrada de histórico, Escape com `preventDefault` enquanto houver watcher, recusa cria novo watcher); sem ele, `history.back()` decidido um task depois do fecho | `cf70f570` | push, issues fechadas |

- Testes: core dismissable-layer 50/50; React drawer unit 66/66, browser navegação 4/4 (2 falham no código anterior), select unit 74/74 e browser 1/1; React dialog/app-shell/action-sheet/alert-dialog/tour/popover/menu verdes (story tests de select expiram só sob carga, passam isolados); Angular dialog/drawer/app-shell/action-sheet 169/169; `pnpm check` verde.
- Limites: router que empilha mais de um task depois do fecho ainda é desfeito (comentário `shortcut:` em `releaseEntry`); comportamento real de `CloseWatcher` + Escape `preventDefault` não verificado em Chrome Android.
- CI `40892331309` (`8aae0443`) verde.
- Release `v0.1.0-beta.26` (`1aa4832c`): workflow `40896228832`; os seis pacotes em `latest` = `0.1.0-beta.26`.
- Próxima ação: `pnpm demo:refresh` quando pedido; `gh issue list --label finding --state open` quando chegarem findings novos (fila vazia).

## Sessão 2026-10-29 (4)

Fila: #30–#36. Fatias: (1) headers #30 #31 #32; (2) chart #36; (3) drawer sheet #33 #34; (4) group-label sticky #35.

| Item | Commit | Estado |
| ---- | ------ | ------ |
| #30 #31 #32 headers de drawer, popover e card sem a parte final: colunas por presença | `73276d29` | push |
| #36 `--slotted-chart-table-surface`, `--slotted-chart-table-header-surface` | `0e02b2cc` | push |
| #33 #34 viagem do sheet: camada do scrim animada com o painel (`data-sheet-travel`, `--slotted-drawer-sheet-dim`); footer compensado num fecho (`--slotted-drawer-sheet-travel`) | `ae5c8667` | push |
| #35 group-label sticky (select, combobox, multi-select, menu); `revealWithin` lê scroll-padding; menu reutiliza-o | `8e2d316f` | push |

- Testes: React drawer browser 27/27, card/popover/chart browser verdes, React unit drawer/card/popover/chart 156/156, core extent 61/61, Angular drawer 53/53, `pnpm check` verde (typecheck após apagar `node_modules/.cache/tsc/root.tsbuildinfo`).
- Limites: footer compensado só em viagens para 0 (fecho); viagens entre paragens não verificadas. Dim de abertura implementado, sem teste próprio.
- Release que inclua `0e02b2cc` corre `pnpm eval:agent-docs` (skill theme-app mudou).
- #35: React browser group-label 9/9 (7 falham antes), menu/select browser 15/15, React unit 257/257, Angular select/combobox/multi-select/menu 176/176, styles 1722/1722, core collection 156/156, `pnpm check` verde.
- Limites #35: com `chosen` presente o rótulo fica sob ele (mesma aresta); rótulo com duas linhas excede o scroll-padding; select com campo de pesquisa (`[data-part-list]`) sem teste browser.
- Fila vazia (2026-10-29). Não feito: `pnpm demo:refresh`, release.
- Avaliação `brand-theme` (theme-app) atende: `docs/history/evals/2026-10-29-agent-docs-chart-table.md`.
- CI `40925149492` (`e5ecaa4d`) verde.
- Release `v0.1.0-beta.27` (`96c78d0d`): workflow `40928169309`; os seis pacotes em `latest` = `0.1.0-beta.27`.
- Próxima ação: `pnpm demo:refresh` quando pedido; `gh issue list --label finding --state open` quando chegarem findings novos (fila vazia).

## Sessão 2026-10-29 (5)

Fila: #37 #38 #39.

| Item | Commit | Estado |
| ---- | ------ | ------ |
| #37 dialog: `--slotted-dialog-measure-<sm,md,lg,xl>`; sm 32rem, md form-measure + 2 × padding inline (43rem), lg 48rem, xl 56rem | `5c11180d` | push |
| #38 field: premissa incorreta (Field usa `--slotted-field-row-gap`, 6 px até às maiúsculas); fechada com comentário por decisão do utilizador | — | fechada |
| #39 tooltip: seta com o fade do conteúdo | ver `git log` | push |

- Testes: dialog browser 12/12, React dialog/alert-dialog unit 141/141, Angular dialog 56/56, contratos 2184/2184, test:docs verde; tooltip browser 1/1, React tooltip/field unit 79/79, Angular tooltip 25/25, styles raiz 270/270; `pnpm check` verde.
- Nota: o documento de teste browser não carrega os tokens de movimento; um teste que lê `animation` define `--slotted-duration-*` e `--slotted-easing-*` à mão.
- Avaliação `brand-theme` (theme-app) atende: `docs/history/evals/2026-10-29-agent-docs-chart-table.md`.
- CI `40925149492` (`e5ecaa4d`) verde.
- Release `v0.1.0-beta.27` (`96c78d0d`): workflow `40928169309`; os seis pacotes em `latest` = `0.1.0-beta.27`.
- Próxima ação: `pnpm demo:refresh` quando pedido; `gh issue list --label finding --state open` quando chegarem findings novos (fila vazia).

## Sessão 2026-10-29 (6)

Fila: #40 #41.

| Item | Commit | Estado |
| ---- | ------ | ------ |
| #41 field/field-group: espaço em texto antes do mark (React `{' '}`, Angular `&ngsp;`); `--slotted-field-mark-gap` e `--slotted-field-group-mark-gap` com padrão 0 (o espaço é a distância); harness com o espaço | `8d810e72` | push |
| #40 field-group: `kind: 'question' \| 'section'` (padrão `question`); `section` não desenha necessidade na legenda e não altera o `necessity` dado aos campos; contrato `defaults.kind`; forms.md FM (tópicos com `kind` `section`) | `8d810e72` | push |

- Testes: React unit field/field-group/checkbox/checkbox-group/radio-group/switch/text-field 206/206 (3 falham antes), Angular field/field-group/checkbox/checkbox-group/radio-group 134/134 (3 falham antes), styles 105/105, contratos field/field-group 41/41, agent-docs 137/137, `pnpm check` verde.
- Limites: distância visual label→mark passa de 0.25rem a um espaço da fonte do label (≈0.25em); sem captura visual. Nome acessível verificado só em jsdom e textContent, não no Chrome real.
- Avaliação `compose-screen` (customer-form) atende: `docs/history/evals/2026-10-29-agent-docs-forms-section-kind.md`.
- Próxima ação: `pnpm release` (beta.28) após CI verde no HEAD.
