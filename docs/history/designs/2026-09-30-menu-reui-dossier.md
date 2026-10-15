# Dossiê ReUI — menu

## 0. Cabeçalho

- Família: `menu` (membro `menu`; `menubar` e `context-menu` compõem-no)
- Modo: `polish`; as linhas `contrato` da secção 8 movem a execução para `build` depois do gate
- Data: 2026-09-30
- HEAD: `e929273f` (ramo `review/implementation-pass-1`)
- Specimens: `tools/harness/out/specimen/<item>/` e `tools/harness/out/specimen/menu/`
- Fontes ReUI: `tools/harness/out/specimen/reui-src/c-dropdown-menu-<n>.json` (18) e `c-context-menu-<n>.json` (10). O ReUI não publica um primitivo `dropdown-menu`: `https://reui.io/r/dropdown-menu.json` responde `error`; os exemplos importam o `DropdownMenu` do shadcn sobre Base UI.

## 1. Seleção

Cobertura: `direta`. O primitivo é do shadcn e não tem fonte ReUI legível; os exemplos `c-dropdown-menu-*` e os blocos Pro desenham a família inteira.

Termos pesquisados em `llms-full.txt` (2188 linhas): `dropdown-menu` 19, `Dropdown Menu` 22, `context-menu` 10, `menubar` 6, `submenu` 1, `sub-menu` 0, `nested menu` 0.

| Item                 | Tipo         | Rota                                        | Parte ou interação Slotted que informa                                            | Capturas                                                                                        |
| -------------------- | ------------ | ------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `c-dropdown-menu-8`  | Free example | `/preview/base/example/c-dropdown-menu-8`   | `content`, `group-label`, `item`, `shortcut`, `indicator`, `separator`, submenu, tom | `light-1280` e `dark-1280` abertos; `-motion-reduce`; submenu aberto (`f9f9e6`); item em destaque (`58419e`) |
| `c-dropdown-menu-5`  | Free example | `/preview/base/example/c-dropdown-menu-5`   | submenus aninhados                                                                 | `light-1280` com submenu aberto                                                                 |
| `c-dropdown-menu-1`  | Free example | `/preview/base/example/c-dropdown-menu-1`   | item `disabled`                                                                     | `light-1280` aberto                                                                              |
| `c-dropdown-menu-14` | Free example | `/preview/base/example/c-dropdown-menu-14`  | cabeçalho de identidade, contagem à direita, valor atual no gatilho do submenu     | `light-1280` aberto                                                                              |
| `app-shell-7`        | Pro block    | `/preview/base/app-shell-7`                 | menus de troca de organização, app e ambiente em contexto de produto                | `light-1280`                                                                                     |
| `card-16`            | Pro block    | `/preview/base/card-16`                     | menu de reticências num cartão                                                     | `light-1280`                                                                                     |

Leitura de fonte sem captura: `c-dropdown-menu-9`, `-10`, `-11`, `-17` (cabeçalhos com avatar, feed de notificações) e `c-context-menu-10` (menu dentro de diálogo).

Slotted: `slotted-{light,dark,high-contrast}-720` com estados de `[data-scene='anatomy'] [data-part='item']` (`43e86d`, 4 elementos), `-motion-reduce`, `-forced` (2 estados), `-dense`, `-rtl`.

Limite da captura ReUI: `--states` falha nos itens ReUI (`element 0 left the page`), porque o `Tab` que o specimen envia antes do foco fecha o menu Base UI. O destaque ReUI é `data-highlighted`, escrito pelo ponteiro, e não `:hover`; o valor de destaque vem das capturas `--click` que deixam o ponteiro sobre o item (`58419e`, `f9f9e6`). A pressão ReUI não foi medida.

## 2. Anatomia

