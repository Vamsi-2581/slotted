# `fullscreen` — inventário e design

Data: 2026-09-24. Família nova da onda 11 (`docs/process/build-order.md`). O motor é
`@slotted/core/fullscreen`; a família compõe `@slotted/core/focus`,
`dismissable-layer` (só `createScrollLock` e a pilha de `Escape`) e `live-announcer`.

## 1. Inventário de capacidades

### 1.1 Surveyed

| Implementação           | Nome                                             | Fonte lida em 2026-09-24                                                                                         |
| ----------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| WHATWG Fullscreen API   | `requestFullscreen`, `:fullscreen`, `::backdrop` | <https://fullscreen.spec.whatwg.org/>, Living Standard de 17 jul. 2026, §2–§6                                    |
| VueUse                  | `useFullscreen`                                  | `packages/core/useFullscreen/index.ts`, ramo `main` de `vueuse/vueuse`                                           |
| ahooks                  | `useFullscreen`                                  | `packages/hooks/src/useFullscreen/index.ts`, ramo `master` de `alibaba/hooks`                                    |
| Mantine 8               | `useFullscreen`                                  | `packages/@mantine/hooks/src/use-fullscreen/use-fullscreen.ts`, ramo `master` de `mantinedev/mantine`            |
| screenfull              | `screenfull`                                     | `readme.md`, ramo `main` de `sindresorhus/screenfull`                                                            |
| Plyr                    | opção `fullscreen` do leitor                     | `README.md`, ramo `master` de `sampotts/plyr` (`{ enabled, fallback, iosNative, container }`)                    |
| Angular CDK             | `FullscreenOverlayContainer`                     | `src/cdk/overlay/fullscreen-overlay-container.ts`, ramo `main` de `angular/components`                           |

Nenhum design system de componentes (Radix, Base UI, Ark, React Aria, Fluent, Carbon)
entrega a família: a capacidade vive em hooks sem marcação (VueUse, ahooks, Mantine),
em leitores de mídia (Plyr) e na infraestrutura de overlay (CDK). As fontes discordam
no fallback: VueUse e Mantine não têm, ahooks tem `pageFullscreen` com classe e
`z-index`, Plyr tem `fallback: true | false | 'force'`.

### 1.2 Table stakes

| Capacidade                                         | Quem entrega                                | Veredito | Razão                                                                                                                                                                              |
| -------------------------------------------------- | ------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entrar, sair e alternar                            | VueUse, ahooks, Mantine, screenfull         | adopt    | `enter()`, `exit()`, `toggle()` no motor; o `trigger` alterna.                                                                                                                     |
| Estado observável                                  | todos                                       | adopt    | `fullscreen`/`defaultFullscreen`/`onFullscreenChange(value, reason, event)`, o modelo que `dialog` e `chart` já declaram.                                                         |
| Saber se a API existe                              | VueUse (`isSupported`), ahooks, screenfull  | adopt    | `fullscreenSupported(document)` no motor; `supported` no hook e na instância Angular.                                                                                              |
| Seguir a saída pelo navegador (`Escape`, F11, UI)  | VueUse, Mantine, ahooks, screenfull         | adopt    | `fullscreenchange` emite o pedido `false` com razão `escape`.                                                                                                                      |
| Erro do pedido                                     | screenfull (`onerror`), especificação (`fullscreenerror`) | adopt | `onFullscreenError({ kind, cause })`, `kind` em `unsupported` e `refused`. O erro nunca deixa o estado mentir: o fallback entra no seu lugar (§4).                         |
| Prefixo `webkit`                                   | VueUse, Mantine, screenfull                 | adopt    | Só `webkit`: iPadOS anterior a 16.4 e Safari antigo. `moz` e `ms` não têm motor vivo.                                                                                              |
| Callbacks de entrada e saída                       | ahooks (`onEnter`, `onExit`)                | adapt    | Um evento só, `onFullscreenChange`, com o valor; dois eventos para uma transição é o que §2.2 do guia proíbe.                                                                     |
| Sair ao desmontar                                  | VueUse (`autoExit`)                         | adopt    | Sempre. Uma região desmontada em tela cheia deixaria o documento em tela cheia sobre nada.                                                                                        |
| Fallback "expandir no layout"                      | ahooks (`pageFullscreen`), Plyr (`fallback`) | adopt   | `mode: 'auto' \| 'layout'`. `auto` pede a API e cai no layout quando ela falta ou recusa; `layout` nunca a pede, o `'force'` de Plyr.                                              |
| `navigationUI`                                     | especificação, screenfull (opções)          | adopt    | Prop `navigationUI`, passada ao pedido nativo.                                                                                                                                     |
| Ancestral como alvo, para o contexto ficar visível | Plyr (`container`)                          | adopt    | O `root` é o alvo, e o consumidor escreve dentro dele o que deve ficar visível. O `trigger` pode estar dentro ou fora.                                                             |
| Overlays visíveis dentro da tela cheia             | Angular CDK (`FullscreenOverlayContainer`)  | adopt    | Correção em `@slotted/core/portal`: a raiz partilhada muda para dentro de `document.fullscreenElement` e volta ao sair. Serve todas as famílias com camada, não só esta (§5).     |
| Documento inteiro em tela cheia                    | Mantine (`documentElement`), screenfull     | adapt    | O hook e a diretiva aceitam qualquer elemento; `useFullscreen(document.documentElement)` e `[slFullscreen]` no elemento raiz da aplicação.                                         |
| Atalho de teclado (`F`)                            | Plyr                                        | decline  | É do produto, não da região: `onKeyDown={(e) => e.key === 'f' && fs.toggle()}` no elemento que o produto escolhe. Um atalho de uma letra colide com a busca e com campos de texto. |
| Controles nativos do iOS (`iosNative`)             | Plyr                                        | decline  | `webkitEnterFullscreen` existe só em `video` no iPhone. O `video` do consumidor chama-o; a família cobre a região, e no iPhone o `layout` responde.                               |

