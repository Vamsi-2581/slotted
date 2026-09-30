# `filter-bar` — dossiê ReUI

## 0. Cabeçalho

- Família: `filter-bar`.
- Modo: `build` (a linha 1 do delta edita `contract.json`).
- Data: 2026-09-30.
- HEAD lido: `29603ff7`, ramo `review/implementation-pass-1`.
- Decisões de desenho: `2026-09-30-filter-bar-segmented-design.md`.

## 1. Seleção

Cobertura `direta`: a ReUI publica o primitivo `filters` (fonte em
`https://reui.io/r/filters.json`, documentação em
`https://reui.io/docs/components/base/filters.md`) e doze exemplos
`c-filters-1` a `c-filters-12`.

Termos pesquisados em `tools/harness/out/specimen/reui-llms-full.txt`:
`filter` 118, `filters` 61, `faceted` 8, `toolbar` 14, `chip` 35, `preset` 3,
`data-grid` 73, `saved view` 0, `query builder` 0, `search bar` 0.

| Item            | Tipo      | Rota                                        | Parte ou interação Slotted que informa                          | Capturas                                                   |
| --------------- | --------- | ------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| `filters`       | primitivo | `r/filters.json`, `docs/.../filters.md`      | modelo, teclado, `readOnly`, catálogo de operadores             | fonte lida; sem rota viva                                  |
| `c-filters-1`   | exemplo   | `/preview/base/example/c-filters-1`          | `chip` e segmentos, `add` compacto, `clear`                     | light, dark, `--motion reduce`, `--states` em 8 segmentos  |
| `c-filters-7`   | exemplo   | `/preview/base/example/c-filters-7`          | barra sobre uma tabela                                          | light                                                      |
| `c-filters-10`  | exemplo   | `/preview/base/example/c-filters-10`         | construtor num popover                                          | light                                                      |
| `c-filters-11`  | exemplo   | `/preview/base/example/c-filters-11`         | `builder`, `group`, `rule`, `join`, rodapé do grupo             | light, `--states` em 14 botões                             |

Os blocos Pro `data-grid-filtering-1` a `-4` compõem o mesmo primitivo; os
exemplos livres mostram as mesmas partes com fonte legível, e nenhum bloco Pro
foi capturado. Especímenes em `tools/harness/out/specimen/c-filters-*/`.

## 2. Anatomia

| `data-slot` ReUI                                    | Parte Slotted              | Estado               |
| --------------------------------------------------- | -------------------------- | -------------------- |
| `filters`                                           | `bar`                      | igual                |
| `filter-chip` (`ButtonGroup`, `role=group`)         | `chip`                     | igual (novo)         |
| `button-group-text` (campo)                         | `chip-field`               | igual (novo)         |
| `popover-trigger` (operador)                        | `chip-operator`            | igual (novo)         |
| `popover-trigger` (valor)                           | `chip-value`               | igual (novo)         |
| `dropdown-menu-trigger` (kebab)                     | `chip-remove`              | só no Slotted (×)    |
| `popover-trigger` do `FiltersBuilder`               | `add`                      | igual                |
| `button` Clear                                      | `clear`                    | igual                |
| —                                                   | `search`, `count`, `pill`, `preset`, `summary`, `actions` | só no Slotted |
| `filters-advanced`, `filter-group`, `filter-row`    | `builder`, `group`, `rule` | igual                |
| combinador na segunda linha                         | `join` no cabeçalho do grupo | só no Slotted      |
| grip, kebab de linha                                | —                          | em falta no Slotted (recusado, §6) |

## 3. Medidas

ReUI a 1280 px (`c-filters-1-light-1280-data-slot-filter-chip-da-1b54cc.json`);
Slotted a 720 px (`filter-bar/slotted-light-720-data-scene-default-data-74df84.json`).
Nenhuma propriedade da tabela depende da largura da página.

