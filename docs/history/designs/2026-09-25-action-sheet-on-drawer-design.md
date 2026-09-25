# `action-sheet` sobre `drawer`

Data: 2026-09-25. Reabertura prometida em `docs/process/build-order.md`, secção
_Reaberturas prometidas por escrito_, linha `action-sheet`. Substitui a decisão §4.1 de
`2026-09-24-action-sheet-design.md`; o inventário, o padrão, o teclado, o foco e o estado
desse documento continuam a valer.

## 1. O que mudou em `drawer`

Os três factos de §4.1 que impediam a composição caíram com
`2026-09-25-drawer-bottom-sheet-design.md`:

1. A folha de baixo mede o conteúdo (`size="content"`, a omissão de `bottom`).
2. A folha tem largura máxima, centrada (`--slotted-drawer-sheet-inline-size`).
3. `body`, `close` e `resizer` são partes opcionais: uma folha sem elas não as desenha.

## 2. Anatomia

```
div  data-ui="drawer" data-part="root" data-side="bottom" data-size="content"   (drawer)
  div  data-part="backdrop"                                                    (drawer)
  div  data-part="panel" role="dialog" tabindex="-1"                           (drawer)
    div  data-ui="action-sheet" data-part="root"
      header  data-part="header"   h2 title · p message
      div     data-part="list"     role="menu"
      div     data-part="footer"   button cancel
```

A raiz da família fica dentro do painel de `drawer` e ocupa as quatro linhas da grelha do
painel (`grid-row: 1 / -1`): a linha flexível do painel é a que encolhe quando a folha
chega ao limite, e a raiz encolhe com ela. As partes da família são filhas da raiz, e as
regras de `drawer` são filhas do painel, por isso nenhuma das duas folhas alcança as partes
da outra, e `identity.test.mjs` fica satisfeito.

`backdrop` e `panel` saem da lista de partes da família: são de `drawer`. O título e a
mensagem são `DrawerTitle` e `DrawerDescription` com o elemento da família, para o painel
os nomear por `aria-labelledby` e `aria-describedby`.

## 3. O que `drawer` passa a dar à família

| Capacidade                                  | Antes                                      | Agora                                                        |
| ------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| Camada, portal, presença, pilha, scroll     | reescritos, cerca de setenta linhas de CSS | `drawer`                                                     |
| Escape, toque fora, voltar                  | `dismissable-layer` chamado pela família   | `drawer`, com as mesmas três políticas                       |
| Arrastar para fechar                        | recusado, `deferTo: drawer`                | adotado: um toque no corpo move a folha, a razão é `pointer` |
| Teclado virtual, área segura lateral        | só a área segura                           | `drawer`                                                     |
| Medida própria (32 rem)                     | largura escrita pela família               | token de `drawer` escrito no painel pelo binding             |
| Scrim ausente sem `modal`                   | `visibility: hidden` no scrim              | `scrimFrom` acima de qualquer extensão: `data-undimmed`      |
| Foco inicial na ação menos destrutiva       | `createFocusScope` da família              | `initialFocus` de `drawer`, com uma função                   |

## 4. Decisões

- **A medida continua a da família, 32 rem, e atravessa para o painel de `drawer` pelo
  token público dele.** O binding escreve
  `--slotted-drawer-sheet-inline-size: var(--slotted-action-sheet-inline-size, 32rem)` no
  painel: em React pelo `style` de `DrawerPanel`, que já passa ao elemento; em Angular pelo
  `panel` que a instância de `SlDrawer` passa a expor, como o handle de React já expunha.
  Uma folha de ações mais estreita que uma folha de filtros é a proporção de UIKit, cujas
  action sheets não atravessam a largura de um iPad.
- **O raio, a superfície e o scrim são os de `drawer`.** Os tokens
  `--slotted-action-sheet-radius`, `--slotted-action-sheet-surface` e
  `--slotted-action-sheet-scrim` saem pela mesma razão.
- **Sem pega.** Uma action sheet fecha pelo `cancel`, por Escape, pelo toque fora, por
  voltar e pelo arraste do corpo; uma pega seria um sexto caminho para o mesmo fecho, e
  UIKit não a desenha.
- **Sem eixo `drag`.** Uma folha que não pode fechar por arraste cancela o pedido com a
  razão `pointer`, o mesmo mecanismo que já recusa os outros fechos.
- **`initialFocus` de `drawer` aceita uma função** nos dois bindings: React já aceitava um
  `RefObject`, e um objeto com `current` calculado serve; Angular aceitava um elemento, e
  passa a aceitar `() => HTMLElement | null`, porque o elemento só existe depois de abrir.

## 5. Custo de uma resposta errada no gate visual

- 32 rem contra os 40 rem de `drawer`: uma linha em cada binding e o token da família.
- A raiz dentro do painel contra partes de `drawer` reutilizadas: a folha da família e os
  dois bindings.
