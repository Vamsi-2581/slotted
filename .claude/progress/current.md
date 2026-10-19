# Checkpoint

- Plano: `docs/history/plans/2026-10-19-equori-findings.md` (tabela Resultado preenchida, itens 1–16).
- Ramo `main`: os findings em 11 commits a partir de `53af8365`.
- Concluído: fatias 1–7. Item 16 (react-dom embutido no `dist` do `@slotted/react`) encontrado ao montar o ecrã de comparação e corrigido.
- Testes: `pnpm check` exit 0; React completo 4055/4055 (258 ficheiros); Angular completo 3196/3196; `pnpm test:release` 17; build do `@slotted/react` com `package-boundary.verify.mjs` verde; lockfile congelado OK.
- Ecrã de comparação: removido a pedido. Verificação Playwright determinística (`scratchpad/smoke.mjs`): 32 páginas sem erros; resize antes `true→false→false`, depois `true→false→true`.
- `demos/.registry`: os tarballs beta.2 do workspace foram movidos para o ecrã; `index.json` reposto com core/react/theme/themes em `0.1.0-beta.1` (estado inferido: não havia tarballs beta.2 antes).
- Limites conhecidos: item 12 (1 s) não reproduzido; item 13 sem adoção dos tokens pelas famílias existentes; popover/tour não expõem `-inset-*` de saída como o dialog.
- Próxima ação: push de `main`, CI verde, `pnpm release --dry-run` mostrado ao utilizador, `pnpm release`.
