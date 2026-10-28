# Checkpoint

- Plano: nenhum (pedido avulso: dois findings da equori — `actionsPlacement` no alert, seeds do portal em profundidade).
- Tarefas concluídas:
  - core/portal: `mirrorSeeds` lê as seeds no `[data-slotted-seeds]` ou `[data-slotted-theme]` mais próximo do opener (ou no `documentElement`), e uma seed escrita inline entre o opener e esse elemento continua a valer. Testes: `portal.test.ts` (abertura a profundidade 24 < 500 ms; seed de região com `data-slotted-seeds`), `react/src/menu/menu.test.tsx` (Menu a profundidade 24 < 500 ms; 160 s antes da correção).
  - alert: `actionsPlacement?: 'below' | 'end'` nas duas bindings; resolvido como prop, depois `end` para `reach="page"` e `below` para as outras; `data-actions-placement` no root. CSS: a regra de 40rem que valia para `data-reach='page'` passa a valer para `data-actions-placement='end'`; as ações entram no grupo de baseline do ícone e do texto, o dismiss fica na primeira linha, na coluna 4. Contrato: eixo `actionsPlacement` e `resolution`. Docs das duas bindings: nota e snippet de `actions`, linha da tabela de props. Testes: `react/src/alert/alert.browser.test.tsx` (6 casos a 960 px e a 30rem), unit React e spec Angular do atributo, teste de estilo reescrito.
- Em curso: nenhuma.
- Git: branch main em `93b80000`; alterações sem commit em 18 ficheiros.
- Testes: core portal 26/26; React menu 38/38; React alert unit 29/29, browser 6/6; Angular alert 27/27; estilos + contrato alert 43/43; agent-docs 223/223; `pnpm check` verde com o cache de tsc apagado.
- Ajustes de escopo: o banner `page` largo deixou de centrar a ação e o dismiss na caixa inteira; agora ficam na primeira linha da mensagem (igual para uma mensagem de uma linha, diferente para várias linhas). O `actionsPlacement` não entrou no provider de defaults.
- Problemas conhecidos: `pnpm typecheck` incremental volta a dar erros de inferência circular em `*.stories.tsx` com cache antigo; com o cache apagado dá 0. Visual do banner `page` de várias linhas não verificado fora do teste.
- Próxima ação: commit dos dois findings e, se pedido, `pnpm release` (beta.20).
