# Checkpoint — `navigation-menu` (`/reui navigation-menu` em modo `build` → `/component`)

- Plano: `.claude/skills/component/SKILL.md` passos 1–15; dossiê por `.claude/skills/reui/SKILL.md`.
- Ramo `review/implementation-pass-1`, HEAD `6ff5651c`. Nada commitado desta família.
- Outras sessões editam o tree em paralelo: renomeação `packages/tokens`→`packages/theme` e `packages/theme-default`→`packages/themes` em curso; `tools/harness/glyph.mjs` ainda lê `packages/theme-default/src/glyphs.json` e falha com ENOENT.

## Concluído

- Passos 1–2: lei lida; modo `build` (família nova).
- Passo 3: `docs/history/designs/2026-10-01-navigation-menu-capability-inventory.md`.
- Passos 4–5: `docs/history/designs/2026-10-01-navigation-menu-design.md` (APG Disclosure Navigation, tabelas de integração).
- Passo 6: `specs/components/navigation-menu/contract.{json,test.mjs}` — 12/12.
- Passo 7: `packages/styles/src/navigation-menu/navigation-menu.{css,tokens.json,harness.html}`; seis propriedades de runtime em `packages/styles/src/runtime-properties.mjs`.
- Core: `packages/core/src/navigation-menu/` (geometria, `placement`, intenção de hover, teclado) — vitest 19/19; subpath em `packages/core/package.json` e `vite.config.ts`.
- Passo 8 parcial: capturas base lidas (light/dark/hc 420, 240, dense, rtl, 720); defeitos corrigidos: consulta de contentor sem especificidade, grupos sem refluxo, posição vertical, corrente e desativado vencidos pela regra base, rodapé desalinhado, coluna sem espaço (→ `data-placement="below"`).

## Estado no gate visual (passo 9)

- Correções pedidas pelo revisor durante o passo 8: painel fora do balão e animação da troca (geometria registada com `@property` e transitada na raiz; painel recortado ao balão), divisória do nested (passa para `::before` da raiz aninhada). Cenário `tools/harness/scenarios/navigation-menu-switch.mjs` verde (linha nos dois sentidos, coluna, divisória, segundo nível dentro da raiz).
- Dossiê ReUI escrito e indexado; âmbito em `docs/process/build-order.md`; secção em `docs/component-features.md`.
- `tools/harness/build.mjs:340` apontado para `packages/themes/dist/styles.css` (renomeação de outra sessão deixou o builder no caminho antigo).
- Testes: contrato 12/12; core vitest 19/19; `packages/styles/src/*.test.mjs` 247/248 — a falha é `field-surface` em `kbd`, outra sessão.

## Passos 10–13 (depois do gate visual aprovado)

- Catálogo: `packages/core/src/i18n/messages/navigation-menu.ts`, `locales/pt-BR/navigation-menu.ts`, `catalog.ts`, `locales/pt-BR.ts`.
- Core: `clippingBox` e `measureViewport` (mede contra o ancestral que recorta); atrasos de hover aceitam função. Vitest 20/20.
- React `packages/react/src/navigation-menu/` (raiz, partes, tipos, defaults, docs, stories, testes): 24/24, typecheck limpo. Registos: `packages/react/package.json`, `vite.config.ts`, `src/index.ts`, `packages/styles/package.json`.
- Angular `packages/angular/navigation-menu/`: 19/19 antes da correção de lint; depois dela a compilação do projeto falha em `loading-overlay`, `skeleton`, `status-indicator` (outras sessões).
- Lint dos ficheiros da família limpo; prettier limpo. `check:affected` para em `format:check` por ficheiros de outras sessões. `test:i18n`: 287 violações, nenhuma desta família.
- Autoavaliação: `docs/history/designs/2026-10-01-navigation-menu-self-assessment.md`.

## Reabertura de `top-navigation` (pedida pelo utilizador, 2026-10-01)

- A `nav` da barra é raiz de `navigation-menu`; secção = `TopNavigationTrigger` + `NavigationMenuContent`; `menu` deixa de servir a secção. Desenho: `2026-09-15-top-navigation-design.md` §11.
- `navigation-menu` aceita secções portadas (painel «more»): `register`/`openPanel`, `surfaced`, ramos do dismissable layer, blur e hover.
- Angular: raiz do menu passou a diretiva (viewport criado em DOM; folha via `SlNavigationMenuList` e gatilhos); `NAVIGATION_MENU_SECTION`; `SlNavigationMenuTriggerWiring`.
- Testes: React 49/49 (duas famílias); Angular 43/43; contratos 17/17 e 12/12; folhas 262/263 (falha `kbd`, outra sessão); cenário verde; lint e prettier limpos.

## Finalização (2026-10-01)

- Gate de release: o utilizador pediu «finalize»; decisão: não commitar até a sessão de i18n commitar `packages/core/src/i18n/` (ausente de HEAD) e a migração de i18n de `top-navigation`, com que os meus hunks estão misturados.
- Páginas de referência renderizadas ainda não lidas nem auditadas (Storybooks sem reinício).

## Commits (2026-10-02)

`11a7b47b` harness · `55b5aba0` i18n (só core/react/angular i18n e as suas entradas) · `594b1502` desenho e contrato · `f4442cb5` core · `8e9c7dbb` folha e harness · `1f43aa5a` React · `04c4ddea` Angular · `b26ad8a0` top-navigation (com a migração de i18n desses ficheiros) · `fe13ec45` documentos · `b9a3a8a0` ficheiros gerados de theme.

## Próxima ação

Ler e auditar as páginas de referência de `navigation-menu` e `top-navigation` quando os Storybooks forem reiniciados.