| Parte           | Propriedade          | ReUI                   | Slotted hoje (antes)                  | Alvo                                             | Veredicto |
| --------------- | -------------------- | ---------------------- | ------------------------------------- | ------------------------------------------------ | --------- |
| `chip`          | altura               | 32                     | 20.8 (`tag` sm)                        | `--slotted-control-height-md` = 34               | adaptar — a linha já tem 34 em `add`, `clear` e `search`; 20.8 falhava a grelha de píxel |
| `chip`          | raio                 | 10                     | 9999                                   | `--slotted-radius-full`                          | superar — 10 não tem passo; a cápsula é a forma da pílula da mesma linha |
| `chip`          | aresta               | 1 px `oklch(0.922)`    | 0 (tag soft)                           | `--slotted-control-border-width`, `--slotted-control-border-color` | adotar |
| `chip` > seam   | divisória            | 1 px, cor da aresta    | —                                      | 1 px `--slotted-border-subtle`                   | adaptar — a divisória lê-se mais leve que o contorno |
| segmento        | padding inline       | 10 / 10                | 6 / 4 (corpo do tag)                   | `--slotted-control-padding-inline-sm` = 10       | adotar |
| `chip-field`    | padding inicial      | 10                     | —                                      | `--slotted-control-padding-inline-md` = 13       | adaptar — a curva da cápsula come ar à primeira letra |
| segmento        | tamanho de letra     | 14                     | 12                                     | `--slotted-control-font-size-md` = 13            | adaptar — o passo de controlo do tema |
| `chip-field`    | peso                 | 500                    | 500                                    | `--slotted-font-weight-medium`                   | adotar |
| `chip-operator` | peso, cor            | 500, `oklch(0.556)`    | 400 (dentro da frase)                  | 400, `--slotted-text-muted`                      | superar — o conetor lê-se mais leve que as duas pontas |
| `chip-value`    | peso                 | 500                    | 400                                    | `--slotted-font-weight-medium`                   | adotar |
| `chip-remove`   | caixa                | 32 × 32 (kebab)        | glifo do tag                           | quadrado na altura interior, 32 × 32             | adotar |
| ícone           | tamanho              | 16                     | —                                      | `--slotted-control-icon-size-md` = 16            | adotar |
| `bar`           | gap                  | 8                      | 6 (chips) / 8 (barra)                  | `--slotted-control-gap-md` = 8                   | adotar |
| `add` compacto  | caixa                | 32 × 32, raio 10       | 116.73 × 34, com texto                 | 34 × 34 círculo (`data-shape="circle"`)          | adaptar — a forma das cápsulas vizinhas |
| `pill`          | aresta               | —                      | 1 px sólida, accent quando filtrada    | 1 px tracejada, `--slotted-control-border-color` | superar — o vazio lê-se como lugar a preencher |
| `rule` (construtor) | altura da célula | 32                     | 34                                     | `--slotted-control-height-md`                    | adaptar |
| `rule`          | gap entre linhas     | 12                     | 8                                      | `--slotted-control-gap-md`                       | recusar — 12 alonga o construtor dentro de um drawer |
| `group` aninhado| raio, padding        | 8, 8                   | 6, 12                                  | sem mudança                                      | recusar — o passo `md` é o dos cartões do tema |

## 4. Coreografia de estados

| Parte           | Estado        | Delta ReUI                                             | Delta Slotted hoje (antes)                                        | Alvo (medido depois)                                             |
| --------------- | ------------- | ------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| segmento        | hover light   | `background-color` 1 → 0.97 (ΔL 0.030)                 | corpo do tag: tinta 8% (ΔL 0.018)                                  | `--slotted-tone-secondary-subtle-hover`, ΔL 0.032                 |
| segmento        | hover dark    | vazio                                                  | —                                                                 | ΔL 0.065                                                          |
| segmento        | active        | igual ao hover                                         | tinta 14%                                                         | `--slotted-tone-secondary-subtle-active`, ΔL 0.071 light, 0.086 dark |
| segmento        | aberto        | —                                                      | —                                                                 | `aria-expanded="true"` mantém o chão do active                    |
| segmento        | focus-visible | `outline` automático, 1 px                             | 2 px, offset −4                                                   | 2 px `--slotted-focus-ring-color`, offset −2 (para dentro); 5.17:1 light, 7.29:1 dark, 21:1 high-contrast |
| kebab / `chip-remove` | hover   | só `color` 0 → 0.145                                   | —                                                                 | chão + cor, ΔL 0.032                                              |
| `pill`          | hover         | —                                                      | filtrada: chão mais claro que o repouso (219 → 239)                | chão, aresta `--slotted-border-strong`, tinta                     |
| `pill`          | active        | —                                                      | filtrada: vazio                                                    | ΔL 0.071                                                          |
| `chip`          | `data-incomplete` | palavras («Select condition»), sem tracejado       | —                                                                 | aresta tracejada, valor `labels.noValue` em tinta atenuada       |
| `chip`          | `data-invalid` | —                                                     | aresta de perigo no tag                                           | aresta `--slotted-tone-danger-border`, campo em `--slotted-tone-danger-text` |
| `chip`          | `data-readonly` | `aria-disabled`, paragem mantida                     | —                                                                 | sem ×, `add`, `clear`; segmentos `aria-disabled`, cursor `default` |
| `chip`          | disabled      | atributo nativo                                        | —                                                                 | tokens `--slotted-disabled-*`, sem sombra                         |

