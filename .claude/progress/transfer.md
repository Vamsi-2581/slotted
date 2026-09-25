# Checkpoint — onda 11: `transfer`, `entity-picker`, `hierarchical-picker`

- Plano: skill `component`, invocação `transfer, entity-picker, hierarchical-picker`; uma família por execução.
- `.claude/progress/current.md` pertence à sessão paralela e não foi sobrescrito.
- Ramo `review/implementation-pass-1`, HEAD `4fdc79be`.

## Concluído

- `transfer`: passos 1–15. Gates visual e de release aprovados. Commits `93aa6602` (core), `a19a7852` (contrato, estilos, harness, design), `809378f4` (React), `732face1` (Angular), `2ff37de5` (autoavaliação, build-order), `4fdc79be` (índice de designs).
- Os registos partilhados foram commitados só com as linhas de `transfer`; as linhas não commitadas de outras sessões continuam na árvore de trabalho.

## Pendente, fora desta família

- Proposta levada ao gate: input `ariaLabel` em `slCheckbox` (Angular), que tiraria a escrita de `aria-label` no `input` feita por `transfer`.
- Storybooks precisam de reinício para mostrar `transfer`; páginas não lidas renderizadas nem medidas com `audit.mjs`.

## Próxima ação

`/component entity-picker` numa execução nova: ler `docs/build-briefing.md`, `references/quick-law.md` e a secção Entity Picker de `docs/component-features.md` (linha 685), depois o inventário de capacidades.
