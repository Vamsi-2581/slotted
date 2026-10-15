# Desenho — `date-range-picker`

Decisões tomadas sobre o inventário em
`2026-09-14-date-range-picker-capability-inventory.md`. Lê-se depois dele e
antes do contrato. O que `date-picker` e `datetime-picker` já decidiram e esta
família herda sem mudança não é repetido aqui: a camada composta de
`packages/core`, a folha em viewport estreita com ponteiro grosso, o `Escape`
escalonado, o nome do gatilho, o `Alt`+`ArrowDown` com a nota de ChromeOS.

---

## 1. O que a família é

Dois `date-field` numa moldura só, um gatilho, e `calendar` em modo `range`
atrás dele. A família desenha a moldura, o separador, o gatilho, o botão de
limpar, a camada e a banda `head`; não redesenha um segmento nem uma célula.

O valor é `DateRange | null`, o tipo que `calendar` exporta: `{ start, end }`
com cada ponta anulável. As duas formas de "nada" colapsam numa: um pedido cujas
duas pontas são `null` leva `null`.

---

## 2. Anatomia

| Parte        | Elemento | Sempre | Para                                                                                             |
| ------------ | -------- | ------ | ------------------------------------------------------------------------------------------------ |
| `root`       | `div`    | sim    | `data-ui="date-range-picker"`.                                                                   |
| `control`    | `div`    | sim    | A moldura: desenha a borda que os dois campos, em `variant="plain"`, não desenham. Âncora do posicionador. |
| `start`      | `div`    | sim    | Embrulha o `date-field` do início. Leva `data-current` quando é a ponta corrente.               |
| `separator`  | `span`   | sim    | Um travessão, `aria-hidden`.                                                                     |
| `end`        | `div`    | sim    | Embrulha o `date-field` do fim. Leva `data-current` quando é a ponta corrente.                   |
| `clear`      | `button` | não    | Esvazia as duas pontas. Desenhado com `clearable`.                                               |
| `trigger`    | `button` | sim    | Abre o painel. O nome carrega as duas pontas e o comprimento.                                    |
| `positioner` | `div`    | não    | A camada, em portal. Carrega `data-ui` também.                                                   |
| `content`    | `div`    | não    | `role="dialog"`. A superfície.                                                                   |
| `head`       | `div`    | não    | A banda: as duas pontas como estão, o comprimento, o limite.                                     |
| `head-start` | `span`   | não    | O início, ou o seu placeholder.                                                                  |
| `head-end`   | `span`   | não    | O fim, ou o seu placeholder.                                                                     |
| `length`     | `span`   | não    | "4 noites". `aria-live="polite"`.                                                                |
| `limit`      | `span`   | não    | "2 to 7 nights". Desenhado quando há `minLength` ou `maxLength`.                                 |
| `panels`     | `div`    | não    | Os atalhos e a grelha, numa fila que quebra: lado a lado onde cabe, a grelha por baixo onde não cabe. |
| `presets`    | `div`    | não    | A coluna dos atalhos do consumidor.                                                              |
| `preset`     | `button` | não    | Um atalho: escreve o seu `DateRange` com `reason: 'select'`. `data-selected` quando é igual ao valor. |
| `footer`     | `div`    | não    | As ações do consumidor.                                                                          |

Os dois `date-field` e o `calendar` ficam com o seu próprio `data-ui`. Os dois
campos não desenham `clear` próprio: `clearable` desenha um só, na moldura.

O gatilho fica na moldura, depois do campo de fim, e não no slot `end` de um
dos campos: um gatilho dentro de um campo diria que abre esse campo.

---

## 3. Estado

