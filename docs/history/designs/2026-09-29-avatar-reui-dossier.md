# Dossiê ReUI — avatar e avatar group

## 0. Cabeçalho

- Famílias: `avatar` (membro `avatar`) e `avatar-group` (membro `avatarGroup`)
- Modo: `polish`
- Data: 2026-09-29
- HEAD: `18cf9829` (ramo `review/implementation-pass-1`)
- Specimens: `tools/harness/out/specimen/<item>/`, `tools/harness/out/specimen/avatar/` e `tools/harness/out/specimen/avatar-group/`
- Fontes ReUI: `tools/harness/out/specimen/reui-src/c-avatar-<n>.json` (35 exemplos) e `reui-src/avatar-primitive.json`

## 1. Seleção

Cobertura: `direta`. O ReUI publica 35 exemplos `c-avatar-*`. O primitivo é o `Avatar` do shadcn/ui: `https://reui.io/r/avatar.json` responde 404; a fonte foi lida em `https://ui.shadcn.com/r/styles/base-nova/avatar.json` (partes `avatar`, `avatar-image`, `avatar-fallback`, `avatar-badge`, `avatar-group`, `avatar-group-count`).

Termos pesquisados em `llms-full.txt` (2188 linhas): `avatar` 164, `avatar group` 12, `avatar-group` 0, `AvatarGroup` 16, `avatar stack` 4, `facepile` 0, `presence` 6, `team member` 3, `assignee` 8.

| Item                  | Tipo         | Rota                                  | Parte ou interação Slotted que informa                                   | Capturas                                                          |
| --------------------- | ------------ | ------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `c-avatar-3`          | Free example | `/preview/base/example/c-avatar-3`    | escala de tamanhos de `root`                                             | `light-1280`, `dark-1280`, `-motion-reduce`                       |
| `c-avatar-6`          | Free example | `/preview/base/example/c-avatar-6`    | `image` com marca de presença no canto                                   | `light-1280`, `dark-1280`, `-motion-reduce`                       |
| `c-avatar-11`         | Free example | `/preview/base/example/c-avatar-11`   | `avatar-group` `stack`, `overflow`                                       | `light-1280`, `dark-1280`, `-motion-reduce`; estados de `avatar`  |
| `c-avatar-14`         | Free example | `/preview/base/example/c-avatar-14`   | `fallback` com iniciais, `variant="soft"` por tom                        | `light-1280`, `dark-1280`, `-motion-reduce`                       |
| `c-avatar-22`         | Free example | `/preview/base/example/c-avatar-22`   | membro interativo levantado sob o ponteiro                               | `light-1280`, `light-720`, `dark-1280`, `-motion-reduce`; estados de `avatar` e de `tooltip-trigger` |
| `card-15`             | Pro block    | `/preview/base/card-15`               | grupo de participantes com contagem num cartão                           | `light-1280`, `dark-1280`; estados de `avatar`                    |
| `navbar-7`            | Pro block    | `/preview/base/navbar-7`              | copresença numa barra de ferramentas                                     | `light-1280`, `dark-1280`; estados de `avatar`                    |
| `data-grid-columns-2` | Pro block    | `/preview/base/data-grid-columns-2`   | grupo de responsáveis numa célula de tabela                              | `light-1280`, `dark-1280`                                         |

Slotted: `slotted-{light,dark,high-contrast}-720`, `-motion-reduce`, `-forced`, `-dense`, `-rtl` nas duas famílias; estados de `[data-scene=interactive] [data-ui=avatar]` (`e6797c`) nos três esquemas, e em `-motion-reduce` no grupo.

## 2. Anatomia

| `data-slot` ReUI     | Parte Slotted                                   | Estado              |
| -------------------- | ----------------------------------------------- | ------------------- |
| `avatar`             | `avatar` › `root`                               | igual               |
| `avatar-image`       | `avatar` › `image`                              | igual               |
| `avatar-fallback`    | `avatar` › `fallback`                           | igual               |
| `avatar-badge`       | `badge` com `shape="dot"` dentro de `BadgeAnchor` | em falta no Slotted; coberta pela família `badge` (§ 6) |
| `avatar-group`       | `avatar-group` › `root`                         | igual               |
| —                    | `avatar-group` › `item`                         | só no Slotted       |
| `avatar-group-count` | `avatar-group` › `overflow`                     | igual               |

