# `currency-field` — dossiê ReUI (2026-10-01)

## 0. Cabeçalho

Família `currency-field`, modo `polish`, HEAD lido `a75b0df9` (`review/implementation-pass-1`).

## 1. Seleção

Cobertura `análogo`: o ReUI não tem primitivo de moeda; desenha o símbolo como adorno de `input-group`, o montante dentro de formulários e um montante de destaque num assistente. Termos procurados em `tools/harness/out/specimen/reui-llms-full.txt`: `currency` 6, `price` 34, `amount` 14 linhas. Fontes `/r/` de `c-input-1` a `-31`, `c-input-group-1` a `-12` e `c-number-field-1` a `-12` procuradas por `currency|$|USD|EUR|price|amount`: só `c-input-group-9` (`$` … `USD`) e `c-number-field-6` (validação de `amount`, sem moeda) desenham dinheiro.

| Item | Tipo | Rota | Parte ou interação Slotted que informa | Capturas |
| ---- | ---- | ---- | -------------------------------------- | -------- |
| `c-input-group-9` | exemplo | `/preview/base/example/c-input-group-9` | `start`, `end`, `input` | `specimen/c-input-group-9/c-input-group-9-{light,dark}-1280-data-slot-input-group-co-a4af54.json` |
| `form-12` | bloco Pro | `/preview/base/form-12` | preço e preço de comparação num formulário de produto | `specimen/form-12/form-12-{light,dark}-1280.json` |
| `wizard-7` | bloco Pro | `/preview/base/wizard-7`, passo 2 por `--click '[data-slot=item]' --click '…Continue'` | montante de destaque alinhado ao fim | `specimen/wizard-7/wizard-7-light-1280-click-data-slot-item-data-slot-3b0b0f.json` |
| `c-number-field-1` | exemplo | já capturado no dossiê de `number-field` | `split`, `decrement`, `increment` | `specimen/c-number-field-1/c-number-field-1-light-1280-data-slot-number-field-i-471277.json` |

Slotted: `specimen/currency-field/slotted-{light,dark,high-contrast}-720-data-ui-currency-field-i-291883.json` (steppers), `slotted-light-720-data-ui-currency-field-d-c12ea4.json` (moldura), `slotted-light-720-{dense,rtl,forced,motion-reduce}.json`.

## 2. Anatomia

| `data-slot` ReUI | Parte Slotted | Estado |
| ---------------- | ------------- | ------ |
| `input-group` | `root` | igual |
| `input-group-control` | `input` | igual |
| `input-group-addon` (`inline-start`) | `start` | igual |
| `input-group-addon` (`inline-end`) | `end` | igual |
| `number-field-decrement`, `-increment` | `decrement`, `increment` | igual |
| — | `stepper` (coluna empilhada) | só no Slotted |
| — (símbolo só como adorno) | símbolo dentro do valor por `Intl`, selecionado, copiado e lido com ele | só no Slotted |

## 3. Medidas

ReUI a 1280 px, Slotted a 720 px; nenhuma das propriedades abaixo depende da largura da página.

