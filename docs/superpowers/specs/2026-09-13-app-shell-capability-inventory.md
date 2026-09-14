# Inventário de capacidades — `app-shell`

Produzido antes de qualquer desenho ou código, como
`.claude/skills/component/references/capability.md` exige. A família é nova:
`specs/components/app-shell/` não existe.

`docs/build-order.md` lista `app-shell` na onda 7 sem parágrafo de escopo. O
escopo deriva de `docs/component-features.md` §15, _App Shell `[Core]`_, e é
escrito em `docs/build-order.md` como parte deste trabalho, como
`docs/build-briefing.md` manda:

- skip link, header, side nav/rail, main, breadcrumbs/contexto e regiões de
  overlay/toast;
- navegação responsiva, sessão, tenant/workspace e permissões sem acoplar
  autenticação ao design system;
- persistência de sidebar e densidade são preferência do produto; landmarks e
  ordem de foco permanecem corretos.

A família é a moldura exterior de uma rota: as regiões que não mudam quando o
conteúdo muda. `page` é o que vive dentro da região `main`, e a fronteira entre
as duas é a única pergunta de anatomia que este inventário deve responder duas
vezes.

Fontes lidas em 13 de setembro de 2026.

---

## 1. Pesquisadas

Nove fontes, escolhidas para discordarem sobre as três perguntas que esta
família deve responder: quem é dono do rolador, o que a região de navegação
deixa para trás quando encolhe, e quem decide que a largura mudou.

| Implementação            | Chama-lhe                                                                                    | Lida em                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Mantine 7                | `AppShell`, `.Header`, `.Navbar`, `.Aside`, `.Footer`, `.Main`, `.Section`                   | <https://mantine.dev/core/app-shell/> e <https://mantine.dev/llms/core-app-shell.md> |
| PatternFly 6             | `Page`, `Masthead`, `PageSidebar`, `PageSidebarBody`, `PageSection`, `PageToggleButton`      | <https://www.patternfly.org/components/page> e `/react-demos`                 |
| Vaadin 24                | `AppLayout` com as vagas `navbar`, `navbar touch-optimized`, `drawer`, e `DrawerToggle`      | <https://vaadin.com/docs/latest/components/app-layout>                        |
| Carbon (IBM)             | `UI Shell`: `Header`, `SideNav`, `HeaderMenuButton`, `SkipToContent`, `HeaderGlobalBar`      | <https://carbondesignsystem.com/components/UI-shell-header/usage/>            |
| Ant Design 6             | `Layout`, `Layout.Header`, `Layout.Sider`, `Layout.Content`, `Layout.Footer`                 | <https://ant.design/components/layout>                                        |
| Primer (GitHub)          | `PageLayout`, `.Header`, `.Content`, `.Pane`, `.Footer`                                      | <https://primer.style/components/page-layout>                                 |
| UI5 Web Components 2.x   | `ui5-shellbar`                                                                                | <https://ui5.github.io/webcomponents/components/fiori/ShellBar/>              |
| WAI-ARIA APG             | Landmark Regions                                                                              | <https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/>                 |
| Sirius UI (revisor)      | não existe                                                                                    | `~/dev/ASTI/libs/sirius-ui/src/components/` — tem `page`, `page-header`, `section`, `drawer`; não tem casca de aplicação nem navegação lateral |

Atlassian `@atlaskit/page-layout` foi lida e está **depreciada** em favor do
`navigation-system`; nenhuma das duas páginas serve API pública suficiente para
ser citada, e por isso não conta como fonte. O facto é registado porque a
ausência de um `PageLayout` mantido na Atlassian é, ela própria, um dado: a
casca deixou de ser um componente de layout e passou a ser um sistema de
navegação, que é a divisão que este inventário também toma.

Não há padrão APG para casca de aplicação. O padrão aplicável é Landmark
Regions, mais o Disclosure para o controlo que abre a região de navegação, e o
modelo de camada dispensável de `@slotted/core/dismissable-layer` para o modo
sobreposto.

