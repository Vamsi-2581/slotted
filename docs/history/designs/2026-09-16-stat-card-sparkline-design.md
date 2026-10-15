# Desenho — `stat-card` e `sparkline`

Inventário em `2026-09-16-stat-card-sparkline-capability-inventory.md`. Este
documento regista as decisões que sobrevivem à sessão: a escala de cor de
dados, a geometria do primeiro SVG da biblioteca, a anatomia dos dois roots e
as duas tabelas de integração de `references/frameworks.md`.

## 1. A escala de dados

`--slotted-data-1` … `--slotted-data-8`, camada semântica, eixo `scheme`,
raízes de escala. Oito matizes numa ordem fixa; a posição é o mecanismo de
segurança para daltonismo e não uma preferência: as 5040 ordens dos oito
matizes foram enumeradas com os passos Tailwind candidatos por esquema
(`scratchpad/palette-joint.mjs`), e a ordem escolhida é a que maximiza a menor
separação adjacente comum aos três esquemas.

| Posição | Matiz    | Light     | Dark      | High contrast |
| ------- | -------- | --------- | --------- | ------------- |
| 1       | azul     | `#2563eb` | `#2563eb` | `#1d4ed8`     |
| 2       | laranja  | `#ea580c` | `#ea580c` | `#c2410c`     |
| 3       | ciano    | `#0891b2` | `#0891b2` | `#0e7490`     |
| 4       | vermelho | `#dc2626` | `#ef4444` | `#b91c1c`     |
| 5       | violeta  | `#7c3aed` | `#8b5cf6` | `#6d28d9`     |
| 6       | âmbar    | `#a16207` | `#d97706` | `#a16207`     |
| 7       | magenta  | `#c026d3` | `#d946ef` | `#a21caf`     |
| 8       | verde    | `#16a34a` | `#16a34a` | `#15803d`     |

Medido por `scripts/validate_palette.js` da skill `dataviz`:

- `light` sobre `#ffffff`: banda de luminosidade e piso de croma cumpridos;
  pior par adjacente CVD ΔE 19,5 (alvo ≥ 8); visão normal ΔE 30,8 (piso ≥ 15);
  todos ≥ 3:1 (mínimo 3,30; sobre `--slotted-surface-sunken` 3,15).
- `dark` sobre `#131316`: banda e croma cumpridos; CVD ΔE 16,8; visão normal
  30,8; todos ≥ 3:1 (mínimo sobre `--slotted-surface-raised` 3,29).
- `high-contrast` sobre `#ffffff`: CVD ΔE 17,1; visão normal 26,9; todos ≥ 4,5:1
  (mínimo 4,92). A banda e o croma são verificações de um esquema claro
  corrente; o esquema toma o passo mais fundo de cada matiz pelo motivo que
  **File kind** tomou.
- As três primeiras posições passam o teste de todos os pares (`--pairs all`)
  em `light` e `dark` (ΔE 14,7), que é o limite de séries para dispersão e
  pequenos múltiplos que `chart` herda.

A posição 1 é o azul do tema: `--slotted-tone-accent-border` em `light` e
`--slotted-tone-accent-solid` em `dark` têm o mesmo valor. Um sparkline sem
tom nem série pinta-se nele.

O que a escala não tem: um neutro e uma sequência. O neutro de dados é
`--slotted-text-muted` — a série de comparação, o tom `neutral` — e a linha de
referência é `--slotted-border-strong`, a linha entre duas superfícies a 3:1.
Uma rampa sequencial é de `chart`, onda 12, porque nenhum consumidor desta
sessão a lê. Sob `forced-colors` a escala inteira é `CanvasText`: uma série,
e a identidade passa a textura ou a rótulo, que é a decisão de `chart`.

`docs/token-foundation.md` ganha a secção **Data**;
`scripts/verify-token-foundation.test.mjs` exclui o prefixo da tabela de cor
semântica e verifica a tabela própria; `packages/theme-default/test/default-theme.test.mjs`
mede os oito valores contra `--slotted-surface`, `--slotted-surface-raised` e
`--slotted-surface-sunken` e exige oito valores distintos por esquema.

## 2. Dois passos novos na escala de tipo

`--slotted-font-size-4xl: 2rem` e `--slotted-line-height-4xl: 1.2`. A escala
parava em `3xl` (1,5 rem), o tamanho de um `h2`; o valor de um KPI principal
lê-se a 30–32 px em Tremor (`text-3xl`), Vercel e Stripe. `size="lg"` do card
é o único consumidor nesta sessão; `typography` e `chart` ficam com o passo
disponível. `--slotted-line-height-4xl` continua a série decrescente da escala
(1,3 → 1,2).

## 3. `sparkline`

### Anatomia

