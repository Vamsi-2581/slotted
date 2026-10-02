# Desenho — `navigation-menu`

Inventário: `2026-10-01-navigation-menu-capability-inventory.md`. Dossiê:
`2026-10-01-navigation-menu-reui-dossier.md`. Padrão: Disclosure Navigation
Menu (<https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/>),
lido em 1 de outubro de 2026.

## 1. Responsabilidade

Uma linha (ou coluna) de secções de um site ou de uma aplicação, cada uma um
botão que mostra um painel de destinos, e links diretos ao lado delas. O painel
é Disclosure, nunca `menu`: os destinos são links, e o APG avisa que `menu` e
`menubar` pedem um teclado que a navegação não precisa.

Fronteiras:

- `top-navigation` é a barra de aplicação com prioridades de colapso; a sua
  `nav` é uma raiz desta família e cada item uma secção (reabertura de
  2026-10-01, `2026-09-15-top-navigation-design.md` §11). Uma secção portada
  para fora da lista — o painel «more» da barra — abre em linha onde está:
  a superfície não a alcança, o hover não a abre, e foco ou pressão dentro do
  seu painel não fecham o menu.
- `menu` continua a ser a lista de comandos.
- `side-navigation` é a coluna de uma aplicação; `navigation-menu` vertical é
  a coluna de secções com painéis ao lado, de um site.

## 2. Anatomia

| Parte           | Elemento         | Para quê                                                                                                                         |
| --------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `root`          | `nav`; `div` aninhada | Landmark `navigation` com `aria-label` de `messages.navigation` quando o consumidor não dá um. `position: relative`: o viewport e os painéis posicionam-se nela. |
| `list`          | `ul`             | As secções e os links do topo.                                                                                                   |
| `item`          | `li`             | Uma secção (gatilho + painel) ou um link direto. `data-value`, `data-open`.                                                     |
| `trigger`       | `button`         | `aria-expanded`, `aria-controls` → `content`. `data-open`; `data-current` quando o painel contém o link corrente.               |
| `indicator`     | `span`           | Glyph `chevron-down` no fim do gatilho; meia volta aberto. Vertical: `chevron-right`, `directional`.                            |
| `link`          | `a`              | Destino, no topo ou no painel. `aria-current="page"` e `data-current` quando corrente; `aria-disabled` quando desativado.        |
| `content`       | `div`            | O painel de uma secção, depois do gatilho no mesmo `li`. `hidden` fechado; `data-open`, `data-motion`. Contentor de consulta.   |
| `links`         | `ul`             | Grelha de links do painel, `data-columns` 1–3 lido do `content`.                                                                 |
| `group`         | `div`            | Uma coluna com título: `role="group"` e `aria-labelledby` → `group-label`.                                                       |
| `group-label`   | `div`            | Título de grupo, tipo pequeno e tinta apagada.                                                                                   |
| `icon`          | `span`           | Marca de um link rico, alinhada ao texto do `label`.                                                                             |
| `label`         | `span`           | Título de um link rico.                                                                                                          |
| `description`   | `span`           | Descrição de um link rico, até duas linhas no olho, inteira no DOM.                                                              |
| `footer`        | `div`            | Rodapé do painel com régua superior; o conteúdo é do consumidor.                                                                |
| `viewport`      | `div`            | A superfície partilhada: chão, borda, sombra, raio. Tamanho e posição medidos pelo script.                                       |
| `arrow`         | `span`           | Marca da aresta do viewport que aponta o gatilho aberto e desliza entre gatilhos. Opcional (`arrow` verdadeiro).                 |

### O painel fica no `li`; só a superfície é partilhada

Radix e Base UI portam o conteúdo para o viewport e reconstroem a ordem de Tab
com elementos sentinela. Aqui o `content` fica depois do seu gatilho, como no
exemplo do APG, e é posicionado em absoluto sobre a caixa do viewport, com chão
transparente. O viewport é um elemento vazio depois de `list` que pinta a
superfície e transita tamanho e posição; o painel de saída e o de entrada
cruzam-se por cima dele. Ganho: Tab entra no painel sem sentinelas e o React
não porta nada. Custo: uma raiz recortada (`overflow: hidden`) corta o painel,
como em `top-navigation`.

### Medidas que só o script tem

O script escreve na raiz, com os nomes que dizem o que são (regra do briefing):

| Propriedade                                         | Valor                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `--slotted-navigation-menu-viewport-inline-size`    | largura da caixa de borda do `content` aberto                                                     |
| `--slotted-navigation-menu-viewport-block-size`     | altura da caixa de borda do `content` aberto                                                      |
| `--slotted-navigation-menu-viewport-inline-start`   | distância do início em linha da raiz ao início do viewport: o início do gatilho, deslocado até caber |
| `--slotted-navigation-menu-viewport-block-start`    | vertical: distância do topo da raiz ao topo do gatilho                                             |
| `--slotted-navigation-menu-arrow-offset`            | centro do gatilho medido do início do viewport                                                     |
| `--slotted-navigation-menu-available-inline-size`   | espaço do início do viewport ao fim da janela, menos o gutter                                     |

