# Checkpoint

- Plano: `docs/history/plans/2026-10-20-fifth-iteration.md` (onze itens).
- Concluído: itens 1, 2, 3, 5, 6, 7, 8, 9, 10, 11. Item 4 não feito, com medição no plano.
- Git: ramo `main`, à frente de `origin/main`, sem push.
- Testes: verificação escopada por mudança. Antes do push falta o gate completo: `pnpm check` e `npx turbo run verify --filter='...[origin/main]' --concurrency=2`.
- Problemas conhecidos: ver o plano.
- Próxima ação: correr o gate completo acima; depois `git push`.
