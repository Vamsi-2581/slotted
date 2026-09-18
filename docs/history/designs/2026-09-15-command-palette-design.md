# Command palette — desenho

Escrito antes de qualquer binding, como o passo 5 de
`.claude/skills/component/SKILL.md` exige. Regista as decisões e o que cada
uma custa. O levantamento e o veredito de cada capacidade estão em
`2026-09-15-command-palette-capability-inventory.md` e não se repetem aqui.

---

## 1. O que a família é

Uma superfície de busca que executa. O leitor abre por atalho ou gatilho,
escreve, e a lista responde com comandos e destinos ordenados; `Enter` executa
o corrente. É um `combobox` editável cujo popup `listbox` está sempre visível,
dentro de um `dialog` — ou em linha, dentro de um `popover` ou de uma página.

Anti-uso: escolher um valor para um formulário (`combobox`); uma lista de
comandos sem busca (`menu`); um conjunto de opções com estado (`listbox`,
`menu` com `menuitemcheckbox`).

---

## 2. O que compõe, e o que não desenha

| Composto de           | Responde                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| família `dialog`      | a camada, o scrim, `presence`, `portal`, contenção e devolução do foco, `Escape`, pressão fora, pilha z |
| família `kbd`         | as legendas dos atalhos por plataforma (`Shortcut`), no item e nas dicas do rodapé                    |
| folha `highlight`     | a marca do trecho encontrado (`match`), como `combobox`                                               |
| folha `spinner`       | o anel que substitui a lupa enquanto `loading`                                                        |
| folha `skeleton`      | as três linhas do `placeholder` enquanto `loading` com a lista vazia                                  |
| `@slotted/core/collection` | `moveIndex` para o realce, `matchRanges` para a marca, e o novo `createRanker`                   |
| `@slotted/core/keys`  | `resolveShortcut` para anunciar, e o novo `matchesShortcut` para o atalho de abertura                 |
| `@slotted/core/live-announcer` | o número de resultados, sem anúncio duplicado                                                |
| `@slotted/core/state` | os quatro valores mutáveis                                                                            |

`upload` já compõe `dialog` em ambos os bindings (`upload-viewer`), e é a forma
seguida: React envolve o painel em `<Dialog surface="plain" placement="top">`
e Angular projeta-o em `<sl-dialog>`. `dialog` não é reescrito. A folha da
paleta não toca `[data-ui='dialog']` — `identity.test.mjs` proíbe-o — e por
isso a raiz da paleta desenha o seu próprio painel (chão, borda, raio, sombra)
sobre a superfície `plain` do diálogo.

Com `presentation="inline"` nada disto existe: a raiz é escrita no lugar,
sem camada, e é o que `menu` mandou para cá quando recusou o menu filtrado.

### Duas adições a `packages/core`, no seu próprio commit

**`createRanker` em `collection/filter.ts`.** O escopo nomeia o `typeahead`
como ordenação padrão; o módulo é um casador de prefixo com temporizador e
ciclo, e não pontua. O que pontua é uma função sobre o mesmo colador que
`createFilter` já constrói: `rank(query, label, keywords) => number | null`.
`null` é "não corresponde"; a pontuação distingue prefixo do rótulo (4),
início de palavra (3), substring (2) e palavra-chave (1), com desempate pela
ordem em que o consumidor escreveu os itens. A comparação é `Intl.Collator`
em sensibilidade `base`, como §2.9 do guia pede — `résumé` responde a
`resume`, e o cmdk não responde.

**`matchesShortcut` e `isEditableTarget` em `keys/keys.ts`.** `menu` anuncia
`aria-keyshortcuts` e nunca dispara; esta família tem de disparar um: o de
abertura. `matchesShortcut(event, keys, { platform })` compara os
modificadores e a tecla de um `KeyboardEvent` com um passo de `parseShortcut`
(`mod` é `Meta` num Mac e `Control` fora dele). `isEditableTarget(event)` diz
se o alvo é um `input`, `textarea`, `select` ou `contenteditable`, que é onde
uma tecla sem modificador não dispara — §5 do guia, Keyboard Shortcut.

---

## 3. Anatomia

