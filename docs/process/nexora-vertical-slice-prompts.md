# Nexora — prompts da fatia vertical

Cinco prompts, um por sessão, na ordem de `demos/nexora/domain.md` §44 Fase 2:
Customers → Customer 360 → Sales Orders / Sales Order → Invoice / Payment →
Dashboard. Cada prompt é colado inteiro numa sessão nova, precedido do preâmbulo.
Nenhum nomeia as famílias a usar: a escolha é da sessão, feita depois de ler as
reference pages, e a guideline `CP-01` diz como.

## Preâmbulo (colar antes de cada prompt)

```text
Estás a construir um ecrã da demo Nexora, o cliente Angular em demos/nexora/angular,
consumidor de @slotted/* por tarballs (demos/nexora/angular/README.md tem o contrato de
instalação e os comandos; pnpm start serve em http://localhost:4250).

Antes de escrever código, lê nesta ordem:
1. demos/nexora/guidelines/README.md e depois demos/nexora/guidelines/index.md — as regras
   já assentes; carrega os tópicos cujos triggers batem no ecrã. writing-rules.md é o guia
   para escrever regras novas.
2. .claude/skills/demo-triage/SKILL.md — como um problema visto na demo é atribuído ao pacote
   ou à demo, e o que cada lado exige. demos/nexora/angular/LIBRARY-FEEDBACK.md é o ledger.
3. As secções de demos/nexora/domain.md que o prompt cita — a Parte II é normativa para o
   backend; o que o backend expõe está em demos/nexora/backend/backend/api/resources/*.ts e
   no contrato §73.
4. Para cada família que decidires usar, a reference page do binding Angular
   (packages/angular/<família>/src/<família>.docs.ts) e o contrato
   (specs/components/<família>/contract.json): anatomia, slots, estados, razões.

Regras da sessão:
- O ecrã é feito com as famílias publicadas. Uma necessidade que nenhuma família cobre é uma
  linha no ledger antes de ser um elemento próprio da demo; um defeito da família é corrigido
  no pacote (teste que falha antes e passa depois, ambos os bindings quando o defeito é do
  contrato ou da stylesheet, pnpm demo:refresh, servidor reiniciado), nunca contornado na demo.
- Cada observação vira uma de três coisas: correção no pacote com linha no ledger; correção na
  demo com linha no ledger quando a API induziu o erro; ou regra nova em
  demos/nexora/guidelines (esquema fixo, ID nunca reutilizado, entrada no index.md). Uma
  regra nova é escrita quando a decisão é do produto e a biblioteca não a toma.
- Estados assíncronos seguem AF-01 a AF-05 desde o primeiro render: pendente ≠ vazio, o
  controlo que dispara o pedido espera nele, mudança de vista/página desenha placeholders.
  O transporte normal do backend tem 120–650 ms por pedido e o degradado 700–1600 ms com
  503 aleatórios; verifica os dois pelo painel de demonstração (frasco no banner).
- Verifica em três larguras antes de dar por feito: 1280 (node tools/shoot.mjs), 570 e
  telemóvel real emulado (node tools/phone.mjs, 390×844 e 360×780 — ponteiro grosso, todos
  os controlos a 44px). O phone.mjs imprime qualquer elemento mais largo que o viewport;
  a lista tem de vir vazia. Verifica com pelo menos duas personas (sofia-ramirez e
  jordan-wells) e um cenário além do healthy.
- Testes: pnpm test na demo (ng test) com specs para cada comportamento que o ecrã promete;
  pnpm --filter @slotted/<pkg> verify e pnpm check quando tocas o pacote.
- Não commites. Termina com: veredictos (pacote / demo / backend) por observação, ficheiros,
  linhas do ledger, regras novas, o que ficou aberto e porquê. Sem resumo do que o código
  faz — o código está lá.
- Protocolo de fatia: no máximo três tarefas por fatia e um checkpoint em
  .claude/progress/current.md; termina a fatia quando um dos critérios do CLAUDE.md global
  se cumpre.
```

## Prompt 1 — Customers, a lista

