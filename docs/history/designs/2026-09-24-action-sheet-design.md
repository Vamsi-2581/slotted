# `action-sheet` — inventário e design

Data: 2026-09-24. Família nova da onda 11 (`docs/process/build-order.md`). Compõe
`@slotted/core/portal`, `dismissable-layer`, `presence`, `focus`, `typeahead` e `state`;
o indicador de espera do item é o `spinner`.

## 1. Inventário de capacidades

### 1.1 Surveyed

| Implementação                   | Nome                                                    | Fonte lida em 2026-09-24                                                                              |
| ------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Ionic Framework 8               | `ion-action-sheet`                                      | `core/src/components/action-sheet/action-sheet.tsx`, ramo `main` de `ionic-team/ionic-framework`      |
| Ant Design Mobile 5             | `ActionSheet`                                           | `src/components/action-sheet/action-sheet.tsx`, ramo `master` de `ant-design/ant-design-mobile`       |
| Vant 4                          | `ActionSheet`                                           | `packages/vant/src/action-sheet/ActionSheet.tsx`, ramo `main` de `youzan/vant`                        |
| Konsta UI                       | `Actions`, `ActionsGroup`, `ActionsLabel`, `ActionsButton` | `src/react/components/Actions*.jsx`, ramo `master` de `konstaui/konsta`                             |
| Angular Material                | `MatBottomSheet`                                        | `src/material/bottom-sheet/bottom-sheet-config.ts` e `bottom-sheet-container.ts`, ramo `main`         |
| React Spectrum                  | `MenuTrigger` com `Tray` em ecrã pequeno                | `packages/@adobe/react-spectrum/src/menu/MenuTrigger.tsx` e `src/overlays/Tray.tsx`, ramo `main`      |
| Apple Human Interface Guidelines | Action sheets (`UIAlertController.Style.actionSheet`)  | developer.apple.com/design/human-interface-guidelines/action-sheets                                  |

O APG não tem padrão de action sheet. Os dois padrões mais próximos são citados na secção 2.

As fontes discordam num ponto que decide a semântica. Ionic, Ant Mobile, Vant, Konsta e
UIKit desenham um diálogo com botões e navegação só por `Tab`. React Spectrum desenha um
`menu` num tabuleiro modal, com setas e typeahead. A Apple escreve "use an action sheet —
not a menu" sobre o gatilho, não sobre o teclado.

### 1.2 Table stakes

