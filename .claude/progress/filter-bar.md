# Checkpoint — filter-bar code-block

`/component filter-bar code-block`, uma sessão só (rodada 11 de
`docs/build-schedule.md`). O ficheiro é `filter-bar.md` e não `current.md`
porque outra sessão escreve `current.md` nesta mesma worktree.

## Plano

`.claude/skills/component/SKILL.md`, passos 1–15, para as duas famílias. Modo:
**criar** (nenhuma existia). Um gate visual para as duas, um gate de release
para as duas.

## Tarefas concluídas

1. Lei lida: `docs/build-briefing.md`, `quick-law.md`, `build-schedule.md`,
   `component-features.md` §2, §10, §12, §15, §18, `frameworks.md`,
   `capability.md`, `patterns.md`, `rubric.md`, `stories.md`, `harness.md`,
   `token-foundation.md`, `state-and-events.md`, `contract.schema.mjs`,
   `2026-09-10-table-filter-design.md`.
2. Inventários (fontes lidas por URL em 2026-09-14):
   `docs/superpowers/specs/2026-09-14-filter-bar-capability-inventory.md`,
   `2026-09-14-code-block-capability-inventory.md`.
3. Desenhos com as duas tabelas de integração e a transcrição do teclado:
   `2026-09-14-filter-bar-design.md`, `2026-09-14-code-block-design.md`.
4. Contratos e testes (32 testes, verdes):
   `specs/components/filter-bar/{contract.json,contract.test.mjs}`,
   `specs/components/code-block/{contract.json,contract.test.mjs}`.
5. Motor: `packages/core/src/filter/group.ts` + `group.test.ts` (16 testes,
   verdes; exportado em `filter/index.ts`); `packages/core/src/code/{code.ts,
   index.ts,code.test.ts}` (8 testes, verdes; entrada `./code` em
   `packages/core/package.json` e `vite.config.ts`, fora do barrel como
   `filter`). `tsc` limpo nos ficheiros desta sessão.
6. **Commit `d300090`** — escala de tokens `--slotted-code-*` (12, camada
   component, eixo scheme, `CanvasText` sob forced-colors) em
   `packages/tokens/src/contract.json`, `packages/themes/default/src/theme.json`,
   teste em `default-theme.test.mjs`, secção **Code scope** em
   `docs/token-foundation.md`. Tokens e tema reconstruídos.
7. `packages/styles/src/filter-bar/{filter-bar.css,filter-bar.tokens.json,
   filter-bar.harness.html}` escritos; testes partilhados de styles verdes para
   a família (a falha em `page-header tokens.json` é de outra lane).
8. Capturas em `/tmp/claude-1000/-home-dreco-dev-slotted/d7d6d98f-d963-4fa1-93b6-80a949213528/scratchpad/shots/`:
   `filter-bar-light-comfortable-ltr-720.png` e `-420.png` lidas e corrigidas
   (raízes de `text-field`/`select` embrulhadas nas partes `search`, `preset`,
   `field`, `operator`; `count` movido para o fim de `bar`; pesos do chip).
   Lidas e aprovadas: dark 420, `default` a 720 em dark e rtl, foco no pill
   (light). Corrigido: `count` toma a ponta do fim da linha também quando
   quebra; `end` sem margem automática. Por ler: high-contrast 420, light 240,
   dense 420 (capturadas), foco no chip em dark (capturado).

9. `packages/styles/src/code-block/{code-block.css,code-block.tokens.json,
   code-block.harness.html}` escritos; `text` acrescentado às partes do
   contrato (17); `--slotted-code-block-{digits,indent,collapse,max-lines}`
   registados em `packages/styles/src/runtime-properties.mjs` e no
   `tokens.test.mjs` (registo partilhado, append). **Commit `0458a24`** — glifo
   `--slotted-icon-text-wrap` (contrato, `glyphs.json`, tema, doc, lista de
   glifos recentrados em `scripts/verify-token-foundation.test.mjs`).
   Capturas lidas e aprovadas: light 720 (corrigido: número escondido sem
   `data-line-numbers`), dark 420. Capturadas por ler: high-contrast 420,
   light 240, dense 420, rtl 420.

