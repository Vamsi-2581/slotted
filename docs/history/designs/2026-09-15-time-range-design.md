# Desenho — `time-range-picker` e `datetime-range-picker`

Decisões tomadas sobre o inventário em
`2026-09-15-time-range-capability-inventory.md`. Lê-se depois dele e antes dos
dois contratos. O que `date-range-picker`, `time-picker` e `datetime-picker`
já decidiram e estas famílias herdam sem mudança não é repetido aqui: a camada
composta de `packages/core`, a folha em viewport estreita com ponteiro grosso,
o `Escape` escalonado, o nome do gatilho, o `Alt`+`ArrowDown` com a nota de
ChromeOS, a moldura que desenha a borda de um campo `plain`, o rascunho
que nunca chega a um formulário, a parte `preset`, o `closeOnSelect`, a lista
de horas de uma forma só (`step`, `options`, `maxOptions`, sem seleção a
seguir o foco), `now` como o caso zero da expressão relativa.

Um desenho só, porque a decisão que separa o par de `date-range-picker` é
uma (§1). **[T]** marca o que só `time-range-picker` faz e **[DT]** o que só
`datetime-range-picker` faz.

---

## 1. O que as famílias são

Um controle de uma linha — o valor escrito curto, um `clear` e um gatilho —
e atrás dele um painel com **uma ponta de cada vez**: duas abas, Início e
Fim, com o valor de cada uma; por baixo, o campo segmentado da ponta
corrente (só em ponteiro fino), o que falta dito em palavras, e a lista de
horas dessa ponta. Escolher uma ponta leva à outra; escolher a segunda
fecha. **[DT]** acrescenta, ao lado da lista, o `calendar` em modo `range`
que `date-range-picker` já compõe, com as duas datas desenhadas.

Dois campos segmentados na moldura, a forma de `date-range-picker`, foram
desenhados e retirados no gate visual: dois `time-field` precisam de cerca de
220 px numa linha e dois `datetime-field` de 360 px, um segmento não encolhe,
e abaixo disso a moldura quebrava em duas linhas — contra a altura que todos
os controles partilham e que um formulário conta. Uma container query não
resolve: esconder os campos na moldura obrigaria a duplicá-los no painel para
continuar a escrever. Os campos mudam-se para a banda do painel, onde a
largura é do painel e não do formulário, e a moldura fica com o que cabe numa
linha a qualquer largura: o valor em texto, cortado com reticências quando não
cabe e inteiro no nome acessível.

A lista que troca de ponta com a posição (MUI, Ant) foi recusada: com uma
lista só, o leitor escolhe o início e o fim desaparece da vista, e a
recusa que o início impõe ao fim — as horas antes dele, as fora do limite —
só se descobre depois de trocar. Com as duas à vista, a lista de fim risca o
que o início escolhido recusa no mesmo instante, e a banda diz a duração
entre a opção realçada e a outra ponta.

O valor é `TimeRange | null`, `{ start: PlainTime | null, end: PlainTime |
null }`, e **[DT]** `DateTimeRange | null` sobre `PlainDateTime`. As duas
formas de "nada" colapsam numa.

---

## 2. Onde a aritmética vive

`packages/core/src/date/time-range.ts`, ao lado de `date-range.ts`, sob o
mesmo ponto de entrada `@slotted/core/date`. `date-range.ts` conta dias e não
é reaberto: um intervalo de horas conta segundos, e uma função que contasse
os dois seria duas funções com um `if`.

| Exporta                                                   | Para                                                                                                            |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `TimeRangeValue`, `DateTimeRangeValue`                    | Os dois valores.                                                                                                |
| `timeRangeSeconds(a, b)`, `dateTimeRangeSeconds(a, b)`    | `b − a` em segundos; negativo quando `b` vem antes.                                                             |
| `durationLabel(seconds, locale, granularity?)`            | "2 h 30 min": `Intl.NumberFormat` `style: 'unit'`, `unitDisplay: 'short'`, uma unidade de cada vez — dia, hora, minuto, segundo — e as unidades a zero omitidas. Zero é "0 min", ou "0 s" na granularidade `second`. |
| `timeRangeProblems(value, rules)`                         | `order`, `min`, `max`, `unavailable`, `length` — o mesmo `DateRangeProblem`, na mesma ordem.                    |
| `dateTimeRangeProblems(value, rules)`                     | Os mesmos cinco; `min`/`max` cobrem o valor inteiro e a janela do dia (`minTime`/`maxTime`); `unavailable` corre o predicado de dia sobre os dias entre as pontas e o predicado de hora sobre as duas pontas. |
| `runRefusal(anchor, candidate, direction, rules)`         | Se um candidato pode fechar uma corrida ancorada em `anchor` (segundos): a ordem, `minLength`, `maxLength`.     |
| `firstUnavailableIndex(list, from, direction)`            | O primeiro índice indisponível da lista para um lado, para `contiguous`. Corre sobre a lista, nunca sobre os segundos. |

