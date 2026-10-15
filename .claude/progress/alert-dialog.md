# Checkpoint — `dialog` (membro `alertDialog`), `/reui` polish

Concluído em 2026-09-29. Ramo `review/implementation-pass-1`. HEAD `18cf9829`.

- Plano: nenhum; dossiê `docs/history/designs/2026-09-29-alert-dialog-reui-dossier.md`.
- Concluído: deltas 1–3 do dossiê (linha do título em `--slotted-line-height-md`; `strong` na descrição com cor e peso do título; cena `alert-danger` com `<strong>`). Gate: DG4 mantida.
- Em curso: nenhuma tarefa.
- Árvore: ficheiros da família `dialog` limpos; o resto do tree tem trabalho de outras sessões.
- Testes: `@slotted/styles` 1535/1535. `pnpm check:affected` exit 1 por `dialog.test.tsx` › "closes on the platform way back" (React e Angular, `expected 2 to be 3`; passa isolado com `vitest -t "platform way back"`) e por `table` (snippet formatado, seletor de intervalo), fora desta família.
- Ajustes de âmbito: capturas ReUI pela base `radix`; a base `base` perde as folhas de estilo ao abrir o diálogo (523 → 34 tokens).
- Problemas conhecidos: hover de `button` `solid` `danger` com ΔL 0.014 < 0.02 e hover vazio em cores forçadas (família `button`).
- Próxima ação: nenhuma nesta família. Para o defeito de `button`: `/reui button polish` ou edição do hover `solid` `danger` em `packages/styles/src/button/`.
