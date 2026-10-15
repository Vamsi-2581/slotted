# Autoavaliação — `navigation-menu`

Inventário: `2026-10-01-navigation-menu-capability-inventory.md`. Desenho:
`2026-10-01-navigation-menu-design.md`. Dossiê ReUI:
`2026-10-01-navigation-menu-reui-dossier.md`. Specimens em
`tools/harness/out/specimen/navigation-menu/`.

## 1. As onze dimensões

| #   | Dimensão               | Resultado | Evidência                                                                                                                                                                                                                     | Mudança que mais a melhora                                                                                                    | Feita                                                                                                                  |
| --- | ---------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Ícones                 | passa     | `indicator` é o elemento Glyph (`chevron-down`; `chevron-right` com `directional` numa coluna) nas duas ligações; a folha não pinta nenhum ícone; `glyph-element.test.mjs` passa                                               | Chevron a apontar o painel quando a coluna o deixa cair por baixo                                                              | sim: `rotate: 0.25turn` com `data-placement="below"`                                                                    |
| 2   | Movimento              | passa     | Superfície entra por keyframe `medium`/`enter` (R7) e sai em `short`/`exit`; troca de secção move cinco medidas registadas (`@property`) em `medium`/`standard`; painéis cruzam-se ±`space-6`; cenário `navigation-menu-switch.mjs` | Painel e superfície na mesma interpolação                                                                                     | sim: antes o painel saltava e a superfície seguia; o cenário lê 24 frames e cada painel fica sobre a superfície         |
| 3   | Responsividade         | passa     | `content` é contentor de consulta de largura declarada; `links` cai para uma coluna abaixo de 480 px; grupos em `auto-fit`; coluna sem espaço → `below`; capturas 240/420/720                                                  | Medir contra o ancestral que recorta, não contra a janela                                                                      | sim: `clippingBox` em `@slotted/core/navigation-menu`                                                                    |
| 4   | Refinamento            | passa     | Alturas inteiras (34, 56, 279…); o texto do painel começa na coluna do rótulo do gatilho (13 = 1 + 4 + 8); rodapé alinhado aos links; divisória do segundo nível com a altura toda                                              | Seta (`arrow`) de 8 px legível a 1×                                                                                            | não: fica desligada por omissão; um passo maior pede uma decisão de tema                                                 |
| 5   | Tokens                 | passa     | 68 tokens lidos, todos com recurso na fundação; literais `15rem`, `10rem`, `11rem` com razão escrita; seis propriedades de runtime registadas                                                                                    | `--slotted-navigation-menu-group-min` como token de tema                                                                       | não: um único consumidor; fica privado (`--_group-min`) até um tema pedir                                               |
| 6   | Padrões                | passa     | APG Disclosure Navigation transcrito (desenho §4); sem papel `menu`; setas opcionais adotadas sem tabindex rotativo; `Space` num link é a plataforma                                                                           | Sentinelas de foco ao portar                                                                                                    | não se aplica: o painel não é portado                                                                                   |
| 7   | Acessibilidade         | passa     | Landmark nomeado pelo catálogo; `aria-expanded`/`aria-controls`; `aria-current` só no link; `aria-disabled` com `href`; `role=group` nomeado; Escape devolve o foco; forced-colors com borda                                    | Anúncio da troca de secção por região viva                                                                                     | não: um botão expandido já é anunciado; uma região viva repetiria                                                       |
| 8   | API nativa             | passa     | React: `ComponentPropsWithRef` por parte, `render`, handlers compostos (`defaultPrevented`); Angular: diretivas no elemento do consumidor, `HostAttributeToken` para `aria-label`/`aria-current`/`id`                          | `render` no gatilho React                                                                                                       | não: o gatilho é sempre `button` porque a família liga `aria-expanded`; escrito na composição                           |
| 9   | Capacidade             | passa     | Todas as linhas *table stakes* do inventário adotadas ou adaptadas; recusas com dono ou composição (`menuRole`, `backdrop`, `feature`, `portal`)                                                                                 | `top-navigation` aceitar um painel desta família no seu `trigger`                                                              | sim: reabertura de 2026-10-01; a `nav` da barra é raiz desta família e a secção recolhida abre em linha                 |
| 10  | Integração             | passa     | `NavigationMenuDefaultsProvider` / `provideNavigationMenuDefaults`; `NavigationMenuHandle` / `exportAs`; `model()` + `valueChangeRequest`; `useId` / fábrica de ids; tear-down em `DestroyRef`                                   | Propagar o corrente de um segundo nível ao gatilho do primeiro                                                                  | sim: nas duas ligações, com teste                                                                                       |
| 11  | Documentação           | parcial   | 17 cenários com legenda e snippet nas duas páginas; testes `referencePageErrors`, `apiMetadataErrors`, `snippetFormatErrors` verdes                                                                                             | Ler as páginas renderizadas a 1280 e 720 em light e dark e correr `audit.mjs`                                                   | pendente: os Storybooks precisam de reinício para verem a família                                                       |

