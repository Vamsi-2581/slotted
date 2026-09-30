# Dossiê ReUI — `field`

## 0. Cabeçalho

Família `field`, modo `build` (o delta edita `contract.json`), 2026-09-30,
HEAD `e929273f`. Espécimes em
`tools/harness/out/specimen/{c-field-2,c-field-5,c-field-7,settings-3,auth-6,comparison-1,form-2,field}/`.
Código-fonte dos exemplos livres em `tools/harness/out/specimen/reui-src/c-field-*.json`.

## 1. Seleção

Cobertura `direta`. `field` é o primitivo `Field` do shadcn/ui (`https://reui.io/r/field.json`
responde `Registry item not found … is part of shadcn/ui`); o ReUI publica onze
exemplos livres `c-field-1` … `c-field-11`, cuja fonte foi lida na totalidade.
Termos em `reui-llms-full.txt`: `c-field` 11, `Field` 104, `Label` 65,
`Tooltip` 72, `help` 10, `counter` 4, `Forgot` 4, `required` 2, `optional` 2.

| Item | Tipo | Rota | Parte ou interação Slotted que informa | Capturas |
| ---- | ---- | ---- | -------------------------------------- | -------- |
| `c-field-7` | exemplo livre | `/preview/base/example/c-field-7` | `label`, `mark`, `counter`, erro | claro, escuro, `--states` no contador |
| `c-field-2` | exemplo livre | `/preview/base/example/c-field-2` | `counter` na linha do rótulo | claro |
| `c-field-5` | exemplo livre | `/preview/base/example/c-field-5` | valor ao fim da linha do rótulo | claro |
| `settings-3` | bloco Pro | `/preview/base/settings-3` | `indicator` (`Required`, `Upgrade to Pro`) | claro, escuro, `--states` nos dois emblemas |
| `auth-6` | bloco Pro | `/preview/base/auth-6` | `action` (`Forgot password?`) | claro, escuro, `--motion reduce`, `--states` na ação |
| `comparison-1` | bloco Pro | `/preview/base/comparison-1` | `help` (ícone com dica) | claro, escuro, `--motion reduce`, `--states` no gatilho |
| `form-2` | bloco Pro | `/preview/base/form-2` | rótulo ao lado do controlo | claro |

## 2. Anatomia

| `data-slot` ReUI | Parte Slotted | Estado |
| ---------------- | ------------- | ------ |
| `field` | `root` | igual |
| `field-label` | `label` | igual |
| `<span class="text-destructive">*</span>` escrito pela página | `mark` desenhado pela família | igual; Slotted desenha-o e oculta-o do leitor |
| `div.flex.justify-between` escrito pela página à volta do rótulo | `header` | em falta no Slotted |
| `span.text-xs` escrito pela página (`24/160`) | `counter` | igual; Slotted conta sozinho |
| `button[data-slot=button]` variante `link` no cabeçalho | `action` | em falta no Slotted |
| `button[data-slot=tooltip-trigger]` com glifo `circle-help` | `help` | em falta no Slotted |
| `span[data-slot=badge]` ao lado do rótulo | `indicator` | em falta no Slotted |
| `field-description` | `FieldDescription` (`inline-message`) | igual |
| `field-error` | `FieldError` (`inline-message`) | igual |
| `field-set`, `field-legend` | família `field-group` | outra família |
| `field-content`, `field-title` (`orientation="horizontal"`) | rótulo das famílias `checkbox`, `switch` | outra família |
| `field-separator` | família `divider` | outra família |
| — | `requiredMark="text"`, palavras `(required)` e `(optional)` | só no Slotted |

## 3. Medidas

ReUI a 1280 px, Slotted a 720 px; nenhuma propriedade abaixo depende da largura.

