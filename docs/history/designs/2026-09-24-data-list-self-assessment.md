# `data-list` — autoavaliação

Data: 2026-09-24. Inventário: `2026-09-24-data-list-capability-inventory.md`.
Desenho: `2026-09-24-data-list-design.md`. Contrato: `specs/components/data-list/contract.json`.

Capturas lidas (scratchpad da sessão, `shots/`): `anatomy` em claro, escuro e
alto contraste a 420 px; claro a 240 px; `dense`; RTL. `states` em claro, escuro
e alto contraste. `content`, `grouping`, `framed` (escuro), `loading` (claro e
escuro), `refresh`, `no-results`, `error`, `load-more` e `sort-open`. Foco no
título (claro) e em `more` (escuro); foco no título-botão (escuro).

## 1. Dimensões do rubric

| Dimensão | Estado | A mudança que mais a melhoraria | Feita |
| --- | --- | --- | --- |
| Ícones | Dois glifos, ambos `--slotted-icon-chevron-down` em máscara: a direção da ordenação e a divulgação de `more`, rodados meia volta; `forced-colors` herdado por `currentColor`. | Um glifo de direção dedicado (seta) para a ordenação. | Não: a regra de `table` é a mesma máscara rodada; um glifo novo seria uma segunda resposta para a mesma pergunta. |
| Movimento | A rotação do chevron (`--slotted-duration-short`) e o esmaecimento da recarga (opacidade) têm transição; a entrada e saída de campos ao expandir não. | Animar a abertura dos campos por `grid-template-rows` 0fr→1fr. | Não: os campos extra não são renderizados enquanto fechado (regra de `data-grid`), e uma transição exigiria mantê-los no DOM. |
| Responsividade | Contentor `slotted-data-list-fields` no `dl`: duas ou mais colunas a partir de 18rem, rótulo ao lado entre 12 e 19rem, rótulo sobre o valor abaixo de 12rem; abaixo dos 22rem de `list-item` os campos ocupam a linha desde o início. Capturas a 240 e 420. | Uma trilha de rótulo partilhada entre campos no modo de uma coluna (subgrid). | Não: exige um contentor acima do `dl` que não seja o de `list-item`; registado como próximo passo da família. |
| Refinamento | Valores na tinta do texto numa linha selecionada; valor à direita em peso médio; área de toque do registo com anel interno. O detalhe identificado: trilha do rótulo de 40% abria um vão largo entre "Status" e o valor. | — | Sim: a trilha passou a `min(7.5rem, 35%)`. |
| Tokens | Nenhum token de componente; `--_field-min` e `--_field-label-inline` são literais registados no contrato (`literals`), a geometria do pop-in. Opacidade 0.55 da recarga é o literal de `data-grid`. | Um token semântico de opacidade para "conteúdo a recarregar" partilhado com `data-grid`. | Não: mudaria outra família; fica para a revisão de `data-grid`. |
| Padrões | Sem padrão APG para uma lista de registos; disclosure (`more`) e menu button (`sort`) transcritos em `contract.borrowed`. Checklist em §2. | — | — |
| Acessibilidade | Nome da lista por `label`/`labelledBy`; título como único nome do link/botão; checkbox nomeado "Select {title}"; contagem em `output aria-live`; ordenação anunciada; esqueleto com `aria-busy` e um anúncio; foco movido ao remover o registo com foco (testes em ambos os bindings). | Verificar com leitor de ecrã real que o `li aria-current` é anunciado dentro do link. | Não verificável nesta máquina; declarado no gate. |
| API nativa | React: props nativas na raiz, `onBlur` composto, `ref` com `DataListHandle`. Angular: sinais, `model()` para os três estados, `HostAttributeToken('aria-label')`, `exportAs`, `SlDataListPart` repõe o `data-part="root"` que `slMenuTriggerFor` apaga. | `render` para substituir a raiz em React. | Não: a raiz é uma composição de `header`, `ul` e `footer`; uma raiz substituível exige o contrato de um `div` sem filhos próprios. |
| Capacidade | Tabela de §3. Todas as linhas `adopt`/`adapt` do inventário estão no contrato; as `decline`/`defer` nomeiam a família dona. | Página de consulta paginada em modo servidor com `query.page` e `pagination` no rodapé demonstrada. | Parcial: `footer` aceita a `Pagination`; a cena `load-more` cobre o modo servidor. |
| Integração no ecossistema | Tabelas de `frameworks.md` em §5 do desenho, todas respondidas. Assimetria: React tem `render` só nos filhos compostos; Angular tem `ng-template` por coluna. | Integração com `saved-views` demonstrada (vista guardada aplicada a uma `data-list`). | Não: a query é o mesmo `GridQuery`, e a demonstração pertence a `saved-views`. |
| Documentação | Duas páginas com importação, anatomia (19 partes), 17 cenas com snippet, props, eventos, composição, acessibilidade (4 frases), tokens e código. `referencePageErrors` sem erros nos dois bindings. | Ler as páginas renderizadas a 1280 e 720 px e correr `tools/harness/audit.mjs`. | Não: nenhuma Storybook responde em 6006 nem 6007, e o briefing proíbe arrancá-las. |

