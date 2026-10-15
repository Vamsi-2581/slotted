# `color-picker` — autoavaliação (2026-10-01)

Desenho: `2026-10-01-color-picker-design.md`. Dossiê: `2026-10-01-color-picker-reui-dossier.md`.

## Onze dimensões

| # | Dimensão | Evidência | Mudança que mais a melhoraria | Feita |
| - | -------- | --------- | ----------------------------- | ----- |
| 1 | Icons | `Glyph` em `previous` (`rotate-ccw`), `format` (`chevron-down`), `eyedropper` (`pipette`, glifo novo), `gamut` (`circle-alert`) | — | — |
| 2 | Motion | Polegares crescem para 1.15 ao arrastar; predefinições 1.08/0.94; marca de repor entra por opacidade; polegar movido por teclado não anima | Transição da posição do polegar num clique da pista | Não: a posição é uma propriedade de tempo de execução; animá-la atrasaria o arrasto |
| 3 | Responsiveness | 240 px lido: o painel ocupa a largura disponível (`max-inline-size: 100%`) | As dez predefinições quebram em 9 + 1 a 240 px | Não: aceitável com o painel acima da largura padrão; colunas fixas falhariam com outras contagens |
| 4 | Refinement | Polegares dentro da pista; anel de seleção a 2 px do chão; chevron de `format` centrado na banda das letras (0,00 px medido) | Costura de 1 px entre `swatch` e `previous` | Não |
| 5 | Tokens | `color-picker.tokens.json` igual ao lido; nove propriedades de tempo de execução registadas; branco/preto da área e anel dos polegares como literais com razão | — | — |
| 6 | Patterns | APG Slider por canal; área como slider 2D (convenção React Aria); APG Radio Group nas predefinições | — | — |
| 7 | Accessibility | `aria-valuetext` em palavras; nível de contraste em palavras e `aria-live`; texto do valor sempre `ltr`; `forced-color-adjust: none` nas superfícies de cor | Teste com leitor de ecrã real | Não verificável nesta máquina |
| 8 | Native API | React: partes com `ComponentPropsWithRef<'div'>`; `ColorField` aceita as props de `TextField` | — | — |
| 9 | Capability | Inventário § 1; roda e gradientes recusados com composição | Roda de cor | Recusada (§ 1.2) |
| 10 | Ecosystem | React: partes compostas por filhos, provider; Angular: `ControlValueAccessor` em `slColorPicker` e `slColorField`, `provideColorPickerDefaults`, `exportAs` | Escolha de partes no Angular | Assimetria registada: uma diretiva de atributo não vê o conteúdo projetado antes de desenhar; as partes escolhem-se por inputs |
| 11 | Documentation | Dez cenários nas duas páginas; `audit.mjs` React e Angular a 1280 e 620 sem achados depois de `states` passar a duas colunas | Ler cada história em escuro | Não: lidas em claro (`panel` React, `field` Angular aberto) |

## Secção 18

- **Anatomia:** `colorPicker` (root, area, area-thumb, channel, channel-thumb, row, swatch, previous, input, format, eyedropper, presets, preset, contrast e subpartes, gamut); `colorField` (root, input, trigger, content).
- **Controlado/não controlado:** `value` (pointer, keyboard, select, programmatic), `format` (select), `open` no campo.
- **Estados:** `disabled` cinzenta e tira da ordem de tabulação; `readonly` foca e não move; `invalid` no texto enquanto o rascunho não é uma cor; `out-of-gamut` dito e não convertido.
- **Extremos:** texto inválido volta ao último válido; cor sem saturação mantém a matiz; `EyeDropper` ausente não desenha a parte.

## Defeitos encontrados nas páginas

- Três colunas de painéis a 1280 px davam 157 px por palco e a linha transbordava: `states` passa a duas colunas.
- Angular: a cor "antes" lia um campo simples antes de existir (preto); passa a sinal. `slMenuTriggerFor` apagava o `data-part` do botão de notação; o painel repõe-no depois do primeiro render (spec cobre ambos).
