# Checkpoint — onda 9: `top-navigation`

## Plano

`docs/process/build-order.md`, onda 9, linha `top-navigation`. Skill `/component`,
modo novo. Sem arquivo de plano.

## Tarefas concluídas

1. Inventário: `docs/history/designs/2026-09-15-top-navigation-capability-inventory.md`.
2. Desenho: `docs/history/designs/2026-09-15-top-navigation-design.md`.
3. Contrato e teste: `specs/components/top-navigation/{contract.json,contract.test.mjs}` (16/16).
4. Glifo `--slotted-icon-bell`: `packages/tokens/src/contract.json`,
   `packages/theme-default/src/glyphs.json`, `theme.json` (gerado por `pnpm build`),
   `docs/token-foundation.md`, `scripts/verify-token-foundation.test.mjs`.
5. Folha, tokens, harness, teste de estilo em `packages/styles/src/top-navigation/`;
   registo em `packages/styles/package.json`. Testes de estilo partilhados 174/174;
   `specs/*.test.mjs` 61/61.
6. Capturas lidas em `scratchpad/shots/`: default 240/420/720/1024/1280 light;
   página inteira light/dark/high-contrast 420, light 240, dense, rtl, light e
   dark 1280; foco em link, skip e notifications.
7. React: `packages/react/src/top-navigation/` (types, defaults, root, parts,
   index, test 18/18, docs, stories, stories test 4/4); registos em
   `packages/react/{package.json,vite.config.ts,src/index.ts}`.
8. Angular: `packages/angular/top-navigation/` (defaults, root, parts,
   public-api, ng-package, spec 16/16, docs, stories, stories spec 4/4);
   `pnpm typecheck` (ng build) limpo.
9. `docs/process/build-order.md` (entrega + reabertura de `app-shell`);
   autoavaliação em `docs/history/designs/2026-09-15-top-navigation-self-assessment.md`.
10. Correção pós-revisão («tudo espremido»): primitiva `.slotted-demo-room`
    em `tools/storybook-workbench/src/workbench.css` (+ teste); cenas em
    salas de largura declarada nos dois bindings; raiz sem `padding`
    (`--_edge`); `context` ao painel em 768; procura com piso 10rem;
    `aria-current='page'` pintado como corrente. Página React lida a 1920,
    1280 (claro/escuro) e 720; `audit.mjs` a 1280 e 620 sem achados.
    Decisão da sala registada em `docs/build-briefing.md`.
11. Segunda revisão: `count` absoluto sobre o canto do sino (pendurado do
    gap abaixo de 480); `account` pílula com halo, avatar `xs` nas demos,
    harness e snippets; seletor de espaço de trabalho com o ícone no `end`
    de `button` (`slButtonEnd`). Baseline do harness recapturada.

## Tarefa em curso

Gate de release (passo 14), apresentado. Pendente: página Angular (6007 não
escuta) e a resposta do revisor; depois passo 15 (commits).

## Git

Branch `review/implementation-pass-1`, HEAD `88b572a`. Nada no índice; nada
commitado desta família. Outra sessão: `app-shell/*`, `avatar/*`, `demos/`.

## Ajustes de escopo

- `count` fica no fluxo ao lado do sino, não sobreposto: três algarismos
  alargam o controlo em vez de cobrir o sino ou o vizinho.
- Tinta de repouso dos links é `--slotted-text`; os botões de ícone ficam apagados.
- Abaixo de 480 px os gaps caem para `--slotted-space-2`; dentro da casca a
  barra segura a partir de 300 px (o gatilho e a margem da casca somam 60 px).
- Nome da conta oculto abaixo de 768 px; `context` ao painel abaixo de 768 px.
- `context`, `nav`, `actions` com `flex: 0 0 auto`; cede a `search` (10rem) e
  depois o `name` (elipse). Piso `6ch` no nome tentado e revertido.

## Problemas conhecidos

- `packages/tokens/test/resolve.test.mjs` falha em `--slotted-control-font-family`
  (Geist) antes desta sessão; não é desta família.
- `[data-ui='app-shell'] [data-part='brand']` é seletor descendente e alcança o
  `brand` desta família dentro do `banner`; contornado com
  `[data-ui='top-navigation'][data-part='root'] > [data-part='brand']`. Linha
  de reabertura de `app-shell` a escrever em `docs/process/build-order.md`.

## Próxima ação

Com o Storybook 6007 reiniciado: ler
`http://localhost:6007/iframe.html?viewMode=docs&id=components-topnavigation--reference`
a 1280 e 720, claro e escuro; `node tools/harness/audit.mjs <url>` e
`--width 620`; corrigir; depois commits por passo com caminhos explícitos
(workbench `slotted-demo-room` e glifo `bell` em commits próprios).
