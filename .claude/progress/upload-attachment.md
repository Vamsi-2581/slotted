# Checkpoint — /reui upload + attachment

- Invocação: `/reui upload, attachment` — polish do `upload` (promovido a build pelo contrato), build de uma família nova `attachment` (decisão do utilizador, 2026-09-30).
- Ramo `review/implementation-pass-1`, HEAD lido 0e804609. Outras sessões editam o tree em paralelo; `docs/history/designs/README.md`, `docs/token-foundation.md` e `packages/theme-default/src/theme.json` têm alterações alheias. O commit do upload tem de nomear ficheiros e aplicar só o próprio hunk no README.
- Dossiê: `docs/history/designs/2026-09-30-upload-reui-dossier.md`.

## Fatias

1. Dossiê do upload. Feito.
2. Delta CSS do upload. Feito: linha arredondada, raio md, espaço 8, nome 500, `ready` tracejado, pressão com 1px (`trigger`, `filename`, visualizador), hover do visualizador por mistura, entrada por `@starting-style`, forced-colors, miniatura da grelha em píxel inteiro, `align-content: start` no cartão, `--_zone-edge`/`--_zone-ground` (a variante `field` passa a responder a invalid/disabled/arraste).
3. Contrato do upload. Feito: `dataAttributes` com `data-browsable`, `queueMessage` + `describeQueue` (core `UploadQueueMessage`, React e Angular), anúncios de erro/cancelamento/fim nos dois bindings, correção do cálculo "N files added" (erro de sinal nos dois), formatter `duration` no Angular, páginas de referência, story React.
4. `/component attachment`. Feito: commit e929273f (33 ficheiros). Correções depois do agente: placa de ações do cartão revelada por hover/foco em ponteiro fino; barra de progresso na coluna do texto, dentro do recuo inferior (a pedido: na story Anatomy a barra colada à aresta duplicava a borda de invalid).

## Verificação

- Styles 1560/1561; a falha é `event-calendar` tokens.json (trabalho alheio). Upload tokens verificado à parte: OK.
- Contrato upload 37/37; specs 49/49; reference-pages 3/3.
- React upload 31/31; Angular upload 27/27; tsc React sem erros no upload.
- `pnpm check:affected`: `pnpm check` passa; `verify` falha em dialog, table, data-grid, multi-select (famílias não tocadas; dialog falha isolado).
- Commit do upload: 72ad884d (21 ficheiros). A linha do README entrou no commit bffd077f de outra sessão.

## Próxima ação

Nenhuma nesta invocação. Pendente fora da família: reiniciar o Storybook Angular (6007) para ver `@slotted/angular/attachment`; saída animada da linha (upload e attachment) em Reaberturas.
