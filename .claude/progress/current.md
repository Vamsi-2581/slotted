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

## Seleção de linhas no data-grid (validada pelo utilizador)

- Desenho: uma corrida de linhas selecionadas é um bloco. Chão = `accent-border` 20 % sobre a superfície (hover 28 %); medido no tema default: 1,30 (claro) e 1,29 (escuro) contra a página, 1,16/1,20 contra a listra; borda `accent-border` acima (sombra de 1 regra sobre a régua da linha anterior) e abaixo (régua própria); réguas internas e aresta das zonas fixas = `--_selected-rule` (borda 30 % sobre o chão; 1,42 claro, 1,65 escuro); bordas e sombra entram na transição da linha; tinta = a da linha. Sem barra lateral (R1, `state-rail.test.mjs`). `plain`: só o chão. `framed`: a última linha cede a borda à moldura.
- Correção incluída: células fixas e seletor de linha selecionada herdam o chão da linha (antes ficavam no chão em repouso durante o hover).
- Tokens novos: `--slotted-data-grid-row-border-color-selected`; sai `--slotted-tone-accent-subtle-hover`. `contract.ts` regenerado.
- Ficheiros: `packages/styles/src/data-grid/data-grid.css`, `data-grid.tokens.json`, `packages/theme/src/generated/contract.ts`, `packages/react/src/data-grid/data-grid.stories.tsx` (story `SelectionLab`), `data-grid.browser.test.tsx` (teste "selected rows", falha contra HEAD).
- Testes: styles 1722/1722, data-grid browser 8/8, `pnpm check` verde.
- Lab: Storybook em `0.0.0.0:6006`, `?path=/story/components-data-grid--selection-lab`.
- Angular: linhas irmãs diretas do corpo (`ng-template #bodyRow`), seletores `+` válidos.
- Próxima ação: `git push` quando o utilizador pedir; `gh issue list --label finding --state open` para a fila.
