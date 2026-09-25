# Checkpoint — event-calendar + elemento Glyph

`.claude/progress/current.md` pertence a outra sessão; este ficheiro é o desta. Nada commitado por esta sessão.

## Decisões do utilizador (2026-09-25)

- Ícone próprio de família = elemento `Glyph` (`<svg>` real) dentro de `Icon`; nunca máscara/pseudo-elemento. Padrão único, todas as famílias. Guarda contra repetição.
- Polimento de `event-calendar`: fade do conteúdo que transborda em blocos curtos; cores e estados; arrasto na faixa "All day" (redimensiona em vez de mover); UX.

## Feito (não commitado)

- `@slotted/core/glyph` (`packages/core/src/glyph/{glyph,glyphs,index}.ts`; subpath em `packages/core/{package.json,vite.config.ts}`), gerado por `scripts/generate-icon-glyphs.mjs` (módulo + `--check`); teste em `scripts/verify-token-foundation.test.mjs` (16/16).
- `Glyph` React (`packages/react/src/icon/glyph.tsx`, testes) e `SlGlyph` Angular (`packages/angular/icon/src/glyph.ts`, spec); docs/stories/contrato de `icon` (parte `glyph`, cenário `library-glyphs`).
- `tools/harness/glyph.mjs` (+ teste) e `build.mjs` desenha `<svg data-glyph>` vazio.
- Guarda `packages/styles/src/glyph-element.test.mjs` (lista `PENDING`, só diminui).
- Lei: `docs/token-foundation.md` (Glyph, regra 3), rubric §1, briefing (decisão), `docs/history/designs/2026-09-25-glyph-element.md` (receita).
- `popover` migrado (fecho React/Angular/CSS/harness), capturas claro e alto contraste lidas.

## Feito nesta fatia (event-calendar)

- Marcas migradas para `Glyph` (anterior/seguinte, funil/seta, continuação das barras) nos dois bindings e na harness; hooks `-page-icon`/`-filter-icon` removidos; tokens regenerados.
- Arrasto: âncora pelo dia sob o ponteiro (`dayUnder`, geometria das células) — corrige barra de dia inteiro que andava dias a mais; seleção por arrasto também. Testes de regressão React (passa) e Angular (escrito).
- Cor e estado: `--_ground`/`--_ink` por estado (repouso/hover/pressão), aberto e em arrasto sólidos (slot escurecido 20%, texto branco), `data-past` (recuado), tentativo com o mesmo modelo, fade no fundo de blocos que transbordam, "+N" com chão visível no escuro, pega de redimensionamento acima do fade.

## Migração Glyph — concluída

- Lotes A–H (8 agentes) migraram todas as famílias: `PENDING = []`, guarda `glyph-element.test.mjs` 4/4 (inclui 'opens no icon slot a stylesheet fills', máscara cuja imagem é `var(--slotted-*)`). `masked-glyph.test.mjs` apagado (sem máscaras). `Glyph solid` (recorte por `<mask>` SVG) para marcas de tom; harness com ids de máscara por célula (`scopeGlyphMasks`).
- Verificação: React 3415/3418 (falhas: `table` ×2 de outra sessão); Angular 2597/2601 → corrigidos fullscreen (helper de teste ambíguo) e snippet description-list; restam `action-bar` e `table` (outra sessão); estilos 1492/1496 (restam `motion` wizard, `states` import-export-center, `table` plain-variant — outras sessões); typecheck só `dashboard-grid`; lint e test:docs verdes; auditoria das duas páginas do event-calendar a 1280/620 sem achados.

## Refinamento de design (2026-09-25, pedido "o seu melhor refino")

