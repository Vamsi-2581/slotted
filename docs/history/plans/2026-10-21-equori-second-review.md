# Segunda revisão do equori — triagem e plano

Fonte: 33 findings do projeto consumidor equori (`/home/dreco/findings`), recebidos em 2026-10-21 sobre
`@slotted/react` `0.1.0-beta.9`. Os findings 12 e 18 do ficheiro (tom `info`) são o mesmo; a tabela
conta 32. Base do trabalho: `4fb7c5b5`. Uma fatia fecha até três itens. Cada defeito leva o teste
que falha antes da mudança. React e Angular recebem a mesma mudança de contrato. Verificação
restrita à superfície alterada. Sem subagentes. O conteúdo de `tools/agent-docs/content/` muda
(itens 4, 5, 14, 18): o próximo release corre `pnpm eval:agent-docs` antes de publicar.

## Triagem

| #   | Área                              | Tipo        |
| --- | --------------------------------- | ----------- |
| 1   | build React (`light-dark()`)      | defeito     |
| 2   | dialog, alert-dialog (foco)       | defeito     |
| 3   | core glyph (offsets ópticos)      | melhoria    |
| 4   | agent-docs async-feedback AF-07   | melhoria    |
| 5   | agent-docs waiting-states         | melhoria    |
| 6   | page-header (progress com tabs)   | defeito     |
| 7   | styles (`aria-busy` de ancestral) | defeito     |
| 8   | progress-indicator (compositor)   | melhoria    |
| 9   | data-grid (loading sem linhas)    | melhoria    |
| 10  | empacotamento CSS por família     | melhoria    |
| 11  | chart (slot por fatia na pie)     | funcionalidade |
| 12  | theme (tom `info`)                | funcionalidade |
| 13  | theme (offset do anel de campo)   | melhoria    |
| 14  | agent-docs theme-app (recipe)     | melhoria    |
| 15  | theme (matiz da borda/texto dark) | defeito     |
| 16  | theme (escada de superfícies dark)| melhoria    |
| 17  | theme (data slots seguem o accent)| melhoria    |
| 18  | form (espaço entre campos)        | docs        |
| 19  | text-field e afins (autofill)     | defeito     |
| 20  | button (`ButtonLink` render)      | defeito     |
| 21  | prompt-composer (flash do anel)   | defeito     |
| 22  | prompt-composer (`emphasis`)      | funcionalidade |
| 23  | inline-message (ações)            | funcionalidade |
| 24  | theme (`--slotted-data-N-on`)     | funcionalidade |
| 25  | sparkline (transição de `d`)      | defeito     |
| 26  | entity-picker (virtualização)     | melhoria    |
| 27  | link, list-item (render props)    | defeito     |
| 28  | progress-indicator (reinício)     | defeito     |
| 29  | dialog, drawer (entrada montada)  | defeito     |
| 30  | avatar (fundo atrás da imagem)    | defeito     |
| 31  | entity-picker (docs renderOption) | docs        |
| 32  | entity-picker (spellcheck)        | defeito     |

## Fatias

1. 1, 2, 32.
2. 20, 27, 21.
3. 7, 6, 28.
4. 8, 9, 25.
5. 15, 16, 17.
6. 12, 24, 13.
7. 19, 30, 3.
8. 29, 23, 11.
9. 31, 26, 18.
10. 22, 4, 5.
11. 14, 10.

## Resultado

| #   | Estado |
| --- | ------ |
| 1   | Corrigido: `build.cssTarget` do React (`chrome123`, `edge123`, `firefox128`, `safari17.5`) mantém `light-dark()` e `:dir()` nativos (`styles.css` 1 585 089 → 1 562 982 B). `package-boundary.verify.mjs` falha quando `styles.css` lê `--lightningcss-*` (falha com o bundle da beta.9, passa depois). `segmented-control.browser.test.tsx`: indicador não transparente em light e dark. Angular já mantinha `light-dark()`. |
| 2   | Já corrigido na beta.9 (item 2 da revisão anterior). Teste de regressão em `dialog.browser.test.tsx` (Dialog e AlertDialog, "Duplicated" com `onOpenChange` inline): falha com `dialog-parts.tsx` da beta.8, passa na base. |
| 32  | Corrigido: o input do entity-picker sai com `spellcheck="false"` e `autocorrect="off"`; React `spellCheck`, Angular input `spellcheck` ligam a verificação. Testes React e Angular; contrato atualizado. |
| 20  | Corrigido com o 27: `@slotted/core/selector-key` exporta `DefinedProps<Props>` (membros que admitem `undefined` passam a opcionais sem `undefined`) e `definedProps()` (remove os membros `undefined`). Toda superfície `render` que recebe um link de router usa os dois: `ButtonLink`, `Link`, `ListItemLink`, `BreadcrumbLink`, `CardLink`, `TagLink`, `TableOfContentsLink`, `SideNavigationLink`, `NavigationMenuLink`, `TopNavigationHome`/`Link`/`Action`/`Help`, `PageHeaderBack`. `src/render-props.test.tsx`: as 14 superfícies espalham as props num link tipado `{ href?: string; target?: string; 'data-current'?: string }` (17 erros de tipo antes, 0 depois) e o teste de execução não encontra chave `undefined` (falha antes). `keyedProps` mantém a assinatura: a inferência dos handlers depende dela. |
| 27  | Ver 20. |
| 21  | Corrigido: a raiz do prompt-composer deixa de transicionar `outline-color`; o anel aparece na sua cor no primeiro quadro, como em todo controle com moldura. Teste de estilo falha antes, passa depois. |
