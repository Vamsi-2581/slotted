# Autoavaliação — `date-range-picker`

Contra `.claude/skills/component/references/rubric.md` e
`docs/component-features.md` §18. Capturas em
`/tmp/claude-1000/-home-dreco-dev-slotted/1b85645c-4bee-4a59-a36f-bbcb6bdd9e4a/scratchpad/shots/`;
harness em `tools/harness/out/date-range-picker.html`.

## As onze dimensões

| Dimensão                  | Estado | A mudança que mais a melhoraria                                                                                                                                                         | Feita |
| ------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1. Ícones                 | ok     | Os dois glifos são os da escala: `--slotted-icon-calendar` no gatilho e `--slotted-icon-x` no `clear`, ambos com `forced-color-adjust: none`. Nenhum glifo novo.                          | —     |
| 2. Motion                 | ok     | A camada entra pelo eixo em que abre (`slotted-date-range-picker-enter-down`/`-up`, `-fade` lateral) e só desvanece sob `prefers-reduced-motion`; o sublinhado de `data-current` transita em opacidade. | sim   |
| 3. Responsividade         | ok     | O fim quebra para a segunda linha antes do gatilho (240 px); a superfície é limitada por `--slotted-positioner-available-width` e o segundo mês envolve; `panels` é fila que quebra; folha sob ponteiro grosso. | sim   |
| 4. Refinamento            | ok     | O detalhe de mais uma hora: o `limit` de dois segmentos ("2 to 7 nights") em vez da frase longa que quebrava em duas linhas num painel de um mês. Feito no rótulo por omissão.            | sim   |
| 5. Tokens                 | ok     | 106 propriedades lidas, 42 da família, todas em `date-range-picker.tokens.json`; os dois campos internos são governados pelos tokens que `date-field` lê, nunca pelas partes.            | sim   |
| 6. Padrões                | ok     | Date Picker Dialog relido em 14 de setembro; a partida — fechar na segunda pressão — está escrita no contrato (`pattern.departure`) com o eixo `closeOnSelect`.                          | sim   |
| 7. Acessibilidade         | ok     | `length` como região `aria-live="polite"`: o leitor de ecrã ouve o comprimento a cada seta. Nome do gatilho com as duas pontas e o comprimento. Os dois campos nomeados (`label` em Angular). | sim   |
| 8. API nativa             | ok     | React: `ComponentPropsWithRef<'div'>` na raiz, `<'button'>` no atalho, `onClick`/`onKeyDown` compostos. Angular: `input()`/`output()`, `host`, `HostAttributeToken` via `date-field`, CVA + Validator. | sim   |
| 9. Capacidade             | ok     | As 26 linhas de table stakes: 20 `adopt`, 3 `adapt`, 3 `decline` com dona ou composição. Três modelos de estado. `contiguous`, `minLength`/`maxLength`, `preset`, `position`, `count`.    | sim   |
| 10. Integração            | ok     | Angular: `ControlValueAccessor` + `Validator` (cinco erros `slottedDateRange*`), `provideDateRangePickerDefaults`, `exportAs`, dois slots, diretiva `slDateRangePickerPreset`. React: provider, `render`, handle, `startName`/`endName`. | sim   |
| 11. Documentação          | parcial | Os dois ficheiros de página passam `referencePageErrors`, `apiMetadataErrors`, `scenarioCoverageErrors` e `snippetFormatErrors`; **não foram lidos renderizados**: 6006 está em baixo e 6007 não indexa a família até reiniciar. `audit.mjs` por correr. | não   |

## §18, ponto a ponto

1. **Propósito.** Um intervalo de datas escolhido em dois campos ou numa grelha, com o comprimento dito enquanto se desenha. Antiuso: uma hora ou um datetime (`time-range-picker`, `datetime-range-picker`, onda 8); um só dia (`date-picker`).
2. **Anatomia.** 19 partes em `specs/components/date-range-picker/contract.json`; o harness e as duas ligações escrevem todas (`date-range-picker.test.tsx` "declares every part", `date-range-picker.spec.ts` idem).
3. **Contrato.** Três modelos: `value` (`DateRange | null`; razões `pointer`, `keyboard`, `select`, `clear`, `blur`, `programmatic`), `open`, `current` (`position`). Não controlado lê `default*` uma vez. Angular emite `ChangeRequest` e não tem `model()`: um slot não carrega razão.
4. **Matriz de estados.** `disabled` > `readonly` > `invalid` > `current` > `hover` > `focus-visible`, com `:not()` em cada regra mais fraca (`date-range-picker.css`, secção "States on the frame"). `selected` só no `preset`. `open` na raiz e na camada.
5. **Teclado, foco, ARIA.** Tabela em `contract.keyboard`; testes: chord, Escape escalonado, foco na célula corrente ao abrir, foco de volta ao gatilho ao fechar, `aria-controls` só aberto, `aria-live` em `length`, nomes dos dois grupos. Touch: folha sob ponteiro grosso.
6. **Recipes.** `size` (3), `variant` (3), `count` (2); densidade pelas escalas de controlo (captura `dense`).
7. **Responsivo, RTL, locale, motion.** Capturas 240/420/720, `rtl`, `dense`; travessão como nó de texto e `unicode-bidi: plaintext` em `length`/`limit`; `locale` chega aos três; reduzido só desvanece.
8. **Loading, empty, error, extremo.** Vazio: placeholders na banda e nos campos; erro: `invalid` da família (ordem, limites, indisponível, comprimento) e do consumidor; extremo: dois meses a 240 px, valor com uma ponta, mesmo dia nas duas pontas. Loading não se aplica: nada é assíncrono.
9. **SSR.** `useId`; hoje em efeito (via `calendar`); `matchMedia` guardado.
10. **Exemplos.** 13 cenas por página, um domínio (uma estadia de hotel em setembro de 2026).
11. **Testes partilhados.** 33 React, 28 Angular, 17 core, 40/37 `calendar`, 22 contrato — os mesmos casos nas duas ligações.
12. **Quebra de contrato.** Nenhuma. Aditivo em `calendar` (`data-preview`, `onPreviewChange`) e em `date-field` Angular (`label`).

## Assimetrias registadas

- Angular tem `Validator` e `ControlValueAccessor`; React tem `startName`/`endName` e `render`.
- React nomeia os campos por `aria-label` (prop); Angular por `label` (input novo em `date-field`), porque `HostAttributeToken` lê só atributos estáticos.

## O que ficou por verificar nesta máquina

- As duas páginas de referência renderizadas, a 1280 e 720, claro e escuro, e `audit.mjs` a 1280 e 620: os dois Storybooks precisam de reinício para ver a família.
- Um leitor de ecrã real a ouvir `length`.
- Um dispositivo com ponteiro grosso para a folha.
