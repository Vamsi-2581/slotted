# Ordem de construção

Sequência de invocações de `/component`, da camada mais primitiva para fora.
Algumas famílias são novas; outras substituem uma construída antes desta
fundação. A coluna de modo diz qual é qual.

Deriva de `docs/component-features.md` (guia de features) e do estado atual de
`specs/components/`.

## Como ler

- **Onda** é uma barreira. Nenhum item de uma onda começa antes de todos os
  itens da onda anterior estarem aprovados no gate humano.
- Dentro de uma onda, itens ligados por `→` têm dependência e seguem a ordem
  escrita. Itens em linhas separadas são independentes entre si.
- Cada linha é uma invocação. Um par na mesma linha é uma invocação única,
  justificada por uma decisão de arquitetura compartilhada.
- **Modo:** `refazer` reescreve contrato, stylesheet e bindings da família
  existente. `consolidar` funde famílias em uma, retirando as entradas antigas
  de `specs/components/` no mesmo commit. `novo` cria a família.

## Onda 0 — Contrato e fundação visual — concluída

Nenhuma invocação de `/component`. A fundação é pré-requisito de toda família
refeita, e está entregue.

### Camadas de token

`packages/tokens/src/contract.json` passou a uma lista única de 173 tokens, cada
um declarando camada e eixo: 56 primitivos, 91 semânticos, 26 de componente.
`packages/tokens/src/validate-theme.mjs` recusa um tema em que um token alcança
uma camada mais profunda, e recusa um token que não é raiz de escala e reafirma
um literal sem registrar a razão. Quatorze literais carregam a sua razão no
contrato.

### Superfícies, esquemas e densidades

- Tokens semânticos novos: `--slotted-surface`, `-raised`, `-sunken`,
  `-inverse`, `--slotted-text-inverse`, `--slotted-border-strong` e
  `--slotted-scrim`.
- Esquema `high-contrast`, cobrado em 7:1 para texto e 3:1 para borda e anel de
  foco por `packages/themes/default/test/contrast.test.mjs`.
- Densidade `dense`.
- Bloco `@media (forced-colors: active)` emitido pelo tema, mapeando cada um dos
  64 tokens de esquema para uma cor de sistema. O contrato exige o mapeamento;
  um token de esquema sem ele não passa na validação.

### Alvo de toque

`--slotted-target-min` (24px, WCAG 2.2) e `--slotted-target-comfortable` (44px).
A validação recusa uma densidade cuja altura de controle fique abaixo do mínimo,
e o tema emite `@media (pointer: coarse)` elevando a altura de cada densidade a
`max(<valor>, var(--slotted-target-comfortable))`.

### Estado, evento e identidade

`specs/contract.schema.mjs` na versão 5:

- `data-ui` obrigatório, com valor igual ao nome da família;
- `stateModel` obrigatório para toda capacidade mutável, com par
  controlado/não controlado, nome da solicitação e razões do vocabulário
  fechado `CHANGE_REASONS`;
- `STATE_PRECEDENCE` declarando a ordem entre estados simultâneos;
- estados `open`, `expanded` e `drop-target` acrescentados ao vocabulário.

`packages/core/src/state/` implementa os dois modos, a solicitação com razão,
evento de origem opaco e cancelamento antes do commit. A lei está em
`docs/state-and-events.md`.

### Ratchet da reconstrução

`specs/legacy-families.json` lista as 29 famílias ainda na versão 4 do schema.
`specs/legacy-ledger.test.mjs` recusa uma família fora da lista que não
satisfaça a versão 5, recusa uma família listada que já satisfaça, e recusa o
crescimento da lista. Sair da lista é o que define "refeita".

Três testes de lei passam a valer para toda família fora da lista:

| Teste                                   | Recusa                                                            |
| --------------------------------------- | ----------------------------------------------------------------- |
| `packages/styles/src/motion.test.mjs`   | duração literal; animação infinita que não para em reduced motion |
| `packages/styles/src/states.test.mjs`   | regra de `:hover` ou `:active` sem guarda contra `disabled`       |
| `packages/styles/src/identity.test.mjs` | seletor por classe; ausência de `data-ui`                         |

### Harness

`tools/harness/shoot.mjs` passou a argumentos nomeados e aos eixos esquema
(incluindo `high-contrast`), largura, densidade e direção. O nome do PNG declara
os quatro. O palco é pintado com `var(--slotted-surface)`, então a captura
mostra a superfície real do tema.

### Skill

`.claude/skills/component/SKILL.md` carrega `docs/state-and-events.md` e
`docs/component-features.md` no passo 1, exige `ui` e `stateModel` no passo 6,
captura seis combinações no passo 8, e cobra a seção 18 do guia no passo 12.

## Onda 1 — Primitivos sem estado

Definem escala tipográfica, ritmo de espaço e superfície. Todo o resto lê estas
decisões, e é onde a inconsistência atual se origina.

| Invocação           | Modo    | Guia |
| ------------------- | ------- | ---- |
| `typography`        | novo    | 10   |
| `icon`              | novo    | 10   |
| `visually-hidden`   | refazer | 3    |
| `divider`           | refazer | 4    |
| `stack inline grid` | novo    | 4    |
| `container`         | novo    | 4    |
| `card`              | refazer | 4    |

`typography` e `icon` primeiro, nesta ordem; os cinco restantes são
independentes entre si.

`typography` entrega **Text** e **Heading**. **Prose** — o recipe editorial da
seção 10 — ficou adiado: o ritmo que ele fixa é definido sobre `list` e
`list-item` (onda 4), `link` (onda 2), `table` (onda 6) e `code-block` (onda 8).
Escrito antes disso, seria uma segunda escala privada para elementos que a
reconstrução ainda não alcançou. Foi entregue no fim da onda 4, com lista e link
já existentes; tabela e código entram como refino posterior.

### Escopo por família — onda 1

O que cada invocação entrega. A pesagem do passo 3 continua sendo do
implementador: adotar, adaptar ou recusar, com uma frase de razão cada.

- **`typography`** — entregue. Text e Heading.
- **`icon`** — entregue. A família é a caixa em que um glifo é desenhado, não o
  glifo: o registry não existe em nenhuma das três formas, e a arte continua do
  consumidor. `size` lê a escala de ícone de controle em `sm`/`md`/`lg` e segue o
  tipo em `text`; `tone` reusa os oito valores de Typography; `directional`
  espelha por `:dir(rtl)` só o que aponta para algum lado. Nome presente decide
  `role="img"`, ausência decide `aria-hidden`, e não há chave `decorative`.
  Stroke/fill recusado: a família não é dona da geometria. As seis máscaras
  `--slotted-icon-*` permanecem como estão, e a fronteira entre elas e a família
  está em `docs/superpowers/specs/2026-09-01-icon-family-design.md`.
- **`visually-hidden`** — reconstrução. Conteúdo oculto visualmente permanece
  acessível sem alterar layout; a variante revelável no foco continua sendo uma
  regra só, não uma regra mais o seu desfazer.
- **`divider`** — entregue. `hr` como elemento, `decorative` removendo da
  árvore, orientação vertical com comprimento mínimo. A variante rotulada
  ("OU" no meio) e o separador dentro de `ul` (Menu, onda 5) precisam de decisão
  agora, não depois.
- **`stack inline grid`** — entregue. Três famílias, uma invocação: `gap` como
  passo da escala de espaço, `align` atravessando o fluxo e `justify` correndo
  ao longo dele, `wrap` só em Inline, `columns`/`minItemWidth` só em Grid. Sem
  DSL de CSS, sem eixo que reordene filhos e sem breakpoint. A medida ficou com
  `container` sozinho.
