# Checkpoint — rodada 13: inner controls R2 lidos pela escala interna

## Plano

`docs/build-schedule.md`, rodada 13 (bloco único). Sem arquivo de plano.

## Tarefas concluídas

1. `packages/styles/src/inner-control.test.mjs`: regra 1 exige
   `--slotted-control-inner-size-*` na largura e recusa qualquer
   `--slotted-control-height-*` (a isenção `min(` foi removida). 34/34.
2. 16 stylesheets: `min(calc(glifo + 2 * space-2), var(--_inner-size))` no
   lugar de `calc(height - bordas - ar)` (campos) ou como novo teto dentro de
   `max(target-min, …)` (alert, toast, tag, breadcrumb, tabs, toolbar, dialog,
   drawer, upload); `--_inner-size` declarado por passo de tamanho ao lado de
   cada `--_icon-size`/`--_glyph-size`. `tabs` `--_dismiss-size` (fora da lista)
   recebeu o mesmo teto.
3. 16 `*.tokens.json` regenerados; `packages/styles` 159/159;
   `verify-docs-snippets` 5/5; `verify-token-foundation` 15/15.
4. Docs: `docs/build-briefing.md` (decisão), `docs/token-foundation.md`
   (parágrafo em Control geometry), `docs/implementation-review.md` (R2 regra
   1), `docs/build-order.md` (linha "fundação (R2)" removida das reaberturas).
5. Sonda antes/depois (`scratchpad/probe.mjs`, harness HEAD vs. árvore): só
   `clear`/`reveal` de text-field, select, combobox, multi-select e tags-input
   mudam — compact 22→20 (sm 20→18), dense 20→18 (sm 18→16). As outras 21
   partes mantêm 24px pelo piso do alvo.

## Tarefa em curso

Capturas das seis combinações para as 16 famílias em `scratchpad/shots/`
(tarefa em segundo plano); leitura das capturas dense/compact das cinco
famílias que mudaram.

## Git

Branch `review/implementation-pass-1`, HEAD `71631c0`. Árvore: 16 css, 16
tokens.json, inner-control.test.mjs, 4 docs, este checkpoint. Nada no índice.

## Próxima ação

Ler `shots/{text-field,select,combobox,multi-select,tags-input}-light-dense-ltr-420.png`
e `-light-compact-ltr-420.png`; se a imagem estiver certa, commit único:
`style(foundation): os inner controls da regra R2 lidos pela escala interna do controle`.