```text
Ecrã: a lista de clientes, /crm/customers. É o primeiro ecrã de lista da demo e o que
decide como todos os outros se comportam; trata-o como tal.

Domínio: domain.md §8 (CRM), §56 (contrato CRM), §38 (saved views e filtros), §36
(pesquisa), §71 (saved views, search), §21 (portfólio de ecrãs — o que uma lista de
clientes tem de responder), §33 (cobertura de estados), §31 (imperfeições nos dados: nomes
longos, campos vazios, duplicados quase iguais). Backend: resources/customers.ts e §73 para
paginação, ordenação, filtros e a forma dos erros.

O que o ecrã tem de fazer, sem dizer com que famílias: mostrar os clientes com as colunas
que um operador de vendas precisa para decidir onde clicar; procurar e filtrar por estado,
segmento, dono e risco; ordenar; paginar; guardar e recuperar vistas; abrir um cliente;
uma ação em massa que exista no backend; contagens que fazem sentido com o cenário
carregado. Cada estado do §33 que se aplique a uma lista tem de ter uma resposta desenhada
— e a resposta ao pedido em voo tem de ser diferente da resposta a zero resultados.

Decisões a tomar e a registar como guidelines quando forem do produto: como uma lista de
muitas colunas se comporta a 390px com ponteiro grosso; onde ficam a pesquisa, os filtros e
as ações em massa em relação ao cabeçalho da página; o que uma linha mostra quando o nome
não cabe; como a paginação e a contagem coexistem. O tópico "list pages" ainda não existe
em demos/nexora/guidelines — cria-o com prefixo LP quando a primeira decisão aparecer.

Reconcilia com o que já existe: a rota /crm/customers está no modelo de navegação e o
command palette já navega para ela; a página de notificações é o único ecrã com conteúdo e
é a referência de como as regras AF e LA foram aplicadas.

Antes de considerar feito, faz o percurso inteiro no telemóvel emulado: abrir, procurar,
filtrar, mudar de página, guardar uma vista, abrir um cliente e voltar com o gesto de
voltar do sistema (history.back()).
```

## Prompt 2 — Customer 360, o detalhe

```text
Ecrã: o cliente, /crm/customers/:id — o "Customer 360" de domain.md §8.4 e §21. Assume a
lista do prompt anterior como existente; se não existir, faz o mínimo de lista que leve a
um cliente e regista a lacuna.

Domínio: §8 e §56 (CRM), §19 (relações entre entidades — o que um cliente liga: contactos,
pedidos, cotações, faturas, tickets, atividade), §20 e §47 (jornadas e a história cruzada),
§17 e §70 (atividade e auditoria), §46 (registos flagship — Meridian Controls Group e os
outros têm histórias curadas; usa-os para verificar), §31 (dados imperfeitos). Backend:
resources/customers.ts, sales.ts, finance.ts, support.ts, e as operações de escrita do
§79 que um cliente permite (editar, mudar de estado, atribuir dono).

O que o ecrã tem de responder: quem é este cliente, o que se passa com ele agora, o que
aconteceu, o que está ligado a ele, e o que posso fazer — com as permissões da persona a
decidir o que aparece e o que aparece desligado. Pelo menos uma edição real com validação
do backend e uma ação com confirmação. Um erro de conflito determinístico (§78.2,
STALE_VERSION) tem de ter uma resposta desenhada.

Decisões que provavelmente nascem aqui: a anatomia de uma página de detalhe (cabeçalho,
secções, relacionados, atividade) e onde cada coisa fica pinada; como o detalhe se lê a
390px; formulários — inline, em camada, em página; como um conflito de versão é dito ao
leitor. Tópicos prováveis: "detail pages" (DP) e "forms" (FM). Só cria o que uma decisão
concreta pedir.

Verifica no telemóvel: as abas do detalhe ficam ao alcance com a página rolada; uma camada
aberta fecha com o gesto de voltar do sistema sem sair do cliente; um formulário com o
teclado virtual aberto continua utilizável (emula com uma altura de 500px).
```

## Prompt 3 — Sales Orders e Sales Order, com aprovações

```text
Ecrãs: a lista de pedidos de venda /sales/orders, o pedido /sales/orders/:id e a fila de
aprovações /sales/approvals — a rota que o popover de approvals no banner já abre.

Domínio: §10 (Sales), §59 (contrato do pedido de venda: estados, transições, linhas,
reservas), §58 (cotações, na medida em que um pedido nasce de uma), §67 (motor de
aprovações), §60 (reservas de inventário que um pedido cria), §80 e §81 (invariantes e
códigos de erro), §82 (regras de negócio semeadas para casos de UI), §78.2 (conflitos
determinísticos: ORDER_ALREADY_CANCELLED, APPROVAL_ALREADY_DECIDED, INVENTORY_CHANGED).
Backend: resources/sales.ts, commands/sales.ts, commands/approvals.ts, §79.

O que tem de existir: uma lista que mostra onde cada pedido está no seu ciclo; um pedido
com as suas linhas, totais, estado, o que o bloqueia e as transições permitidas à persona;
aprovar e rejeitar a partir da fila e a partir do pedido, com o motivo; cancelar com
confirmação; e a resposta correta a cada conflito do §78.2 — o leitor tem de perceber o
que mudou e o que pode fazer a seguir, sem perder o que escreveu.

As decisões que este ecrã força: como um ciclo de estados é mostrado e onde; uma grelha de
linhas com valores monetários a 390px; o vocabulário de uma ação que falhou por conflito
versus uma que falhou por transporte (503 do perfil degradado) — são duas coisas e o
leitor tem de as distinguir. Tópico provável: "errors and conflicts" (ER).

Verifica com a persona que não pode aprovar e com a que pode; com o cenário "Support
Incident" ou outro que altere a fila; e a fila de aprovações depois de aprovar um item a
partir do popover do banner — a contagem no banner, a fila e o pedido têm de concordar.
```