| `data-slot` ReUI                                    | Parte Slotted                                     | Estado                 |
| --------------------------------------------------- | ------------------------------------------------- | ---------------------- |
| `dropdown-menu-trigger`                             | gatilho do consumidor (sem `data-part`)            | igual                  |
| `dropdown-menu-content`                             | `content`                                          | igual                  |
| `dropdown-menu-group`                               | `group`                                            | igual                  |
| `dropdown-menu-label`                               | `group-label`                                      | igual                  |
| `dropdown-menu-item`                                | `item` (`menuitem`)                                | igual                  |
| `dropdown-menu-checkbox-item`                       | `item` (`menuitemcheckbox`)                        | igual                  |
| `dropdown-menu-radio-item`                          | `item` (`menuitemradio`)                           | igual                  |
| `dropdown-menu-checkbox-item-indicator`             | `indicator`                                        | igual; ReUI no fim da linha, Slotted na coluna 1 |
| `dropdown-menu-shortcut`                            | `shortcut`                                         | igual                  |
| `dropdown-menu-separator`                           | `separator`                                        | igual                  |
| `dropdown-menu-sub-trigger`                         | `item` com `aria-haspopup="menu"`                  | igual                  |
| `dropdown-menu-sub-content`                         | `content` de um `menu` aninhado                    | igual                  |
| `svg` solto dentro do item                          | `icon`                                             | igual                  |
| `div` livre no topo do `content` (avatar, nome, e-mail) | —                                              | em falta no Slotted    |
| `Badge` com `ml-auto` dentro do item                | —                                                  | em falta no Slotted    |
| —                                                   | `description`                                      | só no Slotted          |
| —                                                   | `empty`                                            | só no Slotted          |

## 3. Medidas

Largura da página: ReUI 1280, Slotted 720. Nenhuma propriedade abaixo depende da largura: o `content` ReUI tem `w-56` fixo e o Slotted mede `max-content` entre `12rem` e `16rem`.

| Parte         | Propriedade                          | ReUI                                     | Slotted hoje                                  | Alvo                                                              | Veredicto                                                                                                  |
| ------------- | ------------------------------------ | ---------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `content`     | rect                                 | 224 × 214                                | 251.28 × 270.28 (`anatomy`); 231.66 × 228.78 dense | altura inteira                                                  | `adaptar`: bloco fracionário vem de `group-label` 25.39 e `description` 17.39                               |
| `content`     | padding                              | 4                                        | 4                                             | `--slotted-space-2`                                               | `adotar`: iguais                                                                                           |
| `content`     | raio                                 | 10                                       | 8                                             | `--slotted-radius-lg`                                             | `recusar`: 10 não tem degrau                                                                               |
| `content`     | borda e sombra                       | anel 1px `oklab(0.145 0 0 / 0.1)`; 0 4 6 -1 e 0 2 4 -2 a 0.1 | borda 1px `--slotted-border-subtle`; 0 4 6 -1 e 0 2 4 -2 `rgba(15,23,42,0.08)` | `--slotted-shadow-md`                                           | `adotar`: mesma geometria                                                                                  |
| `item`        | altura                               | 28                                       | 34 (md), 26 (dense)                           | `--slotted-control-height-*`                                      | `recusar`: o item é um controlo; `size="sm"` dá a linha compacta                                           |
| `item`        | padding inline                       | 6                                        | 13                                            | `--slotted-control-padding-inline-md` − `--_inset-inline` (9)     | `adaptar`: com 13 a coluna 1 fica em x 55 e o texto do gatilho em x 51; com 9 as duas arestas coincidem     |
| `item`        | gap entre colunas                    | 6                                        | 8 (`margin-inline-end` da coluna 1)           | `--slotted-control-gap-md`                                        | `recusar`: gap de controlo da biblioteca                                                                   |
| `item`        | fonte                                | 14 / 400 / 20                            | 13 / 400 / 19.5                               | `--slotted-control-font-size-md`                                  | `recusar`: escala de controlo                                                                              |
| `item`        | raio                                 | 8                                        | 4                                             | `--slotted-control-radius`                                        | `superar`: 8 − 4 = 4 é concêntrico com o painel; o ReUI (10 − 4 ≠ 8) não é                                |
| `group-label` | altura                               | 24                                       | 25.39                                         | `line-height` arredondada ao píxel                                | `adaptar`: 12 × 1.45 = 17.4                                                                                 |
| `group-label` | fonte                                | 12 / 500, `oklch(0.556 0 0)`             | 12 / 600, `rgb(91,107,127)`                   | `--slotted-font-weight-semibold`                                  | `recusar`: peso de rótulo de grupo das famílias de lista                                                   |
| `description` | altura da linha                      | —                                        | 17.39                                         | `line-height` arredondada ao píxel                                | `adaptar`: mesma causa do `group-label`                                                                    |
| `shortcut`    | fonte e cor                          | 12, `oklch(0.556 0 0)`                   | 13, `--slotted-text-muted`                    | igual ao hoje                                                     | `recusar`: o atalho tem o corpo do rótulo e só a cor o recua                                               |
| `icon`        | tamanho                              | 16                                       | 16                                            | `--slotted-control-icon-size-md`                                  | `adotar`: iguais                                                                                           |
| `separator`   | largura e margem                     | 224 (a toda a largura), margem 4         | 241.28 (dentro do padding), margem 4          | igual ao hoje                                                     | `recusar`: a linha termina nas arestas do destaque                                                         |
| submenu       | posição do painel                    | sobrepõe o pai em 4 (x 798.5 contra 802.5); 1.º item 1px abaixo do gatilho | 4 para fora do pai; 1.º item alinhado (`menu.submenu.test.tsx`) | igual ao hoje                                                     | `superar`: o painel não cobre o pai e as linhas coincidem                                                  |
| submenu       | cena do harness                      | —                                        | painel filho em x 161 sobre o pai (37–229)    | `inset-inline-start` igual à largura do pai                        | `adaptar`: a cena fixa `132px` de uma medida anterior ao piso de `12rem`                                   |