- **`container`** — entregue. Um membro e duas partes: `root` e `breakout`.
  Três eixos: `size` (`measure`/`content`/`wide`/`full`), `inset` (passo da
  escala de espaço, padrão `6`) e `align` (`center`/`start`/`end`). É o dono da
  medida confortável, e a medida é contada em caracteres — `65ch` — porque um
  máximo em pixels fica _mais longo_ em caracteres quando o leitor amplia o
  texto. Os passos são nomeados pelo que limitam, e não `sm`/`md`/`lg`: o
  máximo de um container é escolhido pelo que está dentro dele, e uma letra
  esconde a escolha. O padrão é `content`, contra as quatro implementações
  pesquisadas que escolhem o passo limitado mais largo, porque a falha estreita
  é a visível.

  A raiz é sempre um grid de três trilhas — sarjeta inicial, coluna limitada,
  sarjeta final — e não uma caixa com máximo, porque `breakout` precisa de
  trilha para atravessar. O inset é piso das sarjetas e nunca padding da caixa,
  que insetaria também o breakout. Sem breakpoint e sem `container-type`: a
  família responde à própria largura por `min()` e `minmax()`, continuamente.
  `gap` continua do Stack, padding vertical de página fica com `page` (onda 4),
  e o breakout responde ao container e não à viewport, então continua correto
  aninhado, dentro de uma região com scroll e num container que não preenche a
  página. Padrões da aplicação em uma decisão só: `ContainerDefaultsProvider`
  no React e `provideContainerDefaults` no Angular. A decisão completa está em
  `docs/superpowers/specs/2026-09-01-container-family-design.md`.

- **`card`** — entregue. Um membro e sete partes: `root`, `media`, `header`,
  `actions`, `body`, `footer` e `link`. Superfície vem de
  `--slotted-surface-raised`. Eixos: `orientation`, `fill`
  (`outline`/`elevated`/`subtle`) e `size` (`sm`/`md`/`lg`) — o eixo de
  aparência reverte a decisão "sem eixos" do Card antigo, porque quatro das seis
  implementações pesquisadas o entregam e uma página usa mais de um ao mesmo
  tempo. `fill` e não `variant`: `variant` é a palavra desta biblioteca para
  tom, que um card não carrega. O canto do header (`actions`) é a segunda coluna
  do grid e fica preso à primeira linha. Linha divisória entre regiões é
  composição com `Divider`, não um eixo. O card inteiro clicável é o alcance
  esticado de um `<a href>` marcado `data-part="link"`, e nunca um comando.
  `selected` e `disabled` espelham o controle interno e não são capacidades.
  Padrões da aplicação em uma decisão só: `CardDefaultsProvider` no React e
  `provideCardDefaults` no Angular.

  Segunda passagem, sobre estados e aparência. Oitava parte: `selection`, a
  coluna que um card de escolha reserva para o seu controle — a vaga, não o
  glifo, porque `checkbox radio-group` da onda 3 é dono de onde o check e o dot
  são desenhados. Estado `active` acrescentado. A borda passou para um
  `::before` sobre a caixa de borda, então a aresta de 2px do selecionado não
  move conteúdo. `selected` é pintado por `--slotted-surface-inverse` e por
  nenhum preenchimento: o acento já é a cor do anel de foco, e um tom de
  superfície calibrado em badge inunda na área de um card. Cada `fill` responde
  hover e press na propriedade de que é feito, e os três preenchem no press.
  `elevated` descansa em `--slotted-shadow-md`. O intervalo entre regiões caiu
  um passo abaixo do inset do card, que antes igualava.

## Onda 2 — Ação, status e metadados

| Invocação             | Modo           | Guia |
| --------------------- | -------------- | ---- |
| `button icon-button`  | refazer        | 5    |
| `button-group`        | novo           | 5    |
| `link`                | refazer        | 5    |
| `badge`               | refazer        | 10   |
| `tag`                 | refazer        | 10   |
| `avatar avatar-group` | refazer + novo | 10   |
| `kbd`                 | refazer        | 5    |
| `skeleton`            | refazer        | 9    |
| `progress-indicator`  | consolidar     | 9    |
| `status-indicator`    | novo           | 9    |
| `alert`               | refazer        | 9    |
| `inline-message`      | novo           | 9    |

- `button icon-button` abre a onda: fixa altura de controle, padding, densidade
  e estado `loading` que todos os controles seguem. `button-group` depois dele.
- `progress-indicator` absorve `spinner`, `progress-bar` e `loading-bar` como
  recipes de uma família só (guia 17), e resolve a duplicação já registrada em
  `docs/BUILD-LOG.md` entre o anel do Button e `spinner.css`. Remove três
  entradas de `specs/components/`. Os tokens
  `--slotted-button-loading-indicator-*` já saíram do contrato na reconstrução
  de `button`: o anel lê `--slotted-duration-loop-fast`,
  `--slotted-border-width-thick` e o tamanho de ícone do próprio passo, e passa
  a ler `progress-indicator` quando a família existir.
- `badge` e `tag` compartilham tokens e permanecem famílias distintas.

### Escopo por família — onda 2

- **`button icon-button`** — entregue, e refeito uma segunda vez depois do gate
  humano. Uma família, quatro membros: Button, ButtonLink, IconButton e
  ToggleButton, todos com `data-ui="button"`. IconButton é membro e não família,
  porque é a mesma superfície, a mesma máquina de estado e a mesma escala de
  geometria — o que muda é o conteúdo e a forma que segue dele, e `shape` é o
  eixo que a nomeia. `tone` passa a nomear as cinco cores e `variant` passa a
  nomear a pintura; `fill` desaparece. `pressed` fica com ToggleButton e
  IconButton, com modelo controlado/não controlado completo, e nunca com Button,
  que é ação momentânea. A família deixou de declarar token de componente: lê
  `--slotted-control-*` diretamente, e a camada de componente do contrato ficou
  vazia. `buttonGroup` saiu daqui e volta na invocação seguinte.

  A segunda passagem: `soft` sai do eixo de pintura, que fica em `solid`,
  `outline` e `ghost`; a borda de `outline` passa a ser neutra e o tom fica no
  rótulo; a borda de `solid` passa a ser o próprio preenchimento, exceto nos
  dois tons cujo preenchimento não se distingue da superfície (`secondary` em
  todos os esquemas, `warning` em dois), que desenham a borda do próprio tom.
  Nenhum estado altera geometria: o peso extra de `pressed` é um anel em
  `::after`, e o `padding-block` saiu porque inflava o controle acima da altura
  que a densidade declara. Quatro capacidades entram: `render` (só no React —
  no Angular cada membro é diretiva no elemento do consumidor),
  `ButtonDefaultsProvider`/`provideButtonDefaults`, `focusableWhenDisabled`, e
  um `loading` refeito — o anel ocupa a caixa do primeiro ícone e o rótulo
  permanece legível, a espera é anunciada por um `progressbar` nomeado em vez de
  `aria-busy`, `loadingDelay` separa a recusa da imagem, e `toggleButton` também
  espera.

- **`button-group`** — espaçamento, orientação e overflow de ações
  relacionadas, sem alterar a semântica de cada botão. Ação destrutiva não
  encosta em ação frequente sem separação. O overflow para menu depende de
  `menu` (onda 5) e volta como refino. A entrada antiga foi removida junto com
  a reconstrução de `button`: o seu stylesheet vivia no diretório da família e
  não sobreviveria às leis que passaram a valer ali. O modo continua `novo`.
- **`link`** — entregue. Um membro e três partes: `root`, `external-icon` e
  `external-hint`. Dois eixos: `underline` (`always`/`hover`/`none`, padrão
  `always`) e `variant` (`accent`/`neutral`/`inverse`). `neutral` é o link com a
  cor do texto ao redor, que sete implementações entregam sob três nomes
  diferentes; `inverse` é o link sobre superfície sólida. Sem eixo de tamanho —
  `typography` é dona da escala de tipo — e sem eixo de tom: tom marca a
  consequência de uma ação, e navegação não tem nenhuma.

  `external` é açúcar para outro contexto de navegação, e os três avisos que uma
  nova aba deve — `rel` seguro, marcador visível, texto anunciado — seguem o
  `target` resolvido, então quem escreve `target="_blank"` à mão recebe o mesmo
  aviso. O marcador é máscara de `--slotted-icon-external`, glifo novo na escala,
  precedido por juntador de palavras (U+2060) para nunca quebrar sozinho na
  linha. `disabled` repete a semântica de ButtonLink: sem `href`, com
  `role="link"`, `aria-disabled` e lugar na sequência de tabulação. O link
  corrente é pintado por `aria-current`, o atributo que `routerLinkActive` já
  escreve — sem `data-current` espelhado e sem prop inventada. `visited` é
  opcional e mistura a cor do link em direção ao texto discreto.

  O hover deixou de ler o degrau de preenchimento: `--slotted-tone-accent-solid-hover`
  no esquema escuro é azul escuro sobre fundo escuro, e passar o mouse piorava a
  leitura. Agora a cor caminha por `color-mix` em direção a `--slotted-text`, e o
  sublinhado vai de 55% a `currentColor` — o único sinal que sobra para
  `inverse`. Padrões da aplicação em uma decisão só: `LinkDefaultsProvider` no
  React e `provideLinkDefaults` no Angular.

