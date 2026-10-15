# Aspect ratio e Image — autoavaliação

Inventário: `2026-09-16-aspect-ratio-image-capability-inventory.md`. Desenho:
`2026-09-16-aspect-ratio-image-design.md`. Capturas lidas:
`/tmp/claude-1000/-home-dreco-dev-slotted/9c3e61be-bef8-41c5-a1ab-584a2471d80f/scratchpad/shots/`
(harness: as duas famílias em light/dark/high-contrast a 420, light a 240,
dense, rtl; cenas isoladas; foco no `<a>` e no `<button>`; hover forçado no
`<a>`; páginas React de referência a 1280 claro e 720 escuro).

## As onze dimensões

| Dimensão      | Estado | A mudança que mais melhoraria                                                                                                                                                  | Feita                                                                                                                                                       |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Icons         | passa  | Um glifo próprio para "imagem que não chegou" em vez de `file-image`                                                                                                           | Sim: `--slotted-icon-image-off` (Lucide `image-off`), máscara sobre `:empty::before`, `forced-color-adjust: none`                                          |
| Motion        | passa  | A picture cruzar sobre o chão em vez de trocar num frame                                                                                                                       | Sim: `opacity` 0 → 1 em `--slotted-duration-short`; o placeholder sai no mesmo relógio; nada faz loop                                                       |
| Responsiveness | passa | A moldura crescer quando o conteúdo não cabe, em vez de cortar ou transbordar                                                                                                  | Sim: `aspect-ratio` nativo com o mínimo automático de css-sizing-4; capturas a 240 sem transbordo (`image-light-comfortable-ltr-240.png`)                    |
| Refinement    | passa  | A aresta visível sobre a picture e não debaixo dela                                                                                                                            | Sim: `::after` na célula única, pintado por último; o `> *` da raiz de `image` colocou a moldura na mesma célula (media: `::after` a 0,016 px antes)         |
| Tokens        | passa  | O chão do placeholder ter aresta em `high-contrast`                                                                                                                            | Sim: `--_ground-edge` com `border-subtle`, que é preto nesse esquema. Literais restantes: `1.25rem` de blur e `1.08` de escala, com razão no comentário      |
| Patterns      | passa  | Nenhum padrão APG; a árvore de decisão do `alt` transcrita e verificada linha a linha (desenho §1)                                                                              | Sim; `alt` obrigatório no tipo React; no Angular escrito no `<img>` próprio e deixado ao projetado (assimetria registada abaixo)                            |
| Accessibility | passa  | O `<img>` nunca sair do DOM, para o nome sobreviver ao erro                                                                                                                    | Sim: em `error` fica 0×0 com `opacity: 0`; leitor de tela não verificado nesta máquina — ver "Fora do alcance"                                              |
| Native API    | passa  | Os atributos nativos chegarem ao `<img>` e `class`/`style` à raiz, como `text-field` faz                                                                                       | Sim em React (`ComponentPropsWithRef<'img'>`); em Angular o host é a raiz e o `<img>` projetado é do consumidor                                             |
| Capability    | passa  | `framed` como terceiro layout, descoberto na captura `in-context`                                                                                                              | Sim; cada linha de table stakes tem veredito no inventário; `sources`, `fallbackSrc`, `priority`, `blur` entregues                                          |
| Ecosystem     | passa  | `NgOptimizedImage` no `<img>` do consumidor e `next/image` por `renderImage`                                                                                                    | Sim: `img[slImageMedia]` com `IMAGE_MEDIA_HOST`; `provideImageDefaults`/`ImageDefaultsProvider`                                                            |
| Documentation | passa  | Fotografias reais nas páginas, com legendas que dizem o que a fotografia mostra                                                                                                | Sim: Lorem Picsum por id fixo; `audit.mjs` limpo a 1280 e 620 nas duas páginas React; Angular 6007 em baixo — páginas Angular não lidas renderizadas       |

## Secção 18

1. **Propósito.** `aspect-ratio`: reservar proporção antes da mídia. `image`:
   a picture, o que a antecede e o que a substitui. Antiuso: zoom (`dialog`),
   legenda (`figure`), sombra (`card`), avatar (`avatar`).
2. **Anatomia.** `aspect-ratio`: `root`. `image`: `root`, `picture`, `image`,
   `placeholder`, `fallback` (desenho §2).
3. **Contrato.** Nenhum estado mutável; `status` é facto derivado, `status`
   passado vence, `onStatusChange`/`(statusChange)` reporta. Sem `stateModel`
   (contrato e teste dizem porquê).
4. **Matriz de estados.** `image`: `default`, `hover`, `focus-visible` na raiz
   interativa; `status` × `layout` × `placeholder` exercidos no harness
   (`sizing`, `loading`, `error`). `aspect-ratio`: `default`.
5. **Teclado/foco/ARIA.** Nenhum teclado próprio; foco só quando a raiz é
   `<a>`/`<button>` (anel fotografado). `alt` no `<img>`; placeholder
   `aria-hidden`; fallback anunciável.
6. **Recipes.** `fit`, `position`, `radius`, `bordered`, `placeholder`,
   `layout`; sem `size`/`density`: uma picture não muda com a densidade
   (captura `dense` igual a `comfortable`, por desenho).
7. **Responsivo/RTL/reduced motion.** Moldura cresce; `start`/`end` espelham
   (captura `position` rtl); duração colapsa no tema.
8. **Loading/empty/error/extremos.** `idle` (nada pedido), `loading` (chão,
   blur, nada, conteúdo projetado), `error` (glifo, mínimo 4 rem sem reserva,
   conteúdo projetado, `fallbackSrc`). Extremo: `alt` longo não é desenhado;
   conteúdo do fallback maior do que a moldura é cortado pela raiz
   (`overflow: clip`), registado como custo.
9. **SSR.** `status` inicial só dos props; nenhum layout read; sem IDs.
10. **Exemplos.** 7 + 13 cenas nas quatro páginas, com domínio único
    (levantamento de campo).
11. **Testes.** React 42 (`vitest run src/image src/aspect-ratio`), Angular
    32 (`ng test --include`), folhas 22, contratos 21.
12. **Migração.** Famílias novas; `avatar`, `upload` e `card` leem `image`
    quando forem reabertos (`docs/process/build-order.md`).

## Assimetrias registadas

- `alt` é obrigatório no tipo React e opcional no input Angular: no Angular o
  `<img>` pode ser projetado com o seu próprio `alt`, e um input obrigatório
  no host seria redundante nesse caso.
- `fallbackSrc` só re-aponta o `<img>` próprio; um `<img slImageMedia>`
  projetado (com `ngSrc`) é do consumidor e recebe `error` na primeira falha.

## Fora do alcance desta máquina

- Leitor de tela: a picture em `error` é 0×0 com `opacity: 0`; a árvore de
  acessibilidade do Chrome deve manter o `img` com `alt`. Verificar com NVDA
  ou VoiceOver.
- Storybook Angular (6007) em baixo: as duas páginas Angular passam
  `referencePageErrors` e compilam no `ng test`, mas não foram lidas
  renderizadas nem auditadas.
- `pnpm check` para em `format:check` por três ficheiros de outras sessões
  (`demos/nexora/domain.md`, `otp-input.tsx`, `stat-card.harness.html`);
  `pnpm lint` falha em `otp-input` e `toggle-group`; `packages/styles` tem cinco
  falhas em `alert`, `breadcrumb`, `tabs`, `tag`, `text-field`; `packages/tokens`
  falha em `--slotted-control-font-family`; `specs/reference-pages` falha em
  `hover-card` — todas presentes sem as alterações desta sessão.