### 1.3 Differentiators

- **Uma via e duas vias com o mesmo estado.** `data-fullscreen` marca as duas; `data-mode`
  diz qual (`native`, `layout`). Nenhuma implementação consultada expõe qual das vias
  respondeu.
- **Rótulo, ícone e anúncio acompanham o estado.** O `trigger` troca `maximize` por
  `minimize` e "Tela cheia" por "Sair da tela cheia"; a entrada anuncia como sair.
  Os hooks consultados devolvem só o booleano.
- **Contexto restaurado.** Foco, rolagem da página e rolagem da própria região voltam ao
  que eram antes de entrar. VueUse, Mantine e ahooks não restauram nada.
- **Área segura.** A inserção da região em tela cheia soma `env(safe-area-inset-*)`: um
  telefone deitado com recorte não corta a barra do consumidor.
- **Três esquemas, três densidades e RTL** sem segunda folha; `::backdrop` pintado com a
  superfície do tema, no lugar do preto do agente.

### 1.4 Gaps

| Caso                                                       | Resposta                                                                                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iframe sem `allow="fullscreen"`                            | `fullscreenEnabled` é `false`: `auto` usa `layout` sem pedir, e emite `unsupported`.                                                                                     |
| Pedido fora de um gesto (estado controlado posto por código) | O navegador recusa; `auto` cai em `layout` e emite `refused`. O estado continua `true`.                                                                                   |
| Consumidor controlado que recusa a saída pelo navegador    | A saída nativa já aconteceu e não se desfaz. A região fica em `layout` enquanto o consumidor mantiver `true`; um novo gesto no `trigger` volta a pedir a API.             |
| Menu, select ou tooltip aberto de dentro da região nativa  | A raiz de portal segue o elemento em tela cheia (§5).                                                                                                                     |
| `Tab` para fora da região                                  | O foco dá a volta dentro da região nas duas vias; o resto da página não está pintado, e um foco nele seria invisível (WCAG 2.4.11).                                       |
| Conteúdo mais alto que o ecrã                              | A região rola por si (`overflow: auto`, `overscroll-behavior: contain`); em `layout` a página por baixo fica travada.                                                     |
| Rótulo traduzido longo ("Vollbildmodus beenden")          | O rótulo quebra; com `iconOnly` fica só no nome acessível.                                                                                                              |
| Outra região já em tela cheia                              | A especificação empilha; a nova ganha, a anterior recebe `fullscreenchange` e emite a saída com razão `escape`.                                                           |
| `toast` e anúncios fora da região em tela cheia nativa     | Não pintados: vivem fora do elemento em tela cheia. O anúncio desta família usa o `live-announcer`, que continua na árvore de acessibilidade. `toast` segue (§6).         |