```
┌─ root ─ div ─ data-ui='command-palette' ───────────────────────────────┐
│ ┌─ header ───────────────────────────────────────────────────────────┐ │
│ │ search│busy  pages ▸ page › page   input (role=combobox)    clear  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌─ list ─ role=listbox ─ rola ────────────────────────────────────────┐ │
│ │ group ▸ group-label                                                 │ │
│ │ item ▸ icon │ label ▸ match │ description │ meta │ shortcut │ arrow │ │
│ │ separator                                                           │ │
│ │ placeholder (3 linhas)   empty ▸ "No results"                       │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ status (região viva, visualmente oculta)                               │
│ ┌─ footer ──────────────────────────────────────────────────────────┐  │
│ │ hint ▸ kbd ↑↓ navigate   hint ▸ kbd ↵ select   hint ▸ kbd esc close│  │
│ └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
trigger ─ button ─ escrito no lugar, fora da camada
```

| Parte         | Elemento | Papel                                                                                                                                    |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `root`        | `div`    | o painel; `data-ui`, os eixos, `data-open`, `data-loading`, `data-presentation`                                                          |
| `trigger`     | `button` | o gatilho, composto sobre o `trigger` de `dialog`; ausente em `inline`                                                                   |
| `header`      | `div`    | a linha de busca                                                                                                                         |
| `search`      | `span`   | a lupa, de `--slotted-icon-search`                                                                                                       |
| `busy`        | `span`   | o anel de `spinner`, no lugar da lupa enquanto `loading`                                                                                 |
| `pages`       | `ol`     | a trilha das páginas abertas                                                                                                             |
| `page`        | `button` | uma página na trilha; pressioná-la volta até ela                                                                                         |
| `input`       | `input`  | `role="combobox"`, `aria-expanded="true"`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`, `autocomplete="off"`, `spellcheck="false"` |
| `clear`       | `button` | limpa a consulta; `tabindex="-1"`, visível só com consulta                                                                               |
| `list`        | `div`    | `role="listbox"`, rola, `aria-busy` enquanto `loading`                                                                                   |
| `group`       | `div`    | `role="group"`, `aria-labelledby` na sua etiqueta                                                                                        |
| `group-label` | `div`    | o título do grupo, `role="presentation"`                                                                                                 |
| `item`        | `div` ou `a` | `role="option"`, `id`, `aria-selected` (= corrente), `aria-disabled`, `aria-keyshortcuts`, `data-current`, `data-disabled`, `data-loading`, `data-page` |
| `icon`        | `span`   | a marca do item, do consumidor                                                                                                           |
| `label`       | `span`   | o rótulo, com `match` dentro                                                                                                             |
| `match`       | `mark`   | o trecho encontrado, `data-ui='highlight'` ao lado                                                                                       |
| `description` | `span`   | a segunda linha                                                                                                                          |
| `meta`        | `span`   | texto ao fim do item — "Recent", a categoria; `aria-hidden`                                                                             |
| `shortcut`    | `kbd`    | o `Shortcut` de `kbd`, variante `plain`; `aria-hidden`, anunciado por `aria-keyshortcuts` no item                                        |
| `arrow`       | `span`   | o chevron do item que abre uma página, espelhado em RTL                                                                                  |
| `separator`   | `div`    | `role="separator"`, entre grupos                                                                                                         |
| `empty`       | `div`    | "No results", quando nada correspondeu                                                                                                   |
| `status`      | `div`    | `role="status"`, visualmente oculta; o número de resultados, `loadingLabel`, `errorLabel`                                                |
| `placeholder` | `div`    | três linhas de `skeleton`, `aria-hidden`, enquanto `loading` sem itens                                                                   |
| `footer`      | `div`    | as dicas de teclado; substituível                                                                                                        |
| `hint`        | `span`   | uma dica: um `Shortcut` de `kbd` e uma palavra                                                                                           |

Vinte e seis partes. `aria-selected` acompanha o realce porque a nota do
padrão diz "selection follows focus in the listbox"; a paleta não tem outra
seleção, e `data-current` é o que a folha lê.

O item é uma grelha de seis colunas — marca, palavras, meta, atalho, seta —
como `menu` e `listbox` já são: a coluna do atalho tem a largura do atalho
mais largo da lista, e um rótulo longo come a coluna das palavras e nunca a
do atalho.

---

## 4. Estado

Quatro valores, por `@slotted/core/state`:

| Capacidade          | Controlado       | Não controlado          | Requisição               | Razões                                                             |
| ------------------- | ---------------- | ----------------------- | ------------------------ | ------------------------------------------------------------------ |
| `open`              | `open`           | `defaultOpen`           | `onOpenChange`           | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`, `dismiss`, `programmatic` |
| `value` (consulta)  | `query`          | `defaultQuery`          | `onQueryChange`          | `keyboard`, `clear`, `select`, `programmatic`                      |
| `current.item`      | `highlightedId`  | `defaultHighlightedId`  | `onHighlightedIdChange`  | `pointer`, `keyboard`, `programmatic`                              |
| `current.page`      | `pages`          | `defaultPages`          | `onPagesChange`          | `select`, `keyboard`, `pointer`, `programmatic`                    |
| `queue` (recentes)  | `recent`         | `defaultRecent`         | `onRecentChange`         | `select`                                                           |

