# Desenho — barra de espera na borda (`progress-indicator`, `app-shell`, `page-header`)

O leitor é a família que herda as decisões. O que este documento não altera continua a valer como está em `2026-09-03-progress-indicator-family-design.md`, `2026-09-29-app-shell-arrangements-design.md` e no contrato de `page-header`.

Barra de borda: barra linear sem trilho que corre ao longo de uma aresta de uma caixa e sobrepõe a linha que essa aresta já desenha.

## 1. Inventário

### 1.1 Fontes

| Implementação | Fonte | Nome | Colocação |
| --- | --- | --- | --- |
| Polaris | `polaris-react/src/components/Frame/Frame.module.css` (`.LoadingBar`), `Frame/components/Loading/Loading.tsx`, `Loading.module.css` | `Frame` › `Loading` | `position: fixed; top: 0`, 3 px, progresso estimado até `STUCK_THRESHOLD = 99`, `role="progressbar"` com `aria-valuenow` |
| Nuxt | `packages/nuxt/src/app/components/nuxt-loading-indicator.ts`, `composables/loading-indicator.ts` | `NuxtLoadingIndicator` | topo do viewport; `throttle` 200 ms, `duration` 2000, `hideDelay` 500, `resetDelay` 400, `height` 3, `errorColor`, `estimatedProgress(duration, elapsed)`; ligado ao router |
| Turbo | `src/core/drive/progress_bar.js`, `src/core/session.js` | `ProgressBar` | `position: fixed; top: 0`, 3 px, `animationDuration` 300 ms, `progressBarDelay` |
| NProgress | `nprogress.js` | `NProgress` | `parent: 'body'` (qualquer contentor), `minimum` 0,08, `trickle`, `trickleSpeed` 200, `speed` 200 |
| nextjs-toploader | `README.md` | `NextTopLoader` | topo; `height` 3, `crawl`, `showAtBottom`, `zIndex` 1600, `shadow` |
| Material 3 (Android) | `material-components-android/docs/components/ProgressIndicator.md` | `LinearProgressIndicator` | em fluxo; `showAnimationBehavior`/`hideAnimationBehavior` `outward`, `inward`, `escape` — a barra cresce a partir de uma aresta e recolhe para ela |
| Angular Material | `src/material/progress-bar/progress-bar.scss` | `mat-progress-bar` | em fluxo; indeterminado em `2s × --mat-progress-bar-animation-multiplier` |
| MUI | `packages/mui-material/src/LinearProgress/LinearProgress.js` | `LinearProgress` | em fluxo; duas barras em `left`/`right` |
| ReUI | `reui.io/llms-full.txt` | — | nenhuma barra de navegação nem de cabeçalho; só barras de etapa determinadas em blocos de onboarding. Cobertura: `nenhuma` |

### 1.2 Table stakes

| Capacidade | Quem | Veredicto | Razão |
| --- | --- | --- | --- |
| Barra no topo do viewport | Polaris, Nuxt, Turbo, NProgress, toploader | adotar | Já é `placement="page"`. |
| Barra dentro de um contentor | NProgress `parent`, toploader `showAtBottom`, Material, Angular Material | adaptar | `placement="edge-start"` e `placement="edge-end"` (§2). |
| Atraso antes de aparecer | Turbo, Nuxt `throttle`, Material `showDelay` | adotar | Já é `delay` e `minDuration`. Os parts `progress` de §3 e §4 usam 200 e 400 ms. |
| Progresso estimado | NProgress `trickle`, Nuxt `estimatedProgress`, Polaris, toploader `crawl` | recusar | Um valor estimado declara uma fração que ninguém mediu, e `progressbar` com `aria-valuenow` anuncia-a. O consumidor que o quer liga `value` a um temporizador: `useEffect(() => { const t = setInterval(() => setValue((v) => v + (90 - v) * 0.1), 200); return () => clearInterval(t); }, [])`. |
| Saída animada | Turbo (opacidade 300 ms), Nuxt `hideDelay`, Material `hideAnimationBehavior` | adaptar | A barra recolhe a espessura para a aresta onde está (§2.3). |
| Cor de erro | Nuxt `errorColor` | adotar | Já é `tone="danger"`. |
| Ligação ao router | Nuxt | adaptar | Sem dependência de router. A página de referência mostra a composição: React Router `useNavigation().state !== 'idle'`; Angular `toSignal(router.events)` filtrado entre `NavigationStart` e `NavigationEnd`/`Cancel`/`Error`. |