| Capacidade                                            | Quem entrega                                  | Veredito | Razão                                                                                                                                                                  |
| ----------------------------------------------------- | --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aberto controlado e não controlado                    | todos                                         | adopt    | `open`/`defaultOpen`/`onOpenChange` com `reason` e `cancel()`.                                                                                                         |
| Título e mensagem                                     | Ionic (`header`, `subHeader`), Vant, Apple, Ant (`extra`) | adopt | Partes `title` e `message`. `message` e não `description`: `description` é a segunda linha do item, como em `menu`.                                                   |
| Ações com rótulo                                      | todos                                         | adopt    | Parte `item`, `button` nativo com `role="menuitem"`.                                                                                                                  |
| Ícone por ação                                        | Ionic, Vant, React Spectrum                   | adopt    | Parte `icon`; a coluna só existe quando algum item a usa.                                                                                                              |
| Segunda linha por ação                                | Ant (`description`), Vant (`subname`), React Spectrum | adopt | Parte `description`.                                                                                                                                                |
| Ação destrutiva                                       | Ionic (`role: 'destructive'`), Ant (`danger`), Apple, Konsta | adopt | `tone`, com as cinco tonalidades de `menu`; `danger` é a destrutiva.                                                                                             |
| Ação desabilitada                                     | Ionic, Ant, Vant                              | adopt    | `aria-disabled`, focável e inativa, como o padrão Menu exige.                                                                                                          |
| Cancelar explícito, separado das ações                | Ionic (`role: 'cancel'`), Ant (`cancelText`), Vant, Apple, Konsta | adopt | Parte `cancel` num `footer` próprio; nunca desabilitada, como em Ionic.                                                                                  |
| Fechar ao escolher, e manter aberto por ação          | Ant (`closeOnAction`), Vant (`closeOnClickAction`), Ionic (`handler` devolve `false`) | adopt | `closeOnSelect` na raiz e no item, e `event.preventDefault()` em `onSelect`.                                                    |
| Resultado ao fechar                                   | Ionic (`onDidDismiss` com `data` e `role`)    | adapt    | O `value` do item escolhido segue no pedido de fecho como `request.result`, a forma que `dialog` e `drawer` já usam.                                                  |
| Ação assíncrona                                       | Vant (`loading`), Ionic (`handler` assíncrono) | adopt   | `loading` no item: spinner na caixa do ícone, `aria-busy`, ativação recusada; o consumidor fecha quando a obra acaba.                                                |
| Grupos                                                | Ionic (grupos), Konsta (`ActionsGroup`, `ActionsLabel`), Apple | adopt | Partes `group` e `group-label`, e `separator`.                                                                                                             |
| Scrim e fecho por toque fora                          | todos                                         | adopt    | `outsidePress: 'close' \| 'none'`, a palavra de `drawer`.                                                                                                              |
| Escape                                                | Ionic, Angular Material, React Spectrum       | adopt    | `escape: 'close' \| 'none'`.                                                                                                                                           |
| Gesto de voltar                                       | Vant (`closeOnPopstate`)                      | adopt    | `back: 'close' \| 'none'`, pela entrada de histórico de `dismissable-layer`.                                                                                           |
| Área segura                                           | Ant (`safeArea`), Vant (`safeAreaInsetBottom`) | adopt   | Sempre: `env(safe-area-inset-*)` no rodapé e nas laterais. Nenhuma das duas razões para o desligar vale para uma camada fixa à borda inferior.                          |
| Montagem preguiçosa ou mantida                        | Ant (`destroyOnClose`, `forceRender`), Vant (`lazyRender`) | adopt | `mount: 'active' \| 'lazy' \| 'eager'`, o eixo de `dialog` e `drawer`.                                                                                        |
| Restaurar o foco                                      | Angular Material (`restoreFocus`), Ionic      | adopt    | `createFocusScope` devolve o foco a quem o tinha.                                                                                                                      |
| Rótulos internos substituíveis                        | Ant, Vant (`cancelText`)                      | adopt    | O texto do `cancel` é conteúdo do consumidor; sem texto, lê `cancelLabel` dos defaults.                                                                                |
| Serviço imperativo que devolve a escolha              | Ionic (`actionSheetController`), Ant (`ActionSheet.show`) | decline | A decisão de `dialog` e `drawer`: com estado e `@if` são três linhas no template. `onOpenChange(false, request)` entrega `request.result`, que é o que a promessa entregaria. |
| Escolha única marcada (`role: 'radio'`)               | Ionic                                         | decline  | Uma escolha com estado é `select` (nativo no telefone) ou `radio-group` dentro de `drawer`. Uma action sheet dispara ações.                                           |
| Ação em destaque (`bold`)                             | Ant, Konsta                                   | decline  | O rótulo é conteúdo: `<strong>Guardar rascunho</strong>` no item. Uma prop de peso tipográfico seria a primeira da biblioteca.                                          |
| Botão ✕ no cabeçalho (`closeable`)                    | Vant                                          | decline  | O `cancel` já é o fecho explícito; dois controlos para a mesma saída disputam o polegar.                                                                               |
| Arrastar para fechar                                  | Angular Material (M3), Vaul                   | defer to `drawer` | `drawer` com `side="bottom"` e `resizer` é a folha que se arrasta. Aqui fecham `cancel`, toque fora, `Escape` e voltar.                                        |
| Fundo translúcido (`translucent`)                     | Ionic                                         | decline  | A superfície é `--slotted-surface-raised`; um tema que quer vidro reescreve `--slotted-action-sheet-surface`.                                                          |

### 1.3 Differentiators

- **Teclado de menu dentro do diálogo.** Setas, `Home`, `End` e typeahead percorrem as
  ações; `Tab` alterna entre a lista e o `cancel`. Nenhuma das cinco implementações de
  diálogo o faz; React Spectrum faz sem o título e sem o cancelar.
- **Foco inicial na ação menos destrutiva.** Quando a primeira ação é `danger`, o foco
  entra no `cancel`, como o padrão Dialog (Modal) recomenda. Nenhuma implementação
  inspecionada distingue.
- **Vocabulário de item idêntico ao de `menu`.** `value`, `textValue`, `icon`,
  `description`, `tone`, `disabled`, `closeOnSelect`, `onSelect`, `render`. Uma aplicação
  que troca `menu` por `action-sheet` no seu breakpoint mapeia a mesma lista de ações para
  as duas famílias.