| Valor              | Controlado | Não controlado    | Pedido             | Razões                                                      |
| ------------------ | ---------- | ----------------- | ------------------ | ----------------------------------------------------------- |
| o intervalo        | `value`    | `defaultValue`    | `onValueChange`    | `pointer`, `keyboard`, `select`, `clear`, `blur`, `programmatic` |
| o painel           | `open`     | `defaultOpen`     | `onOpenChange`     | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`    |
| a ponta corrente   | `position` | `defaultPosition` | `onPositionChange` | `pointer`, `keyboard`, `select`, `clear`, `programmatic`     |

`position` é a capacidade `current` do vocabulário: `start` ou `end`. Diz duas
coisas com uma palavra — qual campo leva `data-current`, e qual ponta a próxima
pressão na grelha escreve.

`keyboard` e `pointer` são as razões de um campo que recebe foco; a moldura
regista o `pointerdown` que precede o foco e distingue as duas. `select` é a
razão de uma pressão na grelha ou num atalho que move a ponta corrente.

O comprimento pendente e a ponta pendente não são estado da família: são
derivados do rascunho e do que `calendar` diz (§4).

---

## 4. A corrida em curso

### O rascunho não é o valor

Uma pressão na grelha que deixa a corrida com uma ponta só não emite pedido de
valor. A família guarda essa ponta como rascunho, mostra-a ao calendário como
`{ start, end: null }`, e a segunda pressão emite o intervalo inteiro com
`reason: 'select'`. `Escape`, uma pressão fora e o gatilho abandonam o rascunho
e o valor anterior fica.

Um valor com uma ponta só existe na mesma: escreve-se no campo, onde o leitor
o vê, e é `{ start, end: null }` ou `{ start: null, end }`. Um painel aberto
sobre `{ start, end: null }` trata o início como corrida aberta e a primeira
pressão fecha-a.

### A ponta pendente é do calendário

`calendar` ganha uma capacidade que não tinha e que quatro das nove
implementações pesquisadas têm: em modo `range`, com uma corrida aberta, a
grelha desenha a banda do `start` até à **ponta pendente** — o dia sob o
ponteiro, ou o dia focado quando nenhum ponteiro está sobre a grelha. As
células dessa banda levam `data-in-range`, `data-range-start` ou
`data-range-end` como hoje, mais `data-preview`, e a folha de `calendar`
pinta-as mais leves que a corrida escolhida. Uma pendente anterior ao início
desenha a banda ao contrário, que é o que a segunda pressão escreverá.

O calendário diz a ponta pendente por `onPreviewChange(date | null)` em React e
`(previewChange)` em Angular. É um facto que a grelha declara, como
`onViewChange`, e não um pedido: o consumidor não a possui.

Custo: uma mudança aditiva em `calendar`, nas duas ligações, na folha e no
contrato, em commit próprio antes do desta família. É levada ao gate visual
como contrato fora da família.

### O comprimento é dito enquanto a corrida é desenhada

`length` mostra `lengthLabel(count, unit)` para a corrida que existiria se a
ponta pendente fosse escolhida; com a corrida fechada, para o valor. Numa
região `aria-live="polite"`, um leitor de ecrã ouve-o a cada seta.

`count` é `days` ou `nights`; omissão `days`. `days` conta as duas pontas
inclusive; `nights` conta a diferença. O mesmo dia nas duas pontas é `1 day` ou
`0 nights`, e a banda diz-o. `minLength` e `maxLength` contam na unidade de
`count`.

---

## 5. A ponta corrente

| Situação                                          | `position` depois | Razão         |
| ------------------------------------------------- | ----------------- | ------------- |
| Foco entra no campo de início                     | `start`           | `pointer` ou `keyboard` |
| Foco entra no campo de fim                        | `end`             | `pointer` ou `keyboard` |
| A grelha escreve o início (corrida reaberta)      | `end`             | `select`      |
| A grelha fecha a corrida                          | `start`           | `select`      |
| Um atalho escreve o valor                         | `start`           | `select`      |
| `clear`                                           | `start`           | `select`      |

O que o calendário recebe depende da posição: com `position: 'end'` e um valor
inteiro, recebe `{ start, end: null }`, para que a próxima pressão escreva o
fim em vez de recomeçar — a regra de `nextValue` em `calendar` recomeça sobre
uma corrida inteira, e é a única regra. Com `position: 'start'`, recebe o
valor inteiro e a próxima pressão recomeça.

Ao abrir, o foco vai para a célula da ponta corrente, ou para hoje quando ela
está vazia — a regra do APG para o botão "Choose Date".

`data-current` na parte `start` ou `end` está sempre no DOM; a folha só o
pinta com o painel aberto ou o foco dentro da moldura.

---

## 6. Limites

| Regra                       | Onde é imposta                                                                                                                                            | Quando falha no valor escrito |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `min`, `max`                | Nos dois campos e no calendário. Cruzados: o campo de início recebe `max = min(max, end)`, o de fim `min = max(min, start)`.                            | `invalid` no campo e na moldura |
| `isDateUnavailable`         | Nos dois campos e no calendário, uma vez por célula.                                                                                                      | `invalid` |
| `contiguous` (omissão `true`) | Com uma corrida aberta, os dias para lá do primeiro indisponível depois do início, e para cá do primeiro antes, ficam indisponíveis na grelha. A procura corre uma vez por início, para cada lado, até `maxLength` dias ou 366. | O predicado corre sobre cada dia do intervalo escrito, uma vez por mudança de valor: `invalid` se algum for indisponível. |
| `minLength`, `maxLength`    | Com uma corrida aberta, os dias que dariam um comprimento fora do limite ficam indisponíveis na grelha, e `limit` diz o limite.                          | `invalid` |
| fim antes do início         | Não é imposto na grelha: `nextValue` troca as pontas. No campo, nada é trocado.                                                                          | `invalid` no campo de fim e na moldura |

A validade é da família: `data-invalid` na raiz, `invalid` no campo que a
causou. Em Angular, `Validator` reporta `slottedDateRangeMin`, `slottedDateRangeMax`,
`slottedDateRangeUnavailable`, `slottedDateRangeOrder`, `slottedDateRangeLength`,
no prefixo que `date-field` já usa.

A grelha nunca recusa em silêncio: um dia indisponível continua focável com
`aria-disabled`, que é a regra de `calendar`.

---

## 7. Teclado

Padrão relido em 14 de setembro de 2026:
<https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/>,
"Date Picker Dialog Example". Não há padrão de intervalo. A tabela da grelha e a
do diálogo estão transcritas em `2026-09-09-date-design.md` §5 e não mudaram.

| Tecla                       | Onde                | Efeito                                                                                          |
| --------------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| `Alt`+`ArrowDown`           | um segmento         | Abre o painel; o foco fica no campo.                                                            |
| `Enter`, `Space`            | o gatilho           | Abre; foco na célula da ponta corrente, ou em hoje.                                            |
| as teclas da grelha         | o calendário        | As de `calendar`, sem mudança; cada seta move a ponta pendente e `length` diz o comprimento.   |
| `Enter`, `Space`            | uma célula          | Primeira pressão: rascunho, `position` vai a `end`. Segunda: o valor, e a regra de `closeOnSelect`. |
| `Enter`, `Space`            | um atalho           | Escreve o valor; fecha por `closeOnSelect`.                                                     |
| `Tab`                       | com o painel aberto | Contido: atalhos, grelha (uma paragem), rodapé.                                                 |
| `Escape`                    | com o painel aberto | A vista do calendário primeiro; depois o painel, abandonando o rascunho; foco no gatilho.       |

Partida deliberada, com custo: o APG fecha na primeira pressão e esta família
fecha na segunda, porque um intervalo são duas pressões. `closeOnSelect` diz o
resto: `auto` fecha quando a corrida fica inteira, `always` fecha em qualquer
pressão que mude o valor, `never` não fecha.

---

## 8. Estados no DOM

`default`, `hover`, `active`, `focus-visible`, `disabled`, `invalid`,
`readonly`, `required`, `open`, `current`, `selected`. Precedência
`STATE_PRECEDENCE`, sem mudança.

| Atributo            | Em                         | Diz                                                     |
| ------------------- | -------------------------- | ------------------------------------------------------- |
| `data-current`      | `start`, `end`             | A ponta corrente.                                       |
| `data-selected`     | `preset`                   | O atalho igual ao valor.                                |
| `data-placeholder`  | `head-start`, `head-end`   | A ponta ainda não existe.                               |
| `data-pending`      | `head-end`, `head-start`, `length` | O que é mostrado é a ponta pendente, não o valor. |
| `data-count`        | `root`                     | `days` ou `nights`.                                     |
| `data-placement`    | `positioner`               | O lado e o alinhamento resolvidos.                      |
| `data-presentation` | `positioner`               | `popover` ou `sheet`.                                   |
| `data-preview`      | célula de `calendar`       | A banda pendente (§4).                                  |

---

## 9. Integração — React

| Pergunta                                                         | Resposta                                                                                                                                                                           |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Par controlado/não controlado e pedido com razão                 | As três linhas de §3, por `createControllable`.                                                                                                                                    |
| Padrões definidos uma vez                                        | `DateRangePickerDefaultsProvider` e `useDateRangePickerDefaults`: `locale`, `timeZone`, `calendar`, `months`, `count`, `lengthLabel`, `limitLabel`, `closeOnSelect`, `placement`, `size`, `variant`, `chooseLabel`, `changeLabel`, `startLabel`, `endLabel`, `clearLabel`. |
| Substituir o elemento de cada parte                              | `render` na raiz; `DateRangePickerPreset` com `render`. As partes internas da moldura são fixas: um `div` que embrulha outra família não tem elemento a trocar sem perder o foco composto. |
| O handler do consumidor corre                                    | `onKeyDown`, `onClick`, `onFocus` chamados primeiro; a família cede em `defaultPrevented`.                                                                                        |
| Elemento nativo e ação imperativa                                | `ref` com `DateRangePickerHandle`: `focus(position?)`, `open()`, `close()`.                                                                                                       |
| Servidor sem divergência                                         | `useId`; hoje lido em efeito, como os irmãos.                                                                                                                                      |
| Cada estado no DOM                                               | §8, escrito pelo teste de contrato.                                                                                                                                                |
| Props tipadas pelo elemento nativo                               | `ComponentPropsWithRef<'div'>` na raiz e `<'button'>` no atalho, com `defaultValue`, `onChange` e `ref` substituídos.                                                             |

## 10. Integração — Angular

| Pergunta                                            | Resposta                                                                                                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valor bidirecional na forma de signal               | `input()` para `value`, `open`, `position`; `output<ChangeRequest>()` para os três pedidos — a decisão de `date-picker`: um `model()` não carrega razão.  |
| Reactive Forms e template forms                     | `ControlValueAccessor` com o `DateRange` inteiro e `Validator` com os cinco erros de §6.                                                                   |
| Padrões definidos uma vez                           | `SLOTTED_DATE_RANGE_PICKER_DEFAULTS` e `provideDateRangePickerDefaults()`.                                                                                 |
| Template alcança a instância                        | `exportAs: 'slDateRangePicker'`, `exportAs: 'slDateRangePickerPreset'`.                                                                                  |
| Conteúdo projetado, preguiçoso                      | Slots `[slDateRangePickerPresets]` e `[slDateRangePickerFooter]`; a diretiva `slDateRangePickerPreset` injeta o picker.                                    |
| Zoneless e `OnPush`                                 | Signals; `computed` para cada derivado; sem `markForCheck`.                                                                                                |
| Subscrições desfeitas                               | `DestroyRef` para a camada, o posicionador e a media query.                                                                                                |
| Atributo estático sobrevive ao host                 | `HostAttributeToken` para `id`, `aria-label`, `aria-describedby`.                                                                                          |
| Um ponto de entrada, uma classe                     | `@slotted/angular/date-range-picker`; importa `date-field` e `calendar` pelos seus pontos de entrada.                                                      |

A assimetria: Angular tem `Validator` e `ControlValueAccessor`; React tem
`render`, `startName` e `endName` para os dois `hidden-input`.

---

## 11. Custos

| Decisão                                        | Custo                                                                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| A ponta pendente é do calendário               | Uma mudança em `calendar`, nas duas ligações. Um calendário sozinho em modo `range` passa a desenhar a pré-visualização; quem não a quer não tem interruptor. |
| O rascunho não é o valor                       | Um consumidor que quer ver a primeira pressão no valor não a vê; vê-a em `onPositionChange` com `reason: 'select'`.             |
| `position: 'end'` retém o fim do calendário    | Com o painel aberto sobre o campo de fim, a grelha desenha o início e a banda pendente, não o intervalo escolhido.              |
| A moldura desenha a borda                      | Os dois campos ficam em `plain` e o anel de foco é da moldura: o `focus-visible` de um segmento continua no segmento, e a moldura responde a `:focus-within`. |
| `contiguous` procura até 366 dias por lado     | Até 732 chamadas ao predicado por início escolhido; nunca por célula nem por tecla.                                              |
| Sem arrasto de ponta                           | Duas pressões. Uma só implementação pesquisada arrasta.                                                                          |
| Sem intervalo de comparação                    | Dívida de `calendar`, a terceira abertura de §12 do desenho de data.                                                             |
| `date-field` Angular ganha o input `label`     | Um nome acessível ligado, e não só escrito: uma diretiva sem `useId` não tinha como nomear dois campos a partir de um input. Aditivo; `aria-label` estático continua a valer. |
| `panels` sem container query                   | A 240 px com atalhos, a lista fica acima da grelha como coluna esticada; a folha para ponteiro grosso fá-la fila. |