Revisão do inventário apresentado antes deste documento: a varredura até 100 % ao terminar passa de `adaptar` a `recusar`. Uma barra indeterminada não tem valor de partida para a varredura, e uma varredura inventada é o progresso estimado da linha acima. A saída recolhida a substitui.

### 1.3 Diferenciais

- A barra ocupa a linha de separação que já existe: nenhuma caixa muda de posição quando ela entra ou sai.
- No `app-shell`, a aresta é escolhida pela família em cada arranjo (§3.2). Nenhuma implementação consultada acompanha um cartão arredondado.
- No `page-header`, a barra está na aresta da raiz `sticky` e permanece visível com o título recolhido.
- Entrada e saída crescem e recolhem a partir da aresta, como `outward`/`inward` do Material.
- `dir="rtl"` inverte o sentido do percurso sem regra própria (`inset-inline-start`).

### 1.4 Lacunas

| Caso | Resposta |
| --- | --- |
| Navegação e atualização em simultâneo | Uma barra por região. Dentro de um ancestral com `aria-busy="true"`, a barra do `page-header` não é desenhada (§4.3). |
| Navegação interrompida por outra | `loading` continua verdadeiro; a barra não recomeça, porque a máquina de `@slotted/core/loading` só reage a transições de `loading`. |
| Resposta abaixo de `delay` | Nada é desenhado. |
| Cache de histórico instantâneo | Idem. |
| `scroll="document"` | A barra é `sticky` na moldura e fica no topo do viewport quando o banner já saiu (§3.3). |
| Navegação em camada (telefone) | A moldura segue `main`, que perde o cartão; a barra fica na aresta superior do conteúdo. |

## 2. `progress-indicator`: `placement="edge-start" | "edge-end"`

### 2.1 Eixo

`placement`: `inline`, `page`, `edge-start`, `edge-end`. Por omissão `inline`.

`edge-start` coloca a barra na aresta `block-start` da caixa posicionada mais próxima; `edge-end`, na aresta `block-end`. A caixa que a contém é responsabilidade de quem a coloca; os parts `progress` de §3 e §4 são essa caixa.

Dois valores em vez de um valor `edge` mais um segundo eixo: a aresta não existe sem a colocação, e um segundo eixo teria combinações sem significado (`placement="inline"` com aresta).

### 2.2 Geometria

`position: absolute`, `inset-inline: 0`, `inset-block-start: 0` ou `inset-block-end: 0`. Trilho transparente e sem ponto de paragem, como `page`. Raio `--slotted-radius-none`: o recorte dos cantos é da caixa hospedeira. `hideLabel` implícito, como `page`. Espessura do eixo `size` (`sm` 2 px, `md` 4 px, `lg` 8 px); os parts hospedeiros usam `sm`.

### 2.3 Movimento

| Transição | Propriedades | Duração | Curva |
| --- | --- | --- | --- |
| Entrada | `clip-path: inset(...)` a partir da aresta → `inset(0)`, `opacity` 0 → 1, via `@starting-style` | `--slotted-duration-medium` | `--slotted-easing-enter` |
| Saída | `clip-path` → aresta, `opacity` → 0, `display` com `allow-discrete` | `--slotted-duration-short` | `--slotted-easing-exit` |

O recorte parte da aresta: `inset(0 0 100% 0)` para `edge-start` e `page`, `inset(100% 0 0 0)` para `edge-end`. A barra nasce da linha e volta para ela. É recorte e não escala: a raiz contém o rótulo, e uma caixa com texto não é escalada (`R7`). Sob `prefers-reduced-motion` as durações colapsam pelo tema e o percurso para no meio, como em `inline`.

