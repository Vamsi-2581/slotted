# Checkpoint — site de documentação oficial

- Plano: `docs/history/plans/2026-10-01-docs-site.md`. Desenho: `docs/history/designs/2026-10-01-docs-site-design.md`.
- Produto e superfície: `apps/docs/PRODUCT.md`; brief `apps/docs/.impeccable/surfaces/apps-docs-src-pages-index-astro.md` (direção da fatia 2 rejeitada; reescrever).
- Ramo `review/implementation-pass-1`, HEAD `12117f87`. Nada commitado. O tree tem alterações de outras sessões.

## Concluído

- Fatia 1 (tarefas 1–3): registro, scaffold Astro 7, runtime React (`render` no build, `hydrateRoot` ao ficar visível), `Example.astro`.
- Fatia 2 (antecipada, tarefas 5–6 parciais): coleção `components` (`field.mdx`, 8 exemplos React com `TextField`/`Textarea`), rotas por coleção, layout `Docs.astro` (navegação, artigo, `TableOfContents`), header com `CommandPalette`, `SegmentedControl` de framework (Angular desabilitado), menu de esquema, `Drawer` de navegação abaixo de 64rem, menu de eixos por preview (`PreviewAxes`), esquema inicial pelo sistema sem flash.
- Home provisória (`src/pages/index.astro`, `src/islands/ProductScreen.tsx`, `src/styles/home.css`).
- `server.allowedHosts: ['devserver.local']`.
- Logo e favicon inventados removidos; marca = texto `SITE_NAME` (`src/lib/site.ts`).

## Feedback do usuário sobre a home e o frame (bloqueante)

1. Visual genérico, "cara de AI": manchete grande + tela à direita, fundo pontilhado com brilho, títulos de efeito.
2. Logo inventada (removida).
3. Demo fraca: precisa ser um **app completo navegável** e denso — shell real (top nav + side nav com grupos e dezenas de itens, notificações, command palette), várias telas (dashboard com gráficos, data grid com seleção/ordenação/colunas/saved views, detail panel, calendário).
4. `Field` na seção de eixos rejeitado; usar componentes onde densidade e esquema se veem (tabela, toolbar, listas, menus).

Referências de identidade: **Stripe Docs** e **Tailwind docs** (além do reui). Processo escolhido: implementar direto, sem mockups.

## Fatia 3 — defeitos de estilo e de biblioteca (concluída)

1. **Bordas extras nos inputs e estilos divergentes do Storybook.** Causa: as folhas das famílias (`@layer slotted.components`, importadas do código-fonte) chegavam antes de `tokens/dist/styles.css`, que declara a ordem; `slotted.components` ficava abaixo de `reset`/`tokens`/`theme`. Correção: `<style is:inline>@layer slotted.reset, slotted.tokens, slotted.theme, slotted.components, docs;</style>` como primeiro filho de `<head>` em `apps/docs/src/layouts/Base.astro`. Pacote publicado não afetado (`dist` usa `@slotted/react/styles.css`, que abre com a ordem; ADR 0001).
2. **Busca quebrada / atalho em várias linhas.** Causa: `Shortcut` no slot `end` do `Button`, que tem tamanho de ícone (14 px). Correção: o atalho no rótulo, padrão de `command-palette.docs.ts:420`.
3. **`IconButton` como trigger não compilava** com `exactOptionalPropertyTypes`. Causa: `IconButtonAccessibleName` exigia exatamente um atributo de nome (`never` no outro). Correção no pacote (`packages/react/src/button/button.types.ts`): pelo menos um. Teste novo em `icon-button.test.tsx` (falhou antes, passa depois; mantém `@ts-expect-error` para botão sem nome). `split-button-parts.tsx:131` mantém o cast: lá o nome vem de props opcionais.
4. **Contorno no `[data-ui='text-field'] > [data-part='input']` ao focar.** Causa: `:focus-visible { outline }` global em `site.css`, camada `docs`, acima de `slotted`. Correção: o anel de foco do site restrito aos links do próprio site (`:where(...)`). Cenário `pw/input-states.mjs` (repouso, hover, foco em todos os inputs de `/react/components/field/` e `/`): passa.

