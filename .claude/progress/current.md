# Checkpoint

- Plano: sete achados da sessão e release `v0.1.0-beta.7`. Sem ficheiro de plano.
- Feitos: StrictMode (`c3400bef`), Table vazia (`accb6dc0`), app-shell seam + gutter + ring inset (`e0004b71`), kbd/button (`43bd3e82`), menu `width` (`152b078f`), contrato side-navigation (último commit).
- Em curso: release. CI run 39497894877 no HEAD de `main`, empurrado para `origin/main`.
- Git: ramo `main`, igual a `origin/main`; árvore limpa salvo este ficheiro.
- Testes locais: gate rápido (`format`, `lint`, `typecheck`, contratos, package-layers, release, docs, i18n) verde; cenários de browser `app-shell-nav-edges`, `kbd-legend-centre`, `menu-width` passam e falham sem a correção.
- Próxima ação: `gh run watch 39497894877`; em sucesso, `pnpm release --dry-run`, depois `pnpm release`, depois `gh run watch` do workflow Release e `npm view @slotted/<p>@0.1.0-beta.7 dist-tags --prefer-online` para os seis pacotes.