- **`badge`** — entregue. Contagem, status ou metadado curto não editável. Um
  membro e três partes: `root`, `icon` e `anchor`. O campo publica duas coisas
  sob o mesmo nome — a ficha de metadado no fluxo (Spectrum, Primer, Atlassian,
  Radix, shadcn) e a contagem ancorada no canto de outro elemento (Ant, MUI,
  Angular Material, HeroUI) — e as duas são uma família só, porque são a mesma
  caixa com o mesmo tom, a mesma aresta e a mesma escala de tipo. `anchor` é a
  única parte da biblioteca que contém a raiz da própria família em vez de ficar
  dentro dela, e por isso carrega `data-ui`.

  Eixos: `tone` (as cinco cores), `variant` (`solid`/`soft`/`outline`), `size`
  (`sm`/`md`/`lg`), `shape` (`pill`/`square`/`dot`), `live`
  (`off`/`polite`/`assertive`), e `placement`/`overlap` no `anchor`. O contrato
  antigo tinha `variant` nomeando cor e `fill` nomeando pintura; os dois trocam
  de lugar para acompanhar `button`, e `subtle` vira `soft`. O padrão de
  `variant` passa de `solid` a `soft`: uma página de pílulas cinza sólidas se lê
  como uma página de controles.

  Preenchido não tem aro: a aresta de `solid` é o próprio preenchimento, então a
  ficha é uma forma só. `soft` e `outline` desenham a borda do tom — `soft`
  precisa dela porque no esquema `high-contrast` toda superfície de tom vira o
  branco da própria página, e lá ela converge com `outline`. `secondary` é a
  única exceção às duas regras, porque é o único tom cujo preenchimento é a cor
  da própria página: passa a preencher com o passo `solid-hover` e mantém a
  borda do tom.

  Cinco partes: `root`, `start`, `label`, `end` e `anchor` — a anatomia que
  `button` já usa. O texto tem caixa própria porque `text-box` precisa de um
  contêiner de bloco, e o texto de um contêiner flex vive num item anônimo que
  nenhum seletor alcança. Sem isso, uma palavra sem descendente ficava 2,19px
  acima do centro numa caixa de 24px; com `text-box: trim-both cap alphabetic`
  a folga é 7,59px acima e 7,59px abaixo em todo tamanho. Sob `@supports`.

  Uma linha só: string longa é recortada com reticências, não reflui. Uma
  insígnia que virasse parágrafo deixou de ser insígnia — o comprimento é erro
  do conteúdo, e `tag` responde essa pergunta por si. O recorte é visual:
  `text-overflow` não encurta nada, então a string inteira permanece no DOM, na
  árvore de acessibilidade e encontrável por busca na página. O rótulo carrega
  `padding-block` com margem negativa equivalente, porque uma caixa aparada no
  cap e na linha de base deixa descendentes de fora e `overflow: hidden` os
  decapitava.

  `count`, `max` e `showZero` são uma decisão só, tomada em
  `@slotted/core/count` — novo entry point — para que os dois bindings não
  divirjam; o número é formatado por `Intl.NumberFormat` no `locale` da
  aplicação, o que nenhuma das onze implementações pesquisadas faz. Contagem
  zero não deixa uma pílula vazia: remove a insígnia inteira.

  `dot` é o disco com a largura do tipo ao lado do qual está, aro em
  `--slotted-border-strong` — o único token de borda que o tema segura em 3:1 —
  porque é a única insígnia cujo significado inteiro é um gráfico. As palavras
  que uma cor não diz são composição com `visually-hidden`, não uma parte nova.

  A família não anima. O único candidato — a contagem que aparece no canto de um
  botão — dispara também na primeira pintura, porque `@starting-style` não
  distingue montagem de mudança; volta com `presence` (guia, seção 3).

  Padrões da aplicação em uma decisão só: `BadgeDefaultsProvider` no React e
  `provideBadgeDefaults` no Angular, ambos carregando `locale`.

- **`tag`** — entregue. Entidade, filtro ou valor compacto. A regra do guia —
  nunca dois comportamentos implícitos ao mesmo tempo — virou estrutura: quatro
  membros (`tag`, `tagButton`, `tagLink`, `tagToggle`), e o que a ficha _é_ é o
  elemento que carrega o corpo. Nenhuma prop acrescenta um segundo
  comportamento.

  Uma anatomia só, para todos os casos: `root` (span) › `body`
  (span | button | a) + `remove` (button), com `indicator`, `start`, `label` e
  `end` dentro do corpo. **A raiz nunca é o elemento interativo**, porque um
  `button` não contém um `button` e um `a` não contém nenhum dos dois — uma
  ficha que age e remove precisa dos dois controles lado a lado. Primer resolve
  isso com um desvio (`hasMultipleActionTargets`), Fluent com dois componentes
  irmãos, React Aria e Angular Material com um grid; decidir uma vez elimina o
  desvio. O custo é um elemento a mais numa ficha estática.

  Eixos: `tone` (as cinco cores), `variant` (`solid`/`soft`/`outline`), `size`
  (`sm`/`md`/`lg`), `shape` (`pill`/`square`) e `orientation` no grupo. `soft`
  é o padrão pela razão que `badge` registrou. A altura é a caixa de linha da
  própria ficha, com piso em `--slotted-target-min`: o controle de remoção é um
  quadrado da altura da ficha, e é isso que o faz alcançar o mínimo da WCAG 2.2
  2.5.8 em todo tamanho e toda densidade — o caso que `docs/token-foundation.md`
  nomeia como impossível de o tema corrigir pela família.

  `group` é parte, não membro — a segunda da biblioteca a conter a raiz da
  própria família, depois de `anchor` em `badge`. Implementa o padrão APG
  Toolbar: um tab stop, setas entre todos os controles em ordem de DOM,
  `Home`/`End` nas pontas, e o foco restaurado para o controle que tomou o
  lugar do removido — depois para o último, depois para o próprio grupo, que é
  por isso que ele carrega `tabindex="-1"`. Escrever `role="list"` desliga o
  teclado e dá `role="listitem"` a cada ficha.

  A remoção é pedido, nunca valor: a ficha não é dona da própria existência.
  `reason` separa o X (`remove`) de `Backspace`/`Delete` (`keyboard`), e o
  pedido pode ser recusado — a recusa é o que impede o grupo de mover o foco.
  O nome do controle de remoção é composto por `aria-labelledby` sobre a
  palavra escondida e o rótulo da própria ficha, então anuncia "Remove Design"
  sem o consumidor repetir o valor.

  Padrões da aplicação em uma decisão só: `TagDefaultsProvider` no React e
  `provideTagDefaults` no Angular, ambos carregando `removeLabel`.

