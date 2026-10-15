# Checkpoint — canal beta e demo `demos/nexora/backend`

## Plano

Sem ficheiro de plano. Escopo decidido em conversa: a biblioteca empacota versões
`0.x.y-beta.N` em tarballs; a demo Angular consome-as como instalação separada.

## Tarefas concluídas

1. Manifests: `version: 0.1.0-beta.0`, `files`, `publishConfig.directory: dist`
   (Angular); `@slotted/tokens` passa a `devDependencies` de `@slotted/theme-default`
   (defeito encontrado pela demo: dependência de runtime inexistente no registo).
2. `scripts/pack-beta.mjs` + `scripts/pack-beta.test.mjs`; scripts raiz `pack:beta`,
   `release:beta`, `test:release` (dentro de `check`); `demos/**` excluído de
   eslint, prettier e `tsconfig.json`; `demos/.registry/` ignorado pelo git;
   secção "The beta channel" em `CONTRIBUTING.md`.
3. Demo Angular 22.1.8 em `demos/nexora/backend`: instalação própria
   (`pnpm-workspace.yaml`), `@slotted/angular|core|theme-default` por `file:`,
   fontes Geist, ng-icons; `src/styles.css` com `@layer slotted, app` e marca por
   tokens de acento por esquema; `index.html` com os três atributos `data-slotted-*`;
   `app.config.ts` com quatro `provide*Defaults` de mensagens em inglês;
   app-shell + side-navigation + page + page-header + button + avatar + badge.

## Estado

- `pnpm build` da demo: sucesso; render verificado em light e dark por screenshot.
- Gate raiz: `typecheck`, `test:package-layers`, `test:release` passam. `format:check`,
  `lint`, `test:contracts` e `test:docs` falham em ficheiros de outras faixas
  (`stat-card.harness.html`, `nexora-op-demo-domain.md`, `toggle-group`, `data-grid`,
  `detail-panel.docs.ts`).
- HEAD `24cfc95`, branch `review/implementation-pass-1`. Nada commitado nesta faixa.

## Próxima ação

Commit dos ficheiros desta faixa num só comando:

```
git add .gitignore .prettierignore CONTRIBUTING.md eslint.config.js package.json tsconfig.json scripts/pack-beta.mjs scripts/pack-beta.test.mjs packages/angular/package.json packages/core/package.json packages/react/package.json packages/styles/package.json packages/tokens/package.json packages/theme-default/package.json demos/nexora/backend && git commit -m "feat(release): canal beta — tarballs por pnpm pack em demos/.registry; demo Angular nexora-operations como instalação separada"
```