5. **"On this page" vazio até muito scroll.** Causa (pacote): `TableOfContents` media o vazio por `links.current.size`, preenchido em efeitos; o HTML do servidor saía com `data-empty` (`display: none`) e a coluna só aparecia após hidratação (`client:idle`, tardia em dev). Correção em `packages/react/src/table-of-contents/table-of-contents.tsx`: antes do registro, vazio = o que a lista recebeu (`items.length`, `children` presentes, `outline` lido). Testes SSR novos em `table-of-contents.test.tsx` (2 falharam antes; 27/27 depois). Binding Angular não afetado (`computed` sobre `entries`).
6. **Destaque some no começo do scroll.** Regra documentada de `@slotted/core/scroll-spy` (`scroll-spy.ts:136-144`): fora do topo e antes do primeiro alvo, nada é atual. Correção na página: entrada `Overview` (`h1#overview`) no índice; `PageToc` com `client:load`. Cenário `pw/toc.mjs`: sem JS, 9 links visíveis; com JS, exatamente um atual de 0 a 5700 px.

## Fatia 4 — redesign (concluída)

- Referências medidas no código-fonte: Tailwind docs (cabeçalho 56 px; grid `18rem | 2.5rem hachura | conteúdo | 2.5rem hachura`; hachura 315° a 10 px; nav em lista com fio à esquerda; h1 30/500; corpo 16/28; código em moldura escura dupla) e Stripe docs (neutros, um acento, raios 4/8/10). Contrato de direção reescrito em `apps/docs/.impeccable/surfaces/apps-docs-src-pages-index-astro.md`.
- Frame das docs reescrito (`site.css`, `Docs.astro`): só seletores de classes do site; regras globais `box-sizing` e `code` removidas. Código em `.docs-code` com `data-slotted-scheme="dark"`. Dev toolbar do Astro desligada.
- Home reescrita (`index.astro`, `home.css`): folha de desenho com trilhos e fios de largura total; console no faixa hachurada; "Schemes and densities" com tabela de envios (`src/home/AxisSpecimen.tsx`); "Two bindings, one DOM"; índice das 121 famílias.
- Console navegável (`src/islands/Console.tsx`, `src/console/*`): AppShell + TopNavigation (busca, NotificationCenter em Popover, menu de conta), SideNavigation com grupos, contagens e badges; telas Overview (4 StatCard, 2 Chart ECharts, Timeline, List), Orders (FilterBar + DataGrid com seleção e ações em massa; detalhe no AppShellAside, nav recolhe ao rail), Shipments, Returns, Inventory (ProgressBar), Calendar (EventCalendar), Invoices, Customers. Dados sintéticos com semente fixa (`src/console/data.ts`). `echarts` 6.1.0 adicionado a `apps/docs`.
- Defeito de pacote 2: `SideNavigationLinkRootProps` tipado só para `<a>` impedia `render` com `<button>` (navegação em estado). Correção em `packages/react/src/side-navigation/side-navigation.types.ts` (`AnchorHTMLAttributes<HTMLElement>`); teste novo em `side-navigation.test.tsx` (falhou no typecheck antes; passa depois). Diretiva `@ts-expect-error` de `icon-button.test.tsx` reposicionada após o Prettier.
- Cenário `pw/console.mjs`: Orders, abrir pedido, Inventory, Calendar, Invoices em dark — 0 erros de página.

## Fatia 5 — tokens e busca (concluída)

- `site.css` e `home.css`: tamanhos de fonte, alturas de linha, espaçamentos, raios, pesos, durações e easing passam a ler `--slotted-*`. Derivados declarados em `:root`: `--docs-header-h` (space-12 − space-4), `--docs-frame-radius` (radius-lg + space-2), `--docs-line`, `--docs-ink-2`, `--docs-leading` (1.75, sem token de prosa no tema). Literais restantes: larguras de layout, altura do console, clamp do título da home. Código: `--slotted-surface-sunken` dentro do escopo escuro, em vez de `#0d0d10`.
- `.docs-example-preview > *` (selecionava a raiz da família) substituído: o `id` do menu de eixos vai para `.docs-example-stage`; `.docs-example-preview` é o contêiner do site com a largura de leitura.
- Busca: gatilho é um `button` do site via `CommandPaletteTrigger render` — ícone a 12 px, rótulo à esquerda, `Shortcut keys="mod+k" separator="" size="xs" variant="outline"` a 6 px da borda; abaixo de 48rem, só a lupa (altura `--slotted-control-height-sm`).
- Cenários: `toc.mjs` PASS, `input-states.mjs` limpo, `console.mjs` 0 erros, `capture.mjs` 0 erros/overflow; `astro check` 0 erros; eslint limpo.

## Fatia 6 — escuro profundo, só no site (concluída)

