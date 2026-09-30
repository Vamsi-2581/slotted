# `filter-bar` — reconstrução segmentada

Decisões da reconstrução de 2026-09-30, tomadas a partir de
`2026-09-30-filter-bar-reui-dossier.md`. Substituem §3, §7 e §10 de
`2026-09-14-filter-bar-design.md`; o resto daquele documento (valor, URL,
aplicação, obrigatórios, presets, anúncios, sticky) continua em vigor.

## 1. O chip é a frase, em segmentos

Um chip passa a ser a condição escrita em quatro segmentos contíguos:

```
[glifo Campo] [operador] [valor] [×]
 chip-field    chip-operator chip-value chip-remove
```

| Segmento        | Elemento | Papel                                                                                                  |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `chip-field`    | `span`   | Glifo opcional do campo e o seu rótulo. Não é focável: o campo de uma condição é fixo durante a sua vida. |
| `chip-operator` | `button` | Abre um `menu` com os operadores do tipo do campo, `aria-haspopup="menu"`.                            |
| `chip-value`    | `button` | Abre um `popover` com o operando, `aria-haspopup="dialog"`. Ausente quando o operador não leva operando. |
| `chip-remove`   | `button` | Remove a condição, motivo `remove`. Ausente num campo `required`.                                       |

O chip antigo era um `tag` com a frase inteira num só texto
(`Amount greater than R$ 100,00`), truncado a 18 rem e editado por um único
popover. Três perguntas diferentes — qual campo, que comparação, que valor —
chegavam por um único alvo. Cada segmento responde agora a uma pergunta, e
mudar só o operador deixa de reabrir o operando.

O valor de vários itens escreve os dois primeiros e o resto em número:
`Paid, Refunded`, `Paid, Refunded +2`. O `title` e o nome acessível do segmento
levam a lista inteira.

O raio da cápsula (`--slotted-radius-full`) mantém-se: os segmentos
interiores são retos e separados por uma linha de 1 px em
`--slotted-border-subtle`; o primeiro e o último levam os cantos da cápsula,
para que o chão do hover e o anel de foco sigam a curva em vez de serem
recortados.

## 2. Um só toolbar

`chips` (uma `grid`) deixa de existir. Os chips vivem dentro de `bar`, o
`toolbar`, cada um como `role="group"` com o nome `<Campo>: <frase>`. As
setas percorrem todos os controlos focáveis da barra por ordem — pílulas,
segmentos de cada chip, `more`, `add`, `clear`, `apply` —, com
`Home`/`End` para o primeiro e o último. A APG admite-o por escrito: «in
toolbars with multiple rows of controls, Left Arrow and Right Arrow can provide
navigation that wraps from row to row»
(<https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/>, lido 2026-09-30).

Custo: duas paragens de `Tab` em vez de três (pesquisa, barra). Uma barra com
seis chips e três segmentos por chip tem 18 paragens de seta; `Home`/`End` e o
salto de `Delete` mantêm o percurso curto.

`Delete` e `Backspace` em qualquer segmento de um chip removem a condição. O
foco vai para o segmento do mesmo papel no chip seguinte, senão no anterior,
senão para `add`.

## 3. Pílula e chip são o mesmo campo em dois estados

Um campo fixado (`pinned`) sem condição é uma pílula: aresta tracejada, glifo
`plus`, rótulo em cor atenuada — o estado «à espera de algo» que `upload` já
desenha com a mesma aresta. Com condição, o mesmo lugar da barra passa a chip,
com `data-pinned`. O accent do chip filtrado sai: o chip já mostra o valor, e
um accent em todos os filtros ativos deixava de distinguir qualquer coisa.

Premir uma pílula desenha o chip do campo no mesmo lugar, incompleto, com o
popover do valor aberto — o caminho de `add`. Um popover próprio da pílula,
com operador e operando, ficava ancorado a um elemento que se tornava outro no
momento em que a condição ficava ativa.

Ordem na barra: campos fixados pela ordem declarada, depois as condições dos
campos não fixados pela ordem em que entraram, depois `more`, `add`, e no fim
da linha `clear` e `actions`.

## 4. Condição incompleta

Escolher um campo em `add` cria o chip de imediato com o `defaultOperator` do
campo e abre o popover do valor. Enquanto a condição não tiver todos os
operandos o chip leva `data-incomplete`: aresta tracejada e, no segmento do
valor, `labels.noValue` em cor atenuada. A condição incompleta é estado da
barra, não do valor: o motor já a trata como inativa, `onValueChange` não a
emite, e `Escape` fecha o popover sem a apagar. Sai quando é removida, quando
fica completa (entra no valor) ou quando o valor controlado é substituído de
fora.

## 5. `add` compacto

Com pelo menos um chip na barra, `add` desenha só o glifo (`data-compact`); o
rótulo fica no nome acessível e no `title`. Sem chips, o rótulo aparece. É a
forma medida no ReUI (`c-filters-1`: 32 × 32 com chips, texto sem chips).

## 6. Composição

A composição larga com `data-bar-wrapped` sai. Em todas as larguras acima de
36 rem: primeira linha pesquisa, controlos do consumidor e contagem; segunda
linha a barra, que quebra. Abaixo de 36 rem nada muda. O binding deixa de medir
a barra.

