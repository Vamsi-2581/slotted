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
| 16 | drawer bottom sheet: entrada começa à velocidade máxima | commit `fix(drawer): a entrada do bottom sheet parte do repouso` push, issue fechada: tokens `--slotted-drawer-slide-easing` (fallback standard) e `--slotted-drawer-slide-exit-easing` (fallback exit); 1.º frame 3,1 % contra 45,8 % |

## Estado

- Git: branch main; HEAD = commit da #16, enviado para origin/main.
- Testes: drawer browser React 20/20, core sheet-scroll 8/8, styles drawer 2/2, agent-docs drawer 2/2, theme 105 + 111, `pnpm check` verde.
- Problema aberto, não reproduzido: no telefone do utilizador, a 1.ª abertura após trocar `snapPoints` no lab foi a 100 %; Chromium 390×844 com CPU 6× e toques dá a mesma altura nas duas aberturas. Não testado: Safari iOS, barra de endereço do Chrome Android.
- Problemas conhecidos: `pnpm typecheck` incremental emite falsos erros circulares em `*.stories.tsx`; apagar `node_modules/.cache/tsc/root.tsbuildinfo`. `stash@{0}` pertence ao utilizador.
- Próxima ação: `gh issue list --label finding --state open` quando chegarem findings novos.

- Release `v0.1.0-beta.22`: workflow `40753083259`; os seis pacotes em `latest` = `0.1.0-beta.22`.