| Parte | Propriedade | ReUI | Slotted hoje | Alvo | Veredicto |
| ----- | ----------- | ---- | ------------ | ---- | --------- |
| root | altura | 32 | 34 | `--slotted-control-height-md` | superar: a escala de controlo da biblioteca |
| root | raio | 10 | 4 | `--slotted-control-radius` | recusar: o raio é do tema |
| root | borda | 1 | 1 | `--slotted-control-border-width` | igual |
| root | padding em linha | 0 (o adorno leva 8) | 13 | `--slotted-control-padding-inline-md` | recusar: escala de controlo |
| input | tamanho de letra | 14 | 13 | `--slotted-control-font-size-md` | recusar: escala de controlo |
| input | algarismos | `normal` (`form-12`, `c-input-group-9`); `tabular-nums` só no destaque de `wizard-7` | `tabular-nums` sempre | — | superar: em entrada por cêntimos cada tecla reescreve a cadeia inteira |
| input | alinhamento | início (`form-12`); fim só a partir de `sm` em `wizard-7` | fim por omissão, `align="start"` disponível | — | superar: um montante lê-se pelo último algarismo |
| start/end | cor | `oklch(0.556 0 0)` | `rgb(91 107 127)` (`--slotted-text-muted`) | `--slotted-text-muted` | igual em papel |
| start/end | peso | 500 | 400 | 400 | recusar: o símbolo recua face ao valor; o ReUI pesa-o acima do montante (400) |
| start → valor | distância | 6 (padding do controlo) | 10 (gap 8 + margem ótica 2) | igual | recusar: a margem ótica é a de `text-field` |
| decrement/increment (`split`) | caixa | 32 × 30, rente | 24 × 32, rente (`slotted-light-720-…-291883.json`, índices 6 e 7) | `--_action-size` ao quadrado (24 × 24 em `md`), inset concêntrico `--_inset` (4 em `md`) | adaptar: a regra de `number-field`, já aplicada ao irmão |
| decrement/increment (`split`) | raio | 10 | 3 nos cantos de fora | `max(--slotted-radius-xs, raio − inset)` = 2 | adaptar |
| decrement/increment (`split`) | separador | nenhum | 1 px `--slotted-border-subtle` | nenhum | adotar: o chão do hover delimita o botão |
| stepper (`stacked`) | coluna | — | 25 × 32 rente, separador de 1 px em linha | coluna inset de `--slotted-space-1` em bloco e na ponta final, sem separadores | adaptar: igual ao irmão |
| increment/decrement (`stacked`) | caixa | — | 24 × 16 (`md`), 24 × 12 (`dense`), separador de 1 px entre metades | 24 × 14 pintados (`md`), 24 × 10 (`dense`), raio 2; alvo devolvido até à moldura por `::after` | adaptar |
| input (`split`) | inset do valor | — | `--_padding-inline` a partir do botão | igual | igual: os algarismos ficam à mesma distância da borda útil nas três disposições |

## 4. Coreografia de estados

| Parte | Estado | Delta ReUI | Delta Slotted hoje | Alvo |
| ----- | ------ | ---------- | ------------------ | ---- |
| root | hover | nenhum (`c-input-group-9`) | `border-color` `rgb(191 199 209)` → `rgb(37 99 235)` | igual |
| root | focus-visible | borda → `oklch(0.708 0 0)`, anel 3 → 1 px `oklab(0.708 0 0 / 0.5)` | anel 2 px `--slotted-focus-ring-color` com offset 2 e sombra recolorida | igual |
| increment/decrement | hover | `background-color` transparente → `oklch(0.97 0 0)` (`c-number-field-1`) | transparente → `rgb(241 245 249)` | igual, no chão inset |
| increment/decrement | active | igual ao hover | → `rgb(226 232 240)` | igual |
| increment/decrement | focus-visible | `outline` automático 1 px | 2 px sólido `rgb(37 99 235)`, offset −2 | igual, a contornar o chão inset |
| decrement no limite | disabled | sem regra | hover e active vazios; chão `--slotted-disabled-background`, tinta `--slotted-disabled-foreground` (índices 3 e 4) | o mesmo par, no chão inset |

Escuro: hover `rgb(34 34 37)`, active `rgb(39 39 42)`, anel `rgb(96 165 250)` sobre `rgb(19 19 22)`. Alto contraste: hover `rgb(230 230 230)`, active `rgb(204 204 204)`, anel `rgb(0 0 0)`.

## 5. Movimento

ReUI: cor, fundo, borda e `outline-color` em 150 ms `cubic-bezier(0.4, 0, 0.2, 1)`; sem regra de movimento reduzido. Slotted: moldura em `background-color`, `border-color`, `box-shadow`; steppers em `background-color`, `color`; 120 ms (`--slotted-control-transition-duration`); 0,001 s sob `--motion reduce` (`slotted-light-720-motion-reduce.json`). Alvo: sem alteração.

## 6. Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| ---------- | -------------------- | ------------- | ---------------- | ------------------------------- | --------- | ------------------------- |
| Montante de destaque (36 px, peso 600, sem moldura, alinhado ao fim) | `wizard-7`, passo 2 | `Input` com `className` que retira borda, fundo, padding e o anel de foco (`focus-visible:ring-0`) | — (o tamanho maior é `lg`, 14 px) | — | decisão na gate: uma terceira forma de tamanho entra no contrato e move a corrida para `build` | — |
| Símbolo e código como adornos | `c-input-group-9`, `form-12` | `InputGroupAddon` + `InputGroupText` | partes `start` e `end`; o símbolo do valor vem de `Intl` | o símbolo de `Intl` segue a moeda e a localidade sem texto do consumidor | igual | — |
| Seletor de moeda ao lado do montante | `wizard-7` (`USD` com bandeira) | `Select` irmão fora do campo | `start` aceita qualquer controlo; `currency` é prop | composição por parte, não por variante | igual | — |
| Validação de intervalo | `c-number-field-6` | `zod` + `aria-invalid` no grupo | `min`, `max`, `clamp`, `invalid` espelhado pelo `field` | o estado inválido e o anel vêm do campo à volta | igual | — |

