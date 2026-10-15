# Halo de seleção: faixa sobre o alvo

Famílias: `checkbox`, `radio-group`; `switch` pela mudança do `gap`.

## Defeito

O halo era um círculo de `--slotted-selection-halo-size` (32 px) centrado no controle. O avanço além da borda do controle vale `(32 − tamanho) / 2`: 9 px em `sm`, 8 px em `md`, 7 px em `lg`. O `gap` entre o controle e o rótulo vale de 4 px a 8 px, conforme a densidade. O avanço ultrapassou o `gap` em sete dos nove pares tamanho × densidade e igualou-o no oitavo. O círculo passava sob a primeira letra do rótulo e era cortado na borda de uma célula pouco mais alta que o controle.

## Campo

| Implementação | Hover do controle | Espaço do hover |
| --- | --- | --- |
| Material 3, MUI, Vuetify | disco de 40 px | reservado no layout: caixa de 40 px ao redor de cada controle |
| Fluent 2, Carbon, Primer, Radix Themes, Ant, Mantine | borda ou preenchimento do próprio controle | nenhum |

Um disco sem espaço reservado não cabe numa linha cuja altura é a do texto. Reservar 40 px de layout contradiz CK3 (a linha é a sua linha de texto).

## Decisão

O hover pinta o alvo inteiro: uma faixa atrás do controle e do rótulo, desenhada pelo `::after` do rótulo.

- **Folga.** `--_halo-spread: calc(var(--_gap) / 2)`. A faixa fica a essa distância do controle em todos os lados e a 1,5 × essa distância do fim do texto. O fim de um texto é o espaço lateral de um glifo, mais leve que a borda sólida do controle. Em `dense`, a folga simples de 2 px pareceu cortar a última letra. Em `md` × `comfortable`, a folga é 4 px e uma faixa de uma linha mede 24 px de altura, o alvo WCAG.
- **Canto.** O raio do controle mais a folga: concêntrico com o quadrado do `checkbox` e com o círculo do `radio-group`. Com uma linha, a faixa do `radio-group` é uma pílula.
- **Rótulo.** `justify-self: start` e `position: relative` fora do `tile`. O rótulo abraça o texto: a faixa termina onde as palavras terminam, e o espaço vazio à direita deixa de alternar o controle. O rótulo é o bloco de contenção do alvo (`::before`) e da faixa.
- **Gap.** Passa do `padding-inline-start` do rótulo para o `column-gap` do grid, e só quando há rótulo (`:has(> [data-part='label'])`). O `padding` segue a direção do próprio rótulo: um rótulo `dir="rtl"` numa linha LTR recebia o `gap` do lado oposto e encostava o texto no controle. O `::after` recebe o ponteiro, portanto o `gap` continua a alternar o controle.
- **Descrição.** Fora da faixa: a descrição não alterna nada.
- **Tinta e opacidade.** Inalteradas: `--slotted-tone-accent-text` a `--slotted-selection-halo-opacity` (CK7). A transição é só de `opacity` e não depende de `prefers-reduced-motion`.
- **Token.** `--slotted-selection-halo-size` sai do contrato de tokens, do tema e de `docs/token-foundation.md`. O halo não tem tamanho próprio: deriva do `gap`, que a densidade já define.

## Custo

- Mudança de token público: um tema que definia `--slotted-selection-halo-size` deixa de ter efeito. Não há consumidor fora de `demos/*`, e nenhuma demo o define.
- A área clicável do rótulo passa a ser o texto mais a faixa, e não mais a largura da coluna.
- `table` e `data-grid` continuam a zerar `--slotted-selection-halo-opacity` nas suas células de seleção.
- `switch` segue a mesma regra de `gap` sem ganhar faixa. O `gap` passa para o `column-gap` da raiz, e o rótulo abraça o texto na disposição `end`. Na disposição `start`, a linha de configurações, o rótulo continua esticado. O `padding` do rótulo era o que fazia o `gap` alternar a configuração. Agora o controle transparente cresce o `gap` em direção ao texto e devolve o crescimento como margem negativa, o mesmo padrão da saliência no eixo de bloco. A linha não fica mais larga.
