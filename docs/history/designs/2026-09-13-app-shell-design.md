# Desenho — `app-shell`

Decisões tomadas antes de escrever o contrato, o stylesheet ou qualquer
binding. O inventário que as alimenta está em
`docs/history/designs/2026-09-13-app-shell-capability-inventory.md`.

O leitor deste documento é a família que herda as decisões, não um revisor a
ser convencido.

---

## 1. O que a família é

A moldura exterior de uma rota: as regiões que não mudam quando o conteúdo
muda. Uma grelha CSS com seis faixas nomeadas, uma região de navegação com três
modos, e a ordem de foco que liga as seis.

A fronteira com `page` está em §6 do inventário e não se repete aqui.

O que a família **não** é: uma lista de destinos (`side-navigation`, onda 8),
uma barra superior com marca e conta (`top-navigation`, onda 8), migalhas
(`page-header`), nem um painel secundário com gesto de redimensionar (`drawer`
com `mode="inline"`).

---

## 2. Anatomia

| Parte        | Elemento                | Landmark        | Existe quando                                              |
| ------------ | ----------------------- | --------------- | ---------------------------------------------------------- |
| `root`       | `div`                   | —               | sempre                                                      |
| `skip`       | `div` com `a`           | —               | sempre; um `a` por região com alvo                          |
| `banner`     | `header`                | `banner`        | o consumidor projeta conteúdo                               |
| `brand`      | `div`                   | —               | dentro de `banner`, no início da linha                      |
| `actions`    | `div`                   | —               | dentro de `banner`, empurrado para o fim pelo espaço que ocupa |
| `nav-toggle` | `button`                | —               | há região `nav`                                             |
| `nav`        | `nav`                   | `navigation`    | o consumidor projeta conteúdo                               |
| `nav-header` | `div`                   | —               | dentro de `nav`                                             |
| `nav-body`   | `div`                   | —               | dentro de `nav`; é o que rola                               |
| `nav-footer` | `div`                   | —               | dentro de `nav`                                             |
| `scrim`      | `div`                   | —               | modo sobreposto e `modal`                                   |
| `main`       | `main` com `tabindex="-1"` | `main`       | sempre                                                      |
| `aside`      | `aside`                 | `complementary` | o consumidor projeta conteúdo                               |
| `footer`     | `footer`                | `contentinfo`   | o consumidor projeta conteúdo                               |
| `layer`      | `div`                   | —               | sempre                                                      |

`header`, `nav`, `main`, `aside` e `footer` estão no contexto do `body` e por
isso são `banner`, `navigation`, `main`, `complementary` e `contentinfo` sem uma
linha de ARIA, pela tabela _HTML Sectioning Elements_ do APG. A raiz é um `div`
e não um elemento de secção precisamente por isso: um `main` dentro de um
`article` deixa de ser landmark, e a raiz tem de poder ser posta em qualquer
sítio sem mudar o que as cinco regiões significam.

`main` leva `tabindex="-1"`. Sem ele, o skip link move a rolagem e deixa o foco
onde estava, em Safari e em Firefox — que é a lacuna 3 do inventário.

`layer` é a raiz de portal da aplicação, publicada no contexto da família.
`@slotted/core/portal` já tem `setPortalContainer`, e é essa a ligação: a casca
chama-a com o seu `layer` e repõe o valor anterior ao ser destruída.

### A grelha

Com `primary="banner"`, `navSide="start"`:

```
"banner banner banner"
"nav    main   aside"
"footer footer footer"
```

Com `primary="nav"`:

```
"nav banner banner"
"nav main   aside"
"nav footer footer"
```

As faixas usam `grid-template-areas` e propriedades lógicas. `navSide="end"`
troca as colunas invertendo as áreas, e `dir="rtl"` espelha a grelha inteira
porque as colunas são `inline-start` e `inline-end` e não `left` e `right`.

---

## 2.1 As duas superfícies

| `canvas` | A moldura                              | O conteúdo                                     |
| -------- | -------------------------------------- | ---------------------------------------------- |
| `inset`  | banner, navegação e rodapé sobre o fundo rebaixado, sem superfície própria | um cartão elevado, recuado pela sarjeta, com raio e aresta |
| `flush`  | as regiões carregam a superfície       | o conteúdo carrega o fundo, aresta a aresta, separado por uma linha |

