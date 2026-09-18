# Desenho — `app-shell`, segunda passagem

Decisões tomadas depois do gate de release da primeira passagem ter sido
recusado. O que este documento não altera continua a valer como está em
`docs/history/designs/2026-09-13-app-shell-design.md`; o inventário revisto
está na secção 7 de `2026-09-13-app-shell-capability-inventory.md`.

O leitor é a família que herda as decisões.

---

## 1. O que o revisor viu

Sete factos, cada um com a prova no código ou na captura
`tools/harness/out/app-shell-pages/react-playground.png`:

| Achado                                                         | Prova                                                                                                                       |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Fila de navegação a 16 px, altura de controlo                  | `.slotted-demo-nav-item` declara `--slotted-control-font-size-md`; medido no Storybook, `font-size: 16px` — a declaração não chega |
| Linha da conta com duas linhas dentro da altura de uma          | `.slotted-demo-nav-account { padding-block: 0 }`; medido, `font-family: Arial` — `font: inherit` também não chega          |
| Barra vazia entre a marca e as ações                            | `Banner()` põe no `brand` só o `AppShellNavToggle`; `wordmark` é `false` por omissão                                       |
| Procura é um botão com rótulo                                   | `Banner()` → `<Button aria-label="Procurar" variant="outline">`                                                            |
| Painel lateral sem cabeçalho, sem fecho, sem estado             | `Detail()` → `Container` + `Stack` + `DescriptionList`; o contrato recusa `asideOpen` e difere para `drawer`                |
| Uma identidade visual em catorze cenas                          | todas as cenas partem de `Shell()`; `Themed()` repinta a mesma aplicação                                                   |
| Casca colada ao limite tracejado da cena                        | `.slotted-demo-viewport[data-layout='shell']` sem moldura própria                                                          |

Os dois primeiros têm a mesma causa, e ela é do workbench:
`.slotted-workbench-preview :is([data-ui], [data-ui] *)` reverte `font-size`,
`font-family`, `color`, `font-weight` e `line-height` para a camada
`slotted.components` em **todo** o descendente de um elemento da biblioteca. Uma
fila de demonstração dentro de `[data-ui="app-shell"]` é um descendente, a sua
classe não está em camada nenhuma, e a declaração perde para a reversão por
especificidade — `(0,2,1)` contra `(0,1,0)`. O reset dirige-se a elementos da
biblioteca; uma fila de demonstração não é um. A correção está em §6.

---

## 2. Anatomia — o que entra

| Parte          | Elemento | Onde                                   | Para quê                                                                 |
| -------------- | -------- | -------------------------------------- | ------------------------------------------------------------------------ |
| `centre`       | `div`    | dentro de `banner`, entre `brand` e `actions` | a zona que cresce: procura, trilho, título da rota, separadores. Sem ela a barra é dois aglomerados e um vazio |
| `aside-header` | `div`    | dentro de `aside`, fixo no topo        | o título da região e o controlo que a fecha                              |
| `aside-body`   | `div`    | dentro de `aside`; é o que rola        | o conteúdo                                                               |
| `aside-footer` | `div`    | dentro de `aside`, fixo no fundo       | as ações que fecham a tarefa do painel                                   |
| `aside-toggle` | `button` | em qualquer sítio, como `nav-toggle`   | o controlo Disclosure do painel; toma `aria-controls`, `aria-expanded` e o manipulador do contexto |

`aside-header`, `aside-body` e `aside-footer` são a disciplina que `nav` já tem:
extremos fixos e meio que rola. Sem eles, um painel com mais conteúdo do que
altura leva as ações para fora do ecrã, que é o defeito que `nav-body` corrige
na coluna.

`centre` recebe `flex: 1 1 auto` e `min-inline-size: 0`; `actions` deixa de
precisar de `margin-inline-start: auto`, mas mantém-no para a barra sem
`centre`.

O que **não** entra: item de navegação, grupo, linha de conta, campo de procura.
Continuam do consumidor — `side-navigation` e `top-navigation` na onda 8 — e as
demonstrações montam-nos com `list-item`, `text-field`, `avatar` e `menu`, sobre
a geometria que a casca publica em §5.

---

## 3. Estado — o painel abre e fecha