## 7. Superar

| Critério | ReUI | Slotted hoje | Alvo | Fonte |
| -------- | ---- | ------------ | ---- | ----- |
| Grelha de píxeis | sim: 32 | sim: 34, metades 16 | sim: 34, metades 14 | § 3 |
| Hover | moldura sem delta | moldura e steppers com delta; passo de chão `rgb(255 255 255)` → `rgb(241 245 249)` | igual | § 4 |
| Pressão | active = hover nos botões | passo próprio `rgb(226 232 240)` | igual | § 4 |
| Foco | 1 px automático; destaque de `wizard-7` sem anel | 2 px, `rgb(37 99 235)` sobre branco, preto em alto contraste | igual | § 4 |
| Transição | `outline-color` listado, sem token | todas as propriedades pintadas listadas, tokens de movimento | igual | § 5 |
| Movimento | — | sem entrada nem saída: nada aparece nem se move | igual | CSS |
| Movimento reduzido | sem regra | 0,001 s | igual | `slotted-light-720-motion-reduce.json` |
| Desativado | `opacity: 0.5` | par de tokens de desativado, sem opacidade | igual | CSS |
| Esquemas | — | `plain` recupera `ButtonBorder` em forced colors | igual | `slotted-light-720-forced.json` |
| Densidade e RTL | — | `dense`: metades 24 × 12; `rtl`: coluna à esquerda (x 56), valor em `plaintext` | `dense`: 24 × 10 pintados, alvo 24 × 12 | `slotted-light-720-{dense,rtl}.json` |
| Alvo | sim: 32 × 30 | `stacked` 24 × 16 | 24 × 16 por `::after` com 14 pintados | § 3 |
| Botão interior concêntrico | não | não: rente, raio 3 | sim: inset 4, raio 2 | § 3 |
| Sem linhas que não separam superfícies | sim | não: um separador por botão `split`, dois em `stacked` | sim | § 3 |
| Intenção | — | `--slotted-currency-field-stepper-border-color` deixa de ter uso | token retirado; `--slotted-currency-field-action-size` acrescentado | `currency-field.tokens.json` |

## 8. Delta

| #   | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| --- | -------- | ------- | ---------------------------- | ------------------- |
| 1 | `packages/styles/src/currency-field/currency-field.css` | `--_action-size`, `--_inset`, `--_action-radius`, `--_column-inset`, `--_column-radius` na raiz, no lugar de `--_inner-radius` | § 3 caixa e raio | specimen `split` claro |
| 2 | idem | `split`: moldura com `padding-inline: var(--_inset)`; botões `--_action-size` ao quadrado com `--_action-radius`; sem separadores; em ponteiro grosso só o `::after` cresce | § 3, § 7 concêntrico e linhas | specimen `split` claro, escuro, alto contraste |
| 3 | idem | `stacked`: coluna com `padding` de `--_column-inset` em bloco e na ponta final, sem separadores; metades com `--_column-radius`; `::after` de cada metade estende o alvo até à moldura | § 3 coluna, § 7 alvo | specimen `stacked` claro e `dense` |
| 4 | `packages/styles/src/currency-field/currency-field.tokens.json` | `--slotted-currency-field-action-size`, `--slotted-radius-xs`, `--slotted-space-1` entram; `--slotted-currency-field-stepper-border-color` sai | § 7 intenção | `pnpm check:affected` |
| 5 | `packages/styles/src/currency-field/currency-field.styles.test.mjs` | asserções de inset, raio concêntrico e ausência de separadores, como em `number-field` | § 3 | teste |
| 6 | `specs/components/currency-field/contract.json` | montante de destaque | § 6 linha 1 | contrato; pendente da gate |

## Gate

Só `polish`: delta 1–5 aplicado; linha 6 (montante de destaque) adiada, sem contrato.

## Resultado

