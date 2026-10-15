# `text-field` — reconstrução do passe ReUI (2026-09-30)

Modo `build` (`/component text-field` com `/reui text-field`). O pedido cobre
todas as entradas; a fila por família está em § 6. O dossiê de medidas está em
`2026-09-30-text-field-reui-dossier.md`.

## 1. Inventário

### 1.1 Surveyed

| Implementação              | Nome                                                                                                                  | Fonte                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| ReUI (Base UI, `nova`)     | `InputGroup`, `InputGroupAddon` (`inline-start`, `inline-end`, `block-start`, `block-end`), `InputGroupButton`, `InputGroupText` | `https://reui.io/r/c-input-group-{2..40}.json`, 29 exemplos lidos |
| shadcn/ui                  | `InputGroup` (a mesma anatomia; ReUI deriva dela)                                                                     | `https://ui.shadcn.com/docs/components/input-group`            |
| Primer React               | `TextInput` — `leadingVisual`, `trailingVisual`, `trailingAction`, `loading`, `loaderPosition`                         | `https://primer.style/components/text-input`                   |
| Shopify Polaris            | `TextField` — `prefix`, `suffix`, `connectedLeft/Right`, `clearButton`, `loading`                                      | `https://polaris.shopify.com/components/selection-and-input/text-field` |
| Ant Design 5               | `Input` — `prefix`, `suffix`, `addonBefore/After`, `allowClear`, `showCount`; `Input.Password`; `Input.Search` (`enterButton`, `loading`) | `https://ant.design/components/input`                          |
| Mantine 7                  | `TextInput` (`leftSection`, `rightSection`), `PasswordInput`, `CopyButton`                                             | `https://mantine.dev/core/text-input/`                         |
| Chakra UI 3                | `InputGroup` (`startElement`, `endElement`, `startAddon`, `endAddon`), `Clipboard`                                    | `https://chakra-ui.com/docs/components/input`                  |
| HTML                       | `input` (`type`, `autocomplete`, `inputmode`, `enterkeyhint`); `KeyboardEvent.getModifierState('CapsLock')`             | `https://html.spec.whatwg.org/multipage/input.html`            |

Espécime de referência: ReUI `c-input-group-11` (cópia) e `c-input-group-12`
(menu no início), claro e escuro, com `--states` no botão interno.

### 1.2 Table stakes

| Capacidade                                      | Quem entrega                                       | Veredicto | Razão |
| ----------------------------------------------- | -------------------------------------------------- | --------- | ----- |
| Valor controlado e não controlado               | todos                                              | adopt     | Já entregue; `stateModel.value`. |
| Adorno de texto ou ícone no início e no fim     | todos                                              | adopt     | Já entregue; `start`, `end`. |
| Botão arbitrário dentro da moldura              | ReUI, shadcn, Primer (`trailingAction`), Mantine, Chakra | adopt | Parte nova `action`. |
| Gatilho de menu dentro da moldura (país, categoria, "mais") | ReUI 12, 28, 29, 32, 34; Polaris (`connectedLeft`) | adapt | `action` recebe o gatilho de `menu` por composição (React `render`, Angular `slMenuTriggerFor` no mesmo `button`). Nenhuma parte de menu própria. |
| `select` aninhado na moldura                    | Polaris (`connectedLeft`), Ant (`addonBefore`)     | decline   | `select` liga-se ao `field` como controlo e tomaria o `id` do `input`. A composição é `action` + `menu` com `MenuRadioGroup`, ou `button-group` com `select` fora do `field`. |
| Adorno ligado fora da moldura                   | Ant (`addonBefore/After`), Chakra (`startAddon`), Polaris | defer to `button-group` | A família já junta filhos com arestas partilhadas; uma cena do harness prova `button-group > text-field + button`. |
| Botão limpar                                    | Ant, Polaris, Mantine, React Aria `SearchField`    | adopt     | Já entregue. |
| Revelar senha                                   | ReUI 35, Ant, Mantine, Chakra                      | adopt     | Já entregue; `stateModel.revealed`. |
| Indicador de carregamento na moldura            | Primer, Polaris, Ant `Input.Search`, ReUI 15       | adopt     | Reabertura da decisão do passe 1 (`defer to progress-indicator`): `spinner` existe. Parte `busy`. |
| Copiar o valor                                  | ReUI 11, Mantine `CopyButton`, Chakra `Clipboard`  | adopt     | Parte `copy`, a forma de `code-block` (`@slotted/core/clipboard`, marca `check`, anúncio). |
| Atalho de teclado no fim                        | ReUI 13, 23                                        | adopt     | Composição já suportada: `kbd` em `end` lê `--slotted-control-inner-size`. |
| Contador                                        | Ant, Polaris, ReUI 17                              | adopt     | Já entregue; o `field` posiciona. |
| Faixa de adornos acima e abaixo (`block-start`, `block-end`) | ReUI 16–19, 26, 33, 34              | defer to `prompt-composer` | Só existe sobre `textarea`; uma linha de texto com faixa acima é um `field` com rótulo. |

