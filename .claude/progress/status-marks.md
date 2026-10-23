# Checkpoint — marcas de status (sessão paralela à rodada do equori v3; `current.md` pertence àquela rodada)

- Plano: `docs/history/plans/2026-10-23-status-marks.md`
- Concluídas: 1 (fundação), 2 (inline-message), 3 (status-indicator, parte `detail`), 4 (alert, toast, dialog no mapa `status-*`)
- Em curso: nenhuma; plano concluído, sem commit.
- Branch main, HEAD d4ae520d, nada commitado. A árvore também tem alterações da outra rodada (drawer, overlay-motion, popover, select, menu…), fora deste plano.
- Testes: estilos + contratos 3898/0; React glyph, inline-message, field, status-indicator, alert, toast, dialog verdes; Angular idem.
- Typecheck: o `tsbuildinfo` incremental estava obsoleto (373 erros circulares em stories); com cache regenerado, 0 erros. Cópia do cache antigo em scratchpad.
- `packages/theme/src/generated/hooks.json` regenerado: +`detail` em status-indicator.
- `pnpm check:affected`: 12/12 tarefas com sucesso (18m49s).
- Ajustes de escopo: notification-center fica fora (glifo contornado sobre disco tingido; nunca usou triângulo). Alert e toast: caixa do ícone = tamanho da marca (era 12/11 para o anel Lucide).
- Próxima ação: commit dos arquivos deste plano, nomeados um a um (ver `git status`), após revisão do usuário.