- **`avatar avatar-group`** — entregue. Par: `avatar` refeito e `avatar-group`
  criado como família própria, pela razão de `button-group` — outro elemento,
  outro conjunto de decisões, e um membro que ela não precisa ser.

  A família anterior era a caixa com um atributo só: uma capacidade (`size`,
  três passos), nenhum nome, nenhuma inicial, nenhuma cor, nenhuma forma,
  nenhum grupo, e um booleano `data-loaded` onde cabem quatro estados. Agora são
  seis capacidades: `appearance`, `size`, `shape`, `status`, `disabled` e
  `decorative`.

  Ordem de fallback imagem → iniciais → glifo. A imagem fica fora de vista até
  reportar que chegou, então uma requisição que falha nunca pinta o ícone
  quebrado do navegador. O glifo é `--slotted-icon-person`, acrescentado à
  escala em lockstep com contrato, tema e `docs/token-foundation.md`.

  O nome mora na raiz como `aria-label` com `role="img"` e a imagem leva `alt`
  vazio, então o avatar anuncia a mesma coisa nos quatro estados. As quatorze
  implementações pesquisadas nomeiam a imagem, o que faz o mesmo avatar ser
  "Ada Lovelace" depois que a foto carrega e "AL" antes.

  `tone="auto"` é o padrão e deriva do nome por FNV-1a em
  `@slotted/core/identity` — novo entry point, com `initialsFrom`, `toneFrom` e
  `formatNameList`. As iniciais são segmentadas por grafema e maiusculizadas
  pelo locale, o que nenhuma das quatro implementações que derivam iniciais faz.
  A paleta são os cinco tons da biblioteca: colisão é certa em um grupo de seis,
  então a cor é auxílio de leitura e o nome é o identificador.

  **A camada de componente deixou de ser vazia.**
  `--slotted-avatar-size-{xs,sm,md,lg,xl}` são raízes de escala que variam por
  densidade. Uma família só responde à densidade lendo um token que o tema
  reafirma por densidade, e as três escalas que fazem isso nomeiam um controle;
  `--slotted-control-height-lg` é 38px e a página de perfil precisa de 64.

  O grupo é um `<ul>` de `<li>`. `max` conta os discos desenhados, resumo
  incluído. O resumo é um avatar de verdade, e o seu nome acessível são os nomes
  dos membros ocultos unidos por `Intl.ListFormat` no locale — Atlassian entrega
  a string inglesa "N more people" e as outras deixam "+3" como o anúncio
  inteiro. O grupo provê `size`, `shape` e `variant` aos membros pelo mecanismo
  de defaults do próprio `avatar`, e nunca `tone`.

  Quebra de contrato registrada em `docs/BUILD-LOG.md` e no design em
  `docs/superpowers/specs/2026-09-02-avatar-family-design.md`.

- **`kbd`** — combinação localizada por plataforma, com nome acessível. Não
  registra atalho nenhum. Lê `--slotted-font-family-mono`.
- **`skeleton`** — geometria aproximada do conteúdo, com recipes de texto,
  avatar, bloco e composição. Fora da árvore de acessibilidade; a região anuncia
  o carregamento uma vez. Sob reduced motion a animação para, não encurta.
- **`progress-indicator`** — entregue. Uma família, um membro, três
  componentes: `ProgressBar` (linear), `ProgressCircle` (circular, e o spinner
  quando não tem valor) e `Loader` — o loading indicator do M3 Expressive, uma
  forma que se transforma enquanto gira, que nenhuma das três famílias
  absorvidas tinha. `data-shape` é `linear`, `circular` ou `morph`, escrito pelo
  componente e nunca escolhido.

  Além do escopo: `buffer` (uma segunda quantidade, recebida e não processada),
  `wave` (o indicador ondulado do M3 Expressive, na barra e no anel),
  `contained` (o contentor do M3 atrás da forma), `placement="page"` — que é
  todo o `loading-bar` —, `minDuration` ao lado de `delay`, `decorative`, e o
  par `format`/`locale` que escreve o número com `Intl`.

  Duas decisões saem da família. `measurement` deixa de ser mutável em
  `specs/contract.schema.mjs`: um indicador de progresso não decide que
  progrediu, e o vocabulário obrigava-o a declarar um pedido que ninguém emite.
  E `progressbar` é _children presentational_ na ARIA 1.3, o que apaga qualquer
  live region dentro da raiz — por isso `live` e `announceStep` foram desenhados
  e retirados, e a frase que um leitor ouve pertence a `inline-message`, que a
  secção 9 do guia já nomeia para progresso.

  O anel do Button ainda desenha a sua própria borda girando: a troca são duas
  declarações e um elemento em três ficheiros, e os três estavam a ser editados
  por uma sessão concorrente nesta worktree. Registado em `docs/BUILD-LOG.md`.
  A geometria já corresponde — o traço é um oitavo do diâmetro nos dois.

- **`status-indicator`** — ponto, ícone ou rótulo curto de estado operacional,
  sempre com texto acessível e alternativa não cromática. Pulso só para mudança
  viva, respeitando reduced motion.
- **`alert`** — uma família com recipes por alcance: alerta contextual, callout
  editorial e banner de página. `tone`, título, descrição, ícone, ações,
  `dismissible`. Os cinco tons comunicam por texto e ícone além de cor. Alerta
  presente na montagem não é live region; atualização assíncrona pode ser.
- **`inline-message`** — mensagem ligada a um campo, seção ou ação, com ID
  estável e política de anúncio. Sem layout shift severo, e nunca tooltip para
  erro obrigatório. É a peça que `field` (onda 3) consome para mensagem e erro.

## Onda 3 — Formulário

Sequencial. Cada item reusa a decisão de anatomia do anterior.

1. `field field-group` — feito em 2026-09-02. Base de label, descrição,
   mensagem, marca de obrigatório e relação por ID; `fieldset` foi absorvido em
   `field-group`. Além do escopo acima, as duas famílias entregam `size`,
   `labelPlacement` com refluxo por container query, `requiredMark` com marca ou
   palavras, contador, e defaults de aplicação — provider no React, token e
   `SlFieldDefaultsSource` no Angular. A descrição e o erro das duas são
   `inline-message`.
2. `text-field` — feito em 2026-09-02. Substitui `input`. O controle deixa de
   ser o `input` sozinho e passa a ser uma moldura em volta dele, porque oito
   das treze implementações pesquisadas colocam conteúdo dentro da borda e um
   elemento vazio não tem filho — e porque a WAI-ARIA limita os filhos de um
   `textbox` a conteúdo não interativo. Além do escopo acima, a família entrega
   valor controlado/não controlado com razão, `start` e `end`, botão de limpar,
   alternância de senha com `aria-pressed`, contagem publicada para o `field`,
   `variant` com `plain` para célula de tabela, `mono`, e defaults de aplicação
   nos dois bindings. Nada é ligado a Escape.
3. `textarea` — feito em 2026-09-02. Continua sendo o próprio elemento, sem
   moldura: nada do que foi pesquisado coloca adorno dentro de um textarea, e o
   canto é da alça. Além do escopo acima, entrega `autoSize` por
   `field-sizing: content` com `rows` como piso e `maxRows` como teto, `resize`
   com padrão `block`, `variant`, `mono`, contagem e defaults de aplicação.
   Enter cria linha e nunca envia.
4. `checkbox checkbox-group radio-group` — novo. Uma invocação, três famílias:
   a marca é desenhada num irmão do input, e não num pseudo-elemento dele, em
   `checkbox` e em `radio-group`; `checkbox-group` recebeu o valor em array e o
   checkbox pai que deriva `indeterminate` de seus filhos. `checkbox-group` não
   estava nesta linha e entrou porque quatro das implementações pesquisadas o
   entregam e `field-group` só é dono do agrupamento, não do valor. Um radio é
   `data-part="item"` do grupo, e não uma família, porque um radio fora de um
   grupo não é um controle. Roving focus e toda a tabela de teclado do APG são
   da plataforma: os radios nativos compartilham um `name`. As três também
   entregam `variant: 'plain' | 'tile'` — a escolha desenhada como superfície
   emoldurada, cuja área inteira é o alvo. Três das implementações pesquisadas
   a colocam na própria família de checkbox, e o `defer to card` registrado
   antes foi revertido: `card` é um contêiner de conteúdo e não conhece `size`
   vindo do `field`, `invalid`, `readonly` nem `required`. O arranjo continua
   sendo de `grid`. Decisões em
   `docs/superpowers/specs/2026-09-03-choice-controls-design.md`.
5. `switch` — refazer.
6. `number-field` — novo. Valor `number | null` controlado/não controlado com
   razão, `min`, `max`, `step`, `largeStep` (Shift e PageUp/PageDown) e
   `smallStep` (Alt), `Home`/`End` nos limites, dois botões de passo fora da
   ordem de tabulação, `stepper` com `stacked`, `split` e `none`, política de
   clamp (`blur`, `strict`, `none`), `snapToStep`, `stepFrom`, roda do mouse
   desligada por padrão, formatação por `Intl.NumberFormat` com `locale`
   explícito, adornos `start` e `end`, `size`, `variant` e os estados
   compartilhados com o `field`. O controle é `input[type=text]` com
   `role="spinbutton"`: `type="number"` sanitiza qualquer texto que não seja um
   número de ponto flutuante válido, então nenhum separador de milhar nem
   símbolo de moeda sobrevive a ele. O parser e a aritmética moram em
   `@slotted/core/number`, novo entry point, para que os dois bindings não
   discordem sobre o que `1.234` significa. Decisões em
   `docs/superpowers/specs/2026-09-03-number-field-design.md`.
