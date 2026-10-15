# Dossiê ReUI — timeline

## 0. Cabeçalho

- Família: `timeline` (membro `timeline`)
- Modo: `polish`
- Data: 2026-09-29
- HEAD: `ff5fe279` (ramo `review/implementation-pass-1`)
- Specimens: `tools/harness/out/specimen/<item>/` e `tools/harness/out/specimen/timeline/`
- Fontes ReUI: `tools/harness/out/specimen/reui-src/timeline-primitive.json`, `reui-src/timeline-docs.md` e `reui-src/c-timeline-<n>.json` (12 exemplos)

## 1. Seleção

Cobertura: `direta`. O ReUI publica o primitivo `timeline` (`https://reui.io/r/timeline.json`, partes `timeline`, `timeline-item`, `timeline-header`, `timeline-indicator`, `timeline-separator`, `timeline-date`, `timeline-title`, `timeline-content`), 12 exemplos `c-timeline-*` e 9 blocos Pro `timeline-*`.

Termos pesquisados em `llms-full.txt` (2188 linhas): `timeline` 46, `activity` 34, `activity feed` 9, `stepper` 55, `feed` 26, `tracking` 26, `history` 9, `audit log` 6, `changelog` 4, `order status` 1.

| Item             | Tipo         | Rota                                  | Parte ou interação Slotted que informa                              | Capturas                                                                 |
| ---------------- | ------------ | ------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `c-timeline-3`   | Free example | `/preview/base/example/c-timeline-3`  | `marker` com check em `complete`, `connector` preenchido até ao atual | `light-1280`, `light-720`, `dark-1280`, `-motion-reduce`                 |
| `c-timeline-9`   | Free example | `/preview/base/example/c-timeline-9`  | `orientation="horizontal"` com `opposite` antes do trilho           | `light-1280`, `dark-1280`, `-motion-reduce`                              |
| `c-timeline-10`  | Free example | `/preview/base/example/c-timeline-10` | `marker` com glifo por tom, `time` relativo                          | `light-1280`, `dark-1280`, `-motion-reduce`                              |
| `c-timeline-11`  | Free example | `/preview/base/example/c-timeline-11` | `marker` com avatar, `actor` no título                               | `light-1280`, `dark-1280`, `-motion-reduce`                              |
| `timeline-3`     | Pro block    | `/preview/base/timeline-3`            | `mode="feed"` com avatar, `actions` e ligações no corpo              | `light-1280`, `dark-1280`, `-motion-reduce`; estados de `a` e `button` no corpo |
| `solution-crm-5` | Pro block    | `/preview/base/solution-crm-5`        | `group` por dia com `group-label`, item recolhível                   | `light-1280`, `dark-1280`, `-motion-reduce`; estados de `collapsible-trigger` |

Slotted: `slotted-{light,dark,high-contrast}-720`, `-motion-reduce`, `-forced`, `-dense`, `-rtl`; estados de `[data-part=group-trigger], [data-part=fresh], button[data-part=more], article[data-part=item]` (`611ce8`, 8 elementos) nos três esquemas.

## 2. Anatomia

| `data-slot` ReUI     | Parte Slotted                              | Estado              |
| -------------------- | ------------------------------------------ | ------------------- |
| `timeline`           | `root` com `list`                          | igual               |
| `timeline-item`      | `item`                                     | igual               |
| `timeline-header`    | primeira linha de `content`                | igual               |
| `timeline-indicator` | `marker` dentro de `rail`                  | igual               |
| `timeline-separator` | `connector`                                | igual               |
| `timeline-date`      | `time`, ou `opposite`                      | igual               |
| `timeline-title`     | `title`                                    | igual               |
| `timeline-content`   | `description`                              | igual               |
| —                    | `actor`, `actions`                         | só no Slotted       |
| —                    | `group`, `group-label`, `group-trigger`, `group-indicator`, `group-list` | só no Slotted; `solution-crm-5` desenha grupos por dia sem `data-slot` |
| —                    | `fresh`, `more`, `empty`                   | só no Slotted       |

## 3. Medidas

Largura de página: ReUI 1280 e 720 (`c-timeline-3`); Slotted 720. Nenhuma propriedade abaixo varia com a largura: o `timeline-indicator` de `c-timeline-3` mede 24 × 24 nas duas larguras.

