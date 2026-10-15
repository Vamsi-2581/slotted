# Checkpoint — Support › Inbox: colapso do page-header e eixo `variant`

- Plano: nenhum (triagem `demo-triage`; desenho do eixo aprovado no chat).
- Ramo `review/implementation-pass-1`, HEAD 1ce8e971. Nada commitado; o tree tem edições de outras sessões.

## Concluído

1. Colapso por scroll contido: `@slotted/core/sticky-header` só recolhe por scroll contido um header com header area (teste RED antes).
2. Eixo `variant` do page-header: `band` (padrão), `plain`, `floating`.
   - Core: `onStuck` / `data-stuck` (title area ou root na sua posição sticky com scroll > 0); `stuck()` mede contra o offset resolvido do root; o recuo entra em `--slotted-page-sticky-top`.
   - Styles: `--_surface`, `--_ground`, `--_sticky-inset`; tokens novos `--slotted-page-header-inset`, `-radius`, `-shadow`; a pílula mantém a superfície.
   - Contrato: `axes.variant`, `variant`, `resolution.variant`, `stuck`, `provides`, `defaults`, capability `appearance`.
   - Angular e React: input/prop `variant`, defaults, `data-variant`, `data-stuck`; `detail-panel` (Angular) herda `variant`.
   - Docs: linha `variant` na API e descrição do root nas duas bindings.
   - Theme: `contract.ts` e `hooks.json` regenerados.
3. Demo: headers do ticket e do depósito (Reconciliation) `floating` ao lado da fila, `band` no telefone; hosts de `app-resolve-dialog`, `app-escalate-dialog`, `app-reason-dialog` e `app-confirm-dialog` com `display: contents` (vão de 36 px sob o chat); três linhas no `LIBRARY-FEEDBACK.md` marcadas "uncommitted"; `pnpm demo:refresh` executado.
4. Correções do `floating` achadas na Reconciliation: recuo só no estado preso; propriedade privada renomeada para `--_sticky-inset` (colidia com o `--_inset` do container); o fato conta o root preso (borda de 1 px); `sticky-top` republicado ao mudar o fato e no `transitionend`.

## Verificação

- Core verify: 2162 testes, typecheck e build verdes.
- Styles, tokens e contrato page-header: 64/64. `generate-sources --check` verde.
- React: page-header e detail-panel 53/53; typecheck verde.
- Angular: specs de page-header e detail-panel verdes (4 ficheiros).
- Demo: `support-routes.spec.ts` e specs de `core/finance` (8 ficheiros) verdes.
- Cenários CDP em :4251 (servidor encerrado): Inbox com vão 0 px e ticket `floating`; Reconciliation (persona `priya-shah`) com header em 171 px em repouso, 179 px preso com sombra e `sticky-top` 79 px, e 171 px de volta.

## Problemas conhecidos

- `hooks.json` regenerado inclui entradas de outras sessões (`start`, `end`, `data-waiting`).
- Sem exemplo visual de `variant` nas stories e na página de docs.
- O header do ticket agrupa as ações no menu "…" com o título no tamanho expandido.
- Separadores de data da conversa sobrepostos ("Tuesday"/"Wednesday"), anterior a esta sessão.
- O servidor :4250 (pid 445802) precisa reiniciar para servir os tarballs novos.
- Ao rolar, o `floating` em repouso desliza 8 px até o recuo; o vão acima mostra o conteúdo (efeito previsto).

## Próxima ação

Reiniciar o servidor da demo: `cd demos/nexora/angular && pnpm start`, abrir `/support/inbox` e um ticket.