### O que cada fonte decide

- **Dono do rolador.** Mantine `mode: 'fixed' | 'static'`: em `fixed` as
  secções são `position: fixed` e o `Main` recebe `padding` igual à altura e
  largura delas. Vaadin: o conteúdo rola no documento e a barra superior
  atravessa a barra de rolagem, salvo se a aplicação declarar `height: 100%`.
  PatternFly: a região `main` é o rolador. Ant: nenhum dos dois — a `Sider` é
  `position: fixed` só quando a aplicação o escreve à mão.
- **O que a navegação deixa quando encolhe.** Ant `collapsedWidth` com
  omissão `80` — uma calha; `collapsedWidth={0}` faz aparecer um gatilho
  especial. Carbon: `SideNav` com `rail`, que abre por `hover` e por foco.
  Mantine: nada — a `Navbar` desaparece. PatternFly: desaparece. Vaadin: a
  gaveta passa de área fixa a painel sobreposto.
- **Quem decide que a largura mudou.** Mantine e Ant: media query de _viewport_
  (`breakpoint: 'sm'`, `breakpoint: 'lg'`). Vaadin: media query de _viewport_.
  PatternFly: `ResizeObserver` sobre a própria página, com `getBreakpoint(width)`
  substituível pelo consumidor. Carbon: media query. Nenhuma responde à própria
  largura em CSS.
- **Estado da navegação.** Mantine `navbar={{ collapsed: { mobile, desktop } }}`
  — **dois booleanos**, um por faixa, e nenhum deles se move quando a largura
  muda. PatternFly `isManagedSidebar` + `defaultManagedSidebarIsOpen` ou o par
  `isSidebarOpen`/`onSidebarToggle`. Ant `collapsed`/`defaultCollapsed`/
  `onCollapse(collapsed, type)`, onde `type` é `'clickTrigger' | 'responsive'` —
  **a única fonte que diz porquê**. Vaadin `drawerOpened`, um só, fechado pelo
  componente ao entrar em modo sobreposto.
- **Skip link.** Carbon `SkipToContent` como primeiro elemento focável.
  PatternFly `skipToContent` com `mainContainerId`. Mantine, Ant, Primer e
  Vaadin: nenhum.
- **Painel secundário.** Mantine `Aside` com `width`, `breakpoint`, `collapsed`.
  Primer `PageLayout.Pane` com `width`, `minWidth`, `resizable`, `currentWidth`,
  `onResizeEnd`, `position`, `aria-label`. PatternFly aloja um `Drawer`
  (`drawerDefaultSize`, `drawerMinSize`, `drawerMaxSize`). Ant: nenhum.
- **Barra inferior de navegação em ecrã pequeno.** Vaadin `slot="navbar
  touch-optimized"`. Nenhuma outra fonte.
- **Landmarks.** Carbon e PatternFly emitem `header`, `nav`, `main` e rotulam-nos.
  Mantine emite `header`, `nav`, `main`, `aside`, `footer` por omissão. Ant emite
  `<header>`, `<aside>`, `<main>`, `<footer>` sem rótulos. Primer emite `header`,
  `main`, `aside`, `footer` e exige `aria-label` no `Pane` quando ele transborda.

---

## 2. Requisitos de base

Capacidades que duas ou mais fontes entregam. Vocabulário de veredito:
`adotar`, `adaptar`, `recusar`, `diferir para <família>`.

