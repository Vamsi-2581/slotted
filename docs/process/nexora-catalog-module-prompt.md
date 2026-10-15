docs/process/nexora-catalog-module-prompt.md — cola o preâmbulo de nexora-vertical-slice-prompts.md antes deste bloco.

Módulo: Catalog inteiro, /catalog. Cinco ecrãs, entregues de uma vez, até que nenhuma rota
de /catalog abra num placeholder e nenhum estado do §33 fique por desenhar.

## Modo de entrega

Uma entrega só, do princípio ao fim, sem paragens. Isto revoga, para esta sessão, o
protocolo de fatia do CLAUDE.md global e a linha de protocolo de fatia do preâmbulo:

- Sem checkpoints. Não escrevas `.claude/progress/current.md` durante o trabalho.
- Sem relatórios intermédios, sem perguntas de confirmação, sem "queres que eu continue".
- Sem fatias: a lista de tarefas é tua, corre-a inteira.
- Um único relato, no fim, com tudo feito e verificado.

Se algo ficar bloqueado, contorna o que puderes, entrega todo o resto completo, e diz no
relato final o que ficou de fora e porquê. Bloqueio num ecrã não para os outros quatro.

## O que muda neste módulo, e muda tudo

O backend do catálogo é só de leitura. Em `backend/api/index.ts`, o objeto `catalog` não
espalha `...commands.*` — ao contrário de `customers`, `quotes` e `orders` — e
`createCommands` não tem grupo de catálogo nem de pricing. Não existe comando para criar um
produto, editar um SKU, mexer numa categoria ou escrever um preço. Confirma antes de
desenhar qualquer controlo — e, quando confirmares, não desenhes o controlo. Uma ação que o
backend não tem é linha na tabela Backend do ledger, nunca um botão que mente.

A superfície inteira da região são seis leituras:

```
catalog.products(query)   GET /products
catalog.product(id)       GET /products/:id
catalog.skus(query)       GET /skus
catalog.sku(id)           GET /skus/:id
catalog.priceLists()      GET /price-lists      exige pricing.view
catalog.categories()      GET /categories
```

Consequência prática: este módulo é medido pela qualidade da leitura. Um ecrã que só lê
tem de responder mais depressa à pergunta do operador do que um ecrã que escreve — quantas
unidades há, onde estão, a que preço, para quem, e o que está a faltar.

## O que já existe (não refazer, reconciliar)

- Guidelines assentes: AF-01..AF-05, LA-01..LA-04, SC-01..SC-06, CP-01..CP-06,
  LP-01..LP-08, RP-01..RP-06, FM-01..FM-10, ER-01..ER-04. Lê o index.md e carrega os
  tópicos cujos triggers batem. CP-04 e CP-05 autorizam-te a compor elementos próprios com
  os tokens quando nenhuma família responde — e CP-01 continua a ser a pergunta anterior.
- Componentes próprios já escritos e reutilizáveis: `app-order-progress` (ciclo de um
  registo), `app-approval-panel` (cadeia de decisões sobre `timeline`), `app-reason-dialog`.
- `core/backend/list-query.ts` — a query de grelha para lista do backend, com mapa de
  escalas por lista. Usa-a; não copies a de outro módulo.
- Ferramentas: `tools/shoot.mjs`, `tools/phone.mjs` e `tools/jump.mjs` (mede uma caixa a
  carregar e carregada; o `top` que se mexe é a página a saltar debaixo do leitor).
- O skill `loading-states` é a lei dos esqueletos: o esqueleto é a anatomia do conteúdo,
  não um retângulo, e nada se move entre carregar e carregado.

## Pendências herdadas (não são deste módulo, mas cruzam-no)

- `@slotted/angular/switch` não tem entry point; é a única família publicada sem ele. Se
  este módulo precisar de um interruptor, usa `checkbox` e acrescenta ao ledger em vez de
  contornar o pacote.
- O transporte degradado foi exercido por spec, nunca conduzido no browser ecrã a ecrã.
  Este módulo conduz.
- O carregador da `data-grid` reserva 18 linhas (612px) para um scroller de 608px a 900px
  de altura. Medido correto a essa altura; se o vires deixar um vão noutra altura de
  janela, mede antes de mexer e regista a altura.

## Ecrãs a entregar

