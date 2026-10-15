# Dossiê ReUI — app shell (arranjos)

## 0. Cabeçalho

- Família: `app-shell`
- Modo: `build`. O delta da secção 8 edita `specs/components/app-shell/contract.json`.
- Data: 2026-09-29
- HEAD: `18cf9829` (ramo `review/implementation-pass-1`)
- Specimens ReUI: `tools/harness/out/specimen/app-shell-<n>/app-shell-<n>-light-1440.{json,png}`, n = 1…31.
- Specimen Slotted: `tools/harness/out/specimen/nexora-shell/nexora-shell-light-1440.{json,png}` (demo Nexora, `/dashboard`, `canvas="inset"`, `primary="banner"`). A página de harness da família renderiza no máximo 720 px; um shell de desktop mede-se a 1440 px na demo.
- Pedido de origem: arranjos de shell tão variados como os 31 blocos ReUI, obtidos por composição de eixos e não por páginas prontas; escolha do arranjo nas preferências de conta da demo.

## 1. Seleção

Cobertura: `direta`. O ReUI publica 31 blocos Pro `app-shell-1` … `app-shell-31` e cinco exemplos `c-sidebar-1` … `c-sidebar-5`. O primitivo é o `Sidebar` do shadcn/ui.

Termos pesquisados em `llms-full.txt` (2188 linhas): `app shell` 29, `sidebar` 69, `inset` 19, `floating` 18, `icon rail` 9, `topbar` 3, `dual sidebar` 2.

Os 31 blocos foram capturados a 1440 px, tema claro, estilo `nova`, base `base`. A triagem usou as 31 capturas em quatro folhas de contacto. Os oito itens abaixo fornecem as medidas das secções 3 e 6; os restantes entram só na tabela de arranjos da secção 6.

| Item           | Tipo      | Rota                     | Parte ou interação Slotted que informa                              | Capturas     |
| -------------- | --------- | ------------------------ | ------------------------------------------------------------------- | ------------ |
| `app-shell-1`  | Pro block | `/preview/base/app-shell-1`  | `nav` como folha com regra; banner dentro de `main`             | `light-1440` |
| `app-shell-2`  | Pro block | `/preview/base/app-shell-2`  | `nav` como cartão flutuante; `main` de ponta a ponta            | `light-1440` |
| `app-shell-3`  | Pro block | `/preview/base/app-shell-3`  | `canvas="inset"`; banner dentro do cartão de conteúdo           | `light-1440` |
| `app-shell-8`  | Pro block | `/preview/base/app-shell-8`  | trilho de ícones + coluna secundária; banner no cartão          | `light-1440` |
| `app-shell-13` | Pro block | `/preview/base/app-shell-13` | `primary="banner"` com folhas e regras                          | `light-1440` |
| `app-shell-16` | Pro block | `/preview/base/app-shell-16` | trilho + coluna separados por tom, sem regra                    | `light-1440` |
| `app-shell-18` | Pro block | `/preview/base/app-shell-18` | `nav`, `main` e `aside` como três cartões                       | `light-1440` |
| `app-shell-28` | Pro block | `/preview/base/app-shell-28` | um só cartão que contém `nav` e `main`; banner no fundo         | `light-1440` |

Capturas por fazer no passo `/component`: tema escuro dos oito itens, `--motion reduce` de `app-shell-2` (abertura do cartão flutuante) e o lado Slotted em `dark`, `high-contrast`, `--forced-colors active`, `--density dense` e `--dir rtl` para cada arranjo novo.

## 2. Anatomia

| `data-slot` ReUI                         | Parte Slotted          | Estado                 |
| ---------------------------------------- | ---------------------- | ---------------------- |
| `sidebar-wrapper`                        | `root`                 | igual                  |
| `sidebar-container`, `sidebar-inner`     | `nav`                  | igual                  |
| `sidebar-header`                         | `nav-header`           | igual                  |
| `sidebar-content`                        | `nav-body`             | igual                  |
| `sidebar-footer`                         | `nav-footer`           | igual                  |
| `sidebar-inset`                          | `main`                 | igual                  |
| `header` dentro de `sidebar-inset`       | `banner`               | igual                  |
| `sidebar-rail` (faixa de arrasto de 16 px) | —                    | em falta no Slotted    |
| primeiro `sidebar` de largura 63–76 px + segunda coluna (`app-shell-8`, `-16`) | — | em falta no Slotted |
| `aside` à direita (`app-shell-6`, `-18`) | `aside`                | igual                  |
| —                                        | `skip`, `scrim`, `layer`, `aside-toggle`, `footer` | só no Slotted |

## 3. Medidas

Largura da página: 1440 px nos dois lados. Tema claro, densidade confortável.

