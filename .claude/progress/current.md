# Checkpoint

- Plano: nenhum (findings avulsos da equori, em fila).

## Fila de pedidos

| # | Pedido | Estado |
| - | ------ | ------ |
| 1 | Release `v0.1.0-beta.20` (portal + alert `actionsPlacement` + `hooks.json`) | CI `40620498867` verde; instrução do dono: push e release depois de concluir os itens 2–4 |
| 2 | date-picker: segmentos cortados como item flex ao lado de um Select (PageHeaderActions > Inline nowrap > Select + Stack > DatePicker) | concluído: `inline-size: 100%` removido dos roots de select e date-picker; teste de navegador falha antes, passa depois |
| 3 | button: `IconButtonLink` (props de IconButton + `href`, `render` com props de âncora, `disabled` → `aria-disabled` sem href, como ButtonLink; compõe em ButtonGroup). Aceite: teste de tipos que espalha as props do render num componente `ComponentPropsWithRef<"a">`; teste de render com role="link" e nome dentro de `[data-ui="button-group"]` | pendente |
| 4 | docs chart: linha `title` de chart.md diz que, sem `title`, o plot é nomeado pelo `aria-label` do Chart; exemplo de Chart dentro de Section com `aria-label` e sem `title`. Aceite: verificação de docs pela frase; teste com role="group" nomeado e sem `data-part="title"` | concluído (React; o Angular não repassa `aria-label` ao plot — lacuna registada) |

## Estado

- Git: branch main; commits `fix(portal)`, `feat(alert)`, `chore(theme)` enviados para origin/main.
- Não commitado: `packages/react/src/date-picker/date-picker.browser.test.tsx` (com `console.log` de depuração), `packages/react/src/date-picker/zz-probe.browser.test.tsx` (sonda, remover).
- Problema conhecido: `pnpm typecheck` incremental emite falsos erros circulares em `*.stories.tsx` com cache antigo; apagar `node_modules/.cache/tsc/root.tsbuildinfo`.
- Próxima ação: verificar o resultado do CI `40620498867`; se verde, `pnpm release`.