```
root  span  role="img" aria-label="…"  data-ui="sparkline"
        data-type  data-size  [data-tone]  [data-series]  [data-curve]
└─ plot  svg  aria-hidden  viewBox="0 0 w h"  preserveAspectRatio="none"
   ├─ area       path   (type=line, area=true)
   ├─ line       path   (type=line)   vector-effect="non-scaling-stroke"
   ├─ bar        rect ×n (type=bar)   o último com data-current
   ├─ reference  line   (reference definido)
   └─ marker     circle (type=line, marker=true, no último ponto não nulo)
```

O root é `role="img"` com o nome gerado; o `svg` é `aria-hidden`, porque um
gráfico sem interação é uma imagem e o seu conteúdo são píxeis. A descrição
gerada segue a forma "{label}: {último}, {sentido} {variação} desde {primeiro}"
com as mensagens do provider (`up`, `down`, `flat`, `noData`), e `description`
substitui-a inteira.

### Geometria

O motor é `@slotted/core/sparkline`: `layoutSparkline({ data, width, height,
type, min, max, reference, curve, inset })` devolve os caminhos, os retângulos,
a referência, o marcador e o resumo (`first`, `last`, `min`, `max`, `delta`).
Puro, sem DOM. Duas ligações a calcular o mesmo caminho seriam duas respostas
para uma pergunta.

O plot mede-se: um `ResizeObserver` sobre o root, pelo padrão de
`createWidthGate`, entrega largura e altura em píxeis, e o motor desenha nessa
grelha. Antes da medida — servidor, primeiro paint — o motor desenha no
tamanho nominal do passo (`96 × 24 | 32 | 48`) e `preserveAspectRatio="none"`
com `vector-effect="non-scaling-stroke"` mantém o traço a 2 px durante o único
frame esticado. A altura vem da folha (`--slotted-sparkline-block-size-*`); o
root a mede.

Marcas, de `references/marks-and-anatomy.md` da skill `dataviz`: linha 2 px,
juntas e pontas redondas; área ao tom a 16 % no topo e 0 na base; marcador
r = 4 com anel de 2 px na cor da superfície; barras com gap de 2 px, topo
arredondado a 2 px, base quadrada na linha de base, as anteriores a 45 % do
tom e a atual a 100 %; referência tracejada de 1 px. Barras com menos de 2 px
perdem o gap e desenham-se contíguas a 1 px de largura mínima.

Domínio: linha usa `[min(data), max(data)]`, barra usa
`[min(0, min(data)), max(0, max(data))]`; `reference` entra no domínio;
`min`/`max` do consumidor vencem. Domínio degenerado (série constante) põe a
linha a meia altura. `null`, `NaN` e `±Infinity` são falhas: a linha
interrompe-se, a barra não se desenha, e o resumo ignora-os.

Cor: `--slotted-sparkline-color` resolve na ordem `[data-tone]` →
`[data-series]` → `var(--slotted-sparkline-color-inherited, --slotted-data-1)`.
`--slotted-sparkline-color-inherited` é o que um contentor escreve — o `trend`
do card — e é uma propriedade de runtime, não um token de desenho.

### Sem estado mutável

`data` é `measurement`: uma quantidade que o consumidor declara e a família
desenha. Não há `stateModel`, nem foco, nem teclado. O root não é focável.

## 4. `stat-card`

### Anatomia

```
root  div  data-ui="stat-card"  data-size  data-fill  data-layout  data-status
          [data-loading]  [data-tone]  [data-good-when]
├─ header
│  ├─ label      (o nome da métrica; um elemento de texto, não um heading)
│  ├─ status     (slot: badge, status-indicator)
│  └─ action     (render: link ou button; fim da linha)
├─ figure
│  ├─ value      (number + formatOptions, ou children)
│  │  └─ unit    (onde o consumidor a puser: antes ou depois)
│  └─ delta      data-trend  data-tone
│     └─ indicator  (máscara: trending-up, virada para down; minus para flat)
├─ comparison    (prosa: "de 1.204")
│  └─ period     ("vs. mês anterior")
├─ trend         (slot: sparkline; escreve --slotted-sparkline-color-inherited)
└─ message       (status empty | error: o texto)
```

`layout: inline | stacked`. `inline` põe `trend` ao lado da figura;
`stacked` põe-o a toda a largura sob a comparação. O root é um contentor de
consulta (`stat-card`); abaixo de 220 px `inline` passa a `stacked` e o valor
cai um passo de tipo.

### Tom

`goodWhen: up | down | none` no root, por omissão `up`. `delta` calcula
`trend` do sinal do seu valor e `tone` do par (`trend`, `goodWhen`): `up`+`up`
e `down`+`down` → `success`; `up`+`down` e `down`+`up` → `danger`; `flat` ou
`none` → `neutral`. Um `tone` explícito no `delta` vence. O root escreve o tom
do primeiro `delta` em `data-tone` e em `--slotted-sparkline-color-inherited`
na parte `trend`, por contexto (React) e por injeção (Angular); um `tone`
explícito no root vence, e um `tone` explícito no `sparkline` vence os dois.

O `value` não veste o tom, salvo `tone` explícito no root; o número inteiro a
verde é um farol, e um painel com doze faróis não tem nenhum.