10. Revisão do utilizador: o X duplicado nos chips era o `remove` da regra
    (`[data-ui='filter-bar'] [data-part='remove']`) a apanhar também o
    `remove` do `tag`; agora `[data-part='rule'] > [data-part='remove']`.
    Composição refeita como grelha com três regimes por container query
    (`frame`, parte nova — 29 partes): larga ≥64rem uma linha; média
    40–64rem busca+end+count / barra / chips; estreita <40rem busca / summary+end
    / count. `end` e `count` saíram de dentro de `bar`. Lidas: light 720, 420.

11. `packages/styles/src/{filter-bar,code-block}/*.styles.test.mjs` (10 + 11
    testes, verdes); cenas `revealed` nos dois harness; foco fotografado em
    `remove` do construtor, chip, `copy` e `reveal`; `reveal` com anel interno
    e cantos do bloco, máscara do colapso a desvanecer só a última linha.
    Escopo das duas famílias em `docs/build-order.md` (onda 8, append).
    `node --test specs/*.test.mjs` 45/45.

12. Gate visual aprovado ("siga"). Passo 10: ligações React
    (`packages/react/src/{filter-bar,code-block}/`, 21 + 18 testes) e Angular
    (`packages/angular/{filter-bar,code-block}/`, 18 + 16 specs) escritas;
    registos append-only em `packages/react/{package.json,vite.config.ts,
    src/index.ts}`.
13. Passo 11: páginas de referência React (`*.docs.ts`, `*.stories.tsx`,
    `*.stories.test.ts`, 4 + 4 testes) e Angular (`*.docs.ts`, `*.stories.ts`,
    `*.stories.spec.ts`, 4 + 4 specs). Angular: modelos passam a
    `model<T | undefined>(undefined)` com inputs `default*` e computeds
    `currentValue/currentQuery/currentPreset/isOpen/isRevealed` (filter-bar) e
    `isWrapped/isRevealed` (code-block), como `timeline`; um spec novo por
    família. `ng test --include '**/{filter-bar,code-block}/**/*.spec.ts'`
    42/42.
14. Auditoria React (`tools/harness/audit.mjs`, 1280 e 620) limpa nas duas
    páginas depois de: raiz de `filter-bar` com `inline-size: 100%` (um
    container inline-size numa grelha `justify-items: start` media 0px);
    stacks internos das stories trocados por fragmentos (o palco `block` é
    quem dá o espaço); a URL da cena `url` desenhada num `CodeBlock` com
    `defaultWrap` nos dois frameworks.

15. Páginas React lidas na imagem (1280 e 720, light e dark, dense; docs e
    story) e auditadas limpas. Correções: ponto estreito 40rem→36rem (o palco
    da página mede 39rem); raiz `inline-size: 100%`; `actions` (Apply/Reset)
    com `margin-inline-start: auto`; pill cheio sem acento sob `disabled`;
    `sticky` somava a própria altura duas vezes no segundo `publish` (React e
    Angular, teste em cada); cenas `count`/`states`/`content` divididas em um
    palco por barra; trechos alinhados às demonstrações (`customer`, `NESTED`,
    `lineNumbers` no diff); pedidos com `company` nos dados.
16. Passo 12: prettier limpo; `pnpm typecheck`, `test:contracts`,
    `test:package-layers` verdes; `pnpm lint` falha em `toggle-group` e
    `test:docs` em `segmented-control`/`splitter`/`toggle-group`/`action-bar`
    (outras faixas); `packages/core` 1247/1247; `packages/styles` 1142/1143
    (`page-header`, outra faixa); `packages/react` 2513/2513 + build;
    `packages/angular` `pnpm test` 1898/1898 + build + 9 bundle.
17. Passo 13: `docs/superpowers/specs/2026-09-14-{filter-bar,code-block}-self-assessment.md`.

18. Revisão do utilizador no gate: popover dos pills sem largura (regra da
    raiz a apanhar o editor) e construtor sem tema (portal fora do
    `[data-slotted-theme]`). Corrigidos: raiz `[data-part='root']`, editor em
    coluna a 18rem dentro de `PopoverBody`, `clearRule`, `container` na
    família, cenas `builder`/`groups` em caixa alta, `items` no multi-select,
    cena `editor` no harness. Testes: contrato 15, folha 11, React 26, Angular
    23 + 4 páginas. Auditoria React limpa.