`current` é um conjunto de dois modelos, como `app-shell` declara dois
`open`: o item corrente e a página corrente são ambos "onde o leitor está".
`queue` é a palavra que `toast` pôs no vocabulário para "uma coleção ordenada
que a família mantém e corta sozinha, e que o consumidor pode possuir"; os
recentes são exactamente isso, com `recentLimit` como o corte.

A execução não é estado: `onSelect(item, request)` na raiz e `onSelect` no
item, com `reason` `pointer` ou `keyboard`, o evento de origem, `keepOpen()`
e, quando o handler devolve uma `Promise`, a espera. Um item `disabled` nunca
chega aqui.

### Ao fechar

Com `clearOnClose` (padrão), o fecho repõe a consulta, a pilha de páginas e o
realce, cada um pela sua requisição com razão `programmatic`. Sem ele, a
paleta reabre onde ficou.

### Ao abrir com o atalho e já aberta

O atalho não fecha: foca o campo e seleciona a consulta, como Spotlight e
Raycast. `toggle()` no handle fecha.

---

## 5. Ordenação, páginas e recentes

**Ordem com consulta.** Cada item da página corrente recebe
`rank(item, query)`; `null` sai. Dentro de um grupo, por pontuação e depois
pela ordem do consumidor; os grupos pela melhor pontuação do seu melhor
item. `rank={null}` mostra a lista tal como veio — a resposta de um servidor.

**Ordem sem consulta.** A ordem do consumidor; `groups` dá a ordem dos
grupos e o seu rótulo, e um item cujo `group` não está em `groups` vai para
um grupo sem rótulo no fim. `limit` corta.

**Páginas.** `children` num item faz dele uma página: `Enter` ou o ponteiro
empilham o seu `id` em `pages`, a consulta é limpa, o realce vai ao primeiro
filho, e a trilha mostra o rótulo. `Backspace` com a consulta vazia e
`Escape` voltam uma página. Os filhos podem chegar depois — o consumidor
substitui `items` e a família reencontra a página pelo `id`.

**Recentes.** Com a consulta vazia, na raiz e com `recent` não vazio, o
primeiro grupo é `recentLabel` com os itens cujos `id`s estão em `recent`,
pela ordem do array, com `meta` vazio. Executar um item chama
`onRecentChange` com o `id` à frente e o array cortado em `recentLimit`. Um
`id` sem item é ignorado no desenho e mantido no array.

---

## 6. Teclado, papéis e o padrão

Fontes, lidas em 15 de setembro de 2026:

- Combobox Pattern — <https://www.w3.org/WAI/ARIA/apg/patterns/combobox/>
- Dialog (Modal) Pattern — <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/>
  (respondido por `dialog`; não se repete)

O foco fica no campo em todas as linhas: a nota do padrão diz que "DOM focus
is maintained on the combobox and the assistive technology focus is moved
within the listbox using aria-activedescendant", e as duas tabelas do padrão
(combobox e listbox popup) fundem-se numa, como `combobox` já fez.

