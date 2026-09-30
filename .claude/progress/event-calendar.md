# Checkpoint — /reui event-calendar (polish + build)

`.claude/progress/current.md` pertence a outra sessão; este ficheiro é o desta.

- Plano: `docs/history/designs/2026-09-29-event-calendar-reui-dossier.md` § 8 (13 linhas) e "Portão e aplicação".
- Ramo `review/implementation-pass-1`, HEAD `f698e7b7`. Nada commitado por esta sessão.
- Não tocar nem commitar: `tools/harness/build.mjs`, `build.test.mjs` (outra sessão); erros de typecheck em `packages/react/src/upload/` (outra sessão).

## Feito (árvore, não commitado)

- Linhas 1–9 e 11 (polish): `packages/styles/src/event-calendar/event-calendar.css`, `event-calendar.tokens.json`, `event-calendar.styles.test.mjs` (novo), `specs/components/event-calendar/contract.json` (`literals.tintHover`).
- Linha 10: `tools/harness/specimen.mjs`, `specimen.test.mjs`.
- Linha 12 (`canDrop`): núcleo `nextAllowedPlacement` (+ testes); contrato (`editing.canDrop`, `canDropShape`, `data-drop-invalid`, label `dropInvalid`, efeitos de Alt+setas) e `contract.test.mjs`; CSS `data-drop-invalid`; cena `editing` da harness; React (types, defaults, context, event, component, 3 testes, docs, story); Angular (defaults, view, component, 3 specs, docs, story).
- Docs: dossiê com portão e recaptura; linha no `docs/history/designs/README.md`; linhas ReUI no inventário `2026-09-24-event-calendar-capability-inventory.md`.

## Testes

- Núcleo 49/49, React event-calendar 38/38, Angular event-calendar 24/24, contrato 19/19, estilos da família 6/6, varrimentos 21/21, `specimen.test.mjs` 9/9.
- `pnpm check:affected` (antes da linha 12) parou no typecheck de `upload` (outra sessão).
- Bateria `scratchpad/verify.sh`: formato, lint, typecheck (fora de `upload`), estilos 1561/1561, `test:contracts`, `test:docs`, harness, núcleo, React 38/38, Angular 24/24 — todos verdes.
- Páginas de referência não lidas renderizadas (Storybook não levantado).

## Próxima ação

Portão de entrega apresentado. Depois da resposta: `git add` dos caminhos listados na mensagem do portão e um commit; `docs/history/designs/README.md` leva também a linha `app-shell` de outra sessão.