| Capacidade                                          | Quem entrega                                              | Veredito                       | Razão                                                                                                                                                                                                                                            |
| --------------------------------------------------- | --------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Regiões banner, navegação, conteúdo e rodapé        | as sete fontes de layout                                  | adotar                         | Partes `banner`, `nav`, `main`, `footer`, em `<header>`, `<nav>`, `<main>` e `<footer>` no contexto do `body` — `banner`, `navigation`, `main` e `contentinfo` sem uma linha de ARIA, pela tabela de elementos de secção do APG.                   |
| Painel secundário                                   | Mantine `Aside`, Primer `Pane`, PatternFly `Drawer`       | adaptar                        | Parte `aside` em `<aside>`. A casca dá a região e a largura; o que abre, fecha e redimensiona lá dentro é `drawer` com `mode="inline"` e `side="end"`, que já tem `extent`, limites e teclado. Duas famílias com um `open` cada, não uma com dois. |
| Estado aberto/fechado da navegação                  | as cinco fontes com navegação                             | adotar                         | Capacidade `open` com par controlado/não controlado e pedido com razão. É o único valor mutável da família.                                                                                                                                       |
| Calha (navegação encolhida que continua visível)    | Ant `collapsedWidth`, Carbon `rail`                       | adotar                         | Eixo `collapsedTo` com `rail` e `hidden`. Sem ele, `open` é "a navegação existe" em vez de "a navegação está aberta", e uma aplicação com seis destinos perde os seis ao encolher.                                                                 |
| Modo sobreposto em largura estreita                 | Vaadin, PatternFly, Mantine, Ant, Carbon                  | adotar                         | Eixo `nav` com `inline`, `overlay` e `auto`. Em `overlay` a região é uma camada dispensável composta de `@slotted/core`: `presence`, `dismissable-layer`, `focus`, sem reescrever nenhuma delas.                                                  |
| Gatilho que abre a navegação                        | Vaadin `DrawerToggle`, PatternFly `PageToggleButton`, Carbon `HeaderMenuButton` | adotar    | Parte `nav-toggle`, com `aria-expanded`, `aria-controls` e nome acessível das mensagens da família. Fica dentro do `banner` por omissão e pode ser renderizado em qualquer lado, porque recebe a ligação por contexto.                            |
| Skip link                                           | Carbon, PatternFly                                        | adotar                         | Parte `skip`. Um `<a>` por região com alvo, gerado a partir das regiões que existem, primeiro elemento focável do documento, visível só quando focado.                                                                                            |
| Largura da navegação e do painel secundário         | Mantine `width`, Ant `width`, Primer `width`              | adaptar                        | Eixo `navSize` com `sm`, `md`, `lg` sobre tokens da família, em vez de um número. Um pixel arbitrário no contrato é uma escala paralela, que `docs/token-foundation.md` recusa.                                                                   |
| Fechar ao navegar                                   | Vaadin, PatternFly (`isManagedSidebar`)                   | adotar                         | Eixo `closeOnNavigate`, ativo só em modo sobreposto: um clique que aterra num `<a href>` dentro da região pede `open: false` com a razão `select`.                                                                                                |
| Rodapé da aplicação                                 | Mantine `Footer`, Ant `Layout.Footer`, Primer `Footer`    | adotar                         | Parte `footer`, `contentinfo`. Distinta do rodapé de `page`, que é a barra de ações da tarefa dentro do `main`; a diferença está escrita em §6.                                                                                                   |
| Dono do rolador                                     | Mantine `mode`, Vaadin (documento), PatternFly (`main`)   | adotar como eixo               | Eixo `scroll` com `content` e `document`. Em `content` a casca ocupa o viewport e só o `main` rola; em `document` a casca cresce com o conteúdo. As duas respostas da pesquisa são as duas situações reais.                                        |
| Qual região alcança o canto                         | Mantine `layout: 'default' \| 'alt'`, Vaadin `primarySection` | adotar                      | Eixo `primary` com `banner` e `nav`. Em `banner` a barra superior atravessa toda a largura e a navegação começa por baixo dela; em `nav` a navegação ocupa toda a altura e a barra começa ao lado. Duas fontes entregam-no e a escolha muda onde a marca vive.   |
| Linha entre as regiões                              | Mantine `withBorder`, Ant, Carbon                         | adotar                         | Eixo `dividers` booleano. Omissão `true`: cada região desenha a sua linha no lado adjacente ao `main`, que é a regra do Mantine e a única que não desenha a mesma linha duas vezes.                                                                |
| `z-index` das regiões                               | Mantine `zIndex`, Ant                                     | adaptar                        | `--slotted-z-index-sticky` da escala de empilhamento. Um número no contrato seria uma segunda escala.                                                                                                                                             |
| Duração das transições                              | Mantine `transitionDuration`, `transitionTimingFunction`  | recusar                        | A escala de movimento é a resposta, e é ela que colapsa sob `prefers-reduced-motion`. Um número por instância sai da media query que a colapsa, que é o defeito que `packages/styles/src/motion.test.mjs` recusa.                                 |
| Padding do conteúdo                                 | Mantine `padding`, PatternFly `padding`                   | diferir para `page`            | O que vive no `main` é uma `page`, que já tem `inset` e `width` e passa os dois ao `container` que renderiza. A casca a pôr padding no `main` seria a segunda resposta à mesma pergunta.                                                           |
| Limite de medida do conteúdo                        | PatternFly `isWidthLimited`, Primer                       | diferir para `container`        | A medida pertence a `container` e só a ele, por `docs/build-briefing.md`.                                                                                                                                                                         |
| Navegação inferior em ecrã pequeno                  | Vaadin `navbar touch-optimized`                           | recusar                        | Uma fonte só, e `docs/component-features.md` §7 já nomeia _Navigation Rail / Bottom Navigation_ como família `[Specialized]` própria. A casca dá-lhe a região `footer`, que em largura estreita é onde ela assenta.                                |
| Itens de navegação, grupos, seleção por rota        | Carbon `SideNav`, Vaadin `SideNav`, Ant `Menu`            | diferir para `side-navigation` | `docs/component-features.md` §7 lista _Side Navigation_ como família `[Extended]`, da onda 8. A casca é dona da região, da sua largura, do seu landmark e do seu estado aberto; a lista de destinos não é dela.                                    |
| Barra superior com marca, busca, notificações, conta | UI5 `ui5-shellbar`, Carbon `HeaderGlobalBar`              | diferir para `top-navigation`  | `docs/component-features.md` §7 lista _Top Navigation / App Bar_ como família `[Extended]`. A casca dá a região `banner` e a ordem de foco; o que é servido dentro dela — `toolbar`, `menu`, `avatar` — já existe.                                 |
| Migalhas e contexto da rota                         | PatternFly `breadcrumb`, `PageBreadcrumb`                 | diferir para `page-header`     | `page-header` já tem as partes `breadcrumbs` e `nav`, e as migalhas pertencem à página e não à casca: mudam a cada rota, e a casca é o que não muda. PatternFly põe-nas na `Page` e paga-o com `breadcrumbProps`, um objeto de props a atravessar duas camadas. |
| Região de overlay e de toast                        | o parágrafo de escopo §15                                 | adotar                         | Parte `layer`, publicada no contexto da família. `portal` passa a poder ancorar aí em vez de no `body`, e `toast` com `attach="viewport"` recebe uma região que é a da aplicação e não a do documento.                                             |
| Sessão, tenant/workspace, permissões                | o parágrafo de escopo §15                                 | recusar                        | Nenhuma das duas linhas é uma capacidade: são conteúdo que o consumidor projeta no `banner` e na `nav`. O requisito é negativo — a casca não importa nada de autenticação — e cumpre-se não tendo prop nenhuma sobre o assunto.                    |
| Persistência da preferência de sidebar              | o parágrafo de escopo §15, Ant `onCollapse(c, type)`      | adaptar                        | A persistência é do produto. O que a casca deve é a razão que a torna escrevível: ver §3, _razão `resize`_.                                                                                                                                       |
| Defaults da aplicação numa vez                      | Mantine (não tem), Ant (não tem)                          | adotar                         | `provideAppShellDefaults` no Angular e um provider no React, pela tabela de integração de `references/frameworks.md`. Nenhuma fonte pesquisada tem, e uma casca é exatamente o sítio onde uma aplicação declara uma vez.                           |

