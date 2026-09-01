# Ordem de reconstrução

Sequência de invocações de `/component` para refazer a biblioteca a partir da
camada mais primitiva. Deriva de `docs/component-features.md` (guia de features)
e do estado atual de `specs/components/`.

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
`specs/rebuild-ledger.test.mjs` recusa uma família fora da lista que não
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
seção 10 — fica adiado: o ritmo que ele precisa fixar é definido sobre `list` e
`list-item` (onda 4), `link` (onda 2), `table` (onda 6) e `code-block` (onda 8).
Escrito antes disso, seria uma segunda escala privada para elementos que a
reconstrução ainda não alcançou. Volta como invocação própria no fim da onda 4,
quando lista e link já existirem; tabela e código entram como refino posterior.

### Escopo por família — onda 1

O que cada invocação entrega. A pesagem do passo 3 continua sendo do
implementador: adotar, adaptar ou recusar, com uma frase de razão cada.

- **`typography`** — entregue. Text e Heading.
- **`icon`** — registry tree-shakeable, `size`, stroke/fill, `tone`, e espelho em
  RTL só para ícones direcionais. Decorativo sai da árvore de acessibilidade;
  significativo exige rótulo ou texto adjacente. Não aceita SVG remoto nem HTML
  não sanitizado. Decidir onde vive o registry — pacote próprio, entrada de
  `@slotted/core`, ou tokens de glifo como hoje — e a relação com
  `--slotted-icon-*`, que já serve máscaras intrínsecas de componente.
- **`visually-hidden`** — reconstrução. Conteúdo oculto visualmente permanece
  acessível sem alterar layout; a variante revelável no foco continua sendo uma
  regra só, não uma regra mais o seu desfazer.
- **`divider`** — reconstrução. `hr` como elemento, `decorative` removendo da
  árvore, orientação vertical com comprimento mínimo. A variante rotulada
  ("OU" no meio) e o separador dentro de `ul` (Menu, onda 5) precisam de decisão
  agora, não depois.
- **`stack inline grid`** — `gap`, `align`, `justify`, `wrap`,
  `columns`/`minItemWidth`, tudo limitado por tokens. Sem virar DSL de CSS.
  Herda a decisão de medida: o contêiner é quem limita comprimento de linha.
- **`container`** — largura máxima, inset e centragem por token; é o dono da
  medida confortável de texto.
- **`card`** — por último na onda, porque escolhe tamanho de texto e superfície
  já decididos. Superfície vem de `--slotted-surface-raised`; nenhuma família
  volta a inventar fundo neutro.

## Onda 2 — Ação, status e metadados

| Invocação             | Modo       | Guia |
| --------------------- | ---------- | ---- |
| `button icon-button`  | refazer    | 5    |
| `button-group`        | novo       | 5    |
| `link`                | refazer    | 5    |
| `badge`               | refazer    | 10   |
| `tag`                 | refazer    | 10   |
| `avatar avatar-group` | refazer    | 10   |
| `kbd`                 | refazer    | 5    |
| `skeleton`            | refazer    | 9    |
| `progress-indicator`  | consolidar | 9    |
| `status-indicator`    | novo       | 9    |
| `alert`               | refazer    | 9    |
| `inline-message`      | novo       | 9    |

- `button icon-button` abre a onda: fixa altura de controle, padding, densidade
  e estado `loading` que todos os controles seguem. `button-group` depois dele.
- `progress-indicator` absorve `spinner`, `progress-bar` e `loading-bar` como
  recipes de uma família só (guia 17), e resolve a duplicação já registrada em
  `docs/BUILD-LOG.md` entre o anel do Button e `spinner.css`. Remove três
  entradas de `specs/components/` e os tokens
  `--slotted-button-loading-indicator-*` do contrato.
- `badge` e `tag` compartilham tokens e permanecem famílias distintas.

### Escopo por família — onda 2

- **`button icon-button`** — par, porque IconButton é o mesmo comportamento com
  nome acessível obrigatório. `type`, `variant`, `tone`, `size`, `fullWidth`,
  `disabled`, `loading`, ícones start/end, evento de press unificado para
  ponteiro e teclado. `loading` preserva largura e nome acessível. Área visual e
  alvo interativo podem divergir; o alvo obedece `--slotted-target-min`. Abre a
  onda porque fixa altura, padding e densidade de todo controle.