## 3. Medidas

Largura de página: ReUI 1280, e 720 para `c-avatar-22`; Slotted 720. Nenhuma propriedade abaixo varia com a largura: o rect de `avatar` em `c-avatar-22` é 32 × 32 nas duas larguras.

| Parte              | Propriedade          | ReUI                                                          | Slotted hoje                                                  | Alvo                                                      | Veredicto |
| ------------------ | -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- | --------- |
| `root`             | rect por tamanho     | 24, 32, 40 (`c-avatar-3`); 20 e 24 nos blocos Pro             | 24, 28, 36, 48, 64; `dense` 20, 24, 28, 36, 48                | sem mudança                                               | `superar`: cinco degraus e densidade; os 20 e 24 dos blocos Pro existem em `xs` e `sm` de `dense` |
| `root`             | borda                | 0; o anel é um `::after` de 1px `oklch(0.922 0 0)` com `mix-blend-mode: darken` sobre a foto | 1px na própria caixa, `border-box`; foto recortada dentro do anel | sem mudança                                            | `recusar`: o registo em `avatar.css` (a costura de duas curvas rasterizadas à parte) mediu o pseudo-elemento e trocou-o |
| `root` `soft`      | fundo e texto        | tom a 10% (`oklab(0.205 0 0 / 0.1)`) sobre a página, texto no tom (`c-avatar-14`) | `--slotted-tone-*-surface` e `--slotted-tone-*-text`, anel `--slotted-tone-*-border` | sem mudança                          | `superar`: em alto contraste o anel do tom mantém o disco (`slotted-high-contrast-720`, borda `rgb(0,0,0)`); o ReUI não tem esse esquema |
| `root` `square`    | radius               | não medido (`c-avatar-4` não capturado)                       | `size / 6`: 10.6667 em 64, 4.66667 em 28                      | `round(nearest, calc(var(--_size) / 6), 1px)`: 11 e 5     | `adaptar`: um radius fracionário antialiasa o canto em dois píxeis parciais |
| `fallback`         | font-size            | 14 em 32 (0.4375), 12 (`text-xs`) em `c-avatar-22`            | `size × 0.4`: 9.6, 11.2, 14.4, 19.2, 25.6                     | sem mudança                                               | `adaptar`: proporção documentada em `avatar.css`; 14.4 em 36 fica a 0.4 px da proporção ReUI |
| `fallback`         | font-weight          | 400                                                           | 500 (`--slotted-font-weight-medium`)                          | sem mudança                                               | `recusar`: iniciais são rótulo; 500 é o peso de rótulo da biblioteca |
| `fallback`         | line-height          | 20 (caixa de linha)                                           | 1, com `text-box: trim-both cap alphabetic`                   | sem mudança                                               | `superar`: o Slotted centra a tinta, não as métricas (registo em `avatar.css`) |
| `avatar-group`     | sobreposição         | 8 em 32 (0.25, `c-avatar-11`: 104 = 32 + 3 × 24); 8 em 24 (0.33, `card-15`); 4 em 20 (0.20, `data-grid-columns-2`) | `size × 0.28`: 10.08 em 36, 7.84 em 28, 6.72 em 24 | `round(nearest, calc(var(--_size) * var(--_overlap)), 1px)`: 10, 8, 7 | `adaptar`: membros em x fracionário, 50.92, 76.84, 102.77, 128.69 (`avatar-group/slotted-light-720.json`) |
| `avatar-group`     | anel de separação    | 2px `--background` em todos os membros, em repouso            | 0 em repouso; 2px `--slotted-surface` só no membro levantado  | sem mudança                                               | `recusar`: decisão AG1 registada em `avatar-group.css`; o anel em repouso é um segundo contorno sobre cada face |
| `overflow`         | fundo e texto        | `oklch(0.97 0 0)` e `oklch(0.556 0 0)` (muted)                | `secondary` `soft`: `rgb(226,232,240)` e `rgb(23,32,51)`      | sem mudança                                               | `superar`: o texto do Slotted é o do tom `secondary`; o muted ReUI é cinza sobre cinza |
| `overflow`         | font-size            | 14 em 32 (0.4375); 10 em 24 (0.417); 9 em 20 (0.45)           | `size × 0.32`: 11.52 em 36, 7.68 em 24, 8.96 em 28 `dense`    | decisão do portão (§ 8, linha 9)                          | `adaptar`: 7.68 em `xs` fica abaixo dos 9 do bloco Pro a 20 px |
| `overflow`         | numerais             | proporcionais                                                 | `tabular-nums`                                                | sem mudança                                               | `superar`: a caixa não oscila ao atravessar uma potência de dez |
| `avatar-badge`     | rect e anel          | 10 × 10 em 32, anel 2px `--background`                        | —                                                             | —                                                         | `outra família`: `badge` (§ 6) |