## 4. Coreografia de estados

ΔL em OKLab contra o chão do `content`.

| Parte            | Estado        | Delta ReUI                                                             | Delta Slotted hoje                                                                                  | Alvo                                                         |
| ---------------- | ------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `item`           | hover         | `data-highlighted`: fundo `oklch(0.97 0 0)` (ΔL 0.030 claro), `oklch(0.269 0 0)` (ΔL 0.064 escuro); cor `oklch(0.205 0 0)` | `:hover` forçado vazio por desenho: o ponteiro move o foco e `:focus` pinta `rgb(241,245,249)` (ΔL 0.032), `rgb(34,34,37)` (ΔL 0.048), `rgb(230,230,230)` (ΔL 0.075) | igual ao hoje                                                |
| `item`           | active        | não medido                                                              | `rgb(226,232,240)` ΔL 0.071; escuro ΔL 0.068; alto contraste ΔL 0.155                                | igual ao hoje                                                |
| `item`           | focus-visible | só o fundo do destaque; `outline-hidden`                                | fundo do destaque e anel 2px `--slotted-focus-ring-color`, offset −2                                 | igual ao hoje                                                |
| `item`           | disabled      | `opacity: 0.5` (`c-dropdown-menu-1`)                                    | cor `--slotted-disabled-foreground` 4.76:1                                                          | igual ao hoje                                                |
| `item` disabled  | focus         | —                                                                       | fundo `--slotted-disabled-background`: ΔL 0.005 escuro (`rgb(24,24,27)` sobre `rgb(23,23,25)`), 0 em alto contraste | fundo `--_highlight` com texto `--slotted-disabled-foreground` |
| `item`           | checked       | indicador aparece sem transição                                         | `indicator` `opacity` 0 → 1 sem transição                                                           | `opacity` e `scale` em tokens de movimento                   |
| `item` submenu   | open          | `data-popup-open`: fundo do destaque                                    | `data-open`: fundo `--_highlight`                                                                    | igual ao hoje                                                |
| chevron submenu  | repouso       | cor do item                                                             | `opacity: 0.7`                                                                                      | `color: var(--_muted)`                                       |