| Parte                 | Propriedade               | ReUI                                                                                   | Slotted hoje                                                                 | Alvo                                                                      | Veredicto |
| --------------------- | ------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------- |
| `marker` ponto        | rect                      | 16 × 16, anel 2px (`c-timeline-9`); 24 × 24 cheio (`c-timeline-3`, `-10`)              | 13 × 13, núcleo 5 × 5                                                        | sem mudança                                                               | `recusar`: o ponto é o glifo do emblema à paridade da linha (desenho § 6); 24 excede a linha de 19.5 onde o Slotted o centra |
| `marker` ponto        | y do rect                 | 4, topo da linha da data (`c-timeline-3`)                                              | 49.25 (`--_lift` 3.25); `dense` 50.5 (`--_lift` 4.5)                          | `round(nearest, …, 1px)`: 49 e 51                                         | `adaptar`: a caixa emoldurada assenta em x.25 e x.5 de píxel CSS |
| `marker` emblema      | rect e glifo              | 24 × 24, svg 16 × 16 (`c-timeline-3`)                                                  | 21 × 21, svg 12 × 12 em x 29.5                                               | sem mudança                                                               | `recusar`: tabela do desenho § 6 (emblema 21, glifo 12) |
| `marker` com avatar   | rect e iniciais           | 28 × 28 (`timeline-3`), 32 × 32 (`c-timeline-11`), foto                                | 21 × 21, iniciais 8.4px; o `avatar` do `actor` mede 24 com 9.6px             | decisão do portão (§ 8, linha 7)                                          | `adaptar`: 21 fica abaixo de `--slotted-avatar-size-xs` (24), o menor degrau da família `avatar` |
| `connector`           | largura                   | 2px                                                                                    | 1px (`--slotted-border-width-thin`)                                          | sem mudança                                                               | `recusar`: a razão linha:marcador é 1:12 no ReUI (2 em 24) e 1:13 no Slotted (1 em 13) |
| `connector`           | ar junto ao marcador      | 2px de intervalo (indicador termina em y 28, linha começa em 30)                       | halo de 2px do fundo (`--slotted-space-1`)                                   | sem mudança                                                               | `adotar`: os dois valores coincidem |
| `connector`           | cor pendente e concluída  | `oklch(0.922 0 0)` e `oklch(0.205 0 0)` (`--primary`)                                  | `rgb(216,222,230)` (`--slotted-border-subtle`) e a tinta do tom do item      | sem mudança                                                               | `superar`: a linha concluída segue o tom de cada item |
| `marker` pendente     | contraste da marca        | anel `oklab(0.205 0 0 / 0.2)` sobre branco, 1.53:1                                     | núcleo `rgb(120,137,156)` sobre branco, 3.59:1                               | sem mudança                                                               | `superar`: o Slotted cumpre 3:1 de elemento não textual |
| `title`               | font-size, peso, linha    | 14px, 500, 20px                                                                        | 13px (`--slotted-control-font-size-md`), 500, 19.5px                         | sem mudança                                                               | `recusar`: a família usa a escala de controlo; `size="lg"` dá 14px |
| `time`                | font-size, peso, linha    | 12px, 500, 16px, numerais proporcionais                                                | 12px, 400, 18px, `tabular-nums`                                              | sem mudança                                                               | `superar`: numerais tabulares não oscilam entre eventos |
| `description`         | font-size, cor            | 14px, `oklch(0.556 0 0)`                                                               | 13px, `rgb(91,107,127)` (`--slotted-text-muted`)                             | sem mudança                                                               | `recusar`: mesmo motivo de `title` |
| `content`             | intervalo entre linhas    | 2px (`gap` de `timeline-item`)                                                         | 4px (`--slotted-space-2`) antes de `actor` e `description`                   | sem mudança                                                               | `recusar`: 4px é o degrau da família para texto secundário |
| `rail` → `content`    | distância                 | 16 do indicador de 24 (`c-timeline-3`); 18 do avatar de 28 (`timeline-3`)              | 12 do trilho de 21; 16 do ponto de 13 centrado no trilho                     | sem mudança                                                               | `adotar`: 16 do ponto coincide |
| `item`                | ritmo entre eventos       | 24px (`pb-6`)                                                                          | 16px (`--_item-gap`)                                                         | sem mudança                                                               | `recusar`: o ritmo segue a densidade; 24 é o de um changelog, não o de uma lista operacional |
| `fresh`, `more`       | altura, radius, borda     | —                                                                                      | 30px (`--slotted-control-height-sm`), `9999px`, 1px                          | sem mudança                                                               | `superar`: sem equivalente no ReUI |