| Parte | Propriedade | ReUI | Slotted hoje | Alvo | Veredicto |
| ----- | ----------- | ---- | ------------ | ---- | --------- |
| `nav` | inline-size, coluna aberta | 256 (`-1`, `-2`, `-3`); 240 (`-13`); 250 (`-18`) | 240 (`nav-size-md`, 15rem) | 15rem | superar: o intervalo ReUI é 240–256 e o Slotted oferece três tamanhos |
| `nav` | inline-size, trilho | 63 (`-8`), 76 (`-16`) | 58 (`row-mark` 34 + 2 × `row-inset` 12) | `--_rail-size` | superar: o trilho Slotted deriva da marca e do recuo publicados |
| `nav`, cartão flutuante | margem ao quadro | 8 (`-2`, `-18`) | inexistente | `--_gutter` (12) | adaptar: o Slotted usa o mesmo gutter do cartão de conteúdo |
| `nav`, cartão flutuante | raio | 10 | inexistente | `--_radius` | adaptar: 10 não tem passo; o raio do quadro é um só token |
| `nav`, cartão flutuante | borda | 1px `oklab(0.922 / 0.8)` (`-2`); 0 (`-18`) | inexistente | `--_rule-width` `--_rule` | adotar |
| `main`, cartão | margem ao quadro | 8 | 12 (`--_gutter` = `control-gap-lg` + `space-2`) | `--_gutter` | recusar: o gutter Slotted responde à densidade |
| `main`, cartão | raio | 14 (`-3`, `-8`); 10 (`-18`) | 8 (`radius-lg`) | `--_radius` | recusar a mudança de valor por omissão; 10 e 14 não têm passo e o token já é público |
| `main`, cartão | borda | 0 (`-3`); 1px `oklch(0.922)` (`-8`, `-18`) | 1px `rgb(216,222,230)` | sem mudança | adotar o que já existe |
| `main`, cartão | sombra | nenhuma | `0 1px 2px rgba(15,23,42,.06)` (`shadow-xs`) | sem mudança | superar: a elevação separa o cartão quando o quadro e a superfície distam 2 % |
| `root` | fundo do quadro | `oklch(0.985)` (`-3`, `-8`); `oklch(0.97)` (`-18`) | `rgb(247,248,250)` | sem mudança | igual |
| `banner` no cartão | block-size | 48 (`-1`, `-3`); 50 (`-8`) | 62 no quadro (`control-height-lg` 38 + 2 × `space-5` 12) | `--_banner-size` | recusar: a barra aloja um controlo de 38 px |
| `banner` no cartão | regra inferior | 0 (`-1`, `-3`); 1px (`-8`) | inexistente | `--_rule` quando `dividers` | adaptar |
| `nav` folha | regra de fim | 1px `oklch(0.922)` (`-1`, `-13`) | 1px `border-subtle` em `flush` + `dividers` | sem mudança | igual |
| separação sem regra | distância de luminosidade entre regiões | trilho 0.985 / coluna 0.97 / conteúdo 1.0 (`-16`): Δ 0.015 e 0.03 | `flush` sem `dividers`: `surface` 255 contra `surface-sunken` 247–250, Δ ≈ 0.02 e nenhuma regra | Δ ≥ 0.03 entre regiões vizinhas | adaptar: é a causa de o arranjo sem linhas não se ler |
| `nav` dentro do painel único | recuo ao quadro | 16 (`-28`) | inexistente | `--_gutter` | adaptar |
| linha de destino | block-size | 32 (`-1`, `-2`, `-3`); 28 (`-28`); 36 (`-16`) | 34 (`row-mark`) | outra família | outra família: `side-navigation` |

## 4. Coreografia de estados

O pedido é de arranjo. Os estados de `nav-toggle` e `aside-toggle` ficam como estão; a secção regista só o que o arranjo acrescenta.

| Parte | Estado | Delta ReUI | Delta Slotted hoje | Alvo |
| ----- | ------ | ---------- | ------------------ | ---- |
| `nav` cartão flutuante | fechado para trilho | largura 256 → 48 + margens 8, o cartão encolhe com a margem | inexistente | o cartão encolhe para `--_rail-size`; a margem mantém-se |
| `nav` com trilho explícito | fechado | a coluna secundária sai; o trilho fica (`-14`, `-16`) | inexistente | a coluna sai por `display: none`; o trilho fica no tab order |
| `main` com banner no cartão | `nav` em overlay | o cartão perde margem e raio abaixo de 768 px | o cartão perde gutter, raio e elevação abaixo de 600 px (`overlayAt`) | igual ao Slotted de hoje, estendido ao banner |

## 5. Movimento

ReUI: a largura do `sidebar-container` transiciona em 200 ms `linear` (`transition-property: left, right, width`). Slotted: a largura de `nav` transiciona em `--slotted-duration-medium` com `--slotted-easing-standard`; `prefers-reduced-motion` anula a duração. Alvo para os arranjos novos: o cartão flutuante e o trilho explícito reutilizam a mesma transição; o painel único não anima.

