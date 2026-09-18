# Autoavaliação — `timeline`

Contra `.claude/skills/component/references/rubric.md` (onze dimensões) e
`docs/component-features.md` §18. Inventário em
`2026-09-14-timeline-capability-inventory.md`, desenho em
`2026-09-14-timeline-design.md`.

Capturas lidas em
`/tmp/claude-1000/-home-dreco-dev-slotted/88b5866d-ef31-46d3-93ee-c2bfaeb852a0/scratchpad/shots/`
(harness) e `…/scratchpad/page-react-*.png` (página de referência React, 1280 e
720, light e dark).

---

## As onze dimensões

| #   | Dimensão               | Estado | A mudança que mais a melhoraria                                                                                                                                                                        | Feita                                                                                  |
| --- | ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| 1   | Ícones                 | passa  | O check do evento concluído e o chevron do grupo são máscaras de `--slotted-icon-check` e `--slotted-icon-chevron-down`; o anel é o de `spinner`. A melhoria: um glyph próprio para `fresh` (seta para cima) em vez de só texto. | não — o texto com a contagem é o que GitHub e X desenham, e um glyph a mais na escala precisa de justificação no gate |
| 2   | Movimento              | passa  | A linha muda de cor em `--slotted-control-transition-duration`, o chevron roda em `--slotted-duration-medium`, o anel roda no `loop` do tema e para sob reduced motion. A melhoria: o grupo abrir com altura animada em vez de `hidden`. | não, por decisão: vinte eventos a deslizar é uma página a saltar (desenho §7)         |
| 3   | Responsividade         | passa  | Contentor na raiz, dois pontos de quebra literais (20rem e 30rem). A melhoria: em `horizontal` refluído, devolver a hora à linha do título em vez da coluna flex.                                        | não — registado em problemas conhecidos; custo baixo, valor baixo                      |
| 4   | Refinamento            | passa  | O ponto e o check são pintados no centro geométrico (gradiente e máscara em `inset: 0`), verificado a 100, 110 e 125 %. A distância entre eventos é margem do item, para o anel de foco envolver o evento. A melhoria: a hora do lado `opposite` alinhar pela linha de base do título quando o tipo difere. | feita em parte: `align-self: baseline` nas duas células; um `opposite` com tipo maior desloca o corpo um pixel |
| 5   | Tokens                 | passa  | 96 propriedades lidas, todas em `timeline.tokens.json`; cinco literais registados no contrato (`reflow-breakpoint`, `dot-ratio`, `glyph-ratio`, `marker-ratio`, `opposite-size`). A melhoria: `--slotted-timeline-line-gap` documentado no contrato como literal. | feita: é `--slotted-space-2`, não literal                                             |
| 6   | Padrões                | passa  | Feed do APG transcrito tecla a tecla e propriedade a propriedade (desenho §4); Disclosure para o grupo. A melhoria: `aria-setsize` contar os eventos de um grupo fechado.                               | feita: a contagem é do DOM, fechado ou não; `PageDown` salta os fechados               |
| 7   | Acessibilidade         | passa  | Nome do artigo por `aria-labelledby` (título, atual, ator, hora), descrição, posição, `aria-busy`, `aria-current` mais ", current" lido. A melhoria: aviso em desenvolvimento para um artigo sem nome.  | feita no React (`console.warn` em `import.meta.env.DEV`); no Angular não             |
| 8   | API nativa             | passa  | React: `ComponentPropsWithRef` em todas as partes, `render` na raiz, grupo e item, `ref` em tudo. Angular: `input()`, `model()`, `output()`, `host`, `HostAttributeToken` para `aria-label` e `tabindex`, `exportAs` em cinco partes. A melhoria: `render` em `Content` e `Title` no React. | não — são partes internas do item; o título substitui-se pelo que se lhe passa      |
| 9   | Capacidade             | passa  | 31 linhas de requisitos de base, 26 adotadas ou adaptadas, 5 recusadas com composição ou família nomeada. `plain` acrescentado no gate. A melhoria: `growing="scroll"` com um limiar de distância (`rootMargin`). | não — o observador dispara ao entrar no rolador; um limiar é um número por instância |
| 10  | Integração             | passa  | Ambas as tabelas de `frameworks.md` respondidas (desenho §8 e §9). Assimetria registada: `provideTimelineDefaults()` por DI no Angular, provider no React; sem forms em nenhum, porque não há valor. A melhoria: `focusItem` no React por `ref` da raiz em vez de só por contexto. | não — `useTimeline()` é o caminho que `stepper` já usa para o mesmo tipo de ação     |
| 11  | Documentação           | passa  | Duas páginas com import, anatomia (21 partes), 15 demonstrações com legenda e código, inputs, outputs, composição, sete frases de acessibilidade, tokens e código. Auditadas a 1280 e 620 sem achados (React). A melhoria: a tabela de anatomia não cortar à direita. | não é desta família: a mesma tabela corta em `stepper`; é do workbench, cujo CSS outra faixa está a editar |

