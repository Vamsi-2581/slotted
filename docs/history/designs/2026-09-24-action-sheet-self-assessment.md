# `action-sheet` — autoavaliação

Data: 2026-09-24. Inventário e decisões em `2026-09-24-action-sheet-design.md`. Capturas em
`tools/harness/out/action-sheet.html` (harness) e nas seis combinações base mais os estados em
claro e escuro, lidas no gate visual.

## 1. As onze dimensões

Cada linha nomeia a mudança que mais melhoraria a dimensão e diz se foi feita.

| Dimensão | Estado | Mudança que mais melhora | Feita |
| --- | --- | --- | --- |
| Icons | O spinner partilhado ocupa a caixa do ícone; os ícones são do consumidor (Lucide nas páginas); nenhum carácter desenha uma marca | Ícone medido pelo rótulo (1,125 × `--slotted-font-size-lg`) em vez da escala de glifo do controlo, que descia para 14 px em `dense` | sim |
| Motion | Folha desliza `translate` com `--slotted-duration-long`/`--slotted-easing-enter` e sai com `medium`/`exit`; scrim com o par de `dialog` (`scrim-motion.test.mjs`); redução de movimento anula o deslize | Deslize a partir da altura real da folha, não de 100 %, para uma folha curta não atravessar o ecrã em 320 ms | não: `translate: 0 100%` já é relativo à folha, não ao ecrã |
| Responsiveness | Largura `min(100%, 32rem)`, centrada; 64 px de scrim sempre visíveis; linhas `max-content` | Linhas `max-content`: a 240 px, linhas `auto` de 44 px sobrepunham um rótulo de três linhas aos itens seguintes | sim |
| Refinement | Altura de controlo e rótulo de 14 px com ponteiro fino, 44 px e 16 px com ponteiro grosso (reparo do revisor: 44 px fixos liam-se grandes num navegador de secretária); `cancel` numa faixa `sunken`; anel de foco interior no item e exterior no `cancel` | Intervalo vertical do item de 6 para 8 px, que colava as duas linhas de itens vizinhos | sim |
| Tokens | 71 propriedades lidas, sete da família (`--slotted-action-sheet-*`); `tokens.test.mjs` passa | Superfície do `cancel` em `--slotted-control-surface`, exigida por `field-surface.test.mjs` a quem desenha a aresta de campo | sim |
| Patterns | Dialog (Modal) e Menu do APG, item a item no desenho §2, com duas partidas escritas (`Tab` não fecha; título anunciado duas vezes) | Foco inicial na ação menos destrutiva, a nota 1 do padrão Dialog | sim |
| Accessibility | `role="dialog"` + `aria-modal` só quando modal; `role="menu"` nomeado; itens desabilitados e em espera focáveis com `aria-disabled`; alvo de 44 px sob `pointer: coarse` pela altura de controlo que o tema sobe; cores forçadas pintam o foco com `Highlight` | Remover o atributo nativo `disabled` que o Angular deixava no host, e que tirava o item do anel das setas | sim |
| Native API | React: `ComponentPropsWithRef` por parte, `render`, handlers compostos. Angular: o `button`/`a` do consumidor, `input()`/`model()`/`output()`, `HostAttributeToken` para `aria-label` | `initialFocus` nos dois bindings: sem ele, cada cena parada da página roubava o foco | sim |
| Capability | Todas as linhas de table stakes são `adopt`/`adapt` ou `decline` com dono ou composição (`contract.json` `declined`) | Arrastar para fechar, pedido depois do gate como folha nativa: entrou como reabertura de `drawer` (rodada 23) | registada, não feita aqui |
| Ecosystem integration | React: provider de defaults, handle, `useId`, portal no efeito. Angular: `provideActionSheetDefaults`, `exportAs`, `SL_ACTION_SHEET`, zoneless | `(closed)` não emitido por uma folha destruída aberta (NG0953) | sim |
| Documentation | Duas páginas com 12 cenas, snippets formatados, API, eventos, composição e seis frases de acessibilidade; `referencePageErrors` passa nos dois | Ler as duas páginas renderizadas e passar `tools/harness/audit.mjs`: os Storybooks em curso não carregam a família sem reinício | não: pendente do reinício, pedido no gate |

## 2. Secção 18

1. **Propósito e antiuso.** Ações curtas ligadas a um gesto do leitor, num ecrã de toque.
   Não substitui `dialog` com formulário, `select` para uma escolha com estado, nem `menu`
   num dispositivo de ponteiro.
2. **Anatomia.** 17 partes (`contract.json`), todas no harness e nos testes dos dois bindings.
3. **Controlado e não controlado.** `open`/`defaultOpen`/`onOpenChange` em React;
   `model()` em Angular. O pedido leva `reason`, `result` e `cancel()`. Um só modelo: o
   resultado viaja no fecho, porque nada nele é controlado.
4. **Matriz de estados.** `open`; item `hover`, `focus-visible`, `active`, `disabled`,
   `loading`; `disabled` e `loading` retêm hover e press (`states.test.mjs`).
5. **Teclado, foco, ARIA, toque.** Testado: setas, `Home`, `End`, typeahead, `Escape`,
   entrada no `cancel`, retorno ao gatilho. O toque não move o foco antes do clique.
   Leitor de ecrã e ecrã tátil reais não foram verificados nesta máquina.
6. **Recipes.** Tonalidades de `menu`; sem `size`, porque a altura é a de um controlo, que a densidade e o ponteiro já movem.
7. **Responsivo, RTL, locale, movimento.** Capturas a 240, 420, `dense`, RTL e três
   esquemas; `cancelLabel` por instância e por provider; redução de movimento testada pela
   regra da folha.
8. **Espera, vazio, erro, desabilitado, extremo.** Espera por item; vazio recusado com
   composição; erro do consumidor com a folha aberta; conteúdo longo na cena `long`.
9. **SSR e desempenho.** Ids por `useId` e por fábrica injetada; portal criado no efeito;
   `mount="active"` não constrói a camada fechada.
10. **Exemplos.** 12 cenas por página, num domínio único (relatório e faturas).
11. **Testes partilhados.** Os mesmos comportamentos em `action-sheet.test.tsx` (19) e
    `action-sheet.spec.ts` (13).
12. **Estabilidade.** Família nova; a recomposição sobre `drawer` está escrita como
    reabertura em `docs/process/build-order.md`.