`minLength` e `maxLength` são segundos, a unidade de `step`. Uma corrida é
válida quando `minLength ≤ seconds ≤ maxLength`.

`Intl.DurationFormat` não é usado: falta em Firefox abaixo de 139, e o rótulo é
substituível por instância e por provider.

---

## 3. Anatomia

### `time-range-picker`

| Parte          | Elemento | Sempre | Para                                                                                                        |
| -------------- | -------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| `root`         | `div`    | sim    | `data-ui="time-range-picker"`, os eixos e os estados.                                                       |
| `control`      | `div`    | sim    | A moldura, uma linha na altura da escala de controles. Âncora do posicionador.                              |
| `trigger`      | `button` | sim    | Enche a moldura; abre o painel. Contém `summary`; o glifo `--slotted-icon-clock` na ponta de leitura. O nome carrega as duas pontas e a duração. |
| `summary`      | `span`   | sim    | O valor escrito curto no locale — "14:00 – 16:30" — ou o placeholder; cortado com reticências quando não cabe. |
| `clear`        | `button` | não    | Esvazia as duas pontas. Desenhado com `clearable`.                                                          |
| `hidden-input` | `input`  | sim    | Dois, `startName` e `endName`, na moldura: o painel em portal não está no `form` quando fechado.            |
| `positioner`   | `div`    | não    | A camada, em portal. Carrega `data-ui` também.                                                              |
| `content`      | `div`    | não    | `role="dialog"`. A superfície.                                                                              |
| `head`         | `div`    | não    | A banda: as abas, a fila do campo e a fila de estado.                                                       |
| `tabs`         | `div`    | não    | `role="tablist"`: as duas pontas.                                                                           |
| `tab`          | `button` | não    | `role="tab"`, `data-position="start"` ou `"end"`; `aria-selected` e `data-current` na ponta corrente; `data-placeholder` sem valor. Contém `tab-label` e `tab-value`. |
| `tab-label`    | `span`   | não    | "Início" / "Fim" (`startLabel` / `endLabel`).                                                               |
| `tab-value`    | `span`   | não    | O valor da ponta escrito curto — "14:00", **[DT]** "12 set, 14:00" — ou o travessão.                       |
| `field`        | `div`    | não    | Embrulha o `time-field` **da ponta corrente**, `plain`, `data-position`. Só em ponteiro fino: um segmento não levanta teclado num telemóvel. |
| `now`          | `button` | não    | Na fila do campo: escreve a hora corrente na ponta corrente.                                                |
| `hint`         | `span`   | não    | O que falta, ou o que está errado: "Escolha o fim", "O fim tem de vir depois do início". `aria-describedby` da lista e do campo. |
| `length`       | `span`   | não    | "2 h 30 min". `aria-live="polite"`.                                                                         |
| `limit`        | `span`   | não    | "30 min a 4 h". Desenhado quando há `minLength` ou `maxLength`.                                             |
| `presets`      | `div`    | não    | A fila dos atalhos do consumidor, entre a banda e o painel; quebra.                                         |
| `preset`       | `button` | não    | Um atalho. `data-selected` quando é igual ao valor.                                                         |
| `panel`        | `div`    | não    | **A ponta corrente**, uma só: `data-position="start"` ou `"end"`.                                          |
| `list`         | `div`    | não    | `role="listbox"`, as linhas da ponta corrente, a única coisa que rola. Nomeada pela `tab` corrente.        |
| `option`       | `div`    | não    | `role="option"`, uma hora inteira.                                                                          |
| `option-duration` | `span` | não    | Ao lado da hora, a duração que a corrida teria com a outra ponta (§5).                                     |
| `empty`        | `div`    | não    | Desenhado quando a ponta não tem hora nenhuma disponível.                                                   |
| `footer`       | `div`    | não    | As ações do consumidor e, no fim, `done`.                                                                   |
| `done`         | `button` | não    | "Concluir": fecha com o que está escrito. Uma folha de ecrã inteiro não tem "fora" onde tocar.             |