| Tecla                | Efeito                                                                                                                      | Origem   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- |
| `ArrowDown`          | move o realce ao item seguinte; enrola com `loop`                                                                            | padrão   |
| `ArrowUp`            | move o realce ao anterior; enrola com `loop`                                                                                 | padrão   |
| `Enter`              | executa o corrente; com `children`, abre a página; com `href`, segue o destino. Sem corrente, nada                          | padrão   |
| `Escape`             | com consulta, limpa-a; com página e sem consulta, volta uma; senão, `dialog` fecha (`escape`). Em `inline`, o último passo não existe | padrão (opcional: "clears the contents of the combobox") |
| `Home` / `End`       | o cursor do texto — o ramo editável do padrão, que o navegador faz                                                            | plataforma |
| `Ctrl+Home` / `Ctrl+End` | o primeiro / último item                                                                                               | família  |
| `PageUp` / `PageDown`| dez itens, sem enrolar                                                                                                       | família (opcional no padrão para grid; adotado como `combobox`) |
| `ArrowLeft` / `ArrowRight` | o cursor do texto, nunca interceptadas                                                                                 | plataforma |
| `Backspace`          | a edição do texto; com a consulta vazia e uma página aberta, volta uma página                                                | plataforma / família |
| `Delete`             | a edição do texto                                                                                                            | plataforma |
| caractere            | escrito no campo; filtra                                                                                                     | plataforma |
| `Tab`                | dentro de `dialog`, a contenção do foco: `clear` tem `tabindex="-1"` e as páginas da trilha são alcançáveis; em `inline`, sai da família | `dialog` / plataforma |
| `Alt+ArrowDown` / `Alt+ArrowUp` | nada: o popup está sempre visível e não há o que abrir ou fechar                                                  | padrão (opcional, sem objeto) |
| atalho de abertura   | `hotkey` no documento, fase de captura, `preventDefault`; ver §2                                                             | família  |

### Papéis e propriedades

| Requisito do padrão                                                        | Resposta                                                                                   |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| o elemento de entrada tem `role="combobox"`                                | `input`                                                                                    |
| `aria-controls` aponta ao popup                                            | sempre, ao `list`, porque o popup está sempre visível                                      |
| o popup tem `role="listbox"`                                               | `list`                                                                                     |
| `aria-expanded`                                                            | `true` sempre que a paleta está montada; o popup nunca fecha sozinho                       |
| foco DOM no combobox; `aria-activedescendant` no descendente               | o modelo de realce de `combobox`                                                           |
| `aria-autocomplete`                                                        | `list`                                                                                     |
| o item sugerido tem `aria-selected="true"`                                 | o corrente                                                                                 |
| grupos com nome                                                            | `group` com `aria-labelledby` na `group-label`                                             |
| o campo tem nome                                                           | `aria-label` do consumidor (`inputLabel`, padrão "Search commands"); o `dialog` toma o nome de `label` (padrão "Command palette") |

### Partidas deliberadas, com o custo

- **`aria-expanded` é sempre `true`.** O padrão descreve um popup que abre e
  fecha; aqui a lista é a própria superfície. Um leitor de tela ouve "expanded"
  ao entrar no campo, que é o que a lista é. O custo é não haver estado
  "collapsed" para anunciar; em `inline` também não há.
- **`Escape` não fecha à primeira quando há consulta.** Regista-se em
  _Decisions already taken_ para `select`; aqui é o mesmo passo. O custo é um
  `Escape` a mais para o leitor que escreveu e quer sair.

---

## 7. Eixos

| Eixo            | Valores                | Padrão     |
| --------------- | ---------------------- | ---------- |
| `presentation`  | `dialog` `inline`      | `dialog`   |
| `size`          | `sm` `md` `lg`         | `md`       |
| `loop`          | booleano               | `true`     |
| `autoHighlight` | booleano               | `true`     |
| `closeOnSelect` | booleano               | `true`     |
| `clearOnClose`  | booleano               | `true`     |
| `highlightMatch`| booleano               | `true`     |
| `loading`       | booleano               | `false`    |
| `disabled`      | booleano               | `false`    |
| `limit`         | número ou nenhum       | nenhum     |
| `recentLimit`   | número                 | `5`        |
| `hotkey`        | string ou `null`       | `mod+k`    |
| `outsidePress`  | `close` `none`         | `close`    |

