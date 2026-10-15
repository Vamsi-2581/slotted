# Table of contents — autoavaliação

Inventário em `2026-09-16-table-of-contents-capability-inventory.md`; desenho
em `2026-09-16-table-of-contents-design.md`. Capturas em
`/tmp/claude-1000/-home-dreco-dev-slotted/4f639b47-7eca-4da0-8587-8662e6ff23ce/scratchpad/shots/`
(harness: `table-of-contents-{light,dark,high-contrast}-comfortable-ltr-420`,
`light-comfortable-ltr-240`, `light-dense-ltr-420`, `light-comfortable-rtl-420`,
foco na ligação corrente e no gatilho, cena `horizontal` com fade; páginas de
referência React: `react-docs-{1..5}.png` a 1280 claro e `react-docs-dark.png`
a 720 escuro).

## 1. As onze dimensões

| Dimensão                  | Estado | A mudança que mais a melhorava                                                                                                                                                                                                              | Feita                                                                                                                                                       |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Ícones                 | passa  | Um único glifo, o chevron do gatilho, em máscara de `--slotted-icon-chevron-down`, `forced-color-adjust: none` (G15), meia volta sob `data-open`. Não há artwork direcional.                                                                | —                                                                                                                                                           |
| 2. Movimento              | passa  | O marcador viaja em `--slotted-duration-medium`; a tinta muda em `short`; a camada colapsada chega por `translate` de um passo e só esbate sob reduced motion (R7); a rolagem é `instant` sob `prefers-reduced-motion`. Faltava: o esbatimento da barra ao aparecer o `data-overflow`. | Não: o fade aparece com a medida e não é um estado que o olho siga.                                                                                      |
| 3. Responsividade         | passa  | A família não reflui pela própria largura (nenhum `@container`): a coluna embrulha, a barra rola, e `layout` é do consumidor porque a largura não distingue a coluna lateral da barra de telemóvel. A 240 px tudo se mantém (captura).       | —                                                                                                                                                           |
| 4. Refinamento            | passa  | O anel de foco por dentro da linha, a dois pixels, para nunca cruzar o trilho; o marcador puxado sobre o trilho pela largura do trilho. O detalhe de mais uma hora: a barra cortava o último rótulo sem dizer que rola.                       | Sim: `data-overflow` medido pelo binding e `mask-image` que esbate a margem por que a barra continua (`react-docs-4.png`, cena `the bar scrolls`).        |
| 5. Tokens                 | passa  | Sete tokens de componente com fallback para a fundação (`tokens.json`, 51 leituras); nenhuma duração literal (`motion.test.mjs`); geometria de linha pela escala de controlo por `size`. Nenhum token novo na fundação.                     | —                                                                                                                                                           |
| 6. Padrões                | passa  | Sem padrão APG; landmark, `link`, `aria-current="location"` (ARIA 1.2 §6.7) e o exemplo Disclosure Navigation Menu para o gatilho, tabela transcrita no desenho §4, cada tecla com destino de foco no contrato.                              | —                                                                                                                                                           |
| 7. Acessibilidade         | passa  | Nome pelo `label` ou pelas mensagens; um só `aria-current`; foco no alvo com `tabindex="-1"` emprestado; `aria-busy` sob `loading`; `aria-expanded`/`aria-controls` no gatilho; Escape devolve o foco. Não verificado nesta máquina: leitor de ecrã real. | —                                                                                                                                                           |
| 8. API nativa             | passa  | React: `render` em raiz, item, ligação, grupo; `ComponentPropsWithRef`; `onClick` do consumidor primeiro. Angular: diretiva no `nav` do consumidor, `model()` para `value` e `open`, `HostAttributeToken` para o nome escrito, `exportAs`.   | —                                                                                                                                                           |
| 9. Capacidade             | passa  | Inventário: 24 linhas de table stakes, 21 adotadas ou adaptadas, 3 recusadas com dono; diferenciadores: razão `scroll`, offset lido da página, três layouts numa anatomia, `numbered`. Falta que ficou: um `select` nativo como forma colapsada. | Não: duas fontes (PatternFly, Starlight) colapsam em disclosure; a camada por `dismissable-layer` é o que o escopo chama "popover". Registado no inventário. |
| 10. Integração            | passa  | Ambas as tabelas de `frameworks.md` respondidas no desenho §9–10; defaults por provider e por `provideTableOfContentsDefaults`; `Reactive Forms` não se aplica. Assimetria registada: React compõe partes, Angular recebe dados e um template por ligação. | —                                                                                                                                                           |
| 11. Documentação          | passa  | 17 cenas por 17 cenários, cada uma com título, legenda e código; página React lida a 1280 claro e 720 escuro, `audit.mjs` limpo a 1280 e 620. A página Angular não foi lida: o Storybook 6007 não estava a correr.                            | Corrigido ao ler: três snippets que transbordavam a gaveta de código foram encurtados; a tabela de API do workbench perdia a segunda linha de `value`. |

## 2. Contra `docs/component-features.md` §18

