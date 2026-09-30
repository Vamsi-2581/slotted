# attachment — autoavaliação

Família nova. Inventário e decisões em `2026-09-30-attachment-design.md`; contrato em `specs/components/attachment/contract.json`. Specimens em `tools/harness/out/specimen/attachment/`; capturas de harness em `tools/harness/out/attachment.html` (cenas `default`, `sizes`, `kinds`, `cards`, `strip`, `states`, `content`).

## 1. Craft bar

| Critério | Número que decide | Specimen | Veredicto |
| --- | --- | --- | --- |
| Pixel grid | Raízes a 58 (`md`), 52 (`sm`), 67 (`lg`), 96 (com mensagem), 206 (cartão em grelha); nenhuma parte emoldurada com altura fracionária em comfortable nem em dense | `slotted-light-420-data-part-trigger-eafd1b.json`, `slotted-light-420-dense-data-part-trigger-eafd1b.json` | passa; ReUI falha (cartão vertical 145.5) |
| Hover | `trigger`: sublinhado no nome e fundo da raiz 4 % da tinta sobre a superfície, ΔL 0.032 em `light` (0.2077 → branco) e 0.031 em `dark`; `action`/`remove`: `currentcolor` 8 %, ΔL 0.063 | `…-trigger-eafd1b.json`, `…-remove-3fc61e.json`, `…-a-data-part-action-e3de69.json` (três esquemas) | passa; ReUI 0.015 |
| Press | `trigger`: `translate 0 1px` e fundo 8 % (ΔL 0.063) contra sublinhado e 4 %; controlos 14 % contra 8 % | os mesmos | passa |
| Focus | Anel 2 px `--slotted-focus-ring-color` à volta da raiz com `outline-offset` 2 px sobre borda de 1 px; `#2563eb` sobre branco 5.2 : 1, `#60a5fa` sobre `rgb(19,19,22)` 7.6 : 1, preto sobre branco em `high-contrast`; controlos com anel interior de 2 px | `slotted-dark-420-data-part-trigger-eafd1b-0-focus.png`, `…-remove-3fc61e-0-focus.png` | passa |
| Transition | Raiz: `background-color`, `border-color`, `opacity`, `translate`; controlos: `background-color`, `color`; `trigger`: `translate`. `text-decoration-line` é discreto e não interpola | `attachment.css` | passa, com o sublinhado discreto registado |
| Motion | Entrada da raiz e da barra por `@starting-style` em `--slotted-duration-medium` / `--slotted-easing-enter` | `attachment.css` | falha parcial: saída não animada (secção 5) |
| Reduced motion | Durações a 1 ms; nenhuma animação infinita própria; a barra indeterminada é de `progress-indicator` | `slotted-light-420-motion-reduce-data-part-trigger-eafd1b.json` | passa |
| Disabled | Tinta `--slotted-disabled-foreground`, azulejo em `--slotted-disabled-background`, miniatura em `grayscale(1)`; nenhum `opacity` | cena `states` | passa |
| Schemes | `high-contrast`: tons de superfície brancos, falha dita pela borda dupla; `forced-colors`: hover em `Highlight`, azulejo com `ButtonBorder` | `attachment-states-high-contrast-comfortable-ltr-420.png`, `slotted-light-420-forced-data-part-trigger-eafd1b.json` | passa |
| Density e RTL | Dense encolhe tipo, glifo e intervalo; RTL espelha, nome em `dir="auto"` alinhado ao início do corpo | `attachment-light-dense-ltr-420.png`, `attachment-kinds-light-comfortable-rtl-420.png` | passa após correção (tabela da secção 3) |
| Target size | Controlos 24 × 24 (`--slotted-target-min`), halo de 44 em ponteiro grosso | `…-remove-3fc61e.json` (rect 24 × 24) | passa |
| Intent | Literais com razão escrita: 4 %/8 %, 8 %/14 %, 96 % da placa, `0.06em`, `grayscale(1)`, `15rem`, `16rem` | `attachment.css` | passa |

## 2. Onze dimensões