1. /catalog/products — a lista de produtos (2 400 no seed leve). Backend:
   `GET /products` (resources/catalog.ts, `productResource`): name, brand, status,
   categoryName, skuCount, activeSkuCount, tags, updatedAt. Um produto é um cabeçalho de
   família; o que o operador compra é o SKU. A lista tem de dizer, sem abrir nada, quantos
   SKU ativos tem cada produto e onde está o seu lugar na árvore.
   Decisão a tomar aqui: `GET /skus` existe e filtra por campos que o produto não tem
   (`brand`, `status`, `unitOfMeasure`, `onHand`, `available`, `reserved`, `inbound`,
   `backordered`, `belowReorderPoint`, `reorderMode`, `leadTimeDays`,
   `preferredSupplierId`, `standardCost`, `listPrice`). Um operador que procura "o que está
   abaixo do ponto de encomenda" não procura produtos. Ou a rota ganha duas vistas
   (produtos | SKUs) sobre a mesma barra de filtros, ou nasce uma rota de SKUs. Decide,
   regista o motivo, e não deixes `GET /skus` por usar.
2. /catalog/products/:id — o produto e os seus SKUs. Backend: `GET /products/:id`
   (`ProductDetail`: product, skus, category, categoryPath). O caminho da categoria é um
   `breadcrumb` no `nav` do cabeçalho. A tabela de SKUs é a razão da página: código, nome,
   estado, unidade, preço de lista, disponível, reservado, a caminho, e a marca de abaixo
   do ponto de encomenda.
3. /catalog/skus/:id — o registo de um SKU, e o ecrã flagship deste módulo. Backend:
   `GET /skus/:id` (`SkuDetail`): sku, product, category, categoryPath, priceEntries,
   supplierMappings, inventory (posição por armazém), reorderSuggestions, recentMovements.
   Domínio §57 (SKU, preço, custo, imposto), §60 (posição, reserva, disponível),
   §9 (catálogo). Tem de responder: quanto existe e onde; quanto está preso em reservas;
   o que vem a caminho e quando; a que preço se vende em cada lista; a quem se compra e em
   quanto tempo; e o que aconteceu ao stock ultimamente. A rota não está no modelo de
   navegação — acrescenta-a como o módulo CRM fez com /crm/imports, ou pendura-a no
   produto; decide e regista.
4. /catalog/categories — a árvore. Backend: `GET /categories`, que devolve cada categoria
   com `depth` e `productCount`. São 172 nós, 121 deles folhas, profundidade máxima 4
   (§89.10): o problema não é o volume da árvore, é que `productCount` de um ramo e
   `productCount` da folha respondem a perguntas diferentes e o leitor tem de saber qual
   está a ler. A família `tree` existe e tem entry point (`packages/angular/tree`): lê a
   anatomia antes de compor (CP-01). Uma categoria leva à lista de produtos filtrada por
   ela, e a lista tem de dizer que está filtrada por uma categoria.
5. /catalog/price-lists — triagem antes de código. `GET /price-lists` exige `pricing.view`
   e devolve as listas com `entryCount`; **não existe endpoint que liste as entradas de uma
   lista** — o índice `priceEntriesByList` existe no runtime, nenhum recurso o expõe, e as
   entradas só chegam por SKU, em `SkuDetail.priceEntries`. Ou o ecrã compõe
   o que consegue a partir do que existe e a limitação fica no ledger com o custo medido,
   ou o ecrã diz o que não consegue fazer. Não inventes um endpoint. O ecrã
   /crm/contacts é o precedente: lê-o antes de decidir.

## A armadilha deste módulo

`getSku` zera o custo quando a persona não tem `cost.view`:
`item.standardCost = { currency: 'USD', minor: 0 }`. E `priceEntries` vem **vazio** sem
`pricing.view`. Um ecrã que desenhe esses valores como números verdadeiros mente ao leitor:
um custo de US$ 0,00 e uma margem de 100% são o que o backend devolve a um representante.
A regra do módulo (FM-04 diz o equivalente para formulários; aqui é leitura) é: um valor
que a persona não pode ver não se desenha — a coluna sai, o cartão sai, e a página diz
quem o vê, quando a ausência precisar de explicação. Verifica com noah-bennett
(`pricing.view` sim, `cost.view` não) antes de dar o ecrã por feito.

## Estados, permissões e cenários