- Escuro: misturas por `light-dark()` (24/32/38%, borda 44/60%, passado 12%).
- Lista: dia em duas partes (`list-weekday`/`list-date`, `listDayParts` no núcleo, `aria-label` com a forma de uma linha); coluna da hora 10rem; passado recuado também na lista.
- Colunas: `maxColumns` omissão 6 (contrato, docs); limite medido de 64 px; um dia de uma coluna desenha o primeiro evento inteiro e a pastilha "+N" no fim do intervalo escondido (`ColumnMore.overlay`, `data-overlay`).
- Rolagem inicial com meia linha de rótulo acima da hora; rótulo "Dia inteiro" quebra em vez de reticências.
- Cabeçalho: filtro alinhado à direita na largura média; em ecrã estreito o funil fica e o chevron sai.
- Mês ocupa a altura dada à raiz (`flex`); workbench ganhou `.slotted-demo-viewport[data-fill]` (+ teste) para a sala de telefone.
- Demo pt-BR com vistas traduzidas.
- Verificação: React 73/73 (event-calendar, icon, popover), Angular 18/18 (event-calendar), núcleo 39/39, contrato 17/17, workbench 49/49, lint limpo, auditorias 1280/620 nas duas páginas sem achados; capturas lidas em claro/escuro, 1280/900/375.

## Rodada de 5 pontos (passos, menu de contexto, folhas, largura do popover, filtro)

- (1) Passos: `slotDuration` numérico (`slotMinutes`, 5–120), régua por `--slotted-event-calendar-slot`; testes React/Angular de 10 min.
- (3) Folhas: abaixo da classe compacta, "+N" e detalhe são `Drawer side=bottom` dentro da raiz nos dois bindings (`container` = raiz, `finalFocus` = origem); toque no número do dia do mês compacto abre a folha do dia (`aria-haspopup`). Núcleo `dismissable-layer`: corrida do `history.back()` assíncrono corrigida (entrada nova só depois da travessia). Testes: React 34/34, Angular 20/20 (spec das folhas nos dois). Capturas lidas: `scratchpad/ng-compact-detail.png`, `ng-compact-day.png`, `r-compact-detail.png`.
- Defeito achado: `[data-ui='event-calendar'] [data-part='list']` vazava para a `list` de uma description-list no detalhe (régua dupla) → regra presa a `> [data-part='body'] > [data-part='list']`.
- (4) Popover do detalhe `size="lg"`; (5) amostra do filtro dentro do rótulo, visto visível.
- (2) Menu de contexto: feito nos dois bindings. `contextSlot` no núcleo (+ teste, 45/45); React `renderContextMenu(target)`, Angular `ng-template[slEventCalendarContextMenu]` + `[slEventCalendarContextMenuFor]`; corpo = alvo de `context-menu`; `data-context` no evento; contrato (`contextMenu`, `composes` + drawer/context-menu, tecla Shift+F10, cena `context-menu`), docs, stories, testes (React 35/35, Angular 21/21, contrato 18/18). Angular: `#body` lido como `ElementRef` (o trigger é componente no elemento); itens recebem `SlMenu` por `Injector.create`.
- Verificação final: lint e formatação limpos nos caminhos da família; estilos 1510/1511 (falha `table`, outra sessão); contratos 2018/2019 (falha `toast`, outra sessão); test:docs só falha `action-sheet` (outra sessão); auditoria 1280/620 nas duas páginas sem achados; capturas `cm-event-600{6,7}.png`, `cm-slot-600{6,7}.png`.
- A mensagem para a sessão "drawer reopen" sobre a correção em `dismissable-layer` foi recusada (a sessão não aceita mensagens): comunicar ao utilizador.

## Problemas conhecidos (outras sessões)

- `dashboard-grid` (typecheck/Angular), `wizard` (durações literais), `import-export-center` (`:hover` sem guarda; bindings por escrever), `toast` contrato (mapa de tons vs alert), `detail-panel` (botão "Emitir fatura" em coluna de letras), `progress-indicator` (`hidden` não esconde a barra linear).
- Storybook Angular guardava transformações antigas: `touch` nos ficheiros resolveu.

## Próxima ação

Gate de release com o utilizador (páginas `http://localhost:6006/iframe.html?viewMode=docs&id=components-eventcalendar--reference` e `:6007`); depois commits por caminhos explícitos, agrupados por lote.