7. `slider` — novo. Valor único ou intervalo em `number | number[]`
   controlado/não controlado com razão, `onValueCommit` separado da mudança,
   `min`, `max`, `step`, `largeStep` (Shift e PageUp/PageDown),
   `minStepsBetween`, `origin`, `orientation`, `marks` com rótulo, `format` por
   `Intl.NumberFormat` com `locale` explícito, `valueLabel` com bolha no polegar,
   `thumbLabels`, `size` e os estados compartilhados com o `field`. Cada polegar
   é um `input[type=range]` real — a mesma escolha do `mat-slider` e do Base UI —
   invisível e não clicável, então papel, conjunto de valores, submissão, reset e
   `disabled` vêm da plataforma. O `min` e o `max` de cada polegar acompanham o
   vizinho, que é o que o padrão multi-thumb da APG exige do intervalo anunciado.
   O teclado inteiro é da família, porque os navegadores discordam sobre PageUp
   num `input[type=range]`. `readonly` é da família também: o elemento não o
   responde. A geometria mora em `@slotted/core/slider`, novo entry point.
   Decisões em `docs/superpowers/specs/2026-09-03-slider-and-form-design.md`.
8. `form` — novo. Submissão, validação e integração com Reactive Forms no
   binding Angular. A família guarda só o mapa de erros — `docs/component-features.md`
   § 6 diz que ela coordena "sem possuir o estado de cada framework" — e lê o
   resto da plataforma: valores de `FormData`, validade de `checkValidity()`,
   sujeira dos eventos `input`. Três fontes se fundem num mapa ordenado pelo
   documento: o `errors` de um servidor, a validação de restrição nativa e o que
   o `onSubmit` devolveu. Entrega o resumo de erros do GOV.UK item por item —
   região focável, título, um link por erro apontando para o controle —, foco
   depois de uma submissão que falhou, `validate` com quatro políticas, submissão
   assíncrona que recusa a segunda, linha de ações com refluxo por container
   query, guarda de saída com trabalho não salvo, e no Angular a leitura dos
   erros do Reactive Forms por um registro de mensagens. `validity` entrou no
   vocabulário de capacidades em `specs/contract.schema.mjs`. A fusão e a
   colheita moram em `@slotted/core/form`, novo entry point.
9. `currency-field` — novo, feito em 2026-09-03. Entrou na onda fora da fila,
   por invocação direta, e não tinha parágrafo de escopo: este é o escopo,
   escrito com a família. Valor `number | null` em unidade maior,
   controlado/não controlado, com a requisição carregando a moeda e o inteiro
   exato em unidades menores. `currency` (ISO 4217) decide símbolo e casas
   decimais; `locale` decide separadores, posição do símbolo e sistema de
   numeração. Eixos `entry` (`cents` e `natural`), `align` (`end` e `start`),
   `size`, `variant`, `stepper` — padrão `none` — e `clamp`. `entry="cents"` é o
   modelo de caixa registradora que a ngx-currency chama de `Financial`: os
   dígitos entram na casa menor e deslocam para a esquerda, o separador nunca é
   digitado, o sinal é tecla própria e o cursor tem uma única posição legal.
   Uma colagem é interpretada, não acumulada. `moeda e percentual são
formatações` (guia §6) continua valendo: o que esta família acrescenta é o
   modelo de digitação e a unidade menor, não um segundo formatador. O motor
   mora em `@slotted/core/currency`, novo entry point sobre
   `@slotted/core/number`. Decisões em
   `docs/superpowers/specs/2026-09-03-currency-field-design.md`.

## Onda 4 — Navegação e disclosure sem overlay

| Invocação               | Modo       | Guia |
| ----------------------- | ---------- | ---- |
| `tabs`                  | refazer    | 7    |
| `breadcrumbs`           | refazer    | 7    |
| `pagination`            | refazer    | 7    |
| `collapsible accordion` | refazer    | 8    |
| `stepper`               | refazer    | 7    |
| `description-list`      | refazer    | 10   |
| `list list-item`        | novo       | 10   |
| `prose`                 | novo       | 10   |
| `result-state`          | consolidar | 9    |
| `toolbar`               | refazer    | 5    |

### Escopo por família — onda 4

- **`breadcrumbs`** — trilha de ancestrais acima da página atual. Landmark `nav`
  nomeado e `ol` do platform; página atual como texto com `aria-current="page"`,
  não como link. Separador é geometria desenhada em CSS, espelhada por
  `:dir(rtl)`; a família não possui ícone algum. Colapso acima de `maxItems`
  atrás de um botão que expande no lugar — sem overlay, portanto sem depender de
  `menu` da onda 5 — com contagem no nome acessível e foco no primeiro item
  revelado. Truncamento por falta de espaço, nunca por medida inventada.

- **`pagination`** — treze partes, doze opcionais: a fileira numerada entre dois
  gatilhos e a barra de paginador de tabela são a mesma família em dois arranjos.
  Página e tamanho de página são valores controláveis; total desconhecido não é
  inventado. Aritmética em `@slotted/core/pagination`, compartilhada pelos dois
  bindings. `itemHref` decide entre `button` e `a`. Compactação por container
  query abaixo de 22rem troca a fileira pelo resumo. Seletor de tamanho de página
  é `select` nativo até `select` existir na onda 6.

- **`stepper`** — indicador e navegação de etapas, mais o painel da etapa atual.
  Recusa `role="tablist"` (guia, seção 7) e usa `ol`/`li` com
  `aria-current="step"` mais um status oculto por cabeçalho. Estados pending,
  current, complete, error e disabled, cada um por forma além de cor. `linear`
  deriva alcance de conclusão; recusar uma navegação é cancelar a solicitação de
  mudança. Três modos de navegação — `button`, `link` e `none`, sendo o último um
  indicador de progresso somente leitura. Avanço é diretiva ou handler no botão
  do consumidor, nunca um botão da família. Reflow por container query abaixo de
  30rem transforma linha em coluna.

- **`result-state`** — entregue em 2026-09-04. A região que substitui o conteúdo
  que não está lá, e diz o que fazer em seguida; não é `alert`, que fica ao lado
  do conteúdo de que fala. Um membro e sete partes: `root`, `media`, `content`,
  `title`, `description`, `actions` e `footer`. Sete status — `empty`,
  `no-results`, `not-found`, `error`, `forbidden`, `offline` e `success` — cada
  um com um tom que o tema já mede e uma silhueta própria, o que custou quatro
  glyphs novos à fundação. Eixos `reach` (as mesmas três palavras de `alert`),
  `align` e `live`. Sem modelo de estado: a família não guarda valor mutável, e
  o teste de contrato afirma a ausência com a razão. `live` tem padrão `polite`,
  contra o `off` de `alert` — o documento de entendimento do WCAG 2.2 SC 4.1.3
  nomeia o texto desta família como seu exemplo de status message, e nenhuma das
  sete implementações pesquisadas escreve papel vivo algum. Medida fica com
  `container` e moldura com `card`. Decisões em
  `docs/superpowers/specs/2026-09-03-result-state-design.md`.
- `toolbar` fecha a onda sem o overflow para menu; o overflow depende de `menu`
  e volta como refino na onda 5.

### Escopo por família — onda 4

