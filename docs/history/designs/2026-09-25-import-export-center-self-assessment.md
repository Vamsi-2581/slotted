# `import-export-center` — autoavaliação

Data: 2026-09-25. Inventário e decisões em `2026-09-25-import-export-center-design.md`. Harness
em `tools/harness/out/import-export-center.html`, com oito cenas. Capturas lidas: claro, escuro e
alto contraste a 420; claro a 240 e a 720; densa a 420 e a 720; RTL. Foco lido em `remove` e em
`job-title`. As marcas de estado foram medidas em Chrome.

## 1. As onze dimensões

Cada linha nomeia a mudança que mais melhoraria a dimensão e diz se foi feita.

| Dimensão | Estado | Mudança que mais melhora | Feita |
| --- | --- | --- | --- |
| Icons | Todas as marcas são o elemento `Icon` com `Glyph`, desenhadas pelo binding: mosaico do tipo, marca de estado, chevron do toggle e cruz de remover. Nenhuma marca é carácter; o ponto separador é uma forma desenhada | O `running` usa o anel de `spinner`, no lugar do `loader-circle` a rodar, pedido no gate visual | sim |
| Motion | O chevron roda com a transição do controlo; o anel de `spinner` para sozinho sob movimento reduzido; a família não tem animação própria (`import-export-center.styles.test.mjs`) | Transição de altura na abertura dos detalhes | não: a região entra e sai do DOM (`hidden` não é usado), e uma altura animada exigiria manter os detalhes montados, o que custa uma tabela por job fechado |
| Responsiveness | Contentor `import-export-center` na raiz; abaixo de 42rem, mosaico e coluna de palavras; a partir de 42rem, subgrid com colunas alinhadas em toda a lista; abaixo de 22rem, os detalhes ocupam a coluna do mosaico | Colunas alinhadas entre jobs. A primeira versão desenhava uma grelha por job e o estado começava em x diferente em cada linha | sim |
| Refinement | Marca centrada na banda cap/x-height (erro de 0,35 px a 13 px); pontos a 0,01 px do meio da x-height; intervalo marca-palavra de 6 px; mosaico centrado no par nome e meta; nenhuma marca fica sozinha numa linha | Marca 4 px acima das palavras, apontada pelo revisor; corrigida e fixada por teste que falha com a fórmula antiga | sim |
| Tokens | 82 propriedades lidas (`tokens.json`), seis da família (`--slotted-import-export-center-*`) com recurso à fundação; `tokens.test.mjs` passa | Ler a escala File kind de `upload` em vez de restatá-la, para o mesmo CSV ter a mesma cor nos dois lugares | sim, com o custo escrito no desenho §7 |
| Patterns | Sem padrão APG para um centro de jobs; Disclosure no toggle (Enter, Space, `aria-expanded`, `aria-controls`), Button nos controlos, `progressbar` de `progress-indicator`, WCAG 4.1.3 nas transições | Rótulo fixo "Detalhes" em vez de "Ocultar detalhes": o padrão diz o estado por `aria-expanded` | sim |
| Accessibility | Controlos com `aria-labelledby` (palavra + título do job) e `aria-describedby` (linha de estado); anúncio único e cortês por transição; foco nunca cai no `body` (`focusDestination`) | Retenção de foco quando o estado retira o controlo focado, testada nos dois bindings | sim. Leitor de ecrã real não verificado nesta máquina |
| Native API | React: `ComponentPropsWithRef<'section'>`, `render`, `ref` com handle. Angular: `input()`/`model()`/`output()`, `HostAttributeToken`, `exportAs` | `href` de `a[slButtonLink]` pelo input `[href]`: `[attr.href]` era apagado pelo host da família `button`, e a descarga ficava sem foco | sim |
| Capability | 29 linhas de table stakes: `adopt` ou `adapt`, ou recusa com a composição (URL de importação, diálogo de formato, mapeamento, transporte, pausa) e seleção em massa diferida para `selection-toolbar` | Aviso por toast que aponta para o job (`useJobToasts`, `jobToasts`) com o id do job | sim |
| Ecosystem integration | React: provider de defaults, handle `reveal`, hook de toasts. Angular: `provideImportExportCenterDefaults`, dois `model()`, `jobToasts` num contexto de injeção, slots projetados, template por job | `model()` escrito depois de um pedido aceite também sem ligação do host: `[(expanded)]` não propagava | sim |
| Documentation | Duas páginas com 16 cenas, anatomia das 45 partes, API, eventos, composição e cinco parágrafos de acessibilidade; `referencePageErrors` e `snippetFormatErrors` passam nos dois bindings | Ler as duas páginas renderizadas e passar `tools/harness/audit.mjs` | não: as Storybooks em curso não carregam a família sem reinício, e o reinício interrompe a outra sessão |

## 2. Secção 18

1. **Propósito e antiuso.** Uso: o histórico e o estado dos jobs de importação e de exportação
   que correm no servidor. Não serve de importador com mapeamento de colunas, nem de transferência
   de bytes (`upload`), nem de feed de notificações genéricas (`notification-center`).
2. **Anatomia.** 45 partes (`contract.json`). Todas aparecem no harness
   (`import-export-center.styles.test.mjs`) e nos testes dos dois bindings.
3. **Controlado e não controlado.** Há dois modelos: `view` e `expanded`, cada um com o par e
   com o pedido que leva `reason` e `cancel()`. Os factos dos jobs pertencem à loja: cancelar,
   repetir, remover, descarregar, abrir, carregar mais e recarregar são pedidos.
4. **Matriz de estados.** O job tem cinco estados (`queued`, `running`, `succeeded`, `failed`,
   `canceled`) e quatro desfechos derivados. A tabela de controlos por estado vive numa só fonte
   (`jobControls`). A raiz tem `loading` e `status="error"`, e o toggle tem `data-expanded`.
   `disabled` retém o hover (`states.test.mjs`).
5. **Teclado, foco, ARIA, toque.** O teclado é o da plataforma e o do Disclosure. A remoção e a
   retirada de um controlo passam pelo destino de foco, testado nos dois bindings. O alvo mínimo
   é garantido pelos controlos de `button` e pelo halo do `remove`. Ecrã tátil e leitor de ecrã
   reais não foram verificados.
6. **Recipes.** `size` `sm`/`md` e `level` 2 a 4. As tonalidades vêm do desfecho, não do
   consumidor.
7. **Responsivo, RTL, locale, movimento.** As capturas cobrem 240, 420 e 720, a densidade
   `dense`, RTL e os três esquemas. Números, bytes e datas passam por `Intl`, e o prazo é sempre
   absoluto. Sob movimento reduzido o anel de `spinner` para.
8. **Espera, vazio, erro, extremo.** Espera: jobs em skeleton com a anatomia do job, e `more` em
   espera. Vazio: um por vista. Erro: página com recarregar. Extremo: título de catorze palavras,
   nome de noventa caracteres com a extensão preservada, nome árabe, fase truncada numa linha,
   um milhão de linhas, e 1.284 erros enviados como amostra.
9. **SSR e desempenho.** Ids por `useId` e por fábrica injetada. O tempo restante é estimado só
   depois da hidratação e `now` é declarável. Sem virtualização: o histórico cresce por `growing`.
10. **Exemplos.** 16 cenas por página, num único domínio (Vale Norte Distribuidora).
11. **Testes partilhados.** Core: 32. React: 24 de comportamento e 4 de stories. Angular: 16 de
    comportamento e 4 de stories. Contrato: 14. Folha: 7.
12. **Estabilidade.** Família nova, sem quebra de contrato.