## 4. Coreografia de estados

Deltas copiados de `states[].deltas`. ReUI: as partes da timeline não são interativas; os deltas vêm de `collapsible-trigger` (`solution-crm-5`), análogo de `group-trigger`, e dos controlos no corpo de `timeline-3`.

| Parte                   | Estado        | Delta ReUI                                                                                   | Delta Slotted hoje                                                                                                  | Alvo |
| ----------------------- | ------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---- |
| `group-trigger`         | hover         | `collapsible-trigger`: `{}`                                                                  | `color` `rgb(91,107,127)` → `rgb(15,23,42)` claro; `rgb(161,161,170)` → `rgb(250,250,250)` escuro; `rgb(31,41,55)` → `rgb(0,0,0)` alto contraste | sem mudança |
| `group-trigger`         | active        | `{}`                                                                                         | claro `color` → `rgb(23,32,51)`; escuro e alto contraste iguais ao hover                                            | `color` do hover e `translate: 0 1px` (`--slotted-border-width-thin`), o press de `button` |
| `group-trigger`         | focus-visible | `outline` auto 1px                                                                           | `outline` 2px sólido, offset 2px                                                                                    | sem mudança |
| `fresh`                 | hover         | —                                                                                            | `background-color` `rgb(219,234,254)` → `rgb(239,246,255)` claro (L 0.932 → 0.970, na direção da página); `rgb(24,27,34)` → `rgb(17,19,24)` escuro (L 0.222 → 0.187; página 0.188) | camada de estado: `color-mix(in oklab, <superfície do tom>, currentColor 8%)` |
| `fresh`                 | active        | —                                                                                            | `{}` claro e escuro; alto contraste `rgb(211,224,250)`                                                              | camada a 14%; `transition-duration: --slotted-duration-instant` |
| `button[data-part=more]`| hover         | —                                                                                            | `background-color` → `rgb(241,245,249)` claro (L 0.968), `rgb(34,34,37)` escuro (L 0.253)                           | sem mudança |
| `button[data-part=more]`| active        | `button` no corpo de `timeline-3`: `translate` none → `0px 1px`                              | `rgb(226,232,240)` claro (L 0.929), `rgb(39,39,42)` escuro (L 0.274)                                                | `transition-duration: --slotted-duration-instant`, como `button` `outline` |
| `article[data-part=item]` | hover, active | —                                                                                          | `{}`                                                                                                                | sem mudança: um artigo do feed é alvo de foco, não um comando |
| `article[data-part=item]` | focus-visible | —                                                                                          | `outline` 2px, offset 2px, `border-radius` 0 → 4px                                                                  | sem mudança |

## 5. Movimento

| Transição                   | ReUI                                                                 | Slotted hoje                                                                    | Alvo |
| --------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---- |
| cor do marcador e da linha  | nenhuma: `transition: all 0s`                                        | `background-color`, `border-color`, `color` em 120ms, `--slotted-control-transition-easing` | sem mudança |
| chevron do grupo            | `rotate` 0.2s `cubic-bezier(0.4, 0, 0.2, 1)` nos dois sentidos (`solution-crm-5`) | `rotate` 200ms (`--slotted-duration-medium`), `--slotted-easing-standard` nos dois sentidos | abrir com `--slotted-easing-enter`, fechar com `--slotted-easing-exit`; 200ms |
| lista do grupo              | `collapsible-content` sem transição nem animação no bloco            | `hidden` sem transição (decisão do desenho § 7)                                 | decisão do portão (§ 8, linha 6) |
| `fresh` a entrar e a sair   | —                                                                    | montado e desmontado pela binding quando `freshCount` muda                      | fora deste polish: a saída exige manter a parte montada, o que muda `fresh.when` no contrato |
| movimento reduzido          | `timeline-3`: `button` mantém 0.15s; chevron de `solution-crm-5` mantém 0.2s | 0.001s em marcador, linha e chevron                                       | sem mudança |

