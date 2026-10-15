# OTP Input — desenho

Família nova, onda 10. Inventário em
`2026-09-16-otp-input-capability-inventory.md`. Este documento regista as
decisões que outra família herda e o que cada uma custa.

## 1. Padrão

Nenhum padrão APG (<https://www.w3.org/WAI/ARIA/apg/patterns/>, lido em
2026-09-16). O controlo é um `<input type="text">` nativo, um `textbox`, e a
plataforma responde ao teclado inteiro: ←/→ movem o cursor, Backspace e Delete
apagam, Home/End vão às pontas, Shift+←/→ estendem a seleção, Ctrl/Cmd+A
seleciona tudo, Ctrl/Cmd+V cola, Ctrl/Cmd+Z desfaz. A família não liga tecla
nenhuma; `keyboard` no contrato é vazio e `escapeBound` é `false`.

O que a família acrescenta sobre o `textbox`:

| Requisito                     | Quem responde  | Evidência                                                                              |
| ----------------------------- | -------------- | -------------------------------------------------------------------------------------- |
| Nome acessível                | `field`        | `label[for]` → `id` do input; `aria-describedby` fundido com o do `field`               |
| Estado `invalid`, `required`  | `field`, input | `aria-invalid`, `aria-required` no input; `data-invalid` na raiz                       |
| Estado `disabled`, `readonly` | input          | atributos nativos; `data-disabled`, `data-readonly` na raiz                            |
| Valor lido pelo leitor de tela | input         | o valor do `textbox`; com `mask`, `type="password"` e o leitor diz "seis caracteres"   |
| Caixas                        | família        | `aria-hidden="true"` na linha de caixas; são pintura                                    |
| Uma paragem de foco           | input          | um elemento focável; as caixas não têm `tabindex`                                       |

Departure deliberada: a seleção dentro do valor é normalizada para um
carácter selecionado (§3). Custo: Shift+← a partir de um carácter selecionado
estende a seleção do carácter anterior em diante, não a partir de um cursor
colapsado; é o comportamento de input-otp e o que faz digitar substituir.

## 2. Anatomia