A primeira passagem recusou `asideOpen` com «duas famílias com um `open` cada,
não uma com dois», e diferiu para `drawer` com `mode="inline"`. A decisão
inverte-se, e o custo escreve-se:

- A coluna `aside` tem largura fixa por eixo (`asideSize`). Um `drawer` fechado
  lá dentro deixa a coluna vazia com a largura toda. O consumidor que quer o
  painel a aparecer na seleção de uma linha e a desaparecer na desseleção não
  tem como o fazer sem redimensionar a coluna à mão.
- Um painel de detalhe a 1280 px é uma coluna; a 600 px é uma camada sobre o
  conteúdo. É o mesmo par `inline`/`overlay` que a navegação já tem, resolvido
  na mesma largura, com a mesma composição de `presence`, `dismissable-layer` e
  `focus`. Reescrevê-lo em `drawer` era a segunda implementação de um
  comportamento que `docs/component-features.md` §15 proíbe.

O argumento «uma família, um `open`» era sobre o **esquema**: `stateModel` é
indexado por capacidade, e `open` é uma capacidade. Uma família com duas
regiões que abrem tinha de escolher uma. O esquema muda em vez do contrato: uma
entrada de `stateModel` passa a poder ser um **conjunto nomeado** de modelos da
mesma capacidade, detetado pela ausência de `controlled` na própria entrada.
`apiMetadataErrors` no workbench percorre o conjunto. A alteração está no seu
próprio commit, com teste, antes desta família — como o briefing exige de toda
a ferramenta partilhada.

```json
"stateModel": {
  "open": {
    "nav":   { "controlled": "navOpen",   "uncontrolled": "defaultNavOpen",   "request": "onNavOpenChange",   "reasons": [...] },
    "aside": { "controlled": "asideOpen", "uncontrolled": "defaultAsideOpen", "request": "onAsideOpenChange", "reasons": [...] }
  }
}
```

Eixos novos: `asideMode` com `inline`, `overlay`, `auto` (omissão `auto`, sobre
o mesmo `overlayAt`). Não há `asideCollapsedTo`: um painel fechado não deixa
calha, fecha para fora do layout, e a razão é a mesma de `collapsedTo="hidden"`
— uma região a zero pixels que ainda dispõe os filhos põe conteúdo fora da caixa
que o contém.

Atributo de estado: `data-open` **na própria região** `aside`. O `data-open` da
raiz continua a ser o da navegação, porque mudá-lo era quebrar todo o seletor
já escrito sobre ele; `[data-part='aside'][data-open]` é o seletor do painel, e
a página de referência diz as duas coisas.

Razões: `pointer`, `keyboard`, `escape`, `outsidePress`, `resize`,
`programmatic`. Sem `select`: um painel de detalhe não tem destinos.

`modal`, `escape` e `outsidePress` aplicam-se à camada que estiver aberta. Com
as duas abertas em modo sobreposto — só possível com `navMode` e `asideMode`
ambos forçados — `dismissable-layer` empilha e `Escape` fecha a de cima.

Omissão de `defaultAsideOpen`: `true`. Um consumidor que projeta um `aside`
quer vê-lo; o que o fecha na desseleção passa `asideOpen`.

Skip link: `skipToAside` só quando a região está aberta em modo em linha, ou
aberta em modo sobreposto — uma ligação para uma região fechada é um destino
morto, a mesma regra de «uma âncora por região que existe».

Handle: `openAside()` e `closeAside()` ao lado de `openNav()` e `closeNav()`.

---

## 4. Onde fica o controlo de ocultar

A família nunca fixou a posição — `nav-toggle` toma a ligação do contexto — e a
demonstração fixou-a na barra em todos os arranjos. A regra que as
demonstrações passam a seguir, e que a página de referência diz por escrito:

| Arranjo                | Onde o controlo fica                                                          |
| ---------------------- | ----------------------------------------------------------------------------- |
| `primary="banner"`     | início da barra, antes da marca: controla uma coluna que começa abaixo dele  |
| `primary="nav"`        | fim do `nav-header`: alinhado com a coluna que move, sobre a própria coluna  |
| `collapsedTo="rail"`   | `nav-footer`, acima da conta: sobrevive à largura da calha pela consulta de contentor que já existe |
| `navMode="overlay"`    | início da barra: a única coisa visível quando a região está fechada          |