### 1.3 Differentiators

| Capacidade | Razão |
| ---------- | ----- |
| Aviso de Caps Lock num campo de senha (`caps-lock`) | Nenhuma implementação pesquisada o entrega. `getModifierState('CapsLock')` em `keydown`/`keyup` enquanto o foco está no `input`; anunciado uma vez por `live-announcer`. |
| Inserção concêntrica dos botões internos | O botão no extremo da moldura fica à mesma distância da borda no bloco e na linha, e o raio interno é o raio da moldura menos essa distância, com piso `--slotted-radius-xs`. ReUI usa 4 px nos dois eixos com raio 7 dentro de 10. |
| Troca de marca animada (`copy` → `check`, `eye` → `eye-off`) | A marca nova entra por `@starting-style` com `scale` 0.8 → 1 e opacidade; ReUI troca sem transição. |
| Três esquemas, três densidades, RTL, dois bindings | Herdados da fundação. |

### 1.4 Gaps

| Caso | Resposta |
| ---- | -------- |
| Área de transferência recusada (contexto inseguro, permissão) | `copy` anuncia `copyFailedLabel`, não mostra a marca de sucesso, e `onValueCopy` recebe `copied: false`. |
| Carregamento com o campo editável (validação assíncrona do nome de utilizador) | `loading` não desativa: `aria-busy` no `input`, o valor continua editável, o `spinner` ocupa o lugar antes dos botões. |
| Muitas ações num campo estreito (240 px) | Adornos e botões não encolhem (`flex: 0 0 auto`); o valor cede largura e rola. Cena `narrow`. |
| Força da senha | decline: política da aplicação. Composição: `<FieldDescription>` com `progress-indicator` e o texto da regra. |

### 1.5 Delta face ao que existe

Existia: `root`, `input`, `start`, `end`, `clear`, `reveal`, `mono`, três
variantes, contagem. Entra: `action`, `busy`, `copy`, `caps-lock`, estado
`loading`, inserção concêntrica, entrada e saída animadas das partes
transitórias, troca de marca animada. Sai: nada. A tinta no hover e o
deslocamento de 1 px na pressão, medidos no ReUI, ficam de fora pela regra R2.3
(`packages/styles/src/inner-control.test.mjs`).

## 2. Padrão

A APG não tem padrão para `textbox`. O `input` nativo dá papel, nome (via
`field`), teclado e estados. A regra WAI-ARIA 1.2 (§ `textbox`: filhos
apenas apresentacionais) mantém os botões como irmãos do `input` dentro de uma
moldura sem papel. O gatilho de menu dentro de `action` segue o padrão Menu
Button (`https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/`), que a família
`menu` já cumpre: `aria-haspopup`, `aria-expanded`, `Enter`/`Space`/`ArrowDown`
abrem. A família não escuta nenhuma tecla; `keyboard` continua vazio.

## 3. Decisões

