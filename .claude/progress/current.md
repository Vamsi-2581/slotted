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
- Release pedida pelo utilizador após CI verde. Eval `customer-form --runs 1`: atende (`docs/history/evals/2026-10-29-agent-docs-forms-layout.md`).
- Próxima ação: CI verde no HEAD (`gh run list --branch main --limit 1`), depois `pnpm release --dry-run`, `pnpm release`, `gh run watch` do workflow `release.yml`, verificação dos seis pacotes com `npm view`.
- Problemas conhecidos: `pnpm typecheck` incremental emite falsos erros circulares em `*.stories.tsx`; apagar `node_modules/.cache/tsc/root.tsbuildinfo`. `stash@{0}` pertence ao utilizador.