`inset` é a omissão. O primeiro arranjo desta família era `flush`, e o revisor
leu-o como um croqui de fios: no esquema claro `--slotted-surface-sunken` está
a dois por cento de `--slotted-surface`, portanto toda a fronteira era uma
linha de um pixel e nada no ecrã tinha um plano. Um cartão recuado dá ao
conteúdo uma elevação que duas superfícies quase iguais não dão, e a sarjeta
faz a separação que a linha fazia — em `inset` a família não desenha regra
nenhuma entre duas regiões.

`flush` fica como eixo porque uma grelha ou uma tabela dona da coluna inteira
não quer sarjeta à volta, e é o arranjo que todas as fontes pesquisadas
entregam.

**Uma sarjeta só.** `--slotted-app-shell-gutter` é o ar à volta do cartão, o ar
entre o cartão e a navegação, e a margem onde a marca, os destinos e o texto do
rodapé começam. Estava em quatro sítios e dois deles afastaram-se oito pixels,
que é exatamente longe demais para não se ver e perto demais para parecer
intencional.

**Com `primary="nav"` o cabeçalho da navegação toma a altura do banner**, para
que as duas marcas fiquem na mesma linha do ecrã em vez de serem dois
cabeçalhos de tamanhos diferentes na mesma faixa.

---

## 3. Os três modos da região de navegação

| Modo      | A navegação                                           | `open` significa          |
| --------- | ----------------------------------------------------- | ------------------------- |
| `inline`  | é uma coluna da grelha                                | coluna larga ou calha     |
| `overlay` | está fora da grelha, sobre o conteúdo                 | painel visível ou ausente |
| `auto`    | `inline` a partir de 768 px de largura **da casca**, `overlay` abaixo | conforme o modo resolvido |

`auto` é a omissão. A largura é a da casca e não a da janela:
`container-type: inline-size` na raiz, `container-name: app-shell`, e a
condição é literal porque `@container (min-width: var(--x))` é inválido —
regra 4 de `docs/token-foundation.md`.

**O número vive em dois sítios e um teste segura-os juntos.** O stylesheet
precisa dele literal; o script precisa dele para saber se o teclado e o foco
estão em modo sobreposto. `contract.json` declara `overlayAt: 768`, os dois
bindings importam-no, e `packages/styles/src/app-shell/app-shell.styles.test.mjs`
lê a condição `@container` do stylesheet e compara-a ao contrato.

### O que o modo sobreposto acrescenta

Composto de `packages/core`, nunca reescrito, como `docs/build-briefing.md`
exige:

- `presence` — o painel fica montado durante a saída;
- `dismissable-layer` — `Escape` e pressão fora, cada um com o seu eixo;
- `focus` — `createFocusScope` contém o foco enquanto `modal`, e devolve-o ao
  `nav-toggle` ao fechar;
- `inert` no `main`, no `aside` e no `footer` enquanto a camada é modal. É a
  lacuna 2 do inventário, e nenhuma fonte pesquisada a fecha.

**O painel pára debaixo do banner**, e é a grelha que diz onde isso é: um filho
posicionado em absoluto colocado nas linhas dois até ao fim toma essa área como
bloco contentor, portanto um banner que passe a duas linhas leva o painel
consigo e ninguém mede nada. A alternativa é uma folha por cima de tudo, que o
Material desenha e que tira do ecrã o controlo que a abriu: quem abriu a região
carregando num botão fica sem botão para carregar, e `aria-expanded` vive nesse
controlo.

`Escape` é registado em fase de captura por `dismissable-layer`, e a decisão de
`docs/build-briefing.md` sobre isso aplica-se sem alteração: a família não trata
a tecla no elemento que tem o foco.

### A primeira pintura

`data-nav-mode` só existe depois de o script decidir. Em largura estreita, o
stylesheet mostra o painel sobreposto apenas sob
`[data-nav-mode="overlay"][data-open]`, portanto uma renderização de servidor —
ou o quadro anterior à hidratação — desenha a casca estreita com a navegação
fechada, que é a omissão segura. Em largura larga a container query sozinha põe
a navegação na coluna, sem esperar por script nenhum.

---

## 4. Estado

Um valor mutável, e só um.

```json
"stateModel": {
  "open": {
    "controlled": "navOpen",
    "uncontrolled": "defaultNavOpen",
    "request": "onNavOpenChange",
    "reasons": ["pointer", "keyboard", "escape", "outsidePress", "select", "resize", "programmatic"]
  }
}
```