| Parte | Propriedade | ReUI | Slotted hoje | Alvo | Veredicto |
| ----- | ----------- | ---- | ------------ | ---- | --------- |
| `label` | tamanho de letra | 14 | 13 | `--slotted-control-font-size-md` | recusar: escala de controlo da fundação |
| `label` | peso | 500 | 500 | `--slotted-font-weight-medium` | igual |
| `label` | altura de linha | 14 (`leading-none`) | 18.85 | `--slotted-line-height-sm` | superar: um rótulo de três linhas a 14/14 cola as linhas (`content`) |
| `label` → controlo | topo a topo | 22 (14 + 8) | 24.84 (18.84 + 6) | `--slotted-space-3` | recusar: o intervalo é o das três filas (`field.css` › `--_row-gap`) |
| `mark` | distância ao texto | 8 (`gap` do rótulo) | 4 | `--slotted-space-2` | recusar: a marca pertence à palavra |
| `mark` | tinta | `oklch(0.577 0.245 27.325)` | `rgb(185, 28, 28)` | `--slotted-tone-danger-text` | igual por papel |
| `counter` | tamanho, peso, linha | 12 / 400 / 16 | 12 / 400 / 17.4 | `--slotted-control-font-size-sm` | igual |
| `counter` | algarismos | proporcionais | `tabular-nums` | `tabular-nums` | superar: sem tremor ao contar |
| cabeçalho | altura da fila | 16 (`c-field-7`), 18 (`auth-6`) | 18.84 (só o rótulo) | a linha do rótulo | recusar: altura de linha acima |
| cabeçalho | intervalo | 12 (`auth-6`) | — | `--slotted-space-3` entre itens; a ação e o contador empurrados ao fim | adaptar |
| `action` | tamanho, peso, linha | 12 / 400 / 16 | — | `--slotted-control-font-size-sm`, 400, `--slotted-line-height-sm` | adotar |
| `action` | caixa | 103.45 × 18 | — | alvo de 24 em bloco, margem negativa devolve a linha | superar: 18 < `--slotted-target-min` |
| `action` | tinta em repouso | `oklch(0.556 0 0)` (atenuada) | — | `--slotted-tone-accent-text` | superar: tinta atenuada lê-se como texto inerte ao lado do contador |
| `help` | caixa | 16 × 16 | — | 24 × 24, margem negativa em bloco | superar: 16 < `--slotted-target-min` |
| `help` | glifo | 14 | — | `--slotted-control-icon-size-sm` com piso de 14 | igual |
| `help` | tinta | `oklab(0.556 0 0 / 0.7)` | — | `--slotted-text-muted` | adaptar: sem alfa, contraste medido pela fundação |
| `help` | raio | 9999 | — | `--slotted-control-radius` | recusar: um raio por família |
| `indicator` | altura do emblema | 18 | — | `badge` `size="sm"` | outra família (`badge`) |
| `indicator` | distância ao rótulo | 8 | — | `--slotted-space-3` | adaptar |

## 4. Coreografia de estados

| Parte | Estado | Delta ReUI | Delta Slotted hoje | Alvo |
| ----- | ------ | ---------- | ------------------ | ---- |
| `action` | hover | sublinhado `none → underline` | — | tinta `accent-text → mistura 65 % com text`, sublinhado a `currentColor` (vocabulário de `link`) |
| `action` | active | igual ao hover + `translate 0 1px` | — | mistura 35 % com `text`, difere do hover |
| `action` | focus-visible | borda + anel `3px` cinzento a 50 % | — | anel do tema, 2 px, `--slotted-focus-ring-offset` |
| `help` | hover | tinta `0.556/0.7 → 0.145` | — | fundo `transparent → --slotted-tone-secondary-subtle-hover`; tinta: recusar (R2.3) |
| `help` | active | igual ao hover | — | fundo `--slotted-tone-secondary-subtle-active`; difere do hover |
| `help` | focus-visible | anel `1px` do fundo + `3px` cinzento | — | anel do tema, 2 px |
| `help` | open | — | — | fundo do hover mantido enquanto a dica está aberta (`data-open`) |
| `counter` | hover, active | vazio | vazio | não interativo |
| `counter` | invalid | — | tinta `danger-text`, peso 500 | mantido |
| `indicator` | hover, active | vazio | — | não interativo |
| `label` | disabled | — | `--slotted-disabled-foreground` | mantido; `help` e `action` continuam ativos |

## 5. Movimento

ReUI: `transition: all 0.15s` na ação; cor em `0.15s` com
`cubic-bezier(0.4, 0, 0.2, 1)` no gatilho da dica; sem alteração com
`--motion reduce` (`auth-6-light-1280-motion-reduce-*.json`: 0.15 s).
Slotted: `action` anima `color` e `text-decoration-color`, `help` anima
`background-color`, ambos em `--slotted-control-transition-duration` com
`--slotted-control-transition-easing`; sob `--motion reduce` a duração colapsa
para 1 ms. A entrada e a saída da dica pertencem a `tooltip`.

