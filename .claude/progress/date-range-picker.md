# Estado atual — date-range-picker

Sessão `/component date-range-picker`, onda 8 de `docs/build-order.md`. Skill
`.claude/skills/component`. Família nova; modo criar.

## Plano

Os quinze passos da skill. Todos concluídos; commits feitos.

## Tarefas concluídas

1–15. Inventário, desenho, contrato, folha, capturas, gate visual ("ok"),
ligações React e Angular, páginas de referência, verificação, autoavaliação,
commits.

## Git

Branch `review/implementation-pass-1`. Commits desta família, por ordem:

- `7a6513e` feat(calendar): a banda pendente
- `b13486a` feat(core): date-range
- `6f19959` feat(date-field): a ligação Angular ganha o input label
- `3254027` docs(date-range-picker): o inventário, o desenho e o contrato
- `f340f6c` feat(date-range-picker): a folha, os tokens e o harness
- `86710d7` feat(date-range-picker): a ligação React
- `c351c17` feat(date-range-picker): a ligação Angular
- `b4c7833` docs(date-range-picker): as duas páginas de referência
- a seguir: docs(date-range-picker): a autoavaliação e o ponto de situação

Os commits foram feitos por um índice privado (`git read-tree` + `commit-tree`
+ `update-ref`), porque o índice partilhado tinha ficheiros de outra faixa em
stage. `packages/styles/package.json` foi commitado só com as duas linhas desta
família; as linhas de `tags-input` ficaram na árvore de trabalho.

## Testes

- Contrato: 22 pass. Calendar: 17 pass.
- React (`date-range-picker`, `calendar`, stories): 81 pass.
- Angular (`date-range-picker`, `calendar`, `date-field`, stories): 110 pass.
- Core `date-range.test.ts`: 17 pass.
- `pnpm check:affected`: parou no `format:check` por 7 ficheiros de
  `tags-input`. Passos corridos à parte: `lint` 4 erros (`tags-input`,
  `toggle-group`), `typecheck` 2 erros (`tags-input`), `test:contracts` ok,
  `test:package-layers` ok, `test:docs` 4 falhas (`segmented-control`,
  `splitter`, `toggle-group`). `turbo verify --affected`: `styles` 1097 pass,
  1 fail (`page-header` tokens.json); `tokens` 1 fail
  (`--slotted-control-font-family` alterado no tema por outra faixa);
  `harness` 83 pass. Nenhuma falha nomeia esta família.

## Problemas conhecidos

- As duas páginas de referência não foram lidas renderizadas nem medidas com
  `audit.mjs`: os Storybooks em 6006 e 6007 não indexam a família até serem
  reiniciados, e o reinício interrompe a outra faixa.
- A 240 px com atalhos, a lista de atalhos fica acima da grelha em coluna
  esticada (decisão registada na folha).

## Próxima ação executável

Reiniciar os dois Storybooks; ler
`http://localhost:6006/iframe.html?viewMode=docs&id=components-date-range-picker--reference`
e `http://localhost:6007/...` a 1280 e 720, claro e escuro; correr
`node tools/harness/audit.mjs "<url>"` e `--width 620` nas duas.
