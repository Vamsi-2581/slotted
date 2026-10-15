# Dossiê ReUI — `color-picker`

## 0. Cabeçalho

Família `color-picker`, modo `build`, 2026-10-01, HEAD `406f4416`.

## 1. Seleção

Cobertura `análogo`. Termos em `reui-llms-full.txt`: `color picker` 1, `ColorPicker` 0, `swatch` 6,
`eyedropper` 0, `hue` 0. O único seletor de cor está no bloco Pro `data-grid-editing-1`, cujo
registo responde 401 e cuja rota de pré-visualização não expõe o seletor sem interação. Os
análogos com fonte legível são o campo nativo `c-input-28` e as amostras de cor dos blocos de
filtro, ambos sem estados próprios além dos de `input` e `button`.

| Item | Tipo | Rota | Parte ou interação Slotted que informa | Capturas |
| ---- | ---- | ---- | -------------------------------------- | -------- |
| `c-input-28` | exemplo livre (fonte) | `https://reui.io/r/c-input-28.json` | `colorField` (campo com cor) | fonte lida: `<Input type="color">` |
| `filter-sidebar-2`, `filter-sidebar-4` | bloco Pro (catálogo) | — | `preset` (amostra como escolha) | só descrição |

Sem espécime ReUI comparável, as secções 3–5 comparam com os irmãos Slotted que partilham as
partes: `text-field` (campo, gatilho interno), `slider` (polegar e pista), `popover` (superfície).

## 2. Anatomia

| Análogo | Parte Slotted | Estado |
| ------- | ------------- | ------ |
| `input type="color"` | `colorField` + `trigger` | só no Slotted: o texto do valor é editável e o gatilho abre o painel |
| amostra de filtro | `preset` | igual no papel; o Slotted é um `radiogroup` |
| — | `area`, `channel`, `swatch`/`previous`, `format`, `eyedropper`, `contrast`, `gamut` | só no Slotted |

## 3. Medidas (contra os irmãos)

| Parte | Propriedade | Irmão | Slotted | Alvo | Veredicto |
| ----- | ----------- | ----- | ------- | ---- | --------- |
| `channel` | altura | `slider` pista 4 | 12 | `--slotted-space-5` | adaptar: a pista mostra cor, não só posição |
| `*-thumb` | diâmetro | `slider` polegar 16 | 16 | `--slotted-space-6` | igual |
| `trigger` | caixa | `text-field` ação 24 | 20 (`inner − space-2`) | — | adaptar: uma amostra precisa de ar à volta para ler a cor contra o campo |
| painel | largura | `popover` `auto` | 256 | `space-12 × 4` | — |

## 4. Coreografia de estados

| Parte | Estado | Delta |
| ----- | ------ | ----- |
| `area-thumb`, `channel-thumb` | arrastar | `scale 1.15`, cursor `grabbing` |
| `preset` | hover / active | `scale 1.08` / `0.94` |
| `preset` | selecionado | anel de 2 px na cor do texto, a 2 px do chão do painel |
| `previous` | hover / foco | marca de repor entra por opacidade |
| `format`, `eyedropper` | hover / active | fundo um passo / dois passos (R2) |
| `trigger` | hover / active / aberto | anel exterior de 2 px no tom secundário |

## 5. Movimento

Polegares, predefinições e marca de repor em `--slotted-duration-short` com
`--slotted-easing-standard`; um polegar movido por teclado não anima (a posição é uma
propriedade de tempo de execução sem transição).

## 6. Capacidades

Ver `2026-10-01-color-picker-design.md` § 1; nenhum item ReUI acrescenta capacidade.

## 7. Superar

| Critério | Slotted |
| -------- | ------- |
| Hover | presente em todas as partes interativas |
| Press | difere do hover (escala ou fundo) |
| Focus | 2 px, anel do tema; para dentro em `format`/`eyedropper` |
| Schemes | alto contraste lido; `forced-colors` mantém as cores do leitor (`forced-color-adjust: none`) |
| RTL | área, matiz e alfa espelhados; a notação do valor fica `ltr` |

## 8. Delta

| # | Ficheiro | Mudança |
| - | -------- | ------- |
| 1 | `specs/contract.schema.mjs` | capacidade `format` |
| 2 | glifos | `pipette` |
| 3 | `specs/components/color-picker/` (contrato) | família nova |
| 4 | `packages/styles/src/color-picker/` | folha, tokens, harness, testes |
| 5 | `runtime-properties.mjs`, `tokens.test.mjs`, `text-scale.test.mjs` | propriedades de tempo de execução e exceções R7 |
