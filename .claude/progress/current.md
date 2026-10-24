# Checkpoint

- Tarefa: regressão do bottom sheet (drawer `side="bottom"`) introduzida por `acb3c96b`, reportada no equori. Sem ficheiro de plano.
- Branch main, HEAD `23c4b2a3`. Árvore: alterações não commitadas em `packages/core/src/extent/{extent,index,sheet,sheet-motion}.ts` e testes, `packages/react/src/drawer/{drawer-parts.tsx,drawer.browser.test.tsx}`, `packages/angular/drawer/src/{drawer,drawer-parts}.ts`.
- `../equori/web` sincronizado com `pnpm sync:equori` após a segunda ronda.

## Correções na árvore
1. `createSheetMotion`: uma instância por painel (WeakMap); `begin` parte da posição desenhada (`visible()`) quando um settle está em curso e esse settle nunca resolve; `follow` acima do box faz o painel crescer (sem gap); `max-block-size: none` durante o gesto; `end` devolve ao stylesheet com `transition: none` (sem salto de altura); `holds()` e `sheetMotionHolds(panel)`.
2. Observador de repouso (React e Angular) ignora leituras enquanto o movimento segura o painel.
3. Gesto de sheet sem render: `data-dragging` escrito no layer em vez de `setDragging`/`dragging.set`.
4. Paradas medidas no início do gesto mantidas numa re-pegada a meio do settle (corpo e resizer).
5. Resizer: retângulo do layer em cache, uma divisão e uma escrita por movimento; recusa de fecho devolve o painel ao piso.
6. Velocidade: `extentVelocity(samples, releasedAt)` com janela de 100 ms até ao último movimento e 0 quando a mão parou mais de 60 ms; `addExtentSample`; `touchcancel`/`pointercancel` com velocidade 0.
7. `attachSheetDrag`: distância contada a partir do reconhecimento do gesto (sem salto de 8 px).

## Testes
- core extent 74/74; React drawer unit 61/61, browser 5/5; Angular drawer 51/51; eslint limpo; prettier aplicado.

## Problemas conhecidos
- Não verificado em dispositivo real nem `pnpm check`.
- Teste de browser do fling usa passos de 35 px (o primeiro movimento só reconhece o gesto).

## Release
- Correções em `1abb14e9` (CI 40015966779 verde). Release `v0.1.0-beta.13` (`49de3662`), workflow 40017979351 verde; os seis pacotes com `latest` = 0.1.0-beta.13 no npm.
- `pnpm eval:agent-docs` não corrido (decisão do usuário registada antes); `theme-app/SKILL.md` mudou desde a beta.12.

## Ronda 3 (não commitada, sem sync no equori por pedido do usuário)
- Saída por arraste: `settle(0, …)` vai ao ritmo da mão (mínimo 900 px/s, 120 ms) numa curva `cubic-bezier(0.2, y, 1, 1)` que só acelera; a duração da camada é teto.
- Fecho por arraste não pede o piso: o resizer devolve a medida de antes do gesto (lados que redimensionam ao vivo) e só pede o piso, um frame depois, quando o consumidor recusa o fecho. React e Angular.
- Testes: core extent 74/74; React drawer unit 64/64, browser 5/5; Angular drawer 52/52; format, lint e typecheck verdes.

- Ronda 3 em `f5f07790` (CI 40028639973 verde); release `v0.1.0-beta.14` (`e39be6e6`), workflow 40030694249 verde; os seis pacotes com `latest` = 0.1.0-beta.14.

## Ronda 4 — folha sobre scroll nativo (plano 2026-10-23-drawer-sheet-native-scroll.md)
- Fatia 1 concluída: `packages/react/src/drawer/sheet-scroll.prototype.browser.test.tsx` (5/5): toque no painel desloca a camada com pointer-events none; scrollend no detent; fling fecha, também com CPU 6× e 40 ms de trabalho.
- Fatias 2–3 em curso, sem suites (pedido do usuário: testar no telefone primeiro): `packages/core/src/extent/sheet-scroll.ts` (attachSheetScroll), secção final de `drawer.css`, `DrawerPanel`/`DrawerResizer` React com o caminho novo; código antigo da folha ainda presente (morto) até à fatia 5.
- Modelo de scroll único (drag="panel"): painel com a altura do conteúdo, cabeçalho e puxador sticky no topo, rodapé sticky no fundo; `data-sheet-content` (snap off ao ler conteúdo), `data-sheet-anchored` (espaçador dobrado sem dedo: o fling pára no início do conteúdo). Medido com toque CDP em `scratchpad/lab3.mjs`: passagem folha→conteúdo e conteúdo→folha no mesmo gesto; fling do conteúdo pára no topo; sem re-snap por layout.
- Abrir e fechar (botão, Escape, clique fora) pelo scroll suave nativo (`enter`, `scrollTo(0)`), sem translate; camada retida long+medium (520 ms; scroll do Chrome ~435 ms por 713 px). Corrigidos: reaparecimento após fecho por fling (verificação de recusa lia o estado antes do commit → 300 ms), snap off com a folha a fechar, ResizeObserver não reescreve a posição durante um scroll.
- Página de teste: `apps/storybook-react/phone-lab/` (não versionada), servidor Vite em segundo plano na porta 5180; story `packages/react/src/drawer/drawer.phone.stories.tsx` (temporária).

- React (fatia 3) sem o caminho antigo; medidas das paradas no core (`attachSheetScroll` com snapPoints/content/reserve/step, `rest()`, `stops()`); laboratório re-verificado igual.

- Fatias 4–5: Angular portado (SlDrawer + SlDrawerResizer); core sem createSheetMotion/attachSheetDrag/dampenExtent (sheet.test.ts → settle.test.ts); sheet-scroll.test.ts (8); contrato `sheet.*` e testes; docs de referência React/Angular; tokens runtime `--slotted-drawer-sheet-{height,floor}`; `data-drawer-drag="none"` = overscroll-behavior: contain.
- Testes: core extent 61; React drawer unit 66, browser 9 (cenários CDP do desenho §3); Angular drawer 53; styles 1716; contrato 46; `pnpm check` verde.
- Página de teste movida para `apps/storybook-react/phone-lab/page.tsx` (excluída em .git/info/exclude).

- Verificação final: `pnpm check` verde (typecheck só com cache limpo); `turbo verify --affected`: theme (generated regenerado), styles, core, angular, agent-docs verdes; React unit 4163/4163, browser 99/100 — a falha da segunda corrida é `entity-picker.browser.test.tsx` (15,8 s, timeout sob carga; isolado passa 2/2); na primeira corrida falhou `dialog-presence.browser.test.tsx` (isolado 4/4 ×3). Nenhum dos dois toca o que mudou.

- CI de `affafaf5` falhou em `test:perf` (drawer.perf: abrir a folha forçava 8 layouts). Corrigido: `enter` lê em `afterLayout`, escreve num rAF e começa o scroll no layout seguinte; altura natural pela soma das partes (o rodapé sticky desloca o offsetTop); sondas permanentes para reserva e passo; snap desligado até `data-sheet-ready`; `busy()` nos bindings. Perf 4/4, drawer suites e `pnpm check` verdes; laboratório com os mesmos números aprovados.

## Próxima ação exata
Commit `fix(drawer): …`, push, CI, `pnpm release` (0.1.0-beta.15), verificar npm.