---

## §18, ponto a ponto

1. **Propósito, usos e antiusos** — desenho §1: eventos ordenados sobre uma
   linha; não é `stepper`, `list`, `collapsible`, `calendar` nem Gantt.
2. **Anatomia** — 21 partes no contrato, uma linha cada na anatomia das duas
   páginas.
3. **Contrato controlado/não controlado** — `open` por grupo:
   `open`/`defaultOpen`/`onOpenChange` no React, `[(open)]` e `(openRequest)`
   no Angular, sobre `@slotted/core/state`. `onLoadMore` e `onReveal` são
   pedidos sem valor, com razão. Razão: a família não tem eventos para segurar.
4. **Matriz de estados** — `loading` > `current` > `complete` > `hover` >
   `focus-visible`. `loading` no item não pinta `current`. Só `group-trigger`,
   `fresh` e `more` (botão) respondem a hover e press, atrás de `:enabled`.
5. **Teclado, foco, ARIA** — desenho §4; testes React (feed: PageDown,
   PageUp, Control+End, Control+Home, a partir de um controlo, handler do
   consumidor primeiro) e Angular (os mesmos, exceto Control+End/Home).
6. **Recipes** — `variant` (4), `tone` (5), `size` (3), densidade pelo
   `control-gap`.
7. **Responsivo, RTL, locale, reduced motion** — capturas `240`, `rtl`,
   `dense`; `Intl` por `locale`/`timeZone`; anel para sob reduced motion.
8. **Loading, empty, error, extremo** — item `loading` e raiz `loading`;
   `empty`; erro de carregar mais é do consumidor (inventário §4); cena
   `content` com nove palavras, token sem quebra, árabe, avatar, sem título.
9. **SSR e desempenho** — `useId`; `IntersectionObserver` só em efeito;
   `relative` sem `now` diverge em SSR e o remédio está nos defaults;
   virtualização diferida para `growing`.
10. **Exemplos** — 15 cenas por página, um domínio (a fatura INV-4821).
11. **Testes partilhados** — 37 React, 21 Angular, 21 core, 17 contrato,
    11 folha, 4 + 4 páginas.
12. **Estabilidade** — família nova; nenhuma quebra de contrato.

---

## O que a máquina não pôde verificar

- O Storybook Angular em 6007 lista a família mas não a renderiza: lê os
  pontos de entrada no arranque, e `@slotted/angular/timeline` nasceu depois.
  Precisa de reinício, pedido no gate. As páginas Angular foram verificadas
  por `referencePageErrors`, `snippetFormatErrors` e os 21 testes de
  comportamento, não pela imagem.
- Leitor de ecrã real sobre `role="feed"`; o que se verificou em seu lugar são
  os atributos do padrão, um a um, nos testes.

## Fora desta família, visto durante o trabalho

- A tabela de anatomia da página de referência corta a coluna _purpose_ à
  direita em todas as famílias (verificado em `stepper`). É do workbench, cujo
  `workbench.css` está em edição por outra faixa.
- `pnpm lint`: dois erros em `toggle-group` (outra faixa). `pnpm test:docs`:
  ids de trechos em `segmented-control`, `splitter`, `toggle-group`,
  `action-bar` (outras faixas). `packages/styles`: `app-shell` em
  `masked-glyph`, `page-header` em `tokens` (outras faixas).