## 6. Capacidades

### Arranjos observados nos 31 blocos

| Arranjo | Itens | Expressável hoje no Slotted |
| ------- | ----- | --------------------------- |
| Coluna em folha com regra, conteúdo de ponta a ponta | 1, 12, 13, 15, 23 | sim: `canvas="flush"` |
| Coluna no quadro, conteúdo em cartão | 3, 9, 10, 19, 20 | sim: `canvas="inset"` |
| Banner dentro do cartão de conteúdo | 1, 3, 8, 9, 10, 14, 16 | não |
| Coluna em cartão flutuante | 2, 17, 18 | não |
| `nav`, `main` e `aside` como cartões separados | 18, 20 | parcial: `aside` em cartão, `nav` não |
| Um cartão que contém `nav` e `main` | 28, 31 | não |
| Trilho de ícones + coluna secundária | 4, 5, 8, 14, 16, 20, 25, 29 | não |
| Coluna escura sobre quadro claro | 6, 9, 16 (trilho) | sim: `data-slotted-scheme="dark"` na região |
| Barra superior escura | 15 | sim: `data-slotted-scheme="dark"` no banner |
| Barra superior primeiro | 7, 8, 13, 15, 23, 24, 26, 28, 30 | sim: `primary="banner"` |
| Sem coluna de navegação | 30 | sim: `nav` omitido |
| Painel de contexto à direita | 5, 6, 11, 18 | sim: `aside` |
| Quadro com gradiente ou imagem | 22, 31 | não: `--slotted-app-shell-frame` pinta `background-color` |
| Separação só por tom | 16 | não: `flush` sem `dividers` fica com Δ ≈ 0.02 |
| Área de trabalho inferior redimensionável | 11 | não |

### Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| ---------- | -------------------- | ------------- | ---------------- | ------------------------------- | --------- | ------------------------- |
| Banner no plano do conteúdo | 1, 3, 8, 9, 10 | `<header>` escrito dentro de `SidebarInset` | terceiro valor de `primary`: `main`. O banner continua irmão de `main` no DOM; a grelha coloca-o sobre a coluna de `main` e o plano pinta os dois como um cartão | composição: o landmark `banner` e a ordem de foco não mudam com o arranjo | adotar | — |
| Coluna em cartão flutuante | 2, 17, 18 | `variant="floating"` no `Sidebar` | valor `floating` de `canvas`: `nav` e `main` são cartões no quadro | o valor pertence ao eixo que já decide os planos; um `variant` na coluna e um `canvas` na raiz dariam duas respostas à mesma pergunta | adaptar | — |
| Painel único | 28, 31 | `div` com raio escrito pelo consumidor à volta de `Sidebar` e `SidebarInset` | valor `panel` de `canvas`: um cartão ocupa `nav`, `main` e `aside`; o banner e o footer ficam no quadro; regras separam as regiões dentro do cartão | nenhum elemento extra no DOM; o cartão acompanha `primary` e `navSide` | adotar | — |
| Separação por tom | 16 | cores escritas por região | `dividers` passa a eixo `separation`: `rule` ou `tone`. `tone` pinta regiões vizinhas com passos de superfície a Δ ≥ 0.03 e não desenha regra | um eixo nomeia a decisão; o consumidor não calcula cores | adaptar | — |
| Trilho explícito + coluna secundária | 4, 5, 8, 14, 16, 20, 25, 29 | dois `Sidebar` aninhados, `collapsible="icon"` no primeiro | parte `nav-rail` dentro de `nav`, antes de `nav-header`. Com `nav-rail` presente, `nav` fechado mostra o trilho e retira a coluna; sem ele, o trilho continua a ser a própria coluna estreitada | um só landmark `navigation` e um só estado `navOpen`; o ReUI cria duas regiões e dois estados | adotar | — |
| Pintura do quadro | 22, 31 | classes Tailwind no wrapper | token `--slotted-app-shell-frame-image`, camada `background-image` sobre `--_frame` | um token de tema; nenhum prop | adotar | — |
| Região escura | 6, 9, 15, 16 | `className="bg-zinc-950 text-white"` | `data-slotted-scheme="dark"` na região; já existe | a paleta inteira (tons, bordas, anel de foco) acompanha o fundo | adotar o que já existe | — |
| Faixa de arrasto `sidebar-rail` | 13 | botão de 16 px na aresta da coluna | — | — | recusar: o `nav-toggle` já alterna a coluna; uma faixa sem rótulo é um segundo alvo invisível para a mesma ação | — |
| Coluna redimensionável | 21 | `ResizablePanel` | — | — | adiar para `splitter` | `splitter` |
| Área de trabalho inferior | 11 | `Sheet` redimensionável | — | — | adiar para `splitter` | `splitter` |
| Predefinições de arranjo | todos | um bloco por arranjo | nenhuma no pacote; a demo compõe predefinições a partir dos eixos | o pacote expõe eixos; a lista de arranjos pertence ao produto | recusar no pacote | demo |

