# Checkpoint — reorganização do repositório

- Plano: este ficheiro; decisão registada em `docs/decisions/0002-repository-layout.md`.
- Branch: `review/implementation-pass-1`; commits `316e2ab` (movimentos) e `b2d8835` (documentação).
- Árvore: trabalho em curso de outras famílias mantido por stagear (app-shell, avatar, badge, button, icon, side-navigation, tag, toggle, data-grid, shell da demo).

## Tarefas

1. [x] Movimentos, reescrita de caminhos em 346 ficheiros, configs, `pnpm install`.
2. [x] Verificação: `format:check`, `typecheck`, `test:package-layers`, `test:release`, `test:docs`, testes de workbench/tokens/theme-default/harness/backend, `build:demo` da Nexora — verdes.
3. [x] `docs/README.md`, ADR 0002, `AGENTS.md`, `CONTRIBUTING.md`, `demos/nexora/README.md`.

## Falhas pré-existentes, fora do escopo

- `pnpm lint`: 9 erros em `data-grid` (React e Angular), presentes em `81dd725`.
- `pnpm test:contracts`: `reference-pages.test.mjs` — `data-grid` pinta com estilo inline nas duas bindings.

## Não feito

- `.claude/skills/component` e `.codex/skills/component` divergem (`SKILL.md`, `references/stories.md`, `quick-law.md`): unificação exige decidir o canónico.
- `.claude/progress/` guarda 17 checkpoints de famílias já entregues.
- `packages/angular/` mantém 101 diretórios de família ao nível de `src/` e `package.json` (convenção ng-packagr).

## Próxima ação

Nenhuma nesta frente.
