# Highlight — desenho

Inventário: `2026-09-16-highlight-capability-inventory.md`. O que se decide aqui
sobrevive à família: a anatomia que quatro hosts passam a renderizar, o motor
que `collection/filter` passa a importar e o seletor que a folha muda.

## 1. Padrão

O WAI-ARIA APG não tem padrão para realce de texto
(<https://www.w3.org/WAI/ARIA/apg/patterns/>, lido em 2026-09-16). O elemento
da plataforma é `<mark>`
(<https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-mark-element>):
"um trecho de texto marcado ou realçado por referência, pela sua relevância
noutro contexto"; o exemplo normativo é o termo pesquisado dentro de um
resultado. Nenhum teclado, nenhum foco, nenhum `aria-*`: a família é conteúdo
dentro de um host, e o host é quem tem o papel.

| Exigência                                            | Onde                                                                                        | Estado    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------- |
| O trecho relevante é `mark`                          | contrato `parts.match`, `highlight.tsx`, `highlight.ts`                                     | passa     |
| O texto original é o conteúdo; nada é ocultado       | os runs são `text.slice`; nenhum `aria-hidden`, nenhum `::before` textual                   | passa     |
| Leitores de tela não anunciam `mark` por padrão      | decisão registada no contrato (`announcement`); nenhum texto oculto é injetado              | departure |
| `Mark`/`MarkText` sob cores forçadas                 | `highlight.css`, bloco `forced-colors`                                                      | passa     |

O departure: MDN sugere `::before { content: " [highlight start] " }` para
tornar a marca audível. Um rótulo de combobox com cinco ocorrências seria dez
anúncios por opção; a família não o faz. Um consumidor que precise do anúncio
escreve a regra no seu próprio escopo sobre `[data-ui='highlight'] [data-part='match']`.

## 2. Anatomia

```html
<span data-ui="highlight" data-part="root">
  Blue<mark data-part="match">berr</mark>y
</span>
```

- `root` é o elemento que segura o texto. Padrão `span`; React substitui com
  `render`, Angular aplica `[slHighlight]` ao elemento que o consumidor já tem.
  Dentro de um host, a raiz é um elemento próprio dentro da parte do host
  (`span[data-part='label'] > span[data-ui='highlight']`), como o chip de
  `select` é `span[data-ui='tag'][data-part='root']` dentro de `[data-part='tags']`.
  Um elemento não leva dois `data-part`; a raiz aninhada é o que evita a
  colisão que `toolbar` sofreu com `slMenuTriggerFor`.
- `match` é `mark`, um por trecho contíguo. Sem `data-ui` próprio: a folha
  seleciona `[data-ui='highlight'] [data-part='match']`.
- A raiz não tem regra na folha: é inline e herda tudo. A marca não altera
  métrica (CB6, teste `changes no metric of the word it marks`).

Estados no DOM: `data-disabled` na raiz, ou herdado de qualquer ancestral
`[data-disabled]`; `data-current` na marca cujo índice é `current`.

## 3. Motor — `@slotted/core/highlight`

| Função                                              | Responde                                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `findMatch(collator, text, query, anchored, from)`  | O `scan` que `collection/filter.ts` tinha: a primeira janela a partir de `from` que o collator iguala à query, tentando `n`, `n-1` e `n+1` unidades. |
| `matchRanges(text, query, options)`                 | Todos os intervalos de todas as queries (`occurrences: 'all'`) ou o primeiro de cada (`'first'`); query vazia ou só espaço → `[]`.               |
| `normalizeRanges(text, ranges)`                     | Recorta a `[0, text.length]`, ordena, funde sobrepostos e adjacentes, descarta vazios, estende cada limite ao grafema por `Intl.Segmenter`.      |
| `splitRanges(text, ranges)`                         | Os runs: `{ text, matched, index }`, `index` contando só os marcados. Sem run vazio.                                                              |
| `highlightRuns(text, input)`                        | A chamada única dos bindings: `ranges` vence `matcher`, que vence o matcher padrão; tudo passa por `normalizeRanges` e `splitRanges`.             |

`collection/filter.ts` importa `findMatch` daqui e reexporta `matchRanges` e
`splitByMatch` com as assinaturas de hoje. `splitByMatch` passa a devolver todas
as ocorrências: é o custo nomeado no inventário §2, e é o comportamento de dois
dos três surveyed.

O `scan` fica aqui e não em `collection` porque a marca é o consumidor que
existe sem coleção — um parágrafo com o termo pesquisado — e `collection` já
importa `measure`; a direção `collection → highlight` mantém o grafo acíclico.

## 4. Bindings

### React

| Pergunta                            | Resposta                                                                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Valor mutável com par e razão       | Nenhum. `text`, `query`, `ranges`, `current` são valores do consumidor; a família não os move e não emite pedido.             |
| Defaults uma vez                    | `HighlightDefaultsProvider` / `useHighlightDefaults`: `locale`, `sensitivity`, `occurrences`.                                 |
| Elemento substituível               | `render(props)` na raiz; `match` é fixo em `mark` (inventário §2).                                                            |
| Handler do consumidor               | Nenhum handler da família; os props nativos chegam à raiz por spread.                                                         |
| Elemento nativo e ação imperativa   | `ref` na raiz por `ComponentPropsWithRef<'span'>`; nenhuma ação imperativa — a rolagem até o `current` é do consumidor.       |
| SSR                                 | Motor puro; nenhum id; nenhuma leitura de layout.                                                                             |
| Estados no DOM                      | `data-disabled`, `data-current`.                                                                                              |
| Tipo de props                       | `ComponentPropsWithRef<'span'>` estendido.                                                                                    |

### Angular

| Pergunta                            | Resposta                                                                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `model()` / `output()`              | Nenhum: nenhum valor mutável.                                                                                                 |
| Forms                               | Não é controle.                                                                                                               |
| Defaults uma vez                    | `provideHighlightDefaults()` / `injectHighlightDefaults()`.                                                                   |
| `exportAs`                          | `slHighlight`; expõe `runs()` para um consumidor que conte ocorrências.                                                       |
| Conteúdo projetado                  | Nenhum: `text` é string. Um `mark` dentro de conteúdo projetado seria HTML interpretado, que o guia §10 proíbe.                |
| Zoneless / OnPush                   | `input()` + `computed()`; `@for` sobre `runs()`.                                                                              |
| Teardown                            | Nenhuma subscrição.                                                                                                           |
| Atributo estático do consumidor     | O host escreve `data-ui` e `data-part` como constantes; o consumidor não escreve nenhum dos dois.                             |
| Entry point                         | `@slotted/angular/highlight`, importado por `combobox`, `select`, `multi-select`, `command-palette`.                          |

## 5. Hosts

| Host              | Antes                                                       | Depois                                                                                              |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `combobox`        | `splitByMatch` + `<mark data-part="match" data-ui="highlight">` | `<Highlight text query locale>` / `<span slHighlight [text] [query] [locale]>` dentro de `label`     |
| `select`          | idem                                                        | idem                                                                                                |
| `multi-select`    | idem                                                        | idem                                                                                                |
| `command-palette` | idem                                                        | idem                                                                                                |
| `listbox` (React) | importa a folha                                             | não importa: a família importa a sua                                                                |
| `menu` (React)    | importa a folha                                             | inalterado nesta sessão — arquivo em edição por `context-menu hover-card`; reabertura registada     |
| `tree` (React)    | `<mark>` sem folha                                          | inalterado; reabertura registada                                                                    |

O bloco `mark` do contrato de `combobox` passa a apontar para a família em vez
de declará-la. `highlightMatch` dos hosts fica: `false` renderiza o rótulo puro.

## 6. Custos

- Os quatro hosts marcam todas as ocorrências em vez da primeira. Um rótulo
  `Ana Banana` com a query `an` leva três marcas.
- Um elemento inline a mais dentro de `label`. Nenhuma regra o alcança; nenhuma
  métrica muda.
- Um teste de host que procurava `mark[data-ui='highlight']` passa a procurar
  `[data-ui='highlight'] [data-part='match']`.
- `packages/core/src/collection/filter.ts` perde 20 linhas e ganha uma
  importação de `../highlight`.
