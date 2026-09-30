# Dossiê ReUI — `text-field`

## 0. Cabeçalho

Família `text-field`, modo `build` (o delta edita `contract.json`), 2026-09-30,
HEAD `29603ff7`. Espécimes em `tools/harness/out/specimen/{c-input-group-11,c-input-group-12,c-input-group-35,text-field}/`.

## 1. Seleção

Cobertura `direta`. Termos em `reui-llms-full.txt`: `input-group` 40,
`InputGroup` 54, `password` 18, `c-input` 77. O catálogo não traz descrições
das linhas `c-*`; a fonte de 57 dos 71 exemplos (`https://reui.io/r/<nome>.json`)
foi lida; 14 respondem `Forbidden`. Nenhum bloco Pro compõe `InputGroup` com
contexto de produto além dos exemplos livres.

| Item | Tipo | Rota | Parte ou interação Slotted que informa | Capturas |
| ---- | ---- | ---- | -------------------------------------- | -------- |
| `c-input-group-11` | exemplo livre | `/preview/base/example/c-input-group-11` | `copy`, inserção do botão no fim | claro, escuro, `--states` no botão |
| `c-input-group-12` | exemplo livre | `/preview/base/example/c-input-group-12` | `action` rotulada como gatilho de menu no início | claro, escuro, `--states` no gatilho e no controlo |
| `c-input-group-35` | exemplo livre | `/preview/base/example/c-input-group-35` | `reveal`, adorno de ícone no início | claro |

## 2. Anatomia

| `data-slot` ReUI | Parte Slotted | Estado |
| ---------------- | ------------- | ------ |
| `input-group` | `root` | igual |
| `input-group-control` | `input` | igual |
| `input-group-addon` (`inline-start`/`inline-end`) | `start`, `end` | igual |
| `input-group-addon` (`block-start`/`block-end`) | — | em falta no Slotted; adiado para `prompt-composer` |
| `input-group-button` | `action` | igual (novo nesta passagem) |
| `input-group-text` | texto dentro de `start`/`end` | igual |
| `spinner` num addon | `busy` | igual (novo) |
| — | `clear`, `reveal`, `copy` desenhados pela família | só no Slotted |
| — | `caps-lock` | só no Slotted |

## 3. Medidas

ReUI a 1280 px, Slotted a 420 e 720 px; nenhuma propriedade abaixo depende da largura.

| Parte | Propriedade | ReUI | Slotted hoje | Alvo | Veredicto |
| ----- | ----------- | ---- | ------------ | ---- | --------- |
| `root` | altura | 32 | 34 | `--slotted-control-height-md` | recusar: escala de controlo da fundação |
| `root` | raio | 10 | 4 | `--slotted-control-radius` | recusar: raio da fundação |
| `input` | tamanho de letra | 14 | 13 | `--slotted-control-font-size-md` | recusar: escala de controlo |
| botão interno | caixa | 24 × 24 | 24 × 24 | `--_action-size` | igual |
| botão interno | inserção no fim | 4 (bloco 4) | 9 (bloco 4) | `--_inset` = 4 | adotar: concêntrico |
| botão interno | raio | 7 (dentro de 10) | 4 | `--_action-radius` = max(2, 4 − 4) = 2 | adaptar: raio da moldura menos a inserção |
| gatilho rotulado | enchimento lateral | 6 | — | `--slotted-space-3` (6) | adotar |
| gatilho rotulado | intervalo ícone–texto | 4 | — | `--slotted-space-2` (4) | adotar |
| gatilho rotulado | peso | 500 | — | `--slotted-font-weight-medium` | adotar |
| gatilho rotulado | tinta em repouso | `oklch(0.556 0 0)` (atenuada) | — | `--slotted-text` | superar: palavras atenuadas liam como sufixo (captura `menu`) |
| chevron | tamanho | 14 | 16 | `--_icon-size` | recusar: um tamanho de glifo por moldura |

## 4. Coreografia de estados

| Parte | Estado | Delta ReUI | Delta Slotted hoje | Alvo |
| ----- | ------ | ---------- | ------------------ | ---- |
| botão interno | hover | fundo `transparent → oklch(0.97)`, tinta `0.556 → 0.145` | fundo `transparent → rgb(241,245,249)` | fundo apenas (R2.3, `inner-control.test.mjs`); tinta: recusar |
| botão interno | active | igual ao hover + `translate 0 1px` | fundo `→ rgb(226,232,240)` | fundo um passo abaixo; `translate`: recusar (R2.3) |
| botão interno | focus-visible | borda + anel `3px` a 50 % | `outline 2px`, `offset −2px` | anel do tema, para dentro |
| `action` aberta | hover | — | fundo `226 → 241` (regressão) | fundo de pressão mantido: hover exclui `[aria-expanded='true']` |
| `copy` completo | hover | — | tinta sucesso → texto | tinta de sucesso mantida: hover exclui `[data-complete]` |
| `action` | disabled | — | — | `--slotted-disabled-foreground`, sem hover |