Defeito anterior corrigido na mesma passagem: o bloco de movimento reduzido da família tinha especificidade 0,2,0 e as regras que iniciam `travel`, `turn`, `sweep`, `drift` e `morph` têm até 0,4,0; nenhum ciclo parava. O bloco passa a `animation: none !important`, excluindo os `path` da onda, cuja animação pausada é uma rampa de valor.

### 2.4 Cores forçadas

Em `edge-*` o trilho não recebe o `Canvas` com contorno que `inline` recebe: a aresta já é desenhada pelo hospedeiro em `ButtonBorder` ou `CanvasText`, e um segundo contorno duplicaria a linha. O indicador fica em `Highlight`.

## 3. `app-shell`: part `progress`

### 3.1 Anatomia

`progress`: moldura transparente sobre a região `main`, com a caixa de `main` (mesma área de grelha, margens e raio), sem borda, sem fundo, `pointer-events: none`, `overflow: clip`. Contém uma `ProgressBar` com `placement="edge-start"`. A moldura existe para recortar a barra pelo raio do cartão; uma faixa de 2 px com o raio do cartão teria os raios reduzidos pelo navegador à metade da altura.

A moldura é filha direta da raiz, em qualquer posição na ordem do DOM: a área de grelha coloca-a. Fica depois de `main` na ordem de pintura (`z-index: 1`) e abaixo de `scrim`, `nav` em camada e `aside` em camada.

### 3.2 A aresta em cada arranjo

| Arranjo | Linha entre a chrome e o conteúdo | Moldura |
| --- | --- | --- |
| `inset`, `floating`, `primary="banner"` | borda superior do cartão `main` | caixa de `main`; a barra cobre a borda superior e é recortada por `--_radius` |
| `primary="main"` (todos os `canvas`) | `border-block-end` do banner | caixa de `main`, estendida `--_seam-width` para cima |
| `flush` | `border-block-end` do banner | idem |
| `panel`, `primary="nav"` | `border-block-end` do banner | idem |
| `panel`, `primary="banner"` | borda superior do cartão | caixa de `main` |
| `navMode="overlay"` | `border-block-start` de `main` ou do banner | caixa de `main` |
| `separation="tone"` | nenhuma linha; `--_seam-width` é 0 | caixa de `main` |

Cada regra que define margem ou raio de `main` passa a listar `:is([data-part='main'], [data-part='progress'])`, com a especificidade de antes, para a moldura nunca divergir da caixa que segue. Custo: uma regra futura sobre a geometria de `main` que não use `:is` desalinha a barra; `app-shell.styles.test.mjs` passa a exigir que toda declaração de `margin*` ou `*radius` sobre `main` inclua `progress`.

### 3.3 Rolagem

Com `scroll="content"`, a moldura não rola. Com `scroll="document"`, a barra é `position: sticky; inset-block-start: 0` dentro da moldura e fica no topo do viewport depois de o banner sair.

### 3.4 Estado e acessibilidade

- Enquanto a barra está desenhada, `main` recebe `aria-busy="true"` (WAI-ARIA 1.2, `aria-busy`). Um `aria-busy` escrito pelo consumidor em `main` prevalece.
- O nome vem do catálogo: `appShell.progress` = `Loading page`.
- O foco não se move. A moldura não é focável e não tem papel.
- `delay` 200 ms e `minDuration` 400 ms. Precedência: prop do part, depois o provider de `progress-indicator`, depois estes valores.
- Capacidade `loading` (não mutável): `loading` é a prop da barra, controlada pelo consumidor, sem modelo de estado.

## 4. `page-header`: part `progress`

### 4.1 Anatomia

`progress`: linha da grelha do contentor com altura `--_rule-size`, devolvida pela margem (`margin-block-end` negativa), de `full` a `full` — as linhas que o part `breakout` do contentor usa —, `pointer-events: none`, sem recorte. Contém uma `ProgressBar` com `placement="edge-end"`; a espessura sobe acima da moldura e cobre a linha.