1. **Propósito.** Ligações para lugares do documento corrente, com a do lugar
   à vista marcada. Antiuso: trocar vistas (`tabs`), trocar páginas
   (`side-navigation`), ordenar um processo (`stepper`).
2. **Anatomia.** Doze partes, contrato `anatomy`; `data-ui="table-of-contents"`.
3. **Contrato de estado.** `current`: `value`/`defaultValue`/`onValueChange`,
   razões `scroll`, `pointer`, `keyboard`, `programmatic`; um pedido recusado
   por `scroll` mantém o valor, um pedido recusado por pressão rola na mesma.
   `open`: `open`/`defaultOpen`/`onOpenChange`, razões `pointer`, `keyboard`,
   `select`, `escape`, `outsidePress`, `programmatic`. Angular: `model()` para
   os dois e `*ChangeRequest` com `ChangeRequest`.
4. **Matriz de estados.** `default`, `hover` (não sobre `current`), `active`,
   `focus-visible` (anel interno), `current` (tinta, peso, marcador), `open`
   (só `collapsed`), `loading` (quatro linhas de `skeleton`), `data-empty`
   (raiz escondida). Precedência: `current` > `active` > `hover`
   (`table-of-contents.styles.test.mjs`).
5. **Teclado, foco, ARIA.** Contrato `keyboard` (onze teclas com destino de
   foco); testes em `table-of-contents.test.tsx` e `table-of-contents.spec.ts`
   (arrows, Home, End, ArrowDown no gatilho, Escape, pressão fora, foco no
   alvo). Toque: a ligação é uma linha inteira de altura de controlo, e o tema
   cresce os controlos a 44 px sob ponteiro grosso.
6. **Recipes.** `size` pela escala de controlo; `layout` três valores;
   `numbered`; `sticky`; tokens de componente para trilho, marcador, tintas e
   indentação.
7. **Responsivo, RTL, locale, reduced motion.** Capturas `240`, `rtl`, `dense`;
   `matchMedia` para a rolagem; mensagens substituíveis por provider e por
   instância.
8. **Loading, empty, error, extremo.** `loading` e `data-empty` no contrato;
   erro não se aplica (a família não carrega nada); rótulo longo embrulha,
   token sem espaços quebra dentro de si, barra rola com fade, cem ligações
   rolam dentro da coluna `sticky`.
9. **SSR, performance.** `useId` / `SlTableOfContentsIdFactory`; `source` rende
   vazio no servidor e preenche ao montar (registado); o spy recalcula por
   `IntersectionObserver` e por `scroll` coalescido a um frame; sem
   virtualização (uma lista de headings não a pede).
10. **Exemplos.** 17 cenas na Nexora: ficha de cliente, política de devoluções,
    contrato de fornecedor, telemóvel, página com cabeçalho.
11. **Testes partilhados.** Contrato (13), styles (9), core `outline` (10) e
    `scroll-spy` (12), React (20 + 4), Angular (17 + 4).
12. **Changelog.** Família nova; sem quebra. Custos registados no desenho §11.

## 3. Verificação

- `node --test specs/components/table-of-contents/*.test.mjs` — 13 pass.
- `node --test packages/styles/src/*.test.mjs` — 170 pass, incluindo os 9 da família.
- `pnpm --filter @slotted/core verify` — pass (22 testes novos).
- `pnpm --filter @slotted/react` — typecheck e build pass; `vitest` 24 pass na
  família; três falhas noutras famílias (`table`, `calendar`), de outra sessão.
- `ng test … --include='**/table-of-contents/**'` — 21 pass; `ng build`
  (typecheck) pass, entrada `@slotted/angular/table-of-contents` construída.
- `pnpm typecheck` (raiz) — pass. `pnpm lint` — três erros noutras famílias
  (`detail-panel`, `toggle-group`), de outra sessão. `pnpm format:check` — dois
  ficheiros de outra sessão. `pnpm test:contracts` — 1802 pass, 1 falha em
  `data-grid` (sem docs Angular), de outra sessão. `pnpm test:docs` — duas
  falhas noutras famílias.
- `tools/harness/audit.mjs` na página React — limpo a 1280 e a 620.

## 4. Decisões tomadas fora do que o escopo escrevia

- A corrente no início do rolador é o primeiro alvo (nenhuma fonte o faz):
  uma lista sem nada marcado com o documento no topo diz que o leitor não está
  em lado nenhum.
- Uma ligação pressionada fica fixada no spy até um gesto de rolagem: no
  gate, "Contactos" pressionado na cena `horizontal` aterrava o documento no
  fim e a regra do fim marcava "Suporte" no mesmo frame.
- `history` escreve por `pushState`/`replaceState` depois de rolar por si;
  `:target` e `hashchange` não respondem, o router reescreve o fragmento na
  próxima navegação. Registado no contrato e no desenho §11.
- O colapso é uma camada em fluxo sob o gatilho por `dismissable-layer`, sem
  `select` nativo e sem `portal`/`positioner`.
- A tabela de API do workbench passou a chavear linhas por parte e nome
  (`tools/storybook-workbench/src/api-table.tsx`), com teste.