| Dimensão | Estado | Mudança que mais melhoraria | Feita |
| --- | --- | --- | --- |
| Icons | Marcas de tipo e cruz pelo elemento `Glyph`; nenhuma pintada em CSS | Glifo `download` em `@slotted/core/glyph`, para a ação mais comum não depender de um ícone do consumidor | não: muda o conjunto de glifos partilhado, fora desta família |
| Motion | Entrada da raiz, da barra; hover e press com tokens | Saída de um anexo removido | não: exige reter o nó depois da mudança da lista do consumidor, a dívida já registada para `upload` |
| Responsiveness | Aguenta 240 px; grelha com `min(100%, 16rem)`; faixa com scroll | Consulta de contentor que passa as ações para baixo do nome abaixo de ~15rem | não: a 240 px o nome ainda tem 124 px (captura `attachment-light-comfortable-ltr-240.png`) |
| Refinement | Azulejo da altura das duas linhas; raio 8 sobre 4 | Borda tracejada para um anexo ainda não enviado, como `ready` do `upload` | não: não há estado de contrato que o nomeie; `loading` cobre o envio |
| Tokens | Tudo por tokens de fundação; componente `--slotted-attachment-*` como pontos de retune | Nome partilhado `--slotted-file-kind-*` | não: reabertura registada no desenho §5 |
| Patterns | Sem padrão APG; Button e `a` nativos; lista nativa | — | — |
| Accessibility | Nome e descrição do `trigger`, `aria-busy`, estados fora de `listitem`, foco após remoção | Anunciar a remoção por `live-announcer` | não: a mensagem é da aplicação (exemplo `keyboard` mostra o padrão) |
| Native API | `render`, `ref`, props nativas, `HostAttributeToken` para `id`, `title`, `dir`, `type`, `aria-label`, `aria-describedby` | — | — |
| Capability | Inventário completo; `action` e teclas de remoção acrescentadas | Agrupamento por data numa linha do tempo | não: composição da página com `timeline` |
| Ecosystem | Provider React, `provideAttachmentDefaults`, `exportAs`, handlers compostos | — | — |
| Documentation | Doze cenas nas duas páginas; página React lida renderizada a 1280 | Leitura da página Angular renderizada | não: o Storybook Angular em 6007 precisa de reinício para ver a entrada nova |

## 3. Correções feitas a partir das capturas

| Antes | Depois | Porquê |
| --- | --- | --- |
| `filename` esticado na coluna do corpo | `align-self: start; max-inline-size: 100%` | em RTL o nome em `dir="auto"` ficava à esquerda e o detalhe à direita |
| Falha só por tinta e cor da frase | `box-shadow: inset 0 0 0 1px` da borda de perigo | em `high-contrast` a superfície de tom é branca e a cor da frase era o único sinal |
| `trigger` sem delta próprio | sublinhado no hover, `translate 0 1px` no press | o delta de 0.03 ficava só no fundo da raiz, longe das palavras |
| Hover da linha falhada por `--slotted-tone-danger-subtle-hover` | mistura de 4 % da tinta sobre a superfície do estado | o passo de tom é mais claro que a superfície de perigo |

## 4. Secção 18

- **Anatomia:** catorze partes (tabela no contrato e nas páginas).
- **Controlado/não controlado:** nenhum valor mutável; a lista é do consumidor e `remove` é pedido com razão. Sem `stateModel` (`docs/state-and-events.md`).
- **Matriz de estados:** `invalid` pinta superfície, borda dupla e frase; `loading` junta `aria-busy`, recusa o `trigger` e mantém `remove`; `disabled` recusa tudo. Precedência `disabled` > `loading` > `invalid` > hover.
- **Densidade e direção:** escalas de controlo; propriedades lógicas; nome isolado.
- **Loading, vazio, erro, extremo:** barra determinada e indeterminada; grupo vazio `display: none` e estado vazio declinado para `result-state`; mensagem que quebra; nome de 60 caracteres, nome árabe, nome sem extensão (cena `content`).
- **Testes:** contrato 16, estilos 15, React 21, Angular 18.

## 5. Limitações abertas

- Saída animada de um anexo removido.
- Página Angular não lida renderizada: `http://localhost:6007` responde mas não conhece a entrada nova sem reinício.
- Em RTL com texto inglês na harness, `248 kB` lê-se `kB 248`; é reordenação bidi de texto não localizado, não da família.