`size` é a medida do painel e passa ao `dialog` como o seu `size`: `sm`
24rem, `md` 32rem, `lg` 42rem — a mesma escala de cinco passos do diálogo,
nos três que uma paleta usa. Em `inline` a raiz enche o contêiner. `dialog`
recebe `placement="top"`, `surface="plain"`, `scroll="content"`,
`fullScreen="narrow"`, `escape="none"` (a família decide o `Escape` no
campo, ver §6) e `modal`.

Rótulos: `label`, `inputLabel`, `placeholder` ("Type a command or search…"),
`emptyLabel`, `loadingLabel`, `errorLabel`, `countLabel`, `recentLabel`,
`clearLabel`, `backLabel`, `hintNavigate`, `hintSelect`, `hintClose`,
`hintBack`. Todos em `commandPaletteDefaults`.

---

## 8. Geometria e tokens

- O painel: `--slotted-surface-raised`, `--slotted-border-subtle`,
  `--slotted-radius-lg`, `--slotted-shadow-lg`; `--slotted-command-palette-*`
  para os pontos que um tema retoca (chão, borda, raio, sombra, altura máxima
  da lista, chão da linha corrente).
- O cabeçalho: altura de `--slotted-control-height-lg` no passo `md`; o campo
  é `plain` — sem moldura, sem anel próprio — porque o painel já é a moldura,
  e o anel de foco vai ao `header` por `:has(> [data-part='input']:focus-visible)`,
  desenhado para dentro. A lupa e o anel de `spinner` têm
  `--slotted-control-icon-size-lg`.
- As linhas: `--slotted-control-height-md` de altura mínima,
  `--slotted-control-padding-inline-md`, `--slotted-control-gap-md`; a marca
  em `--slotted-control-icon-size-md`. A linha corrente pinta
  `--slotted-tone-accent-surface` e um trilho de `--slotted-tone-accent-border`
  na borda inicial, como `menu`. Hover é a mesma pintura sem o trilho; o
  realce tem precedência.
- A trilha: chips de `--slotted-control-inner-size-md`, chão
  `--slotted-tone-secondary-subtle-hover`, raio `--slotted-radius-sm`.
- O rodapé: `--slotted-surface-sunken`, uma régua `--slotted-border-subtle`,
  tipo `--slotted-font-size-xs`, teclas de `kbd` em `plain`, tamanho `sm`.
- A altura máxima da lista é um literal em `rem` com o mesmo motivo do
  `--slotted-dialog-measure`: uma medida que nenhuma escala guarda; fica
  como `var(--slotted-command-palette-list-max-block-size, 22rem)`.
- Movimento: só a camada anima, e é `dialog` que a anima. A linha corrente
  não transita — a mudança de linha é uma leitura, não um deslocamento.
- Contêiner: `container-type: inline-size` na raiz, `container-name:
  command-palette`; abaixo de 360px a `description` some, o `meta` some e o
  `shortcut` fica.

---

## 9. Integração — React

| Pergunta                                                           | Resposta                                                                                                                                                                   |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Par controlado / não controlado com razão                          | sim: `createControllable` para `open`, `query`, `highlightedId`, `pages`, `recent`; cada requisição carrega `reason`, `previous`, `source`, `cancel()`                     |
| Padrões uma vez                                                    | sim: `CommandPaletteDefaultsProvider` / `useCommandPaletteDefaults` sobre os eixos e os rótulos de §7                                                                      |
| Substituir o elemento de cada parte                                | sim: `render` em `CommandPaletteTrigger`, `renderItem(item, state)` para o conteúdo do item, `footer` e `empty` como `ReactNode`; `root`, `header`, `input`, `list` são fixos porque carregam a fiação, e o `render` do item substitui o conteúdo e não o `option` |
| O handler do consumidor corre                                      | sim: `onKeyDown`, `onChange`, `onClick` do consumidor correm antes; `preventDefault` salta a família                                                                       |
| Elemento nativo e ação imperativa                                  | sim: `ref` no `input` via `inputProps.ref`; handle `open()`, `close()`, `toggle()`, `focus()`, `setQuery()`, `scrollToId()`                                                |
| SSR sem divergência                                                | sim: `useId` para os ids; nenhuma leitura de layout no render; o `dialog` não existe fechado; o `hotkey` liga-se num efeito                                               |
| Todo estado no DOM                                                 | sim: `data-open`, `data-loading`, `data-disabled`, `data-current`, `data-presentation`, `data-size`, `data-page`, `data-empty`, `data-query`                               |
| Props do elemento nativo, estendidas                               | sim: `ComponentPropsWithRef<'div'>` na raiz, `<'input'>` em `inputProps`, `<'button'>` no gatilho                                                                          |

