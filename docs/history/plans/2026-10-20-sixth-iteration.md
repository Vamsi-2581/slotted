# Sexta iteração — marcador das tabs e escopo do stat-card

Fonte: pedidos recebidos em 2026-10-20 sobre `v0.1.0-beta.5`. Os pedidos chegam um a um e acumulam
antes de um release. Verificação escopada por mudança; o gate completo corre antes do push.

## Triagem

| #   | Família   | Tipo     | Estado na triagem                                                                                                                                                                                                                                                |
| --- | --------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | tabs      | melhoria | Pedido: 1px entre as barras (seleção e hover) e a borda da lista. A barra colorida é a parte `marker`, que desliza por `translate`; um `translateY` colidiria com esse deslize.                                                                                    |
| 2   | tabs      | defeito  | Confirmado no Chrome: o deslize durava 120 ms numa curva só de desaceleração (30% do caminho no primeiro frame), e uma nova medição da mesma tab (fonte, redimensionamento) também animava a barra, porque `data-positioned` ficava ligado depois da segunda posição. |
| 3   | stat-card | defeito  | Confirmado no Chrome: sob um `Grid`, o limite `[data-ui]:not(:scope) > *` casava com a raiz do card; o valor computava 16px e o body `block`, contra 24px e `grid` sob um `div`.                                                                                     |

## Resultado

| #   | Estado                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Feito (`60727d0a`): `--slotted-tabs-marker-offset` (1px) soma-se à distância do marcador e da barra de hover à borda da lista; na vertical, à borda inline-end. O cenário `tabs-marker.mjs` passou a esperar o deslocamento (marcador a 117 com a lista a 118). Contraria o aceite do item 6 da quinta iteração (marcador rente à borda), por pedido.                                    |
| 2   | Feito (`f4757870`): `createIndicator` escreve `data-moving` só quando o alvo muda e retira-o numa nova medição do mesmo alvo; o CSS só anima `[data-moving]`. Deslize em `--slotted-duration-medium` com `--slotted-tabs-marker-easing` (`cubic-bezier(0.4, 0, 0.2, 1)`); avanços por frame medidos no Chrome: 3, 10, 23, 33, 29, 20, 13 px. Teste de core novo: a mesma tab medida de novo não anima. |
| 3   | Feito (`1b5a1d67`): limite `to (:scope [data-ui] > *)` nas 47 regras; `prose` usa outro limite (`[data-part='exclude']`). Cenário `stat-card-nested.mjs`: um card dentro de `Grid` computa o mesmo que sob um `div` (falha antes, passa depois).                                                                                                                                            |

## Problemas conhecidos

- O tema não tem curva de aceleração e desaceleração; a curva do marcador é um literal no token da família.
