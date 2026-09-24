# Halo de seleção: autoavaliação

Famílias: `checkbox`, `radio-group`. Decisão: `2026-09-24-selection-halo-design.md`. Gate visual aprovado em 2026-09-24.

## Onze dimensões

Cada linha nomeia a mudança que mais melhoraria a dimensão e diz se foi feita.

| Dimensão | Estado | Mudança de maior efeito | Feita |
| --- | --- | --- | --- |
| Icons | Glifos de marca inalterados. | Nenhuma: o escopo não toca o glifo. | — |
| Motion | `opacity` em `--slotted-control-transition-duration`; sem movimento espacial, portanto nada a reduzir sob `prefers-reduced-motion`. | Crescer a faixa a partir do controle. Descartada: um `clip-path` animado exige insets físicos e duplica as regras em RTL. | Não |
| Responsiveness | A 240 px, a faixa acompanha o rótulo quebrado até a última linha. Nenhum transbordo rolável: a faixa é pintura. | Limitar a faixa em rótulos de muitas linhas. | Não: a faixa cobre exatamente a área que alterna o controle. |
| Refinement | Canto concêntrico com o controle; folga de `gap/2` junto ao controle e de 1,5 × essa folga depois do texto. | Folga maior depois do texto em `dense` (2 px pareciam cortar a última letra). | Sim |
| Tokens | `--slotted-selection-halo-size` removido; a folga deriva de `--slotted-control-gap-*`. Tinta e opacidade inalteradas (CK7). | Remover o token de tamanho, que produzia o defeito. | Sim |
| Patterns | APG Checkbox e Radio Group: o DOM e o teclado são os mesmos. | Nenhuma. | — |
| Accessibility | O alvo `::before` de 24 px continua em todo tamanho e densidade. O `gap` continua a alternar o controle, porque o `::after` recebe o ponteiro. O rótulo em outra direção deixou de colar no controle. | Mover o `gap` para o `column-gap`, corrigindo o rótulo `dir="rtl"` numa linha LTR. | Sim |
| Native API | `input` nativo, `label for` e atributos inalterados. | Nenhuma. | — |
| Capability | O hover mostra a área clicável inteira. A célula de tabela recebe uma faixa de 24 px ao redor do controle. | Rótulo vazio (Angular) sem faixa assimétrica. | Sim (`:empty`) |
| Ecosystem integration | `table` e `data-grid` continuam a zerar `--slotted-selection-halo-opacity`. `switch` usa a mesma regra de `gap`. | Mover o `switch` para o `column-gap` sem perder o `gap` clicável. | Sim |
| Documentation | Rótulo e nota de acessibilidade reescritos nas quatro páginas de referência; `docs/token-foundation.md` atualizado. | Ler as páginas renderizadas a 1280 e 720 px. | Não: os Storybooks 6006 e 6007 não estavam no ar |

## Seção 18

- **Anatomia.** Inalterada: `root`, `control`, `indicator`, `label`, `description`, e `item` no `radio-group`. O halo e o alvo são pseudo-elementos do `label`.
- **Controlado e não controlado.** Inalterado. Nenhum valor mutável novo.
- **Matriz de estados.** O hover acende a faixa. `disabled` e `readonly` não a acendem, pelas regras já existentes. O foco desenha o anel R3, que em `md` × `comfortable` coincide com a borda da faixa.
- **Densidade e direção.** A folga segue o `gap` da densidade: 4 px em `comfortable`, 3 px em `compact` e 2 px em `dense`, no `md`. RTL e rótulo em outra direção capturados.
- **Casos extremos.** Rótulo de três linhas, token sem quebra, rótulo em árabe, rótulo vazio numa célula de 28 px (cena `cell`), grupo horizontal.

## Evidência

- Testes: `checkbox.styles.test.mjs`, `radio-group.styles.test.mjs`, `selection-gap.test.mjs`, `tokens.test.mjs`, `default-theme.test.mjs`, `verify-token-foundation.test.mjs`.
- Comparação pixel a pixel das capturas em repouso contra HEAD, em `light`, `rtl` e `dense`, a 420 px. Diferenças: o rótulo em árabe (corrigido) e o tile. A do tile vem de `align-content: start` na raiz, alteração que já estava na árvore de trabalho e não entra neste commit.
- Sonda de clique em Chrome headless sobre as páginas do harness de `checkbox`, `radio-group` e `switch`, em LTR e RTL: o ponto médio do `gap` de cada linha com rótulo atinge o controle ou o rótulo em 1.404 linhas de 1.404. Controle negativo: sem a extensão do controle do `switch`, a sonda falha.