- **`tabs`** — entregue em 2026-09-03, na mesma invocação que `toolbar`. Um
  membro e nove partes: `root`, `list`, `item`, `tab`, `label`, `dismiss`,
  `panel`, `scroll` e `actions`. Eixos `activation`, `orientation`, `size`,
  `variant` (`line`/`contained`), `fit` (`auto`/`equal`) e `mount`
  (`active`/`lazy`/`eager`, os nomes da Cloudscape). Modelo de estado em
  `selection`, com razões `pointer`, `keyboard`, `remove` e `programmatic`, e
  requisição cancelável — o que nenhuma implementação pesquisada oferece. Tabs
  dispensáveis com `Delete`, foco e seleção indo para o vizinho conforme a
  regra do próprio APG. Lista que rola com dois controles de paginação fora da
  sequência de tabulação. Tab como âncora por `href`, com clique modificado
  entregue ao navegador. O marcador não é medido: a raiz registra
  `data-activation-direction` e a folha de estilo transforma isso em origem de
  transformação, o que mantém a família correta antes da hidratação.
- **`collapsible accordion`** — entregues em 2026-09-03, na mesma invocação.
  `collapsible` é uma divulgação: um cabeçalho que o leitor opera e um painel
  que ele controla. Nove partes — `root`, `header`, `trigger`, `indicator`,
  `label`, `description`, `actions`, `panel` e `content` — e seis eixos:
  `size`, `variant` (`plain`/`ruled`/`framed`), `indicator`
  (`chevron`/`plus-minus`/`none`), `togglePlacement`, `level` e `mount`
  (`active`/`lazy`/`eager`/`until-found`). O gatilho é `button` e não `summary`:
  o padrão do APG exige que o botão seja o único elemento dentro do heading, e
  `summary` não aceita nenhum dos dois arranjos. O painel abre com uma pista de
  grade entre `0fr` e `1fr`, sem medir nada. `mount="until-found"` escreve
  `hidden="until-found"` e responde a `beforematch`, de modo que a busca do
  próprio navegador abre o painel que encontrou.
  `accordion` é o conjunto: uma parte, `root`, e o valor que os itens
  compartilham. `multiple`, `requireOpen` — com o `aria-disabled="true"` que o
  padrão pede no cabeçalho que não pode fechar —, `loop`, `headingLevel` e um
  `variant` de quatro valores mapeado no `variant` que ele entrega a cada item.
  As setas, `Home` e `End` são aditivas: nada escreve `tabindex`, porque
  `w3c/aria-practices#3434` removeu o foco rotativo do padrão. Nenhuma regra do
  conjunto alcança `[data-ui='collapsible']`, que é a regra de `checkbox-group`.
  Acordeão horizontal é recusado e fica com `tabs`.

- **`toolbar`** — entregue em 2026-09-03. Um membro e quatro partes: `root`,
  `group`, `separator` e `spacer`. Eixos `orientation`, `size`, `variant`
  (`plain`/`outline`) e `overflow` (`wrap`/`scroll`). Os itens são os controles
  do próprio consumidor, encontrados por serem focáveis, e um item pode ficar
  com as setas de que precisa para operar — o conselho do APG escrito como
  comportamento. `disabled` é recusado: um contêiner não desabilita controles
  que não são dele, e `<fieldset disabled>` é a resposta da plataforma. Sem eixo
  de arranjo: gap, alinhamento e barra unida continuam de `button-group`.

- **`description-list`** — pares termo–descrição de um painel de detalhes, lido
  e não editado. `div` de raiz — o contêiner da container query — em volta de um
  `dl` de `div`/`dt`/`dd`, forma que o HTML Standard §4.4.9 permite e que faz de
  cada par uma célula de grade. Nenhum `role` é escrito: HTML-AAM já mapeia
  `list`, `term` e `definition`, e a MDN registra que escrever `term`/`definition`
  à mão muda o que o VoiceOver anuncia. Onze partes — `root`, `list`, `item`,
  `term`, `hint`, `description`, `value`, `placeholder`, `copy`, `toggle` e
  `action`. Eixos `layout` (`row`/`stack`), `columns` (`1`/`2`/`3`) e `variant`
  (`plain`/`ruled`/`framed`, o vocabulário de `collapsible`). Os termos
  compartilham uma trilha dimensionada pelo mais largo deles, por `subgrid`: é o
  que um `dl` de grupos independentes não faz sozinho, e o que a PatternFly
  resolve com largura fixa e o Ant com uma `table` de verdade. A trilha de ação
  existe só onde há ação, porque um gap separa duas trilhas tenha a segunda
  largura ou não. Recomposição por container query: três colunas viram duas
  abaixo de 48rem, duas viram uma abaixo de 34rem, a linha vira pilha abaixo de
  26rem — e oito rem antes disso quando os termos carregam `hint`. Valor longo
  tem duas saídas e nenhuma tira texto do DOM: `clamp` com `revealed`
  controlado/não controlado, e cópia por `navigator.clipboard.writeText`
  anunciada pelo `live-announcer`. Valor ausente é decisão, não omissão: régua
  desenhada mais o motivo em texto por `visually-hidden`. Ação da linha é um
  segundo `dd`, nomeada pelo próprio termo com `aria-describedby`. Título e ações
  do conjunto ficam com `card`; ajuda em camada, com `popover` da onda 5;
  carregamento, com `skeleton`. Inventário em
  `docs/superpowers/specs/2026-09-03-description-list-capability-inventory.md`,
  decisões em `docs/superpowers/specs/2026-09-03-description-list-design.md`.

- **`list list-item`** — duas famílias, a relação que `accordion` e
  `collapsible` já têm: nenhuma regra da folha do conjunto alcança
  `[data-ui='list-item']`, e o conjunto entrega `variant`, `size`, `marker` e
  `inset` a cada linha pelo binding. `list` tem um membro e cinco partes —
  `root`, `section`, `section-label`, `section-list` e `empty` — com eixos
  `variant` (`plain`/`ruled`/`framed`/`separated`, o vocabulário de
  `accordion`), `size` e `marker` (`none`/`bullet`/`number`), mais `ordered`,
  `inset`, `loading` e o nome acessível. `list-item` tem um membro e oito partes
  — `root`, `content`, `start`, `body`, `label`, `description`, `end` e
  `actions` — com eixos `tone` (as cinco do tema), `size` e `align`
  (`center`/`start`), mais `inset`, `truncate`, `selected`, `current`,
  `disabled`, `loading`, `position` e `setSize`.
  `content` é `div`, `button` ou `a`, e `actions` é irmão dele e nunca filho:
  conteúdo interativo não aninha dentro de `a` nem de `button`. `aria-disabled`
  não vai na `li` — a ARIA 1.2 a depreca em `listitem` — e a família escreve
  `role="list"` sempre, porque desenha o próprio marcador e o `::marker` nativo
  não existe em uma linha que também carrega controles. Seleção com foco
  rotativo, virtualização e reordenação por arraste ficam com `listbox`, com o
  motor de coleção e com drag-and-drop, todos da onda 6.
  Inventário em
  `docs/superpowers/specs/2026-09-03-list-and-list-item-capability-inventory.md`,
  decisões em `docs/superpowers/specs/2026-09-03-list-and-list-item-design.md`.

- **`prose`** — entregue em 2026-09-04. A tipografia de uma região que a
  aplicação não escreveu elemento por elemento: a árvore chega de um renderizador
  de Markdown, de um CMS ou de um modelo de linguagem, e a página nunca põe um
  atributo no `h2`. Texto que a aplicação escreve continua sendo `typography`; a
  fronteira é quem escreveu as tags. Um membro e seis partes — `root`, `lead`,
  `anchor`, `scroll`, `exclude` e `footnotes` — e dois eixos: `size`
  (`md`/`lg`/`xl`, nomeado pelos passos da própria escala de tipo, com padrão
  `lg` porque um parágrafo não é o rótulo de um botão) e `flow`
  (`tight`/`normal`/`loose`, o único número de que derivam todos os vãos da
  página). Sem modelo de estado: a família não guarda valor mutável, e o teste de
  contrato afirma a ausência com a razão.
  Toda regra de conteúdo pesa 0-1-0 — `:where()` mais a rosquinha
  `:not(:where([data-part='exclude'], …))` — porque precisa perder para duas
  coisas: uma família Slotted colocada dentro da região e a regra do próprio
  consumidor. `@scope` diz o mesmo em uma linha e foi recusado por data: chegou
  ao Baseline em março de 2026, e um bloco que o navegador não interpreta derruba
  a folha inteira em vez de uma declaração.
  Medida fica com `container`, e densidade é recusada porque `flow` já responde à
  mesma pergunta — o mesmo argumento que `container` usou para o próprio inset.
  A escada de títulos é a única razão literal da família, em `em`, registrada com
  o custo: um título editorial é dimensionado em relação ao texto que apresenta, e
  a escala da fundação para em 1.5rem porque nenhum controle precisa de mais.
  A parte `scroll` é o único comportamento: um bloco largo recebe
  `role="region"`, `tabindex="0"` e um nome **apenas enquanto transborda**,
  medido por `@slotted/core/overflow`. Nenhuma das quatro implementações
  pesquisadas deixa uma tabela larga alcançável sem ponteiro, e uma parada de
  tabulação num bloco que cabe não faz nada.
  Realce de sintaxe fica com `code-block` (onda 8) e comportamento de tabela com
  `table` (onda 6). Inventário em
  `docs/superpowers/specs/2026-09-04-prose-capability-inventory.md`, decisões em
  `docs/superpowers/specs/2026-09-04-prose-design.md`.

