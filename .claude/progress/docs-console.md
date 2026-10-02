# Checkpoint — console da home do site

- Plano: `docs/history/plans/2026-10-01-docs-console.md`
- Ramo `review/implementation-pass-1`, HEAD `6ff5651c`. Nada commitado. Outras sessões editam o tree em paralelo (event-calendar, chart bindings, breadcrumb, agent-docs).

## Concluído

- Fatia 1: tooltip (React e Angular) e eixo de categorias do chart corrigidos no pacote, 6 testes novos; `event-calendar` sem `now` registrado como aberto.
- Fatia 2: `apps/docs/src/console/data.ts` reescrito (1 464 pedidos em 90 dias, 40 clientes, 48 produtos, envios, devoluções, pedidos de compra, faturas); moldura em `apps/docs/src/islands/Console.tsx` (marca, busca a um passo da marca que abre `CommandPalette`, cabeçalho e rodapé da coluna, aside `md`); `ScreenHeader.tsx` com subheading e abas; console abre em `compact`.
- Fatia 3: `Overview.tsx` (período 7/30/90, 5 indicadores com porta, receita contra período anterior, fila de exceções, funil, canais, armazéns, produtos, atividade); `ListPage.tsx` (abas com contagem, filter-bar, data-grid em `fill`, paginação, action-bar no rodapé); `OrderDetail.tsx` (passos, sentença, itens com totais, fatos, histórico).
- Fatia 4: `screens.tsx` com pedidos, envios, devoluções, estoque, pedidos de compra, faturas, clientes; `Calendar.tsx` em página própria com 15 eventos.
- Overview sobre `DashboardGrid` (12 widgets, Average order oculto no layout inicial, "Edit layout" no cabeçalho, layout em estado sem persistência); console dentro dos trilhos; coluna da home em 86rem e navegação `navSize="sm"`, grid em 1064 px a 1440 px (classe `expanded`).
- Fundo da home: raios de luz monocromáticos em canvas a 1/6 da resolução (1/3 no claro), ampliado pelo navegador, com dithering; oscilação contínua, brilho na origem, luz sob o cursor por mola amortecida (`apps/docs/src/lib/rays.ts`, `components/HomeBackdrop.astro`). 16,7 ms por quadro com compositor em software. Rejeitados: curvas de nível, shader colorido, feixe CSS estático. Hachura da faixa removida.
- Tela cheia: ilha `apps/docs/src/islands/Stage.tsx` envolve a barra de eixos e o console em `Fullscreen` (modo `auto`), botão `FullscreenTrigger` na barra; em tela cheia o console ocupa a altura restante (806 de 900 px) e o fundo é hachurado.
- Pacote, 2026-10-02: corpo do widget de `dashboard-grid` deixa de encolher o conteúdo (`flex: 1 0 auto`); `--slotted-ground` publicado por `card` e `section[data-ground='surface']`, lido por `table` e `data-grid`. Suíte de styles 1628/1630; as 2 falhas (`kbd` field fill, `cascader` mark) são de código não tocado.
- Pacote, 2026-10-02: escopos de esquema do tema (`packages/theme/src/render.ts`) — a terceira forma de raiz exige `:not([data-slotted-scheme])`; `@slotted/themes` reconstruído. Home: seções "Schemes and densities" (molduras duplas por escopo, espécime com título, ferramentas, tabela e paginação) e "Two bindings, one DOM" (fontes lado a lado, divisor, prévia + DOM numa moldura) refeitas.
- Pacote, 2026-10-02: `app-shell` — corpo do aside com recuo (`inset="none"` para dispensar) e parte `aside-resizer` com `asideExtent` (React e Angular, contrato, tokens, docs, testes). Console: `AppShellAsideResizer` no painel do pedido; destinos da navegação como âncoras com clique tratado pelo console; coluna reaberta só quando o pedido a recolheu; LP-12 por container query da página.
- Ledger: 14 linhas novas em `apps/docs/LIBRARY-FEEDBACK.md`.
- `Records.tsx` removido.

## Verificação

- `apps/docs`: `astro check` 0 erros, 0 avisos.
- `impeccable detect` sobre `src/console`, `Console.tsx`, `home.css`: nenhum achado.
- Pacotes: `vitest src/tooltip src/side-navigation` 51/51; core `src/chart-echarts` 16/16; Angular `tooltip.spec.ts` 15/15 (tsconfig isolado, ver limitação).
- Captura (cenário em scratchpad `shots.mjs`): 9 telas, pedido aberto, esquema escuro e 390×844.

## Problemas conhecidos

- `notification-center` escreve em português sem provider (padrões literais em `notification-center-defaults.tsx`); tarefa do plano de i18n, outra sessão.

- `astro build` falha antes da home: `packages/angular/dist/docs/index.md` ausente; o build Angular falha em `packages/angular/breadcrumb/src/breadcrumb.ts` (TS2345, outra sessão).
- `event-calendar` marca o hoje do relógio (1 de outubro) numa semana datada de 30 de setembro.
- A 390 px os indicadores da Overview seguem em cartões, não em linhas de lista (OV-02).

## Próxima ação

Quando a sessão do event-calendar terminar: adicionar `now?: PlainDateTime` à raiz e aos defaults em `packages/react/src/event-calendar/event-calendar.tsx` (substitui `nowDateTimeIn` e desliga o tick), paridade Angular, entrada no contrato, teste em `event-calendar.test.tsx`; depois passar `now` em `apps/docs/src/console/Calendar.tsx`.
