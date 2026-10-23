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

## Próxima ação exata
Aguardar o resultado do teste do usuário no equori; se aprovado, `pnpm check` e commit `fix(drawer): ...`.