## 2. Padrão

Nenhum padrão APG descreve tela cheia. O mais próximo é o do controle, lido em
2026-09-24: <https://www.w3.org/WAI/ARIA/apg/patterns/button/>, "Button Pattern".

| Requisito APG                                                                                   | Resposta                                                                                              |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `role="button"` e nome acessível                                                                | `button` nativo; nome pelo `label` visível, ou `aria-label` com `iconOnly`                            |
| `Space` e `Enter` ativam                                                                        | o clique nativo                                                                                       |
| Botão de alternância: "se o rótulo muda com o estado, não use `aria-pressed`"                   | O rótulo muda; `aria-pressed` não é escrito. É a regra que distingue esta parte de `toggle`.          |
| Depois da ativação, o foco fica, salvo se a ação o mover                                        | fica no `trigger`, que continua dentro da região nas duas vias                                        |
| `disabled` nativo                                                                               | `disabled` e `data-disabled`                                                                          |

Da especificação, também lida em 2026-09-24:

- §4: um pedido de fecho (`Escape`) sai da tela cheia e "tem precedência sobre qualquer
  close watcher". A família não escuta `Escape` na via nativa; o requisito "nunca bloqueia o
  Escape do navegador" é cumprido por não escrever o listener.
- §2: entrar em tela cheia esconde os popovers abertos (`hide popovers until`). As camadas
  desta biblioteca não são popovers do topo; seguem pelo portal (§5).
- §3: o pedido exige ativação transitória. O pedido é feito dentro do handler do `trigger`.

## 3. Anatomia

| Parte     | Elemento | Contém                                                                                                  |
| --------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `root`    | `div`    | a região que vai para a tela cheia; `data-ui`, `data-fullscreen`, `data-mode`                           |
| `trigger` | `button` | o controle; `data-ui` próprio, `data-fullscreen`, `data-size`, `data-variant`, `data-icon-only`; dentro ou fora do `root` |
| `icon`    | `span`   | `maximize` ou `minimize`, `aria-hidden`                                                                 |
| `label`   | `span`   | "Tela cheia" ou "Sair da tela cheia"; visualmente oculto com `iconOnly`                                |

O `trigger` carrega `data-ui="fullscreen"` além de `data-part="trigger"`: fora do `root`
(uma barra acima de um gráfico), um seletor descendente não o alcança. Uma família, um
membro, um identificador; a parte diz qual dos dois elementos é.

O conteúdo da região é do consumidor. Nenhuma parte de barra, título ou fundo: a região
é o contentor que o consumidor já tinha.

## 4. Estado, razões e via

| Estado       | Controlado   | Não controlado      | Pedido               | Razões                                              |
| ------------ | ------------ | ------------------- | -------------------- | --------------------------------------------------- |
| tela cheia   | `fullscreen` | `defaultFullscreen` | `onFullscreenChange` | `pointer`, `keyboard`, `escape`, `programmatic`    |

- `escape` cobre as duas saídas que o consumidor não pediu: `Escape` na via `layout`
  e a saída pelo navegador na via nativa (tecla, F11, UI do agente). O `chart` usa a
  mesma razão para o mesmo caso.
- A via é derivada, não um estado: `mode: 'auto'` pede a API dentro do gesto; se a API
  falta ou recusa, a região entra em `layout` e o erro é emitido. O estado nunca volta
  a `false` por causa de um erro: quem prefere não ter fallback escreve
  `onFullscreenError={() => setFullscreen(false)}`.
- Estado controlado posto por código (`programmatic`): a API é pedida mesmo assim. Dentro
  da janela de ativação de um gesto do consumidor, o navegador aceita; fora dela, recusa
  e a região entra em `layout`.
- Contexto restaurado ao sair: o foco volta ao elemento que o tinha ao entrar quando o
  foco ficou no `body` ou fora da região; `scrollX`/`scrollY` da página e a rolagem do
  `root` voltam aos valores de entrada.

## 5. Decisões partilhadas

- **O portal segue a tela cheia.** `@slotted/core/portal` escuta `fullscreenchange` e
  move a raiz partilhada para dentro de `document.fullscreenElement`, e de volta para o
  contentor da aplicação ao sair. É a resposta do CDK. Sem ela, um `select` aberto dentro
  de uma região em tela cheia nativa abre fora do que o navegador pinta. Custo: um
  `fullscreenchange` reparenta a raiz, e a rolagem interna das camadas abertas é
  perdida. Correção de infraestrutura partilhada, em commit próprio, antes da família.