---

## 3. Diferenciadores

| Diferenciador                                   | Porquê só aqui                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A casca responde à **própria largura**           | Mantine, Ant, Vaadin e Carbon leem o _viewport_; PatternFly lê a própria largura com `ResizeObserver` e JavaScript. `container-type: inline-size` na raiz dá a mesma resposta sem script, e dá-a também onde o viewport mente: uma casca dentro de um `splitter`, de um `iframe` de pré-visualização ou de um palco do Storybook. É também a resposta ao zoom de 400%, onde 1280 px de janela são 320 px de CSS. |
| Razão `resize` no pedido de mudança              | Ant é a única fonte que distingue `'clickTrigger'` de `'responsive'`, e fá-lo com uma string própria fora de qualquer vocabulário. O valor está no que ela torna escrevível: `if (reason !== 'resize') persist(next)` é a linha que guarda a preferência do leitor sem a apagar quando a janela encolhe. Mantine evita o problema com dois booleanos, um por faixa, e paga-o com dois estados para uma região. |
| Nenhuma medição para desenhar a casca            | Mantine em `mode="fixed"` escreve `padding` no `Main` igual à altura e à largura das secções, e tem de saber ambas; PatternFly corre um `ResizeObserver` sobre a página inteira. A casca é uma grelha: as faixas dimensionam-se sozinhas e o `main` é uma célula com `min-block-size: 0`. O único observador que a família cria não desenha nada — decide se o teclado e o foco estão em modo sobreposto, que é uma pergunta de comportamento e não de layout. Zero propriedades de runtime, e é por isso que a família não acrescenta linha nenhuma a `packages/styles/src/runtime-properties.mjs`. |
| A ponte de `--slotted-page-sticky-top` sai de graça | `docs/build-briefing.md` prende esta família à regra do `page`. Com `scroll="content"` a ponte não é precisa: o rolador é o `main`, o banner está fora dele, e um `page-header` lá dentro já cola ao topo do rolador — por baixo do banner, sem ninguém somar nada. O custo está escrito no contrato: com `scroll="document"` o banner acompanha o documento em vez de ficar colado, porque um banner colado aí obrigaria a casca a reescrever uma propriedade que `page-header` é dono de escrever. |
| O conteúdo tem um plano                          | Todas as sete fontes de layout pintam as regiões de branco e o conteúdo de cinzento, e separam-nas com uma linha. Na foundation as duas superfícies de página estão a dois por cento uma da outra no esquema claro, portanto toda a fronteira ficaria a cargo de um fio de um pixel. `canvas="inset"` inverte os planos — a moldura recebe o fundo rebaixado e o conteúdo é um cartão com raio, aresta e elevação — e a sarjeta passa a fazer a separação que a linha fazia. `flush` mantém o arranjo pesquisado para quem o quer. |
| Três esquemas, três densidades e RTL numa casca  | As regiões são grelha com propriedades lógicas: `navSide="start"` num documento `dir="rtl"` é a mesma casca espelhada, e não uma casca com a navegação à direita. Carbon e Ant desenham `left` e `right` literais; Mantine espelha só o `Navbar`.                                                                                                                                       |
| A calha não perde o foco nem a posição de rolagem | A calha é a mesma região com outra largura, não outro elemento: o `<nav>` não é remontado, o que mantém o foco onde estava e a lista onde estava. Carbon remonta o `SideNav` entre `rail` e expandido.                                                                                                                                                                                 |