## 5. Movimento

| Transição             | ReUI                                                         | Slotted hoje                                                                                           | Alvo                          |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ----------------------------- |
| entrada do painel     | `enter` 100ms `ease` (opacidade e escala por variáveis `--tw-enter-*`) | keyframe 200ms `--slotted-duration-medium` `--slotted-easing-enter`: `opacity` 0 → 1 e `translate` de 4 no eixo do lado | igual ao hoje                 |
| saída do painel       | não capturada (painel fechado não fica no DOM)               | transição 120ms `--slotted-duration-short` `--slotted-easing-exit`: `opacity` e `translate`            | igual ao hoje                 |
| destaque do item      | sem transição (`transition-duration: 0s`)                   | `background-color`, `color` 120ms `--slotted-easing-standard`; setas e typeahead não animam            | igual ao hoje                 |
| indicador marcado     | sem transição                                                | sem transição                                                                                          | entrada `--slotted-duration-short` `--slotted-easing-enter`; saída `--slotted-easing-exit` |
| movimento reduzido    | `enter` continua a 0.1s                                      | durações a 0.001s; o painel mantém o fade e perde o `translate`                                        | igual ao hoje                 |

## 6. Capacidades

A pergunta da invocação: menus dentro de menus, personalização e versatilidade.

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| --- | --- | --- | --- | --- | --- | --- |
| Submenus aninhados | `c-dropdown-menu-5`, `-8`, `-12`, `-14`; `c-context-menu-4`, `-10` | `Sub`, `SubTrigger`, `SubContent` e `Portal`: três componentes próprios | `Menu` dentro de `MenuContent`, profundidade livre; `submenuOpenDelay` 150, `submenuCloseDelay` 300, área de graça por `pointer-intent`, camada filha registada na pilha | composição: o submenu é a mesma família e herda todas as capacidades (tom, grupos, `loading`, `empty`, rádio); setas lógicas em RTL | `adotar` (existe) | — |
| Profundidade ≥ 3 provada | `c-dropdown-menu-5` | dois níveis | três níveis só na cena `submenu` do harness; `menu.submenu.test.tsx` cobre dois | coincidem | `adaptar`: teste de três níveis (Escape fecha só o topo, ArrowLeft volta ao pai) | — |
| Checkbox e rádio | `-6`, `-7`, `-8` | `CheckboxItem`, `RadioGroup`, `RadioItem` | `MenuCheckboxItem`, `MenuRadioGroup`, `MenuRadioItem`, pares controlado e não controlado com razão | `Space` muda o estado sem fechar; pedido de mudança com `reason` | `adotar` (existe) | — |
| Atalhos | `-4`, `-8`, `-9` | texto livre em `Shortcut` | `shortcut="Mod+K"` resolvido por `@slotted/core/keys`, anunciado por `aria-keyshortcuts` | glifos da plataforma e anúncio ao leitor | `adotar` (existe) | — |
| Ação destrutiva | `-8`, `c-context-menu-8` | `variant="destructive"` | `tone` com cinco tons | quatro tons além de `danger` em três esquemas | `adotar` (existe) | — |
| Manter aberto ao escolher | `-14`, `app-shell-31` | `onSelect={(e) => e.preventDefault()}` | `closeOnSelect` por menu e por item, `MenuSelectEvent.preventDefault()` | a regra fica declarada no item, sem manipular o evento | `adotar` (existe) | — |
| Cabeçalho de identidade | `-9`, `-14`, `-15`, `app-shell-*` | `div` livre com avatar, nome e e-mail no topo do `content` | um filho sem `data-part` cai na coluna 1 da grelha (16px) | parte `header` nomeada, a toda a largura da grelha, fora do anel de foco, com vocabulário de `command-palette` | `adaptar` | — |
| Conteúdo à direita do item | `-14` (contagem), `-18` | `Badge` com `ml-auto` dentro do item | só `shortcut` e o chevron ocupam a coluna 3 | parte `meta` na coluna 3, vocabulário de `listbox`, `tree` e `command-palette`; excluída do typeahead | `adaptar` | — |
| Valor atual no gatilho do submenu | `-14` (estado com ponto de cor) | filhos livres do `SubTrigger` | `MenuTrigger` com `icon` e filhos livres; com `meta`, o valor fica na coluna 3 antes do chevron | coincidem depois de `meta` | `adaptar` (via `meta`) | — |
| Controlos dentro do menu | `-14` (`Tabs` de tema), `-11` (botão "Mark all as read") | componentes arbitrários dentro do `content` | não suportado | — | `recusar`: `role="menu"` só possui `menuitem*`, `group` e `separator`; um `tablist` dentro do anel quebra o roving. O tema compõe-se com `MenuRadioGroup` e `closeOnSelect={false}` | `popover` para um painel de controlos |
| Feed de notificações | `-11`, `-17` | itens com avatar e duas linhas | `description` dá a segunda linha; o avatar não cabe na coluna de 16 | — | `adiar para notification-center` | `notification-center` |
| Menu dentro de diálogo | `c-context-menu-10` | `Portal` do Base UI | camada na pilha única com `--slotted-layer-depth`; `MenuDefaultsProvider container` | coincidem | `adotar` (existe) | — |
| Estados `loading` e `empty` | — | ausentes | `MenuContent loading`, `MenuEmpty` | só no Slotted | `adotar` (existe) | — |
| Personalização | todos | classes Tailwind por instância | 15 tokens `--slotted-menu-*`, `size`, `tone`, `render` em gatilho, `content` e item, `MenuDefaultsProvider` / `provideMenuDefaults()` com 22 chaves | tokens com escopo e defaults por aplicação | `adotar` (existe) | — |