| Razão          | Quando                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| `pointer`      | o leitor carregou no `nav-toggle`                                      |
| `keyboard`     | `Enter` ou `Space` no `nav-toggle`                                     |
| `escape`       | `Escape` com a camada sobreposta aberta e `escape="close"`             |
| `outsidePress` | pressão fora do painel com `outsidePress="close"`                      |
| `select`       | um clique aterrou num `a[href]` dentro da região, em modo sobreposto, com `closeOnNavigate` |
| `resize`       | a casca passou a resolver `overlay` com a navegação aberta             |
| `programmatic` | a aplicação pediu                                                      |

**`resize` é novo no vocabulário fechado** de `specs/contract.schema.mjs` e de
`packages/core/src/state/state.ts`. O argumento é o mesmo que pôs lá `scroll`, e
está escrito para ser lido de novo: o espaço disponível mudou e a coisa
respondeu. Não é `pointer` — arrastar o canto de uma janela, rodar um telemóvel
e ampliar para 400% são três gestos e nenhum é uma pressão no controlo. Não é
`programmatic` — a aplicação não pediu nada.

O que a razão torna escrevível é a linha que o parágrafo de escopo §15 pede
("persistência de sidebar é preferência do produto"):

```ts
onNavOpenChange={(open, reason) => {
  setOpen(open);
  if (reason !== 'resize') localStorage.setItem('nav', String(open));
}}
```

Sem ela, a preferência do leitor é apagada pela primeira janela estreita que
aparecer. Mantine evita o problema com dois booleanos, um por faixa, e paga-o
com dois estados para uma região. Ant Design é a única fonte pesquisada que
distingue as duas origens, e fá-lo com a string `'clickTrigger' | 'responsive'`
fora de qualquer vocabulário partilhado.

**Alteração a ferramenta partilhada, em commit próprio, antes da família**, como
`docs/build-briefing.md` manda: `CHANGE_REASONS` em `specs/contract.schema.mjs`
e `ChangeReason` em `packages/core/src/state/state.ts` ganham `resize`, cada um
com o comentário que diz porquê.

### Precedência

Só um estado do vocabulário de atributos: `open`. `hover`, `active` e
`focus-visible` são do `nav-toggle` e dos links do `skip`. Nenhuma combinação
precisa de ordem que `STATE_PRECEDENCE` não dê já.

---

## 5. Teclado, foco e ARIA

Não há padrão APG para casca de aplicação. O padrão do controlo que abre a
região é **Disclosure (Show/Hide)**,
<https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/>, lido em 13 de setembro
de 2026. A estrutura das regiões é **Landmark Regions**,
<https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/>.

### Disclosure — tabela de teclado transcrita

| Tecla   | Efeito (APG)                                                       | Aqui                                                                 |
| ------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `Enter` | ativa o controlo e alterna a visibilidade do conteúdo controlado   | `nav-toggle` pede `open` com razão `keyboard`. Nativo do `button`.    |
| `Space` | ativa o controlo e alterna a visibilidade do conteúdo controlado   | idem                                                                   |

### Disclosure — papéis, estados e propriedades

| Requisito (APG)                                                       | Aqui                                                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| o elemento que mostra e esconde tem `role="button"`                   | `<button type="button">`, o elemento nativo. Nenhum `role` escrito.                  |
| `aria-expanded="true"` quando o conteúdo está visível, `false` quando não | `[attr.aria-expanded]` ligado a `open`                                            |
| `aria-controls` opcional, a apontar ao conteúdo                        | escrito, com o `id` do `nav`, gerado por `useId` e por `inject(_IdGenerator)`         |

Acrescento ao padrão, e o custo escrito: em modo `inline` com
`collapsedTo="rail"`, o conteúdo controlado **não desaparece** — encolhe para
uma calha. `aria-expanded` continua correto (a região está ou não na sua forma
completa) e a região continua no separador, que é o que a calha quer. Em
`collapsedTo="hidden"` e em modo sobreposto fechado, a região sai do DOM ou
recebe `inert`, e aí `aria-expanded="false"` diz a verdade inteira.

### Landmark Regions

| Requisito (APG)                                                                    | Aqui                                                                                                    |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `banner`, `main`, `complementary` e `contentinfo` devem ser landmarks de topo       | são filhos diretos da raiz, e a raiz é um `div` que não os re-escopa                                     |
| `header` no contexto do `body` é `banner`; dentro de `article`, `aside`, `main`, `nav` ou `section` não é | a raiz é `div`, portanto o `header` da casca é sempre `banner`                     |
| todo o conteúdo perceptível deve estar dentro de uma região                        | as seis áreas da grelha cobrem a raiz; `skip` e `layer` não têm conteúdo perceptível em repouso           |
| mais do que um `navigation` no documento exige rótulo único em cada                | a região recebe `aria-label` das mensagens da família, substituível por instância e por provider          |
| dois `navigation` com o mesmo conjunto de links devem partilhar o rótulo           | é decisão do consumidor; a casca só rotula a sua                                                          |