## Onda 5 — Infraestrutura de overlay e overlays

Infraestrutura primeiro, em `packages/core`, com teste próprio e sem UI:

1. `presence` — montagem durante animação de saída, `forceMount`.
2. `dismissable-layer` e `portal` — Escape, press externo, scroll lock, `inert`,
   pilha única de z-index.
3. `positioner` — âncora, placement, colisão, atualização em scroll e resize,
   sem expor a engine.
4. `live-announcer` — prioridade, deduplicação e limpeza.

Os cinco foram entregues em 2026-09-03, na mesma invocação. Inventário em
`docs/superpowers/specs/2026-09-03-overlay-infrastructure-capability-inventory.md`,
decisões em `docs/superpowers/specs/2026-09-03-overlay-infrastructure-design.md`.
Nenhum importa outro: a família compõe.

`focus` já existe e é revisado, não reescrito. A revisão encontrou as duas
capacidades que o guia, seção 3, pede dele e que ele não tem — contenção de foco
em overlay e restauração ao gatilho. Elas ficam com `dialog`, o primeiro
consumidor, e não com `dismissable-layer`, que responderia a mesma pergunta uma
segunda vez.

Depois, nesta ordem:

1. `tooltip` — primeiro consumidor de `positioner` e de `presence`. A folha de
   estilo lê `--slotted-positioner-anchor-width` e as outras propriedades que o
   posicionador escreve em tempo de execução, e `packages/styles/src/tokens.test.mjs`
   exige que todo `--slotted-*` lido por uma folha esteja declarado no
   `tokens.json` da família com fallback de fundação. Um valor de runtime não tem
   fallback de fundação: o defeito é do teste compartilhado e é corrigido em
   commit próprio, antes da família, como o briefing exige.

   Entregue com `popover` em 2026-09-04, em uma sessão só. A correção
   compartilhada saiu antes das duas famílias e vale para todas as que vierem:
   `packages/styles/src/runtime-properties.mjs` nomeia os prefixos que o script
   escreve, `tokens.test.mjs` os subtrai antes de comparar, e
   `logical.test.mjs` passou a permitir um inset físico em uma regra que
   seleciona `[data-part='arrow']` — a seta é medida pelo engine em coordenadas
   físicas e `data-side` nomeia uma borda física, então espelhá-la levaria uma
   resposta correta para a borda errada em RTL.

   O que a família decidiu e as próximas herdam: o vão entre o gatilho e a
   superfície é o padding da própria layer e não o `sideOffset`, porque um vão
   feito de offset é página vazia que o ponteiro atravessa — WCAG 2.2 SC 1.4.13
   Hoverable; `hideWhenDetached` esconde e não fecha; o gatilho não é uma parte,
   porque dezesseis folhas de estilo aqui selecionam `[data-part='root']`; e o
   tooltip é uma `dismissable-layer`, então Escape, o press externo e o
   empilhamento vêm todos do mesmo mecanismo. Inventário em
   `docs/superpowers/specs/2026-09-04-tooltip-and-popover-capability-inventory.md`,
   decisões em
   `docs/superpowers/specs/2026-09-04-tooltip-and-popover-design.md`.

2. `popover` — o diálogo **não modal** da APG, entregue com `tooltip` na mesma
   sessão porque os dois são o mesmo posicionamento com políticas de dismissal
   diferentes. `modal` fica com `dialog`, como manda o guia, seção 8. O corpo é
   a única parte que rola, limitada por
   `--slotted-positioner-available-height`, e é por isso que a anatomia tem
   header, body e footer em vez de uma caixa só. Duas sentinelas
   `data-part="focus-guard"` respondem o que `Tab` faz na borda de uma layer
   portalizada e não modal: fecham e devolvem o foco ao gatilho. Nenhuma das
   bibliotecas pesquisadas responde essa pergunta.
3. `dialog alert-dialog` — entregue em 2026-09-04, como **uma família com dois
   membros**, `dialog` e `alertDialog`, sob um único `data-ui="dialog"`. O
   precedente é `button`, cujo contrato declara `iconButton` enquanto o guia dá
   a Icon Button uma seção própria; o que decide é
   `packages/styles/src/identity.test.mjs`, que recusa uma folha de estilo
   apoiada no `data-ui` de outra família — duas famílias significariam a mesma
   layer, a mesma geometria de painel, o mesmo modelo de scroll e a mesma regra
   de forced-colors escritas duas vezes. Não existe `specs/components/alert-dialog/`.
   `createFocusScope` — contenção e restauração ao gatilho — está em
   `packages/core/src/focus`, com teste próprio, como esta linha pedia.
   Inventário, decisões e autoavaliação em
   `docs/superpowers/specs/2026-09-04-dialog-and-alert-dialog-*.md`.
4. `drawer` — entregue em 2026-09-04, como **família própria**, `data-ui="drawer"`,
   e não como membro de `dialog`. O que decide é que um drawer persistente não
   tem papel `dialog` nenhum: um alert dialog _é_ um dialog, então uma regra do
   consumidor para `[data-ui='dialog']` vale para ele também; um drawer `inline`
   é uma região da página, e `role="dialog"` nele seria a afirmação que a APG
   chama de severa. O custo — cabeçalho, botão de fechar e regra de
   forced-colors escritos duas vezes — está em `contract.json`, campo `identity`.
   Modal e persistente são **um membro com um eixo `mode`**, porque a troca é o
   ponto: dois componentes fariam o consumidor trocar um elemento por outro no
   breakpoint, e os dois frameworks destroem a subárvore quando isso acontece.
   `packages/core/src/extent` e a palavra `extent` no vocabulário de
   `specs/contract.schema.mjs` chegaram aqui, em commit próprio antes da
   família; `splitter`, na onda 8, é o segundo consumidor de ambos e responde ao
   mesmo padrão Window Splitter. Inventário, decisões e autoavaliação em
   `docs/superpowers/specs/2026-09-04-drawer-*.md`.
5. `menu menubar` — entregues em 2026-09-04. Duas famílias, uma máquina: o
   menubar é um contêiner sobre `menu` sem reexportar nada, e um submenu é a
   mesma família aberta a partir de um item. Dois módulos novos em
   `packages/core` vieram com elas e ficam disponíveis para quem vier depois:
   `typeahead`, que a revisão da onda 6 herda em vez de escrever de novo, e
   `pointer-intent`, cujo segundo consumidor é `preview-card` na onda 8.
   Inventário em
   `docs/superpowers/specs/2026-09-04-menu-and-menubar-capability-inventory.md`,
   decisões em `docs/superpowers/specs/2026-09-04-menu-and-menubar-design.md`.