## 6. Capacidades

| Capacidade                       | Onde aparece no ReUI                     | Forma no ReUI                                                            | Forma no Slotted                                                             | Em que a forma Slotted é melhor                                                        | Veredicto | Família dona, se não esta |
| -------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------- | ------------------------- |
| passo ativo e concluídos         | todos os `c-timeline-*`                  | `value`/`defaultValue`/`onValueChange` numéricos na raiz, `step` em cada item; `data-completed` quando `step <= value` | `aria-current` no item atual, `autoComplete` e `order` na raiz               | o estado sai de `aria-current`, que um leitor de ecrã anuncia; nenhum número duplicado por item | `adotar`: já presente | — |
| data acima do título             | `c-timeline-3`, `-9`                     | `TimelineDate` antes de `TimelineTitle` no markup                         | `time` no fim da linha do título; `opposite` na coluna lateral               | uma linha a menos por evento; abaixo de 20rem o `time` passa a linha própria            | `recusar`: a ordem do DOM é título, depois tempo, que é a ordem de leitura | — |
| horizontal com rótulos antes     | `c-timeline-9`                           | `orientation="horizontal"` e `TimelineDate` no cabeçalho                  | `orientation="horizontal"` com `opposite`                                     | reflui para coluna abaixo de 30rem                                                      | `adotar`: já presente | — |
| avatar como marcador             | `c-timeline-11`, `timeline-3`            | `Avatar` filho de `TimelineIndicator`                                     | `avatar` filho de `marker`                                                    | as duas formas coincidem                                                                | `adotar`: já presente; tamanho em § 8, linha 7 | — |
| tempo relativo                   | `c-timeline-10`, `-11`, `timeline-3`     | texto escrito pelo consumidor ("5 minutes ago")                           | `timeFormat="relative"` com `Intl.RelativeTimeFormat`; absoluto em `title`    | o texto é derivado de `datetime` e da localidade                                         | `adotar`: já presente | — |
| etiqueta de estado no título     | `solution-crm-5`, `c-timeline-10`        | `Badge` dentro de `TimelineHeader`                                        | `badge` composto em `content`                                                 | as duas formas coincidem                                                                | `adiar para badge` | `badge` |
| ações no corpo                   | `timeline-3`                             | `Button` soltos em `TimelineContent`                                      | parte `actions` com `gap` e quebra                                            | a parte alinha as ações em `placement="start"` e `alternate`                             | `adotar`: já presente | — |
| item recolhível em cartão        | `solution-crm-5`                         | `Collapsible` com `Frame` dentro do item                                  | `collapsible` composto em `content`                                           | uma disclosure por pergunta (`declined.expandableItem` do contrato)                      | `adiar para collapsible` | `collapsible` |
| grupos por dia com contagem      | `solution-crm-5`                         | cabeçalho em maiúsculas com régua e contagem, sem `data-slot` (valores não medidos) | `group` com `group-label` de `level` e disclosure opcional                    | o rótulo é um cabeçalho com nível; a contagem é texto do consumidor no rótulo            | `recusar`: a régua duplica a quebra que o grupo já faz na linha | — |

## 7. Superar

