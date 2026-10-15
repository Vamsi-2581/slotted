# Checkpoint — onda 10: `aspect-ratio image`

## Plano

`docs/process/build-order.md`, onda 10, linha `aspect-ratio image`. Skill `/component`,
modo `create`, uma sessão para as duas famílias. Sem arquivo de plano.

## Tarefas concluídas

1. Passos 1–5: inventário em
   `docs/history/designs/2026-09-16-aspect-ratio-image-capability-inventory.md`;
   desenho (anatomia, derivação de `status`, tabelas de integração dos dois
   bindings, custos) em
   `docs/history/designs/2026-09-16-aspect-ratio-image-design.md`.
2. Passo 6: `specs/components/aspect-ratio/` (8 testes) e
   `specs/components/image/` (13 testes); `node --test specs/components/{aspect-ratio,image}/*.test.mjs`
   21/21. `image.axes.layout` ganhou `framed` depois da primeira captura.
3. Glifo novo `--slotted-icon-image-off` (Lucide `image-off`):
   `packages/theme-default/src/glyphs.json`, `packages/tokens/src/contract.json`,
   `docs/token-foundation.md` (tabela + parágrafo; `primitive` 110 → 111),
   `theme.json` regenerado por `node scripts/generate-icon-glyphs.mjs`;
   `pnpm build` executado. Commit próprio pendente.
4. Passos 7–8: `packages/styles/src/aspect-ratio/{css,tokens.json,harness.html,styles.test.mjs}`
   e `packages/styles/src/image/…`; `node --test packages/styles/src/*.test.mjs src/{image,aspect-ratio}/*.test.mjs`
   192/192. Capturas em
   `/tmp/claude-1000/-home-dreco-dev-slotted/9c3e61be-bef8-41c5-a1ab-584a2471d80f/scratchpad/shots/`.
   Modelos dos fragmentos e fotos SVG em `…/scratchpad/{image,aspect-ratio}.harness.tpl`,
   `…/scratchpad/photos.json` (os fragmentos em `packages/styles` são os
   formatados pelo Prettier; regenerar a partir do modelo exige `prettier --write`).

5. Passo 10: React `packages/react/src/{aspect-ratio,image}/` (42 testes com
   stories); Angular `packages/angular/{aspect-ratio,image}/` (32 com stories;
   `ng build slotted-angular` passa). Registos: `packages/react/package.json`,
   `packages/react/src/index.ts`, `packages/react/vite.config.ts`,
   `packages/styles/package.json`.
6. Ferramenta partilhada: `tools/storybook-workbench/src/scenarios.tsx` —
   `measurement` aceita `ratio` e não exige `max` para ele (teste em
   `scenarios.test.ts`). Commit próprio pendente.
7. Passo 11: quatro páginas (`*.docs.ts`, `*.stories.*`); React lidas em 6006
   a 1280 claro e 720 escuro (fotografias reais de Lorem Picsum por id fixo);
   `audit.mjs` limpo a 1280 e 620 nas duas. 6007 em baixo. Correções vindas da
   leitura: `framed` na moldura (`> *` na raiz de `image`), `overflow: clip`
   no placeholder, `data-collapse-floor` no fallback sem reserva, legendas
   fiéis às fotografias.
8. Passo 12: `pnpm check` para em `format:check` (3 ficheiros de outras
   sessões); lint falha em `otp-input`/`toggle-group`; typecheck passa;
   `test:contracts` 1740/1740; `test:package-layers` 12/12; `test:docs`
   25/25; `packages/styles` 1241/1246 (5 de outras famílias); workbench 55/55;
   tema 54/54. React e Angular completos: ver `scratchpad/{react,angular}-verify.txt`.
9. Passo 13: `docs/history/designs/2026-09-16-aspect-ratio-image-self-assessment.md`;
   `docs/process/build-order.md` com o parágrafo "Entregue".

## Tarefa em curso

Nenhuma. Família entregue: sete commits `96f146f..0db0f20` (glifo, workbench,
specs, styles, react, angular, docs). O que resta modificado em
`docs/token-foundation.md`, `glyphs.json`, `theme.json` e
`packages/tokens/src/contract.json` é o glifo `funnel` de outra sessão.

## Próxima ação exata

Nenhuma nesta família. `card`, `avatar` e `upload` leem `image` quando forem
reabertos (`docs/process/build-order.md`).