- **Três esquemas, três densidades e RTL** por propriedades lógicas, sem segunda folha.

### 1.4 Gaps

| Caso                                           | Resposta                                                                                                                                  |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Mais ações do que cabem (telefone deitado)     | A lista é a única linha que rola; cabeçalho e `cancel` ficam. Uma faixa de scrim fica sempre visível acima da folha, para o toque fora. |
| Rótulo longo ou traduzido                      | Quebra em linhas; nunca trunca. Uma cadeia sem espaços quebra por `overflow-wrap: anywhere`.                                             |
| Ecrã largo                                     | A folha mede `min(100%, --slotted-action-sheet-inline-size)` e centra-se; não atravessa um monitor de 1920 px.                           |
| Ação que falha depois de `loading`             | A folha continua aberta com o item de novo ativo; a mensagem de erro é do consumidor (`toast` ou `inline-message`).                     |
| Folha aberta sem gatilho (toque longo numa linha) | `open` controlado sem `trigger`; o foco volta ao elemento que o tinha.                                                               |
| Teclado virtual aberto                         | A folha não contém campos; o foco sai do campo ao abrir e o teclado fecha.                                                               |

## 2. Padrão

Nenhum padrão APG descreve a família. Dois cobrem as suas metades, lidos em 2026-09-24:

- <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/>, "Dialog (Modal) Pattern":
  a camada.
- <https://www.w3.org/WAI/ARIA/apg/patterns/menubar/>, "Menu and Menubar Pattern": a
  lista de ações.

| Requisito APG                                                                | Resposta                                                                                         |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Dialog: ao abrir, o foco entra num elemento do diálogo                        | a primeira ação; o `cancel` quando a primeira é `danger` (nota 1 do padrão: ação menos destrutiva) |
| Dialog: `Tab` e `Shift+Tab` percorrem os tabuláveis e dão a volta             | dois tabuláveis: a lista (um só por roving tabindex) e o `cancel`; volta enquanto `modal`         |
| Dialog: `Escape` fecha                                                        | `dismissable-layer`, só a camada de cima; recusado com `escape="none"`                            |
| Dialog: `role="dialog"` no contentor, tudo o que o opera é descendente         | `panel`; `backdrop` não tem controlos                                                            |
| Dialog: `aria-modal="true"`                                                   | só enquanto `modal`, que é quando a página fica `inert` e o scrim é pintado                      |
| Dialog: `aria-labelledby` para um título visível, ou `aria-label`             | `title` quando presente; o `aria-label` do consumidor sobrevive                                  |
| Dialog: `aria-describedby` opcional                                           | `message` quando presente                                                                        |
| Menu: `role="menu"` com `menuitem`                                            | `list` e `item`; o item é `button` nativo com o papel substituído                                |
| Menu: `Enter` e `Space` ativam o item                                          | o clique nativo do `button`                                                                       |
| Menu: `ArrowDown`/`ArrowUp` movem ao seguinte/anterior                         | sim, com volta (opcional no padrão)                                                               |
| Menu: `Home`/`End`                                                            | primeiro e último item                                                                           |
| Menu: carácter imprimível move ao item seguinte que começa por ele             | `@slotted/core/typeahead`, sobre `textValue` ou o texto do rótulo                                 |
| Menu: `Escape` fecha e devolve o foco                                         | o `Escape` do diálogo, com o mesmo destino                                                        |
| Menu: `Tab` sai do menu                                                       | move ao `cancel`; não fecha, porque o menu vive num diálogo e o diálogo contém o foco             |
| Menu: item desabilitado focável e inativo                                     | `aria-disabled="true"`, `data-disabled`                                                          |
| Menu: separador não focável                                                   | `hr` com `role="separator"`                                                                      |
| Menu: `group` rotulado                                                        | `role="group"` com `aria-labelledby` para `group-label`                                           |
| Menu: submenus, `menuitemcheckbox`, `menuitemradio`                           | não se aplica; §1.2                                                                              |

Duas partidas, com o custo:

- **`Tab` não fecha.** No padrão Menu, `Tab` fecha o menu porque o menu é uma camada
  sobre a página. Aqui o menu é o conteúdo de um diálogo modal, e `Tab` fica dentro do
  diálogo. O custo: um leitor que conhece menus espera sair com `Tab`; sai com `Escape`
  ou com o `cancel`, a um `Tab` de distância.