`CommandPalette` é o provedor e o painel: recebe `items` e desenha tudo, com
`CommandPaletteTrigger` como filho opcional (composto sobre `DialogTrigger`).
Sem gatilho, um marcador `<span hidden>` é a origem do portal, como
`upload-viewer` faz, para que a camada herde o tema da região.

---

## 10. Integração — Angular

| Pergunta                                                           | Resposta                                                                                                                                                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valor bidirecional na forma do ecossistema                         | sim: `model()` para `open`, `query`, `highlightedId`, `pages`, `recent`; `output()` para cada requisição e para `select`                                                          |
| Reactive Forms                                                     | não: a paleta não guarda um valor que um formulário submeta; a consulta é transitória                                                                                             |
| Padrões uma vez                                                    | sim: `COMMAND_PALETTE_DEFAULTS` e `provideCommandPaletteDefaults()`                                                                                                                |
| Instância no template                                              | sim: `exportAs: 'slCommandPalette'`; `<button slCommandPaletteTrigger [palette]="p">`                                                                                             |
| Conteúdo projetado e preguiçoso                                    | sim: `<ng-template slCommandPaletteItem let-item>` para o conteúdo do item; `ng-content select="[slCommandPaletteFooter]"` e `[slCommandPaletteEmpty]`; o painel vive no `sl-dialog`, que só o constrói aberto |
| Zoneless e `OnPush`                                                | sim: sinais em tudo; sem `markForCheck`                                                                                                                                            |
| Teardown                                                           | sim: o `keydown` do documento e o anunciador libertam-se em `DestroyRef`; o resto é do `sl-dialog`                                                                                 |
| Atributo estático do consumidor                                    | sim: `HostAttributeToken` lê `aria-label` e `id` antes de a família escrever                                                                                                        |
| Um único ponto de entrada                                          | sim: `@slotted/angular/command-palette`, importando `@slotted/angular/dialog` e `@slotted/angular/kbd`                                                                            |

`<sl-command-palette>` é escrito no lugar e o seu template contém o
`<sl-dialog>`; em `inline` o template contém a raiz diretamente. O gatilho é
uma diretiva sobre o controle do consumidor que chama `open()` na instância.

---

## 11. Decisões e custos

| Decisão                                                            | Custo                                                                                                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Itens são dados, com `renderItem` como saída                       | Um consumidor que quer JSX arbitrário por item escreve `renderItem`; não há `<CommandPaletteItem>` como filho, porque o motor ordena valores e não DOM  |
| Compor a família `dialog`                                          | A raiz da paleta desenha o painel por cima da superfície `plain`, e o `size` do diálogo é a medida; o `Escape` é decidido pela paleta com `escape="none"` no diálogo |
| `Escape` limpa antes de fechar                                     | Um `Escape` a mais para quem escreveu; alinhado com `select`                                                                                           |
| `aria-expanded` sempre `true`                                      | Sem estado fechado a anunciar                                                                                                                          |
| Atalhos por item só desenhados                                     | O consumidor liga-os com `matchesShortcut`; três linhas na página                                                                                      |
| `hotkey` padrão `mod+k`                                            | Colide com a barra de pesquisa do Firefox; `preventDefault` vence; `hotkey={null}` desliga                                                             |
| `recent` sob `queue`                                               | Um leitor do contrato encontra os recentes sob uma palavra que `toast` cunhou; a razão está escrita no contrato                                         |
| `current` como conjunto `item` + `page`                            | Dois modelos sob uma capacidade, como `app-shell`; a página é "onde o leitor está" e não uma seleção                                                    |
| `createRanker` e `matchesShortcut` em `packages/core`              | Dois commits antes da família; `combobox` pode adotar o ranker numa reabertura                                                                          |
| Sem `close`                                                        | O scrim e `Escape` fecham; um consumidor com `outsidePress="none"` desenha o seu no `footer`                                                             |
| Sem virtualização                                                  | `limit` e rolagem; `collection` quando chegar                                                                                                          |