## Prompt 4 — Invoice e Payment

```text
Ecrãs: a fatura /finance/invoices/:id (e a lista /finance/invoices que leva a ela) e o
registo de um pagamento contra a fatura.

Domínio: §13 (Finance), §66 (contrato financeiro: fatura, pagamento, alocação, crédito,
vencimentos), §57 (moeda, imposto — os totais têm de bater com o backend), §80 (invariantes
cruzados: uma fatura paga não recebe pagamento), §78.2 (INVOICE_ALREADY_PAID), §77.10 e
§78 (o perfil degradado falha GET /finance/overview em 35% e 5% das mutações). Backend:
resources/finance.ts, commands/finance.ts, §73.

O que tem de existir: a fatura com linhas, totais, estado e o que falta receber; o
histórico de pagamentos; registar um pagamento com valor, data, método e referência,
validado pelo backend, com a resposta ao pagamento em excesso, à fatura já paga e ao 503;
os vencidos visíveis na lista e no detalhe com a idade certa relativamente ao relógio de
demonstração (avança dias no painel e confirma).

Aqui o transporte degradado é o teste principal: liga-o no painel antes de começar a
verificar e faz o percurso inteiro assim. Cada pedido que falha tem de dizer que falhou e
deixar o leitor tentar de novo sem perder o que escreveu; cada pedido lento tem de mostrar
que está a decorrer. O que a família não oferecer para isto (uma ação "tentar de novo"
num toast, por exemplo — há uma linha no ledger sobre isso) é linha no ledger, não código
próprio a fingir a família.

Formatação: moeda, datas e números seguem a preferência do utilizador (a página de
preferências existe) e o §53 — verifica com uma persona em pt-BR e outra em en-US se o
backend distinguir.
```

## Prompt 5 — Dashboard

```text
Ecrã: o dashboard, /dashboard — o flagship de domain.md §34.1. Só faz sentido depois dos
quatro anteriores: cada número do dashboard é uma porta para um ecrã que agora existe.

Domínio: §34.1 (o que tem de responder: como vai o negócio, o que mudou, o que precisa de
atenção), §16 e §72 (KPIs e as suas definições — os números têm de ser os do backend, não
recalculados no cliente), §26 e §77 (cenários: o dashboard é onde um cenário se vê
primeiro; "System Degraded", "Support Incident" e os outros têm de ler diferente), §25
(relógio de demonstração), §23 (distribuições realistas — os gráficos têm de parecer
verdadeiros). Backend: resources/analytics.ts.

O que tem de existir: os indicadores do §34.1 que o backend fornece, cada um com a sua
tendência e a sua porta; alertas operacionais que levam ao registo em causa; atividade
recente; e a resposta ao overview a falhar em 35% no perfil degradado — um dashboard
parcial tem de dizer o que falta e continuar útil.

Decisões que nascem aqui: como um painel de indicadores se lê a 390px (ordem, o que se
esconde, o que se resume); como um gráfico e o seu número coexistem; o que um cartão de
alerta promete ao ser tocado. Um gráfico é a família `chart` (`@slotted/angular/chart`,
`figure[slChart]`; linha, área, barra, pizza e dispersão); o motor `echarts` entra no
`package.json` da demo com o primeiro gráfico. A skill dataviz do repositório, se existir
na sessão, diz como um gráfico é desenhado; as reference pages dizem que famílias desenham
o quê.

Verifica em todos os cenários do painel de demonstração, em duas personas, e com o
relógio avançado até ao fim do mês: os números mudam, os textos relativos ("há 3 horas")
acompanham, e nada do que o dashboard mostra contradiz os ecrãs para onde aponta.
```