19. Revisão do utilizador: construtor refeito (Match All/Any, coluna
    "Where/and/or", grupo aninhado em caixa, plus nos add, drawer xl), lupa na
    busca. Partes 32, rótulos +3/+4. Contrato 15, folha 11, React 26 + 4,
    Angular 23 + 4, auditoria limpa. Pendente de decisão: escala de tamanho
    interno por densidade (kbd/tag/inner controls apertados em compact/dense —
    medido: campo 28/26px contra kbd 24, tag 22/20, clear 22/20).

20. Storybook :6007 (pid 364529, 14/09) morto a pedido do utilizador; não
    relançado. Construtor: cada `group` é container (`slotted-filter-bar-builder`)
    para a regra empilhar contra a largura do próprio grupo (3 níveis medidos
    sem overflow: 591/527/439/351px); caixas alternam a superfície por
    profundidade; harness `builder` com três níveis.
21. Fundação (decisão do utilizador): escala `--slotted-control-inner-size-{sm,md,lg}`
    (22/24/28, 18/20/24, 16/18/22) em `packages/tokens/src/contract.json`,
    `packages/themes/default/src/theme.json`, `docs/token-foundation.md`
    (tabela + parágrafo, semantic 103); `text-field` escreve
    `--slotted-control-inner-size` nos adornos, `multi-select` e `tags-input`
    na fila de chips; `kbd` e `tag` lêem-na como altura (linha e inset
    derivados). Medido: kbd 24/20/18 em campos 34/28/26; chip 24/20/18.
    Decisão no briefing; R2 (clear etc.) pendente em `docs/build-order.md`.
    Testes: styles 1144/1145 (`page-header`, outra faixa), foundation
    143/144 (`control-font-family`, anterior), React kbd/tag/text-field/
    multi-select/tags-input 158/158. Dist de tokens e tema reconstruídos; o
    Vite de :6006 precisou de um toque nos ficheiros para os reler.

## Tarefa em curso

**Gate de release** (passo 14) entregue. Pendente antes dos commits: reinício
do Storybook Angular (:6007, pid 364529 de 14/09, "Unexpected token
'export'" em todas as páginas) e leitura/auditoria das duas páginas Angular.
Scripts de captura em `$S/../{console,crop,eval}-scratch.mjs` (fora do repo).

## Decisões tomadas nesta fatia

- Valor de `filter-bar` = `FilterGroup` (árvore) com folhas = descritor de
  `table`; primeiro nível como mapa (`ruleFor`/`withRuleFor`).
- Raiz `role=search`, `bar` `role=toolbar`, `chips` `role=grid`: três paradas.
- Construtor em `drawer` em toda a largura; pills em `popover`.
- Sticky: o binding escreve `--slotted-page-sticky-top` (soma) no elemento pai
  e o valor lido de volta na própria raiz; sem propriedade nova de runtime.
- Partes de outras famílias que selecionam a própria raiz (`text-field`,
  `select`) ficam embrulhadas na parte desta família; `button` e `tag` levam a
  parte desta família diretamente (`button.css` não seleciona `data-part=root`).
- `code-block`: tokens entram, HTML nunca; 12 escopos; corpo = `scroll-area`;
  `pressed` para wrap, `revealed` para colapso.

## Problemas conhecidos

- `[data-part='chip'][data-folded]` esconde com `display:none`: dobra, não
  truncagem — registar na autoavaliação.
- A raiz do construtor é portalizada: leva `data-ui="filter-bar"
  data-part="builder"` e os locais `--_*` são declarados em `[data-ui='filter-bar']`
  para ambos.

## Próxima ação executável

```bash
export PATH="$(ls -d ~/.nvm/versions/node/v$(cat .node-version)*/bin | tail -1):$PATH"
# depois do reinício de :6007 (autorizado pelo utilizador):
node tools/harness/audit.mjs "http://localhost:6007/iframe.html?viewMode=docs&id=components-filterbar--reference"
node tools/harness/audit.mjs "http://localhost:6007/iframe.html?viewMode=docs&id=components-codeblock--reference"
# passo 15: commits por passo (core, styles, react, angular, docs, checkpoint), caminhos explícitos
```