| Critério        | ReUI                                                                 | Slotted hoje                                                                                            | Alvo                                           | Fonte |
| --------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----- |
| Pixel grid      | passa: 16, 24, 28, 32; linha 2px                                      | passa no critério: 13, 21, `dense` 9 e 17, `fresh`/`more` 30, `group-trigger` 24; a caixa do marcador assenta em y 49.25 e 50.5 | `--_lift` arredondado (linha 1)                | `c-timeline-3-light-1280`; `timeline/slotted-light-720`, `-dense` |
| Hover           | falha: `collapsible-trigger` `{}`                                    | falha: `fresh` clareia para a página no claro (L 0.932 → 0.970) e iguala a página no escuro (0.187 contra 0.188) | camada de estado a 8% (linha 2)                | `timeline/slotted-{light,dark}-720-…-611ce8`, índice 2 |
| Press           | falha: `collapsible-trigger` `{}`; ligações com `active` igual a `hover` | falha: `fresh` `active` `{}` no claro e no escuro; `group-trigger` `active` igual a `hover` no escuro e no alto contraste | camada a 14%; `translate` 1px no `group-trigger` (linhas 2 e 4) | `timeline/…-611ce8`, índices 0, 1, 2 |
| Focus           | falha: `outline` auto 1px                                            | passa: 2px, offset 2px; 5.17:1 claro, 7.29:1 escuro, 21:1 alto contraste                                | sem mudança                                    | `timeline-3-…-75b002`; `timeline/…-611ce8` |
| Transition      | falha: `transition-property: all`                                    | passa: `group-trigger` lista `color`; `fresh` e `more` listam `background-color, border-color, color`   | `translate` entra na lista do `group-trigger` (linha 4) | `timeline/slotted-light-720-…-611ce8` |
| Motion          | falha: mesma curva nos dois sentidos no chevron                      | falha: chevron em `--slotted-easing-standard`; `group-list` aparece e desaparece sem transição          | linhas 5 e 6                                   | `timeline/slotted-light-720.json` |
| Reduced motion  | falha: 0.15s e 0.2s mantidos                                         | passa: 0.001s                                                                                            | sem mudança                                    | `timeline-3-light-1280-motion-reduce`; `timeline/slotted-light-720-motion-reduce` |
| Disabled        | sem exemplo                                                          | sem parte desativável no contrato                                                                        | sem mudança                                    | `specs/components/timeline/contract.json` |
| Schemes         | sem alto contraste nem cores forçadas                                | passa: alto contraste com núcleo `rgb(0,0,0)` e linha `rgb(0,0,0)`; cores forçadas com `outline` no atual | sem mudança                                    | `timeline/slotted-high-contrast-720`, `-forced` |
| Density and RTL | —                                                                    | passa: `dense` mantém a anatomia (ponto 9, emblema 17); `rtl` espelha (marcador x 758, linha centrada em 764.5) | sem mudança                                    | `timeline/slotted-light-720-dense`, `-rtl` |
| Target size     | `collapsible-trigger` 638 × 50                                       | passa: `group-trigger` 24 de altura, `fresh` e `more` 30                                                 | sem mudança                                    | `timeline/slotted-light-720-…-611ce8` |
| Intent          | —                                                                    | falha: os comentários do cabeçalho e do emblema dizem "one step of air on each side" e "two pixels off the ring"; o glifo mede 12 num emblema de 21, a 4.5px da aresta | comentários reescritos com a geometria medida (linha 8) | `timeline.css`, regra da raiz e regra do emblema; `timeline/slotted-light-720.json` |

## 8. Delta

