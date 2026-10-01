# Checkpoint — fila das entradas

- Plano: fila do pedido `/component` + `/reui` (entradas): 1 `text-field`, 2 `textarea` + `prompt-composer`, 3 `color-picker`, 4 `number-field` / `currency-field`.
- Entregues: itens 1 a 3; item 4 `number-field` (`a75b0df9` steppers concêntricos, `8b7cbdee` parte `scrub`, commit seguinte com a história React).
- Branch `review/implementation-pass-1`. Árvore com alterações de outras sessões; ficheiros partilhados indexados a partir de HEAD, nunca `git commit -- <paths>`.
- Testes `number-field`: núcleo 43/43, React 64/64, Angular 53/53, contrato 22/22; `audit.mjs` React e Angular a 1280 e 620 sem achados.
- Problemas conhecidos (outras sessões): `field-surface.test.mjs` falha em `kbd`; `pnpm check:affected` falha no lint de `packages/react/src/message/message-demo.tsx` (`react-hooks/exhaustive-deps` sem definição).
- Dossiê: `docs/history/designs/2026-10-01-number-field-reui-dossier.md` (linha 5 do delta por aplicar).

## Próxima ação

`/reui currency-field polish`: aplicar a `packages/styles/src/currency-field/currency-field.css` o delta das linhas 1 a 4 do dossiê de `number-field` e a parte `scrub` (contrato, ligações, páginas).