## 4. Coreografia de estados

Deltas copiados de `states[].deltas`. ReUI: só `c-avatar-22` tem estados; `c-avatar-11`, `card-15` e `navbar-7` devolvem `hover: {}` e `active: {}` num avatar não focável.

| Parte                              | Estado        | Delta ReUI                                                          | Delta Slotted hoje                                                                                         | Alvo |
| ---------------------------------- | ------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---- |
| `avatar` interativo, iniciais      | hover         | —                                                                   | borda do tom → `border-strong`: `rgb(37,99,235)` → `rgb(120,137,156)`; alto contraste: `{}`                | camada de estado sobre o fundo, `currentColor` a 8% (a camada de `tag`); a borda do tom fica |
| `avatar` interativo, foto          | hover         | —                                                                   | `rgb(216,222,230)` → `rgb(120,137,156)`; alto contraste: `{}`                                              | borda → `border-strong` fica; alto contraste em aberto (§ 8, linha 2) |
| `avatar` interativo                | active        | —                                                                   | igual ao hover                                                                                             | camada a 14% nas iniciais; distinto do hover nos três esquemas |
| `avatar` interativo                | focus-visible | `tooltip-trigger`: `outline-style` none → auto, `outline-width` 3px → 1px | `outline` 2px sólido, offset 2px, `--slotted-focus-ring-color`                                        | sem mudança |
| `avatar` interativo                | disabled      | —                                                                   | cor `rgb(100,116,139)` sobre `rgb(226,232,240)`; foto `grayscale(1) opacity(0.5)`; sem hover                | sem mudança |
| membro de `avatar-group` `stack`   | hover         | `translate` none → `0px -4px`; `box-shadow` += `0 4px 6px -1px`, `0 2px 4px -2px` a 0.1 | `transform` → `translateY(-4px)`; `box-shadow` += anel 2px `--slotted-surface` e `--slotted-shadow-sm`; borda do tom → `border-strong` | a borda do tom fica (linha 1); o resto sem mudança |
| membro de `avatar-group` `stack`   | active        | igual ao hover                                                      | igual ao hover                                                                                             | `translateY(-2px)`: metade do levantamento, o membro assenta sob a pressão |
| membro de `avatar-group` `stack`   | focus-visible | `outline` auto 1px no `tooltip-trigger`                             | `translateY(-4px)`, `outline` 2px, offset 2px                                                              | sem mudança |
| membro, `--motion reduce`          | hover         | igual ao hover sem redução                                          | `transform` `matrix(1,0,0,1,0,0)`, anel 2px, sombra transparente                                           | sem mudança |

## 5. Movimento

| Transição                         | ReUI                                                                | Slotted hoje                                                        | Alvo |
| --------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ---- |
| levantamento do membro            | `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`, igual nos dois sentidos | `transform`, `box-shadow`, 120ms (`--slotted-duration-short`), `--slotted-easing-standard` nos dois sentidos | entrada (`:hover`, `:focus-visible`) com `--slotted-easing-enter`, saída com `--slotted-easing-exit`, 120ms nos dois |
| cor da borda do membro no grupo   | coberta por `all`                                                   | fora da lista: a regra do grupo substitui `transition: border-color` do avatar | a lista do `root` passa a `border-color, background-color, box-shadow, transform`; o grupo deixa de a redeclarar |
| chegada da foto                   | nenhuma: o Base UI troca `fallback` por `image` num quadro           | `opacity` 0 → 1 em 120ms, `--slotted-easing-standard`; `fallback` sai em simultâneo | `image` entra com `--slotted-easing-enter`; `fallback` sai com `--slotted-easing-exit`; 120ms |
| movimento reduzido                | `c-avatar-22-light-1280-motion-reduce`: 0.3s mantidos                | 0.001s no avatar; `transition: none`, levantamento 0 e sombra transparente no grupo | sem mudança |