1. **`action` é um `button` do consumidor, dentro de `start` ou `end`.** React
   `TextFieldAction` (`ComponentPropsWithRef<'button'>`, `render`); Angular
   `button[slTextFieldAction]`. Quadrado quando tem nome por `aria-label` ou
   `aria-labelledby` (um botão só com ícone tem de o ter), com enchimento
   lateral quando o nome é o seu texto. `aria-expanded="true"` pinta o fundo de
   pressão enquanto o menu está aberto.
2. **Ordem dos filhos:** `start`, `input`, `busy`, `caps-lock`, `clear`,
   `copy`, `reveal`, `end`. O estado transitório vem primeiro; a ação mais
   frequente fica mais perto do valor; `end` do consumidor fecha a moldura.
3. **`copied` não é estado controlável.** A área de transferência não é valor
   da família; o retorno dura 2000 ms (`COPIED_FOR` de `code-block`) e publica
   `data-complete`. A saída é `onValueCopy({ copied, reason, source, value })`;
   `onCopy` pertence ao evento nativo do `input`.
4. **Caps Lock é um facto da plataforma**, lido e não pedido: sem par
   controlado. Aparece só com `type="password"` e foco no `input`.
5. **`loading` pertence ao consumidor** (só controlado, a família nunca o
   muda): `data-loading` na moldura, `aria-busy` no `input`.
6. **Inserção concêntrica** substitui o alinhamento da marca à margem do texto
   quando um botão é o primeiro ou o último filho visível. Custo: a marca fica
   4 px mais perto da borda do que o início do texto em `md`.
7. **Glifo novo `caps-lock`** em `@slotted/core/glyph` (seta cheia com barra),
   em commit próprio antes da família.

## 4. Integração

### React

| Pergunta | Resposta |
| -------- | -------- |
| Par controlado + pedido com razão | `value`/`defaultValue`/`onValueChange`; `revealed`/`defaultRevealed`/`onRevealedChange`. |
| Defaults uma vez | `TextFieldDefaultsProvider` ganha `copyLabel`, `copiedLabel`, `copyFailedLabel`, `capsLockLabel`. |
| Substituir o elemento | `render` na moldura e em `TextFieldAction`; `input` fixo (é o controlo). |
| Handler do consumidor | `onChange`, `onKeyDown`, `onKeyUp`, `onBlur` compostos; `onClick` de `TextFieldAction` passa intacto. |
| `ref` e ação imperativa | `ref` no `input`; `focus()`/`select()` são do elemento nativo. |
| SSR | Nada é lido do layout durante o render; Caps Lock só depois de um evento. |
| Estados no DOM | `data-disabled`, `data-invalid`, `data-readonly`, `data-loading`, `data-complete` em `copy`. |
| Tipo nativo | `TextFieldActionProps extends ComponentPropsWithRef<'button'>`. |

### Angular

| Pergunta | Resposta |
| -------- | -------- |
| `model()` + `output()` | `value`, `revealed` como `model()`; `valueCopy` como `output()`. |
| Forms | `ControlValueAccessor` já existe em `text-field-input.ts`. |
| Defaults | `provideTextFieldDefaults()` ganha as quatro etiquetas. |
| `exportAs` | `slTextField` já existe; `slTextFieldAction` novo. |
| Projeção | `[slTextFieldStart]`, `[slTextFieldEnd]`; `button[slTextFieldAction]` projetado dentro deles. |
| Zoneless/OnPush | sinais; o temporizador de `copy` limpo em `DestroyRef`. |
| Teardown | `DestroyRef.onDestroy` para o temporizador. |
| Atributo estático | `data-part="action"` reescrito depois da primeira deteção quando `slMenuTriggerFor` está no mesmo elemento (regra de `menu`). |
| Entrada única | `@slotted/angular/text-field`. |

## 5. Quebra de contrato

Nenhuma prop existente muda de forma. As partes novas são aditivas.

## 6. Fila das entradas

1. `text-field` (esta).
2. `textarea` + `prompt-composer` (faixas `block-start`/`block-end`, envio, anexos, modelo).
3. `color-picker` (campo de cor com amostra, formatos, `EyeDropper`).
4. `number-field` e `currency-field`: polimento com as regras de § 3.1, § 3.6.