## 2. Barra de craft

| Critério        | Número que decide                                                                                                       | Resultado |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- | --------- |
| Pixel grid      | Nenhuma parte enquadrada com altura fracionária em `slotted-light-720-data-part-trigger-52db46.json`                     | passa     |
| Hover           | Gatilho e link: transparente → `rgb(241 245 249)` (light), `rgb(34 34 37)` (dark), `rgb(230 230 230)` (high-contrast)   | passa     |
| Press           | `rgb(226 232 240)` ≠ hover em light; `rgb(39 39 42)` em dark                                                            | passa     |
| Focus           | 2 px; `#2563eb` sobre branco 5,17:1; `#60a5fa` sobre `#131316`; preto em high-contrast; offset 2 (topo), 0 (painel)      | passa     |
| Transition      | `transition-property: background-color, color` cobre o delta de hover e de press                                        | passa     |
| Motion          | Entrada `medium`/`enter`, saída `short`/`exit` na superfície e nos painéis                                              | passa     |
| Reduced motion  | `transition-duration` 0,001 s em `slotted-light-720-motion-reduce.json`; deslocações retiradas                           | passa     |
| Disabled        | `--slotted-disabled-foreground`; sem `opacity`                                                                           | passa     |
| Schemes         | High-contrast com borda preta; forced-colors com `border-top-color` `rgb(0 0 0)` no viewport                            | passa     |
| Density and RTL | Dense: alturas 26/24 pela escala; rtl: painel e seta espelhados, `data-motion` lógico                                    | passa     |
| Target size     | 34 px a `md`, 30 a `sm`; 44 em ponteiro grosso pelo tema                                                                 | passa     |
| Intent          | Literais com razão escrita ao lado da regra                                                                              | passa     |

## 3. Secção 18

- **Propósito e antiuso.** Secções de site com painéis de links. Não é lista
  de comandos (`menu`), não é barra de aplicação (`top-navigation`), não é a
  coluna de uma aplicação (`side-navigation`).
- **Anatomia.** Dezasseis partes (desenho §2).
- **Controlado e não controlado.** Um valor, `value`/`defaultValue`/
  `onValueChange` em React, `model()` + `valueChangeRequest` em Angular, com
  sete razões. Angular não tem `defaultValue`: um `model()` é os dois lados.
- **Matriz de estados.** `disabled` > `current` > `open` > `active` > `hover` >
  `focus-visible`; um gatilho aberto mantém o chão de hover; um gatilho
  corrente toma só a tinta.
- **Teclado, foco, ARIA, toque, leitor de ecrã.** Desenho §4; o toque nunca
  abre por hover; testes nas duas ligações.
- **Densidade, direção, movimento reduzido.** Capturas dense e rtl; specimen
  com movimento reduzido.
- **Carregamento, vazio, erro, conteúdo extremo.** Sem carregamento próprio:
  um painel preguiçoso é dos filhos do consumidor. Painel vazio (`Parceiros`)
  desativado. Conteúdo extremo na cena `content`.
- **SSR.** Ids estáveis (`useId`, fábrica); geometria só depois de montar;
  sem script, o painel aberto pinta a própria superfície (cena `static`).
- **Quebra de contrato.** Família nova; nenhuma migração.

## 4. Lentes de polimento

| Antes                                                    | Depois                                                                 | Porquê                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------- |
| Viewport transitava `inline-size`, `block-size`, `inset` | Cinco `@property` transitadas na raiz; painel com `clip-path` ao balão | Painel e superfície numa interpolação               |
| Painel `translate` 16 px sem recorte                     | Recorte ao balão durante a troca                                       | Nada desenhado fora da superfície                   |
| `:active` só muda o chão                                 | Mantido; sem `scale`                                                   | Controlos de navegação da biblioteca não escalam    |
