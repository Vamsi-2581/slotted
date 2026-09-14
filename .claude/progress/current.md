# Checkpoint — `/component app-shell`, segunda passagem

## Plano

`.claude/skills/component/SKILL.md`, quinze passos, modo **rebuild**. Desenho em
`docs/superpowers/specs/2026-09-14-app-shell-redesign-design.md`; inventário
revisto na §7 de `2026-09-13-app-shell-capability-inventory.md`.

## Git

Branch `review/implementation-pass-1`, HEAD `a2a9026`. Árvore suja: toda a
família app-shell da primeira passagem está por commitar, mais as alterações
desta passagem.

## Passos concluídos

1–5. Lei, modo, inventário (delta), padrão (inalterado), desenho (documento).
6\. Esquema partilhado: `stateModel[capacidade]` aceita conjunto nomeado
(`specs/contract.schema.mjs`, 4 testes novos); workbench `apiMetadataErrors`
percorre o conjunto (`scenarios.tsx`, 1 teste). Contrato app-shell reescrito:
partes `centre`, `aside-header/body/footer/toggle`; eixo `asideMode`;
`stateModel.open.{nav,aside}`; `published` com seis tokens; 26 testes.
7\. Stylesheet: tokens de fila publicados, `centre`, painel com cabeçalho/
corpo/rodapé, painel como camada, `aside-toggle`; `actions > *` não encolhe.
15 testes de estilo. `tokens.json` regenerado. Harness reescrito: seis cenas
com três produtos sobre a geometria publicada.
8\. Capturas lidas: default 1080 light/dark/hc/rtl, 420 light (página), rail
1080, primary-nav dark 1080, nav-end 1080. Imagem certa.
9\. Gate visual — utilizador delegou («pode seguir sozinho»); registado.
10\. Bindings: React (31 testes) e Angular (16 testes) compilam e passam.

11\. Workbench: reset exclui `slotted-demo-*` (teste), primitivas de fila sobre
os seis tokens publicados, `bar-search`, `bar-crumbs`, `bar-wordmark`,
`pane-fields`, `pane-form`, `pane-title`, `viewport[data-frame='window']`;
44 testes. Demos React em `app-shell-demo/` (shared, aurora, cadence, atrio);
docs e histórias React e Angular com dezoito cenas. `audit.mjs` React limpo a
1280 e 620. Angular Storybook reiniciado; `audit.mjs --deadline 120000` limpo a 1280 e 620 (41 palcos).
12\. `format:check` limpo; `lint` limpo nos caminhos da família (dois erros
pré-existentes em `toggle-group`); `typecheck` limpo; `test:contracts` 1478;
`test:docs` com nove ids de outras famílias; styles 1095 (+ `page-header`
pré-existente); workbench 53 + 44; React completo 2348/2348; Angular completo 1767/1767.
13\. Autoavaliação em `docs/superpowers/specs/2026-09-14-app-shell-self-assessment.md`.

## Tarefa em curso

Nenhuma: os onze commits do passo 15 estão feitos (f9237c4…acd549a).

## Próxima ação executável

Nenhuma nesta família. Revisão humana ao vivo em 6006 e 6007.

## Fora desta família

`page-header tokens.json disagrees with its stylesheets` — pré-existente.
