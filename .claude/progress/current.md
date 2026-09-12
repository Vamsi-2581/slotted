# Checkpoint — splitter e drawer

`/component splitter` concluído até ao passo 15. As correcções pedidas ao
`drawer` entraram na mesma sessão, fora da sua própria execução, por decisão
explícita do utilizador.

## Entregue

- `splitter`: contrato, folha, harness, as duas ligações, as duas páginas de
  referência. Quinze entradas indexadas nos dois Storybooks.
- `drawer`: scrim em paridade com o `dialog` e um cravo que o mantém; resizer
  repintado do `splitter` com o acento só no anel de foco; pega do sheet acima
  do cabeçalho; fecho por velocidade com assentamento projectado;
  `env(safe-area-inset-bottom)` no rodapé do sheet; cenas inline com produto
  real.
- `@slotted/core/extent`: `extentFromLength`, `measureLength`, `extentVelocity`,
  `projectExtent`.
- `@slotted/storybook-workbench`: `.slotted-demo-workspace`, em commit próprio
  antes da família que o pediu.

## Commits

`c03d534` a `1d8a52e`, dez ao todo, um por passo de substância.

## Estado dos testes

- `pnpm test:contracts`: 1372 verdes.
- `pnpm test:package-layers`: 12 verdes.
- `pnpm typecheck`: limpo.
- `pnpm format:check`: limpo.
- `@slotted/core`: 1131 verdes.
- React `splitter` + `drawer`: 80 verdes.
- Angular, `splitter` + `drawer` + `dialog`: 99 verdes.
- Folhas partilhadas: 133 de 134.

## Falhas que não são desta sessão

Da outra faixa desta worktree, reportadas e não tocadas:

- `packages/styles/src/tokens.test.mjs`: `page-header tokens.json` diverge da
  sua folha.
- `pnpm lint`: `packages/react/src/toggle-group/toggle-group.tsx:6` e
  `packages/styles/src/toggle-group/toggle-group.styles.test.mjs:23`, ambos
  `no-unused-vars`. Bloqueiam a cadeia de `pnpm check`, que por isso foi corrida
  passo a passo.

## Por fazer, e onde está escrito

- `dialog`: só o scrim foi verificado, e o utilizador aceitou-o. A página de
  referência é execução própria.
- Arbitragem entre arrastar e rolar, e resistência elástica no sheet. A primeira
  só se torna real quando o cabeçalho for arrastável; a segunda faria o valor
  sair dos limites durante o arrasto, contra o que o contrato afirma. As duas
  estão recusadas com a razão em
  `docs/superpowers/specs/2026-09-12-splitter-and-drawer-self-assessment.md`.
- Painéis, acoplamento entre N regiões e o empilhamento responsivo: `app-shell`,
  onda 8, por `2026-09-11-splitter-design.md` §1.

## A lição que custou tempo ao utilizador

Nada neste repositório verifica que a folha de estilo de uma família React chega
a um browser. O jsdom não aplica CSS, o harness carrega a sua própria folha, e
`audit.mjs` mede colapso dentro do palco: três verificações verdes sobre um DOM
sem uma única regra. `splitter.tsx` ficou sem o seu `import` e renderizou com
largura zero até o utilizador abrir a página.

## Próxima acção executável

    /component dialog
