# cascader — autoavaliação

Desenho e decisões: `2026-09-30-cascader-design.md`. Contrato: `specs/components/cascader/contract.json`.

## Onze dimensões

| Dimensão | Estado | Mudança que mais a melhora | Feita |
| --- | --- | --- | --- |
| Icons | `Glyph` em todas as marcas (chevron do controlo, chevron do ramo `directional`, check, traço, lupa, cruz); nenhum desenhado em CSS | Glifo próprio para o ramo carregado sem filhos | Não: o `empty` da coluna diz-o em palavras |
| Motion | Camada com entrada por keyframe `--slotted-duration-medium`/`--slotted-easing-enter` e saída por transição `--slotted-duration-short`/`--slotted-easing-exit`; marca do nó com `opacity` e `scale` 0.8 → 1; colunas sem animação (teclas repetidas) | Entrada de coluna quando aberta por ponteiro | Não: o mesmo estado é alcançado por `ArrowRight` repetido, e a regra de teclas repetidas prevalece |
| Responsiveness | `layout="auto"`, `cascaderFit`, janela deslizante, breadcrumb numa linha com dobra; capturas a 720, 420 e 240 | Recalcular a janela ao redimensionar a janela com o popup aberto | Parcial: as colunas encolhem juntas até à medição seguinte |
| Refinement | Coluna 1 alinhada ao texto do controlo; partes emolduradas com altura inteira em comfortable e dense; caminho em semibold | Gap entre um segmento com reticências e o separador seguinte | Não: a reticência ocupa o fim da caixa de `min-inline-size` |
| Tokens | 99 tokens declarados, todos em `cascader.tokens.json`; `--slotted-cascader-depth` como propriedade de runtime | Fundo do caminho por esquema no tema | Não: o peso semibold cobre o alto contraste sem tocar no tema |
| Patterns | Combobox com popup `tree` (APG); uma partida escrita no contrato (setas verticais na coluna) | Typeahead também com pesquisa ativa sobre os resultados | Não: com pesquisa, os caracteres pertencem ao campo |
| Accessibility | `aria-level`, `aria-posinset`, `aria-setsize`, `aria-expanded`, `aria-selected`/`aria-checked` (`mixed`), `aria-busy` na coluna, `status` com contagem, foco por `aria-activedescendant` | Teste com leitor de ecrã real | Não verificável nesta máquina |
| Native API | `button` nativo no controlo; props nativas na raiz (React); `HostAttributeToken` para `name` (Angular) | `render` por parte em React | Não: o conteúdo do nó e do valor substitui-se por `renderNode`/`renderValue` e templates |
| Capability | Três layouts, seleção simples e múltipla com `checkedStrategy`, `selectable`, pesquisa profunda, carga preguiçosa com `AbortSignal`, falha com repetição, lista plana, painel embutido, formulário | Pesquisa remota pelo adaptador de `entity-picker` | Não: recusada com composição escrita no contrato |
| Ecosystem integration | `CascaderDefaultsProvider`/`provideCascaderDefaults()`; `ControlValueAccessor` + `Validator` (`required`, `unresolved`); inputs escondidos em React; sinais e `OnPush` | `aria-describedby` do `Field` também em Angular | Não: o binding Angular não lê um campo envolvente |
| Documentation | Duas páginas de referência com 14 cenas cada, API, eventos, composição, acessibilidade; `audit.mjs` sem achados a 1280 e 620 nas duas | Captura de cada cena em escuro na página | Não |

## Barra de craft

| Critério | Número | Fonte |
| --- | --- | --- |
| Pixel grid | nenhuma parte emoldurada com altura fracionária (comfortable, dense) | `tools/harness/out/specimen/cascader/slotted-light-720*.json` |
| Hover | `clear` ΔL +0.032 claro, −0.065 escuro, +0.075 alto contraste; nó: o ponteiro move `data-current` (cursor com fundo e anel); controlo: a moldura pinta `:hover` | `slotted-*-720-data-scene-control*.json` |
| Press | `clear` ΔL +0.071 / −0.086 / +0.155, diferente do hover | idem |
| Focus | anel 2px: 5.17:1 claro, 7.29:1 escuro, 21:1 alto contraste; `crumb` com anel fora da caixa | idem; captura `cascader-drill-focus-…` |
| Transition | `background-color`, `box-shadow`, `color` listados no nó; `rotate` no chevron; nenhum `all` | `cascader.css` |
| Motion | entrada `--slotted-easing-enter` 200ms, saída `--slotted-easing-exit` 120ms; marca com entrada e saída | `cascader.css` |
| Reduced motion | camada só com fade; durações colapsam pelo tema | `cascader.css` § movimento reduzido |
| Disabled | cor `--slotted-disabled-foreground`, sem opacidade; nó desativado com cursor e anel no par desativado | `cascader.css` |
| Schemes | alto contraste com caminho em semibold; cores forçadas com `Highlight` no cursor e contorno no caminho | capturas `high-contrast` |
| Density and RTL | dense com nós de 26px; RTL com colunas espelhadas e chevrons `directional` | capturas `dense`, `rtl` |
| Target size | nós ≥ 26px (dense), `crumb` ≥ 24px, `clear` com halo até 24/44px | `cascader.css` |
| Intent | cada literal com razão escrita (`scale: 0.8`, pesos de encolhimento, `min-inline-size: 2.5ch`) | `cascader.css` |

## Secção 18

- Anatomia: 30 partes, secção 6 do desenho.
- Controlado e não controlado: `value`, `open`, `path`, `activeKey`, `expandedKeys`, `searchValue`, cada um com pedido cancelável e razão.
- Estados: `open`, `expanded`, `selected`, `indeterminate`, `current`, `disabled`, `readonly`, `invalid`, `required`, `loading`.
- Densidade e direção: tokens de controlo por densidade; propriedades lógicas e chevrons `directional`.
- Carregamento, vazio, erro, conteúdo extremo: raízes a carregar (`loading`), nível a carregar (`loader`, `aria-busy`), nível falhado (`status` com repetição), nível vazio e pesquisa vazia (`empty`), rótulo longo (duas linhas e reticências), caminho longo (segmentos que cedem pelo meio), caminho fundo (janela e dobra).

## Verificação

- Contrato 14/14; núcleo 39/39; React 27/27; Angular 18/18 (tsconfig limitado a `cascader/src`, porque specs de outras sessões não compilam).
- `test:contracts`, `test:package-layers`, `test:docs`, `typecheck`: exit 0. `lint`: só `packages/react/src/message/message-demo.tsx`, de outra sessão. Estilos 246/247: só `kbd`, de outra sessão.
- Página Angular verificada numa instância temporária na porta 6017: a instância em 6007 foi arrancada antes do entry point existir e não compila os ficheiros novos até ser reiniciada.