### Ordem de foco

`skip` → `banner` → `nav-toggle` → `nav` → `main` → `aside` → `footer`. É a
ordem do DOM, e com `primary="nav"` continua a ser: a grelha muda onde as
regiões são desenhadas e não onde estão escritas, que é o que separa
`grid-template-areas` de uma reordenação.

O `nav-toggle` fica **antes** da região que controla, que é o que o padrão
Disclosure supõe. Ele é renderizado pela casca dentro do `banner` por omissão e
pode ser posto em qualquer lado, porque recebe a ligação — `id`,
`aria-expanded`, `aria-controls`, o handler — por contexto.

### Skip links

Um `a` por região com alvo, gerado a partir das regiões que existem: saltar
para uma região vazia é um destino morto. Alvos: `main`, `nav`, `aside`. O
`banner` não recebe um porque está antes de todos eles na ordem de foco.

O `skip` não é um landmark: é um `div` com links. Um `nav` aí criaria uma
terceira região de navegação que o leitor de ecrã teria de atravessar para
chegar às duas que interessam.

---

## 6. Eixos e resolução

| Eixo              | Valores                             | Omissão   | Resolução                |
| ----------------- | ----------------------------------- | --------- | ------------------------ |
| `primary`         | `banner`, `nav`                     | `banner`  | prop → defaults → omissão |
| `canvas`          | `inset`, `flush`                    | `inset`   | prop → defaults → omissão |
| `navMode`         | `inline`, `overlay`, `auto`         | `auto`    | prop → defaults → omissão |
| `navSide`         | `start`, `end`                      | `start`   | prop → defaults → omissão |
| `navSize`         | `sm`, `md`, `lg`                    | `md`      | prop → defaults → omissão |
| `collapsedTo`     | `rail`, `hidden`                    | `rail`    | prop → defaults → omissão |
| `asideSize`       | `sm`, `md`, `lg`                    | `md`      | prop → defaults → omissão |
| `scroll`          | `content`, `document`               | `content` | prop → defaults → omissão |
| `dividers`        | `true`, `false`                     | `true`    | prop → defaults → omissão |
| `modal`           | `true`, `false`                     | `true`    | prop → defaults → omissão |
| `escape`          | `close`, `none`                     | `close`   | prop → defaults → omissão |
| `outsidePress`    | `close`, `none`                     | `close`   | prop → defaults → omissão |
| `closeOnNavigate` | `true`, `false`                     | `true`    | prop → defaults → omissão |

`modal`, `escape`, `outsidePress` e `closeOnNavigate` só têm efeito em modo
sobreposto. Não são eixos de um modo: são eixos da família que um modo lê, e
declará-los só em `overlay` obrigaria o consumidor a saber em que modo está
para decidir se pode escrevê-los.

Uma aplicação declara os doze uma vez —
`AppShellDefaultsProvider` no React, `provideAppShellDefaults()` no Angular — e
uma casca que escreva qualquer um deles ganha, sempre.

---

## 7. Stylesheet e tokens

`packages/styles/src/app-shell/app-shell.css` e `app-shell.tokens.json`.

| Token                                | Valor                                                | Porquê                                                                 |
| ------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `--slotted-app-shell-nav-size-sm`    | `var(--slotted-space-12)` × escala                   | a largura da coluna de navegação, por passo                            |
| `--slotted-app-shell-nav-size-md`    | composto do mesmo passo                              | idem                                                                    |
| `--slotted-app-shell-nav-size-lg`    | composto do mesmo passo                              | idem                                                                    |
| `--slotted-app-shell-rail-size`      | composto de `--slotted-control-height-lg`            | a calha é do tamanho de um alvo, e o alvo é a geometria de controlo     |
| `--slotted-app-shell-aside-size-*`   | como a navegação                                     | idem                                                                    |
| `--slotted-app-shell-surface`        | `var(--slotted-surface)`                             | o fundo do banner e da navegação                                        |
| `--slotted-app-shell-border-color`   | `var(--slotted-border-subtle)`                       | a linha entre as regiões                                                |
| `--slotted-app-shell-scrim`          | `var(--slotted-scrim)`                               | o véu do modo sobreposto                                                |

