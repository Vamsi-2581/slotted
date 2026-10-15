# Nexora — prompt do módulo CRM

Um prompt para fechar o módulo inteiro, não um ecrã. Colar depois do preâmbulo de
`nexora-vertical-slice-prompts.md`. Substitui os prompts 1 e 2 desse ficheiro quando
a lista e o 360 já estão entregues: o que falta está enumerado no bloco.

```text
Módulo: CRM inteiro, /crm. Não é um ecrã: é o conjunto de ecrãs que fecha o módulo, em
fatias de três tarefas com checkpoint, até que nenhuma rota de /crm abra num placeholder e
nenhum estado do §33 fique por desenhar. O módulo só está feito quando um operador de
vendas consegue, sem sair dele: encontrar uma conta, abri-la, criá-la, corrigi-la, gerir
os seus contactos e moradas, escrever-lhe uma nota, e importar um ficheiro de contas.

## O que já existe (não refazer, reconciliar)

- /crm/customers — lista com data-grid em modo servidor, filter-bar (busca, pills,
  vistas guardadas), paginação no rodapé da grelha, action-bar de seleção no rodapé da
  página, colunas reduzidas no telemóvel. Store: core/crm/customers.store.ts.
- /crm/customers/:id — Customer 360 com cabeçalho (visual, duas tags, subtítulo), quatro
  stat-cards no corpo, sete separadores (Overview, Contacts, Orders, Invoices, Tickets,
  Notes, Activity), hold/release/archive/nota. Store: core/crm/customer.store.ts.
- Guidelines já assentes e que se aplicam a tudo o que falta: AF-01..AF-05, LA-01..LA-04,
  SC-01..SC-06, CP-01, CP-02, LP-01..LP-06, RP-01..RP-04. Lê-as antes de compor.
- Ledger com as frições já classificadas: não voltes a abrir linha para a mesma coisa;
  acrescenta o novo caso à linha existente quando for a mesma causa.

## Ecrãs a entregar

1. /crm/customers/new — criar uma conta. Domínio §56.1 e §56.2 (forma canónica, regras de
   estado, número de conta imutável), §55.4 (customers.create), §32 (microcopy). Backend:
   commands/crm.ts create — nome, segmento, indústria, região, termos, limite de crédito,
   lista de preços, dono, equipa, e opcionalmente o contacto primário e a morada de
   faturação numa só transação. O backend recusa com 422 VALIDATION_FAILED e fieldErrors
   por campo: cada um tem de chegar ao campo certo, não a um toast. Ao guardar, o ecrã
   abre a conta criada.
2. Edição da conta, dentro do 360. Backend: commands/crm.ts update com If-Match
   (§53.11): sem versão é 428 PRECONDITION_REQUIRED, com versão velha é 409 STALE_VERSION,
   e essa colisão tem de ter uma resposta desenhada — o leitor vê o que mudou e decide.
   O limite de crédito exige customers.credit_edit; uma persona sem a permissão vê o campo
   como leitura e não como ausência. Campos: nome, nome legal, segmento, indústria, site,
   banda de colaboradores, termos, lista de preços, dono, equipa, tags, isenção de imposto.
3. Contactos e moradas, dentro do 360. Backend: commands/crm.ts contacts.create,
   contacts.update, contacts.setPrimary e addresses.create. Um contacto primário por conta,
   trocado atomicamente (§56.4); uma morada tem tipo, instruções de entrega e marca de
   omissão (§53.9). Não há comando para remover um contacto nem para editar uma morada:
   confirma no backend antes de desenhar o controlo e, se não existir, é linha na tabela
   Backend do ledger, não um botão que mente.
4. /crm/contacts — a lista de contactos do inquilino, com a sua própria pesquisa, filtros
   (estado, conta, método preferido) e a ligação para a conta de cada um. Atenção: o
   backend não expõe hoje um recurso de contactos ao nível do inquilino — confirma em
   api/index.ts e resources/. Triagem antes de código: ou o cliente compõe a lista a partir
   do que existe e a limitação fica no ledger com o custo medido, ou o ecrã diz o que não
   consegue fazer. Não inventes um endpoint.
5. /crm/imports (ou a rota que o modelo de navegação der) — o mapeador de CSV de contas.
   Domínio §71.3 (ImportJob, estados, transacional por linha), §34.8 (o mapeador como ecrã
   flagship), §33 (sucesso parcial, é aqui que ele vive). Backend: commands/platform.ts
   imports.customers e GET /imports/:id. O ecrã mostra o ficheiro, o mapa de colunas, a
   pré-visualização, o resultado por linha e o que falhou com a razão. É o ecrã mais
   interativo do módulo: se a fatia não chegar para ele, termina a fatia com o checkpoint
   a dizê-lo — não o entregues pela metade.

## Estados, permissões e cenários

Cada ecrã responde a todos os estados do §33 que lhe caibam. Em particular, e para todo o
módulo: pendente ≠ vazio; vazio ≠ vazio-por-filtro; erro com repetição; conflito de versão;
sucesso parcial; leitura-apenas por permissão; arquivado. A permissão decide entre mostrar
desligado e não mostrar: uma ação que a persona nunca poderá fazer não ocupa espaço; uma
que ela poderia fazer noutro registo aparece desligada com a razão.

Personas obrigatórias na verificação: sofia-ramirez (gestora, tudo), noah-bennett
(representante — mutações só nas contas próprias, o que torna metade das ações negadas em
contas alheias), owen-price (auditor, leitura), jordan-wells (sem customers.view, a rota
inteira negada). Cenários: healthy, new_tenant (catorze contas — é onde os estados vazios
aparecem a sério), restricted_user, collections_pressure e system_degraded.

## Qualidade visual — a barra desta entrega

"Feito" aqui inclui o acabamento. Antes de dar qualquer ecrã por entregue:

- Espaçamento: nenhum irmão escrito pela página fica colado nem afastado por acaso. CP-02
  é a regra; a verificação é mecânica — todo elemento próprio com irmão é filho de inline
  ou stack com gap da escala, e nenhum texto próprio herda o tamanho do documento dentro de
  uma região cujas famílias definem o seu. Mede no browser em vez de confiar na captura.
- Uma forma por ideia: duas indicações do mesmo tipo ao lado uma da outra usam a mesma
  família e o mesmo tamanho; a marca ao lado de um título é a menor que a família dá.
- Microcopy do §32: nada de "Item 1", "Test customer" ou frases de sistema. Um estado vazio
  diz o que falta e o que fazer a seguir, com números do cenário carregado.
- Densidade e esquema: os dois esquemas (claro e escuro) e as três densidades do tema; um
  ecrã que só lê bem em comfortable/claro não está feito.
- Tipografia: um ecrã não inventa tamanhos; usa os passos da família de tipografia.

## Decisões que provavelmente nascem aqui

Formulários é o tópico que falta e que este módulo vai pedir: onde vive um formulário de
criação (página própria, camada, em linha), onde ficam as ações que confirmam, como um
erro do servidor por campo chega ao campo, o que acontece a um rascunho quando o leitor
sai, como um conflito de versão é dito. Cria o tópico com prefixo FM quando a primeira
decisão concreta aparecer, pelo esquema de writing-rules.md. Import pode pedir um tópico
próprio; só o cria se a decisão não couber em FM.

Guidelines existentes podem precisar de emenda em vez de regra nova: uma regra cuja
redação melhora mantém o número; uma cujo sentido muda é retirada e reescrita com número
novo. RP-03 fala de separadores de registos relacionados — se a edição em linha mudar o que
um separador contém, é RP que se emenda.

## Verificação por ecrã, antes do checkpoint

- 1280, 570 e telemóvel emulado (390×844 e 360×780): a lista de elementos mais largos que
  o viewport vem vazia; todos os controlos a 44px com ponteiro grosso.
- Transporte normal e degradado pelo painel de demonstração.
- Percurso completo no telemóvel: criar uma conta, corrigi-la, acrescentar um contacto,
  torná-lo primário, escrever uma nota, voltar à lista com o gesto de voltar do sistema.
- ng test na demo com specs para cada comportamento prometido — em particular as regras do
  backend (primário único, versão em conflito, 422 por campo, sucesso parcial do import).
- pnpm --filter @slotted/<pkg> verify e pnpm check quando tocas o pacote; pnpm demo:refresh
  e servidor reiniciado antes de capturar.

## Fecho

Não commites. Cada fatia termina com o checkpoint em .claude/progress/current.md e o
relato: veredictos (pacote / demo / backend) por observação, ficheiros, linhas do ledger,
regras novas ou emendadas, o que ficou aberto e porquê. O módulo termina quando o relato
puder dizer que nenhuma rota de /crm abre num placeholder.
```