### Forma proposta dos eixos

| Eixo | Valores hoje | Valores propostos | Por omissão |
| ---- | ------------ | ----------------- | ----------- |
| `canvas` | `inset`, `flush` | `inset`, `flush`, `floating`, `panel` | `inset` |
| `primary` | `banner`, `nav` | `banner`, `nav`, `main` | `banner` |
| `dividers` → `separation` | `true`, `false` | `rule`, `tone` | `rule` |
| parte `nav-rail` | — | opcional dentro de `nav` | ausente |
| token `--slotted-app-shell-frame-image` | — | camada de fundo do quadro | `none` |

Combinações: 4 `canvas` × 3 `primary` × 2 `separation` × 2 `navSide` × presença de `nav-rail` × esquema por região. Cada valor de `canvas` define os planos de todas as regiões; `separation` só atua onde duas regiões se tocam sem gutter (`flush`, `panel`, banner no cartão).

## 7. Superar

| Critério | ReUI | Slotted hoje | Alvo | Fonte |
| -------- | ---- | ------------ | ---- | ----- |
| Arranjos distintos expressáveis sem CSS do consumidor | 1 primitivo, 3 `variant` × 3 `collapsible`; o resto é markup por bloco | 2 `canvas` × 2 `primary` × `dividers` | 4 × 3 × 2, mais `nav-rail` | secção 6 |
| Landmarks por arranjo | `app-shell-16`: 1 `aside` usado como coluna de navegação | 5 landmarks fixos | 5 landmarks fixos em todos os arranjos | `app-shell-16-light-1440.json`, tag `aside` em x=76 |
| Separação legível sem regra | Δ 0.03 (`-16`) | Δ ≈ 0.02, sem elevação | Δ ≥ 0.03 | secção 3 |
| Ordem de foco estável entre arranjos | muda com o markup de cada bloco | igual em `primary` | igual em todos os valores novos | contrato, `focusOrderReason` |
| Densidade | gutter 8 fixo | gutter composto de `control-gap-lg` | igual | secção 3 |
| Contraste alto e cores forçadas | sem tratamento | tratado por esquema | cada arranjo novo capturado em `high-contrast` e `--forced-colors active` | captura por fazer |

## 8. Delta

| # | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| - | -------- | ------- | ---------------------------- | ------------------- |
| 1 | `specs/components/app-shell/contract.json` | `contrato`: `canvas` + `floating`, `panel`; `primary` + `main`; `dividers` → `separation` (`rule`, `tone`); parte `nav-rail`; token `frame-image` | 6: banner no plano, flutuante, painel, tom, trilho, pintura | `contract.test.mjs` |
| 2 | `packages/styles/src/app-shell/app-shell.harness.html` | cenas `floating`, `panel`, `primary-main`, `tone`, `nav-rail`, `dark-nav` | todas as da secção 6 | build do harness |
| 3 | `packages/styles/src/app-shell/app-shell.css` | planos de `floating` e `panel`; banner em `main`; `separation="tone"`; `nav-rail` aberto, fechado e em overlay; camada `frame-image` | 3: flutuante, painel, separação sem regra; 4: todas | specimens Slotted dos arranjos novos a 720 e na demo a 1440 |
| 4 | `packages/styles/src/app-shell/app-shell.styles.test.mjs` | asserções dos planos novos | 7: separação, landmarks | `pnpm --filter @slotted/styles test` |
| 5 | `packages/react/src/app-shell/*` | tipos dos eixos; `AppShell.NavRail`; defaults | 1 | testes React |
| 6 | `packages/angular/app-shell/src/*` | inputs dos eixos; `slAppShellNavRail`; defaults | 1 | testes Angular |
| 7 | páginas de referência e stories | cenas novas nos dois bindings | 1 | `test:docs` |
| 8 | `demos/nexora/angular/src/app/core/session/preferences.store.ts` | `canvas` → `shell`: identificador de predefinição | pedido de origem | spec do store |
| 9 | `demos/nexora/angular/src/app/pages/preferences/preferences-page.ts` | grupo de rádio com cartões de miniatura SVG, um por predefinição | pedido de origem | cenário determinístico da página |
| 10 | `demos/nexora/angular/src/app/shell/shell-layout.{ts,html,css}` | eixos e esquema por região lidos da predefinição; trilho de módulos com destinos na coluna | pedido de origem | `shell-layout.spec.ts` |
