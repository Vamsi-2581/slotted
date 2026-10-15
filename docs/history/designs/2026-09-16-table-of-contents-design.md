# Table of contents — desenho

Inventário em `2026-09-16-table-of-contents-capability-inventory.md`. Este
documento regista as decisões que uma família posterior herda.

## 1. Responsabilidade

A família lista ligações para lugares do documento em que está, marca a
ligação do lugar à vista e leva o leitor a uma quando a escolhe. Não conhece
rotas: cada ligação é um fragmento do documento corrente. Não é `tabs`, que
troca vistas; não é `side-navigation`, que troca páginas; não é `stepper`,
que ordena um processo.

## 2. Anatomia

| Parte       | Elemento     | O que é                                                                                                                                                                                                                                                                                               |
| ----------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`      | `nav` / `div` | O landmark. `data-layout`, `data-size`, `data-sticky`, `data-numbered`, `data-open`, `data-loading`, `data-empty`. `div` sob `landmark=false`.                                                                                                                                                       |
| `label`     | `div`        | O título da lista ("Nesta página"). Nomeia o `nav` por `aria-labelledby` quando existe. Em `collapsed` é o texto fixo do gatilho.                                                                                                                                                                      |
| `trigger`   | `button`     | Só em `collapsed`: `aria-expanded`, `aria-controls` para o `panel`. Contém `label`, `current` e `indicator`.                                                                                                                                                                                          |
| `current`   | `span`       | Dentro do gatilho: o rótulo da ligação corrente, ou nada. Em `collapsed` é o que diz ao leitor onde está sem abrir a lista (Starlight).                                                                                                                                                                |
| `indicator` | `span`       | O chevron do gatilho, `--slotted-icon-chevron-down`, meia volta sob `data-open`.                                                                                                                                                                                                                      |
| `panel`     | `div`        | A região que contém a lista: o corpo rolável da coluna em `vertical`, o rolador inline em `horizontal`, a camada ancorada sob o gatilho em `collapsed`. Carrega `id` para `aria-controls`.                                                                                                             |
| `list`      | `ol`         | O primeiro nível. Um `ol` porque a ordem é a do documento; `list-style: none`, e os contadores sob `numbered`.                                                                                                                                                                                       |
| `item`      | `li`         | Uma entrada. `data-depth` (1 no primeiro nível), `data-current` enquanto a sua ligação é corrente, `data-value`.                                                                                                                                                                                       |
| `link`      | `a[href]`    | A ligação. `href="#<id>"`; `aria-current="location"` e `data-current` quando corrente. O `onClick` do consumidor corre antes do da família.                                                                                                                                                             |
| `group`     | `ol`         | Os filhos de um item, indentados por `--slotted-table-of-contents-indent` por nível. Escondido em `horizontal`.                                                                                                                                                                                       |
| `marker`    | `div`        | O segmento que desliza até à ligação corrente ao longo do trilho, `aria-hidden`. Posicionado pelo binding em `--_marker-start` e `--_marker-size` sobre o `list` do primeiro nível; sem ligação corrente tem tamanho zero.                                                                                |
| `skeleton`  | `li`         | Uma linha com a geometria de um item cujo texto é uma caixa `skeleton`, `aria-hidden`; quatro sob `loading`.                                                                                                                                                                                         |

O trilho é o `border-inline-start` do `list` de primeiro nível em `vertical` e
um fundo de um traço no `panel` em `horizontal` (ver §8). Nenhum dos dois está numa
regra de estado: `state-rail.test.mjs` (R1) refere uma banda que diz o estado
por si; aqui o estado é dito pela tinta e pelo peso da ligação, e o marcador é
uma parte que viaja, o precedente de `tabs`.

## 3. Estado

| Valor     | Controlado / não controlado / pedido     | Razões                                                             | Atributo                                  |
| --------- | ---------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `current` | `value` / `defaultValue` / `onValueChange` | `scroll`, `pointer`, `keyboard`, `programmatic`                    | `data-current` em `link` e `item`         |
| `open`    | `open` / `defaultOpen` / `onOpenChange`  | `pointer`, `keyboard`, `select`, `escape`, `outsidePress`, `programmatic` | `data-open` em `root`; só em `collapsed` |

`value` é o `id` do alvo, sem `#`. `scroll` é o observador a responder à
posição; um consumidor que a recusa mantém a que tem. Pressionar uma ligação
pede `value` com `pointer` ou `keyboard` antes de rolar; se o pedido é
recusado, a rolagem acontece na mesma, porque a navegação é da âncora e não do
estado. `select` fecha a lista colapsada quando uma ligação é escolhida.