- **`button-group`** — espaçamento, orientação e overflow de ações
  relacionadas, sem alterar a semântica de cada botão. Ação destrutiva não
  encosta em ação frequente sem separação. O overflow para menu depende de
  `menu` (onda 5) e volta como refino.
- **`link`** — destino, navegação interna e externa, download, ícone de externo,
  `disabled` excepcional. Reconhecível sem depender só de cor; nova janela é
  comunicada. Não emula botão.
- **`badge`** — contagem, status ou metadado curto não editável. Variantes
  solid, soft e outline, `tone`, `size`, `dot`, `maxCount`. Contagem que muda
  declara política de anúncio. Não é botão.
- **`tag`** — entidade, filtro ou valor compacto; estático, selecionável,
  removível ou navegável, nunca dois comportamentos implícitos ao mesmo tempo.
  Eventos de press e de remove separados; remover devolve o foco ao item lógico
  seguinte.
- **`avatar avatar-group`** — par. Ordem de fallback imagem → iniciais → ícone,
  sem ícone quebrado quando a imagem falha; `tone` determinístico a partir do
  nome. O grupo controla sobreposição, limite e resumo "+N" sem tornar os
  membros anônimos.
- **`kbd`** — combinação localizada por plataforma, com nome acessível. Não
  registra atalho nenhum. Lê `--slotted-font-family-mono`.
- **`skeleton`** — geometria aproximada do conteúdo, com recipes de texto,
  avatar, bloco e composição. Fora da árvore de acessibilidade; a região anuncia
  o carregamento uma vez. Sob reduced motion a animação para, não encurta.
- **`progress-indicator`** — consolidação. Uma família com recipes linear,
  circular e spinner, absorvendo `spinner`, `progress-bar` e `loading-bar`.
  Determinado (`value`, min, max) ou indeterminado, `label`, `valueText`,
  `size`, e atraso antes de aparecer. Remove três entradas de
  `specs/components/` e os tokens `--slotted-button-loading-indicator-*`, que o
  anel do Button passa a ler daqui.
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

1. `field field-group` — refazer. Base de label, descrição, mensagem, marca de
   obrigatório e relação por ID. `fieldset` é absorvido aqui.
2. `text-field` — refazer, substitui `input`.
3. `textarea` — refazer.
4. `checkbox radio-group` — novo. Decisão única sobre onde desenhar o check e o
   dot, `indeterminate` e roving focus.
5. `switch` — refazer.
6. `number-field` — novo.
7. `slider` — novo.
8. `form` — novo. Submissão, validação e integração com Reactive Forms no
   binding Angular.

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
| `result-state`          | consolidar | 9    |
| `toolbar`               | refazer    | 5    |

- `result-state` cobre empty e error na mesma família visual com semânticas
  distintas (guia 17).
- `toolbar` fecha a onda sem o overflow para menu; o overflow depende de `menu`
  e volta como refino na onda 5.

## Onda 5 — Infraestrutura de overlay e overlays

Infraestrutura primeiro, em `packages/core`, com teste próprio e sem UI:

1. `presence` — montagem durante animação de saída, `forceMount`.
2. `dismissable-layer` e `portal` — Escape, press externo, scroll lock, `inert`,
   pilha única de z-index.
3. `positioner` — âncora, placement, colisão, atualização em scroll e resize,
   sem expor a engine.
4. `live-announcer` — prioridade, deduplicação e limpeza.

`focus` já existe e é revisado, não reescrito.

Depois, nesta ordem:

1. `tooltip`
2. `popover`
3. `dialog alert-dialog`
4. `drawer`
5. `menu menubar`
6. `toast`
7. `loading-overlay`

Refino de `toolbar` com overflow ao final da onda.

## Onda 6 — Coleções

1. Revisão de `packages/core/collection`: chaves estáveis, seções, typeahead,
   seleção, carregamento incremental e virtualização como capacidade opcional.
   `virtual-list` deixa de ser família pública e sua entrada em
   `specs/components/` é retirada aqui (guia 2.10).
2. `listbox` — primeiro consumidor real do motor, e o teste de janela com
   seleção simultânea.
3. `select`
4. `combobox`
5. `multi-select`
6. `tree`
7. `table`

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
| `field`, `fieldset`                                                                         | consolidar em `field field-group`   | 3    |
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