Achado de contrato sem contrapartida ReUI: `submenu.openDelay` declara 100 e `members.menu.defaults.submenuOpenDelay` declara 150; os bindings e `menu.submenu.test.tsx` usam 150.

## 7. Superar

| Critério | ReUI | Slotted hoje | Alvo | Fonte |
| --- | --- | --- | --- | --- |
| Pixel grid | passa: `content` 214, itens 28, rótulo 24 | falha: `content` 270.28 (`anatomy`), 228.78 (dense) | `content` inteiro em todas as cenas | `c-dropdown-menu-8-light-1280-click-…-31518a.json`; `slotted-light-720-data-scene-anatomy-…-43e86d.json`, `slotted-light-720-dense.json` |
| Hover | passa: ΔL 0.030 claro, 0.064 escuro | passa pelo foco: ΔL 0.032, 0.048, 0.075; falha no item disabled: ΔL 0.005 escuro, 0 alto contraste | ΔL ≥ 0.02 no item disabled nos três esquemas | `…-58419e.json`; `slotted-{light,dark,high-contrast}-720-…-43e86d.json` |
| Press | não medido | passa: ΔL 0.071 contra 0.032 | igual | `slotted-*-43e86d.json` |
| Focus | falha: sem anel, só fundo ΔL 0.030 | passa: 2px, 4.72:1, 6.24:1, 16.83:1 contra o destaque | igual | `slotted-*-43e86d.json` |
| Transition | falha: destaque sem transição | passa: `background-color`, `color` listados | igual | idem |
| Motion | falha: entrada e saída com `ease`; indicador sem transição | falha: indicador `opacity` sem transição | indicador com entrada e saída em tokens | `menu.css` § indicador |
| Reduced motion | falha: `enter` 0.1s | passa: 0.001s | igual | `…-motion-reduce-….json`; `slotted-light-720-motion-reduce.json` |
| Disabled | falha: `opacity: 0.5` | passa: 4.76:1 sem opacidade | igual | `c-dropdown-menu-1-…json`; `slotted-light-720-…-43e86d.json` |
| Schemes | sem alto contraste nem cores forçadas | passa: `Highlight`/`HighlightText` no foco em cores forçadas | igual | `slotted-light-720-forced-…-43e86d.json` |
| Density and RTL | — | passa: dense 26 e 12px; RTL com `icon` em x 729 e `shortcut` em x 529.69 | igual | `slotted-light-720-dense.json`, `slotted-light-720-rtl.json` |
| Target size | passa: 28 | passa: 34 md, 26 dense ≥ 24 | igual | idem |
| Intent | — | falha: `opacity: 0.7` no chevron sem razão escrita | `color: var(--_muted)` | `menu.css` § chevron |

