# Checkpoint — documentação para agentes

- Plano: `docs/history/plans/2026-10-01-agent-docs.md`. Desenho: `docs/history/designs/2026-10-01-agent-docs-design.md`. Ledger: `.superpowers/sdd/2026-10-01-agent-docs/progress.md`.
- Tarefas concluídas: 1–5 (catálogo nos contratos; renderização; carga, gate e build; snippets em inglês e exemplos `basic` nas 12 famílias; saídas no site).
- Tarefa em andamento: nenhuma. Revisão final concluída; 6 correções aplicadas com teste; 3 menores diferidos no ledger.
- HEAD e branch: `6ff5651` em `review/implementation-pass-1` (avança por commits de outras sessões). Nada commitado por esta frente.
- Árvore: alterações não commitadas desta frente listadas no ledger e no prompt da revisão; alterações de outras sessões na mesma árvore.
- Testes: `pnpm test:contracts` 2161/2161; `pnpm --filter @slotted/agent-docs verify` 24 testes + typecheck; `pnpm test:docs` 26/26; `node --test scripts/verify-docs-snippets.test.mjs` 5/5; React das 6 famílias traduzidas 298/299 (falha anterior em `dialog.test.tsx`, reproduzida sem estas mudanças); `pnpm --filter @slotted/docs test:outputs` 5/5; site build exit 0.
- Ajustes de escopo: `catalog.{group,summary}` em vez de campos de topo; transbordo por seção; português em 62/60 famílias, Tarefa 4 restrita às 12 por decisão do usuário; exemplos completos como `apps/docs/examples/<binding>/<family>/basic.*`.
- Problemas conhecidos: `pnpm --filter @slotted/react build` falha em `saved-views-demo.tsx` (outra sessão); testes Angular bloqueados pela mudança de `data-grid` de outra sessão (`booleans` obrigatório); `astro check` 2 erros em `src/console/Records.tsx` pela mesma mudança; `ng build` direto apaga `packages/angular/dist/docs`; defeitos de documentação em `LIBRARY-FEEDBACK.md` (menu render, data-grid `label`/`DataGridColumn`, drawer `TextField label`).
- Próxima ação exata: aguardar o usuário. Pendência registrada: tradução dos snippets de 56 famílias React e 54 Angular (seção "Pendência" do plano), adiada por decisão do usuário.
