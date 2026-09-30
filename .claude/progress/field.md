# Checkpoint — `/reui field build`

- Plano: `docs/history/designs/2026-09-30-field-label-row-design.md` (desenho) e `docs/history/designs/2026-09-30-field-reui-dossier.md` § 8 (delta).
- Ramo `review/implementation-pass-1`, HEAD `e929273f`. Nada commitado. Outras sessões editam o tree em paralelo.

## Concluído

- Passos 1–8 de `/component`: dossiê, desenho, contratos `field` e `field-group` (41/41), `field.css`, harness (cenas `header`, `header-side`, `help`, `necessity` com `optional`, página com a altura do controlo), `inner-control.test.mjs` com `field` › `help`, `field.tokens.json`, `field.styles.test.mjs` (25/25), `data-required-mark` → `data-necessity` nos harness de outras famílias e em `field-group.css`.
- Estilos partilhados: única falha `field-surface.test.mjs` em `kbd` (outra sessão).

- Passo 9 aprovado ("ok").
- Passo 10: React (`FieldHeader`, `FieldHelp`, `FieldIndicator`, `FieldAction`, `necessity`, `helpLabel`, `necessityMark`, contador em `aria-describedby`) e Angular (`field-header.ts`: `slFieldHeader`, `button[slFieldHelp]` com `SlTooltip`/`SlTooltipTrigger` como hostDirectives, `slFieldIndicator`; `slFieldAction` em `field-parts.ts`; marcadores abstratos em `field-defaults.ts`), `field-group` nos dois. Testes de comportamento: React 40/40, Angular 41/44 (3 falhas = páginas de referência).

- Passo 11: páginas de referência nos dois bindings (cena `header`, anatomia, eventos, API da ajuda); primitivo `.slotted-demo-measure[data-width='drawer']` (280 px) em `tools/storybook-workbench` com teste; `audit.mjs` sem achados em 6006/6007 a 1280 e 620.
- Passo 13: `docs/history/designs/2026-09-30-field-self-assessment.md`.

- Passo 12: `pnpm check` passa; `turbo verify --affected` falha só em `field-surface.test.mjs` (`kbd`, outra sessão). Workbench 59+50; React completo 3650/3653 e Angular 2826/2829, falhas fora da família (`dialog` volta da plataforma, `table` intervalo de tempo, snippet `text-field` password).

## Em curso

- Passo 14: portão de lançamento — à espera do revisor.

## Próxima ação

Depois da resposta: commit 1 = `tools/storybook-workbench/src/workbench.css` e `workbench.styles.test.mjs`; commit 2 = restantes ficheiros desta família (lista em `git status`, sem `packages/styles/src/menu`), caminhos explícitos, `git add … && git commit` num só comando.
