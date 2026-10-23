# Checkpoint

- Entrada: `/home/dreco/findings.v3` (13 achados). Sem ficheiro de plano: o agrupamento e a ordem abaixo são o plano.
- Branch: main. Base `0770c745` (chore(release): v0.1.0-beta.12).
- Numeração = ordem do bloco no ficheiro de entrada.

## Achados

| N | Bloco | Família |
| --- | --- | --- |
| 1 | utility: `useRovingFocus` | menu / utilitário React |
| 2 | Chart `variant="card"`, `actions` sem margem negativa | chart |
| 3 | docs: `splitter.md/json` sem props | splitter / docs |
| 4 | tokens `-backdrop-filter` em 9 famílias | styles (menu, popover, tooltip, drawer, action-bar, select, combobox, entity-picker, date-picker) |
| 5 | Section header: `data-stuck` e token de fundo | section |
| 6 | Drawer bottom: `history.back()` desfaz navegação | drawer |
| 7 | regra do tema com esquema como primeiro composto não casa | tema / compilador |
| 8 | Drawer bottom: arrasto por transform e fling | drawer |
| 9 | eixo `data-slotted-corners` | tema |
| 10 | TableOfContents sticky: `--slotted-table-of-contents-sticky-inset` | table-of-contents |
| 11 | Section `ground="surface"` divider de ponta a ponta | section |
| 12 | docs `section.md` Anatomy com coluna Parent | section / docs |
| 13 | tokens `--slotted-kbd-surface/border-color/color` | kbd |

## Ordem de execução (fatias de até três achados)

1. 5, 11, 12 — section
2. 10, 2, 13 — table-of-contents, chart, kbd
3. 4, 3, 7 — tokens de backdrop-filter, docs do splitter, regra do tema
4. 9, 6, 8 — corners, drawer histórico, drawer arrasto
5. 1 — roving focus

## Concluído
- Fatia 1: achados 5, 11, 12 (`c07fc36c`).
- Fatia 2: achados 10, 2, 13 (`14ad85e1`).
- Fatia 3: achados 4 (`a4461867`), 3 (`ce5be390`), 7 (`4fce1eca`).
- Fatia 4: achados 6 (`f018c5ff`), 9 (`684dd781`), 8 (`acb3c96b`).

## Estado git
- Branch main, HEAD: ver `git log -1`. Árvore: só este ficheiro.

## Em curso
- Fatia 5, achado 1.

## Testes
- Fatia 1: core sticky-header 48/48; React section unit+browser 20+3; Angular section 14/14; styles section 18/18; agent-docs 215/215; `pnpm check` verde.
- Fatia 2: React browser toc 2/2, chart 1/1, kbd 3/3; unit chart+toc+kbd+section 101/101; styles chart+toc+kbd 38/38; `pnpm check` verde após corrigir o tipo do teste do toc.

- Fatia 3: React browser backdrop-filter 18/18; unit splitter+scroll-area+action-sheet+data-grid docs 97/97; Angular das mesmas famílias 160/160; styles 1710/1710; agent-docs 217/217; theme 101 vitest + 111 node; themes 92/92; `pnpm check` verde.
- Fatia 4: core dismissable-layer 46/46; React drawer browser 3/3 (o novo falha sem a correção); theme vitest 105 + node 111; themes 92/92; React theme browser 1/1 e unit 4/4; Angular theme 2/2; core portal 24/24; agent-docs references+content+skills 117/117; `pnpm check` verde.
- Fatia 4 (achado 8): core extent+presence 97/97 (sheet-motion 8 testes); React drawer unit 61/61, browser drawer+dialog 14/14 (o teste do fling usa os tokens de duração, que o documento de teste não carrega); Angular drawer 51/51; `pnpm check` verde.

## Problemas conhecidos
- Achado 8: o `presence` espera a duração de transição declarada pela camada (raiz), por isso a saída por fling usa essa duração com uma curva bezier de inclinação inicial igual à velocidade da mão; sem tokens de movimento carregados a camada declara 0 e o painel desmonta de imediato (comportamento anterior). O separador só usa o movimento por translate em `side="bottom"` e `mode="overlay"`.
- Achado 6: a correção compara `location.href` com o da entrada; uma troca de localização com a camada aberta (replace de search param) deixa a entrada no histórico, sem passo atrás.
- Achado 9: `standard` é sempre emitido a partir de `base`; corners dependentes reescrevem tokens de `base`/`components` que contêm `var(--slotted-radius-`.
- Achado 3: causa medida = quatro módulos `*.docs.ts` (splitter, scroll-area, action-sheet em React e Angular; data-grid com a chave `dataGrid`) fora da chave do membro do contrato; a verificação nova está em `tools/agent-docs/src/build.test.ts`.
- Achado 7: recusa em vez de compilar para `&`; `data-slotted-density` e `data-slotted-seeds` à frente de um hook seguem aceites.
- `packages/theme/src/generated/contract.ts` está versionado e fica obsoleto quando um `*.tokens.json` ganha token; `pnpm --filter @slotted/theme generate` o atualiza (o gate `pnpm check` não o apanha).
- Decisões do usuário: não rodar `pnpm eval:agent-docs` (agent evals com `claude -p`); não publicar nem soltar release ao concluir os findings (haverá mais ajustes).
- Validação em equori (`pnpm sync:equori`) não corrida em nenhuma fatia; altera `../equori/web`, pede confirmação.
- Achado 2: o teste fixa `--slotted-control-height-sm` e `--slotted-target-comfortable` porque o frame de teste emula toque; com ponteiro grosso o botão do toolbar tem 44px e a margem calculada não o centra (comportamento anterior, fora do achado).
- Achado 13: `outline` e `plain` não leem `--slotted-kbd-surface` (não têm chão); `plain` não lê `--slotted-kbd-border-color`.
- O cache incremental do typecheck (`node_modules/.cache/tsc/root.tsbuildinfo`) produz erros falsos depois de mudanças em `*.tokens.json`; contorno: apagar o ficheiro.

## Próxima ação exata
Achado 1: `useRovingFocus` (React) a partir do modelo de teclado da família menu (`packages/react/src/menu/`); depois, validação em equori (pede confirmação do usuário) e relatório final.