Cada ecrã responde a todos os estados do §33 que lhe caibam. Em particular: pendente ≠
vazio; vazio ≠ vazio-por-filtro; erro com repetição; dados parciais (uma posição de armazém
que não respondeu); leitura-apenas por permissão.

O §82 semeia três casos que são a prova deste módulo, e os ecrãs têm de os ler bem: o SKU
descontinuado referido por uma encomenda histórica (82.6), o SKU com zero disponível e uma
encomenda de compra a caminho (82.7) e o SKU repartido por três armazéns (82.8). Abre os
três antes de dar o registo de SKU por feito.

Personas obrigatórias: sofia-ramirez (gestora: catálogo, preço e custo), noah-bennett
(representante: preço sim, custo não), jordan-wells (operador de armazém: inventário do
CHI-01, e é a persona que lê a disponibilidade a sério), owen-price (auditor, leitura),
maya-chen (administradora). Cenários: healthy, new_tenant, system_degraded e um dos de
stock, para que a marca de abaixo do ponto de encomenda apareça com dados verdadeiros.

## Qualidade visual — a barra desta entrega

"Feito" inclui o acabamento. Antes de dar qualquer ecrã por entregue:

- Quantidades são texto decimal (§53.8) com a precisão da unidade do SKU; um "12.000" numa
  coluna de unidades é um erro de leitura, não de dados.
- Dinheiro numa coluna alinha pela última casa; a moeda é a do que está a ser mostrado, não
  a do tenant.
- Espaçamento: CP-02. Todo elemento próprio com irmão vive em `inline` ou `stack` com gap
  da escala; nenhum texto próprio herda o tamanho do documento.
- Uma forma por ideia (CP-06): o estado que a família já desenha não se volta a desenhar ao
  lado dela.
- Esqueletos pelo skill `loading-states`, verificados com `tools/jump.mjs`.
- Dois esquemas e três densidades; um ecrã que só lê bem em comfortable/claro não está
  feito.
- Tipografia: os passos da família; nada de tamanhos inventados. O guarda
  `specs/demo-screen-tokens.test.mjs` recusa cor, tamanho de tipo ou comprimento em pixels
  que um token cobre — um literal só passa com `literal: <motivo>` ao lado.

## Decisões que provavelmente nascem aqui

Navegação por árvore e por facetas é o tópico que falta: como uma árvore e uma lista
partilham um filtro, o que acontece ao selecionar um ramo, como a lista diz que está
filtrada por uma categoria, e o que a árvore faz quando tem mais ramos do que cabem. Cria o
tópico com prefixo BR (browse) quando a primeira decisão concreta aparecer, pelo esquema de
writing-rules.md. Disponibilidade por armazém pode pedir regra própria — uma tabela de
posições não é uma tabela de registos relacionados; só cria se a decisão não couber em RP.

Guidelines existentes podem precisar de emenda em vez de regra nova: uma regra cuja redação
melhora mantém o número; uma cujo sentido muda é retirada e reescrita com número novo.

## Verificação por ecrã, antes de o dar por feito

- 1280, 570 e telemóvel emulado (390×844 e 360×780): a lista de elementos mais largos que o
  viewport vem vazia; todos os controlos a 44px com ponteiro grosso.
- `node tools/jump.mjs <rota> '<seletor>'` na rota de cada ecrã: o `top` não se mexe e
  nenhuma caixa encolhe.
- Transporte normal e degradado pelo painel de demonstração.
- Percurso no telemóvel: abrir a lista, filtrar, abrir um produto, abrir um SKU, ver a
  disponibilidade por armazém e voltar com o gesto de voltar do sistema.
- `ng test` na demo com specs para cada comportamento prometido — em particular o custo
  ausente sem `cost.view`, as entradas de preço ausentes sem `pricing.view`, e a
  disponibilidade que soma o que o backend devolve por armazém.
- `pnpm --filter @slotted/<pkg> verify` e `pnpm check` quando tocas o pacote;
  `pnpm demo:refresh` e servidor reiniciado antes de capturar.

## Fecho

Não commites. No fim — e só no fim — um relato: veredictos (pacote / demo / backend) por
observação, ficheiros, linhas do ledger, regras novas ou emendadas, o que ficou aberto e
porquê. O módulo termina quando o relato puder dizer que nenhuma rota de /catalog abre num
placeholder e que nenhum ecrã desenha um controlo para um comando que o backend não tem.
