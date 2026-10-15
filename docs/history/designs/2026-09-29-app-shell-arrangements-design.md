# Desenho — `app-shell`, arranjos (terceira passagem)

Entrada: `docs/history/designs/2026-09-29-app-shell-reui-dossier.md`. O que este documento não altera continua a valer como está em `2026-09-14-app-shell-redesign-design.md`.

O leitor é a família que herda as decisões.

## 1. Eixos

| Eixo | Antes | Depois | Por omissão |
| ---- | ----- | ------ | ----------- |
| `canvas` | `inset`, `flush` | `inset`, `flush`, `floating`, `panel` | `inset` |
| `primary` | `banner`, `nav` | `banner`, `nav`, `main` | `banner` |
| `separation` | `dividers: true \| false` | `rule`, `tone` | `rule` |

Cada valor de `canvas` define o plano de todas as regiões. O pacote não expõe um plano por região: uma combinação sem desenho próprio não existe, e cada uma das 24 combinações base tem cena no harness.

| `canvas` | Quadro | `nav` | `main` | `aside` |
| -------- | ------ | ----- | ------ | ------- |
| `inset` | fundo rebaixado | no quadro | cartão | cartão |
| `flush` | fundo rebaixado | folha de ponta a ponta | fundo | folha |
| `floating` | fundo rebaixado | cartão | cartão | cartão |
| `panel` | fundo rebaixado | dentro do cartão | dentro do cartão | dentro do cartão |

Cartão: `--_rule-width` `--_rule`, `--_radius`, `--_elevation`, margem `--_gutter`. Em `navMode="overlay"` todos os valores de `canvas` perdem o cartão de `main`, como `inset` já perdia: um telefone não tem largura para uma moldura.

## 2. `primary="main"`

`nav` ocupa todas as linhas, como em `primary="nav"`. `banner` ocupa a linha 1 da coluna de `main`; `aside`, como coluna, ocupa as linhas 1 e 2 da sua coluna. O banner pertence ao plano do conteúdo: em `inset`, `floating` e `panel` o cartão cobre `banner` e `main`; em `flush` os dois partilham o fundo.

O cartão que cobre duas regiões é o `::before` da raiz, colocado na área da grelha que as duas ocupam. Duas caixas com metade do cartão cada uma desenham a sombra de uma sobre a outra na costura. O pseudo-elemento é o primeiro item da grelha e pinta por baixo das regiões, que ficam transparentes. `main` guarda o raio nos cantos que coincidem com os do cartão, para recortar o que rola.

A ordem no DOM não muda: `banner` continua antes de `nav`. A ordem de foco é a mesma nos três valores de `primary`.

## 3. `canvas="panel"`

Um cartão cobre `nav`, `main` e `aside` na linha do corpo. Com `primary="nav"` ou `primary="main"` cobre também a linha do banner, e o banner fica dentro do cartão sobre a coluna de `main`. O footer fica sempre no quadro. As costuras entre regiões dentro do cartão são desenhadas por `separation`. O cartão é o mesmo `::before` de §2.

## 4. `separation`

Atua só nas costuras sem gutter: todas em `flush`; `nav`|`main`, `main`|`aside` e `banner`|`main` dentro do cartão em `panel`; `banner`|`main` dentro do cartão de `primary="main"`.

- `rule`: `--_rule-width` sólido em `--_rule`.
- `tone`: nenhuma regra. As regiões de cromado (`banner` e `nav` em `flush`; `nav` e `aside` em `panel`; `nav-rail` sempre) tomam o fundo `--_tone`; o conteúdo fica em `--slotted-surface`.

`--_tone` é `--slotted-app-shell-tone-surface`, por omissão `color-mix(in oklab, var(--slotted-surface), var(--slotted-text) 4.5%)`. Medido contra `--slotted-surface`: Δ L OKLab 0.036 em `light` e em `dark`. O `flush` sem regras de antes tinha Δ ≈ 0.02 (`#f7f8fa` contra `#ffffff`) e nenhuma elevação.

Um fundo trocado sem os seus tons deixa os controlos calibrados para outra página. Numa região em `tone`, a família recalcula `--slotted-tone-secondary-subtle-hover` e `-active` a partir de `--_tone` (4 % e 7 % de `--slotted-text`), e `side-navigation`, os toggles e qualquer controlo `subtle` dentro da região leem o par recalculado. É a mesma regra de «paleta por região» que `data-slotted-scheme` já aplica, restrita a dois tokens.

Em `forced-colors: active` todos os fundos são `Canvas` e o tom desaparece. A família desenha a regra de `rule` nesse modo. É algo que o tema não alcança, o caso em que o briefing permite a uma família uma regra `forced-colors`.

## 5. `nav-rail`

Parte opcional, `div`, primeiro filho de `nav`. Um só landmark `navigation` e um só estado `navOpen`: o ReUI escreve dois `Sidebar` e dois estados.

- Com `nav-rail`, `nav` é uma grelha de duas colunas: `--_rail-size` para o trilho, `--_nav-size` para `nav-header`, `nav-body` e `nav-footer`. Largura aberta: soma das duas.
- `navOpen = false` com `collapsedTo="rail"`: `nav` estreita até `--_rail-size`; a coluna é recortada pelo `overflow: hidden` de `nav` enquanto a largura transiciona e sai do tab order e da árvore de acessibilidade por `visibility: hidden` no fim da transição (`step-end` ao fechar, `step-start` ao abrir). Sem `nav-rail`, o trilho continua a ser a própria coluna estreitada.
- `collapsedTo="hidden"`: `nav` inteiro sai, trilho incluído.
- `navMode="overlay"`: a camada contém trilho e coluna; largura `--_nav-overlay-size`.
- Costura trilho|coluna: `rule` desenha a regra; `tone` pinta o trilho em `--_tone` e a coluna fica no plano de `nav`.
- O trilho é uma coluna flex centrada, com `padding-block` `--_row-inset` e intervalo `--slotted-space-1`; rola quando excede a altura. O que contém é do consumidor.
- A deteção é `:has(> [data-part='nav-rail'])`: nenhum atributo escrito por script, e o primeiro paint no servidor já tem a grelha certa.

## 6. `--slotted-app-shell-frame-image`

Camada `background-image` do quadro sobre `--_frame`. Por omissão `none`. Um gradiente ou uma imagem é um token de tema, não um prop.

## 7. Quebras de contrato e como um consumidor se move

| O que muda | Como se move |
| ---------- | ------------ |
| `dividers` sai | `dividers={false}` → `separation="tone"`; `dividers` omitido ou `true` → nada, `rule` é a omissão |
| `data-dividers` na raiz sai | seletores sobre `[data-dividers]` passam a `[data-separation='rule']` |
| `canvas` ganha dois valores | nenhum movimento |
| `primary` ganha um valor | nenhum movimento |

Consumidor único: `demos/nexora/angular`, atualizado na mesma passagem.

## 8. Integração

Nenhuma linha das tabelas de `frameworks.md` muda de resposta face a `2026-09-14-app-shell-redesign-design.md` §8 e §9. Acréscimos:

| Pergunta | React | Angular |
| -------- | ----- | ------- |
| Omissões uma vez | `AppShellDefaultsProvider` com `separation` em vez de `dividers` | `provideAppShellDefaults({ separation })` |
| Substituir o elemento de `nav-rail` | `AppShellNavRail` com `render` | `slAppShellNavRail` é diretiva no elemento do consumidor |
| Tipos nativos | `Native<'div'>` | — |
| Estado no DOM | `data-canvas`, `data-primary`, `data-separation` na raiz | os mesmos |
