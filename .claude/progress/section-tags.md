# Checkpoint — Section: parte `tags`, opção C e espaçamento próprio em fluxo

- Plano: sem arquivo de plano; pedidos diretos na sessão (parte `tags`; opção C como padrão de toda section; espaço entre sections do componente, só em fluxo).
- Branch: main. HEAD: `bca50ba3`. Nada commitado.
- Working tree (`git status --short`): `specs/components/section/`; `packages/styles/src/section/` (css, tokens.json, harness, teste); `packages/theme/src/generated/` (gerados); `packages/react/src/{section,page/page-demo.tsx,table-of-contents/table-of-contents-demo.tsx}`; `packages/angular/{section,page,page-header,table-of-contents}/src/`; `demos/nexora/angular/{LIBRARY-FEEDBACK.md,src/app/shell/demo/demo-drawer.ts}`.
- Laboratório fora do git: `tmp/section-lab/index.html`, servido na porta 8765.

## Concluído
- Fatia 1 (estilos): heading = rótulo em caixa alta (0,08em, semibold, `--_text`); `--slotted-section-heading-size-{sm,md,lg}` = xs/xs/sm. Subsection (section dentro de section) em caixa mista, `--_muted`, `--slotted-section-subheading-size-{sm,md,lg}` = sm/md/lg.
- Espaçamento: `:is([data-ui-container], [data-part-body]) > section + section` → `--slotted-section-spacing` (space-9); subsection após conteúdo no body de section → `--slotted-section-subsection-spacing` (space-7). Sem regra `section + section` solta (grid/flex/Stack não recebem margem).
- Fatia 2 (docs/stories): docs e stories da Section nos dois frameworks; sections diretas no PageBody sem wrapper (page-demo React, page/page-header stories Angular); Stack mantido onde o pai não é fluxo (Measure, Defaults, TOC demos, cena de acessibilidade); subsections das TOC demos como filhas diretas do body.
- Fatia 3 (demo): `demo-drawer.ts` sem `section { margin-block-end }`; linha no `LIBRARY-FEEDBACK.md`. Varredura: só `profile-page.ts` e `demo-drawer.ts` têm 2+ sections diretas em container de fluxo.

## Testes
- Contrato + estilos + tokens 34/34; tema 95/95 (rodada anterior).
- React section/page/page-header/table-of-contents/detail-panel 113/113; tsc 0 erros.
- Angular section/page/page-header/table-of-contents/detail-panel 95/95.
- eslint e prettier dos arquivos alterados: sem erros.

## Spinner (bug paralelo, concluído)
- `packages/styles/src/spinner/spinner.css`: gradientes + 3 ângulos animados → máscaras SVG vetoriais (trilho 20% + arco com SMIL), `background-color: currentColor`, `forced-color-adjust: none`; reduced motion troca o arco por SVG estático (75%). Tokens e tema regenerados.
- `packages/styles/src/motion.test.mjs`: durações dentro de `url("data:…")` fora da verificação de tokens.
- Estilos 1698/1698. Captura 3× do icon button em loading (sm/md/lg, ghost/outline/solid, square/circle): anel nítido, centrado, sem corte.

## Demo
- `pnpm demo:refresh` concluído sem erro.

## Problemas conhecidos
- `detail-panel` põe o badge de contagem dentro do heading (migrar para `tags`).
- Eyebrow e rótulo são ambos caixa alta pequena; diferença por tom, tracking e peso.
- Section encapsulada em componente (host Angular) não recebe espaçamento do componente; depende de Stack.

## Próxima ação
- `pnpm --dir demos/nexora/angular exec ng build` (não executado: custo) e, se verde, commit por tema: section (tags + C + espaçamento), spinner.
