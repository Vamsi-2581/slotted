# docs

Um arquivo por linha, com a classe que decide como é lido: **lei** vale para
toda família e é carregada pela skill `/component`; **operacional** diz o que
executar a seguir; **histórico** registra o que foi feito e não é editado;
**arquivo** é material de uma fase encerrada.

## Lei

| Arquivo                 | Conteúdo                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `build-briefing.md`     | O que não muda entre famílias: ambiente, Storybook, os dois gates, restrições, decisões tomadas. |
| `component-features.md` | Guia de features por família, com nível Core / Extended / Specialized. Origem de todo escopo.    |
| `token-foundation.md`   | Contrato de tokens e valores do tema padrão, por grupo.                                          |
| `state-and-events.md`   | Modos de estado, solicitação com razão, bindings e identidade no DOM.                            |
| `styling.md`            | A camada de cascata `slotted` e a ordem publicada das subcamadas.                                |
| `decisions/`            | ADRs. `0001` fixa a camada de cascata única.                                                     |

## Operacional

| Arquivo                        | Conteúdo                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `build-order.md`               | Famílias entregues no passe 1, reaberturas prometidas e ondas 9 a 12 com escopo por família.     |
| `build-schedule.md`            | Rodadas do passe 2: o bloco a colar em cada sessão, o que corre em paralelo e o que nunca corre. |
| `implementation-review.md`     | Passe de revisão 2: triagem por família, regras transversais R1–R7 e itens `[ ]` para o loop.    |
| `implementation-review-log.md` | Uma entrada por item fechado no passe 2.                                                         |
| `autonomous-review-prompt.md`  | Prompt que `scripts/review-loop.sh` entrega a cada sessão do loop de revisão.                    |

## Histórico

| Arquivo            | Conteúdo                                                                             |
| ------------------ | ------------------------------------------------------------------------------------ |
| `BUILD-LOG.md`     | Uma entrada por família ou correção, na ordem em que aterrou, desde 2026-08-31.      |
| `history/designs/` | Inventário, desenho e autoavaliação por tema. Índice em `history/designs/README.md`. |
| `history/plans/`   | Planos de implementação da fundação (2026-08-27 a 2026-09-03), executados.           |

## Arquivo

| Arquivo                                       | Conteúdo                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `archive/build-order-pass-1.md`               | Ondas 0 a 8 com o escopo escrito de cada família.                      |
| `archive/build-schedule-pass-1.md`            | Rodadas 1 a 12.                                                        |
| `archive/implementation-review-pass-1.md`     | Passe de revisão 1: 108 itens, todos fechados.                         |
| `archive/implementation-review-pass-1-log.md` | Log do passe 1.                                                        |
| `archive/autonomous-build-prompt.md`          | Prompt de construção autônoma anterior à skill `/component`.           |
| `archive/codex-craft-skill-prompt.md`         | Prompt de sessão para as tarefas 1–4 do plano da skill de craft.       |
| `archive/codex-token-foundation-prompt.md`    | Prompt de sessão para o plano da fundação de tokens.                   |
| `archive/ui-roadmap-scratch.md`               | Roteiro inicial, anterior ao guia de features e à ordem de construção. |