---

## 4. Lacunas

| Lacuna                                                              | O que nenhuma fonte faz bem                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A navegação fechada continua no separador                            | Mantine e Ant deixam a `Navbar` fechada no DOM com `width: 0` ou fora do ecrã; o `Tab` ainda a atravessa. A região fechada em `collapsedTo="hidden"` sai do DOM, e a região sobreposta fechada recebe `inert`.                                                                  |
| O conteúdo atrás de uma navegação sobreposta continua operável       | Vaadin e PatternFly desenham o véu e não inertizam o que está por baixo. `@slotted/core/focus` contém o foco e o `main` recebe `inert` enquanto a camada é modal.                                                                                                               |
| O alvo do skip link não é focável                                    | Um `<main>` sem `tabindex="-1"` não recebe foco em Safari nem em Firefox: o salto move o _scroll_ e deixa o foco no link. O `main` da casca declara `tabindex="-1"`, que é o que faz o skip link funcionar em vez de parecer funcionar.                                         |
| `100vh` em navegador móvel                                           | Nenhuma das fontes usa `100dvh`. Com `scroll="content"` e `100vh`, a última linha do conteúdo fica debaixo da barra do navegador enquanto ela está aberta. A casca usa `100dvh` com `100vh` como valor anterior na mesma declaração, para o navegador que não conhece a unidade. |
| A navegação com mais itens do que altura                             | Ant e Mantine deixam a `Sider` transbordar. A região `nav` da casca é uma coluna com `min-block-size: 0` e `overflow: auto` no seu corpo, e a marca no topo e o rodapé da navegação ficam fixos nas extremidades.                                                               |
| Rótulo longo traduzido numa calha                                    | Uma calha de 56 px com `Administração de utilizadores` ou um destino em alemão: nenhuma fonte diz o que acontece. A calha esconde o rótulo e o destino mantém o seu nome acessível, que é o que o leitor de ecrã lê e o `tooltip` mostra — decisão de `side-navigation`, e a casca só garante que a largura da calha é um token e não um número. |
| Duas regiões de navegação no mesmo documento                         | Uma casca com navegação lateral e barra superior tem dois `navigation`, e o APG exige rótulo único em cada. Carbon e PatternFly rotulam; Mantine e Ant não. A casca rotula a sua própria região a partir das mensagens da família, e o rótulo é substituível.                    |
| Impressão                                                            | Nenhuma fonte tem regra `@media print`. Uma casca com regiões fixas imprime o banner em cada página ou tapa a primeira linha. Fora do âmbito desta família e registado aqui: é o consumidor que decide o que imprime, e a casca não desenha uma regra que ele não pediu.        |

