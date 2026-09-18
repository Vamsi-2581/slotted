# Checkpoint — rodada 18: `otp-input`

## Plano

`docs/process/build-schedule.md`, rodada 18, bloco `otp-input`. Skill `/component`,
modo `create`. Sem arquivo de plano.

## Tarefas concluídas

1. Passos 1–5: inventário em
   `docs/history/designs/2026-09-16-otp-input-capability-inventory.md`;
   desenho em `docs/history/designs/2026-09-16-otp-input-design.md`.
2. Passo 6: `specs/components/otp-input/{contract.json,contract.test.mjs}` (14/14).
3. Passos 7–8: `packages/styles/src/otp-input/{otp-input.css,otp-input.tokens.json,
   otp-input.harness.html,otp-input.styles.test.mjs}`; styles + shared tests 196/196.
   Capturas em
   `/tmp/claude-1000/-home-dreco-dev-slotted/f8a9818c-0485-4eb0-b917-dff9e02133ed/scratchpad/shots/`.

4. Passo 9: gate visual aprovado ("ok, e eu quero demos com contexto, bem fieis").
5. Passo 10: `packages/core/src/otp/` (14/14; entrada `./otp` em package.json e
   vite.config), `packages/react/src/otp-input/` (37/37 com stories),
   `packages/angular/otp-input/` (25/25 com stories). Registos: styles/react
   package.json, react vite.config e index.ts.
6. Passo 11: docs + stories nos dois bindings, telas reais (Nexora). React
   lida a 1280 claro / 720 escuro; audit limpo a 1280 e 620. Angular: 6007 em
   baixo, não lida.
6a. Correções pós-gate: arrasto do carácter selecionado recusado (`dragstart`,
   `-webkit-user-drag`, `::selection` fill); piso de largura da caixa
   (`0.6 × altura`); cenas `stack` → `block`; botão em `slotted-demo-row`.
7. Passo 12: `pnpm check` — só falhas fora da família. `turbo verify` em curso.
8. Passo 13: `docs/history/designs/2026-09-16-otp-input-self-assessment.md`;
   `docs/process/build-order.md` com o parágrafo "Entregue".

## Tarefa em curso

Passo 15: commits feitos (contrato, styles, core, react, angular, docs,
autoavaliação). Família concluída.

## Git

Branch `review/implementation-pass-1`, HEAD 805d1a2. Nada desta família commitado.

## Próxima ação

Nenhuma nesta família. Pendente fora dela: ler a página Angular quando o 6007
subir (`node tools/harness/audit.mjs "http://localhost:6007/iframe.html?viewMode=docs&id=components-otpinput--reference"`).
