# Autoavaliação — barra de espera na borda

Desenho: `2026-10-05-edge-progress-design.md`. Famílias: `progress-indicator` (`placement="edge-start" | "edge-end"`), `app-shell` (part `progress`), `page-header` (part `progress`).

## Evidência

| Fonte | Conteúdo |
| --- | --- |
| Harness | `tools/harness/out/progress-indicator.html` (`edge`), `tools/harness/out/app-shell.html` (`progress`, `progress-overlay`), `tools/harness/out/page-header.html` (`progress-default`, `progress-snapped`, `progress-minimal`, `progress-loading`) |
| Medição `app-shell` | 24 arranjos a 1280 px, LTR e RTL: moldura − `main` = 0 nos dois lados, raio igual; topo da barra = linha de separação (0 px), `panel/banner` 1 px acima de `main`, sobre a borda do cartão |
| Medição `page-header` | Com tabs: barra `[364, 366]`, linha `[365, 366]`; `controls.top` 365 e raiz 374 com e sem barra. Sem tabs: raiz 55, barra termina em 101 = fundo da linha fina |
| Testes | contratos e estilos 438/439 (falha `kbd`, em HEAD); React 141/141; Angular 96/96; `pnpm test:i18n` 0 violações |
| Páginas | `components-app-shell--reference`, `components-pageheader--reference`, `components-progressindicator--reference` em 6006 e 6007, lidas a 1280 e 620 px; `audit.mjs` sem constatações nas cenas desta tarefa |

## Craft bar

| Critério | Número | Resultado |
| --- | --- | --- |
| Pixel grid | barra `sm` 2 px; moldura do `page-header` 1 px | passa |
| Hover, Press, Focus, Target size | nenhuma parte interativa; `focusable` falso em barra e molduras | não se aplica |
| Transition | `transition-property`: `clip-path`, `opacity` (mais os dois percentuais); durações `--slotted-duration-medium`/`-short` | passa |
| Motion | entrada 200 ms `--slotted-easing-enter`; saída 120 ms `--slotted-easing-exit`; saída ≤ entrada | passa |
| Reduced motion | durações 0,001 s; `animation-name: none` em todos os ciclos; restam `flatten-*` pausadas | passa após a correção de especificidade |
| Disabled | não se aplica | — |
| Schemes | forced colors: trilho transparente, `outline: none`, indicador `Highlight`; high-contrast capturado | passa |
| Density e RTL | `dense`: 2 px, mesma posição; RTL: 24/24 molduras iguais, valor a partir do início em linha | passa |
| Intent | literais: `inset(0 0 100% 0)`/`inset(100% 0 0 0)` e `0px` de elevação, com razão no comentário da regra | passa |

## Lentes

| Antes | Depois | Porquê |
| --- | --- | --- |
| `transform: scaleY(0)` | `clip-path: inset(0 0 100% 0)` | a raiz contém o rótulo; `R7` recusa escala sobre texto |
| barra na aresta da raiz do `page-header` | linha de grelha `full` antes de `tabs` | na aresta lia-se como indicador da tab selecionada |
| `animation: none` a 0,2,0 | `animation: none !important`, excepto `path` | nenhum ciclo parava com movimento reduzido |

## Onze dimensões

| Dimensão | Mudança que mais melhora | Feita |
| --- | --- | --- |
| Icons | Nenhuma: as três partes não desenham ícone | — |
| Motion | Crescer e recolher a partir da aresta por recorte | sim |
| Responsiveness | Medir no browser as duas gémeas da consulta `< 600px` antes de `navMode` ser escrito | não: é o estado de um único frame antes da medição; o teste de espelhamento cobre a regra |
| Refinement | Levar a barra do `page-header` para a linha da pílula | sim |
| Tokens | Token próprio de espessura para a borda | não: o eixo `size` já fornece 2, 4 e 8 px |
| Patterns | Ligar `aria-busy` ao estado desenhado e não à prop | sim |
| Accessibility | Verificar o anúncio com leitor de ecrã real | não: indisponível nesta máquina; verificados papel, nome e `aria-busy` no DOM |
| Native API | Inputs Angular `wave`, `showValue`, `format`, `locale`, `hideLabel` nos parts | não: os parts expõem os inputs que uma barra de borda usa; React passa todas as props por spread |
| Capability | Varredura de conclusão | recusada (desenho §1.2) |
| Ecosystem integration | Utilitário Angular de router para `signal` | não: snippet de duas linhas na página |
| Documentation | Demonstração com movimento reduzido ligado | não: o comportamento está nos especímenes |

## Secção 18

- **Anatomia:** `progress` em `app-shell` (moldura sobre `main`) e em `page-header` (linha de grelha); barra `edge-start`/`edge-end` em `progress-indicator`.
- **Controlado e não controlado:** não há estado mutável; `loading` e `value` são do consumidor. O shell guarda só `busy`, derivado do estado desenhado.
- **Matriz de estados:** retida (`hidden`, antes de `delay`) → desenhada → mantida (`minDuration`) → retirada; cada uma indeterminada ou determinada; `tone="danger"` para erro.
- **Precedência:** `page-header` com `loading` ou dentro de `[aria-busy='true']` não desenha a barra.
- **Densidade e direção:** espessura igual nas três densidades; percurso e valor seguem `inset-inline-start`.
- **Conteúdo extremo:** o rótulo é sempre recortado; uma navegação interrompida não reinicia a barra.

## Fora desta tarefa

- `field-surface.test.mjs` falha em `kbd` em HEAD (`2e39b9d4`).
- `page-header.css` e `page-header.styles.test.mjs` têm alterações de outra sessão (grelha do título); `audit.mjs` aponta `title-row` a transbordar nas cenas existentes do `page-header` e o botão «Reprovar» aparece em coluna.
- `audit.mjs` aponta anéis `collapsed` nas cenas `Bare`, `contained` e `The ring beside the control` do `progress-indicator`, que esta tarefa não alterou.