---

## 5. O que este inventário acrescenta ao parágrafo de escopo

O parágrafo de §15 tem três linhas e é um piso. O que a família entrega para
além dele, e que sai da pesquisa e não do parágrafo:

1. **A calha**, e o eixo `collapsedTo` que a nomeia ao lado de `hidden`.
2. **Os três modos da região de navegação** — `inline`, `overlay`, `auto` — com
   a camada dispensável composta de `@slotted/core` e não reescrita.
3. **A razão `resize`** no vocabulário fechado de
   `specs/contract.schema.mjs`, que é a única adição a ficheiro partilhado que
   esta família pede.
4. **O eixo `primary`**, que decide qual das duas regiões alcança o canto do
   ecrã.
5. **A região `layer`**, que dá a `portal` e a `toast` uma raiz que é a da
   aplicação.
6. **`closeOnNavigate`**, que é a diferença entre uma casca usável num telemóvel
   e uma que obriga a dois toques por destino.
7. **O eixo `canvas`**, que decide se o conteúdo é um cartão sobre a moldura ou
   uma superfície aresta a aresta. Nenhuma fonte pesquisada o tem como eixo:
   todas entregam só o segundo arranjo.
8. **As partes `brand` e `actions`** do banner, que dão à casca uma anatomia de
   barra superior sem lhe dar conteúdo nenhum.

---

## 6. A fronteira com `page`

A pergunta que esta família responde duas vezes se não for escrita uma vez.