## 6. Capacidades

| Capacidade                          | Onde aparece no ReUI                         | Forma no ReUI                                                   | Forma no Slotted                                                  | Em que a forma Slotted é melhor                                           | Veredicto | Família dona, se não esta |
| ----------------------------------- | -------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- | --------- | ------------------------- |
| marca de presença no canto          | `c-avatar-6`, `-7`, `-8`, `-9`, `-18`, `-34` | `<AvatarBadge className="bg-green-500">` filho do avatar, cor por classe | `<BadgeAnchor overlap="circle">` com `Avatar` e `Badge shape="dot" tone="success"` | uma implementação de marca ancorada; tom semântico em vez de cor literal | `adiar para badge` | `badge` |
| contagem com ícone                  | `c-avatar-12`, `-29`                         | `<AvatarGroupCount>` com qualquer conteúdo                      | `overflow` gerado a partir de `max`                               | a contagem é derivada dos dados, não escrita à mão                        | `recusar`: um ícone de convite é uma ação; pertence a um `Button` depois da lista, não a um item dela | — |
| nome sob o ponteiro                 | `c-avatar-22`, `-24`, `-29`                  | `Tooltip` com `TooltipTrigger` a envolver cada avatar           | `Avatar` com `render` de `button` ou `a` dentro de `Tooltip`      | as duas formas coincidem                                                  | `adiar para tooltip` | `tooltip` |
| expansão do grupo sob o ponteiro    | `c-avatar-23`                                | `translate-x` por índice em cada item, `scale-110`, 300ms       | —                                                                 | —                                                                         | `recusar`: todos os membros deslocam-se sob o ponteiro, e o alvo que o ponteiro visava muda de x; `text-scale.test.mjs` proíbe escalar uma caixa com iniciais | — |
| indicador de carga sobre o avatar   | `c-avatar-30`                                | `Spinner` sobre um véu `bg-background/60`                        | `status="loading"` mantém as iniciais na mesma caixa              | o conteúdo de reserva ocupa a caixa final; nenhum indicador para uma espera que não bloqueia | `recusar`: regra do skill `loading-states` | — |
| anel animado                        | `c-avatar-32`, `-33`                         | anel com animação infinita                                      | —                                                                 | —                                                                         | `recusar`: decoração em ciclo infinito; um estado vivo pertence a `status-indicator` | — |
| filtro cinzento na foto             | `c-avatar-17`                                | `grayscale` por classe                                          | `disabled`: `--slotted-avatar-disabled-image-filter`              | o filtro está ligado a um estado declarado no contrato                    | `adotar`: já presente | — |
| tamanho livre                       | `c-avatar-5`                                 | `className="size-12"`                                           | `style="--slotted-avatar-size: 6rem"`                             | iniciais e glifo acompanham o tamanho por proporção                        | `adotar`: já presente | — |
| avatar dentro de botão              | `c-avatar-19`, `-26`, `-27`                  | `Avatar` filho de `Button`                                      | composição no `button`                                            | as duas formas coincidem                                                  | `adiar para button` | `button` |

## 7. Superar

