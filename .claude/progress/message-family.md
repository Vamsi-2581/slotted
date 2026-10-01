# Checkpoint — /reui build: par `message` + `message-scroller`

- Plano: `/reui build (with /component) message/bubble, message scroller, etc.`; desenho `docs/history/designs/2026-09-30-message-design.md`.
- Estado: concluído. Ramo `review/implementation-pass-1`. Commits:

  | Commit | Conteúdo |
  | --- | --- |
  | `b8439922` | glifo `check-check` |
  | `7782382f` | propriedades de runtime |
  | `73de3e59` | primitivo do workbench |
  | `83224f64` | as duas famílias |

- Testes da família a passar. `turbo verify --affected` falha só fora destas famílias:

  | Falha | Origem |
  | --- | --- |
  | cobertura dos Storybooks | `cascader` |
  | estouro de pilha | `multi-select` |
  | testes | `dialog`, `table`, `text-field` |
  | estilos | `kbd`, `cascader` |

- Problemas conhecidos:
  - Saída animada de uma mensagem removida.
  - 6006 precisa de reinício para mostrar as stories novas.
- Próxima ação: nenhuma.
