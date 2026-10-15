# Checkpoint — app-shell, arranjos

`current.md` pertence à faixa de correções da Nexora e não foi sobrescrito.

- Plano: `docs/history/plans/2026-09-29-app-shell-arrangements.md`
- Dossiê: `docs/history/designs/2026-09-29-app-shell-reui-dossier.md`
- Desenho: `docs/history/designs/2026-09-29-app-shell-arrangements-design.md`
- Ramo `review/implementation-pass-1`, HEAD `18cf9829`. Nada commitado desta faixa.

## Concluído

- T1 desenho.
- T2 contrato: `canvas` com `floating` e `panel`; `primary` com `main`; `separation` (`rule`, `tone`) em vez de `dividers`; parte `nav-rail`; secções `separation` e `navRail`; cenários `separation` e `navRail`. `node --test specs/components/app-shell/contract.test.mjs`: 29/29.
- T3 estilos: `--_seam` substitui `[data-dividers]`; cartão `::before` para `primary="main"` (inset, floating) e `panel`; `floating`; `panel` por padding da raiz; tom com recálculo de `--slotted-tone-secondary-subtle-{hover,active}`; `nav-rail` por `:has`; cores forçadas; `--slotted-app-shell-frame-image`, `--slotted-app-shell-tone-surface` em `app-shell.tokens.json`. `node --test packages/styles/src/*.test.mjs packages/styles/src/app-shell/*.test.mjs`: 268/268.

- T4 harness: cenas `arrangements` (24 combinações), `floating`, `panel`, `primary-main`, `nav-rail`, `dark-nav`, `frame-image`, `compact` (420, overlay e primeiro paint); `data-dividers` → `data-separation="rule"` nas seis cenas antigas. Gerador de autoria em scratchpad (não versionado). Capturas lidas: matriz light/dark/high-contrast 1080, nav-rail rtl, panel rtl, floating dense, compact 420. Specimen `tools/harness/out/specimen/app-shell-panel/`: tom Δ L 0.036 em light e dark.
- Correções do ciclo visual: `nav-header` com `box-sizing: border-box` sob `primary` nav/main; `padding-inline` de linha em `floating` e `panel`; trilho com largura + 2 recuos; `padding-inline-start` na coluna ao lado de `nav-rail`; `border-radius` na `nav` de `inset`; `::before` desligado no primeiro paint estreito.

- Cenas novas ampliadas para 1280 px, um shell por linha, 560–640 px de altura. Defeito de ferramenta partilhada corrigido: `tools/harness/build.mjs` declarava `main { display: flex }` sem escopo e o `main` do shell herdava-o; agora `body > main`, com teste em `tools/harness/build.test.mjs` (51/51). Por commitar, em commit próprio antes da família.

- Resposta ao gate (1): `flush` sem recuo inline. `--_nav-inset` e `--_nav-edges` por plano; recuo nas partes `nav-header`/`nav-body`/`nav-footer` (a regra do rodapé fica de ponta a ponta); largura fechada `rail + 2·inset + edges`, com trilho explícito `rail + edges`; `--_seam-width`; `--_edge` por plano alinha o controlo do banner às marcas (`flush`, `floating`, `panel`) e volta a `--_gutter` em camada. Testes de estilos 268/268.

- Gate visual aprovado («pode seguir com a implementação correta e demos completas e densas»).
- T5 React: `separation` em tipos, defaults, raiz (`data-separation`); `AppShellNavRail`; testes 43/43 (5 novos); `tsc` limpo.
- T6 Angular: `separation` input e defaults, `SlAppShellNavRail`, public-api; spec 27/27 com stories.
- T7 páginas: cenas `separation` e `navRail` nos dois bindings, `canvas` com quatro planos, `primary="main"`, lavagem do quadro em theming; produto `AuroraRail` (React `app-shell-demo/rail.tsx`, Angular `RAIL_NAV`/`auroraRail`); classes `.slotted-demo-rail-end`, `.slotted-demo-rail-title`, `.slotted-demo-frame-wash` no workbench; `Viewport`/`viewport()` numa sala `desktop` (1024), com `room={false}` nas duas cenas medidas estreitas. `test:contracts` 2046/2046, `test:docs` 26/26. `audit.mjs` React 1280 e 620: 0 achados (52 palcos). Angular: pendente, Storybook 6007 a servir código anterior durante a leitura.

- T8 demo: `core/shell/shell-presets.ts` (12 arranjos), `UserPreferences.shell`, página de preferências com `slRadioGroup variant="tile"` e `ShellPreview` (SVG), `ShellLayout` com eixos, regiões escuras, lavagem e trilho de módulos; specs 10/10; `ngc` limpo; `demo:refresh` feito; ledger com uma linha. Servidor :4250 reiniciado (por esta sessão, depois por outra).
- T9: `lint`, `typecheck`, `test:contracts`, `test:package-layers`, `test:release`, `test:docs` verdes. `format:check` falha em `packages/angular/alert/src/alert.ts` e `packages/styles/src/toast/toast.harness.html` (outras faixas). `turbo verify --affected`: React falha em `dialog` e `table` (outras faixas); core falha em `chart-echarts` (intermitente); Angular não compila por `@slotted/core/timeline` sem `revealFocusIndex` (outra faixa). Autoavaliação escrita.

- T10: gate de release aprovado. Commits `8a580cea` (gerador do harness), `433f4f9c` (família app-shell), `ebe32d5f` (demo Nexora + linha do ledger; nos ficheiros partilhados só as linhas desta faixa). Storybook Angular reiniciado; `audit.mjs` Angular 1280 e 620: 51 palcos, 0 achados.

## Estado

Plano concluído. Nada pendente desta faixa.

## Pendências fora desta faixa

- `side-navigation`: hover opaco quase invisível sobre o fundo rebaixado de `inset` (reabrir nessa família).
- Falhas de verificação de outras faixas no momento do fecho: `format:check` (`alert.ts`, `toast.harness.html`), React `dialog` e `table`, core `chart-echarts`, Angular sem compilar por `@slotted/core/timeline` sem `revealFocusIndex`.
