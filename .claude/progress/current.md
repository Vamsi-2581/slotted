# Checkpoint

- Plano: nenhum (findings avulsos da equori, em fila).

## Fila de pedidos

| # | Pedido | Estado |
| - | ------ | ------ |
| 1 | Release `v0.1.0-beta.20` | publicada: workflow `40626675656` |
| 2 | date-picker: segmentos cortados como item flex ao lado de um Select | refeito em `fefa608d`: `inline-size: 100%` volta aos roots, com `flex-basis: content`; a remoção da beta.20 fazia select e date-picker não preencherem um Stack alinhado ao início |
| 3 | button: `IconButtonLink` | concluído em `v0.1.0-beta.20` |
| 4 | docs chart: `aria-label` nomeia o plot sem `title` | React em `v0.1.0-beta.20`; Angular em `b4454b18` |
| 5 | chart Angular: plot sem `title` não recebia o `aria-label` do host | concluído em `b4454b18` (input `aria-label`, spec, docs, teste agent-docs) |
| 6 | controlos de campo com `inline-size: 100%` como item flex | concluído em `fefa608d`: 19 roots com `flex-basis: content`; teste `packages/react/src/controls-flex.browser.test.tsx` (19 casos) |
| 7 | alert: banner page de várias linhas | teste em `f46ac78c`: ação e dismiss na primeira linha |
| 8 | tag: variante `dashed` | concluído em `b81032aa` (contrato, tipos, CSS, docs, stories, teste browser) |
| 10 | theme: tamanho base do texto na raiz do tema | concluído em `00339869`: `font-size`/`line-height` do passo md em `[data-slotted-theme]`; teste `packages/react/src/theme/theme-text.browser.test.tsx` (falha antes, 16px contra 14px); snapshot `proof.css` regenerado |
| 11 | drawer: bottom sheet nos tokens de slide | concluído em `4c73ed37`: scroll salta para o stop, transform do painel em Web Animations leva o desvio a zero; teste browser (100ms, viagem ≤ 150ms, sobe e desce), linha nas docs React e Angular com teste agent-docs |
| 12 | CI vermelho em `c6a87cba`: snippet Angular do chart fora do formato | corrigido em `6c882bda` |
| 9 | equori: subir para a nova beta e remover contornos | em curso noutra sessão (árvore da equori com 77 ficheiros alterados, não tocada) |

## Estado

- Git: branch main; HEAD sincronizado após o push deste checkpoint.
- Testes: Angular 3284/3284, React unit 4186/4186, core 2247/2247, agent-docs 227/227, drawer browser 17/17, `pnpm check` verde.
- Problemas conhecidos: `pnpm typecheck` incremental emite falsos erros circulares em `*.stories.tsx`; apagar `node_modules/.cache/tsc/root.tsbuildinfo`. `stash@{0}` (pre-button-family-integration-2026-08-30) pertence ao utilizador e foi aplicado por engano e revertido; continua na lista.
- Próxima ação: esperar CI verde no HEAD (`gh run list --branch main --limit 1`), `pnpm release --dry-run`, `pnpm release`, `gh run watch <id>`, verificar os seis pacotes com `npm view @slotted/<p>@0.1.0-beta.21 dist-tags --prefer-online`.