## 8. Delta

| # | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| --- | --- | --- | --- | --- |
| 1 | `packages/styles/src/menu/menu.harness.html` | cena `submenu`: `inset-inline-start` do painel filho igual à margem mais a largura do pai (`calc(12px + 12rem)`) | 3 submenu, cena do harness | `shoot.mjs menu --scene submenu` a 420 e 720 |
| 2 | `packages/styles/src/menu/menu.css` | `--_item-inset: calc(var(--slotted-control-padding-inline-md) - var(--_inset-inline))`, por tamanho | 3 `item` padding inline | specimen: coluna 1 em x 51 igual ao texto do gatilho |
| 3 | `packages/styles/src/menu/menu.css` | `group-label` e `description`: `line-height: round(up, calc(1em * var(--slotted-line-height-sm)), 1px)` | 3 `content` rect, `group-label`, `description`; 7 Pixel grid | `content` com altura inteira em `anatomy` e dense |
| 4 | `packages/styles/src/menu/menu.css` | item disabled em foco: fundo `--_highlight`, texto `--slotted-disabled-foreground` | 4 disabled focus; 7 Hover | ΔL ≥ 0.02 nos três esquemas |
| 5 | `packages/styles/src/menu/menu.css` | `indicator`: transição de `opacity` e `scale` (0.95 → 1), entrada `--slotted-easing-enter`, saída `--slotted-easing-exit`, `--slotted-duration-short` | 4 checked; 5 indicador; 7 Motion | specimen: `transition-property` do `indicator` |
| 6 | `packages/styles/src/menu/menu.css` | chevron do submenu: `color: var(--_muted)` no lugar de `opacity: 0.7` | 4 chevron; 7 Intent | specimen: cor do `icon` do item com `aria-haspopup` |
| 7 | `packages/react/src/menu/menu.submenu.test.tsx`, `packages/angular/menu/src/menu.spec.ts` | teste de três níveis: abrir por teclado, `Escape` fecha só o topo, `ArrowLeft` devolve o foco ao item pai | 6 profundidade ≥ 3 | testes |
| 8 | `specs/components/menu/contract.json` | `contrato`: `submenu.openDelay` 100 → 150 | 6 achado de contrato | `node --test specs/components/menu/*.test.mjs` |
| 9 | `specs/components/menu/contract.json`, `menu.css`, `menu.harness.html`, ambos os bindings, páginas de referência | `contrato`: parte `meta` na coluna 3, fora do texto do typeahead; `MenuItem meta` / `<span slMenuItemMeta>` | 2 `Badge` com `ml-auto`; 6 conteúdo à direita, valor atual | cena nova `meta` no harness; testes de typeahead |
| 10 | `specs/components/menu/contract.json`, `menu.css`, `menu.harness.html`, ambos os bindings, páginas de referência | `contrato`: parte `header` a toda a largura da grelha, sem papel de item, fora do anel de foco; `MenuHeader` / `[slMenuHeader]` | 2 `div` livre no topo; 6 cabeçalho de identidade | cena nova `header` no harness; teste de roving que salta o cabeçalho |
