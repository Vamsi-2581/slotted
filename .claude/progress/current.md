# Checkpoint

- Plano: sete achados da sessão (StrictMode, kbd, menu width, app-shell seam, app-shell gutter, table empty, app-shell ring inset) e release `v0.1.0-beta.7`. Sem ficheiro de plano.
- Feitos: StrictMode (`c3400bef`, `destroy` reversível em `@slotted/core/presence`), Table vazia (`accb6dc0`), app-shell seam + gutter + ring inset (`e0004b71`, cenário `tools/harness/scenarios/app-shell-nav-edges.mjs`).
- Em curso: kbd (centro da legenda), depois menu `width`.
- Git: ramo `main`, à frente de `origin/main` por 3 commits; árvore limpa.
- Testes: `src/strict-mode.test.tsx`, `src/table` (82), `core/src/presence` (26), estilos app-shell/side-navigation, contrato app-shell, cenário de browser app-shell: todos passam.
- Próxima ação: medir `[data-part=legend]` vs `[data-part=label]` num cenário React com `Button end={<Kbd size="inherit" variant="plain">N</Kbd>}` e `Shortcut keys="mod+k"`.
