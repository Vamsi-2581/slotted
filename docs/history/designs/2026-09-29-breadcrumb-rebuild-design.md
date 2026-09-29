# Breadcrumb — reconstrução: colapso por largura e crumb seletor

Reconstrução de `breadcrumb` a partir do dossiê ReUI
(`2026-09-29-breadcrumb-reui-dossier.md`). Herda o desenho de
`2026-09-03-breadcrumb-pagination-stepper-design.md` §2; este documento
regista apenas o que muda e porquê.

## 1. Inventário

### 1.1 Surveyed

| Implementação | Nome | Onde foi lido | O que informa |
| --- | --- | --- | --- |
| ReUI / shadcn/ui (Base UI, estilo `nova`) | `Breadcrumb` | `https://reui.io/r/c-breadcrumb-{1..15}.json`, `https://ui.shadcn.com/r/styles/base-nova/breadcrumb.json`, blocos Pro `navbar-1/2/3/9`, `app-shell-7`, `dashboard-3` (specimens em `tools/harness/out/specimen/`) | medidas, estados, crumb seletor, compactação por largura, glifo e contagem no crumb |
| Fluent UI v9 | `Breadcrumb`, `BreadcrumbButton`, `partitionBreadcrumbItems` | `microsoft/fluentui` › `react-breadcrumb/library/src/utils/partitionBreadcrumbItems.ts` e `stories/.../BreadcrumbWithOverflow.stories.tsx` | colapso por largura (`Overflow`, `OverflowItem`, prioridade do último), crumb `button` com `current` |
| React Aria | `Breadcrumbs`, `Breadcrumb` | `https://react-spectrum.adobe.com/react-aria/Breadcrumbs.html` | `data-current`, `isDisabled`, `onAction` |
| MUI, Carbon | `Breadcrumbs` | inventário de 2026-09-03 | `maxItems`, `itemsBeforeCollapse`, `itemsAfterCollapse`; tamanho |
| WAI-ARIA APG | Breadcrumb Pattern | `https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/` | landmark, rótulo, `aria-current` |

Specimen de referência para os passos 7 e 8: `c-breadcrumb-1` e
`c-breadcrumb-2`, claro e escuro, `--states` no link e no gatilho.

### 1.2 Table stakes

As linhas do inventário de 2026-09-03 mantêm-se. Linhas novas ou alteradas:

| Capacidade | Quem publica | Veredicto | Motivo |
| --- | --- | --- | --- |
| Colapso quando a trilha não cabe na largura | Fluent (`Overflow`), ReUI (`navbar-1`, `dashboard-3` a 375px) | adapt | Os crumbs do meio dobram para o `ellipsis` que já existe e que expande no lugar. O Fluent dobra para um menu; o ReUI esconde o rótulo e deixa o link sem nome acessível. |
| Crumb que é um `button` | Fluent (`BreadcrumbButton`), ReUI (`navbar-3`, `app-shell-7`, gatilho de menu) | adapt | Parte nova `trigger`, um `button` com o aspeto do crumb e um chevron final; `current` escreve `aria-current="page"`. |
| Glifo, avatar ou contagem no crumb | ReUI (`c-breadcrumb-5`, `-7`, `-11`), Fluent (`icon` no `BreadcrumbButton`) | adapt | Conteúdo do consumidor; o stylesheet dá 6px e o alinhamento à linha ao `icon` e ao `badge` filhos. |
| Crumb desativado | React Aria | decline | Uma implementação só. Um crumb que não navega é um `page`. |

### 1.3 Differentiators

- O crumb atual continua `aria-current="page"` quando é um seletor. No ReUI o gatilho de "Production" (`navbar-3`) não o tem.
- O colapso por largura mantém o nome acessível de cada crumb escondido: `hidden` tira o crumb da árvore inteiro, e o `ellipsis` diz quantos esconde. O ReUI a 375px deixa links com só um `svg aria-hidden`.
- Uma mecânica de colapso para contagem e largura: os dois dobram para o mesmo controlo, com o mesmo estado `expanded` e o mesmo destino de foco.
- Três esquemas, três densidades e rtl, lidos de tokens (dossiê, secção 7).

### 1.4 Gaps

- Uma trilha cujos crumbs fixos (`itemsBeforeCollapse` e `itemsAfterCollapse`) já não cabem: quebra linha e o crumb mais largo trunca. Nenhuma implementação estudada responde a este caso de outra forma.
- Uma trilha expandida pelo leitor numa coluna estreita quebra linha e não volta a dobrar: a expansão é uma escolha do leitor, e a largura não a desfaz.

### 1.5 Delta face ao que existe

Existe: `root`, `list`, `item`, `link`, `page`, `separator`, `ellipsis`;
colapso por contagem; `expanded` controlado e não controlado; defaults.

Entra: parte `trigger`; eixo `overflow` (`collapse` | `wrap`, por omissão
`collapse`); estado `open` no `trigger`; cenários `switcher` e `overflow`.

Não sai nada.

## 2. APG — Breadcrumb Pattern

Fonte: `https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/`. O padrão não
define teclado próprio.