Nenhum token da família cai num literal fora das isenções da regra 1 de
`docs/token-foundation.md`. Nenhum valor é uma escala nova: as larguras compõem
a escala de espaço, a calha compõe a geometria de controlo.

Movimento: a coluna muda de largura e o painel sobreposto entra e sai. As duas
são mudanças que o olho tem de seguir, portanto as duas transicionam, com
`--slotted-duration-medium` e `--slotted-easing-standard` para a coluna e
`--slotted-easing-enter` / `--slotted-easing-exit` para o painel. Nenhuma é
infinita, portanto colapsam sob `prefers-reduced-motion` pela escala, sem regra
própria.

Ícone: o `nav-toggle` desenha uma máscara de glifo, e o par é
`--slotted-icon-panel-open` / `--slotted-icon-panel-close` — **dois passos
novos na escala**, de `lucide` `panel-left-open` e `panel-left-close`.

A marca desenha a região que o controlo move: uma moldura com uma barra de um
lado, e uma seta a dizer para onde o toque a manda. As duas marcas que o campo
usa foram ambas tentadas neste controlo e ambas foram lidas como erradas. Três
barras dizem "há aqui um menu" e não dizem qual nem para onde vai; a escala não
as tem, e é este o argumento para não as acrescentar. Um chevron duplo diz "até
ao fim", que é para o que `pagination` o desenha; um chevron simples diz "abre
aqui uma lista", que é para o que `select` o desenha. O par é um só desenho com
a seta virada, pela razão que faz de `eye` e `eye-off` um par, e é a marca que
Linear, Vercel e shadcn desenham no mesmo controlo.

A arte é sensível à direção — a barra está de um lado e a seta aponta ao longo
da linha —, portanto a família vira-a inteira onde a região não está no início
da linha: `navSide="end"`, um documento da direita para a esquerda, ou um dos
dois mas não os dois.

`forced-colors`: a família não pinta nada que o tema não alcance, exceto o véu,
que o tema já remapeia (`--slotted-scrim` → `Canvas`). Sem bloco próprio.

---

## 8. Integração — React

| Pergunta de `references/frameworks.md`                                | Resposta                                                                                                                                     |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| par controlado/não controlado e pedido com razão                      | `navOpen` / `defaultNavOpen` / `onNavOpenChange(open, reason, event)`, sobre `createControllable` de `@slotted/core/state`                    |
| defaults da aplicação numa vez                                        | `AppShellDefaultsProvider` e `useAppShellDefaults()`, no molde de `PageDefaultsProvider`                                                       |
| substituir o elemento de cada parte pública                           | `render` em `AppShell`, `AppShellBanner`, `AppShellNav`, `AppShellMain`, `AppShellAside`, `AppShellFooter`, `AppShellNavToggle`               |
| o handler do consumidor continua a correr                             | composto, nunca substituído: `onClick` do `nav-toggle`, `onKeyDown` da raiz                                                                   |
| alcançar o elemento nativo e a ação imperativa                        | `ref` em cada parte; `useAppShell()` devolve `{ open, setOpen, navMode, toggleId, navId, layer }` — `setOpen(next, reason)` é a ação imperativa |
| renderiza no servidor sem divergência                                 | `useId` para `navId` e `toggleId`; nenhuma leitura de layout durante o render; `data-nav-mode` só depois do efeito                             |
| todo o estado que o consumidor pode estilizar está no DOM             | `data-open`, `data-nav-mode`, `data-primary`, `data-nav-side`, `data-nav-size`, `data-collapsed-to`, `data-scroll`, `data-status` no painel   |
| o tipo de props de cada parte é o do elemento nativo, estendido       | `ComponentPropsWithRef<'header'>`, `<'nav'>`, `<'main'>`, `<'aside'>`, `<'footer'>`, `<'button'>`, `<'div'>`                                  |

## 9. Integração — Angular