## 2. Checklist dos padrões emprestados

Fonte: <https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/> e
<https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/>, lidas em 2026-09-24.

| Item | Resultado | Evidência |
| --- | --- | --- |
| Disclosure: elemento `button` | pass | `button[data-part=more]` nos dois bindings |
| Disclosure: `aria-expanded` true/false | pass | teste "opens the fields past `fields`" (React e Angular) |
| Disclosure: `aria-controls` para o conteúdo | pass | mesmo teste, `aria-controls` igual ao `id` do `dl` |
| Disclosure: Enter e Space alternam | pass (plataforma) | `button` nativo |
| Menu button: `button` com `aria-haspopup` e `aria-expanded` | pass (família `menu`) | `MenuTrigger` / `slMenuTriggerFor` |
| Menu button: Enter, Space, ↓ abrem no primeiro item; ↑ no último | pass (família `menu`) | contrato de `menu`, `keyboard` |
| Menu: itens `menuitemradio` com `aria-checked` | pass | testes "sorts from the menu" |
| Lista: `role="list"` e `listitem` | pass (família `list`) | `ul[data-ui=list]` |
| `aria-selected` ausente em `listitem` | pass | teste "selects … without aria-selected" |
| Teclas de seta | partida deliberada | `contract.keyboardDeparture`: custo de uma tecla Tab por controlo |

## 3. Critérios de pronto (`docs/component-features.md` §18)

1. **Propósito e antiuso**: desenho, primeiro parágrafo.
2. **Anatomia**: 19 partes em `contract.anatomy`; composição de `list`, `list-item`, `checkbox`, `menu`, `button`, `result-state`, `skeleton`.
3. **Controlado e não controlado**: `query`/`defaultQuery`/`onQueryChange` (com `change`), `value`/`defaultValue`/`onValueChange`, `expanded`/`defaultExpanded`/`onExpandedChange` em React; `model()` e `*ChangeRequest` cancelável em Angular. Razão: a mesma forma de `data-grid`, porque a mesma `GridQuery` circula entre as duas.
4. **Matriz de estados**:

   | Registo | selected | current | disabled | loading |
   | --- | --- | --- | --- | --- |
   | Pintura | chão e aresta de acento | chão e aresta neutros | tinta recuada | tinta recuada |
   | Ativação | sim | sim | recusada | recusada |
   | Seleção | sim | sim | recusada | sim |
   | Hover | passo de acento | passo neutro | nenhum | nenhum |

   Precedência de `list-item`: `disabled` > `loading` > `selected` > `current` > `hover`.
5. **Teclado, foco, ARIA**: §2; foco após remoção testado nos dois bindings.
6. **Tamanho, densidade, variante**: `size` (sm, md, lg) e `variant` (plain, ruled, framed) passados a `list-item`; densidade pelo tema (captura `dense`: os campos passam a duas colunas porque a inserção diminui).
7. **Responsivo, RTL, locale, movimento reduzido**: capturas a 240/420 e RTL; valores com `unicode-bidi: plaintext` e `text-align: match-parent`; `locale` formata valores e números das mensagens; durações da escala de movimento.
8. **Carregamento, vazio, erro, conteúdo extremo**: esqueleto com a anatomia do item, recarga esmaecida, `load-more` com a espera do botão; `empty`, `no-results`, `error`; cena `content` com título longo, e-mail sem quebras, rótulo traduzido longo e valor em árabe.
9. **SSR e desempenho**: `useId` para os ids; nenhuma medida durante o render; a virtualização é declinada para `data-grid` (conjunto pequeno).
10. **Exemplos**: 17 cenas por binding, domínio único de contas.
11. **Testes partilhados**: React 24 de comportamento e 4 de página; Angular 18 e 4; core 14; contrato 9; estilos 13.
12. **Quebra de contrato**: família nova; nenhuma migração.

## 4. Decisões tomadas durante a construção

- `fields` e `more` passaram de filhos de `body` a filhos de `content`: dentro de `body`, a coluna `end` tirava ~100 px a cada linha de campos (captura `anatomy` a 420, primeira iteração).
- Abaixo de 12rem de `fields`, o par volta a rótulo sobre valor: com a trilha a 40% o rótulo "Created" partia-se a meio da palavra a 240 px.
- `aria-current` fica no `li`, escrito por `list-item`, e não no título, para não ser anunciado duas vezes.
- A capacidade `disabled` saiu do contrato: a família não tem um `disabled` de lista; o estado é por registo (`disabledKeys`), registado em `contract.disabledReason`.
- `list-item` corrigido no commit `95ddb54d`: a regra da linha seguinte cobria a aresta inferior de uma linha `selected`/`current` em `ruled`/`framed` (pedido do revisor no gate visual).

## 5. Custos registados

- O par rótulo/valor vive em três folhas: `description-list`, pop-in de `data-grid`, `data-list`.
- A folha escreve `--_fill` de `list-item` para o hover de um registo cujo alvo é o título esticado; a reabertura de `list-item` está em `docs/process/build-order.md`.
- O texto dos campos de um registo ativável não é selecionável com o ponteiro.
