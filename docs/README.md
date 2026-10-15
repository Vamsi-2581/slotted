# docs

A raiz de `docs/` contém só a lei: o que vale para toda família e é carregado
pela skill `/component`. Cada subdiretório tem uma classe de leitura própria.

| Diretório    | Classe      | Regra de leitura                                        |
| ------------ | ----------- | ------------------------------------------------------- |
| `docs/*.md`  | lei         | Vale para toda família. Muda por decisão registada.     |
| `decisions/` | lei         | ADRs. Um ficheiro por decisão, numerado.                |
| `product/`   | contexto    | PRD e posicionamento. Não é backlog.                    |
| `process/`   | operacional | Diz o que executar a seguir. Editado a cada sessão.     |
| `history/`   | histórico   | Regista o que foi feito. Só recebe entradas novas.      |
| `archive/`   | arquivo     | Material de uma fase encerrada. Não é lido nem editado. |

## Lei

| Ficheiro                | Conteúdo                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `build-briefing.md`     | O que não muda entre famílias: ambiente, Storybook, os dois gates, restrições, decisões tomadas. |
| `component-features.md` | Guia de features por família, com nível Core / Extended / Specialized. Origem de todo escopo.    |
| `token-foundation.md`   | Contrato de tokens e valores do tema padrão, por grupo.                                          |
| `state-and-events.md`   | Modos de estado, solicitação com razão, bindings e identidade no DOM.                            |
| `styling.md`            | A camada de cascata `slotted` e a ordem publicada das subcamadas.                                |
| `decisions/0001`        | Uma única camada de cascata de topo.                                                             |
| `decisions/0002`        | Layout do repositório por tipo de conteúdo.                                                      |
| `decisions/0003`        | Internacionalização: catálogo único, gramática ICU, provider por binding.                        |
| `decisions/0004`        | Arquitetura de tematização: tema como módulo, sementes, receita, escopo e regras de tema.        |

## Produto

| Ficheiro             | Conteúdo                                                        |
| -------------------- | --------------------------------------------------------------- |
| `product/prd.md`     | PRD: princípios, não-objetivos, versionamento, acessibilidade.  |
| `product/product.md` | Plataforma, utilizadores, propósito, posicionamento do produto. |

## Operacional

| Ficheiro                                      | Conteúdo                                                                                                       |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `process/build-order.md`                      | Famílias entregues no passe 1, reaberturas prometidas e ondas 9 a 12 com escopo por família.                   |
| `process/build-schedule.md`                   | Rodadas do passe 2: o bloco a colar em cada sessão, o que corre em paralelo e o que nunca corre.               |
| `process/implementation-review.md`            | Passe de revisão 2: triagem por família, regras transversais R1–R7 e itens `[ ]` para o loop.                  |
| `process/implementation-review-log.md`        | Uma entrada por item fechado no passe 2.                                                                       |
| `process/review-prompt.md`                    | Prompt que `scripts/review-loop.sh` entrega a cada sessão do loop de revisão.                                  |
| `process/nexora-vertical-slice-prompts.md`    | Preâmbulo e cinco prompts, um por sessão, para a fatia vertical da demo Nexora (`domain.md` §44, Fase 2).      |
| `process/nexora-inventory-module-prompt.md`   | Prompt do módulo Inventory da demo Nexora, colado depois do preâmbulo de `nexora-vertical-slice-prompts.md`.   |
| `process/nexora-procurement-module-prompt.md` | Prompt do módulo Procurement da demo Nexora, colado depois do preâmbulo de `nexora-vertical-slice-prompts.md`. |
| `process/nexora-finance-module-prompt.md`     | Prompt do módulo Finance da demo Nexora, colado depois do preâmbulo de `nexora-vertical-slice-prompts.md`.     |
| `process/nexora-support-module-prompt.md`     | Prompt do módulo Support da demo Nexora, colado depois do preâmbulo de `nexora-vertical-slice-prompts.md`.     |
| `process/nexora-analytics-module-prompt.md`   | Prompt do módulo Analytics da demo Nexora, colado depois do preâmbulo de `nexora-vertical-slice-prompts.md`.   |

## Histórico

| Ficheiro               | Conteúdo                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `history/build-log.md` | Uma entrada por família ou correção, na ordem em que aterrou, desde 2026-08-31.      |
| `history/designs/`     | Inventário, desenho e autoavaliação por tema. Índice em `history/designs/README.md`. |
| `history/plans/`       | Planos de implementação executados, datados.                                         |

`history/designs/` e `history/plans/` recebem ficheiros novos da skill
`/component` e do fluxo de planeamento; o nome segue `AAAA-MM-DD-<tema>-<tipo>.md`.

## Arquivo

| Ficheiro                                      | Conteúdo                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `archive/build-order-pass-1.md`               | Ondas 0 a 8 com o escopo escrito de cada família.                      |
| `archive/build-schedule-pass-1.md`            | Rodadas 1 a 12.                                                        |
| `archive/implementation-review-pass-1.md`     | Passe de revisão 1: 108 itens, todos fechados.                         |
| `archive/implementation-review-pass-1-log.md` | Log do passe 1.                                                        |
| `archive/autonomous-build-prompt.md`          | Prompt de construção autónoma anterior à skill `/component`.           |
| `archive/codex-craft-skill-prompt.md`         | Prompt de sessão para as tarefas 1–4 do plano da skill de craft.       |
| `archive/codex-token-foundation-prompt.md`    | Prompt de sessão para o plano da fundação de tokens.                   |
| `archive/ui-roadmap-scratch.md`               | Roteiro inicial, anterior ao guia de features e à ordem de construção. |

## Fora de `docs/`

| Localização                | Conteúdo                                                                     |
| -------------------------- | ---------------------------------------------------------------------------- |
| `specs/components/<f>/`    | Contrato público de cada família (`contract.json`) e o teste que o verifica. |
| `demos/nexora/domain.md`   | Domínio e especificação de produto da demo Nexora. Normativo para o backend. |
| `demos/*/LIBRARY-FEEDBACK` | Ledger de defeitos e lacunas do pacote observados a partir de uma demo.      |
| `.claude/progress/`        | Checkpoints de sessão. Artefactos de trabalho, fora do `format:check`.       |