Sem script, a folha não desenha viewport (`[data-positioned]` ausente) e o
`content` aberto pinta a superfície ele próprio, para que um render no servidor
ou um snippet estático mostrem o painel inteiro.

## 3. Estado

```json
"stateModel": {
  "open": { "controlled": "value", "uncontrolled": "defaultValue", "request": "onValueChange",
            "reasons": ["pointer", "keyboard", "escape", "outsidePress", "blur", "select", "programmatic"] }
}
```

- `value` é o `data-value` do item aberto, ou `null`.
- `pointer`: clique ou hover com rato/caneta; `keyboard`: `Enter`/`Space` no
  gatilho; `escape` e `outsidePress` de `dismissable-layer`; `blur`: o foco sai
  da raiz; `select`: um link do painel ativado com `closeOnSelect`.
- Hover: `openDelay` (200 ms) antes de abrir; com uma secção aberta, outro
  gatilho troca sem atraso; o ponteiro a sair da raiz fecha depois de
  `closeDelay` (300 ms), cancelado se voltar. `pointerType === 'touch'` não
  abre por hover. Os atrasos são comportamento, não movimento, e não vêm da
  escala de duração.
- Precedência: `disabled` > `current` > `open` (chão de hover) > `active` > `hover` > `focus-visible`.

## 4. Teclado

| Tecla                      | APG                                                 | Família                                                                                   | Veredito |
| -------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| `Tab` / `Shift+Tab`        | entre botões do topo e pelos links do painel aberto | plataforma; o painel segue o gatilho no DOM                                              | passa    |
| `Enter` / `Space` no gatilho | alterna o painel                                  | plataforma (`button`); pede `value` com `keyboard`                                        | passa    |
| `Enter` num link           | ativa                                               | plataforma; com `closeOnSelect` pede `null` com `select`                                  | passa    |
| `Space` num link           | ativa (o exemplo faz script)                        | a plataforma vence, como em `top-navigation` e `side-navigation`                          | departure |
| `Escape`                   | fecha e foca o botão                                | `dismissable-layer`; foco ao gatilho                                                      | passa    |
| `↓`/`→` (horizontal: `→`) num gatilho fechado | próximo botão                    | próximo gatilho ou link do topo                                                           | passa    |
| `↓` num gatilho aberto (horizontal), `→` (vertical) | primeiro link do painel    | primeiro focável do `content`                                                             | passa    |
| `↑`/`←` num gatilho        | botão anterior                                      | anterior gatilho ou link do topo                                                          | passa    |
| `↓`/`↑` num link do painel | próximo / anterior link                             | próximo / anterior focável do `content`; `↑` no primeiro volta ao gatilho                 | passa    |
| `Home` / `End`             | primeiro / último botão ou link                     | no topo: primeiro/último do topo; no painel: primeiro/último do painel                    | passa    |

As setas não usam tabindex rotativo: cada controlo do topo continua uma paragem
de Tab, e as setas são o atalho opcional do APG. Movimento por setas não anima.

## 5. Geometria e tokens

| Valor                      | Lê                                                     | Recurso                    |
| -------------------------- | ------------------------------------------------------ | -------------------------- |
| gatilho e link do topo     | `--slotted-control-{height,padding-inline,font-size,icon-size,gap}-{sm,md,lg}` | por `size` |
| raio do gatilho            | `--slotted-navigation-menu-radius`                     | `--slotted-control-radius` |
| superfície                 | `--slotted-navigation-menu-surface`                    | `--slotted-surface-raised` |
| borda                      | `--slotted-navigation-menu-border-color`               | `--slotted-border-subtle`  |
| sombra                     | `--slotted-navigation-menu-shadow`                     | `--slotted-shadow-md`      |
| raio do viewport           | `--slotted-navigation-menu-viewport-radius`            | `--slotted-radius-lg`      |
| distância à barra          | `--slotted-navigation-menu-offset`                     | `--slotted-space-2`        |
| largura de coluna          | `--slotted-navigation-menu-column-size`                | `15rem`                    |
| inset do painel            | `--slotted-space-2`                                    | —                          |
| link rico                  | bloco `--slotted-space-4`, linha `--slotted-space-4` (padding do controlo − borda − inset) | — |
| hover / press              | `--slotted-tone-secondary-subtle-{hover,active}`       | —                          |
| corrente                   | `--slotted-tone-accent-{surface,text}` + `--slotted-current-edge` | par de `top-navigation` |

