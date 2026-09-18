# Checkpoint — reorganização do repositório

- Plano: este ficheiro (sem plano em `docs/`); decisão registada em `docs/decisions/0002-repository-layout.md`.
- Branch: `review/implementation-pass-1`; HEAD de partida `81dd725`; árvore suja com trabalho em curso de outras famílias (mantido).

## Layout alvo

```
apps/            storybook-react, storybook-angular
demos/           nexora/{angular,backend,domain.md,README.md}, .registry (ignorado)
packages/        core, react, angular, styles, tokens, theme-default
tools/           harness, storybook-workbench
specs/           contratos por família (inalterado)
scripts/         inalterado
docs/            lei na raiz; decisions/, process/, history/{build-log.md,designs/,plans/}, product/, archive/
```

## Tarefas

1. [ ] Movimentos (`git mv`), remoção de `packages/react/packages`, reescrita de caminhos, configs, `pnpm install`.
2. [ ] `pnpm check` verde; commit.
3. [ ] `docs/README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `demos/nexora/README.md`, ADR 0002; commit.

## Estado

- Tarefa em curso: 1.
- Próxima ação: executar os `git mv` listados na tarefa 1.