`aside-toggle` segue a mesma lógica: no `aside-header` enquanto o painel está
aberto; nas `actions` da barra quando o painel está fechado e o produto quer
um sítio fixo para o reabrir.

---

## 5. Geometria publicada

A casca já publica `--slotted-app-shell-row-inset`, `-row-mark` e `-row-gap`.
Faltavam os dois valores que decidem o tipo de uma fila e a única superfície que
distingue a coluna do plano:

| Token                                    | Compõe                                   | Porquê                                                                                  |
| ---------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `--slotted-app-shell-row-height`         | `--_row-mark`                            | a fila e a caixa da marca têm a mesma altura, ou a marca fica descentrada na fila       |
| `--slotted-app-shell-row-font-size`      | `--slotted-font-size-sm`                 | uma lista de destinos é texto, não controlo; `control-font-size` é para o que se prime |
| `--slotted-app-shell-row-line-height`    | `--slotted-line-height-sm`               | `normal` varia por fonte; a fila com duas linhas precisa do valor da escala             |
| `--slotted-app-shell-nav-surface` (omissão em `inset`) | `--slotted-surface-sunken`  | mantém-se transparente: no plano rebaixado a coluna **é** a moldura, e é assim que Linear e Notion desenham. O que faltava era a fila, não a superfície |

A última linha é uma decisão de não mudar: o revisor leu «a coluna não se
distingue», e a captura mostra que se distingue pelo plano — o cartão do
conteúdo tem aresta e elevação, a coluna não. O que a fazia parecer plana era o
tipo a 16 px sem entrelinha. Corrigido o tipo, a superfície fica.

---

## 6. Workbench — três correções, cada uma no seu commit

1. **O reset não se dirige a filas de demonstração.**
   `.slotted-workbench-preview :is([data-ui], [data-ui] *)` ganha
   `:not([class*='slotted-demo-'])`. O reset existe para que um elemento da
   biblioteca pinte o que declara; uma fila de demonstração não é um elemento
   da biblioteca e as suas declarações não são o ruído que o reset apaga. Teste
   em `workbench.styles.test.mjs`: a regra exclui a classe de demonstração.

2. **Filas de navegação e de conta lidas da geometria publicada.**
   `.slotted-demo-nav-item` toma `--slotted-app-shell-row-height`,
   `-row-font-size` e `-row-line-height`; a linha da conta ganha
   `padding-block: var(--slotted-space-2)` e `min-block-size` de duas linhas.
   Primitivas novas: `.slotted-demo-bar-search` (um `text-field` com `kbd`),
   `.slotted-demo-bar-crumbs` (um `breadcrumb` no `centre`),
   `.slotted-demo-aside-*` para o cabeçalho, o corpo e o rodapé do painel.

3. **Moldura de janela na cena.** `.slotted-demo-viewport[data-layout='shell']`
   ganha aresta, raio e sombra do workbench, e `overflow: hidden` para o raio
   cortar a casca. A cena à volta mantém a sarjeta que já tinha. Uma casca a
   tocar o limite tracejado lê-se como diagrama; dentro de uma janela lê-se como
   aplicação.

---

## 7. Três produtos

`app-shell-demo.tsx` (638 linhas) divide-se em `app-shell-demo/` com um módulo
por produto e um de partes comuns. Cada produto é uma aplicação inteira, com o
seu arranjo, a sua pintura e a sua densidade; cada cena de eixo escolhe o
produto que melhor mostra o eixo.

| Produto             | Domínio                     | Arranjo                                                  | Pintura                                    | O que prova                                                              |
| ------------------- | --------------------------- | -------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| **Aurora Logística** | operações de transporte     | `primary="banner"`, `canvas="inset"`, `aside` de detalhe | clara, neutra; acento azul                 | back office: tabela, painel que abre na seleção, procura com `⌘K`        |
| **Cadence**         | gestão de produto           | `primary="nav"`, `canvas="flush"`, sem `aside`           | coluna `data-slotted-scheme="dark"`, acento violeta | ferramenta: trilho no `centre`, calha por omissão, `nav-toggle` no `nav-footer` |
| **Átrio**           | atendimento clínico         | `navMode="overlay"`, `navSide="end"`, `aside` como formulário | clara, generosa, `density="comfortable"` | sobreposição a qualquer largura, rótulos longos, RTL, painel como camada |