## 7. `readOnly`

`readOnly` novo, `data-readonly` na raiz. A barra lê-se e percorre-se: os
segmentos de operador e de valor mantêm a sua paragem, levam
`aria-disabled="true"` e não abrem nada; o segmento de valor nomeia a lista
inteira. `chip-remove`, `add`, `clear` e as pílulas vazias não são desenhados,
porque nunca estariam disponíveis. `disabled` continua a retirar tudo da ordem
de tabulação.

## 8. Movimento

| Mudança                            | Transição                                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| hover e pressão de cada segmento    | `background-color`, `color`, `--slotted-control-transition-*`                                              |
| chip ou pílula entra               | `opacity` 0 → 1 e `translate` −`--slotted-space-2` → 0, `@starting-style`, `--slotted-duration-medium`, `--slotted-easing-enter`; sem `scale`, que redesenha as letras a cada quadro |
| incompleto → completo               | `border-color`, sem mudança de estilo de aresta animada                                                     |
| chip sai                            | sem animação                                                                                               |

Um chip removido não anima a saída: o foco passa ao vizinho no mesmo gesto, e
um chip retido durante a saída seria uma paragem de seta que já não existe.

## 9. Telefone

Três decisões, para que uma tela de 375 px seja usável e não uma versão
encolhida da de 1280.

**A barra é uma linha que desliza.** Abaixo de 36 rem da barra: a pesquisa;
depois uma só linha com `overflow-x: auto` — `summary` («Filters (n)»)
primeiro, todos os chips (também os dobrados), as pílulas vazias —; depois a
contagem. Antes os chips desapareciam atrás do `summary`, e o leitor deixava de
ver o que estava a filtrar; quebrar em linhas empurrava a listagem meio ecrã
para baixo. O último chip cortado pela borda diz que a linha continua; sem
máscara de esbatimento, que pintaria sobre o conteúdo mesmo no início. A
linha devolve a largura e o afastamento do anel como padding e margem
negativa, para o anel de um controlo focado não ser recortado.

Num telefone o chip tem três alvos — campo, valor com as palavras do operador
dentro (`<span data-operator>`), remover — e não quatro: `more`, `add`,
`clear`, as ações e o segmento do operador não são desenhados.

**Toda a edição abre o construtor, como folha.** O valor de um chip, uma
pílula e o `summary` abrem o construtor com a regra correspondente expandida.
O construtor é `drawer`: do fim em linha com o viewport a 36 rem ou mais; de
baixo, `size="content"`, abaixo disso. O lado de onde uma gaveta abre é uma
pergunta do viewport, não da barra, por isso é o binding que a responde com
`matchMedia`. Um popover ancorado a um chip numa linha que desliza não tem onde
caber num telefone, e uma só superfície de edição é a que o polegar aprende.

**O construtor lista cartões.** Abaixo de 30 rem do próprio construtor (a
consulta lê o contentor do construtor; os grupos passam a ter o nome
`slotted-filter-bar-group` e continuam a empilhar a linha quando só eles são
estreitos):

| Antes (linha de três controlos)                                  | Cartão                                                                                  |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| cada controlo com um terço de um terço do ecrã                    | a frase da regra (`rule-summary`), que se lê de relance, e o × na primeira linha dela   |
| três controlos empilhados em todas as regras ao mesmo tempo       | tocar na frase expande o cartão (`data-expanded`); campo, operador e operando a toda a largura; um cartão aberto de cada vez |
| cada nível de grupo custa ~80 px (sarjeta de 3,5 rem + caixa)     | um nível é um trilho de 2 px na aresta inicial e um passo de recuo, ~10 px               |
| «Where / and / or» numa coluna                                    | a palavra de junção numa linha própria, pequena; o «Where» inicial não é desenhado       |
| três pares de botões de largura inteira                           | o par do construtor em duas metades com contorno; o de um grupo aninhado sem contorno    |

O chevron e o × ficam na primeira linha da frase, mesmo quando ela quebra
em duas: a marca alinha com o texto, não com a caixa (decisão do briefing).
Abrir o cartão faz os controlos entrarem de um passo acima com
`--slotted-easing-enter`; fechar é imediato, porque o leitor já olha para o
cartão seguinte.

## 10. Recusados nesta reconstrução

- Reordenar chips (`Alt` + setas no ReUI): numa junção `and` a ordem não muda o
  significado, e os campos fixados já têm a ordem declarada.
- Menu por linha no construtor (duplicar, negar, envolver em grupo): os
  operadores do motor já incluem as negações (`notContains`, `noneOf`), e
  envolver em grupo é `Add group` seguido de mover — um segundo caminho para o
  mesmo resultado. Fica em `docs/process/build-order.md` como reabertura.
- Veto antes da mudança (`onBeforeQueryChange`): o par controlado já é o veto;
  um consumidor que não aplica o pedido recusa-o.

## 11. O que uma resposta errada custa

- Se os segmentos deviam ser um só alvo, o chip volta a um botão e o CSS dos
  segmentos sai; o valor e o motor não mudam.
- Se o `grid` separado era melhor, volta uma paragem de `Tab` e a `grid`; a
  pintura não muda.
- Barato agora, antes dos bindings; depois do passo 13 é uma quebra de contrato
  nos dois bindings.
