# `dashboard-grid` — autoavaliação

Data: 2026-09-24. Desenho em `docs/history/designs/2026-09-24-dashboard-grid-design.md`;
contrato em `specs/components/dashboard-grid/contract.json`.

## 1. Rubrica

Cada dimensão: evidência, a mudança que mais a melhoraria e se foi feita.

| Dimensão | Evidência | Melhoria nomeada | Feita |
| -------- | --------- | ---------------- | ----- |
| Icons | Pega (`grip-vertical`), detalhe (`external`), adicionar (`plus`), tentar de novo (`rotate-ccw`) e redimensionar (`resize`, glifo novo de Lucide `move-diagonal-2`), todos por máscara de token; `forced-color-adjust: none` dentro de `forced-colors`; seta de detalhe e pega de redimensionar espelhadas em RTL (capturas `gesture` RTL 720). | A pega de redimensionar tinha o seu glifo sobre o conteúdo do corpo. | Sim: chão do cartão, recuado da aresta. |
| Motion | Mudança confirmada anima por FLIP com `--slotted-duration-medium` e `--slotted-easing-standard`; reduzido colapsa a 1 ms. Linha de atualização em loop só sob `no-preference`, `animation: none` sob `reduce` (`motion.test.mjs`). Pré-visualização do arraste por `order` sem transição: segue o ponteiro. | Transição da pré-visualização durante o arraste. | Não: a pré-visualização muda a cada movimento e uma transição atrasaria a leitura do lugar. |
| Responsiveness | Três classes do próprio contentor (600, 1024); capturas a 1100, 720, 420 e 240; salas desktop, tablet e phone na página React. | A classe média mantém `minColumns` só na classe expandida. | Não: registado; um widget largo por natureza declara `columns` por classe. |
| Refinement | Guias recuadas 0,3 r para não aparecerem nos cantos; fio na barra em alto contraste; pega com chão; 200 % de zoom lido. | Guias em alto contraste (o fundo `sunken` é branco). | Não: limitação registada; as pegas continuam visíveis. |
| Tokens | `dashboard-grid.tokens.json` derivado do CSS; literal único `--slotted-dashboard-grid-row-size: 4.5rem` com razão no contrato; `tokens.test.mjs` verde. | Altura de linha por densidade. | Não: densidade governa controlos, não a altura do conteúdo. |
| Patterns | Comparação itemizada no desenho §2 (listbox reordenável, menu button, SC 2.5.7). | — | — |
| Accessibility | Lista nomeada, `article` com `aria-labelledby`, `aria-keyshortcuts`, `aria-describedby` nas pegas, `aria-busy`, anúncios educados; foco devolvido à pega após mover e ao vizinho após esconder (testes React e Angular). | Leitor de ecrã real. | Não verificável nesta máquina. |
| Native API | React: props nativas na raiz e no `li`, `render`, `ref` com handle. Angular: `model()`, `output()` com razão, `exportAs`, `HostAttributeToken` não necessário (aria-* do host passam para a lista por input). | `HostAttributeToken` para `role` do consumidor. | Não: a raiz não tem papel próprio a proteger. |
| Capability | 25 linhas de table stakes decididas; diferenciadores e lacunas escritos (desenho §1). | — | — |
| Ecosystem integration | Tabelas de integração respondidas (desenho §5); `usePersistedDashboardLayout` e `persistedDashboardLayout`. | Formulário: não aplicável. | — |
| Documentation | Páginas React e Angular com 10 cenas; `audit.mjs` React 1280: 0 achados. Página Angular não renderiza até o Storybook 6007 reiniciar. | Ler a página Angular. | Pendente do reinício. |

## 2. Secção 18

1. **Propósito:** superfície de widgets reorganizáveis pelo leitor. Antiuso: grelha de
   layout fixa (use `grid`), coleção de registos (use `data-list` ou `table`).
2. **Anatomia:** 22 partes, contrato `members.dashboard-grid.parts`.
3. **Controlado/não controlado:** `layout` e `editing`, com pedido `ChangeRequest` e
   `change` no primeiro.
4. **Matriz de estados:** `editing` na raiz; `dragging`, `data-resizing`, `loading`,
   `data-status` no widget; `busy` como `aria-busy`.
5. **Teclado e foco:** contrato `keyboard`; testes React (28) e Angular (18).
6. **Tokens:** sim.
7. **Responsivo, RTL, movimento reduzido:** capturas e testes de estilos.
8. **Carregando, vazio, erro, extremo:** cena `states` e `content`.
9. **SSR:** spans calculados sem medir; classe observada por `ResizeObserver`
   depois da montagem.
10. **Exemplos:** páginas de referência.
11. **Testes partilhados:** comportamento espelhado nas duas bindings; cenário de
    ponteiro no browser (mover, redimensionar, `Escape`).
12. **Quebra:** família nova.
