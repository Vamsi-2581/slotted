# `action-sheet` sobre `drawer` — autoavaliação

Data: 2026-09-25. Âmbito: a recomposição descrita em
`2026-09-25-action-sheet-on-drawer-design.md`. O resto da família mantém
`2026-09-24-action-sheet-self-assessment.md`.

## Evidência

| Tipo                           | Onde                                                                                                                                                                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contrato                       | `specs/components/action-sheet/contract.test.mjs`, 18/18                                                                                                                                                                                              |
| React                          | `action-sheet`, `drawer` e os dependentes de `drawer`, 190/190                                                                                                                                                                                        |
| Angular                        | `action-sheet` e `drawer`, 62/62, com um tsconfig restrito às duas famílias: o `ng test` do projeto não compila por erros em `dashboard-grid`, obra de outra sessão                                                                                   |
| Capturas do harness            | as seis cenas a 420 claro; `share` a 720; `long` a 240 escuro; foco no item em claro, escuro e alto contraste; Cancelar premido em escuro                                                                                                              |
| Cenário no navegador           | React e Angular, 5/5 cada: a folha mede 512 px; o foco entra na primeira ação; o Cancelar fecha e devolve o foco ao gatilho; um arremesso fecha com a razão `pointer`; `modal={false}` não pinta scrim e a página responde por baixo                     |
| Audit das páginas              | 6006 e 6007 a 1280 px, sem achados                                                                                                                                                                                                                    |

## O que o trabalho encontrou fora da família

- **Fundação:** o passo `--slotted-tone-secondary-subtle-hover` do escuro estava 0,005 de
  luminosidade OKLab acima da superfície elevada, e o item em destaque de menus, listas e
  folhas era invisível. Passou a `#222225`; `theme-conformance` exige 0,02.
- **`drawer` React:** o efeito da camada dependia do objeto de contexto inteiro, e cada
  render com a folha aberta recriava o âmbito de foco e relia a origem de dentro do
  painel. Passou a depender só dos valores que decidem a camada.
- **`drawer`, os dois bindings:** o âmbito de foco era destruído antes da camada, e a
  devolução do foco acontecia com o gatilho ainda `inert`; sem origem (um clique no
  Safari não foca o botão) o foco voltava ao `body`. A camada sai primeiro, e a origem
  `body` devolve ao gatilho.
- **`drawer` Angular:** ganhou o getter `panel` e `initialFocus` por função, que o React
  já tinha.

## Dimensões

| Dimensão            | Mudança nomeada                                                                                                                                                                  | Feita |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1. Ícones           | Nenhuma: os ícones são do consumidor, e o anel de carregamento é o `spinner`                                                                                                      | —     |
| 2. Movimento        | O press do Cancelar desce 1 px e perde a elevação, a linguagem de `button`; o item muda de passo de destaque, a de `menu`                                                         | sim   |
| 3. Responsividade   | A medida da família (32 rem) atravessa para o painel de `drawer`, em vez de ceder aos 40 rem das folhas genéricas                                                                 | sim   |
| 4. Refinamento      | As linhas da lista ficam um passo dentro das arestas da folha, com o raio do controlo, e o anel segue o canto em vez de encostar à aresta                                          | sim   |
| 5. Tokens           | Raio, superfície e scrim próprios saem; ficam medida, destaque, regra e rodapé                                                                                                    | sim   |
| 6. Padrões          | Dialog (Modal) e Menu inalterados; o painel com `role="dialog"` passa a ser o de `drawer`, nomeado pelo título da família                                                          | —     |
| 7. Acessibilidade   | O foco volta ao gatilho depois de qualquer fecho, também quando o clique não o focou                                                                                              | sim   |
| 8. API nativa       | O Angular não tem como injetar o `drawer` no conteúdo projetado; a ligação faz-se por sinais do componente. Um `provide` do `drawer` a partir da action sheet foi considerado e não serve, porque o `drawer` só existe depois da vista | não   |
| 9. Capacidade       | Arrastar para fechar e o teclado virtual passam de recusados a presentes, por composição                                                                                         | sim   |
| 10. Integração      | `onOpenChange` e `openChangeRequest` recebem também os pedidos do `drawer`, com o cancelamento propagado                                                                          | sim   |
| 11. Documentação    | Anatomia, snippets de DOM e de tema, eventos e acessibilidade descrevem a composição; o snippet de tema escreve a medida em `:root`, onde o painel a lê                            | sim   |

## O que esta máquina não verifica

Um ecrã tátil físico e um leitor de ecrã real. No lugar: toque emulado pelo protocolo
DevTools e a leitura das relações ARIA nos testes dos dois bindings.