| Parte       | Elemento | Presença                       | Função                                                                                                                                                              |
| ----------- | -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`      | `div`    | sempre                         | `data-ui="otp-input"`; sem role; `position: relative`; espelha `data-disabled`, `data-invalid`, `data-readonly`, `data-complete`, `data-size`, `data-variant`, `data-attached`, `data-mask` |
| `input`     | `input`  | sempre                         | o controlo: valor, `name`, `form`, `maxlength`, `autocomplete`, `inputmode`; `position: absolute; inset: 0`, texto e cursor transparentes, `opacity: 1`             |
| `group`     | `div`    | sempre, um por entrada de `groups` | linha de caixas de um grupo; com `attached`, as caixas partilham a aresta                                                                                         |
| `separator` | `div`    | entre dois grupos              | um traço curto desenhado em CSS; nunca um carácter                                                                                                                  |
| `slot`      | `div`    | `length` vezes                 | uma caixa: o carácter, ou o ponto da máscara, ou o placeholder por `::before`; `data-index`; `data-current` onde está o cursor ou a seleção                          |

O cursor falso é `::after` da caixa `data-current` enquanto o input está
focado e a caixa está vazia; pisca no `--slotted-duration-loop` e fica fixo
sob `prefers-reduced-motion`.

O input fica **por cima** das caixas, não por baixo: é o que recebe o clique,
o toque longo do iOS com "Colar", e a barra de autofill do teclado. Com
`opacity: 0` o iOS não mostra o menu de colagem (input-otp, `input.tsx`).
`::selection` transparente (com `!important`: um `::selection` da aplicação
sem layer venceria a regra em layer e pintaria o carácter selecionado ao lado
das caixas) e `caret-color: transparent` escondem o que o elemento pintaria;
`dragstart` é recusado, porque um carácter selecionado arrasta-se. Sob `forced-colors`, `forced-color-adjust: none` no input
mantém o texto transparente.

## 3. Motor — `@slotted/core/otp`

Funções puras, sem DOM, partilhadas pelos dois bindings. Um segundo módulo em
`packages/core` nesta onda; a alternativa era o algoritmo de seleção escrito
duas vezes.

- `acceptsCharacter(character, { type, pattern })` — `numeric` aceita
  `[0-9]`; `alphanumeric` aceita `[0-9A-Za-z]`; `pattern` vence.
- `sanitize(text, { length, type, pattern, transform })` → `{ value, rejected }`:
  corre `transform`, descarta o que não é aceite, corta a `length`.
- `spreadPlaceholder(placeholder, length)` → `string[]`: um carácter
  repete-se; N caracteres distribuem-se; o resto é vazio.
- `normalizeSelection({ start, end, valueLength, length, previous })` →
  `{ start, end, direction } | null`. A regra de input-otp: com o cursor
  colapsado dentro do valor, seleciona o carácter à frente; no fim de um valor
  cheio, o último; ao recuar de uma seleção de um carácter, o anterior. `null`
  quando nada muda.
- `currentSlots({ start, end, valueLength, length })` → `number[]`: os
  índices que recebem `data-current` — o intervalo selecionado, ou a caixa
  onde o cursor colapsado está, limitada a `length - 1`.

## 4. Estado

`value` é a única capacidade mutável.

```json
"value": {
  "controlled": "value",
  "uncontrolled": "defaultValue",
  "request": "onValueChange",
  "reasons": ["keyboard", "programmatic"]
}
```

`keyboard` é a superfície de edição do input — digitação, colagem, autofill do
teclado, IME — como em `text-field`. `programmatic` é o WebOTP: a aplicação
não pediu e o leitor não digitou; o SMS chegou.

`onComplete` e `onRejected` não são estado: são factos sobre uma edição, sem
valor a controlar e nada a cancelar.

Não controlado, a família **espelha** o valor do elemento (ao contrário de
`text-field`, que só espelha o comprimento): as caixas pintam os caracteres.
O elemento continua a fonte: `defaultValue` chega-lhe como atributo,
`form.reset()` restaura-o e a família ouve o `reset` para repintar.

## 5. Bindings

### React — `OtpInput`

`ComponentPropsWithRef<'input'>` menos `size`, `type`, `value`, `defaultValue`,
`pattern`, `maxLength`. `ref` é o input. `render(rootProps)` substitui a
raiz. `OtpInputDefaultsProvider` e `useOtpInputDefaults`.

| Pergunta                             | Resposta                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Par controlado / não controlado      | `value` / `defaultValue` / `onValueChange(value, request)`                                               |
| Defaults uma vez                     | `OtpInputDefaultsProvider`: `size`, `variant`, `attached`, `length`, `type`, `placeholder`               |
| Elemento substituível                | `render` na raiz; as caixas são fixas (pintura mapeada pelo ponteiro)                                    |
| Handler do consumidor corre          | `onChange`, `onFocus`, `onBlur`, `onPaste`, `onPointerDown` chamados antes dos da família                 |
| Elemento nativo e ação imperativa    | `ref` no input; `focus()` é nativo, nada mais é preciso                                                  |
| SSR sem mismatch                     | `useId` não é preciso (o id vem do `field`); nenhuma leitura de layout no render; seleção só em efeitos  |
| Estados no DOM                       | `data-disabled`, `data-invalid`, `data-readonly`, `data-complete` na raiz; `data-current` na caixa       |
| Props do elemento nativo, estendidas | `ComponentPropsWithRef<'input'>`                                                                         |

### Angular — `[slOtpInput]` + `input[slOtpInputControl]`

A mesma divisão de `text-field`: o componente é a moldura no elemento do
consumidor e desenha os grupos e as caixas por template; a diretiva no
`<input>` do consumidor é o controlo e o `ControlValueAccessor`, e injeta a
moldura sem `optional`, para que um input sem moldura falhe na construção.

| Pergunta                              | Resposta                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Valor em dois sentidos                | `[value]` + `(valueChange)` com `ChangeRequest`; forms por `ControlValueAccessor`                                          |
| Reactive Forms e template forms       | `NG_VALUE_ACCESSOR` na diretiva; `setDisabledState`; `registerOnTouched` no `blur`. Sem `Validator`: a validade é do form  |
| Defaults uma vez                      | `OTP_INPUT_DEFAULTS`, `provideOtpInputDefaults`, `injectOtpInputDefaults`                                                 |
| Instância no template                 | `exportAs: 'slOtpInput'` e `'slOtpInputControl'`                                                                          |
| Conteúdo projetado                    | `<ng-content />` para o input; as caixas são do template e não são projetáveis                                            |
| Zoneless e `OnPush`                   | `signal`, `computed`, `input()`, `output()`; sem `markForCheck`                                                            |
| Listeners desmontados                 | `selectionchange` do documento e `reset` do form por `DestroyRef`                                                         |
| Atributo estático sobrevive           | `HostAttributeToken` para `id`, `type`, `autocomplete`, `inputmode`, `aria-*`, `readonly`                                 |
| Um só ponto de entrada                | `@slotted/angular/otp-input`                                                                                              |

Assimetria registada: Angular tem `ControlValueAccessor`; React tem `name` e
`FormData` nativos. Nenhum foi nivelado ao outro.

## 6. Custos

- **A fila é sempre LTR.** Ganha: o código lê-se na ordem em que o SMS o
  mostra e em que um input RTL o pintaria. Custa: numa página RTL a raiz está
  na margem de início (direita) e o primeiro dígito na sua esquerda; a
  captura `--dir rtl` mostra-o.

- **`mask` muda o `type` para `password`.** Ganha: o leitor de tela não lê
  os dígitos; o teclado não os guarda. Custa: um gestor de palavras-passe pode
  oferecer guardar o valor ao submeter, e o atributo `autocomplete` do
  consumidor decide se aceita.
- **Seleção normalizada.** Ganha: digitar num valor cheio substitui em vez
  de ser recusado pelo `maxlength`. Custa: Shift+← estende a partir do
  carácter selecionado, não de um cursor colapsado.
- **Motor em `packages/core`.** Ganha: um algoritmo, testado uma vez. Custa:
  uma entrada nova em `packages/core/package.json` e `vite.config.ts`.
- **WebOTP opt-in.** Ganha: no Chrome Android o código chega sem teclado.
  Custa: não verificável nesta máquina; o gate diz o que foi verificado em
  vez disso (feature detection e abort ao desmontar, em teste).
