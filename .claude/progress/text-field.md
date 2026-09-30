# Checkpoint — `text-field` (reconstrução ReUI, fila de entradas 1/4)

- Plano: `docs/history/designs/2026-09-30-text-field-rebuild-design.md`; dossiê `2026-09-30-text-field-reui-dossier.md`; autoavaliação `2026-09-30-text-field-self-assessment.md`.
- Ramo `review/implementation-pass-1`. Nada desta família commitado.

## Concluído

Passos 1–13. Gate visual aprovado ("ok").

- React `packages/react/src/text-field/`: `TextFieldAction`, `busy`, `caps-lock`, `copy`, `loading`, `onValueCopy`, rótulos novos; 36/36.
- Angular `packages/angular/text-field/src/`: `SlTextFieldAction`, `[loading]`, `copyable`, `(valueCopy)`, Caps Lock no input; as specs de comportamento passaram antes da edição das histórias.
- Glifo `caps-lock`: `packages/theme-default/src/glyphs.json`, `theme.json` (só o bloco `caps-lock`), `packages/core/src/glyph/glyphs.ts`, `packages/tokens/src/contract.json`, `docs/token-foundation.md` (linha e contagem 116), `scripts/verify-token-foundation.test.mjs`.
- Testes partilhados: `text-scale.test.mjs`, `touch-target.test.mjs`.
- `audit.mjs` React 1280/620 sem achados.

## Bloqueios externos

- Storybook Angular 6007 não carrega as histórias novas: precisa de reinício (pedir autorização).
- `ng test` e `pnpm typecheck` falham em `field.spec.ts`/`field-group.spec.ts`/`field.test.tsx` (`requiredMark`, outra sessão).
- `prettier --check` falha em `filter-bar` e `menu.css` (outras sessões); `field-surface.test.mjs` falha em `kbd` (commit `2e39b9d4`, outra sessão).

## Próxima ação

Gate de lançamento (passo 14). Depois da aprovação: commits do passo 15 — primeiro o glifo (ficheiros de glifo e tokens), depois a família, com caminhos explícitos e `git apply --cached` para o bloco `caps-lock` de `theme.json`, de `docs/token-foundation.md` e de `docs/history/designs/README.md`.
