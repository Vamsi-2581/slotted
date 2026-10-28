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

## Estado

- Git: branch main, HEAD `b1b64637` = origin/main. Nenhuma issue aberta.
- Árvore: só este ficheiro alterado.
- Testes: core 2249 (2 timeouts de chart sob carga, passam isolados), React unit 4186/4186 após ajuste de 3 testes, page browser 5/5, Angular 3284/3284 + bundle 11/11, styles chart/drawer/page 21/21, `pnpm check` verde.
- Problemas conhecidos: `pnpm typecheck` incremental emite falsos erros circulares em `*.stories.tsx`; apagar `node_modules/.cache/tsc/root.tsbuildinfo`. Load average ~30 (outras sessões) causa timeouts nos testes de chart do core. `stash@{0}` pertence ao utilizador.
- Próxima ação: `gh issue list --label finding --state open` quando chegarem findings novos. Limite conhecido: o harness de trace ainda pode perder `Tracing.tracingComplete` (1 em 17 execuções observadas); falha em 10 s com mensagem.