## 6. Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| ---------- | -------------------- | ------------- | ---------------- | ------------------------------- | --------- | ------------------------- |
| Fila do rótulo com itens ao fim | `c-field-2`, `c-field-5`, `c-field-7`, `auth-6` | `div.flex.justify-between` escrito à mão | parte `header` | alinhamento pela linha de base, intervalo e disposição lateral dados pela família | adotar | — |
| Ação no cabeçalho | `auth-6` | `Button variant="link"` | parte `action` (`button`, ou `a` por `render`/diretiva) | alvo de 24 px sem crescer a fila | adotar | — |
| Dica com ícone | `comparison-1` | `Tooltip` + `TooltipTrigger` com `aria-label` | parte `help`: botão com glifo, `tooltip` composto, abre ao toque, texto também na descrição do controlo | abre num ecrã tátil; o leitor ouve a dica no próprio controlo | adotar | `tooltip` |
| Indicador ao lado do rótulo | `settings-3` | `Badge` solto na fila | parte `indicator` que recebe emblemas e entra em `aria-describedby` | o leitor ouve `Beta` no controlo | adotar | `badge` |
| Marca de obrigatório | `c-field-1`, `c-field-7`, `c-field-11` | `*` escrito pela página, lido como "asterisco" | `mark` desenhado, `aria-hidden` | uma decisão por aplicação, sem ruído no leitor | superar | — |
| Só `(optional)` nos opcionais | — | — | `necessity="optional"` | — | adotar (GOV.UK, Carbon) | — |
| Contador | `c-field-2`, `c-field-7` | texto da página, fora de `aria-describedby` | `counter` contado pelo controlo, em `aria-describedby` | relação por ID exigida por `component-features.md` §2.8 | superar | — |
| Valor ao fim da fila (`75%`) | `c-field-5` | `span` da página | o valor de `slider` ou texto do consumidor em `action`/cabeçalho | — | adiar para `slider` | `slider` |
| Emblema `Required` | `settings-3` | `Badge` com tom de perigo | `indicator` com `badge tone="danger"`, ou `necessity="words"` | — | adaptar (composição) | `badge` |

## 7. Superar

| Critério | ReUI | Slotted hoje | Alvo | Fonte |
| -------- | ---- | ------------ | ---- | ----- |
| Pixel grid | ação 18, gatilho 16 | sem partes emolduradas | caixas de 24 | espécimes `auth-6`, `comparison-1` |
| Hover | ação: só sublinhado; gatilho: ΔL tinta 0.41 | sem partes interativas | ação: tinta e sublinhado; `help`: fundo ≥ 0.02 | idem |
| Press | ação: `translate`; gatilho: igual ao hover (falha) | — | difere do hover nas duas partes | idem |
| Focus | anel 3 px a 50 % sobre cinzento (≈ 1.5:1) | — | 2 px, ≥ 3:1 nos três esquemas | idem |
| Transition | `all` na ação | `color` no rótulo e no contador | lista explícita | `field.css` |
| Motion | — | cor em token | cor e fundo em token; dica em `tooltip` | § 5 |
| Reduced motion | 0.15 s sem colapso | 1 ms | colapsa | `slotted-light-720-motion-reduce-*.json` |
| Disabled | — | `--slotted-disabled-foreground` | mantido | cena `states` |
| Schemes | sem alto contraste | HC e `forced-colors` lidos | mesmo componente | `slotted-high-contrast-720-*.json`, `slotted-light-720-forced-*.json` |
| Density e RTL | — | denso e rtl mantêm a anatomia | idem com cabeçalho | `slotted-light-720-dense-*.json`, `slotted-light-720-rtl-*.json` |
| Target size | 18 e 16 (falha) | — | 24; halo de 44 em ponteiro grosso | `inner-control.test.mjs` |
| Intent | classes Tailwind | cada valor em token ou com razão | idem | `field.css` |

## 8. Delta

| # | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| - | -------- | ------- | ---------------------------- | ------------------- |
| 1 | `specs/components/field/contract.json` (contrato) | partes `header`, `help`, `indicator`, `action`; eixo `requiredMark` → `necessity` com `optional`; `describedBy` com `indicator`, `help`, `counter`; estado `open`; modelo `open` | § 2, § 6 | — |
| 2 | `specs/components/field-group/contract.json` (contrato, `outra família` ligada) | fornece `necessity` em vez de `requiredMark` | § 6 | — |
| 3 | `field.harness.html` | cenas `header`, `necessity` com `optional`, `help`, `action` | § 4 | as cenas novas |
| 4 | `field.css` | cabeçalho, `help`, `action`, `indicator`, contador dentro do cabeçalho, disposição lateral | § 3, § 4, § 5 | `header`, `placement`, `dense`, `rtl` |
| 5 | `packages/styles/src/inner-control.test.mjs` | `field` › `help` na lista R2 | § 7 Target size | — |