O `time-field` da ponta corrente fica com o seu `data-ui`; não desenha
`clear` próprio nem `hidden-input` com nome — os da moldura submetem.

Uma ponta de cada vez: a aba diz qual, o painel mostra só essa, e a escolha
de uma ponta leva à outra. A lista da ponta corrente já sabe o que a outra
ponta lhe recusa, porque a outra está no trabalho. `now` é da ponta corrente,
uma só, por isso basta um.

### `datetime-range-picker`

As mesmas partes, mais:

| Parte        | Elemento | Sempre | Para                                                                                                  |
| ------------ | -------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `date-panel` | `div`    | não    | Dentro de `panel`, antes da lista: embrulha o `calendar` em modo `range`. A grelha desenha as duas datas; a lista corre no dia da ponta corrente. |

O gatilho leva `--slotted-icon-calendar`, a marca que `datetime-picker` já
lhe dá; `summary` escreve "12 set, 14:00 – 16 set, 11:00"; `tab-value`
escreve "12 set, 14:00". O `datetime-field` da ponta corrente fica com o seu
`data-ui`. O dia que a lista serve não precisa de parte própria: a aba diz a
data, e `hint` diz "Agora a hora, 12 set" enquanto a hora falta.

---

## 4. Estado

| Valor              | Controlado    | Não controlado       | Pedido                 | Razões                                                       |
| ------------------ | ------------- | -------------------- | ---------------------- | ------------------------------------------------------------ |
| o intervalo        | `value`       | `defaultValue`       | `onValueChange`        | `pointer`, `keyboard`, `select`, `clear`, `blur`, `programmatic` |
| o painel           | `open`        | `defaultOpen`        | `onOpenChange`         | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`    |
| a ponta corrente   | `position`    | `defaultPosition`    | `onPositionChange`     | `pointer`, `keyboard`, `select`, `clear`, `programmatic`     |
| o realce das listas | `highlighted` | `defaultHighlighted` | `onHighlightedChange`  | `pointer`, `keyboard`, `programmatic`                        |

`position` e `highlighted` são os dois modelos do conjunto `current` do
esquema. `highlighted` é `{ start: PlainTime | null, end: PlainTime | null }`
nas duas famílias: a opção realçada em cada lista. **[DT]** O dia focado da
grelha é do `calendar`, como em `date-range-picker`.

`position` diz qual `tab` leva `aria-selected`, que ponta o `field`, o
`panel` e a lista mostram, em que campo ou lista o foco entra ao abrir, e
**[DT]** que ponta a próxima pressão na grelha escreve, pela regra de
`date-range-picker`. Ao abrir, `position` vai à primeira ponta que falta;
com o valor inteiro fica onde estava.

---

## 5. O trabalho em curso

Com o painel aberto a família guarda um **trabalho**: as duas pontas como o
leitor as deixou, `{ start, end }` com cada metade anulável — **[DT]** cada
ponta com `date` e `time` anuláveis em separado. Fechado, o trabalho é o
valor. Aberto, cada pressão edita o trabalho; o pedido de valor sai com
`reason: 'select'` quando o trabalho fica inteiro, e sai de novo a cada
pressão que o mude estando inteiro. `Escape`, uma pressão fora e o gatilho
abandonam o trabalho e o valor anterior fica.

### O foco segue o que falta

A regra de `datetime-picker`, uma vez por ponta:

> A pressão que deixa o trabalho incompleto leva o foco ao que falta. A
> pressão que o completa fecha o painel.

| Situação                                                                | O que acontece                                                                                               |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Abre por `Enter`, `Space` ou pressão                                    | `position` na primeira ponta que falta. Foco no primeiro segmento do campo; onde o campo não é desenhado (ponteiro grosseiro), na lista. |
| Abre por `ArrowDown` ou `Alt`+`ArrowDown`                               | **[T]** Foco na lista, na opção da ponta ou na mais próxima do que a outra ponta permite. **[DT]** Foco na célula da data da ponta corrente, ou em hoje. |
| A lista escreve a ponta corrente e a outra ponta está vazia             | `position` vai à outra ponta (razão `select`): a aba muda, o painel mostra a outra lista, o foco vai a ela — **[DT]** à grelha, quando é a data que lhe falta. |
| **[DT]** A grelha escreve uma data e a ponta não tem hora               | `position` fica; o foco vai à lista, que corre nesse dia.                                                    |
| **[DT]** A grelha escreve o início (corrida reaberta)                   | A data do fim é retida, a hora do fim é mantida; `position` vai a `end`; o foco vai à lista do início se ela não tem hora, à grelha caso contrário. |
| A pressão fez o trabalho inteiro                                        | Pedido de valor; fecha por `closeOnSelect`; foco no gatilho.                                                 |
| O trabalho já estava inteiro                                            | Pedido de valor; o painel fica; o foco fica onde o leitor o pôs.                                             |
| Uma aba                                                                 | `position` a essa ponta (razão `pointer` ou `keyboard`); o painel troca; o foco fica na aba.                 |
| `now`                                                                   | Escreve agora na ponta corrente — **[DT]** data e hora — e segue a tabela.                                   |
| Um atalho                                                               | Escreve as duas pontas; `position` a `start`; fecha por `closeOnSelect`.                                     |
| `done`                                                                  | Fecha (razão `pointer`); o trabalho inteiro sai como valor antes de fechar; uma ponta só fica como está. Foco no gatilho. |
| `clear`                                                                 | Esvazia; `position` a `start`; foco no gatilho.                                                              |

**[DT]** A grelha recebe as datas do trabalho com a regra de
`date-range-picker`: com `position: 'end'` e as duas datas, recebe
`{ start, end: null }`, para que a próxima pressão escreva o fim. Quando a
grelha ordena as datas — um fim pressionado antes do início —, as horas ficam
na ponta em que estavam.

### A ponta pendente e a duração

A ponta pendente é a opção sob o ponteiro na lista de uma ponta, ou a opção
realçada da lista que tem o foco. `length` diz `lengthLabel(seconds, locale)` — a
omissão é `durationLabel` na `locale` da família, não na do runtime — para a
corrida que existiria se a pendente fosse escolhida — a pendente numa ponta,
o trabalho na outra —, e para o trabalho quando não há pendente. Com uma só
ponta e nenhuma pendente, `length` está vazio. Numa região
`aria-live="polite"`, o leitor de ecrã ouve-o a cada seta.

**[DT]** A grelha desenha a banda pendente de `date-range-picker`; a pendente
de data entra na duração como em `date-range-picker`, com a hora que a ponta
já tem ou, sem hora, a meia-noite — e `length` leva `data-pending`.

### A duração em cada linha

Cada opção da lista de uma ponta leva ao lado a duração que a corrida teria
com a outra ponta como está — "15:00 · 1 h" —, a forma como uma aplicação de
calendário lista as horas de fim de um evento. É a resposta à pergunta que o
leitor faz enquanto escolhe uma ponta, lida linha a linha e não uma opção de
cada vez pela banda; uma opção recusada não a leva. **[DT]** só enquanto as
duas pontas estão no mesmo dia: entre dias as linhas diferem por minutos
dentro de uma duração de dias, e uma coluna de "3 dias 18 h 15 min" não diz
nada que a banda não diga. `length` na banda diz o todo em qualquer caso, na
região viva, para que o leitor de ecrã ouça o que as linhas mostram.

### O que falta, dito

`hint` diz o que a próxima pressão deve ser, ou o que está errado, em
palavras do produto (`hintLabels`, com `{end}` para o rótulo da ponta):
`choose` ("Escolha o {end}"), **[DT]** `chooseDay` ("Escolha o dia de {end}")
e `chooseTime` ("Agora a hora de {end}, 12 set"), e, com o trabalho inteiro
e inválido, `order`, `length`, `unavailable` e `bounds`. Inteiro e válido,
`hint` está vazio e `length` diz a duração. É a diferença entre um painel que
recusa e um painel que explica: as linhas riscadas dizem o que não pode, o
`hint` diz o que pode.

### O que cada lista recusa

O campo da banda escreve a ponta corrente no trabalho a cada pedido que emite,
com a razão do campo (`keyboard`, `blur`, `clear`); o trabalho inteiro sai
como valor pela mesma regra de uma pressão.

Cada lista é a lista de `time-picker` — `step`, `options`, `maxOptions`,
`min`, `max`, `isTimeUnavailable` — e mais o que a **outra ponta do trabalho**
lhe impõe:

| A lista de fim, com um início escolhido                          | A lista de início, com um fim escolhido                          |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| As opções antes do início.                                       | As opções depois do fim.                                         |
| As que dariam uma duração abaixo de `minLength` ou acima de `maxLength`. | O mesmo.                                                 |
| Com `contiguous`, as para lá da primeira indisponível depois do início. | Com `contiguous`, as para cá da primeira indisponível antes do fim. |

**[DT]** Cada lista corre no dia da sua ponta — `dayWindow(date, { min, max,
minTime, maxTime })`, a regra de `datetime-picker` — ou no dia focado da
grelha quando a ponta não tem data. A outra ponta só recusa quando as duas
estão no mesmo dia; em dias diferentes a ordem é das datas, e a grelha já a
impõe. `contiguous` na grelha é o de `date-range-picker`, com `blockedAround`.

Uma opção recusada continua desenhada com `aria-disabled` — ou escondida com
`unavailableOptions="hide"` —, a regra de `time-picker`.

---

## 6. Limites e validade

| Regra                      | Onde é imposta                                                                                              | Quando falha no valor escrito       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `min`, `max`               | Nos campos e nas listas. Cruzados: início recebe `max = min(max, end)`, fim recebe `min = max(min, start)`. | `invalid` no campo e na moldura     |
| **[DT]** `minTime`, `maxTime` | Na janela de cada dia, nas listas e nos campos.                                                          | `invalid`                           |
| `isTimeUnavailable`; **[DT]** `isDateUnavailable` | Nas listas, uma vez por opção; na grelha, uma vez por célula.                       | `invalid`                           |
| `contiguous` (omissão `true`) | §5.                                                                                                       | O predicado corre sobre as pontas — **[DT]** e sobre cada dia entre elas — uma vez por mudança de valor. |
| `minLength`, `maxLength`   | §5; `limit` diz o limite.                                                                                   | `invalid`                           |
| fim antes do início        | Não é imposto nas listas: a lista de fim risca as horas antes do início. No campo, nada é trocado.          | `invalid` no campo de fim e na moldura |

**[T]** Um turno que atravessa a meia-noite é `order`: `PlainTime` não tem
dia. A família que o escreve é `datetime-range-picker`.

Em Angular, `Validator` reporta `slottedTimeRangeMin`, `slottedTimeRangeMax`,
`slottedTimeRangeUnavailable`, `slottedTimeRangeOrder`,
`slottedTimeRangeLength`, e o mesmo prefixo `slottedDateTimeRange*`.

---

## 7. Teclado

Padrões relidos em 15 de setembro de 2026:
<https://www.w3.org/WAI/ARIA/apg/patterns/listbox/> para cada lista, cujas
teclas `time-picker` transcreveu em `2026-09-10-time-design.md` §5 e não
mudaram; <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/>
para o popup. Não há padrão de intervalo.

| Tecla                        | Onde               | Efeito                                                                                                  |
| ---------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------- |
| `Enter`, `Space`             | o gatilho          | Abre; foco no primeiro segmento do campo da ponta corrente, ou na lista onde o campo não é desenhado.   |
| `ArrowDown`, `Alt`+`ArrowDown` | o gatilho        | Abre; **[T]** foco na lista da ponta corrente; **[DT]** foco na célula da ponta corrente, ou em hoje.   |
| `ArrowLeft`, `ArrowRight`, `Home`, `End` | uma aba | A outra aba, com ativação automática: `position` muda e o painel troca.                                 |
| as teclas dos segmentos      | o campo da banda   | As de `time-field` / `datetime-field`, sem mudança, incluindo a expressão relativa.                     |
| `ArrowUp`, `ArrowDown`, `Home`, `End`, `PageUp`, `PageDown`, dígitos | uma lista | Os de `time-picker`: a opção anterior ou seguinte, a primeira ou a última, uma hora, type-ahead. Cada movimento é a ponta pendente e `length` diz a duração. |
| `Enter`, `Space`             | uma opção          | Escreve a ponta da lista; segue §5.                                                                     |
| **[DT]** as teclas da grelha | o calendário       | As de `calendar`, sem mudança.                                                                          |
| `Enter`, `Space`             | um atalho          | Escreve o valor; fecha por `closeOnSelect`.                                                             |
| `Tab`                        | com o painel aberto | Contido: as abas (uma paragem), o campo, `now`, atalhos, **[DT]** grelha (uma paragem), a lista, rodapé, `done`. |
| `Escape`                     | com o painel aberto | A expressão relativa de um campo primeiro; **[DT]** a vista do calendário; depois o painel, abandonando o trabalho; foco no gatilho. |

Partida deliberada, com custo: o exemplo do APG fecha na primeira pressão e
estas famílias fecham quando o trabalho fica inteiro, porque um intervalo são
pelo menos duas pressões — **[DT]** quatro. `closeOnSelect` diz o resto.

---

## 8. A folha

A moldura é a de `select`: uma linha na altura, no tipo e na inserção da
escala de controles, com os três `variant` de `text-field`; o gatilho é um
botão transparente que a enche, `summary` corta com reticências e o glifo fica
na ponta de leitura, onde `clear` se põe ao lado. O anel de foco é o da
moldura, desenhado quando o gatilho tem `:focus-visible`.

O tipo da superfície segue a densidade pela escala de controlo
(`--slotted-control-font-size-md`), como o da grelha: uma lista no tamanho
da página ao lado de uma grelha no do controlo lia-se como dois tamanhos em
`dense`. A banda do painel tem as duas abas na primeira fila — duas metades iguais,
o rótulo em versalete e o valor por baixo, a corrente sublinhada com a cor de
acento, o sublinhado de `data-current` de `date-range-picker` —, o campo
`plain` da ponta corrente e `now` na segunda, `hint` à esquerda e `length`
com `limit` à direita na terceira. A lista tem a altura de oito linhas e a
largura da lista de `time-picker`; **[T]** o painel tem a largura da âncora
entre 16 e 22 rem; **[DT]** a grelha e a lista ficam lado a lado e a lista
cai para baixo da grelha quando a fila não cabe as duas — dois itens numa
fila que quebra, sem limiar em rem: um limiar em rem quebrava a fila em
`dense`, onde a grelha é mais estreita e as duas cabem; o painel para em 30 rem
(`--slotted-datetime-range-picker-content-max-inline-size`). Sem container
query, pela razão de `datetime-picker`: o painel não tem largura própria de
que perguntar. Por isso `months` tem omissão **1**. Os atalhos são uma fila
de chips entre a banda e o painel, que quebra.

Cada linha de lista tem `line-height` igual à sua altura e os dois textos
alinhados pela linha de base: só a linha de base, numa linha mais alta do
que uma linha de texto, sentava a hora e a duração no topo.

Cada lista abre com o destaque centrado, rolando só a lista
(`scrollTop`, não `scrollIntoView`, que rolaria também a página); uma tecla
rola o mínimo que assenta a linha inteira. O destaque de abertura é
`openingIndex` de `@slotted/core/date`: a hora pedida quando é oferecida,
senão a linha oferecida mais próxima dela — a lista de fim de um intervalo
começado às 14:00 abre às 14:00 e não à meia-noite —, e um passo além da
outra ponta quando a mais próxima é ela: uma proposta sem comprimento não é
proposta.

Em ponteiro grosseiro as linhas da lista têm a altura de controlo que o tema
sobe a `--slotted-target-comfortable` (44 px), e as abas a mesma; o campo
não é desenhado. Na folha
(largura ≤ 480 px com ponteiro grosseiro) a lista mostra seis linhas e meia —
**[DT]** quatro e meia, sob a grelha — e é a única coisa que rola; o conteúdo
tem `100dvh` de tecto, rola como um só quando não cabe, e termina com a
margem segura do aparelho e `done`.

---

## 9. Estados no DOM

`default`, `hover`, `active`, `focus-visible`, `disabled`, `invalid`,
`readonly`, `required`, `open`, `current`, `selected`. Precedência
`STATE_PRECEDENCE`, sem mudança; nas listas, `disabled` > `selected` >
`current` > `hover`, com o `:not()` que `time-picker` regista.

| Atributo            | Em                                  | Diz                                                    |
| ------------------- | ----------------------------------- | ------------------------------------------------------ |
| `data-current`      | `start`, `end`, `panel`, `option`   | A ponta corrente; nas opções, o realce.                |
| `data-placeholder`  | `summary`                           | Não há valor; o texto é o placeholder.                 |
| `data-position`     | `panel`                             | `start` ou `end`.                                      |
| `data-selected`     | `option`, `preset`                  | A hora do trabalho; o atalho igual ao valor.           |
| `data-disabled`     | `option`                            | Recusada por um limite, pelo predicado ou pela outra ponta. |
| `data-pending`      | `length`                            | O que é mostrado é a duração da ponta pendente.        |
| `data-truncated`    | `list`                              | A lista parou em `maxOptions`.                         |
| `data-granularity`  | `root`                              | `hour`, `minute` ou `second`.                          |
| **[DT]** `data-calendar` | `root`                         | O eixo `calendar`.                                     |
| `data-placement`, `data-presentation` | `positioner`      | Os de todos os irmãos.                                 |

---

## 10. Integração — React

| Pergunta                                       | Resposta                                                                                                                                                                                                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Par controlado/não controlado e pedido com razão | As quatro linhas de §4, por `createControllable`.                                                                                                                                                                                                             |
| Padrões definidos uma vez                      | `TimeRangePickerDefaultsProvider` / `useTimeRangePickerDefaults`, e o par de `datetime-range-picker`: `locale`, `timeZone`, `hourCycle`, `granularity`, `step`, `maxOptions`, `unavailableOptions`, `closeOnSelect`, `placement`, `size`, `variant`, `lengthLabel`, `limitLabel`, `chooseLabel`, `changeLabel`, `startLabel`, `endLabel`, `clearLabel`, `nowLabel`, `emptyLabel`, `truncatedLabel`; **[DT]** `months`, `calendar`, `firstDayOfWeek`. |
| Substituir o elemento de cada parte            | `render` na raiz; `TimeRangePickerPreset` com `render`; `renderOption` para o conteúdo de uma opção. As partes da moldura são fixas, pela razão de `date-range-picker`.                                                                                      |
| O handler do consumidor corre                  | `onKeyDown`, `onClick`, `onFocus` chamados primeiro; a família cede em `defaultPrevented`.                                                                                                                                                                    |
| Elemento nativo e ação imperativa              | `ref` com `TimeRangePickerHandle`: `focus()` no gatilho, `open()`, `close()`.                                                                                                                                                                                  |
| Servidor sem divergência                       | `useId`; agora lido em efeito, como os irmãos.                                                                                                                                                                                                                 |
| Cada estado no DOM                             | §9, escrito pelo teste de contrato.                                                                                                                                                                                                                            |
| Props tipadas pelo elemento nativo             | `ComponentPropsWithRef<'div'>` na raiz e `<'button'>` no atalho, com `defaultValue`, `onChange` e `ref` substituídos.                                                                                                                                         |

## 11. Integração — Angular

| Pergunta                                   | Resposta                                                                                                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valor bidirecional na forma de signal      | `input()` para `value`, `open`, `position`, `highlighted`; `output<ChangeRequest>()` para os quatro pedidos — a decisão de `date-picker`: um `model()` não carrega razão.                    |
| Reactive Forms e template forms            | `ControlValueAccessor` com o intervalo inteiro e `Validator` com os cinco erros de §6.                                                                                                       |
| Padrões definidos uma vez                  | `SLOTTED_TIME_RANGE_PICKER_DEFAULTS` / `provideTimeRangePickerDefaults()`, e o par de `datetime-range-picker`.                                                                                |
| Template alcança a instância               | `exportAs: 'slTimeRangePicker'`, `'slTimeRangePickerPreset'`; `'slDateTimeRangePicker'`, `'slDateTimeRangePickerPreset'`.                                                                     |
| Conteúdo projetado, preguiçoso             | Slots `[slTimeRangePickerPresets]` e `[slTimeRangePickerFooter]`; a diretiva `slTimeRangePickerPreset` injeta o picker; `NgTemplateOutlet` para o conteúdo de uma opção.                    |
| Zoneless e `OnPush`                        | Signals; `computed` para cada derivado; sem `markForCheck`.                                                                                                                                  |
| Subscrições desfeitas                      | `DestroyRef` para a camada, o posicionador e a media query.                                                                                                                                  |
| Atributo estático sobrevive ao host        | `HostAttributeToken` para `id`, `aria-label`, `aria-describedby`.                                                                                                                            |
| Um ponto de entrada, uma classe            | `@slotted/angular/time-range-picker` importa `time-field`; `@slotted/angular/datetime-range-picker` importa `datetime-field` e `calendar`, pelos seus pontos de entrada.                    |

A assimetria: Angular tem `Validator` e `ControlValueAccessor`; React tem
`render`, `startName` e `endName`.

---

## 12. Custos

| Decisão                                          | Custo                                                                                                                                              |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uma ponta de cada vez                            | O que o início recusa do fim vê-se só depois de escolher o início — no mesmo gesto, porque a aba troca sozinha. Editar as duas pontas de um valor inteiro são duas abas. |
| O campo só em ponteiro fino                      | Num telemóvel não se escreve um minuto fora do `step`; escolhe-se da lista ou muda-se `step`.                                                     |
| `done` sempre desenhado                          | Um botão a mais no desktop, onde a segunda escolha já fecha. É a saída de uma folha de ecrã inteiro e de uma edição a meio.                       |
| **[DT]** `months` com omissão 1                  | Um consumidor vindo de `date-range-picker` vê um mês onde via dois, e escreve `months={2}`.                                                        |
| Dois `hidden-input` na moldura                   | O `time-field` dentro do painel não submete; a família escreve `HH:mm:ss` — **[DT]** `YYYY-MM-DDTHH:mm:ss` — nos dois da moldura.                  |
| O trabalho não é o valor                         | Um consumidor que quer ver a primeira pressão no valor não a vê; vê-a em `onPositionChange` e em `onHighlightedChange`.                             |
| A pendente por ponteiro é local                  | `highlighted` só muda por teclado e por pressão; a opção sob o ponteiro entra em `length` e em mais nada.                                          |
| **[DT]** As horas não trocam quando a grelha ordena as datas | Um fim pressionado antes do início troca as datas e deixa cada hora na sua ponta.                                                      |
| **[DT]** A outra ponta só recusa no mesmo dia    | Um início a 12 set 14:00 e um fim a 13 set 08:00 são válidos; a duração diz 18 h.                                                                  |
| `minLength`/`maxLength` em segundos              | `maxLength={4 * 3600}` onde `date-range-picker` escreve `maxLength={7}`. É a unidade de `step`.                                                   |
| **[T]** Sem turno que atravessa a meia-noite     | `order` inválido; `datetime-range-picker` é a resposta.                                                                                            |
| `durationLabel` por `Intl.NumberFormat`          | "2 hr 30 min" e não "2 hours, 30 minutes": o estilo `short` é o que cabe numa banda de 240 px e ainda se lê como palavras em `de` ("2 Std. 30 Min."), onde `narrow` mistura "2h" com "30 Min.". |
| Sem arrasto, sem separadores, sem colunas, sem hora por omissão | As recusas do inventário, com a dona ou a composição.                                                                               |

---

## 13. Segunda volta do gate: uma ponta de cada vez

A primeira volta entregou as duas listas lado a lado, sob a banda com os dois
campos, e **[DT]** a grelha ao lado das duas. O revisor recusou-a no gate de
lançamento: complexa, "crua", sem lugar para um utilizador leigo nem para um
telemóvel — duas listas de 96 linhas, uma folha de ecrã inteiro sem saída,
rolagem aninhada. O contrato tinha recusado por escrito
"uma lista que troca com a posição, como MUI e Ant" com o argumento de que o
que o início recusa do fim só se descobre ao trocar; a troca é agora
automática no momento em que o início é escolhido, e a lista do fim aparece
já a recusar o que ele proíbe, com a duração em cada linha. O argumento
caiu; a decisão inverteu-se.

O que ficou da primeira volta: o motor, o trabalho, a regra do foco, a
duração por linha, a moldura de uma linha, os campos `plain` e as listas de
`time-picker`, a grelha de `date-range-picker`. O que mudou: as abas no
lugar dos dois campos, um painel no lugar de dois, o campo da ponta corrente
só em ponteiro fino, `hint`, `done`. Custo pago:
contratos, folhas, harness, as duas ligações e as quatro páginas refeitos
depois do passo 13 — o preço que o passo 9 existe para evitar, e que aqui
não evitou porque a pergunta do revisor não era sobre a imagem, era sobre a
quantidade de interface de uma vez.

