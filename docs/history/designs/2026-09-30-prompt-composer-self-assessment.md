# `prompt-composer` — autoavaliação (2026-10-01)

Desenho: `2026-09-30-prompt-composer-design.md`. Dossiê: `2026-09-30-prompt-composer-reui-dossier.md`.

## Onze dimensões

| # | Dimensão | Evidência | Mudança que mais a melhoraria | Feita |
| - | -------- | --------- | ----------------------------- | ----- |
| 1 | Icons | `Glyph` em `attach` (`paperclip`) e `submit` (`arrow-up`, `stop`, `rotate-ccw`); `spinner` partilhado; nenhuma marca pintada pela folha | — | — |
| 2 | Motion | Fundo e sombra em `--slotted-duration-medium`; marca do envio entra de `scale 0.8`; seta sobe 1 px no hover; pressão `scale 0.9`; borda de largar com entrada e saída de opacidade | Crescimento suave da altura do valor | Não: `field-sizing` não transiciona a altura intrínseca; medir em script contraria a regra de `textarea` |
| 3 | Responsiveness | 240 px lido: o rodapé não quebra, a faixa de anexos rola | Esconder ações rotuladas abaixo de uma largura | Não: a decisão é do consumidor |
| 4 | Refinement | Raio derivado `botão / 2 + folga` (22 em `md`), texto alinhado à tinta do clipe, borda de largar a meia folga | Linha cortada pelo rodapé quando o valor rola | Não: máscara de esvanecimento exige `scroll-state` ou animação por rolagem, ainda sem suporte geral |
| 5 | Tokens | `prompt-composer.tokens.json` igual ao lido (`tokens.test.mjs` verde); raio derivado documentado na regra | Token de raio `xl` na fundação | Não: o raio derivado é a regra; um passo novo da escala decide-se na fundação |
| 6 | Patterns | Sem padrão APG; `form` nativo; Menu Button pela família `menu` | — | — |
| 7 | Accessibility | Nome do envio por estado; `aria-disabled` em `submitted`; anúncios `Sending`/`Stopped`; guarda IME; anexos com `attachment` | Teste com leitor de ecrã real | Não verificável nesta máquina |
| 8 | Native API | React: `form`, `textarea`, `button` com `ComponentPropsWithRef`; `onSubmit`, `onKeyDown`, `onPaste`, `onDrop` compostos | — | — |
| 9 | Capability | Inventário § 1: comuns adotadas; lista de anexos recusada com composição | Histórico com ArrowUp (editar a última mensagem) | Não: composição com `onKeyDown` no `PromptComposerInput`; dono é a aplicação de chat |
| 10 | Ecosystem | Angular: `ControlValueAccessor` no `textarea`, `providePromptComposerDefaults`, `exportAs`; React: provider, `render` | — | — |
| 11 | Documentation | Dez cenários nas duas páginas; `audit.mjs` React 1280/620 sem achados | Ler a página Angular renderizada | Bloqueada: o Storybook Angular (6007) arrancou antes da família e serve os ficheiros sem compilar decoradores; exige reinício |

## Craft bar

| Critério | Número |
| -------- | ------ |
| Pixel grid | moldura 64 (`raised`, uma linha), botões 28, envio 28, inserção 8 |
| Hover | ação: fundo → rgb(241,245,249); envio: rgb(29,78,216) → rgb(42,91,220) |
| Press | ação: → rgb(226,232,240); envio: → rgb(30,58,138) e `scale 0.9` |
| Focus | 2 px sólido; para dentro nas ações, para fora no envio |
| Transition | listas explícitas; sem `all` |
| Motion | entrada `--slotted-easing-enter`, saída `--slotted-easing-exit`, `--slotted-duration-short` |
| Reduced motion | durações do tema a 1 ms; `spinner` parado |
| Disabled | `--slotted-disabled-foreground` sobre `--slotted-disabled-background`, sem opacidade |
| Schemes | alto contraste lido; a borda tracejada desaparece sem tema em vez de cair numa cor de sistema |
| Density e RTL | denso (`status`) e rtl (`default`) lidos depois da passagem premium; `unicode-bidi: plaintext` no valor |
| Target size | 28 px; halo de 44 px em ponteiro grosso sem cruzar vizinhos |
| Intent | cada valor em token ou com razão na regra |

## Secção 18

- **Anatomia:** `root`, `header`, `input`, `footer`, `action`, `attach`, `submit`.
- **Controlado/não controlado:** `value` com par e razões `keyboard` e `submit`; `status` e anexos do consumidor.
- **Matriz de estados:** `disabled` e `readonly` retiram o clipe e o envio; `submitted` ocupa o envio e recusa Enter; `streaming` troca o envio por parar; `error` por tentar de novo; `invalid` mantém o foco retargetado; `drop-target` só com ficheiros.
- **Carregamento, vazio, erro, extremos:** envio desativado com valor vazio salvo `canSubmit`; ficheiros recusados em `rejected`; valor longo rola em `maxRows`.

## Pendências

- Storybook Angular (6007) precisa de reinício para compilar `packages/angular/prompt-composer`.