| #   | Ficheiro                                                                  | Mudança                                                                                                                                                                                                          | Linhas do dossiê que resolve               | Captura que o prova |
| --- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------- |
| 1   | `packages/styles/src/timeline/timeline.css`                               | `--_lift: round(nearest, calc((1lh - var(--_marker)) / 2), 1px)` no marcador e na regra de refluxo horizontal                                                                                                    | § 3 y do ponto; § 7 Pixel grid             | `timeline/slotted-light-720.json`: y 49; `-dense`: y 51 |
| 2   | `packages/styles/src/timeline/timeline.css`, `timeline.tokens.json`        | hover e active de `fresh`: `color-mix(in oklab, var(--_tone-surface), currentColor var(--slotted-timeline-state-layer-hover, 8%))` e `…-active, 14%`; saem `--slotted-tone-accent-subtle-hover` e `-active` da lista de tokens | § 4 `fresh`; § 7 Hover, Press              | `timeline/slotted-{light,dark,high-contrast}-720-…-611ce8`, índice 2: hover mais escuro no claro, mais claro no escuro; active ≠ hover |
| 3   | `packages/styles/src/timeline/timeline.css`                               | `:active` de `fresh` e `more`: `transition-duration: var(--slotted-duration-instant)`                                                                                                                            | § 4 `more` active                          | `timeline/slotted-light-720-…-611ce8`, `transition-duration` no active |
| 4   | `packages/styles/src/timeline/timeline.css`                               | `group-trigger:enabled:active`: `color: var(--_strong)`, `translate: 0 var(--slotted-border-width-thin, 1px)`; `transition` passa a `color` e `translate` em `--slotted-duration-instant`                     | § 4 `group-trigger` active; § 7 Press      | `timeline/…-611ce8`, índices 0 e 1: `translate` no active nos três esquemas |
| 5   | `packages/styles/src/timeline/timeline.css`                               | chevron fechado: `--slotted-easing-exit`; `[data-open]`: `--slotted-easing-enter`; 200ms nos dois                                                                                                                | § 5 chevron; § 7 Motion                    | `timeline/slotted-light-720.json`, `transition-timing-function` do ícone aberto e do fechado |
| 6   | `packages/styles/src/timeline/timeline.css`                               | decisão do portão. Opção A: `group-list` entra com `opacity` 0 → 1 em 200ms `--slotted-easing-enter` por `@starting-style`, e sai em 120ms `--slotted-easing-exit` com `display … allow-discrete`; sem deslizar, o que respeita o motivo do desenho § 7; custo: um grupo aberto no primeiro render também aparece por 200ms. Opção B: manter a decisão do desenho; a linha Motion fica `recusar` com esse motivo | § 5 lista do grupo; § 7 Motion             | Opção A: `timeline/slotted-light-720.json`, `transition` de `group-list` |
| 7   | `packages/styles/src/timeline/timeline.css`                               | decisão do portão. Opção A: manter o avatar a 21. Opção B: avatar no marcador a `--slotted-avatar-size-xs` à paridade da linha (25 confortável, 21 `dense`; iniciais 10px), e o trilho alarga-se a esse valor quando há avatar | § 3 marcador com avatar                    | Opção B: `timeline/slotted-light-720.json`, cena `content`: avatar 25 × 25 |
| 8   | `packages/styles/src/timeline/timeline.css`                               | comentários da raiz e do emblema reescritos: emblema = ícone + um passo de ar a cada lado à paridade da linha (21); glifo = ícone − um passo a cada lado (12), a 4.5px da aresta                                 | § 7 Intent                                 | `timeline.css` |
| 9   | `packages/styles/src/timeline/timeline.styles.test.mjs`                   | asserções: `--_lift` com `round(`; `fresh` com `color-mix` e `currentColor` no hover e no active; `group-trigger` com `translate` no active                                                                   | linhas 1, 2, 4                             | `pnpm check:affected` |

Nenhuma linha edita `contract.json`. Nenhuma linha é `outra família`. A saída de `fresh` (§ 5) fica fora: exige mudar `fresh.when` no contrato, o que passaria a execução a `build`.

### Portão e aplicação

Portão de 2026-09-29: linha 6 com a opção A, linha 7 com a opção B, restantes linhas como escritas. A linha 6 substitui a frase "o painel de um grupo abre e fecha por `hidden` sem transição" de `2026-09-14-timeline-design.md` § 7: a lista esvanece e não desliza, o que mantém o motivo dessa decisão. A linha 7 substitui a linha "emblema … 21 px" da tabela do marcador em § 6 do mesmo documento para o caso do avatar.

Recaptura (`slotted-*-720`, estados `611ce8`):

| #   | Valor medido depois |
| --- | ------------------- |
| 1   | marcadores confortáveis em y 49, 136, 191, 292; `dense` primeiro marcador em y 51 |
| 2   | hover de `fresh`: L 0.932 → 0.896 claro, 0.222 → 0.269 escuro, 1.000 → 0.951 alto contraste; active 0.870, 0.304, 0.915 |
| 3   | regra `:is([data-part='fresh'], button[data-part='more']):enabled:active` com `--slotted-duration-instant`; o specimen não lista `transition-duration` nos deltas |
| 4   | active de `group-trigger`: `translate` none → `0px 1px` nos três esquemas; `transition-property: color, translate` |
| 5   | chevron aberto `cubic-bezier(0.05, 0.7, 0.1, 1)` (`easing-enter`); fechado `cubic-bezier(0.3, 0, 0.8, 0.15)` (`easing-exit`) |
| 6   | `group-list` aberta: `opacity` 0.2s `easing-enter`; `--motion reduce`: 0.001s |
| 7   | avatar no marcador 25 × 25, iniciais 10px; trilho 25 na cena `content` |
| 8   | comentários da raiz, de `--_badge` e da regra do emblema com 21, 12 e 4.5px |

