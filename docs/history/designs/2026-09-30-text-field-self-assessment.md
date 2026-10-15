# `text-field` — autoavaliação (2026-09-30)

Desenho: `2026-09-30-text-field-rebuild-design.md`. Dossiê: `2026-09-30-text-field-reui-dossier.md`.

## Onze dimensões

| # | Dimensão | Evidência | Mudança que mais a melhoraria | Feita |
| - | -------- | --------- | ----------------------------- | ----- |
| 1 | Icons | `Glyph` em `clear`, `copy`/`check`, `reveal`, `caps-lock` (React `text-field.tsx`, Angular `text-field.ts`); `glyph-element.test.mjs` verde | Glifo `caps-lock` próprio em vez de só o Lucide | Sim: `arrow-big-up-dash` entra no manifesto como `caps-lock` |
| 2 | Motion | Entrada/saída de `busy`, `caps-lock`, `clear`, `copy` por `@starting-style` + `[hidden]` com `allow-discrete`; marca trocada entra de `scale 0.8`; reduce → 0.001 s (`slotted-light-420-motion-reduce.json`) | Saída da marca trocada | Não: o elemento antigo sai no mesmo quadro; um cruzamento exigiria dois elementos sobrepostos por marca |
| 3 | Responsiveness | Cena `narrow` a 240 px: o valor cede largura, adornos e botões fixos | Esconder `action` rotulada abaixo de uma largura | Não: a família não declara contentor; a decisão pertence ao consumidor |
| 4 | Refinement | Capturas base (6 combinações), foco em `action`/`copy` claro e escuro; inserção concêntrica 4/4 em `md` | Raio interno 2 px a `md` fica quase quadrado; um raio próprio para o botão interno | Não: seguir a fundação (`--slotted-radius-xs`) mantém a regra concêntrica sem literal |
| 5 | Tokens | `text-field.tokens.json` igual ao que a folha lê (`tokens.test.mjs` verde); três tokens novos: `action-label-color`, `caps-lock-color`, `copy-complete-color` | — | — |
| 6 | Patterns | Sem padrão APG para textbox; Menu Button via `menu` no `action` (desenho § 2) | Teste de teclado do gatilho de menu dentro da moldura | Não: coberto pelos testes de `menu`; a composição é por `render`/diretiva |
| 7 | Accessibility | `aria-busy`, anúncios de cópia e de Caps Lock pelo `live-announcer`, marcas `aria-hidden`, `[hidden]` tira os botões da ordem de tabulação | Teste com leitor de ecrã real | Não verificável nesta máquina; verificado o anúncio pela API em testes |
| 8 | Native API | React: `onKeyDown`, `onKeyUp`, `onBlur` compostos; `onCopy` nativo intacto (`onValueCopy` à parte); `TextFieldAction` é `ComponentPropsWithRef<'button'>` | — | — |
| 9 | Capability | Inventário § 1: todas as linhas comuns `adopt`/`adapt`/`defer`; `select` aninhado recusado com composição | Faixas `block-start/end` | Adiado para `prompt-composer` (fila, item 2) |
| 10 | Ecosystem | Defaults nos dois bindings; `SlTextFieldAction` repõe `data-part` depois de `slMenuTriggerFor`; `valueCopy` como `output()` | — | — |
| 11 | Documentation | Quatro cenários novos nas duas páginas; `audit.mjs` React 1280/620 sem achados | Página Angular não lida renderizada | Bloqueada: o Storybook Angular (6007) não carrega as histórias novas (ver § Pendências) |

## Craft bar

| Critério | Número |
| -------- | ------ |
| Pixel grid | moldura 34, botão 24, inserção 4 (espécime claro 420) |
| Hover | fundo transparente → rgb(241,245,249) (claro), → rgb(34,34,37) (escuro) |
| Press | fundo → rgb(226,232,240) (claro), → rgb(39,39,42) (escuro), diferente do hover |
| Focus | 2 px sólido, offset −2 px, cor do anel do tema |
| Transition | `background-color`, `color`, `opacity`, `scale`, `display`; sem `all` |
| Motion | entrada `--slotted-easing-enter`, saída `--slotted-easing-exit`, ambas `--slotted-duration-short` |
| Reduced motion | 0.001 s; `spinner` sem animação |
| Disabled | `--slotted-disabled-foreground`, sem opacidade |
| Schemes | alto contraste e `forced-colors` lidos; `caps-lock` fica em `CanvasText` sob cores forçadas, o significado vem do glifo e do anúncio |
| Density e RTL | denso e rtl mantêm a anatomia; `+55` legível em rtl por `unicode-bidi: plaintext` |
| Target size | 24 (halo), 44 em ponteiro grosso; `touch-target.test.mjs`, `inner-control.test.mjs` verdes |
| Intent | cada valor em token ou com razão no comentário da regra |

## Secção 18

- **Anatomia:** `root`, `input`, `start`, `end`, `action`, `busy`, `caps-lock`, `clear`, `copy`, `reveal`.
- **Controlado/não controlado:** `value` e `revealed` com par e razão; `loading` só controlado (a família nunca o muda); `copied` e Caps Lock não são estado do consumidor.
- **Matriz de estados:** `disabled` esconde `clear`, `copy`, `reveal` e tira o hover de `action`; `readonly` esconde `clear` e mantém `copy`; `loading` não desativa; `invalid` mantém o foco retargetado.
- **Densidade e direção:** medidas das escalas de controlo; lados lógicos.
- **Carregamento, vazio, erro, extremos:** `busy` com valor editável; `copy` escondido com valor vazio; área de transferência recusada anunciada; valor longo com reticências e 240 px na cena `narrow`.

## Pendências

- Storybook Angular (6007) responde com "Couldn't find story" para as histórias novas: o índice lista-as, o bundle não. Exige reinício, que pede autorização (briefing › Working beside another session, 5).
- Specs Angular não correm enquanto `field.spec.ts` e `field-group.spec.ts` (outra sessão) não compilarem; a execução anterior às histórias passou todas as specs de comportamento desta família.
