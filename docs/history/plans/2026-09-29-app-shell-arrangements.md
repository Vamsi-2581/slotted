# Plano — `app-shell`, arranjos (terceira passagem)

- Dossiê: `docs/history/designs/2026-09-29-app-shell-reui-dossier.md`
- Desenho: `docs/history/designs/2026-09-29-app-shell-arrangements-design.md`
- Skill: `/component app-shell` em modo rebuild, alimentado por `/reui app-shell build`.
- Decisões aprovadas: `canvas` = `inset | flush | floating | panel`; `primary` = `banner | nav | main`; `dividers` → `separation` = `rule | tone`; parte `nav-rail` nesta passagem; token `--slotted-app-shell-frame-image`; demo com predefinições de planos base, regiões escuras, trilho duplo e quadro pintado.

## Fatias

| Fatia | Tarefas | Termina em |
| ----- | ------- | ---------- |
| 1 | T1 desenho; T2 contrato e teste; T3 folha de estilos, tokens e teste de estilos | `node --test` do contrato e dos estilos verdes |
| 2 | T4 cenas do harness e ciclo visual | gate visual (passo 9) |
| 3 | T5 binding React e testes; T6 binding Angular e testes | testes dos dois bindings verdes |
| 4 | T7 páginas de referência e `audit.mjs` | páginas lidas a 1280 e 720 |
| 5 | T8 demo: predefinições, página de preferências, `nav-rail` no shell, `demo:refresh`, ledger | spec do shell e do store verdes |
| 6 | T9 `pnpm check:affected`, autoavaliação; T10 gate de release e commit | gate de release |

## Tarefas

- **T1.** `docs/history/designs/2026-09-29-app-shell-arrangements-design.md`: pintura dos planos, geometria de `primary="main"`, passo de tom, anatomia e comportamento de `nav-rail`, camada `frame-image`, quebras de contrato.
- **T2.** `specs/components/app-shell/contract.json` e `contract.test.mjs`: eixos, parte, token, cenários `arrangements` e `navRail`.
- **T3.** `packages/styles/src/app-shell/app-shell.css`, `app-shell.tokens.json`, `app-shell.styles.test.mjs`.
- **T4.** `packages/styles/src/app-shell/app-shell.harness.html`: cenas `floating`, `panel`, `primary-main`, `tone`, `nav-rail`, `dark-nav`, `frame-image`; capturas do passo 8; specimens.
- **T5.** `packages/react/src/app-shell/*`: tipos, `AppShellNavRail`, defaults, testes.
- **T6.** `packages/angular/app-shell/src/*`: inputs, `SlAppShellNavRail`, `provideAppShellDefaults`, testes.
- **T7.** `*.docs.ts` e stories dos dois bindings; `tools/harness/audit.mjs`.
- **T8.** `demos/nexora/angular`: `UserPreferences.shell`, catálogo de predefinições, grupo de rádio com miniaturas SVG, `ShellLayout` com eixos, esquema por região e trilho de módulos; `LIBRARY-FEEDBACK.md`.
- **T9.** `pnpm check:affected`; autoavaliação em `docs/history/designs/2026-09-29-app-shell-arrangements-self-assessment.md`.
- **T10.** Gate de release; commits por passo com caminhos explícitos.