O `offset` é o intervalo entre a raiz e o viewport. Uma ponte transparente
(`::before` do viewport) cobre-o, para que o ponteiro que desce do gatilho
nunca saia da área que mantém o painel aberto. A ponte não pinta.

## 6. Movimento

| Transição                         | Propriedades                         | Duração / curva                                  |
| --------------------------------- | ------------------------------------ | ------------------------------------------------ |
| viewport entra                    | `opacity`, `translate` (0 −space-2)  | keyframe, `medium`, `enter` (R7)                 |
| viewport sai                      | `opacity`, `translate`               | `short`, `exit`                                  |
| viewport muda de secção           | `inline-size`, `block-size`, `inset-inline-start` | `medium`, `standard`                 |
| `content` entra de lado           | `opacity`, `translate` (±space-6 em linha) | keyframe, `medium`, `enter`                 |
| `content` sai de lado             | `opacity`, `translate`               | keyframe, `short`, `exit`                        |
| `arrow` segue o gatilho           | `inset-inline-start`                 | `medium`, `standard`                             |
| `indicator`                       | `rotate`                             | `medium`, `standard`                             |
| hover do gatilho e do link        | `background-color`, `color`          | `short`, `standard`                              |
| press                             | idem                                 | `instant`                                        |

Movimento reduzido: as durações colapsam pela escala; a deslocação dos
keyframes é retirada e fica o fade, como em `menu`.

## 7. Integração — React

| Pergunta                              | Resposta                                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| par controlado/não + pedido com razão | `value`/`defaultValue`/`onValueChange(value, request)`                                                       |
| omissões uma vez                      | `NavigationMenuDefaultsProvider`, `useNavigationMenuDefaults`: `size`, `openDelay`, `closeDelay`, `closeOnSelect`, `arrow`, `messages` |
| substituir o elemento                 | `render` em `root`, `item`, `link`, `content`, `links`, `group`, `footer`; fixos: `trigger` (a família liga-o), `indicator`, `viewport`, `arrow` |
| handler do consumidor corre           | `onClick`, `onKeyDown`, `onPointerEnter`, `onPointerLeave`, `onFocus`, `onBlur` compostos; `defaultPrevented` cancela a parte da família |
| ref e imperativo                      | `ref` em cada parte; `NavigationMenuHandle` com `open(value)`, `close()`, `focus(value?)`                    |
| SSR                                   | `useId` para `aria-controls`; geometria só depois de montar; sem script o painel pinta-se a si mesmo         |
| estados no DOM                        | `data-open`, `data-current`, `data-disabled`, `data-motion`, `data-orientation`, `data-size`, `data-columns`, `data-positioned` |
| props = nativo estendido              | `ComponentPropsWithRef<'nav' \| 'ul' \| 'li' \| 'button' \| 'a' \| 'div' \| 'span'>` por parte               |

## 8. Integração — Angular

| Pergunta                    | Resposta                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| valor de duas vias          | `value = model<string \| null>(null)`; `valueChangeRequest` com `ChangeRequest`                          |
| Reactive Forms              | não: navegação não é controlo de formulário                                                             |
| omissões uma vez            | `NAVIGATION_MENU_DEFAULTS`, `provideNavigationMenuDefaults()`                                           |
| `exportAs`                  | `slNavigationMenu`, `slNavigationMenuItem`, `slNavigationMenuTrigger`                                    |
| conteúdo projetado          | diretivas sobre os elementos do consumidor; `slNavigationMenu` é componente com `<ng-content />` e o viewport no template |
| zoneless e `OnPush`         | signals; `computed` para o item aberto e para o corrente                                                |
| tear-down                   | `DestroyRef.onDestroy` desliga `ResizeObserver`, timers de hover, `presence`, `dismissable-layer`        |
| atributo estático sobrevive | `aria-label` em `root` e `aria-current` em `link` lidos com `HostAttributeToken`                        |
| entry point único           | `@slotted/angular/navigation-menu`                                                                       |

Assimetria registada: Angular não expõe `defaultValue`; um `model()` é os dois lados.

## 9. Decisões e custos

- **Painel no `li`, superfície partilhada.** Custo: raiz recortada corta o painel.
- **Conteúdo sempre no DOM (`hidden`).** Custo: um painel pesado monta com a
  página; quem o quer preguiçoso renderiza os filhos só quando `value` o pede.
  Ganho: Tab, motores de busca e o render estático.
- **Gatilho e link do topo na escala de controlo** (34 px a `md`), não os 36 px
  do ReUI: uma barra e um campo ao lado têm a mesma altura.
- **`closeOnSelect` verdadeiro por omissão** (Ark), contra o falso de Base UI.
- **Aninhamento pela própria família**, não por uma parte `sub`.
- **Sem backdrop, sem cartão de destaque** (inventário).