- **O menu e o diálogo têm o mesmo nome.** A lista é `aria-labelledby` do título, e o
  leitor de ecrã anuncia o título duas vezes à entrada ("Partilhar, diálogo. Partilhar,
  menu"). Sem nome, o `menu` seria anunciado sem contexto a quem navega por widgets.

## 3. Anatomia

| Parte          | Elemento  | Contém                                                                                             |
| -------------- | --------- | -------------------------------------------------------------------------------------------------- |
| `root`         | `div`     | a camada, fixa ao viewport; `data-ui`, `data-open`, `data-modal`                                   |
| `trigger`      | `button`  | o controlo que abre; fica onde o consumidor o escreveu                                             |
| `backdrop`     | `div`     | o scrim, só pintado enquanto `modal`                                                               |
| `panel`        | `div`     | a folha, `role="dialog"`                                                                           |
| `header`       | `header`  | `title` e `message`                                                                                |
| `title`        | `h2`      | o nome da folha e da lista                                                                          |
| `message`      | `p`       | a explicação, `aria-describedby`                                                                   |
| `list`         | `div`     | `role="menu"`; a única linha que rola                                                              |
| `group`        | `div`     | `role="group"`                                                                                     |
| `group-label`  | `div`     | o nome do grupo                                                                                    |
| `item`         | `button`  | `role="menuitem"`; `data-tone`, `data-disabled`, `data-loading`                                    |
| `icon`         | `span`    | o visual do item, ou o `spinner` enquanto `loading`                                                |
| `label`        | `span`    | o rótulo                                                                                           |
| `description`  | `span`    | a segunda linha                                                                                    |
| `separator`    | `hr`      | `role="separator"`                                                                                 |
| `footer`       | `div`     | a faixa do `cancel`, em `--slotted-surface-sunken`                                                 |
| `cancel`       | `button`  | fecha com `dismiss`                                                                                |

## 4. Decisões

### 4.1 Não renderiza as partes de `drawer`

O escopo diz "compõe `drawer` com `side="bottom"`". A família compõe os módulos que
`drawer` compõe e não o seu binding, por três factos lidos em
`packages/styles/src/drawer/drawer.css`:

1. O painel inferior mede `block-size: min(var(--_extent), 100%)` — 24rem em `md`. Uma
   action sheet mede o seu conteúdo: duas ações e um cancelar são 200 px, e numa folha de
   384 px sobram 180 px vazios. `min()` não aceita `max-content`, e `--slotted-drawer-extent`
   é um comprimento.
2. O painel inferior ocupa toda a largura. Uma action sheet num ecrã de 1280 px com ações
   de 700 px de largura é o defeito da secção 1.4.
3. O painel de `drawer` tem `body`, `close` e `resizer`; os três seriam partes vazias
   aqui, e `drawer` escreve `data-ui="drawer"`, que `identity.test.mjs` proíbe a esta
   folha endereçar.

Mudar `drawer` é mudar o contrato de outra família, com outra sessão a editá-la nesta
worktree. O custo desta decisão: a camada, o scrim, o deslizar e a área segura do rodapé
são escritos outra vez, cerca de setenta linhas, e as duas famílias podem divergir. O que
a composição do escopo pedia — o mesmo comportamento de camada — é o que os módulos
partilhados garantem: `portal`, `dismissable-layer` (Escape, toque fora, voltar, pilha),
`presence`, `focus` e o bloqueio de scroll.

Depois do gate visual, a bottom sheet fiel às nativas de iOS e Android entrou como
reabertura de `drawer` (`docs/process/build-order.md`, _Reaberturas prometidas por
escrito_; rodada 23 de `docs/process/build-schedule.md`). Essa reabertura remove os factos 1
e 2, e a linha `action-sheet` da mesma secção recompõe esta família sobre `drawer`.

### 4.2 Diálogo que contém um menu

`panel` é `role="dialog"` e `list` é `role="menu"`. O diálogo dá o que o padrão Menu não
dá: modalidade, título, mensagem e um cancelar fora da lista. O menu dá o que um diálogo
de botões não dá: setas, `Home`, `End`, typeahead e um só tabulável para dez ações.

### 4.3 Foco

- **Entrada:** a primeira ação habilitada; o `cancel` quando essa ação tem `tone="danger"`;
  sem `cancel`, a primeira ação que não é `danger`; sem nenhuma, o painel.
- **Ponteiro:** um rato ou caneta sobre um item move o foco para ele, o modelo de `menu`:
  há um só destaque, seja qual for o dispositivo. O toque não move o foco antes do clique.
- **Saída:** o elemento que tinha o foco ao abrir, ou o antecessor ligado mais próximo.
  Não volta depois de um toque fora numa folha não modal, que o leitor fez na página viva. Numa folha modal o toque cai no scrim, que é da folha, e o foco volta como depois do `cancel`.

### 4.4 Estado

```json
"open": {
  "controlled": "open",
  "uncontrolled": "defaultOpen",
  "request": "onOpenChange",
  "reasons": ["pointer", "keyboard", "select", "dismiss", "escape", "outsidePress", "back", "programmatic"],
  "result": "the value of the item that was selected, when the reason is select"
}
```

| Origem                                   | Razão          |
| ---------------------------------------- | -------------- |
| gatilho, ponteiro                        | `pointer`      |
| gatilho, `Enter` ou `Space`              | `keyboard`     |
| item ativado com `closeOnSelect`         | `select`       |
| `cancel`                                 | `dismiss`      |
| `Escape`                                 | `escape`       |
| toque fora                               | `outsidePress` |
| gesto de voltar                          | `back`         |
| handle ou `open` do consumidor           | `programmatic` |

`onSelect` corre antes do pedido de fecho; `preventDefault()` nele mantém a folha aberta.

### 4.5 Eixos

| Eixo            | Valores                       | Omissão  |
| --------------- | ----------------------------- | -------- |
| `modal`         | boolean                       | `true`   |
| `mount`         | `active` `lazy` `eager`       | `active` |
| `escape`        | `close` `none`                | `close`  |
| `outsidePress`  | `close` `none`                | `close`  |
| `back`          | `close` `none`                | `close`  |
| `closeOnSelect` | boolean                       | `true`   |

Sem `size`: a altura de um item é o alvo de toque, que não tem passos. Sem `side`: a folha
nasce da borda inferior, que é onde está o polegar.

**`modal={false}` não pinta scrim.** `drawer` pinta o scrim nos dois casos; aqui o scrim
seria a promessa de uma página inerte que continua a responder. Sem `modal`, a página
continua operável, o foco não fica contido, não há bloqueio de scroll e o toque fora
continua a fechar.

### 4.6 Geometria

- A folha encosta à borda inferior, centrada, com
  `inline-size: min(100%, var(--slotted-action-sheet-inline-size, 32rem))` e os dois cantos
  de cima arredondados. É a forma da bottom sheet do Material 3 num tablet.
- `max-block-size: calc(100% - var(--slotted-space-12))`: 64 px de scrim ficam sempre
  acima da folha.
- Três linhas de grelha, `auto minmax(0, 1fr) auto`; a do meio é a lista e é a única que rola.
- O item mede `--slotted-control-height-lg` (38/32/30 px), que o tema sobe para
  `--slotted-target-comfortable` (44 px) sob `pointer: coarse`, por densidade. A primeira
  versão fixava 44 px em todas as larguras e, num navegador de secretária, a folha lia-se
  grande ao lado do `menu` (34 px e 13 px); foi o reparo do revisor depois do gate de release.
- O rótulo mede `--slotted-font-size-md` com ponteiro fino e `--slotted-font-size-lg` com
  ponteiro grosso, onde as folhas nativas usam 16 a 20 pontos. O ícone mede 1,125 vezes o
  rótulo, porque o rótulo não muda com a densidade: com `--slotted-control-icon-size-lg`, em
  `dense`, uma marca de 14 px ficava ao lado de uma palavra de 16 px.
- As linhas da lista são `max-content`. Com a lista a rolar, a sua altura é definida, e sem
  espaço livre uma linha `auto` fica na contribuição mínima do item, que é o seu
  `min-block-size`: medido a 240 px, cada linha tinha 44 px e um rótulo de três linhas era
  pintado sobre os dois itens seguintes.
- Tipo: título em `--slotted-font-size-md` semibold,
  mensagem e descrição em `--slotted-font-size-sm` mudas. O título é o contexto e as
  ações são o conteúdo, que é a hierarquia de UIKit e Ionic.
- Área segura: o rodapé soma `env(safe-area-inset-bottom)` ao seu recuo de bloco; sem
  rodapé, soma-o a lista. As laterais somam `env(safe-area-inset-left/right)` num telefone
  deitado.

### 4.7 Movimento

| Transição        | Propriedade | Duração                     | Easing                   |
| ---------------- | ----------- | --------------------------- | ------------------------ |
| scrim, entrada   | `opacity`   | `--slotted-duration-medium` | `--slotted-easing-enter` |
| scrim, saída     | `opacity`   | `--slotted-duration-short`  | `--slotted-easing-exit`  |
| folha, entrada   | `translate` | `--slotted-duration-medium` | `--slotted-easing-enter` |
| folha, saída     | `translate` | `--slotted-duration-short`  | `--slotted-easing-exit`  |
| item, destaque   | `background-color`, `color` | `--slotted-control-transition-duration` | `--slotted-control-transition-easing` |

A folha desliza e não esmaece, a leitura de `drawer`.

## 5. Integração

### React

| Pergunta                                                         | Resposta                                                                                                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Par controlado e não controlado, pedido com razão                | sim: `open`/`defaultOpen`/`onOpenChange(open, request)`, `request.reason`, `request.result`, `request.cancel()`                     |
| Defaults definidos uma vez                                       | sim: `ActionSheetDefaultsProvider` e `useActionSheetDefaults`, sobre os seis eixos e `cancelLabel`                                    |
| Substituir o elemento de cada parte                              | sim: `render` em `Trigger`, `Content`, `Title`, `Message`, `Item` e `Cancel`; `Group`, `GroupLabel`, `Separator` e as células do item são fixos, porque o papel e a geometria são o que eles são |
| O handler do consumidor continua a correr                        | sim: `onClick`, `onKeyDown`, `onPointerMove` correm primeiro; o comportamento da família salta quando o consumidor chamou `preventDefault` |
| Elemento nativo e ação imperativa                                | sim: `ref` em cada parte; `ref` de `ActionSheet` com `open()`, `close()` e `focus()`                                                  |
| Servidor sem divergência de hidratação                           | sim: `useId` para os ids; o portal resolve-se num efeito, o servidor desenha só o gatilho                                            |
| Cada estado estilizável no DOM                                   | sim: `data-open`, `data-modal`, `data-tone`, `data-disabled`, `data-loading`                                                          |
| Props de cada parte são as do elemento nativo                    | sim: `ComponentPropsWithRef<'button' \| 'div' \| 'h2' \| 'p' \| 'span' \| 'hr'>`                                                     |

### Angular

| Pergunta                                                   | Resposta                                                                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Valor de duas vias em sinal                                | sim: `open = model(false)` e `openChangeRequest` com razão e resultado                                                    |
| Reactive Forms e template forms                            | não: a folha não guarda valor submetido; dispara ações                                                                    |
| Defaults definidos uma vez                                 | sim: `provideActionSheetDefaults()` e `ACTION_SHEET_DEFAULTS`                                                             |
| O template alcança a instância                             | sim: `exportAs: 'slActionSheet'`; `<button slActionSheetTrigger [actionSheet]="s">`                                       |
| Conteúdo projetado e preguiçoso                            | sim: `ng-content` com `select` para cabeçalho, lista e `cancel`; `mount="active"` só cria o template da camada aberta      |
| Zoneless e `OnPush`                                        | sim: sinais, `ChangeDetectionStrategy.OnPush`, sem `markForCheck`                                                         |
| Subscrições e listeners desfeitos                          | sim: camada, âmbito de foco, presença e portal libertados em `DestroyRef`                                                 |
| Atributo estático do consumidor sobrevive                  | sim: `HostAttributeToken` lê `aria-label` do host antes de escrever o do painel                                           |
| Entry point de uma só classe por papel                     | sim: `@slotted/angular/action-sheet`                                                                                      |

## 6. Custo de uma resposta errada no gate visual

- Folha encostada contra folha destacada com cantos nos quatro lados: a folha e o
  harness, uma hora.
- Diálogo com menu contra diálogo com botões: o contrato, o teclado e os dois bindings; no
  gate visual custa uma linha do contrato, depois da ligação custa os testes dos dois
  bindings.
- `cancel` na faixa `sunken` contra `cancel` como mais um item: a folha e a anatomia; depois
  da ligação, as duas páginas de referência.
