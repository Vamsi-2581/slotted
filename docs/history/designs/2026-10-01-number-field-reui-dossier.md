# `number-field` — dossiê ReUI (2026-10-01)

## 0. Cabeçalho

Família `number-field`, modo `polish`, HEAD lido `81ca38f3` (`review/implementation-pass-1`).

## 1. Seleção

Cobertura `direta`. Termos procurados em `tools/harness/out/specimen/reui-llms-full.txt`: `number field` 8, `number-field` 6, `quantity` 11, `currency` 6, `stepper` 55 (os 55 são o `stepper` de assistentes, outra família).

Primitivo: `https://reui.io/r/number-field.json` (Base UI `NumberField`: `Root`, `ScrubArea`, `Group`, `Decrement`, `Input`, `Increment`).

| Item | Tipo | Rota | Parte ou interação Slotted que informa | Capturas |
| ---- | ---- | ---- | -------------------------------------- | -------- |
| `c-number-field-1` | exemplo | `/preview/base/example/c-number-field-1` | `split`, `input`, `decrement`, `increment`, rótulo arrastável | `specimen/c-number-field-1/c-number-field-1-{light,dark}-1280-data-slot-number-field-i-471277.json` |
| `c-number-field-4` | exemplo | `/preview/base/example/c-number-field-4` | botões juntos na ponta final (análogo de `stacked`) | `specimen/c-number-field-4/c-number-field-4-light-1280-data-slot-number-field-d-afea5b.json` |
| `c-number-field-5` | exemplo | `/preview/base/example/c-number-field-5` | coluna empilhada inset com borda própria | `specimen/c-number-field-5/c-number-field-5-light-1280.json` (fonte lida; o preview perde a disposição e não serve para medidas) |
| `c-number-field-2`, `-3`, `-6` | exemplo | fonte em `/r/` | tamanhos `sm`/`lg`, uso em formulário | fonte apenas: repetem a anatomia de `-1` |

Os blocos Pro com quantidade (`shopping-cart-*`, `pricing-1`) compõem o mesmo primitivo; nenhum foi capturado, porque a fonte do primitivo já fixa os valores que eles herdam.

Slotted: `specimen/number-field/slotted-{light,dark,high-contrast}-720-data-stepper-{split,stacked}-*.json`, `slotted-light-720-{dense,rtl,forced,motion-reduce}.json`.

## 2. Anatomia

| `data-slot` ReUI | Parte Slotted | Estado |
| ---------------- | ------------- | ------ |
| `number-field` | (o `field` à volta) | igual |
| `number-field-scrub-area` | — | em falta no Slotted |
| `number-field-group` | `root` | igual |
| `number-field-input` | `input` | igual |
| `number-field-decrement` | `decrement` | igual |
| `number-field-increment` | `increment` | igual |
| — | `stepper` (coluna empilhada) | só no Slotted |
| — | `start`, `end` | só no Slotted |

## 3. Medidas

ReUI a 1280 px, Slotted a 720 px; nenhuma das propriedades abaixo depende da largura da página.

| Parte | Propriedade | ReUI | Slotted hoje | Alvo | Veredicto |
| ----- | ----------- | ---- | ------------ | ---- | --------- |
| root | altura | 32 | 34 | `--slotted-control-height-md` | superar: a escala de controlo da biblioteca |
| root | raio | 10 | 4 | `--slotted-control-radius` | recusar: o raio é do tema |
| root | borda | 1 | 1 | `--slotted-control-border-width` | igual |
| input | tamanho de letra | 14 | 13 | `--slotted-control-font-size-md` | recusar: escala de controlo |
| input | algarismos | `tabular-nums` | `tabular-nums` | — | igual |
| input | alinhamento em `split` | centro | centro | — | igual |
| decrement/increment (`split`) | caixa | 32 × 30, rente à moldura | 24 × 32, rente à moldura | `--_action-size` × `--_action-size` (24 × 24 em `md`), inset concêntrico `--_inset` (4 em `md`) | adaptar: a regra de `text-field`, a mesma família de botões interiores |
| decrement/increment (`split`) | raio | 10 (o da moldura) | 3 (só nos cantos de fora) | `max(--slotted-radius-xs, raio − inset)` | adaptar: chão concêntrico |
| decrement/increment (`split`) | separador | nenhum | 1 px `--slotted-border-subtle` a toda a altura | nenhum | adotar: o chão do hover já delimita o botão |
| decrement/increment (`split`) | glifo | 16 | 16 | `--_icon-size` | igual |
| stepper (`stacked`) | coluna | — (`c-5`: coluna inset `m-px` com borda e raio próprios) | 25 × 32 rente, separador a toda a altura | coluna inset de `--slotted-space-1` em bloco e na ponta final, sem separadores; cada metade com chão concêntrico | adaptar: `c-5` informa o inset; a borda própria fica de fora porque desenha uma segunda moldura |
| increment/decrement (`stacked`) | caixa | — | 24 × 16 (`md`), 24 × 12 (`dense`) | 24 × 14 (`md`), 24 × 10 (`dense`) pintados; alvo de ponteiro recuperado até à moldura por `::after` | adaptar |

