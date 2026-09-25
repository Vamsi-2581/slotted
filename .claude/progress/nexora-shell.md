# Checkpoint — Nexora Shell

## Plano

- Spec: `docs/history/designs/2026-09-17-nexora-shell-design.md`.
- Plano: `docs/history/plans/2026-09-17-nexora-shell-angular.md` — 10 tarefas.

## Tarefas concluídas

Todas as dez (commits `b75c666`…`c60d053`). `demos/nexora/angular`: backend no cliente, stores, rotas de todos os módulos com `PermissionGate`, `ShellLayout`, banner em `top-navigation`, menu de utilizador, perfil, preferências, notificações (popover e página), command palette, painel de demonstração, atalhos, favicon, README, `tools/shoot.mjs`. Testes: 22 a passar (`pnpm test` na app). Frições em `demos/nexora/angular/LIBRARY-FEEDBACK.md` (biblioteca e backend).

## Estado

- Branch `review/implementation-pass-1`; HEAD `c60d053`.
- Working tree: alterações de outras faixas; `.codex/progress/current.md` com a versão local pré-merge.
- `pnpm check` raiz: `format:check`, `lint`, `test:contracts`, `test:docs` falham em ficheiros de outras faixas (não desta).

## Próxima ação

Sem tarefa pendente do plano. Candidatos: `superpowers:finishing-a-development-branch` para decidir o merge em `main`; ou a fatia seguinte do produto (Dashboard real, CRM › Customers) a partir de `demos/nexora/domain.md` Apêndice B.