| Linha | Antes | Depois | Fonte |
| ----- | ----- | ------ | ----- |
| botão `split`, `md` | 24 × 32 rente, raio 3, separador de 1 px | 24 × 24, inset 4, raio 2, sem separador | `specimen/currency-field/slotted-light-720-data-ui-currency-field-i-291883.json`, índices 6 e 7 |
| metade `stacked`, `md` | 24 × 16 rente, separadores de 1 px | 24 × 14 pintados, raio 2, sem separadores; alvo até à moldura por `::after` | idem, índices 0 a 5 |
| metade `stacked`, `dense` | 24 × 12 | 24 × 10 pintados; alvo 24 × 12 | `slotted-light-720-dense-data-ui-currency-field-i-291883.json` |
| botão `split`, `dense` | 24 × 24 rente (`slotted-light-720-dense.json`) | 18 × 18 pintados; alvo 24 por `::after` | `slotted-light-720-dense-data-ui-currency-field-i-291883.json`, índices 6 e 7 |
| hover, active, foco | — | deltas iguais aos de antes em claro, escuro e alto contraste (§ 4) | specimens `slotted-{light,dark,high-contrast}-720-…-291883.json` |

Em escuro, o chão de desativado de uma metade no limite (`rgb(34 34 37)` contra o campo `rgb(19 19 22)`) fica a um passo do chão do campo; a tinta continua a distinguir o estado, como em `number-field`.

## Parte `scrub`

Corrida `build` aberta depois do commit `8b7cbdee`, que deu a `number-field` a parte `scrub`. O teste de contrato `draws the same frame the sibling numeric control draws` exige a mesma anatomia nas duas famílias.

**Inventário.**

- **Surveyed.** Base UI `NumberField.ScrubArea` (através de `c-number-field-1` a `-5`); `number-field` desta biblioteca.
- **Table stakes.** Arrasto horizontal, sensibilidade em píxeis por passo, modificadores de passo.
- **Differentiators.** Direção rtl; valor percorrido guardado numa referência.
- **Gaps.** Bloqueio do ponteiro, já recusado em `number-field` pelo mesmo custo.

**Decisão.** Adotar, com o bloco `scrub` de `number-field` sem alterações (o teste compara os dois blocos). Cada passo vale `step`, uma unidade inteira da moeda por omissão. `Shift` move `largeStep` e `Alt` move `smallStep`. O pedido carrega `minorUnits` do montante movido, calculado a partir do número e não da distância. A marca natural é o símbolo em `start` com `currencyDisplay="none"`: arrastar `R$` move o montante.

**Custo.** O contrato ganha a parte, o bloco `scrub`, `commitOn` com `scrub`, `dataAttributes` com `data-scrubbing` e o cenário `scrub`. Não há consumidor a migrar.

**Autoavaliação da parte `scrub`.** Specimen `specimen/currency-field/slotted-light-720-data-ui-currency-field-d-d9eb6d.json`, capturas `/tmp/currency-field-scrub-*.png`.

| Critério | Resultado | Número |
| -------- | --------- | ------ |
| Grelha de píxeis | passa | marca 17,31 × 32, altura inteira; `start` estica até à moldura |
| Hover | passa | `color` `rgb(91 107 127)` → `rgb(15 23 42)` |
| Pressão | igual ao hover na própria marca | a pressão foca o `input` e acende o anel da moldura; `number-field` tem o mesmo delta |
| Foco | não aplicável | `aria-hidden`, sem foco; as setas do `input` são o equivalente |
| Transição | passa | `transition-property: color`, 120 ms em `--slotted-control-transition-duration` |
| Movimento reduzido | passa | duração colapsada pelo tema |
| Desativado | passa | tinta `rgb(100 116 139)` (`--slotted-disabled-foreground`), `cursor: default`, sem opacidade |
| Esquemas | passa | alto contraste: marca a preto sob arrasto e no hover |
| Densidade e RTL | passa depois da correção | rtl lia `$R`; `unicode-bidi: plaintext` repõe `R$` |
| Alvo | passa | 32 de altura (a moldura menos a borda) |
| Intenção | passa | um token novo, `--slotted-currency-field-scrub-active-color` |

Testes: React 72/72 (`currency-field.test.tsx`, seis casos `CurrencyFieldScrub`), Angular 51/51 (quatro casos `slCurrencyFieldScrub`), contrato 31/31, estilos da família 26/26, `test:contracts` 2157/2157, `test:docs`, `typecheck` e `eslint` sem erros. O `minorUnits` do pedido segue o montante movido: 13 → 1300, 12 → 1200.

Página de referência Angular (6007) auditada a 1280 px: 29 palcos, sem achados. A página React (6006) não desenha nenhuma demonstração, nem as de `button` e `number-field`: é o servidor, não a família.

Auditoria Angular a 620 px: 29 palcos, sem achados. A página React continua sem leitura depois do reinício da 6006: os módulos respondem 200, mas o preview não inicializa (`body` sem classe, `#storybook-root` vazio), também em `button`.