6. `toast` — a região é a raiz, não a mensagem: um `section` com nome, marco de
   navegação e nunca live region. O anúncio sai por
   `packages/core/src/live-announcer`, porque uma live region criada na mesma
   tarefa do seu texto fica muda (ARIA 1.2 §6.4) e um papel live numa caixa com
   Fechar e Desfazer é lido com os dois botões dentro da frase. Dez partes —
   `root`, `list`, `item`, `icon`, `content`, `title`, `description`, `actions`,
   `close` e `progress` — e eixos `placement` (seis, lógicos), `attach`
   (`portal`/`viewport`/`inline`), `stacking` (`list`/`stack`), `tone`,
   `variant` (`raised`/`soft`/`solid`), `priority`, `dismissible`, `swipe`,
   `progress`, `pauseOnHover` e `pauseWhenHidden`.
   O relógio começa quando a mensagem fica visível, para em hover, em foco
   dentro e em documento oculto, e retoma no tempo que restava; o que chega com
   a tela cheia espera. Uma mensagem com ação, ou à espera de uma promessa, não
   recebe duração nenhuma salvo indicação — a regra que só o Angular Material
   enuncia. O modelo, os relógios e a fila ficam em `packages/core/src/toast`;
   `presence` faz a saída e `focus/removal-focus` responde para onde vai o
   teclado quando a mensagem que o tinha sai.
   Duas palavras novas no vocabulário partilhado, em commit próprio antes da
   família: a razão `timeout` e a capacidade `queue`. Inventário em
   `docs/superpowers/specs/2026-09-04-toast-capability-inventory.md`, decisões
   em `docs/superpowers/specs/2026-09-04-toast-design.md`, avaliação em
   `docs/superpowers/specs/2026-09-04-toast-self-assessment.md`.
7. `loading-overlay`

Refino de `toolbar` com overflow — entregue em 2026-09-04. `overflow` ganha o
valor `menu` ao lado de `wrap` e `scroll`, e a família ganha duas partes:
`item`, a unidade que a barra pode ceder, e `overflow`, o gatilho que guarda o
que não coube. A ordem é a da própria barra, invertida: a última unidade que
pode ceder é a primeira que cede, e o que precisa continuar visível é o que não
tem para onde ir — declarar nenhum `counterpart` é o que fixa a ação primária,
sem prop de prioridade. Uma barra sem gatilho, ou só com unidades fixas, rola em
vez de recortar. `@slotted/core/overflow` ganha `collapseState` e
`createCollapse`, uma medição para as duas ligações; `createArrowNavigation`
deixa de recolher item que a plataforma não foca. Inventário em
`docs/superpowers/specs/2026-09-04-toolbar-overflow-capability-inventory.md`,
decisões em `docs/superpowers/specs/2026-09-04-toolbar-overflow-design.md`,
avaliação em
`docs/superpowers/specs/2026-09-04-toolbar-overflow-self-assessment.md`.

## Onda 6 — Coleções

1. Revisão de `packages/core/collection`: chaves estáveis, seções, typeahead,
   seleção, carregamento incremental e virtualização como capacidade opcional.
   `virtual-list` deixa de ser família pública e sua entrada em
   `specs/components/` é retirada aqui (guia 2.10).
2. `listbox` — entregue em 2026-09-04. Primeiro consumidor real do motor, e o
   teste de janela com seleção simultânea: um `tabindex` rotativo não sobrevive
   à reciclagem do próprio elemento, então `focusMode` tem o valor `auto`, que
   lê um fato — se o conjunto está em janela — e responde `activedescendant`
   quando está. A opção ativa e a âncora do intervalo ficam fixadas na janela,
   porque um `aria-activedescendant` que aponta para um id fora do documento
   deixa o leitor operando um widget sem opção focada.
   Um membro e doze partes — `root`, `canvas`, `group`, `group-label`, `option`,
   `indicator`, `icon`, `label`, `description`, `meta`, `empty` e `loader` —
   com dezenove eixos e dois valores mutáveis: `selection` e `current`, que o
   padrão declara distintos ("DOM focus is functionally distinct from the
   selected state"). Os dois modelos de seleção do padrão são implementados,
   escolhidos por `selectionBehavior`.
   Em seleção única o valor é um escalar, como fazem três das quatro
   implementações pesquisadas; a forma sempre-array do CDK é o que obriga cada
   consumidor a escrever `value[0]`. `aria-setsize` e `aria-posinset` são
   escritos apenas quando a coleção é entregue à família, que é exatamente a
   condição do padrão e a única forma que sobrevive ao servidor.
   `columns` é um número declarado e não medido, para que o desenho e o teclado
   não possam discordar; o custo é que o consumidor o redeclara no próprio
   breakpoint. Inventário em
   `docs/superpowers/specs/2026-09-04-listbox-capability-inventory.md`, decisões
   em `docs/superpowers/specs/2026-09-04-listbox-design.md`, revisão do motor em
   `docs/superpowers/specs/2026-09-04-collection-engine-review.md`, avaliação em
   `docs/superpowers/specs/2026-09-04-listbox-self-assessment.md`.
3. `select`
4. `combobox`
5. `multi-select`
6. `tree`
7. `table` — a fronteira com `data-grid` é o papel ARIA, não a contagem de
   features. O padrão diz que uma tabela "is not an interactive widget. Thus,
   its cells are not focusable or selectable": cada controlo dentro dela é a sua
   própria paragem de tabulação e a família não declara tecla nenhuma. As quatro
   capacidades que exigem o padrão `grid` — redimensionar coluna, virtualização,
   ordenação por várias chaves e ativação de linha — ficam para a onda 8.
   Dezanove partes, das quais duas são fatias do consumidor: `column-actions`,
   ao lado do nome da coluna, e `footer`, a barra sob a tabela e dentro da
   moldura onde a paginação assenta. A raiz é a moldura e o scroller está um
   elemento dentro, porque o cabeçalho fixo resolve contra o scroller e a barra
   de paginação não pode rolar de lado com a tabela.
   Três valores mutáveis: `sort`, `selection` e `open`. O primeiro trouxe a
   palavra `sort` para `specs/contract.schema.mjs`, em commit próprio, e a
   família guarda o descritor sem reordenar nada — as linhas são filhas do
   consumidor, e reordená-las seria possuir os dados. A seleção usa
   `nextSelection` do motor de coleções e é anunciada pela `checkbox` que a
   possui, porque uma linha não é selecionável sob este papel.
   `aria-rowcount` e `aria-rowindex` são escritos exatamente quando o DOM não
   tem o conjunto inteiro, que é o que a prática exige e o que nenhuma das seis
   implementações pesquisadas faz. Inventário em
   `docs/superpowers/specs/2026-09-09-table-capability-inventory.md`, decisões em
   `docs/superpowers/specs/2026-09-09-table-design.md`.

## Onda 7 — Data, arquivo e o restante do Core

Independentes entre si, exceto a cadeia de data.

- `date-field` → `calendar` → `date-picker`
- `upload` — consolida `file-upload`, `dropzone` e `file-input` (guia 17)
- `page page-header section`
- `app-shell`
- `action-bar`

## Onda 8 — Extended

Somente após o Core inteiro estar aprovado: `splitter`, `side-navigation`,
`command-palette`, `segmented-control`, `toggle-group`, `scroll-area`,
`filter-bar`, `data-grid`, `date-range-picker`, `time-picker`, `tags-input`,
`timeline`, `code-block`.

## Destino das 29 famílias atuais

| Atual                                                                                       | Destino                             | Onda |
| ------------------------------------------------------------------------------------------- | ----------------------------------- | ---- |
| `visually-hidden`, `divider`, `card`                                                        | refazer                             | 1    |
| `button`, `link`, `badge`, `tag`, `avatar`, `kbd`, `skeleton`, `alert`                      | refazer                             | 2    |
| `spinner`, `progress-bar`, `loading-bar`                                                    | consolidar em `progress-indicator`  | 2    |
| `field`, `fieldset`                                                                         | consolidado em `field field-group`  | 3 ✓  |
| `input`                                                                                     | renomear para `text-field`          | 3    |
| `textarea`, `switch`                                                                        | refazer                             | 3    |
| `tabs`, `breadcrumb`, `pagination`, `collapsible`, `stepper`, `description-list`, `toolbar` | refazer                             | 4    |
| `virtual-list`                                                                              | retirar; vira capacidade de coleção | 6    |
| `file-upload`                                                                               | consolidar em `upload`              | 7    |
| `splitter`                                                                                  | refazer como Extended               | 8    |

## Regra de commit durante a reconstrução

Uma família por commit, `pnpm check` por família e `pnpm check:full` por onda.
Consolidação e remoção da família antiga ocorrem no mesmo commit, para que a
árvore nunca tenha duas famílias descrevendo a mesma capacidade.