## 5. Movimento

ReUI: `transition: all 0.15s` no botão; troca de ícone sem transição.
Slotted: fundo e tinta em `--slotted-control-transition-duration` (120 ms)
com `--slotted-control-transition-easing`; `busy`, `caps-lock`, `clear` e
`copy` entram de `scale 0.8`/`opacity 0` por `@starting-style` com
`--slotted-easing-enter` e saem com `--slotted-easing-exit` na mesma duração,
`display` com `allow-discrete`; a marca trocada em `copy` e `reveal` entra
igual. Com `--motion reduce` as durações medidas são 0.001 s e o `spinner` não
anima.

## 6. Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| ---------- | -------------------- | ------------- | ---------------- | ------------------------------- | --------- | ------------------------- |
| Botão na moldura | 10, 11, 14, 21 | `InputGroupButton` com `variant`/`size` | `action` sem variante; quadrada por `aria-label` | o atributo de acessibilidade decide a forma; sem tabela de variantes | adotar | — |
| Menu na moldura | 12, 28, 29, 32 | `DropdownMenuTrigger render={<InputGroupButton/>}` | `MenuTrigger render` → `TextFieldAction`; Angular `slMenuTriggerFor` no `button[slTextFieldAction]` | coincidem | adotar | `menu` |
| Copiar | 11 | `onClick` + `toast` do consumidor | `copyable`, marca `check`, anúncio, `onValueCopy` | retorno e anúncio sem código do consumidor | adotar | — |
| Carregamento | 15 | `<Spinner/>` num addon, campo `disabled` | `loading`, `aria-busy`, valor editável | não tira o teclado durante uma verificação | adotar | — |
| Atalho | 13, 23 | `<Kbd>` num addon | `kbd` em `end` | coincidem | adotar | `kbd` |
| Faixas acima/abaixo | 16–19, 26, 33 | `align="block-start|block-end"` | — | — | adiar para `prompt-composer` | `prompt-composer` |
| Avatar no início | 32 | `Avatar` num addon | `avatar` em `start` | coincidem | adotar (composição) | `avatar` |

## 7. Superar

| Critério | ReUI | Slotted hoje | Alvo | Fonte |
| -------- | ---- | ------------ | ---- | ----- |
| Pixel grid | 32, 24 | 34, 24 | inteiros | espécime claro |
| Hover | ΔL fundo 0.03 | fundo 241 sobre 255 | ≥ 0.02 | idem |
| Press | igual ao hover + translate | fundo 226 ≠ 241 | difere do hover | idem |
| Focus | anel 3 px a 50 % | 2 px sólido, offset −2 | ≥ 2 px, 3:1 | idem |
| Transition | `all` | lista explícita | sem `all` | `text-field.css` |
| Motion | sem entrada/saída | entrada e saída em tokens | — | § 5 |
| Reduced motion | — | 0.001 s | colapsa | `slotted-light-420-motion-reduce.json` |
| Disabled | `opacity 0.5` | `--slotted-disabled-foreground` | sem opacidade | cena `menu` |
| Schemes | sem alto contraste | HC e `forced-colors` lidos | mesmo componente | `slotted-light-420-forced.json` |
| Density e RTL | — | denso e rtl mantêm a anatomia; `+55` legível em rtl | — | capturas `dense`, `rtl` |
| Target size | 24 | 24, halo 44 em ponteiro grosso | § Target size | `touch-target.test.mjs` |
| Intent | — | cada valor em token ou com razão | — | `text-field.css` |

## 8. Delta

| # | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| - | -------- | ------- | ---------------------------- | ------------------- |
| 1 | `packages/theme-default/src/glyphs.json`, `packages/core/src/glyph/glyphs.ts` | glifo `caps-lock` | § 2 `caps-lock` | cena `password` |
| 2 | `specs/components/text-field/contract.json` (contrato) | partes `action`, `busy`, `caps-lock`, `copy`; estados `loading`, `complete`, `active` | § 2, § 6 | — |
| 3 | `text-field.harness.html` | cenas `menu`, `copy`, `password`, `loading`, `group`, `narrow` | § 4 | as seis cenas |
| 4 | `text-field.css` | inserção concêntrica, raio interno, botões unificados, `action`, partes transitórias | § 3, § 4, § 5 | `menu`, `copy`, `loading` |
| 5 | `packages/styles/src/text-scale.test.mjs`, `touch-target.test.mjs` | exceção R7 para caixas de glifo; seletor com `copy` | § 5 | — |