| Critério        | ReUI                                                                 | Slotted hoje                                                                              | Alvo                                           | Fonte |
| --------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------- | ----- |
| Pixel grid      | passa: 20, 24, 32, 40                                                | passa: 24–64, `dense` 20–48                                                               | sem mudança                                    | `c-avatar-3-light-1280`, `avatar/slotted-light-720`, `-dense` |
| Hover           | `c-avatar-22`: `translate` e `box-shadow`                            | falha: `avatar` isolado em alto contraste devolve `{}` nos três elementos                 | camada de estado a 8% (linha 1)                | `avatar/slotted-high-contrast-720-data-scene-interactive-d-e6797c` |
| Press           | falha: `active` igual a `hover`                                      | falha nas duas famílias: `active` igual a `hover`                                         | camada a 14%; membro a `translateY(-2px)`      | `c-avatar-22-…-avatar-d2448e`; `avatar/…-e6797c`, `avatar-group/…-e6797c` |
| Focus           | falha: `outline` auto 1px                                            | passa: 2px, offset 2px; 5.17:1 claro, 7.29:1 escuro, 21:1 alto contraste                  | sem mudança                                    | `c-avatar-22-…-tooltip-trigge-5e3c46`; `avatar/…-e6797c` |
| Transition      | falha: `transition-property: all`, 0.3s                              | falha no grupo: `border-color` muda no hover e a lista é `transform, box-shadow`          | lista completa no `root` (linha 3)             | `avatar-group/slotted-light-720-data-scene-interactive-d-e6797c` |
| Motion          | falha: mesma curva nos dois sentidos                                 | falha: levantamento e chegada da foto em `--slotted-easing-standard`                      | `easing-enter` na entrada, `easing-exit` na saída | `avatar-group/slotted-light-720.json` (`transition-timing-function`) |
| Reduced motion  | falha: 0.3s sob `--motion reduce`                                    | passa: 0.001s; levantamento 0                                                             | sem mudança                                    | `c-avatar-22-light-1280-motion-reduce`; `avatar/slotted-light-720-motion-reduce` |
| Disabled        | sem exemplo                                                          | passa: `--slotted-disabled-foreground` sobre `--slotted-disabled-background`, 3.86:1, 3.67:1, 7.00:1; sem `opacity: 0.5` no rótulo | sem mudança          | `avatar/slotted-{light,dark,high-contrast}-720` |
| Schemes         | sem alto contraste nem cores forçadas                                | passa: alto contraste com borda `rgb(0,0,0)`; cores forçadas com borda `currentColor`     | sem mudança                                    | `avatar/slotted-high-contrast-720`, `-forced` |
| Density and RTL | —                                                                    | passa: `dense` mantém a anatomia; `rtl` espelha a pilha (739.00 → 713.08 → 687.16)        | sem mudança                                    | `avatar-group/slotted-light-720-dense`, `-rtl` |
| Target size     | `tooltip-trigger` 32 × 32                                            | passa: `xs` 24; `dense` 20 com alvo `::after` de 24                                       | sem mudança                                    | `avatar/slotted-light-720-dense` |
| Intent          | —                                                                    | falha: o comentário de `--_overlap` diz 0.22 e "um quarto recorta, um quinto não"; o valor é 0.28 | comentário reescrito com a medida de 0.28 e o arredondamento | `avatar-group.css`, regra do `root` |

## 8. Delta

| #   | Ficheiro                                          | Mudança                                                                                                                                         | Linhas do dossiê que resolve                        | Captura que o prova |
| --- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------- |
| 1   | `packages/styles/src/avatar/avatar.css`           | hover interativo sem foto: fundo `color-mix(in oklab, <fundo>, currentColor 8%)`; a borda do tom fica; `border-strong` só em `data-status='loaded'` | § 4 hover com iniciais; § 7 Hover                   | `avatar/slotted-high-contrast-720-…-e6797c`, índices 0 e 2 com `background-color` no delta |
| 2   | `packages/styles/src/avatar/avatar.css`           | alto contraste, foto: hover vazio. Proposta: anel `--slotted-border-width-thin` em `border-strong` no hover da foto. Decisão do portão         | § 4 hover com foto                                  | `avatar/slotted-high-contrast-720-…-e6797c`, índice 1 |
| 3   | `packages/styles/src/avatar/avatar.css`           | `:active` interativo: camada a 14%; foto: anel da linha 2 a `--slotted-border-width-medium`                                                   | § 4 active; § 7 Press                               | `avatar/…-e6797c`, `active` ≠ `hover` nos três esquemas |
| 4   | `packages/styles/src/avatar/avatar.css`, `packages/styles/src/avatar-group/avatar-group.css` | `transition-property: border-color, background-color, box-shadow, transform` no `root`; a regra do grupo passa a declarar só a curva | § 5 cor da borda; § 7 Transition                    | `avatar-group/slotted-light-720.json`, `transition-property` do membro |
| 5   | `packages/styles/src/avatar-group/avatar-group.css` | membro em repouso com `--slotted-easing-exit`; `:hover` e `:focus-visible` com `--slotted-easing-enter`                                      | § 5 levantamento; § 7 Motion                        | `avatar-group/slotted-light-720.json`, `transition-timing-function` em repouso |
| 6   | `packages/styles/src/avatar-group/avatar-group.css` | `:active` do membro: `translateY(calc(var(--_raise-lift) / 2))`, −2px                                                                        | § 4 active do membro; § 7 Press                     | `avatar-group/…-e6797c`, `transform` do `active` `matrix(1,0,0,1,0,-2)` |
| 7   | `packages/styles/src/avatar/avatar.css`           | `image` com `--slotted-easing-enter` em `loaded`; `fallback` com `--slotted-easing-exit`                                                       | § 5 chegada da foto; § 7 Motion                     | `avatar/slotted-light-720.json`, `transition-timing-function` de `image` |
| 8   | `packages/styles/src/avatar-group/avatar-group.css` | sobreposição `round(nearest, calc(var(--_size) * var(--_overlap)), 1px)`; comentário de `--_overlap` reescrito para 0.28                     | § 3 sobreposição; § 7 Intent                        | `avatar-group/slotted-light-720.json`, x dos membros inteiros (25, 51, 77, 103, 129) |
| 9   | `packages/styles/src/avatar-group/avatar-group.css` | tamanho do `overflow`. Opção A: 0.36 arredondado a 1px (13 em 36, 9 em 24, 7 em 20). Opção B: 0.4, igual às iniciais (14.4 em 36, 8 em 20); `+100` em 36 a verificar sem recorte. Decisão do portão | § 3 `overflow` font-size                    | `avatar-group/slotted-light-720.json`, cena `extremes` |
| 10  | `packages/styles/src/avatar/avatar.css`           | radius do `square`: `round(nearest, calc(var(--_size) / 6), 1px)`                                                                               | § 3 radius                                          | `avatar/slotted-light-720.json`, `border-top-left-radius` 11 e 5 |