| Pergunta de `references/frameworks.md`                                | Resposta                                                                                                                          |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| duas vias na forma que o ecossistema espera                           | `navOpen = model<boolean>()` e `navOpenChange` como `output<AppShellOpenChange>()` com a razão e o evento                          |
| formulários                                                           | **não**: a casca não é um controlo e não tem valor que um formulário submeta. Nenhum `ControlValueAccessor`.                       |
| defaults da aplicação numa vez                                        | `APP_SHELL_DEFAULTS` e `provideAppShellDefaults()`                                                                                 |
| um template alcança a instância                                       | `exportAs: 'slAppShell'`, e `slAppShellNav`, `slAppShellNavToggle` cada uma com o seu                                              |
| substituir conteúdo projetado, e mantê-lo preguiçoso                  | `ng-content` com seletor por parte; o corpo da navegação aceita `ng-template` com `NgTemplateOutlet` para conteúdo que tem de ser re-renderizado ao reabrir |
| correto com zoneless e `OnPush`                                       | `input()`, `model()`, `computed()` e `signal()` em toda a família; nenhum `markForCheck`                                           |
| tudo desmontado                                                       | `DestroyRef.onDestroy` liberta o `WidthGate`, a camada dispensável, o `FocusScope` e a raiz de portal                              |
| um atributo estático escrito pelo consumidor sobrevive                | `HostAttributeToken` para `aria-label` no `nav`, `id` no `nav` e no `nav-toggle`                                                   |
| um ponto de entrada que outros dependem continua uma classe           | `@slotted/angular/app-shell`; importa `@slotted/angular/container` e nada por caminho privado                                      |

O `ControlValueAccessor` é a assimetria que `references/frameworks.md` manda
registar em vez de nivelar: o Angular não perde nada por não o ter aqui, porque
não há valor de formulário nenhum a perder.

---

## 10. Recusas, com o que as substitui

| Recusa                              | O que fica no lugar                                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| segundo estado aberto para o `aside` | `drawer` com `mode="inline"` e `side="end"` dentro da região `aside`, que já tem `extent`, limites e teclado |
| duração e easing por instância      | a escala de movimento, que é a única que colapsa sob `prefers-reduced-motion`                               |
| padding do conteúdo                 | `page` com `inset` e `width`, que já os passa ao `container`                                                |
| navegação inferior em ecrã pequeno  | família `[Specialized]` própria, por `docs/component-features.md` §7; a casca dá-lhe a região `footer`      |
| itens, grupos e seleção por rota    | `side-navigation`, onda 8                                                                                   |
| marca, busca, notificações, conta   | `top-navigation`, onda 8; o que é servido lá dentro já existe                                               |
| migalhas                            | `page-header`, que já tem as partes `breadcrumbs` e `nav`                                                   |
| sessão, tenant, permissões          | nada: são conteúdo projetado, e a recusa cumpre-se não tendo prop sobre o assunto                           |
| regra `@media print`                | o consumidor decide o que imprime; a casca não desenha uma regra que ele não pediu                          |

---

## 11. Custos escritos

1. **`scroll="document"` não cola o banner.** Um banner colado aí obrigaria a
   casca a escrever `--slotted-page-sticky-top`, que `page-header` é dono de
   escrever, e as duas escritas apagar-se-iam. Quem quer banner permanente usa
   `scroll="content"`, que é a omissão e o que todas as fontes pesquisadas
   fazem.
2. **`overlayAt` é um literal em dois sítios.** O stylesheet não pode ler um
   token numa condição `@container`. O contrato declara o número e um teste de
   estilo compara-o à condição, que é o que impede a deriva.
3. **`collapsedTo="rail"` deixa a região no separador quando fechada.** É
   deliberado: uma calha com seis destinos é navegável, e uma calha que sai do
   separador não é uma calha. Quem quer a região fora do caminho usa
   `collapsedTo="hidden"`.
4. **A razão `resize` alarga um vocabulário fechado.** Toda a família que já
   declara um `stateModel` passa a poder receber uma razão que não espera. O
   custo é o mesmo que `scroll` teve na onda 7 e a mitigação é a mesma: nenhuma
   família emite uma razão que não declare no contrato, e o teste de contrato
   recusa uma razão não declarada.
5. **`--slotted-icon-panel-open` e `--slotted-icon-panel-close` são dois passos
   novos numa escala partilhada.** Um par que só esta família desenha hoje;
   `side-navigation` e `top-navigation` desenham o mesmo na onda 8. A escala
   ganha a primeira marca que representa uma *região do ecrã* em vez de uma
   ação, um valor ou um estado, e por isso é também a primeira que a família
   que a desenha vira por lado e por direção.
6. **`canvas="inset"` é a omissão e muda o que uma aplicação existente vê.**
   Nenhuma aplicação depende dela ainda, porque a família é nova. O custo é que
   uma casca dentro de uma página já rebaixada mostra um cartão sobre um fundo
   da mesma cor; `flush` é a resposta e está no contrato.
