# Inventário de capacidades — `command-palette`

Produzido antes de qualquer desenho ou código, como
`.claude/skills/component/references/capability.md` exige. A família é nova:
`specs/components/command-palette/` não existe.

Escopo escrito em `docs/build-order.md`, onda 9: `dialog` com `combobox` +
`listbox` dentro; itens com `id`, `label`, `keywords`, `group`, `disabled` e
handler ou destino; `query` controlável; `loading` e `empty`; atalhos,
histórico, ações assíncronas e subcomandos como página empilhada; ordenação
como adaptador substituível; não executa item `disabled`; anuncia o número de
resultados pelo `live-announcer`. `menu` recusou o menu filtrado por texto
(inventário de menu, l. 119): um menu cujos itens são filtrados ao digitar é um
`combobox` por papel, e esta família é a resposta.

Fontes lidas em 15 de setembro de 2026.

---

## 1. Pesquisadas

| Implementação             | Chama-lhe                                                                                                                                                                                       | Lida em                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| WAI-ARIA APG              | Combobox Pattern com popup `listbox`; nota sobre `aria-activedescendant`; Dialog (Modal) Pattern para a camada                                                                                   | <https://www.w3.org/WAI/ARIA/apg/patterns/combobox/>, `…/dialog-modal/`              |
| cmdk 1.x (Paco Coursey)   | `Command`, `Command.Dialog`, `Input`, `List`, `Item` (`value`, `keywords`, `onSelect`, `disabled`, `forceMount`), `Group` (`heading`), `Separator`, `Empty`, `Loading`, `filter`, `shouldFilter`, `loop`, `vimBindings`, páginas por estado | <https://raw.githubusercontent.com/pacocoursey/cmdk/main/README.md>                   |
| shadcn/ui                 | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandShortcut` — cmdk vestido                                  | <https://ui.shadcn.com/docs/components/command>                                      |
| Mantine 7 `@mantine/spotlight` | `Spotlight` (`actions` com `id`, `label`, `description`, `keywords`, `leftSection`, `rightSection`, `onClick`), grupos, `filter`, `limit`, `scrollable`/`maxHeight`, `highlightQuery`, `nothingFound`, `shortcut`, `query`/`onQueryChange`, `closeOnActionTrigger`, `clearQueryOnClose`, store `open/close/toggle`, compostos `Spotlight.Root/Search/ActionsList/Action/ActionsGroup/Empty` | <https://mantine.dev/x/spotlight/>                                                   |
| React Aria Components     | `Autocomplete` (`filter`, `useFilter({ sensitivity: 'base' })`, foco virtual, `disableAutoFocusFirst`) sobre `SearchField` + `Menu` ou `ListBox`, dentro de `Dialog`; o exemplo abre com ⌘J                 | <https://react-spectrum.adobe.com/react-aria/Autocomplete.html>                      |
| kbar (Tim Cole)           | `KBarProvider` (`actions` com `id`, `name`, `shortcut`, `keywords`, `section`, `parent`, `perform`, `priority`, `subtitle`, `icon`), `KBarPortal`, `KBarPositioner`, `KBarAnimator`, `KBarSearch`, `useMatches`, `useRegisterActions` | leitura de recordação; <https://kbar.vercel.app/docs> não serviu conteúdo indexável. Conta apenas onde outra fonte confirma |
| VS Code Quick Open        | histórico de recentes com a consulta vazia; modos por prefixo (`>` comandos, `@` símbolos, `:` linha); `Enter` executa, `Escape` fecha; sem grupos, com "recently used" e "other commands"    | uso do produto; <https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette> |
| Linear / Raycast          | páginas empilhadas com trilha no cabeçalho; `Backspace` com consulta vazia volta; rodapé com dicas de teclado; teclas de atalho por item desenhadas como teclas; "Recent" no topo                | uso do produto                                                                       |

Ark UI, Base UI, Radix e Angular Material não têm a família. Angular CDK tem
`Overlay` e `ListKeyManager`, que são infraestrutura e não um produto.

### O que cada fonte decide

- **Itens: dados ou filhos.** cmdk, shadcn e React Aria filtram filhos
  renderizados — cmdk lê o `textContent` do DOM para pontuar. Mantine e kbar
  recebem um array de ações. VS Code e Linear são dados por definição. O
  motor de ordenação precisa de `label` e `keywords` como valores, e uma
  família que lesse o DOM ordenaria o que acabou de pintar.
- **Ordenação.** cmdk pontua com `command-score` e reordena grupos pelo melhor
  item; Mantine filtra por `label`, `description` e `keywords` sem pontuar e
  mostra `fuse.js` como substituto; kbar usa `match-sorter`; React Aria
  filtra por `contains` sem ordenar. Todos aceitam um `filter` do consumidor.
- **Estado da consulta.** Mantine (`query`/`onQueryChange`), cmdk
  (`Input value`/`onValueChange`) e React Aria (`inputValue`) expõem a
  consulta controlável. cmdk também controla o item realçado
  (`value`/`onValueChange` na raiz).
- **Páginas.** cmdk deixa as páginas ao consumidor (`setPages` no exemplo);
  kbar tem `parent` por ação e navega sozinho; Raycast e Linear mostram a
  trilha no cabeçalho e voltam com `Backspace` na consulta vazia.
- **Histórico.** VS Code, Raycast e Linear mostram recentes com a consulta
  vazia. Nenhuma das cinco bibliotecas o tem.
- **Atalhos.** shadcn tem `CommandShortcut` (texto); kbar regista atalhos
  globais por ação; Mantine tem `shortcut` só para abrir (`mod + K` por
  omissão); cmdk nada.
- **Carregamento.** cmdk tem `Loading` (`progress`, `label`); Mantine nada;
  React Aria herda o `loadingState` da coleção.
- **Camada.** cmdk e shadcn compõem `Dialog` do Radix; Mantine compõe o seu
  `Modal`; React Aria compõe `Dialog`/`Popover`. Nenhuma desenha a camada.
- **Sem camada.** cmdk, shadcn e React Aria funcionam em linha — dentro de um
  popover ou numa página. Mantine só em `Modal`.
- **Teclado.** cmdk: setas, `Home`/`End`, `PageUp`/`PageDown`, `Enter`,
  `loop`, `vimBindings` (`Ctrl+N/P/J/K`), `Alt+Seta` salta grupo. React Aria:
  foco virtual com `aria-activedescendant`. Mantine: setas e `Enter`.

---

## 2. Table stakes

| Capacidade                                                             | Quem entrega                                        | Veredito | Razão                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------- | --------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campo de busca com papel `combobox` e lista `listbox` com foco virtual | APG, cmdk, React Aria, Mantine                      | adopt    | `input` com `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`; a lista com `role="listbox"` e itens `option`. O foco nunca sai do campo — o modelo que `combobox` já usa.                                                                               |
| Itens com identificador, rótulo, palavras-chave, descrição e desativado | cmdk, Mantine, kbar                                 | adopt    | `items: CommandItem[]` com `id`, `label`, `keywords`, `description`, `group`, `disabled`, `icon`, `shortcut`, `meta`, `onSelect`, `href`, `children`. Dados, não DOM: o motor de ordenação lê valores.                                                                            |
| Handler por item e destino por item                                    | cmdk (`onSelect`), Mantine (`onClick`), kbar (`perform`), Linear (rotas) | adopt    | `onSelect` no item e `href` no item; com `href` o item é um `a`. `onSelect` na raiz recebe todo item executado, com a razão e o evento.                                                                                                                                        |
| Grupos com título                                                      | cmdk, shadcn, Mantine, kbar (`section`)             | adopt    | `group` no item; `groups` na raiz dá rótulo e ordem. Com consulta, um grupo sobe pelo seu melhor item, como cmdk.                                                                                                                                                                  |
| Filtro/ordenação substituível e desligável                             | cmdk (`filter`, `shouldFilter`), Mantine (`filter`), React Aria (`filter`) | adopt    | `rank(item, query) => number \| null`; `rank={null}` entrega a lista tal como veio. O padrão é `createRanker` de `@slotted/core/collection`, o mesmo colador de `createFilter`.                                                                                                     |
| Consulta controlável                                                   | Mantine, cmdk, React Aria                           | adopt    | `query` / `defaultQuery` / `onQueryChange`, razões `keyboard`, `clear`, `select`, `programmatic`.                                                                                                                                                                                  |
| Item realçado controlável                                              | cmdk (`value`/`onValueChange`)                      | adopt    | `highlightedId` / `defaultHighlightedId` / `onHighlightedIdChange`, como `combobox`.                                                                                                                                                                                              |
| Aberto controlável, abertura por atalho global                         | cmdk (`Dialog open`), Mantine (`shortcut`), kbar, React Aria (⌘J) | adopt    | `open` / `defaultOpen` / `onOpenChange`; `hotkey="mod+k"` por omissão, `hotkey={null}` desliga. Um acorde com modificador dispara em qualquer lugar; uma tecla sem modificador (`/`) não dispara num campo editável, como §5 do guia pede.                                        |
| Estado vazio                                                           | cmdk, shadcn, Mantine, React Aria                   | adopt    | `empty`, com `emptyLabel` e conteúdo substituível.                                                                                                                                                                                                                                 |
| Estado de carregamento                                                 | cmdk (`Loading`), React Aria                        | adopt    | `loading` na raiz: `busy` substitui a lupa, `placeholder` (três linhas de `skeleton`) ocupa a lista vazia, `status` anuncia `loadingLabel`, `aria-busy` na lista.                                                                                                                  |
| Realce do trecho encontrado                                            | Mantine (`highlightQuery`)                          | adopt    | `match`, com `matchRanges` e a folha `highlight`, como `combobox`. Aplica-se ao rótulo; `keywords` nunca são mostradas.                                                                                                                                                             |
| Atalho por item                                                        | shadcn (`CommandShortcut`), kbar, Linear, Raycast   | adapt    | `shortcut: 'mod+shift+p'` no item, desenhado por `kbd` (`Shortcut`, variante `plain`) na notação da biblioteca e anunciado por `aria-keyshortcuts` como `menu` faz. A família não regista o atalho: `kbd` diz "não registra atalhos sozinho", e o consumidor liga-o com `matchesShortcut` em três linhas. |
| Rodapé com dicas de teclado                                            | Linear, Raycast, Vercel, Slack                      | adopt    | `footer` com `hint`s: setas navegam, `Enter` executa, `Escape` fecha, `Backspace` volta quando há página. Substituível pelo consumidor.                                                                                                                                             |
| Setas, `Home`/`End`, `PageUp`/`PageDown`, `Enter`, `Escape`            | APG, cmdk                                           | adopt    | A tabela do padrão combobox com popup listbox, transcrita no desenho §4. `Home`/`End` movem o cursor do texto (ramo editável do padrão); `Ctrl+Home`/`Ctrl+End` vão ao primeiro e último item.                                                                                    |
| `loop`                                                                 | cmdk                                                | adopt    | `loop`, padrão `true`: uma paleta é uma lista curta de comandos e o enrolar é conveniência, o mesmo que `menu` decidiu.                                                                                                                                                             |
| Fecha ao executar                                                      | Mantine (`closeOnActionTrigger`), cmdk (consumidor) | adopt    | `closeOnSelect`, padrão `true`; um item pode manter a paleta aberta chamando `keepOpen()` na requisição.                                                                                                                                                                          |
| Limpa a consulta ao fechar                                             | Mantine (`clearQueryOnClose`)                       | adopt    | `clearOnClose`, padrão `true`; a consulta e a pilha de páginas voltam ao início no fecho.                                                                                                                                                                                         |
| Separador entre itens                                                  | cmdk, shadcn                                        | adopt    | `separator`, desenhado entre grupos pela família; o consumidor não o coloca.                                                                                                                                                                                                       |
| Composição sem camada                                                  | cmdk, shadcn, React Aria                            | adopt    | `presentation="inline"`: a raiz é desenhada onde foi escrita, sem `dialog`, para viver num `popover` ou numa página. É a resposta à recusa de `menu`.                                                                                                                             |
| Páginas empilhadas / subcomandos                                       | cmdk (exemplo), kbar (`parent`), Raycast, Linear    | adopt    | `children` no item abre uma página com os filhos; `pages` / `defaultPages` / `onPagesChange` controlável; a trilha no cabeçalho (`pages` › `page`); `Backspace` na consulta vazia e `Escape` voltam uma página antes de fechar.                                                   |
| Limite de itens mostrados                                              | Mantine (`limit`)                                   | adapt    | `limit`, padrão sem limite; com consulta vazia limita a lista ao número dado. Mantine usa-o em lugar de virtualização; aqui a lista rola e o limite é uma decisão de produto.                                                                                                       |
| Ações assíncronas                                                      | cmdk (`Loading`), Mantine (nada), escopo             | adopt    | `onSelect` que devolve uma `Promise` mantém a paleta aberta e o item com `data-loading` e `aria-busy` até resolver; rejeição mantém aberto e anuncia `errorLabel` na `status`. Nunca executa duas vezes o mesmo item pendente.                                                       |
| Fechar por toque                                                       | Mantine (`Modal` fecha no overlay), cmdk (Radix)    | decline  | Não há parte `close`: `dialog` já fecha ao pressionar o scrim (`outsidePress`) e por `Escape`, e um ✕ ao lado de um campo de busca é o `clear` mal lido. `outsidePress="none"` é passado por quem precisa do contrário.                                                             |
| Foco automático no primeiro item                                       | cmdk (sempre), React Aria (`disableAutoFocusFirst`) | adopt    | `autoHighlight`, padrão `true`: o primeiro item habilitado fica corrente ao abrir e a cada consulta. `false` deixa nada realçado, como o padrão APG permite.                                                                                                                       |

---

## 3. Diferenciadores

| Capacidade                                                              | Origem                                            | Decisão                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Histórico de recentes                                                   | VS Code, Raycast, Linear; nenhuma biblioteca      | adopt: `recent` / `defaultRecent` / `onRecentChange` (identificadores, os mais novos primeiro, cortados em `recentLimit`, padrão 5). Com consulta vazia e sem página, o grupo `recentLabel` abre a lista. Persistir é do produto, que recebe o array.                                    |
| Anúncio do número de resultados                                         | escopo; `combobox` já o faz                        | adopt: `status` é a região viva; `countLabel` (`{count} results`), `loadingLabel`, `emptyLabel`, `errorLabel`. `live-announcer` de `@slotted/core` evita o anúncio duplicado quando a mesma frase se repete.                                                                            |
| Ordenação com o colador do locale                                       | nenhuma; cmdk e kbar normalizam em inglês          | adopt: `createRanker` compara com `Intl.Collator` a sensibilidade `base`, como `createFilter`; `résumé` responde a `resume`. Prefixo do rótulo > início de palavra > substring > palavra-chave, empate pela ordem do consumidor.                                                       |
| Atalhos com legenda da plataforma                                       | nenhuma; todas imprimem a string do autor          | adopt: `kbd` resolve `mod+k` como `⌘K` ou `Ctrl+K`, reordena modificadores por plataforma e anuncia `Meta+K`. Uma paleta escreve o atalho uma vez.                                                                                                                                       |
| Três esquemas, três densidades, RTL                                     | a biblioteca                                       | adopt: as linhas leem a geometria de controle; `high-contrast` pela paleta do tema; a trilha, o `arrow` de página e as dicas espelham por propriedades lógicas e `rtl:` na máscara do chevron.                                                                                        |
| Dois bindings                                                           | a biblioteca                                       | adopt: React com `render` por parte e `CommandPaletteDefaultsProvider`; Angular com `model()`, `provideCommandPaletteDefaults()`, `ng-template` por item e `exportAs`.                                                                                                                 |
| Item que é destino                                                      | Linear; nenhuma biblioteca                         | adopt: `href` faz do item um `a` com `role="option"`; `Enter` segue o destino e `Mod+Enter` abre em nova aba pelo navegador — a família não intercepta o acorde.                                                                                                                       |
| O item pendente não executa duas vezes                                  | nenhuma                                            | adopt: enquanto a `Promise` está aberta, `Enter` e o ponteiro no mesmo item não fazem nada; outros itens continuam executáveis.                                                                                                                                                         |

---

## 4. Lacunas

| Caso                                                | Decisão                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Consulta que remove o item corrente                  | O realce vai ao primeiro item habilitado da nova lista com `autoHighlight`, e a nada sem ele; `onHighlightedIdChange` é emitido com `programmatic`.                                                                                                                                              |
| Consulta que chega antes da resposta assíncrona      | `loading` mantém `placeholder` e a lista anterior não é mostrada por baixo; a `status` diz `loadingLabel`. A família não debounces: o consumidor faz, em três linhas, como `combobox` regista.                                                                                                    |
| Rótulo longo, traduzido, sem espaços                 | `label` trunca com reticências numa linha e a descrição em duas; `title` no item leva o texto inteiro; o `shortcut` e o `meta` não encolhem.                                                                                                                                                      |
| Cem itens sem consulta                               | A lista rola dentro da altura máxima do painel (`--slotted-command-palette-list-max-block-size`); `limit` corta. Virtualização é adiada para `collection`, como `menu` e `select` registram.                                                                                                     |
| `Escape` com consulta escrita                        | O primeiro `Escape` limpa a consulta; o segundo fecha — a decisão de `select` com busca, registada em _Decisions already taken_. Com uma página aberta e consulta vazia, `Escape` volta uma página.                                                                                             |
| `Backspace` numa página com consulta vazia           | Volta uma página, com razão `keyboard`, como Raycast e cmdk.                                                                                                                                                                                                                                     |
| Item `disabled` corrente                             | Nunca fica corrente: `moveIndex` salta-o; o ponteiro sobre ele não o realça; `Enter` não o executa. Continua visível e anunciado com `aria-disabled`.                                                                                                                                             |
| Recente que já não existe                            | Um identificador em `recent` sem item correspondente é ignorado no desenho e mantido no array — o produto decide quando o purgar.                                                                                                                                                                |
| Nenhum item em nenhum grupo                          | Os grupos são omitidos quando ficam vazios; com todos vazios, `empty` toma a lista.                                                                                                                                                                                                              |
| Hotkey que colide com o navegador                    | `mod+k` é a convenção do produto (Linear, Slack, GitHub, Vercel); o Firefox usa-o para a barra de pesquisa e a família chama `preventDefault` ao capturar. O consumidor que prefira `/` escreve-o, e `/` não dispara em campo editável.                                                            |
| Abrir com o painel já aberto                          | O atalho com a paleta aberta foca o campo e seleciona a consulta em vez de fechar (Raycast, Spotlight); `toggle()` no handle fecha.                                                                                                                                                              |
| Toque                                                | As linhas crescem para `--slotted-target-comfortable` sob `pointer: coarse` pelo tema; o scrim fecha; a trilha responde ao toque.                                                                                                                                                              |
| Ação que falhou                                      | A paleta fica aberta, o item perde `data-loading`, a `status` anuncia `errorLabel` com a mensagem do erro quando é um `Error`; o item volta a ser executável.                                                                                                                                    |

---

## 5. O que fica fora, com o dono

| Capacidade                                  | Dono / composição                                                                                                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registo global de atalhos por item          | O consumidor, com `matchesShortcut(event, item.shortcut, { platform })` num `keydown` do documento — três linhas mostradas na página de referência. Um gestor global é assunto de uma família própria (`kbd` já o recusa). |
| Modos por prefixo (`>`, `#`, `/`)           | Composição: `onQueryChange` lê o primeiro caractere e troca `items`; a página de referência mostra-o.                                                                                                 |
| Virtualização                               | `collection`, quando a engine de virtualização chegar; `limit` e a rolagem cobrem até lá.                                                                                                             |
| Itens com estado (`checked`, `selected`)    | `menu` (`menuitemcheckbox`) e `listbox`; uma paleta executa, não escolhe.                                                                                                                              |
| Debounce da busca remota                    | O consumidor, como `combobox` regista.                                                                                                                                                                  |
| `vimBindings` (`Ctrl+N/P/J/K`)              | Recusado: `Ctrl+N` e `Ctrl+P` são do navegador e do sistema; o padrão APG não os lista. Um consumidor liga-os no `onKeyDown` do campo.                                                                 |
| `Alt+Seta` salta grupo                      | Recusado: nenhum padrão o lista e `PageUp`/`PageDown` cobrem o salto.                                                                                                                                 |
| Botão de fechar                             | `dialog` fecha por `Escape` e scrim; ver table stakes.                                                                                                                                                 |
