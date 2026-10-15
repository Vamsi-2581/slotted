# Plano — páginas de componente do site de documentação

Desenho de base: `docs/history/designs/2026-10-01-docs-site-design.md` (runtimes, plano B do Angular, paridade de DOM). Produto: `apps/docs/PRODUCT.md`. Checkpoint: `.claude/progress/docs-pages.md`.

Decisões do usuário (2026-10-05): os exemplos Angular executam Angular; cada página é detalhada, com demos em número proporcional à complexidade da família, uso, acessibilidade e API; página única longa com índice lateral, prévia e código por demo, API na própria página; uma skill fixa o processo por família.

Estado de partida: 1 de 124 famílias com página (`field`, só React); `astro build` passa quando `@slotted/react` e `@slotted/angular` estão construídos (o turbo já declara `@slotted/docs#build` dependente dos dois).

## Anatomia de uma página

1. Abertura: o que a família é, quando usar, quando usar a vizinha; demo principal.
2. Instalação e import do framework selecionado.
3. Anatomia: partes e composição (de `*.docs.ts` › `anatomy`).
4. Demos por capacidade: variantes, tamanhos, estados, composição, controlado e não controlado, carregamento e erro onde existem. Cada demo: prévia executando no framework selecionado, código copiável, menu de esquema e densidade.
5. Receitas: fluxos completos de produto (ex.: filtro de lista, edição em linha).
6. Acessibilidade: teclado, papéis e anúncios (de `specs/components/<family>/contract.json`).
7. API por framework: props, eventos, partes (de `*.docs.ts` › `ApiRow`, `EventRow`, `AnatomyRow`; verificado contra os tipos).
8. Tema: tokens da família (`packages/styles/src/<family>/<family>.tokens.json`) com o valor resolvido.

Faixas de demos: simples 5–8; média 10–15; complexa 20–40 com receitas. Toda demo existe em React e Angular, em inglês, com conteúdo de produto, código autossuficiente, e o DOM das duas é idêntico em `data-ui`, `data-part`, `role` e `aria-*`.

## Fatia 1 — runtime Angular

1. Integração de `@analogjs/vite-plugin-angular` no Vite do Astro: HTML do build por `@angular/platform-server`, montagem no cliente por `createApplication` + `createComponent({ hostElement })`. Aceite: `examples/angular/field/basic.ts` gera `data-ui="field"` no HTML do build e responde a input no navegador. Falha → plano B do desenho, decidido com o usuário.
2. Seletor de framework habilitado; a página `/angular/components/field/` renderiza os exemplos Angular.
3. Teste de paridade de DOM entre os dois `render(id)` de cada exemplo. Aceite: `field` passa; uma divergência injetada falha.

## Fatia 2 — modelo de página

4. `Example` com abas Preview, Code e o seletor de framework herdado da página; altura reservada pela prévia do build.
5. Seções geradas: API (de `*.docs.ts`), Acessibilidade (do contrato), Tema (dos tokens), Anatomia. Um MDX por família guarda só o texto editorial e a ordem das demos.
6. Verificações: toda família com MDX tem as seções geradas; todo exemplo renderiza nas duas bindings sem erro de console (cenário Playwright nomeado).

## Fatia 3 — skill e pilotos

7. Skill `docs-page` em `.claude/skills/`: inventário a partir de `*.docs.ts` e das histórias, roteiro de demos por faixa, padrão de conteúdo, escrita nas duas bindings, verificações, revisão visual em claro, escuro, `dense` e 390 px, triagem de defeitos de pacote (`LIBRARY-FEEDBACK.md`).
8. Pilotos completos: `button` (média), `field` (média), `combobox` (complexa). Aceite do usuário antes de seguir.

## Fatias seguintes

Uma a três famílias por fatia, pela ordem de uso: formulários (text-field, select, checkbox, radio-group, switch, textarea, number-field, date-picker), coleções (table, data-grid, list, tree), sobreposições (dialog, drawer, popover, menu, tooltip, toast), navegação e moldura (tabs, side-navigation, top-navigation, app-shell, page, page-header), demais. Busca Pagefind e revisão do `llms.txt` quando a primeira dezena estiver publicada.