Nenhuma linha edita `contract.json`. Nenhuma linha é `outra família`: a marca de presença, o nome sob o ponteiro e o avatar em botão ficam nas famílias donas (§ 6) sem mudança pedida.

### Portão e aplicação

Portão de 2026-09-29: linha 2 com o anel proposto; linha 8 com 0.28 arredondado; linha 9 com a opção A. A linha 3 inverte a regra "there is no press, because an avatar is not a command" de `2026-09-02-avatar-family-design.md`: com `render` em `a` ou `button` o avatar é um comando, e o critério Press exige resposta. `avatar.styles.test.mjs` passa a exigir `:active` protegido por `:not([data-disabled])`. O anel da foto no hover (linha 2) usa um seletor com um atributo a menos do que o levantamento do grupo, para que dentro de uma pilha o anel de superfície do grupo prevaleça.

Recaptura (`slotted-*-720`, estados `e6797c`):

| #   | Valor medido depois                                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | hover `a` `accent`: `background-color` `rgb(219,234,254)` → `oklab(0.896 …)` claro, `rgb(24,27,34)` → `oklab(0.269 …)` escuro, `rgb(255,255,255)` → `oklab(0.951 …)` alto contraste; borda do tom sem mudança |
| 2   | hover `button` `loaded`, alto contraste: `box-shadow` += `rgb(0,0,0) 0 0 0 1px`                                                                 |
| 3   | `active` ≠ `hover` nos três elementos e nos três esquemas: fundo `oklab(0.870 …)` claro; anel 2px na foto                                       |
| 4   | `transition-property` do membro no grupo: `border-color, background-color, box-shadow, transform`                                              |
| 5   | membro em repouso `cubic-bezier(0.3, 0, 0.8, 0.15)` (`easing-exit`); `:hover` e `:focus-visible` com `easing-enter`                             |
| 6   | `active` do membro: `matrix(1, 0, 0, 1, 0, -2)`; `--motion reduce`: `matrix(1, 0, 0, 1, 0, 0)`                                                  |
| 7   | `image` em `loaded` `cubic-bezier(0.05, 0.7, 0.1, 1)`; `fallback` visível com a mesma curva de entrada                                          |
| 8   | x dos membros `md`: 25, 51, 77, 103, 129; `dense`: 25, 45, 65, 85, 105; `rtl`: 739, 713, 687, 661, 635; nenhum x fracionário                     |
| 9   | `overflow`: 13px em 36, 9 em 24, 10 em 28 (`+99` sem recorte na cena `extremes`), 23 em 64                                                      |
| 10  | radius `square`: 11 em 64, 5 em 28, 6 em 36, 4 em 24                                                                                            |

Problema conhecido fora do delta: a 0.28 o membro seguinte cobre a segunda inicial (`GH`, `AT` na cena `stack` de `slotted-light-720.png`). O comentário anterior de `--_overlap` media esse recorte a partir de um quarto de sobreposição.
