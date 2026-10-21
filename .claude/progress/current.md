# Checkpoint

- Plano: `docs/history/plans/2026-10-21-equori-owner-review.md` (18 findings do equori, beta.7).
- Branch: main. Release `v0.1.0-beta.9` publicado (tag em `52a769d8`; workflow Release run 39640824963).
- Working tree: fatia 1 sem commit (dialog, core focus, page; React e Angular) + plano e checkpoint.

## Concluído
- Fatia 1: itens 2 e 4 corrigidos; item 5 parcial (ver plano, tabela Resultado).
- Fatia 2: item 3 corrigido no React.

## Testes
- React: dialog 144/144, page 17/17, toolbar/tabs/accordion/data-grid/menu/radio-group 282/282; tsc 0.
- Core: 2214/2214; tsc 0.
- Angular: dialog 55/55, page 14/14.
- React data-grid: unit 92/92, browser 1/1; tsc 0.
- eslint e prettier dos arquivos alterados sem erros.

## Em curso
- Fatia 3: item 1 concluído.
- Fatia 4: itens 6, 7, 8 concluídos.
- Fatia 5: itens 17, 9, 14 (API) concluídos.
- Fatia 6: itens 18, 11, 12, LP-17 concluídos (agent-docs 214/214; sem `pnpm eval:agent-docs`, que pertence ao release).
- Fatia 7: itens 13, 15, 16, 10 concluídos (agent-docs verify 214/214).
- Verificação final: `pnpm check` exit 0; core 2 221/2 221; React unit 4 123/4 123; styles 1 692/1 692; harness 112/112; Angular 3 241/3 241 (suíte completa depois do item 1) e specs das famílias tocadas depois; agent-docs 214/214. Desenho aprovado pelo usuário: atributo-chave; exigência do usuário: custo de estilo imperceptível, incluir bucket universal.
  - Medição (Chromium do vitest, DataGrid 50×7, 1 889 elementos, `style.setProperty`+`offsetHeight`): sem CSS 90 ms; CSS atual 451 ms; CSS com chave 112 ms. Benchmark descartável em `packages/react/src/__bench/recalc.browser.test.tsx`.
  - Passos: (1) CSS-fonte `[data-part=v]`→`[data-part-v]`, `[data-ui=v]`→`[data-ui-v]` (minúsculas); (2) DOM: chave ao lado de cada `data-part`/`data-ui` estático (React JSX/objetos, Angular templates/host), helpers para dinâmicos (core `setPart`); (3) guarda nos setups de teste: exatamente uma chave `data-part-*`/`data-ui-*` igual ao valor; (4) bucket universal (506 seletores); (5) benchmark de estilo com orçamento.

## Problemas conhecidos
- Item 1 exige desenho de arquitetura de seletores antes da implementação.
- Item 5: recalc da subárvore herdada permanece; depende do item 1.

## Estado do item 1
- Concluído (ver plano). Verificação: React unit 4 118/4 118; styles 1 692/1 692; Angular 3 241/3 241; core 2 214 (4 intermitentes em chart-echarts sob carga, 23/23 isolados); perf 1/1; eslint/prettier sem erros. Em execução: React `--project browser` e Angular typecheck (log `scratchpad/browser1.log`).

## Próxima ação exata
Nenhuma no plano. Pendentes de decisão do usuário: `pnpm eval:agent-docs` sobre o conteúdo publicado na beta.9 (pulado a pedido) e `pnpm demo:refresh` nos demos.