### Estados

`loading` (`data-loading`): cada parte de texto rende um `skeleton` de
`shape="text"` com a sua altura de linha; `trend` rende `shape="block"` com a
altura do sparkline; o root é uma `skeleton` `region`. O valor anterior não
fica visível.

`status: ready | empty | error`. `empty` e `error` pintam `—` em `value`,
omitem `delta` e `trend`, e mostram `message`. `error` pinta a mensagem em
`--slotted-tone-danger-text`. Precedência: `loading` > `error` > `empty`.

### Sem estado mutável

Nenhuma capacidade de `MUTABLE_CAPABILITIES`. `action` é um controlo do
consumidor; o card não o abre nem o fecha.

## 5. Integração — React

| Pergunta                           | `sparkline`                                                                                            | `stat-card`                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Par controlado / não controlado    | Não: nada é mutável; `data` é medição.                                                                 | Não: nada é mutável.                                                                                                   |
| Defaults uma vez                   | `SparklineDefaultsProvider` / `useSparklineDefaults`: `locale`, `messages`, `curve`, `marker`, `area`. | `StatCardDefaultsProvider` / `useStatCardDefaults`: `locale`, `goodWhen`, `fill`, `size`, `messages`.                  |
| Substituir o elemento de cada parte | `render` no root; `plot` é fixo (`svg`), as marcas são fixas (`path`, `rect`, `line`, `circle`).       | `render` em `root`, `label`, `value`, `action`, `comparison`, `message`; `indicator` e `unit` fixos.                   |
| Handler do consumidor corre        | O root não trata evento nenhum; os props passam.                                                       | Idem; `action` é o elemento do consumidor.                                                                             |
| `ref` e ação imperativa            | `ref` no root; nenhuma ação imperativa.                                                                | `ref` em cada parte; nenhuma ação imperativa.                                                                          |
| SSR sem mismatch                   | Primeira renderização no tamanho nominal; a medida corre em `useLayoutEffect`. `useId` para o gradiente. | `useId` para o `aria-labelledby` do root (rótulo) e para o `skeleton`.                                                 |
| Estados no DOM                     | `data-type`, `data-size`, `data-tone`, `data-series`, `data-curve`; `data-current` na última barra.    | `data-size`, `data-fill`, `data-layout`, `data-status`, `data-loading`, `data-tone`, `data-trend` (delta), `data-good-when`. |
| Props do elemento nativo           | `ComponentPropsWithRef<'span'>`.                                                                       | `ComponentPropsWithRef<'div'>` e o de cada parte.                                                                      |

## 6. Integração — Angular

| Pergunta                              | `sparkline`                                                                                  | `stat-card`                                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `model()` para valor bidirecional     | Não: nada é mutável.                                                                         | Não.                                                                                                         |
| Reactive Forms                        | Não: não é um controlo.                                                                      | Não.                                                                                                         |
| Defaults uma vez                      | `SPARKLINE_DEFAULTS_TOKEN`, `provideSparklineDefaults()`.                                    | `STAT_CARD_DEFAULTS_TOKEN`, `provideStatCardDefaults()`.                                                     |
| `exportAs`                            | `slSparkline`.                                                                               | `slStatCard`, `slStatCardDelta`.                                                                             |
| Projeção                              | Nenhuma: o `svg` é da família.                                                               | `ng-content` por parte; cada parte é uma diretiva no elemento do consumidor.                                 |
| Zoneless / OnPush                     | `input()` e `computed`; a medida escreve um `signal`.                                        | `input()`, `computed`; o tom do delta chega ao root por um `signal` partilhado.                              |
| Teardown                              | `DestroyRef` desliga o `ResizeObserver`.                                                     | Nada a desligar.                                                                                             |
| Atributo estático sobrevive           | `HostAttributeToken('aria-label')`: um rótulo escrito pelo consumidor vence a descrição gerada. | `HostAttributeToken('aria-label')` no root; `data-part` reescrito onde outra diretiva o apagaria (nenhuma).  |
| Um entry point por classe             | `@slotted/angular/sparkline`.                                                                | `@slotted/angular/stat-card`; importa `@slotted/angular/skeleton`.                                           |

## 7. O que custa

- O `viewBox` esticado antes da medida é um frame no servidor sem hidratação;
  o custo é uma linha a 2 px sobre uma grelha esticada, e o marcador — um
  círculo — esticado em elipse nesse frame só. A alternativa, uma largura
  declarada, transfere a medida para o consumidor em cada célula de tabela.
- A escala de dados são oito tokens de esquema com mapa `forced-colors`; a
  tabela **Forced colours** cresce oito linhas.
- `4xl` é um passo que `typography` não lê ainda; fica registado em
  `docs/process/build-order.md` como reabertura de `typography`.
- `stat-card` repete a moldura de `card` em tokens próprios
  (`--slotted-stat-card-*`) em vez de compor o `card`: um `card` traz `media`,
  `body`, `link` e `selection`, e um KPI não tem nenhum deles.
