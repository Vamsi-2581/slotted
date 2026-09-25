# Checkpoint — `tour`, onda 11

- Plano: `docs/history/designs/2026-09-24-tour-design.md`.
- Ramo `review/implementation-pass-1`, HEAD `f8138de3`. `.claude/progress/current.md` é da sessão Nexora.
- Estado: família concluída e commitada. Nenhuma tarefa em curso.

## Commits

- `096cfbb5` isenção de medida do spotlight em `logical.test.mjs`
- `21184544`, `275b3c74` focus-scope: foco em qualquer elemento posterior e não inerte
- raise() em dismissable-layer e portal; raise() limpa o inert sobre camada no topo
- `dee8bcea`, `60c13b3f` core `@slotted/core/tour`
- `3f22d0a7`, `9fe22655` styles e contrato
- `19247b01` seta do popover presa ao troço reto
- `f53523e9` documento de desenho e autoavaliação
- `cdb4645f` React `Tour`
- `602a249f` Angular `sl-tour`
- `f8138de3` build-order (parágrafo "Entregue") e índice de desenhos

## Testes

core 47/47, styles 245/245, contrato 13/13, React 34/34, Angular 21/21, reference-pages a passar.

## Problemas conhecidos

- `cdb4645f` e `602a249f` importam o elemento `Glyph` (`packages/core/src/glyph`, `packages/{react,angular}/icon`) e a opção `back` de `createDismissableLayer`. Ambos continuam por commitar noutras sessões; o HEAD isolado não compila até esses commits entrarem.
- `packages/angular/dashboard-grid/` (porte 2D, 30/30) fica por commitar; pertence à sessão do dashboard-grid.
- O teste "back" de `dialog` falha também no HEAD; pertence a outra sessão.

## Próxima ação

Nenhuma nesta família. Verificação da dependência: `git show HEAD:packages/core/src/dismissable-layer/dismissable-layer.ts | grep -c "back?: boolean"` deve dar 1 e `git ls-files packages/core/src/glyph` deve listar ficheiros.