- Decisão do usuário: só na docs. `site.css` redefine, na camada `docs`, os tokens neutros do esquema dark do tema padrão (`[data-slotted-theme='default'][data-slotted-scheme='dark']` e a forma descendente): sunken `#000`, surface `#0a0a0a`, raised `#111`, border-subtle `#1f1f1f`, control-border `#333`, text `#ededed`/`#a1a1a1`, tom secondary e disabled na mesma rampa, superfícies sutis do acento. `@slotted/theme-default` intacto.
- Chão da página: `--docs-canvas` = `surface` no claro, `surface-sunken` (passo mais escuro) no dark; painéis ficam em `surface`.
- Cenários `capture`, `input-states`, `console`: limpos. Claro sem mudança; molduras de código seguem o escuro profundo nos dois esquemas.

## Fatia 7 — triagem do event-calendar (concluída)

- Veredito: pacote. Raiz pintava `--slotted-surface` e 23 preenchimentos misturavam sobre `--slotted-surface`; dentro de `Page` (chão `surface-sunken`) o calendário virava uma caixa mais clara. Correção em `packages/styles/src/event-calendar/event-calendar.css`: `--_base` = `--slotted-event-calendar-background` ou `--slotted-surface`; raiz `background-color: var(--slotted-event-calendar-background, transparent)`; todo preenchimento lê `--_base`. Popovers dos dois bindings usam `portal=false` (dentro da raiz). Teste novo em `event-calendar.styles.test.mjs` (falhou antes, 7/7 depois); React `event-calendar` 38/38.
- Suite de styles: 1616/1618; as 2 falhas (`field-surface`: `kbd` pinta `surface-raised`; `option-mark`) são de checkbox/radio-group/switch/kbd em andamento em outra sessão.
- Ledger criado: `apps/docs/LIBRARY-FEEDBACK.md` (4 defeitos de pacote + a ordem de camadas do site).

## Fatia 8 — código unido ao exemplo (concluída)

- A moldura dupla do código (sunken + padding + cantos quadrados) aparecia dentro do cartão do exemplo como uma faixa preta. `.docs-code[data-joined]` (só em `Example.astro`): sem padding, sem fundo de moldura, raio 0, um fio `--slotted-border-subtle` acima; o recorte do cartão arredonda a base. Blocos avulsos mantêm a moldura dupla. Captura `junction.mjs` antes/depois nos dois esquemas; `capture.mjs` sem erros.

## Fatia 9 — cartão do código e scroll preso (concluída)

- Revisão da fatia 8 a pedido do usuário: o cartão próprio do code-block volta (raio, borda); `.docs-code[data-joined]` só tira o fundo escuro da moldura e insere o cartão a `space-2` (raio externo = interno + inset); `.docs-example` pinta `--slotted-surface`.
- Scroll preso sobre blocos de código (pacote, duas causas): `code-block` usava `axis="both"` sem `maxLines` → agora `inline` sem `maxLines` (React e Angular; testes 23/23 e 21/21); `scroll-area` com `contain` segurava o encadeamento também no eixo sob `overflow: hidden` → regra por eixo depois de "Scroll chaining" (`scroll-area.css`; teste 10/10). Cenário `pw/wheel.mjs`: página andou 0 px antes, 400 px depois. Styles 1619/1621 (2 falhas de outra sessão). Ledger atualizado.

## Verificação

- `astro build`: 3 páginas. Captura (`playwright-core` + Chrome, scratchpad `pw/capture.mjs`, contra `astro preview --port 4322`): 0 erros de console, 0 overflow horizontal em 1440 e 390, light e dark.
- `astro check`: 0 erros. `toc.mjs` PASS; `input-states.mjs` sem borda/contorno; `capture.mjs` 0 erros, 0 overflow.
- `packages/react`: vitest `src/button src/split-button src/menu` 164/164. `tsc` do pacote: 1 erro em `src/cascader/cascader.types.ts:4` (`CascaderNodeView` ausente de `@slotted/core/cascader`), trabalho em andamento de outra sessão.
- Captura contra `astro dev` (home, field, introduction; 1440 e 390; light e dark): 0 erros de console, 0 overflow.
- `eslint apps/docs`: 0. `prettier --write apps/docs` aplicado.

## Problemas conhecidos

- Runtime Angular (tarefa 4) não iniciado.
- O servidor `astro dev` em segundo plano (porta 4321) ficou com dependências otimizadas desatualizadas; reiniciar com `npx astro dev stop && pnpm dev` em `apps/docs`.

## Próxima ação

1. Rodada de revisão do usuário sobre a home e o frame novos.
2. Tarefa 4 do plano: runtime Angular (`@analogjs/vite-plugin-angular` no Vite do Astro).
3. Finish review do impeccable (`impeccable-finish-reviewer`) e `DESIGN.md` pelo documenter, quando a direção for aprovada.
