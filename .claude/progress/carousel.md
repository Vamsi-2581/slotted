# Checkpoint — carousel (`/component carousel` + `/reui carousel build`)

- Plano: `docs/history/designs/2026-10-01-carousel-design.md` (inventário, padrão, anatomia, estado, integração, motor).
- Ramo `review/implementation-pass-1`. Outras sessões editam o tree (color-picker, combobox, entity-picker, multi-select…): registos partilhados só por `git apply --cached` do próprio hunk.
- Autonomia total pedida pelo utilizador: os dois gates são registados, não esperados.

## Concluído

- Passos 1–5: lei lida; survey (APG, Zag, Fluent, shadcn/ReUI, Splide, CSS Overflow 5, M3); espécimes ReUI em `tools/harness/out/specimen/`.

- Passo 6: `playback` no schema (commit c/ hunk próprio feito); contrato e teste (17/17).
- Passos 7–9: `carousel.css`, tokens, harness (gerado por `scratchpad/harness.py`), capturas e espécimes; gate visual registado em §10 do desenho.
- Registos partilhados editados na working tree com blobs HEAD+hunk preparados em scratchpad: `head_rt` (runtime-properties), `head_tt` (tokens.test), `head_sp` (styles/package.json), `head_ts` (text-scale.test).

- Passo 10a: núcleo `packages/core/src/carousel` (21 testes); registos `head_cp`, `head_cv`.
- Passo 10b: React `packages/react/src/carousel` (20 testes); registos `head_rp`, `head_rv`, `head_ri`.

- Passo 10c: Angular `packages/angular/carousel` (16 testes, incl. stories spec).
- Passo 11: páginas React e Angular escritas; lidas renderizadas em Storybooks próprios (6016 React, 6017 Angular — iniciados por esta sessão, parar no fim); `audit.mjs` limpo a 1280 e 620 nos dois.

## Em curso

- Passo 12: `pnpm check:affected`; depois autoavaliação (passo 13), dossiê ReUI, entrada em `build-order.md`, `designs/README.md`, commits com blobs HEAD+hunk.

## Próxima ação

`pnpm check:affected` e corrigir o que for da família.
