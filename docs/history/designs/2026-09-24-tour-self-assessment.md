# `tour` — autoavaliação

Data: 2026-09-24. Desenho em `docs/history/designs/2026-09-24-tour-design.md`. Contrato em
`specs/components/tour/contract.json`.

## Evidência

| Superfície            | Comando                                                                     | Resultado                      |
| --------------------- | --------------------------------------------------------------------------- | ------------------------------ |
| Contrato              | `node --test specs/components/tour/*.test.mjs`                              | 13/13                          |
| Core                  | `vitest run src/tour` (`packages/core`)                                     | 37/37                          |
| Core partilhado       | `vitest run src/focus src/portal src/dismissable-layer`                     | 141/141                        |
| React                 | `vitest run src/tour` (`packages/react`)                                    | 31/31                          |
| Angular               | `ng test --include='tour/src/*.spec.ts'`                                    | 20/20                          |
| Estilos               | `node --test packages/styles/src/*.test.mjs`                                | 243/243                        |
| Página React          | `tools/harness/audit.mjs` a 1280 e 620 px                                   | 18 palcos, sem achados         |
| Overlays React        | `vitest run` em dialog, drawer, popover, menu, select, combobox, tooltip, … | 449/449 depois das mudanças de core |

Capturas lidas: harness em claro, escuro e alto contraste a 420 px, 240 px, dense e RTL; foco
em `close`, `next` e no cartão; cenas `compact` e `crowded`. Storybook React conduzido por
script (`drive.mjs` no scratchpad): telemóvel emulado a 375 × 740 com toque, cantos a
1280 × 800, alvo que ocupa o ecrã, tour sobre um diálogo aberto por `prepare`.

## Rubrica

| Dimensão               | Estado | A mudança que mais a melhoraria, e se foi feita |
| ---------------------- | ------ | ----------------------------------------------- |
| Icons                  | passa  | O `close` é o glifo `--slotted-icon-x` por máscara, com `forced-color-adjust`. Feita: nenhuma a fazer além disso; a seta é geometria, não glifo. |
| Motion                 | passa  | O spotlight desliza entre alvos no passo longo e curva standard; o scrim usa o par de `dialog`; o cartão entra por keyframe. Por fazer: o cartão não desliza de um alvo ao seguinte, reaparece — um deslize do cartão competiria com o do spotlight. |
| Responsiveness         | passa  | Composição de telemóvel abaixo de 600 px, eixo `layout`, cartão centrado sobre alvo sem espaço, áreas seguras. Feita nesta sessão, pedida pelo revisor. |
| Refinement             | passa  | Rodapé que nunca separa Back de Next; anel de foco contínuo à volta da seta; progresso alinhado à primeira linha. O detalhe com mais uma hora: o spotlight ganhar um contorno de 1 px no esquema escuro, onde o recorte se distingue pouco do scrim. Não feito. |
| Tokens                 | passa  | 21 tokens de família com recurso a semânticos; margem e raio do spotlight são tokens, não números do script. Feita. |
| Patterns               | passa  | Sem padrão APG de tour; Dialog (Modal) transcrito e verificado, e o diálogo não modal de `popover` para passos interativos. Custo escrito em §4.3. |
| Accessibility          | passa  | Página `inert` sob passo modal, `aria-modal` só então, foco que segue o leitor, anúncio pela live region. Por verificar numa máquina real: leitor de ecrã (sem um aqui); verificado em vez disso a árvore de atributos e o foco nos testes. |
| Native API             | passa  | React: `ComponentPropsWithRef` por parte, `render`, `ref` de callback que cabe em qualquer elemento; Angular: diretivas nos elementos do consumidor, `HostAttributeToken` para `role` e `aria-label`. |
| Capability             | passa  | 25 capacidades do inventário adotadas ou adaptadas; três recusadas com composição escrita. Acrescentadas nesta sessão: telemóvel, bordas, camadas dinâmicas, origem do tema. |
| Ecosystem integration  | passa  | Tabelas de §5 respondidas. Assimetria registada: em Angular as partes desenham os dados da etapa e o conteúdo próprio entra como elementos do consumidor em `slTourCard`; em React cada parte aceita `children`. |
| Documentation          | parcial | Página React renderizada e auditada. Página Angular por ver: o Storybook Angular precisa de reinício para compilar uma família criada depois do arranque (§ Pendências). |

## Secção 18

1. **Propósito e antiuso.** Orientação por etapas numa interface existente. Não substitui uma
   interface compreensível nem guarda estado de "já visto" — é do produto, pelo `outcome`.
2. **Anatomia.** 18 partes; tabela nas duas páginas de referência.
3. **Controlado e não controlado.** `open` e `step` (id), cada um com pedido e razão; o fecho
   carrega `outcome`. Em Angular os dois são `model()` com `openChangeRequest` e
   `stepChangeRequest` canceláveis.
4. **Matriz de estados.** `open` na raiz; `loading` no `next`; hover, active, focus-visible
   nos botões; composição por `data-modal`, `data-spotlight`, `data-missing`, `data-compact`,
   `data-placement`, `data-side`.
5. **Teclado, foco, ARIA, toque.** Tab contido em passo modal, guardas em passo interativo,
   setas espelhadas em RTL, Escape da camada de topo; toque pela escala `pointer: coarse` do
   `button`.
6. **Recipes.** `size` sm/md/lg; densidade pelos botões e pelo `close`; tons herdados do tema.
7. **Responsivo, RTL, locale, reduced motion.** §4.6; RTL nas capturas; rótulos por provider,
   com progresso como função; durações colapsam em reduced motion.
8. **Loading, empty, error, extremo.** `prepare` e espera do alvo com `next` em loading; tour
   sem etapas disponíveis fecha com `unavailable`; `prepare` rejeitado é alvo ausente; alvo
   ausente, removido ou maior que o ecrã; título alemão de palavra única.
9. **SSR e desempenho.** Nada é medido no render; fechado não desenha; o acompanhamento do alvo
   junta relatórios num frame e para quando o retângulo assenta.
10. **Exemplos.** 16 cenários nas duas páginas, num único produto (espaço de relatórios).
11. **Testes nas duas ligações.** Os mesmos casos: identidade, navegação e razões, cancelamento,
    outcomes, setas, disponibilidade, alvo ausente, modal e interativo, telemóvel, alvo sem
    espaço, diálogo aberto a meio.
12. **Quebra de contrato.** Família nova; as mudanças em `packages/core` são aditivas (`raise()`)
    ou alargam um caso (`focus-scope`), sem quebra.

## Pendências

- **Storybook Angular** (6007): reiniciar para compilar `packages/angular/tour`; até lá a página
  mostra `SyntaxError` porque os decoradores chegam por compilar. Não reiniciado sem pedido: a
  outra sessão usa o mesmo servidor.
- **`back` da `dismissable-layer`**: o tour passa `back: modal`; a opção existe na árvore de
  trabalho de outra sessão e ainda não está commitada.
- **`dialog` aberto por código**: sem trigger, usa o documento como origem e perde o tema da
  região — visto na história `layers`. Achado sobre `dialog`, não corrigido aqui.
- **`Glyph`**: o `close` é desenhado com `Icon` + `Glyph` (regra de
  `packages/styles/src/glyph-element.test.mjs`); o elemento e o teste são trabalho por commitar
  de outra sessão, e o commit do `tour` entra depois do deles.
- **Seta**: limitada ao troço reto da borda do cartão; a mesma correção foi aplicada ao
  `popover` (cena `corner` nos dois harnesses).
