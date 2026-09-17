# table-of-contents — checkpoint

- Plano: `.claude/skills/component/SKILL.md` (steps 1–15), escopo em `docs/build-order.md` onda 10.
- Branch: `review/implementation-pass-1`; HEAD `49ab9c8`. Nada commitado desta família.
- Modo: criar (não existia `specs/components/table-of-contents/`).

## Feito (steps 1–8)

- Inventário: `docs/superpowers/specs/2026-09-16-table-of-contents-capability-inventory.md`.
- Desenho e tabelas de integração: `docs/superpowers/specs/2026-09-16-table-of-contents-design.md`.
- Contrato e teste: `specs/components/table-of-contents/contract.json`, `contract.test.mjs` (13 pass).
- Stylesheet, tokens, harness, teste: `packages/styles/src/table-of-contents/*` (9 pass; `packages/styles/src/*.test.mjs` 170 pass).
- Capturas lidas: light/dark/high-contrast 420, light 240, dense, rtl, foco na ligação corrente e no gatilho, cena `horizontal` com `data-overflow="end"`. Em `/tmp/claude-1000/-home-dreco-dev-slotted/4f639b47-7eca-4da0-8587-8662e6ff23ce/scratchpad/shots/`.

## Feito (steps 10–13)

- Core: `packages/core/src/{outline,scroll-spy}` + registos em `package.json`/`vite.config.ts`.
- React: `packages/react/src/table-of-contents/*` (24 testes), registos nos quatro registries.
- Angular: `packages/angular/table-of-contents/*` (21 testes), `ng build` pass.
- Workbench: `api-table.tsx` chaveia por parte+nome (+ teste).
- Páginas de referência: React lida a 1280/720, audit limpo; Angular não lida (6007 parado).
- `docs/build-order.md`: entrega + duas reaberturas. Autoavaliação em `docs/superpowers/specs/2026-09-17-table-of-contents-self-assessment.md`.

## Em curso

- Step 14: gate de release. Aguardar resposta do revisor.

## Próxima ação exata

1. Incorporar a resposta do gate de release.
2. Commits por passo, ficheiros explícitos (step 15): (a) workbench `api-table.tsx` + `data-tables.test.tsx`; (b) core `outline` + `scroll-spy` + registos; (c) contrato + inventário + desenho; (d) styles (css, tokens, harness, test) + `packages/styles/package.json`; (e) React + registos; (f) Angular; (g) build-order + autoavaliação + checkpoint.

## Problemas conhecidos / decisões pendentes de outrem

- `page-header` e `section` nomeiam `anchor-nav` em `deferTo`; a família entregue chama-se `table-of-contents`. Ficheiros de outras famílias — levantado no gate.
- `prose` dá `scroll-margin-block-start` sem `--slotted-page-sticky-top`; a família compensa ao rolar; reabertura a registar em `docs/build-order.md`.