## 4. Coreografia de estados

| Parte | Estado | Delta ReUI | Delta Slotted hoje | Alvo |
| ----- | ------ | ---------- | ------------------ | ---- |
| increment | hover | `background-color` transparente → `oklch(0.97 0 0)` | transparente → `rgb(241 245 249)` | igual ao de hoje, no chão inset |
| increment | active | igual ao hover (`oklch(0.97 0 0)`) | → `rgb(226 232 240)` | superar: a pressão tem passo próprio |
| increment | focus-visible | `outline-style` auto, 1 px | 2 px sólido `rgb(37 99 235)`, offset −2 | igual ao de hoje, contornando o chão inset |
| input | focus-visible | `outline-width` 3 → 1 (anel na moldura por `focus-within`) | anel na moldura por `:has(:focus-visible)` | igual |
| scrub area | hover | nenhum delta; `cursor: ew-resize` | — | ver § 6 |
| decrement no limite | disabled | sem regra no estilo `nova` | chão `--slotted-disabled-background` + tinta `--slotted-disabled-foreground` a toda a altura | o mesmo par, no chão inset |

Escuro: hover ReUI `oklch(0.269 0 0)`; Slotted `rgb(34 34 37)` → active `rgb(39 39 42)`. Alto contraste: hover `rgb(230 230 230)`, active `rgb(204 204 204)`, anel `rgb(0 0 0)`.

## 5. Movimento

ReUI: `transition-property` cor, fundo, borda; 150 ms, `cubic-bezier(0.4, 0, 0.2, 1)`; sem regra de movimento reduzido. Slotted: `background-color` e `color` em `--slotted-control-transition-duration` (120 ms) com `--slotted-control-transition-easing`; o tema anula a duração sob `prefers-reduced-motion` (`slotted-light-720-motion-reduce.json`). Alvo: sem alteração.

## 6. Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| ---------- | -------------------- | ------------- | ---------------- | ------------------------------- | --------- | ------------------------- |
| Arrastar o rótulo para mudar o valor | `c-number-field-1` a `-5` | `NumberFieldScrubArea label` envolve o rótulo; `cursor: ew-resize`; arrasto com bloqueio do ponteiro | — | — | adotar (corrida `build`, ver § Parte `scrub`) | — |
| Repetir ao manter premido | Base UI | interno ao primitivo | `STEP_REPEAT_DELAY`, `STEP_REPEAT_INTERVAL`, atraso maior em toque | atraso próprio para toque | igual | — |
| Botões juntos na ponta final | `c-number-field-4` | `className` nos filhos | `stepper="stacked"` | eixo declarado no contrato, não classes | igual | — |

## 7. Superar

| Critério | ReUI | Slotted hoje | Alvo | Fonte |
| -------- | ---- | ------------ | ---- | ----- |
| Botão interior concêntrico com a moldura | não: 32 × 30 rente, raio 10 só nos cantos de fora | não: 24 × 32 rente, raio 3 | sim: inset 4, raio 2 em `md` | § 3 |
| Pressão distinta do hover | não: active = hover | sim | sim | § 4 |
| Alvo de ponteiro ≥ 24 | sim: 32 × 30 | `stacked` não: 24 × 16 e 24 × 12 (`dense`) | 24 de largura × toda a metade da coluna, por `::after` | `slotted-light-720-dense.json` |
| Alvo em ponteiro grosso ≥ 44 | sim: `after:min-h-11 min-w-11` | sim | sim | CSS |
| Sem linhas que não separam superfícies | sim | não: dois separadores em `split`, dois em `stacked` | sim | § 3 |
| Foco visível em todos os esquemas | anel 1 px automático | 2 px sólido, alto contraste a preto | igual | § 4 |
| Movimento reduzido | sem regra | duração anulada pelo tema | igual | § 5 |
| Forced colors | — | `plain` recupera `ButtonBorder` | igual | `slotted-light-720-forced.json` |
| RTL | — | valor em `plaintext`, alinhado à direita | igual | `slotted-light-720-rtl.json` |

## 8. Delta