| Pertence a `app-shell`                                       | Pertence a `page`                                                |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `banner`: o que não muda entre rotas — marca, busca, conta   | `page-header`: título, migalhas, ações da rota atual             |
| `nav`: a região da navegação primária, e o seu estado        | nada                                                             |
| `main`: o landmark e a coluna que rola                       | a raiz da `page`, que é `landmark="none"` dentro da casca        |
| `footer`: `contentinfo` da aplicação                         | `footer`: a barra de ações que fecha a tarefa, dentro do `main`  |
| `aside`: a região do painel secundário                       | nada                                                             |
| a grelha e quem rola                                         | `--slotted-page-sticky-top`, escrito no rolador que a casca dá  |

A composição que as duas famílias assumem é uma `page` com `scroll="ancestor"`
e `landmark="none"` dentro de uma casca com `scroll="content"`: a casca ocupa o
viewport, o `main` é o rolador, e a página vive dentro dele. O caso inverso —
`scroll="document"` na casca e `scroll="ancestor"` na página — é o documento a
rolar inteiro, e as duas continuam a compor. O que não compõe é `scroll="self"`
na página dentro de `scroll="content"` na casca: dois roladores encaixados, em
que o cabeçalho da página deixa de encolher porque nada rola no que o contém.
O contrato regista-o como custo.

---

## 7. Revisão — 14 de setembro de 2026

O gate de release da primeira passagem foi recusado sobre a página de
referência, e a leitura levou de volta ao inventário. Três vereditos mudam; a
razão de cada um está em `2026-09-14-app-shell-redesign-design.md`.

### Requisitos de base — o que muda

| Capacidade                            | Quem entrega                                            | Veredito anterior         | Veredito               | Razão                                                                                                                      |
| ------------------------------------- | ------------------------------------------------------- | ------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Painel secundário que abre e fecha    | Mantine `Aside.collapsed`, PatternFly `Drawer isExpanded`, Primer `Pane` (responsivo) | diferir para `drawer` | **adotar**              | a coluna tem largura fixa por eixo; um `drawer` fechado lá dentro deixa a coluna vazia. Segundo modelo de estado, `open.aside`, com `asideMode` sobre o mesmo `overlayAt` |
| Zona central da barra                 | Carbon `HeaderName`/`HeaderNavigation`/`HeaderGlobalBar`, UI5 `ui5-shellbar` (`searchField`, `startButton`, `profile`), PatternFly `MastheadContent` | não inventariada | **adotar**              | parte `centre` entre `brand` e `actions`; o que vai lá dentro continua do consumidor                                       |
| Cabeçalho, corpo e rodapé do painel   | PatternFly `DrawerHead`/`DrawerActions`/`DrawerCloseButton`, Primer `Pane` com `aria-label`, Mantine `Aside.Section` | não inventariada | **adotar**              | a mesma disciplina de `nav-header`/`nav-body`/`nav-footer`; sem ela as ações saem do ecrã com mais conteúdo do que altura |
| Controlo Disclosure do painel         | PatternFly `DrawerCloseButton`, UI5 `ui5-shellbar` (`showNotifications`) | não inventariada     | **adotar**              | `aside-toggle`, simétrico de `nav-toggle`, ligado pelo contexto                                                            |

### Diferenciadores — o que se acrescenta

| Capacidade                                   | Razão                                                                                                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Geometria de fila publicada como token       | `--slotted-app-shell-row-height`, `-row-font-size`, `-row-line-height` ao lado de `-row-inset`, `-row-mark`, `-row-gap`. Nenhuma fonte publica a geometria da fila; cada uma desenha a sua e o consumidor que traz a sua própria lista não tem a que alinhar |
| Duas regiões com o mesmo par de modos        | navegação e painel resolvem `inline`/`overlay`/`auto` na mesma largura e com a mesma composição de `packages/core`                |

### Lacunas — o que se acrescenta

| Lacuna                                                   | Resposta                                                                                                      |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Painel e navegação abertos ao mesmo tempo em sobreposição | só com os dois modos forçados; a pilha de `dismissable-layer` decide quem responde a `Escape`. Custo escrito  |
| Painel fechado numa casca sem `asideOpen` declarado       | a omissão é aberto; quem nunca passa o valor vê o que via                                                     |
