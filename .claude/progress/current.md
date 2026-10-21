# Checkpoint

- Plano: sem arquivo de plano; quatro itens colados pelo usuário (command-palette ×2, dialog keyboard inset, drawer forced layouts).
- Branch: main. HEAD: fc1b84e3 (fix tabs marker). Working tree: tudo em commit (fcb5c503..bd1f021a), enviado para origin/main.

## Concluído
1. command-palette: mousedown fora do input não tira o foco (React `onMouseDown` composto no root; Angular `keepFocus`). Teste browser React `packages/react/src/command-palette/command-palette.browser.test.tsx` (mouse e touch via CDP) falha antes, passa depois; spec Angular jsdom equivalente.
2. command-palette: pointermove de touch não destaca; destaque por ponteiro não chama scrollIntoView (id guardado em `pointerHighlight`). Testes React unit + spec Angular falham antes, passam depois.
- Infra: `packages/react/vitest.config.ts` com projetos `unit` (jsdom) e `browser` (Chromium 412×915, hasTouch); scripts `test` = `--project unit`, `test:browser`; `verify` inclui `test:browser`; CI instala Chromium; devDeps `@vitest/browser-playwright@4.1.11`, `playwright@1.63.0`; helper `src/test/press.ts`; `src/test/setup.browser.ts`.

3. dialog: layer com fullScreen != never (ou fullscreen ativo) liga `observeKeyboardInset` e escreve `--slotted-keyboard-inset` no root (React `dialog-parts.tsx`, Angular `dialog.ts`); CSS acolchoa o content (border-box + padding-block-end) nas regras full-screen. Teste browser `dialog.browser.test.tsx` falha antes (915 vs 655), passa depois; unit React + spec Angular do binding falham antes, passam depois.

4. drawer: zero layouts forçados na abertura. Core: `measure/after-layout.ts` (lote por documento após o layout: leituras, depois escritas; síncrono sem ResizeObserver); scroll lock lê a scrollbar e escreve depois do layout; focus-scope entra (focus com preventScroll) depois do layout e usa `checkVisibility`; `observeKeyboardInset` faz a 1ª leitura depois do layout. React/Angular drawer: posição de repouso medida só no ResizeObserver. Teste `packages/react/src/drawer/drawer.perf.browser.test.tsx` (config própria `vitest.perf.config.ts`, React de produção, CPU 4x, retry 2): antes 2 layouts forçados e quadros 50–83 ms; depois 0 e ≤50 ms.
- `pnpm dedupe` aplicado (duas variantes de vitest no mesmo programa TS).

## Testes
- core 2210/2210; React unit 4102/4102, browser 3/3, perf 1/1; Angular completo 3231/3231; `pnpm check` exit 0.

## Problemas conhecidos
- Quadro de 66 ms ocasional no teste perf (ruído; retry 2 cobre).

## Próxima ação exata
Release pedida pelo usuário: aguardar CI verde no HEAD (`gh run list --branch main --limit 1`), `pnpm release --dry-run`, mostrar ao usuário, `pnpm release`.