Os três partilham a geometria publicada e nada mais. `Themed()` desaparece:
Cadence é a cena `theming`.

---

## 8. Integração — React

| Pergunta                                       | Onde                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Par controlado/não controlado com razão        | `navOpen`/`defaultNavOpen`/`onNavOpenChange` e `asideOpen`/`defaultAsideOpen`/`onAsideOpenChange`, ambos em `app-shell.tsx` sobre `createControllable` |
| Omissões uma vez                               | `AppShellDefaultsProvider` ganha `asideMode`                                                      |
| Substituir o elemento de cada parte            | `render` em todas as partes, incluindo as cinco novas                                             |
| O manipulador do consumidor corre              | `onClick` do `aside-toggle` corre antes e pode `preventDefault`                                   |
| Elemento nativo e ação imperativa              | `ref` em cada parte; `AppShellHandle` ganha `openAside`/`closeAside`                              |
| Servidor sem divergência                       | `useId`; `data-aside-mode` ausente até a medida, como `data-nav-mode`                             |
| Estado no DOM                                  | `data-open` na raiz (navegação) e em `[data-part='aside']` (painel)                              |
| Tipos do elemento nativo                       | `Native<'div'>`, `Native<'button'>` para as partes novas                                          |

## 9. Integração — Angular

| Pergunta                                       | Onde                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Valor bidirecional em signal                   | `asideOpen = model<boolean>(true)`; `asideOpenChangeRequest = output<AppShellOpenRequest>()`       |
| Reactive Forms                                 | não: nenhuma região é um valor de formulário                                                      |
| Omissões uma vez                               | `provideAppShellDefaults({ asideMode })`                                                          |
| Instância no template                          | `exportAs` em todas as diretivas novas                                                            |
| Conteúdo projetado                             | `<ng-content>` único na casca; as partes são diretivas no elemento do consumidor                  |
| Zoneless e OnPush                              | signals; a segunda camada é um segundo `effect` com o mesmo `queueMicrotask`                      |
| Ouvintes desmontados                           | `DestroyRef.onDestroy` para a segunda camada e o segundo scope                                    |
| Atributo estático sobrevive                    | `HostAttributeToken` para `id`, `aria-label` e `aria-controls` de `aside-toggle`                  |
| Ponto de entrada único                         | `@slotted/angular/app-shell`                                                                      |

---

## 10. Quebras de contrato, e como um consumidor se move

| O que muda                                  | Como se move                                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `declined.asideOpen` deixa de existir       | um `drawer mode="inline"` dentro de `aside` continua a funcionar; a casca só acrescenta o estado da região |
| `aside` passa a `display: none` fechado     | um consumidor que nunca passa `asideOpen` vê o painel como antes, porque a omissão é aberto   |
| `data-open` em `[data-part='aside']`        | seletores sobre `[data-ui='app-shell'][data-open]` continuam a ler a navegação                 |
| `stateModel.open` passa a conjunto           | ferramenta partilhada atualizada no mesmo conjunto de commits; nenhuma outra família muda      |

---

## 11. Custos escritos

- **Dois `dismissable-layer` numa casca.** Cada um regista o seu `Escape` em
  captura; a pilha em `@slotted/core` decide qual responde. O caso das duas
  abertas em sobreposição só existe com os dois modos forçados.
- **`aside-toggle` em `actions` com o painel em modo sobreposto e `modal`.** A
  barra fica `inert` como o resto; o controlo é registado como ramo, como o da
  navegação. O reader fecha pelo `aside-header`, por `Escape` ou pelo véu.
- **O esquema aceita duas formas para `stateModel[capacidade]`.** Uma entrada
  com `controlled` é um modelo; sem ele é um conjunto. O teste do esquema cobre
  as duas e recusa um conjunto vazio.
- **Três produtos são três vezes o conteúdo de demonstração.** Os módulos são
  independentes e nenhum importa outro; uma cena importa um.
