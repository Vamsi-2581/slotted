# `fullscreen` — autoavaliação

Data: 2026-09-24. Desenho e inventário em `2026-09-24-fullscreen-design.md`.

Evidência comum a todas as linhas:

- Testes: contrato 9, core 14 (`fullscreen`) e 17 (`portal`), styles da família dentro de 1491, React 17 (13 de comportamento e 4 da página), Angular 16 (12 e 4).
- Capturas do harness (`tools/harness/out/fullscreen.html`), todas `--at 1000`: light, dark e high-contrast a 420; light a 240; `dense`; `rtl`; foco, hover e active do `trigger` em light e dark.
- `tools/harness/audit.mjs` na página React a 1280 e 620 px: 14 stages, sem achados.
- Página Angular: não lida. O Storybook Angular em 6007 lê os entry points no arranque e não resolve `@slotted/angular/fullscreen` sem reinício.

## 1. Rubrica

| Dimensão               | Estado                                                                                                                                                                           | A mudança que mais melhoraria                                                                                                                        | Feita |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Icons                  | `maximize` e `minimize` do tema, por máscara, tinta do host; `forced-color-adjust: none` sob `forced-colors`. O consumidor substitui a marca pela parte `icon`.                  | Marca e rótulo trocam no mesmo quadro; uma transição de rotação entre as duas marcas seria ruído.                                                    | não   |
| Motion                 | Fade de entrada no passo `short` só na via `layout`; a via nativa tem a transição do agente. Nada se move.                                                                       | Ler o estado anterior e animar a saída; hoje a saída é instantânea nas duas vias.                                                                    | não   |
| Responsiveness         | Inserção `clamp(space-5, 5vw, space-8)` e área segura; o `trigger` cede largura e o rótulo trunca.                                                                              | `iconOnly` automático em contentor estreito; exige consulta de contentor num elemento que o consumidor controla.                                    | não   |
| Refinement             | Chão do tema no `::backdrop`, sem borda nem raio em tela cheia, `outline` com chão próprio sobre conteúdo.                                                                     | Geometria de `layout` `!important` contra a folha não-layered do consumidor: medida no harness, corrigida.                                         | sim   |
| Tokens                 | 50 tokens lidos (`fullscreen.tokens.json`); três de componente: `--slotted-fullscreen-surface`, `-inset`, `-trigger-*`.                                                        | Nenhuma pendente.                                                                                                                                    | —     |
| Patterns               | Button Pattern do APG transcrito no desenho §2; especificação WHATWG §2–§4.                                                                                                     | Nenhuma pendente.                                                                                                                                    | —     |
| Accessibility          | Sem `aria-pressed`; rótulo como nome também com `iconOnly`; `Tab` contido; foco e rolagem restaurados; anúncio de entrada e saída.                                             | `layout` sem `inert`: o cursor virtual alcança a página coberta. A alternativa cala o `live-announcer`.                                              | não   |
| Native API             | `button` e `div` nativos; `ref`, `render`, `type` do consumidor; `onClick` composto e `preventDefault()` recusa.                                                                | Nenhuma pendente.                                                                                                                                    | —     |
| Capability             | Duas vias, erro, `navigationUI`, `webkit`, saída ao desmontar, restauro de contexto, `target` fora da região, documento inteiro, overlays dentro.                              | Portal que segue a tela cheia: sem ele `select`, `menu` e `tooltip` abriam invisíveis. Commit próprio.                                              | sim   |
| Ecosystem integration  | React: provider, hook, context, `render`. Angular: `model()`, `output()` com razão, `exportAs`, `provideFullscreenDefaults()`, `HostAttributeToken` para `type`.            | `chart` passar a ler `@slotted/core/fullscreen`; reabertura registada.                                                                               | não   |
| Documentation          | Duas páginas com 11 cenas cada, import, anatomia, entradas, saídas, composição e acessibilidade.                                                                                | Ler a página Angular renderizada depois do reinício do Storybook 6007.                                                                               | não   |

## 2. Secção 18 do guia

- **Anatomia:** `root` (região), `trigger` (controle, com `data-ui` próprio), `icon`, `label`.
- **Controlado e não controlado:** React `fullscreen`/`defaultFullscreen`/`onFullscreenChange(value, request)`; Angular `[(fullscreen)]` com `fullscreenChangeRequest` cancelável e `defaultFullscreen`. Razões `pointer`, `keyboard`, `escape`, `programmatic`. A saída nativa já aconteceu quando o pedido chega; um consumidor que a recusa fica na via `layout`.
- **Matriz de estados:** `default`, `hover`, `active`, `focus-visible`, `disabled` e `fullscreen` no `trigger`; `fullscreen` com `data-mode` na região. `disabled` vence `hover` e `active`.
- **Densidade e direção:** o `trigger` lê a escala de controle; a região em tela cheia usa só propriedades lógicas, e a área segura física entra simétrica nas duas bordas inline.
- **Loading:** não se aplica; o pedido nativo resolve num quadro e a via `layout` é síncrona.
- **Empty:** a região sem conteúdo em tela cheia é o chão do tema com a inserção.
- **Error:** `unsupported` e `refused` emitidos; a região entra em `layout` e o estado não mente.
- **Conteúdo extremo:** rótulo traduzido longo trunca com reticências e fica inteiro no nome; conteúdo mais alto que o ecrã rola dentro da região com `overscroll-behavior: contain`.
- **SSR:** nenhum acesso ao `document` no render; `supported` é `false` até montar.
- **Verificável só em máquina real:** a tela cheia nativa num navegador (jsdom não tem a API), o comportamento no iPhone (sem API de elemento, cai em `layout`) e o anúncio num leitor de ecrã.