Reaberto: em `dense`, os marcadores do segundo evento em diante assentam em y x.5 (128.5, 267.5). A causa não é o `--_lift`: o evento começa em x.5 porque `description` e `actor` ficam em `--slotted-font-size-sm` (13px, linha 19.5) enquanto o título desce a 12px (linha 18). A descrição fica maior do que o título em `dense` e em `size="sm"`; a correção muda a escala de tipo do desenho § 7 e fica para a próxima passagem.

### Segunda passagem: escala de tipo e grelha de píxel

A linha reaberta acima foi resolvida numa segunda passagem `polish`. A contagem cobre as 61 partes emolduradas (`marker`, `fresh`, `more`, `group-trigger`) com y, x ou altura fracionários, em `slotted-light-720`.

| #   | Ficheiro | Mudança | Antes | Depois |
| --- | -------- | ------- | ----- | ------ |
| 10  | `timeline.css`, `timeline.tokens.json` | `actor`, `description`, `group-label`, `fresh` e `more` em `--_meta-size`, que é o tamanho do título; sai `--slotted-font-size-sm` | descrição 13px sob título 12px em `dense` e `size="sm"` | 12px sob 12px em `dense`; 13px sob 13px em `md` |
| 11  | `timeline.css` | `--_leading: round(up, calc(var(--_font-size) * var(--_line-height)), 1px)` na raiz, no `rail` e no `group-label` | linha 19.5 em `md`; eventos de uma linha com 19.5 de altura | linha 20 em `md`, 18 em `dense` |
| 12  | `timeline.css` | `group-label` em `display: flex` | 26.5 com `group-trigger` | 24 |
| 13  | `timeline.css` | `padding` da lista horizontal em `round(up, var(--_reach), 1px)` | 3.5; todas as cenas seguintes em x.5 | 4 |
| 14  | `timeline.css` | primeira coluna de `alternate` em `round(down, …, 1px)` | trilho em x 378.5 | x 378; linha centrada em 384.5 no marcador de 13 |

Partes emolduradas fracionárias: 24 → 0 em `comfortable`, `compact` e `dense`; em `rtl` restam 3 (`fresh` e dois `group-trigger`), cujo x depende da largura do texto, isenta pelo critério Pixel grid.

### Passagem `build`: saída de `fresh` e foco depois de revelar

A linha "`fresh` a entrar e a sair" de § 5 exigia mudar `fresh.when` no contrato, e a execução passou a `build` para ela. A mesma leitura mostrou um defeito de acessibilidade: a binding desmontava a pílula quando `freshCount` descia a zero, e quem a tinha pressionado ficava com o foco no `body`.

Decisões:

| Decisão | Forma | Custo |
| ------- | ----- | ----- |
| A pílula fica montada | `contract.fresh.mount`: montada desde o primeiro render com `freshCount > 0`; `hidden` a zero, com a última contagem como texto | um `button` escondido na timeline que já recebeu eventos novos; nenhum na que nunca recebeu |
| Entrada e saída | `@starting-style`: `opacity` 0 e `translate` de −`--slotted-space-2` para 0 em 200ms `easing-enter`; `[hidden]`: o inverso em 120ms `easing-exit` com `display … allow-discrete` e `pointer-events: none` | a lista sobe a altura da pílula no fim dos 120ms |
| Foco depois de revelar | `contract.fresh.focus` e `revealFocusIndex` em `@slotted/core/timeline`: primeiro evento para `newest-first`, carregados − revelados para `oldest-first`; um `article` recebe o foco, um `li` passa-o ao primeiro tabbable | só quando o foco estava na pílula; noutro caso nada muda |
| Nome do output na página Angular | a nota da cena `fresh` passa de `onReveal` a `(revealRequest)` | — |

Provas:

| Prova | Resultado |
| ----- | --------- |
| `specs/components/timeline/contract.test.mjs` | 18/18; o teste novo falhou antes de `contract.json` mudar |
| `packages/core/src/timeline/timeline.test.ts` | 25/25; os quatro casos de `revealFocusIndex` falharam antes da função |
| `packages/react/src/timeline` | 47/47; três testes novos falharam antes da binding |
| `packages/angular/timeline` | 29/29 |
| Cenário no Chrome, célula `light-720` do harness, `prefers-reduced-motion: no-preference` | `fresh` e `group-list`: `display: flex` com `opacity` 0.989 dois quadros depois de `hidden`; `display: none` aos 400ms; `opacity` 0 no primeiro quadro da reentrada e 1 aos 400ms |
| O mesmo cenário com `reduce` | saída no quadro seguinte (`display: none`), durações colapsadas |
| `tools/harness/audit.mjs` nas duas páginas de referência | saída 0 |