- **`layout` não é `modal`.** A via `layout` trava a rolagem da página (`createScrollLock`),
  regista uma camada em `dismissable-layer` só para `Escape` (camadas abertas dentro da
  região fecham primeiro) e contém o `Tab`. Não escreve `inert` fora: o
  `live-announcer` vive no `body`, e uma região `inert` cala o anúncio de entrada. Custo:
  o cursor virtual de um leitor de ecrã alcança o conteúdo coberto.
- **A geometria de `layout` é `!important`.** O `root` é o contentor do consumidor, e a
  folha não-layered do consumidor vence `@layer slotted.components`: um cartão com
  `position: relative`, margem e largura ficava cartão e não cobria a página (medido no
  harness). `position`, `inset`, `margin`, tamanhos, `transform` e `z-index` são
  `!important`, como a folha do agente os faz na via nativa. Chão, borda e inserção não
  são: continuam do consumidor em tela cheia.
- **Profundidade.** Em `layout`, `z-index: calc(var(--slotted-z-index-overlay) +
var(--slotted-layer-depth))`, a fórmula de `dialog`; uma camada aberta de dentro fica acima.

## 6. Integração

### React

| Pergunta                                   | Resposta                                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Par controlado e não controlado, com razão | `fullscreen` / `defaultFullscreen` / `onFullscreenChange(value, reason, event)`                                                  |
| Defaults uma vez                           | `FullscreenDefaultsProvider` (`mode`, `navigationUI`, `size`, `variant`, `messages`) e `useFullscreenDefaults`                  |
| Substituir o elemento de cada parte        | `render` em `Fullscreen` e em `FullscreenTrigger`; `icon` e `label` são filhos substituíveis                                     |
| Handler do consumidor corre                | `onClick` do `trigger` composto; `event.preventDefault()` recusa a alternância                                                  |
| Elemento nativo e ação imperativa          | `ref` no `div` e no `button`; `useFullscreen(target, options)` devolve `{ fullscreen, mode, supported, error, enter, exit, toggle }` |
| SSR                                        | nada é lido do `document` no render; `supported` é `false` até montar                                                           |
| Estados no DOM                             | `data-fullscreen`, `data-mode`, `data-disabled`                                                                                  |
| Tipos das partes                           | `ComponentPropsWithRef<'div'>` e `ComponentPropsWithRef<'button'>`, estendidos                                                   |

### Angular

| Pergunta                              | Resposta                                                                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Valor de duas vias em signal          | `fullscreen = model(false)`; `fullscreenChangeRequest = output<ChangeRequest<boolean>>()`                                         |
| Formulários                           | não: nenhum valor de formulário                                                                                                    |
| Defaults uma vez                      | `SL_FULLSCREEN_DEFAULTS` e `provideFullscreenDefaults()`                                                                           |
| Instância no template                 | `[slFullscreen]` com `exportAs: 'slFullscreen'`; `fs.toggle()`, `fs.mode()`, `fs.error()`                                         |
| Conteúdo projetado                    | `button[slFullscreenTrigger]` projeta o rótulo do consumidor quando existe; o ícone e o rótulo por omissão vêm do componente       |
| Zoneless e `OnPush`                   | signals; os eventos do documento escrevem signals                                                                                  |
| Teardown                              | `DestroyRef`: listeners, camada, trava de rolagem e saída da tela cheia                                                           |
| Atributo estático do consumidor       | `type` e `aria-label` lidos por `HostAttributeToken` antes de escrever                                                             |
| Entry point único                     | `@slotted/angular/fullscreen`                                                                                                      |

O `trigger` fora do `root`: em React é `<FullscreenTrigger target={handle}>` com o
resultado de `useFullscreen`; em Angular `[slFullscreenTrigger]="fs"`, a instância
exportada.

## 7. Custos e reaberturas

- `chart` mantém a sua via própria de tela cheia; passar a ler `@slotted/core/fullscreen`
  é reabertura registada em `docs/process/build-order.md`.
- `dialog` tem `fullscreen` com outro sentido (o painel ocupa o viewport, sem API).
  Nenhuma mudança.