## 5. Movimento

| Mudança                      | ReUI                                          | Slotted alvo                                                                                          |
| ---------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| hover e press dos segmentos  | 0 s (texto dos segmentos); 150 ms `all` no kebab | `background-color`, `color`, `--slotted-control-transition-duration` (120 ms), `--slotted-control-transition-easing` |
| chip ou pílula entra         | nenhuma                                        | `opacity` 0 → 1, `translate` −`--slotted-space-2` → 0, `--slotted-duration-medium`, `--slotted-easing-enter`, por `@starting-style` |
| chip sai                     | nenhuma                                        | nenhuma; razão em `2026-09-30-filter-bar-segmented-design.md` §8                                     |
| movimento reduzido           | —                                              | durações a 0 s / 0.001 s (`slotted-light-720-motion-reduce.json`); nenhuma animação infinita          |

## 6. Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| --- | --- | --- | --- | --- | --- | --- |
| Condição em segmentos | `c-filters-1`, `FilterChip` | `ButtonGroup` com texto, dois `popover-trigger` e kebab | partes `chip-field`, `chip-operator` (`menu`), `chip-value` (`popover`), `chip-remove` | cada segmento é uma paragem de seta do toolbar e `Delete` remove de qualquer segmento; na ReUI o `Enter` só retoma o passo em falta | adotar | — |
| Condição incompleta visível | `data-incomplete`, «Select condition» | regra no valor com `operator: ""` | `data-incomplete`, estado da barra, fora do valor | o valor emitido nunca contém uma condição que não filtra; o motor já a trata como inativa | adaptar | — |
| `add` compacto | `FiltersBuilder` | só ícone quando há filtros | `data-compact` + `button` `data-shape="circle"` | usa a API de `button`, sem variante própria | adotar | — |
| `readOnly` | prop `readOnly` | `aria-disabled` em cada controlo que muda | `readOnly`, `data-readonly`; × , `add` e `clear` não desenhados | nada se anuncia como indisponível quando nunca estaria disponível | adaptar | — |
| Ícone por campo | `FilterField.icon` | `ReactNode` | `fields[].icon`: nome de glifo ou nó | o nome de glifo serve os dois bindings com um só valor | adotar | — |
| Reordenar chips | `Alt` + setas | `moveNode` | — | a ordem de uma junção `and` não muda o significado | recusar | — |
| Menu por linha (duplicar, negar, envolver) | `FilterRuleMenuItems` | kebab | — | os operadores do motor já incluem as negações; `Add group` compõe o envolver | recusar; reabertura em `docs/process/build-order.md` | — |
| Veto antes da mudança | `onBeforeQueryChange` | callback que devolve `false` | par controlado `value` / `onValueChange` | um mecanismo em vez de dois | recusar | — |
| Opções assíncronas | `loadOptions`, `resolveValues` | no campo | `renderOperand` com `combobox` ou `multi-select` | a paginação e o aborto já pertencem às famílias do operando | adiar para `combobox` | `combobox` |
| Opção exclusiva «nenhum» | `FilterOption.exclusive` | flag na opção | operador `isEmpty` do motor | uma condição em vez de um valor especial | recusar | — |
| Construtor em linha | `advancedMode="inline"` | prop | `builder` no `drawer` | — (a forma em linha fica por decidir com `data-grid`) | adiar para `data-grid` | `data-grid` |
| Tamanho `sm` | `size` | `"sm" \| "default"` | `size` `sm` / `md` / `lg` | coincidem; o Slotted tem mais um passo | adotar (já existia) | — |

## 7. Superar