Com isto, a linha Motion de § 7 passa: chevron, `group-list` e `fresh` têm entrada e saída em tokens de movimento, com a saída mais curta do que a entrada.

### Revisão de 2026-09-30: dobra dos grupos e glifo do emblema

Dois defeitos relatados depois da passagem `build`: a dobra dos grupos "travada", e o ícone do emblema deslocado com zoom grande.

**Dobra.** Amostragem por quadro no Chrome (`prefers-reduced-motion: no-preference`, cena `groups`, célula `light-720`), y do grupo seguinte:

| Momento | Antes | Depois |
| ------- | ----- | ------ |
| fecho, primeiros quadros | `opacity` 0.99, 0.96, 0.90 aos 22, 38 e 55ms (`easing-exit` atrasa o início) | 0.59 aos 35ms |
| fecho, página abaixo | parada em 142 até aos 122ms, depois 142 → 86 num quadro | 150 → 124 → 103 → 94 → 89 → 87 → 86 |
| fecho, fim | lista a 138ms, chevron a 205ms | lista e chevron a 202ms |
| abertura, página abaixo | 86 → 150 no primeiro quadro | 86 → 92 → 125 → 138 → 145 → 148 → 150 |
| repouso depois de abrir | 150, contra 142 antes de fechar | 150 nos dois sentidos |

A lista fechada deixa de sair do layout: `block-size: 0`, `visibility: hidden` e `overflow: clip` com margem de recorte para o anel do atual e o anel de foco, com `interpolate-size: allow-keywords`. Sem `@starting-style`, um grupo aberto no primeiro render não cresce ao carregar a página. Lista, chevron e margem do rótulo partilham `--_fold`: `--slotted-duration-medium` e `--slotted-control-transition-easing`, o movimento de `collapsible`, nos dois sentidos. O `fresh` passa ao mesmo movimento, com altura, borda e margem: a pílula mede 30 → 27 → 0 ao sair e 2 → 30 ao entrar.

Isto substitui, para a dobra e para o `fresh`, a regra `easing-enter` a entrar e `easing-exit` a sair da linha Motion de § 7. `.claude/skills/component/references/polish-lenses.md` › Precedence regista o conflito sobre a curva de saída como não decidido; a medida acima é a evidência a favor da curva de desaceleração nos dois sentidos para uma dobra.

**Glifo do emblema.** A caixa do glifo estava centrada no DOM (desvio 0), mas o PNG capturado com `deviceScaleFactor` real mostrava a tinta meio píxel CSS à direita e abaixo do centro em todos os fatores: margens esquerda/direita de 30/26 a 4× e 37/32 a 5× no harness; 22/18 e 28/24 com o Lucide `CreditCard` do Storybook React. O emblema é ímpar (21) para a linha passar no meio, o glifo era par (12), e a caixa ficava a 4.5px da aresta. O glifo passa à paridade do emblema: `calc(var(--_badge) - 2 * round(down, (var(--_badge) - var(--_glyph)) / 2, 1px))`, 13 em 21, 11 em 17 no `dense`.

| Fator | Harness antes (E/D/C/B) | Harness depois | Storybook React depois |
| ----- | ----------------------- | -------------- | ---------------------- |
| 1 | 7/6/7/6 | 6/6/6/6 | 4/4/6/6 |
| 2 | 15/13/15/13 | 13/13/13/13 | 9/9/12/12 |
| 3 | 22/19/22/19 | 20/20/20/20 | 13/13/18/18 |
| 4 | 30/26/30/26 | 26/26/26/26 | 18/18/24/24 |
| 5 | 37/32/37/32 | 33/33/33/33 | — |

Em fatores fracionários (1.25, 1.5) resta no máximo 1 píxel de dispositivo, o arredondamento do próprio disco (31.5 → 32 a 1.5×).