| Requisito | Estado | Evidência |
| --- | --- | --- |
| Trilha dentro de um landmark `navigation` | pass | `nav` na raiz, `contract.json` › `rootRole` |
| Landmark com nome por `aria-label` ou `aria-labelledby` | pass | `label`, por omissão "Breadcrumb", defaults nos dois bindings |
| Link para a página atual com `aria-current="page"`; opcional se não for link | pass; o `trigger` com `current` escreve `aria-current="page"` num `button` | teste novo nos dois bindings |
| Separadores fora da árvore de acessibilidade | pass | `separator` com `aria-hidden` |
| Tab passa pelos links | pass; passa também pelo `trigger` e pelo `ellipsis` | `contract.json` › `keyboard` |

O teclado do `trigger` pertence a `menu` (Enter, Space e ArrowDown abrem;
foco no primeiro item; Escape devolve o foco ao gatilho). A trilha não
acrescenta teclas.

## 3. Decisões

### 3.1 `trigger`

Um `button` dentro do `item`, com a cor, o sublinhado e o foco do `link`, e
um glifo `chevron-down` final desenhado pelo binding. Com `current` escreve
`aria-current="page"` e assume o peso e a cor da `page`.

O menu é composto pelo consumidor: em React,
`<MenuTrigger render={(props) => <BreadcrumbTrigger {...props} current>…</BreadcrumbTrigger>} />`;
em Angular, `<button slBreadcrumbTrigger current [slMenuTriggerFor]="menu">`.
O `SlMenuTrigger` escreve `data-part` a `null`; o `SlBreadcrumbTrigger`
repõe `data-part="trigger"` após a primeira deteção de alterações, pela regra
de `docs/build-briefing.md`.

Uma parte em vez de um `render` do `link` como `button`: um `link` é um
`a`, e um `a` sem `href` não é focável. Um `button` com o nome de `link` seria
uma parte com duas semânticas.

`open` é o `data-open` que o `menu` escreve no gatilho; o stylesheet dá-lhe o
aspeto do `active`.

### 3.2 Colapso por largura

`overflow="collapse"` (por omissão): com a trilha recolhida, os bindings
medem a lista com `createCollapse` de `@slotted/core/overflow`. As unidades são
os `item` visíveis; só os do meio (fora de `itemsBeforeCollapse` e
`itemsAfterCollapse`) dobram, do mais próximo da raiz para o mais próximo da
página. A ordem é o `rank` igual ao índice, e o conjunto escondido fica
contíguo ao `ellipsis`. O `ellipsis` é sempre renderizado quando a trilha tem
mais crumbs do que os fixos, com `hidden` enquanto nada dobra. `triggerAlways`
é verdadeiro quando o colapso por contagem já esconde crumbs.

Com o colapso por contagem ativo, os crumbs escondidos pelo binding ficam fora
das unidades medidas. Um único escritor por atributo: o binding escreve
`hidden` nos crumbs da contagem, e `createCollapse` nos da largura.

`overflow="wrap"` mantém o comportamento anterior: só contagem, quebra de
linha e truncagem.

Expandida (`expanded`), a trilha destrói a medição e mostra tudo. A largura
não desfaz a escolha do leitor: um `resize` não é um pedido de mudança de
`expanded`, e nenhuma razão nova entra no vocabulário.

O conjunto que dobrou não é estado mutável: é lido do layout, como em
`toolbar` (`declined.collapsedState`). O `ellipsis` diz a contagem total
escondida no nome acessível, e a raiz escreve `data-collapsed` com essa
contagem.

### 3.3 Movimento

Os crumbs revelados pela expansão entram por `opacity` (`medium`, `enter`).
Recolher não anima: com o colapso por largura, recolher acontece durante o
redimensionamento, que é movimento repetido.

## 4. Integração

As tabelas de 2026-09-03 §5 mantêm-se. Linhas alteradas:

| Pergunta | React | Angular |
| --- | --- | --- |
| Defaults definidos uma vez | `overflow` entra em `BreadcrumbDefaultsProvider` | `overflow` entra em `provideBreadcrumbDefaults()` |
| Substituir o elemento de cada parte | `render` em `BreadcrumbTrigger` | `button[slBreadcrumbTrigger]` sobre o `button` do consumidor |
| O handler do consumidor corre | `onClick` do `trigger` composto com o do `MenuTrigger` | eventos nativos do `button` intactos |
| Estado que o consumidor estiliza está no DOM | `data-collapsed` na raiz; `data-open` do `menu` no `trigger` | idem |
| Subscrições libertadas | `handle.destroy()` no cleanup do efeito | `DestroyRef` liberta o `createCollapse` |
| Renderização no servidor | a medição corre em `useLayoutEffect`; o servidor renderiza só o colapso por contagem | a medição corre em `afterNextRender` |

## 5. Custo da mudança

Nenhuma parte ou propriedade existente muda de nome. Uma trilha que antes
quebrava linha numa coluna estreita passa a dobrar para o `ellipsis`; a
aplicação que quer o comportamento anterior escreve `overflow="wrap"` na
instância ou nos defaults.