## 4. Padrão de acessibilidade

O APG não tem padrão para esta família
(<https://www.w3.org/WAI/ARIA/apg/patterns/>, lido em 2026-09-16). O que se
aplica:

- **Landmark `navigation` com nome.** `nav` com `aria-labelledby` para
  `label` ou `aria-label` com `messages.navigation`. Passa: contrato `roles`,
  ambos os bindings.
- **`link`** (ARIA 1.2 §5.4): `a[href]`, nome pelo conteúdo. Passa.
- **`aria-current="location"`** (ARIA 1.2 §6.7): um só elemento corrente
  por conjunto. Passa: só o `link` corrente; o `item` leva `data-current`
  sem ARIA.
- **Disclosure Navigation Menu**
  (<https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/>)
  para o gatilho de `collapsed`. Tabela de teclado transcrita:

  | Tecla             | Precondição                          | Efeito                                                 | Foco                          | Estado         |
  | ----------------- | ------------------------------------ | ------------------------------------------------------ | ----------------------------- | -------------- |
  | Tab / Shift+Tab   | —                                    | move entre o gatilho e as ligações da lista aberta      | próximo / anterior            | passa (plataforma) |
  | Enter, Space      | foco no gatilho                      | alterna a lista                                        | gatilho                       | passa (plataforma: `button`) |
  | Escape            | foco dentro da lista aberta          | fecha a lista                                          | gatilho                       | passa (`dismissable-layer` + foco de volta) |
  | ArrowDown         | foco no gatilho, lista fechada       | abre a lista                                           | primeira ligação              | passa (opcional no padrão, adotado) |
  | ArrowDown / ArrowUp | foco numa ligação                  | move entre ligações                                    | seguinte / anterior           | passa (opcional, adotado em todos os layouts) |
  | ArrowRight / ArrowLeft | foco numa ligação, `horizontal` | move entre ligações                                    | seguinte / anterior           | passa |
  | Home / End        | foco numa ligação                    | primeira / última ligação                              | primeira / última             | passa (opcional, adotado) |
  | pressão fora      | lista aberta                         | fecha a lista                                          | inalterado                    | passa (`dismissable-layer`, razão `outsidePress`) |

  `aria-expanded` e `aria-controls` no gatilho. O gatilho é um `button`
  nativo. Sem `role="menu"`: as ligações são ligações, como o exemplo.

- **Foco depois de navegar.** O alvo recebe foco com `preventScroll` depois
  da rolagem; um alvo sem `tabindex` recebe `tabindex="-1"` até perder o foco
  (o método GOV.UK para "skip link"). Departure do HTML, que só move o ponto de
  partida da navegação sequencial; custo: um leitor de ecrã anuncia a secção,
  que é o efeito pretendido.
- **Reduced motion.** `matchMedia('(prefers-reduced-motion: reduce)')` decide
  `behavior: 'instant'`; o marcador transita na duração da escala, que o tema
  colapsa.
- **Forced colors.** O trilho e o marcador são bordas, que sobrevivem; nenhuma
  regra `forced-colors` própria além do chevron em máscara.

## 5. Navegar

Ao pressionar uma ligação sem tecla modificadora e sem `defaultPrevented`:

1. `value` é pedido com `pointer` ou `keyboard`.
2. `event.preventDefault()`.
3. `landOn(target)` de `@slotted/core/scroll-spy`: o rolador rola até
   `alvo.topo − linha`, onde a linha é `--slotted-page-sticky-top` lido do
   rolador mais `offset`; a `scroll-margin-block-start` do alvo entra quando é
   menor do que a chrome — uma margem pelo menos do tamanho da chrome é tomada
   como incluindo-a, que é o caso de `section`; a de `prose` (ar de um `_flow`)
   é somada.
4. A URL: `history="push"` → `history.pushState`; `replace` →
   `history.replaceState`; `none` → nada. Custo registado: `:target` não
   muda e `hashchange` não dispara, como em Ant; o router não é avisado, e a
   sua próxima navegação reescreve o fragmento.
5. Foco no alvo.

Com Ctrl, Meta, Shift, Alt ou botão do meio, nada: a plataforma abre o
fragmento noutro separador. Na montagem, um `location.hash` que nomeia um
alvo aterra nele instantaneamente e sem tocar na URL, porque o salto nativo o
deixou sob a chrome.

## 6. Observar

`createScrollSpy` em `@slotted/core/scroll-spy` recebe os alvos, o rolador,
a linha e `onChange`. Um `IntersectionObserver` com o rolador como raiz e uma
faixa de um pixel na linha (`rootMargin` negativo em cima e em baixo) dispara
quando um alvo cruza a linha ou muda de caixa; um listener de `scroll`
passivo, coalescido por frame, cobre o fim do rolador e uma linha que se moveu
com o cabeçalho. Cada disparo recalcula por geometria: a corrente é o último
alvo com caixa cujo topo está na linha ou acima; no fim do rolador
(`scrollTop + clientHeight ≥ scrollHeight − 1`), o último alvo com caixa; sem
alvo na linha ou acima, o primeiro com caixa enquanto o rolador está no início
(`scrollTop ≤ 0`) e nenhuma depois disso. Um alvo sem caixa nunca é corrente.
Uma ligação pressionada fica fixada no spy (`pin`) até o leitor rolar por gesto
— roda, toque, teclado, ponteiro na barra — porque uma escolha que aterra o
documento no fim era sobreposta pela regra do fim no mesmo frame; a rolagem
suave que a família conduz não é um gesto e não a solta. A tolerância da linha
é a constante `TABLE_OF_CONTENTS_BOUNDS = 4` em cada
binding (Ant `bounds: 5`), não um token: um valor lido por script de uma
propriedade em `rem` custaria uma conversão para dizer quatro pixels.

`collectOutline` em `@slotted/core/outline` lê os headings de `source` entre
`levels`, escreve `id` nos que não têm (`slugify`: minúsculas, letras, dígitos
e hífens, 64 caracteres, único por sufixo; `section-<n>` quando não sobra
nada) e devolve a árvore `{ id, label, level, element, children }`.
`nestOutline` converte uma lista plana com `level` na mesma árvore, para o
`toc` do Docusaurus e o `data` do Mantine.

## 7. Eixos e resolução

| Eixo       | Valores                                | Omissão    | Resolução                 |
| ---------- | -------------------------------------- | ---------- | ------------------------- |
| `layout`   | `vertical`, `horizontal`, `collapsed`  | `vertical` | prop, defaults, `vertical` |
| `size`     | `sm`, `md`, `lg`                       | `md`       | prop, defaults, `md`      |
| `sticky`   | `false`, `true`                        | `false`    | prop, defaults, `false`   |
| `history`  | `push`, `replace`, `none`              | `push`     | prop, defaults, `push`    |
| `numbered` | `false`, `true`                        | `false`    | prop, defaults, `false`   |
| `landmark` | `true`, `false`                        | `true`     | prop, defaults, `true`    |
| `levels`   | `[min, max]`, 1–6                      | `[2, 3]`   | prop, defaults, `[2, 3]`  |
| `offset`   | número em px                           | `0`        | prop, defaults, `0`       |

`layout` não decide por largura: a coluna lateral (220 px) é mais estreita do
que a barra de um telemóvel (375 px), pelo que a largura não diz qual dos dois
o consumidor quer. O consumidor decide com o seu breakpoint, como PatternFly
com `expandable` por breakpoint; a página de referência mostra a ligação a um
`matchMedia`.

## 8. Tokens

Camada de componente, `packages/styles/src/table-of-contents/table-of-contents.tokens.json`:
`--slotted-table-of-contents-indent` (um passo de espaço), `-track-color`
(`--slotted-border-subtle`), `-track-width` (`--slotted-border-width-medium`),
`-marker-color` (`--slotted-tone-accent-solid`), `-current-color`
(`--slotted-tone-accent-text`), `-color` (`--slotted-text-muted`), `-color-hover` e `-color-current`
(`--slotted-tone-accent-text`). Geometria de linha pela escala de controlo por
`size`; a camada colapsada usa `--slotted-surface-raised`, `--slotted-shadow-md`,
`--slotted-radius-md`. O trilho da barra é o fundo do `panel`, não a sua
borda: um contentor de rolagem corta nos dois eixos, e um marcador pendurado
sobre a borda ficava cortado. A barra escreve `data-overflow` (`start`, `end`,
`both`) e o `panel` esbate a margem por que continua.

## 9. Integração — React

| Pergunta                                    | Resposta                                                                                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Par controlado/não controlado com razão     | `value`/`defaultValue`/`onValueChange(value, request)`; `open`/`defaultOpen`/`onOpenChange(open, request)`. `packages/react/src/table-of-contents/table-of-contents.tsx` |
| Defaults por aplicação                      | `TableOfContentsDefaultsProvider` e `useTableOfContentsDefaults`. `table-of-contents-defaults.tsx`                                                             |
| Substituir o elemento de cada parte         | `render` em `TableOfContents`, `TableOfContentsItem`, `TableOfContentsLink`, `TableOfContentsGroup`. `label`, `trigger`, `panel`, `list`, `marker` e `skeleton` são desenhados pela raiz: o gatilho é um `button` cujo teclado é o padrão, o painel é o alvo de `aria-controls`, a lista é o `ol` que a raiz mede, o marcador é geometria. |
| O handler do consumidor corre               | `onClick` na ligação e `onKeyDown` na raiz correm primeiro; `defaultPrevented` pára a família.                                                                 |
| Elemento nativo e ação imperativa           | `ref` em cada parte; `TableOfContentsHandle` com `focus()`, `refresh()`, `scrollTo(id)`.                                                                       |
| SSR sem mismatch                            | `useId` para o `panel` e o `label`; `source` lê o DOM num efeito e rende vazio no servidor; `items` rende igual nos dois lados.                                 |
| Todo estado no DOM                          | `data-current`, `data-open`, `data-loading`, `data-empty`, `data-layout`, `data-size`, `data-sticky`, `data-numbered`, `data-depth`.                            |
| Props nativas estendidas                    | `ComponentPropsWithRef<'nav' \| 'div' \| 'ol' \| 'li' \| 'a'>` em `table-of-contents.types.ts`.                                                                |

## 10. Integração — Angular

| Pergunta                                    | Resposta                                                                                                                                                        |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dois sentidos em signal                     | `value = model<string \| null>()`, `open = model<boolean>()`; `valueChangeRequest` e `openChangeRequest` com `ChangeRequest`. `packages/angular/table-of-contents/src/table-of-contents.ts` |
| Reactive Forms                              | Não: nenhuma ligação é um valor de formulário.                                                                                                                  |
| Defaults por aplicação                      | `TABLE_OF_CONTENTS_DEFAULTS` e `provideTableOfContentsDefaults()`. `table-of-contents-defaults.ts`                                                              |
| Instância no template                       | `exportAs: 'slTableOfContents'`.                                                                                                                                |
| Conteúdo projetado e lazy                   | `<ng-content select="[slTableOfContentsLabel]">` para o título; `slTableOfContentsLink` como `ng-template` com `let-item` para o conteúdo de cada ligação; `items` e `source` são os dois modos, porque um template Angular não escreve uma lista aninhada à mão. |
| Zoneless e OnPush                           | Signals; o observador escreve em signals; nenhum `markForCheck`.                                                                                                 |
| Subscrições desfeitas                       | `DestroyRef.onDestroy` para o spy, o `MutationObserver`, o `ResizeObserver` e a camada.                                                                          |
| Atributo escrito sobrevive                  | `HostAttributeToken('aria-label')`.                                                                                                                             |
| Entrada única                               | `@slotted/angular/table-of-contents`.                                                                                                                           |

Assimetria registada: React tem as partes para escrever a lista à mão; Angular
tem `items`, `source` e um template por ligação. O contrato conceptual é o
mesmo; a forma é a de cada ecossistema.

## 11. Custos aceites

- `history.pushState` em vez da navegação nativa: `:target` e `hashchange`
  não respondem; um router reescreve o fragmento na sua próxima navegação.
- `source` sob SSR rende vazio no servidor.
- Um heading dentro de `collapsible` fechado fica na lista e nunca é corrente.
- `prose` leva `scroll-margin` sem a chrome; a família compensa ao rolar, e
  a regra de `prose` fica prometida em `docs/process/build-order.md`.
