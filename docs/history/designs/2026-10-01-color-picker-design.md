# `color-picker` — desenho (2026-10-01)

Modo `build` (família nova, `[Specialized]`), fila das entradas, item 3
(`2026-09-30-text-field-rebuild-design.md` § 6). Cobertura ReUI: `análogo` —
`data-grid-editing-1` (seletor de cor num gestor de etiquetas, bloco Pro, só catálogo),
`c-input-28` (`input type="color"` nativo), amostras de cor em `filter-sidebar-2/4`.

## 1. Inventário

### 1.1 Surveyed

| Implementação | Nome | Fonte |
| ------------- | ---- | ----- |
| React Aria / Spectrum | `ColorPicker`, `ColorArea`, `ColorSlider`, `ColorWheel`, `ColorField`, `ColorSwatch`, `ColorSwatchPicker`, `ColorThumb`; `parseColor`, formatos `hex`, `rgb`, `hsl`, `hsb` | `https://react-spectrum.adobe.com/react-aria/ColorPicker.html` |
| Ark UI (Zag) | `ColorPicker` — `Area`, `ChannelSlider`, `ChannelInput`, `EyeDropperTrigger`, `SwatchGroup`, `FormatSelect`, `ValueSwatch`, `TransparencyGrid` | `https://ark-ui.com/docs/components/color-picker` |
| Ant Design 5 | `ColorPicker` — `presets`, `format` (`hex`/`rgb`/`hsb`), `allowClear`, `showText`, `disabledAlpha`, `onChangeComplete` | `https://ant.design/components/color-picker` |
| Mantine 7 | `ColorInput` (campo + amostra + conta-gotas), `ColorPicker` (`swatches`, `format`), `ColorSwatch` | `https://mantine.dev/core/color-input/` |
| HTML | `input type="color"`; `EyeDropper` API (Chromium) | `https://html.spec.whatwg.org/multipage/input.html#color-state-(type=color)`, `https://developer.mozilla.org/docs/Web/API/EyeDropper` |
| ReUI | análogos acima | catálogo `reui-llms-full.txt` |

### 1.2 Table stakes

| Capacidade | Quem entrega | Veredicto | Razão |
| ---------- | ------------ | --------- | ----- |
| Área de saturação/brilho com polegar | React Aria, Ark, Ant, Mantine | adopt | Parte `area` + `area-thumb`, teclado de duas dimensões. |
| Barra de matiz | todos | adopt | Parte `channel` com `data-channel="hue"`; papel `slider`. |
| Transparência (alfa) | todos | adopt | `channel` `alpha` sobre grelha de transparência; `alpha` desliga-a. |
| Campo de texto do valor | todos | adopt | Parte `input`; aceita qualquer formato suportado, confirma no Enter e no blur, repõe o último valor válido. |
| Formatos de saída | todos | adopt | `format`: `hex`, `rgb`, `hsl`, `oklch`; o valor é sempre uma string no formato atual. |
| Amostras predefinidas | Ant, Mantine, Ark, React Aria | adopt | `presets` + `preset` (rádios). |
| Conta-gotas | Ark, Mantine | adopt | Parte `eyedropper`, só onde `window.EyeDropper` existe. |
| Campo com amostra que abre o painel | Mantine `ColorInput`, React Aria, Ant | adopt | Membro `colorField`: o `text-field` com a amostra como gatilho em `start` e o painel num `popover`. |
| Roda de cor | React Aria | decline | A área e a barra de matiz cobrem o mesmo espaço com teclado de uma dimensão por controlo; a roda exige teclado circular sem ganho de capacidade. |
| Gradientes | Ant | decline | Um gradiente é uma lista de cores com posições: compõe-se com vários `colorField` e um `slider` de posição. |

### 1.3 Differentiators

| Capacidade | Razão |
| ---------- | ----- |
| Contraste ao vivo (`contrast`) | `contrastWith` recebe a cor de fundo; a parte mostra `Aa`, a razão WCAG e o nível AA/AAA. Nenhuma implementação pesquisada o faz; o guia exige "preview com contraste". |
| Antes e agora | A amostra mostra a cor com que o painel abriu ao lado da atual; premir a antiga repõe-na. |
| Gama declarada | Um valor `oklch` fora de sRGB não é convertido em silêncio: `data-out-of-gamut` e a parte `gamut` dizem-no; o valor só muda quando o leitor o edita. |
| Matiz pela interpolação do CSS | A barra é `linear-gradient(in hsl longer hue …)`: um gradiente, sem sete paragens escritas à mão. |

### 1.4 Gaps

| Caso | Resposta |
| ---- | -------- |
| Texto inválido no campo | Fica marcado `aria-invalid` enquanto se escreve; no blur volta ao último válido, sem pedido. |
| `EyeDropper` ausente (Firefox, Safari) | A parte não é desenhada. |
| Cor sem saturação: a matiz perde-se | O estado guarda a matiz em separado do valor; arrastar o brilho a zero não move a barra. |
| Leitor de ecrã | Cada polegar é um `slider` com `aria-valuetext` em palavras ("matiz 210 graus", "saturação 60 %, brilho 40 %"). |

## 2. Padrão

APG Slider (`https://www.w3.org/WAI/ARIA/apg/patterns/slider/`) para cada canal:
`ArrowLeft/Down` −1, `ArrowRight/Up` +1, `PageDown/PageUp` ±10, `Home`/`End`.
A área não tem padrão APG; segue React Aria `ColorArea`: um polegar focável,
`ArrowLeft/Right` movem a saturação, `ArrowUp/Down` o brilho, `Shift` ou
`PageUp/PageDown` em passos de 10. As predefinições são um `radiogroup` com foco
rotativo. O gatilho do `colorField` segue o padrão Dialog (Modal) do `popover`.

## 3. Decisões

1. **Dois membros sob `data-ui="color-picker"`:** `colorPicker` (o painel, em linha
   ou dentro de um `popover`) e `colorField` (`text-field` + gatilho + `popover`).
2. **Valor:** string no `format` atual; par controlado com razões `pointer`,
   `keyboard`, `select` (predefinição, antes e agora) e `programmatic`
   (conta-gotas). `format` tem o seu próprio par, razão `select`.
3. **Núcleo:** `@slotted/core/color` — `parseColor`, `formatColor`, HSV ↔ sRGB ↔
   OKLCH, `contrastRatio`, `inGamut`. Nenhum binding converte cores.
4. **Literais de cor:** o branco e o preto da área e o xadrez da transparência são
   o modelo de cor, não decisões do tema; ficam como literais com razão.
5. **Polegar:** 16 px, anel branco de 2 px com sombra, preenchido pela cor atual;
   cresce para 1.15 enquanto arrastado (exceção R7, sem texto).