O consumidor escreve-o depois de `controls` e antes de `tabs`, como `controls`. Com tabs, a linha é a que a pílula atravessa: na aresta da raiz, a barra corria por baixo das tabs e lia-se como o indicador da tab selecionada. Sem tabs, a linha é a linha fina da raiz. Medido no harness a 720 px: com e sem barra, `controls.top` 365 e altura da raiz 374; sem tabs, 101 e 55.

### 4.2 Que espera responde

Atualizar ou guardar dados que já estão no ecrã. O `loading` do `page-header` continua a ser o skeleton do título para a primeira carga; os dois não coexistem. Com `loading` verdadeiro, o part `progress` não desenha a barra.

### 4.3 Uma barra por região

`[aria-busy='true'] [data-ui='page-header'] > * > [data-part='progress']` não é desenhado. A regra lê um estado ARIA, não a identidade de outra família, e cobre o `app-shell` em navegação e qualquer região ocupada pelo consumidor.

### 4.4 Estado e acessibilidade

- O corpo da página (`page` › `body`) recebe `aria-busy` do consumidor, como já está em `page`. O `page-header` não escreve `aria-busy` em nenhum elemento fora da sua raiz.
- O nome vem do catálogo: `pageHeader.progress` = `Updating page`.
- `delay` 200 ms e `minDuration` 400 ms, com a precedência de §3.4.
- A pílula de controlos que atravessa a linha fica acima da barra.

## 5. Tabelas de integração

### React

| Pergunta | Resposta |
| --- | --- |
| Par controlado/não controlado | Não há valor mutável: `loading` e `value` vêm do consumidor. |
| Defaults uma vez | `ProgressIndicatorDefaultsProvider` (`delay`, `minDuration`, `tone`); os parts não têm provider próprio. |
| Substituir o elemento | A barra aceita `render`. A moldura é fixa: é geometria sem semântica, e outro elemento não acrescenta nada. |
| Handler do consumidor | Nenhum evento é tratado pela família; `onWithdraw` da barra é composto com o registo de `aria-busy`. |
| Elemento nativo | `ref` vai para a raiz da barra. |
| Servidor | A barra começa oculta se `delay` > 0; o primeiro estado é calculado no render (`use-loading-visibility.ts`). `aria-busy` só é escrito depois do efeito que regista a barra. |
| Estado no DOM | `data-placement`, `data-indeterminate`, `hidden`; `aria-busy` em `main`. |
| Tipos | `AppShellProgressProps` e `PageHeaderProgressProps` são `Omit<ProgressBarProps, 'placement'>`. |

### Angular

| Pergunta | Resposta |
| --- | --- |
| Sinal bidirecional | Não há valor mutável. |
| Forms | Não se aplica: não é controlo de formulário. |
| Defaults uma vez | `provideProgressIndicatorDefaults()`. |
| `exportAs` | `slAppShellProgress`, `slPageHeaderProgress`. |
| Conteúdo projetado | Nenhum: a moldura contém só a barra. |
| Zoneless e `OnPush` | Sinais; o estado ocupado de `main` é um `signal` no serviço do shell. |
| Limpeza | O registo de ocupado é desfeito em `DestroyRef.onDestroy`. |
| Atributo estático | `aria-busy` escrito no `main` pelo consumidor é lido com `HostAttributeToken` e prevalece. |
| Ponto de entrada | `@slotted/angular/app-shell` e `@slotted/angular/page-header` importam `@slotted/angular/progress-indicator`. |

## 6. Padrão

Não existe padrão APG para barra de progresso. Referências: WAI-ARIA 1.2, papel `progressbar` (nome obrigatório; `aria-valuenow` ausente quando indeterminado) e estado `aria-busy`. Não há teclado: a barra não é interativa. A ordem de leitura não muda, porque a moldura não tem papel.

## 7. Custo para o consumidor

Nenhuma API removida. `placement` ganha dois valores; `app-shell` e `page-header` ganham um part cada um. `<ProgressBar placement="page">` continua a ser a resposta para aplicações sem shell.
