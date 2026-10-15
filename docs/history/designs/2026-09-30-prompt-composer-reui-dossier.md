# Dossiê ReUI — `prompt-composer` e `textarea`

## 0. Cabeçalho

`prompt-composer` em modo `build`, `textarea` em modo `polish`; 2026-09-30; HEAD `7fd2a477`.

## 1. Seleção

Cobertura `direta` para a moldura com faixas (`InputGroup` + `InputGroupTextarea`), `análogo` para
o estado do pedido (nenhum exemplo livre troca enviar por parar). Termos: `prompt` 15, `chat` 9,
`composer` 3, `InputGroupTextarea` 7. Blocos Pro `app-shell-17`, `sheet-4`, `sheet-10` só no
catálogo (fonte 401).

| Item | Tipo | Rota | Parte ou interação Slotted que informa | Capturas |
| ---- | ---- | ---- | -------------------------------------- | -------- |
| `c-input-group-18` | exemplo livre | `/preview/base/example/c-input-group-18` | `footer`, `action`, `submit` | claro, `--states` nos botões |
| `c-input-group-26` | exemplo livre | `/preview/base/example/c-input-group-26` | `submit` rotulado, `action` Cancelar | claro, `--states` nos botões |
| `c-input-group-17`, `19`, `33`, `34` | exemplo livre (fonte) | `https://reui.io/r/<nome>.json` | `header`, contador, menus | fonte lida |

## 2. Anatomia

| `data-slot` ReUI | Parte Slotted | Estado |
| ---------------- | ------------- | ------ |
| `input-group` | `root` (`form`) | igual; o Slotted é um `form` |
| `input-group-control` (textarea) | `input` | igual |
| `input-group-addon` `block-start` | `header` | igual |
| `input-group-addon` `block-end` | `footer` | igual |
| `input-group-button` | `action`, `attach` | igual |
| `input-group-button variant=default` | `submit` | igual; o Slotted troca enviar/ocupado/parar por `status` |

## 3. Medidas

ReUI a 1280 px, Slotted a 420 px; nenhuma medida abaixo depende da largura.

| Parte | Propriedade | ReUI | Slotted | Alvo | Veredicto |
| ----- | ----------- | ---- | ------- | ---- | --------- |
| `root` | raio | 10 | 22 (`raised`), 8 (`outline`) | `botão / 2 + folga`; `--slotted-radius-lg` | superar: concêntrico com o envio redondo |
| `input` | enchimento bloco/linha | 8/10 | 7.25/13 | o de uma linha de `text-field` | superar: uma linha do compositor é uma linha de campo |
| faixa | enchimento bloco/linha | 6/10 | 8/8 (`raised`), 4/4 (`outline`) | `--slotted-space-4`; `--_inset` | adaptar |
| `input` | início do texto | 10 | alinhado à tinta do clipe | `folga + (botão − glifo) / 2` | superar: uma vertical para texto e ícones |
| botão de faixa | caixa | 24 × 24, raio 7 | 28 × 28 redondo (`raised`), 24 concêntrico (`outline`) | `--_button` | adaptar |
| `submit` | fundo | `oklch(0.205 0 0)` | `rgb(29,78,216)` | `--slotted-tone-accent-solid` | adaptar: acento do tema |
| `submit` rotulado | altura, enchimento | 32, 10 | 24, 8 | `--_inner-size`, `--slotted-space-4` | adaptar: a altura interior do controlo |

## 4. Coreografia de estados

| Parte | Estado | Delta ReUI | Delta Slotted | Alvo |
| ----- | ------ | ---------- | ------------- | ---- |
| `action`/`attach` | hover | fundo + tinta 0.556 → 0.145 | fundo → rgb(241,245,249) | fundo apenas (R2.3) |
| `action`/`attach` | active | hover + `translate 0 1px` | fundo → rgb(226,232,240) | fundo apenas (R2.3) |
| `submit` | hover | opacidade 0.8 | rgb(29,78,216) → rgb(42,91,220) | `--slotted-tone-accent-solid-hover` |
| `submit` | active | opacidade 0.8 + translate | → rgb(30,58,138), `scale 0.9` | `--slotted-tone-accent-solid-active` |
| `submit` | hover (seta) | — | `translate 0 −1px` na seta | movimento na direção do envio |
| `action`/`attach` | focus | anel 3 px a 50 % | 2 px, offset −2 | anel do tema, para dentro |
| `submit` | focus | anel 3 px a 50 % | 2 px, offset 2 | anel do tema, para fora |

## 5. Movimento

ReUI: `transition: all 0.15s`. Slotted: fundo em `--slotted-control-transition-duration`; a marca
do `submit` (seta, anel, quadrado) entra de `scale 0.8`/opacidade 0 com `--slotted-easing-enter` em
`--slotted-duration-short`.

## 6. Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| ---------- | -------------------- | ------------- | ---------------- | ------------------------------- | --------- | ------------------------- |
| Faixas acima e abaixo | 17–19, 26, 33 | `InputGroupAddon align` | partes `header`, `footer` | o envio é uma parte com estado, não um botão genérico | adotar | — |
| Enviar | 18, 19 | botão sem comportamento | `submit` + `onValueSubmit` cancelável, Enter/Mod+Enter com guarda IME | teclado e estado do pedido | adotar | — |
| Seletor de modelo | 18, 19 | `DropdownMenu` + `InputGroupButton` | `menu` + `action` | coincidem | adotar | `menu` |
| Contador | 17 | texto do consumidor | `showCount` para o `field` | a contagem é a do `maxLength` | adotar | `field` |

## 7. Superar

| Critério | ReUI | Slotted | Alvo | Fonte |
| -------- | ---- | ------- | ---- | ----- |
| Pixel grid | 140, 24, 32 | 64, 34, 28, 24 | inteiros | espécime claro 420 |
| Hover | ΔL 0.03 | fundo 255 → 241 | ≥ 0.02 | idem |
| Press | igual ao hover + translate | 241 → 226 | difere | idem |
| Focus | anel 3 px a 50 % | 2 px sólido | ≥ 2 px, 3:1 | idem |
| Transition | `all` | lista explícita | sem `all` | folha |
| Schemes | sem alto contraste | HC lido | mesmo componente | captura HC |
| Density e RTL | — | denso e rtl lidos; `unicode-bidi: plaintext` no valor | — | capturas |

## 8. Delta

| # | Ficheiro | Mudança |
| - | -------- | ------- |
| 1 | `glyphs.json`, `glyphs.ts`, `tokens/contract.json`, `token-foundation.md` | glifos `arrow-up`, `stop`, `paperclip` |
| 2 | `specs/components/prompt-composer/` (contrato) | família nova |
| 3 | `packages/styles/src/prompt-composer/` | folha, tokens, harness, testes |
| 4 | `textarea` | nenhum: o elemento isolado já mede o que o ReUI mede; o que o ReUI põe à volta dele é `prompt-composer` |