| #   | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| --- | -------- | ------- | ---------------------------- | ------------------- |
| 1 | `packages/styles/src/number-field/number-field.css` | `--_action-size`, `--_inset`, `--_action-radius` na raiz, com a aritmética de `text-field` | § 3 caixa e raio `split` | specimen `split` claro |
| 2 | idem | `split`: moldura com `padding-inline: var(--_inset)`; botões `--_action-size` ao quadrado com `--_action-radius`; sem separadores; em ponteiro grosso só o `::after` cresce | § 3, § 7 linhas 1 e 5 | specimen `split` claro, escuro, alto contraste |
| 3 | idem | `stacked`: coluna com `padding` de `--slotted-space-1` em bloco e na ponta final, sem separadores; metades com raio concêntrico; `::after` de cada metade estende o alvo até à moldura | § 3 coluna, § 7 linhas 1, 3 e 5 | specimen `stacked` claro e `dense` |
| 4 | idem | estado no limite e foco desenhados sobre o chão inset (sem alteração de seletor) | § 4 | captura `stepper` |
| 5 | `packages/styles/src/currency-field/currency-field.css` | o mesmo delta, sobre a moldura que a família copiou | § 3 | outra família |
| 6 | `specs/components/number-field/contract.json` | parte `scrub` | § 6 linha 1 | contrato; aplicada |

## Resultado

| Linha | Antes | Depois | Fonte |
| ----- | ----- | ------ | ----- |
| botão `split`, `md` | 24 × 32 rente, separador de 1 px | 24 × 24, inset 4, raio 2, sem separador | `specimen/number-field/slotted-light-720-data-stepper-split-data-1e3775.json`; `/tmp/number-field-light-comfortable-ltr-420.png` |
| metade `stacked`, `md` | 24 × 16 rente, separadores | 24 × 14 pintados, raio 2, sem separadores; alvo até à moldura (24 × 16) | idem |
| metade `stacked`, `dense` | 24 × 12 | 24 × 10 pintados; alvo 24 × 12 | `specimen/number-field/slotted-light-720-dense.json` |
| botão `split`, `sm` denso | 24 × 24 rente | 18 × 18 pintados; alvo 24 por `::after` | idem |
| hover, active, foco | — | deltas iguais aos de antes (§ 4) | specimen claro e escuro |

Lido também em escuro, alto contraste e rtl (`/tmp/number-field-{dark-comfortable-ltr,light-comfortable-rtl}-420.png`). Em escuro, o chão de desativado de uma metade no limite fica a um passo do chão do campo: a tinta continua a distinguir o estado, como antes desta passagem.

Linha 5 (`currency-field`) por aplicar: `/reui currency-field polish`.

## Parte `scrub`

Decisão do revisor depois da gate: adotar. A corrida passa a `build` para esta linha.

- **Onde vive.** Dentro de `start` ou `end`, não no rótulo do `field`. O ReUI envolve o rótulo, que fica fora do grupo. No Slotted, o rótulo pertence ao `field` e a moldura à família. Uma parte dentro da moldura é da família, chega ao controlo sem referência cruzada e segue a convenção das ferramentas de desenho (letra ou ícone dentro do campo).
- **Forma.** React `NumberFieldScrub` (um `span` com todas as props nativas e `sensitivity`), ligado por contexto ao `NumberField` que o desenha. Angular `[slNumberFieldScrub]`, que injeta o `SlNumberField` antepassado.
- **Gesto.** Captura do ponteiro, `sensitivity` píxeis por passo (2 por omissão, `SCRUB_SENSITIVITY` em `@slotted/core/number`), `Shift` para `largeStep`, `Alt` para `smallStep`, razão `pointer`, um commit por passo inteiro. A aritmética vive em `createScrub`, partilhada pelas duas ligações.
- **Em que supera o ReUI.** Em rtl, o passo para cima segue a ponta final (o Base UI ignora a direção). O valor percorrido fica numa referência, de modo que movimentos chegados antes de um render não se perdem (teste `counts every move even when they arrive before a render`).
- **Acessibilidade.** `aria-hidden` por omissão e sem foco: as setas do `input` são o equivalente de teclado. Uma pressão foca o `input`.
- **Estado.** `data-scrubbing` na raiz e na parte durante o arrasto. A tinta sobe de `--slotted-text-muted` para `--slotted-text` em hover e durante o arrasto. Em `disabled` e `readonly`, cursor `default` e nenhum efeito.
- **Custo registado.** Sem bloqueio do ponteiro (`requestPointerLock`): o arrasto termina no limite do ecrã. O bloqueio esconde o cursor e exige um cursor virtual.
- **Mudança de contrato.** Parte `scrub`, bloco `scrub`, `commitOn` com `scrub`, `dataAttributes` com `data-scrubbing`, cenário `scrub`. Nenhum consumidor a migrar.