| Critério | ReUI | Slotted hoje (antes) | Alvo | Fonte |
| --- | --- | --- | --- | --- |
| Pixel grid | segmentos 32 inteiros | corpo do chip 20.7969 | 34 / 32 inteiros; denso inteiro | `slotted-light-720-*-74df84.json`, `slotted-light-720-dense.json` |
| Hover | light ΔL 0.030; dark vazio | tinta 8%, ΔL 0.018 | ΔL 0.032 light, 0.065 dark, 0.075 high-contrast | `craft.cjs` sobre os três especímenes |
| Press | igual ao hover (falha) | pílula filtrada vazia (falha) | ΔL 0.071 / 0.086 / 0.155, diferente do hover | idem |
| Focus | 1 px automático (falha) | 2 px, offset −4 | 2 px, offset −2, 5.17:1 / 7.29:1 / 21:1 | idem |
| Transition | segmentos 0 s; kebab `all` 150 ms | `background-color, color` | `background-color, color` em tokens; pílula acrescenta `border-color` | especímenes |
| Motion | nenhuma entrada | nenhuma | entrada por `@starting-style` com `--slotted-easing-enter` | folha |
| Reduced motion | — | — | 0 s / 0.001 s | `slotted-light-720-motion-reduce.json` |
| Disabled | `opacity` | tokens `--slotted-disabled-*` | tokens, sem sombra | folha |
| Schemes | sem high-contrast | — | high-contrast e `forced-colors` com a mesma anatomia; seams em `GrayText`, segmento aberto em `Highlight` | capturas high-contrast, `slotted-light-720-forced.json` |
| Density e RTL | — | — | denso 26/24, rtl espelhado; a linha do telefone começa no início em linha também em rtl | capturas `dense`, `rtl` |
| Target size | 32 | 20.8 no chip | 32 no segmento; `more` e a × da linha do construtor com halo em `pointer: coarse` | `inner-control.test.mjs` R2.6 |
| Intent | — | — | literais `12rem` do valor e `36rem` da quebra, com razão no contrato | `contract.json` › `literals` |

## 8. Delta

| # | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| --- | --- | --- | --- | --- |
| 1 | `specs/components/filter-bar/contract.json` (`contrato`) | `chips` sai; `chip-field`, `chip-operator`, `chip-value`, `chip-remove`; `readOnly`; `data-pinned`, `data-incomplete`, `data-compact`; composição de duas linhas | §2, §6 | `contract.test.mjs` 18/18 |
| 2 | `specs/components/filter-bar/contract.test.mjs` | testes do chip segmentado, do incompleto, de `readOnly` | §6 | idem |
| 3 | `packages/styles/src/filter-bar/filter-bar.harness.html` | cenas `default`, `empty`, `revealed`, `manual`, `states` reescritas com chips segmentados, incompleto, inválido, read-only; rodapé do construtor em contorno; `remove-group` em glifo | §4 | `filter-bar-*-720.png` |
| 4 | `packages/styles/src/filter-bar/filter-bar.css` | cápsula e segmentos; pílula tracejada; composição de duas linhas; `add` e `clear`; entrada; faixas do construtor que encolhem; `save-preset` no fim | §3, §4, §5, §7 | especímenes depois |
| 5 | `packages/styles/src/filter-bar/filter-bar.tokens.json` | lista refeita da folha | §7 Intent | `tokens.test.mjs` |
| 6 | `packages/styles/src/filter-bar/filter-bar.styles.test.mjs` | asserções da nova folha | — | 19/19 |
| 7 | `specs/components/filter-bar/contract.json` (`contrato`) | `rule-summary`, estado `expanded`, `builderCards`, `surfaces.narrow`, gaveta de baixo abaixo de 36 rem de viewport, linha que desliza | — (pedido do revisor no gate: telefone) | `contract.test.mjs` 19/19 |
| 8 | `packages/styles/src/filter-bar/filter-bar.css` | linha que desliza abaixo de 36 rem; chip de três alvos; construtor em cartões abaixo de 30 rem; trilho nos grupos; par aninhado sem contorno | idem | `filter-bar-*-420.png`, `filter-bar-*-240.png`; `rule-summary` ΔL 0.032 / 0.065, press 0.071 / 0.086, anel 5.17:1 / 7.29:1 |
