# Nexora Operations — Shell: desenho

Fonte normativa do domínio: `docs/nexora-op-demo-domain.md` (referências `§n`
abaixo). Backend: `@slotted/demo-nexora-operations` (§2). Este documento fixa
o Shell do cliente Angular sobre esse backend.

Decisão que diverge do documento de domínio: o cliente canónico desta fase é
Angular 22 (§84 fixa React). O cliente React entra depois como paridade em
`apps/demos/nexora-react`.

## 1. Escopo

Entra:

- a app Angular `@slotted/demo-nexora-angular` em `apps/demos/nexora-angular`,
  membro do workspace da biblioteca, consumindo `@slotted/*` por tarball do
  canal beta e o backend simulado por `workspace:*`;
- Shell: banner, navegação, conteúdo, painel de demonstração, menu de
  utilizador, preferências, notificações, pesquisa e command palette, ecrã de
  sign-in, estados de espera, erro e acesso negado;
- todas as rotas do Apêndice A registadas, com página de espera honesta nas
  áreas ainda não construídas;
- Dashboard mínimo: cabeçalho de página e os contadores da sessão.

Não entra: qualquer módulo de negócio (CRM, Sales, …), analytics, alterações
ao backend simulado.

## 2. Backend

O backend é `@slotted/demo-nexora-operations` (`apps/demos/nexora-operations`,
vindo da branch `feat/nexora-materialization-calibration`): domínio, seed,
projeções, comandos, aprovações, cenários e latência do documento de domínio,
com API tipada in-process — `createNexoraBackend({ scale, latency, persona,
scenario })`. O Shell consome desta superfície:

| Superfície | Uso no Shell |
| --- | --- |
| `session.get()` → `SessionInfo { user, roles, teams, permissions, warehouseIds: string[] \| 'all', organization, demo: { scenarioId, demoClock, today, … }, personas, unreadNotifications, pendingApprovals }` | sessão, gating por permissão, contagens do banner, personas do sign-in |
| `inventory.warehouses()` | nomes dos armazéns do contexto do banner |
| `notifications.list({ includeArchived, page, pageSize })`, `notifications.markRead(id)`, `notifications.markAllRead()`, `notifications.archive(id)` | popover e página de notificações |
| `tasks.list({ mine: true })` | popover de tarefas |
| `approvals.list()` | popover de aprovações |
| `search(q)` → `{ query, groups: { type, hits }[] }` | command palette |
| `activity.list()` | Dashboard |
| `demo.setPersona(keyOrUserId)`, `demo.setScenario(id)`, `demo.reset(scenario?)`, `demo.advanceClock(hours)`, `demo.setLatency('none' \| 'normal' \| 'degraded')`, `demo.scenarios()` | painel de demonstração |

Erros: `NexoraApiError { status, code, retryable, correlationId, fieldErrors? }`.

Propriedades do backend que o Shell absorve sem o alterar:

- estado em memória: uma recarga da página recomeça do seed; a persona ativa,
  o cenário e as preferências de aparência são guardados pelo cliente em
  `localStorage` e reaplicados no arranque (`createNexoraBackend({ persona,
  scenario })`);
- sem preferências de utilizador no backend: `UserPreferences` (§8) vive só no
  cliente;
- `Notification` sem `route`: o cliente deriva a rota de `entityType` +
  `entityId`;
- seed síncrono (`light` ≈ 2,6 s no browser, `demo` ≈ 11 s): o backend é
  criado depois do primeiro paint, com o Shell em esqueleto; `scale` por
  `?scale=demo` na URL, `light` por defeito;
- sign-out não existe: o cliente limpa a persona guardada e mostra `/sign-in`,
  onde escolher uma persona chama `demo.setPersona`.

## 3. Estrutura

```
apps/demos/
  .registry/                    tarballs do canal beta (git-ignored)
  nexora-operations/            @slotted/demo-nexora-operations — backend simulado
  nexora-angular/               @slotted/demo-nexora-angular — este Shell
```

`apps/demos/*` está em `pnpm-workspace.yaml`; a app declara `@slotted/angular`,
`@slotted/core` e `@slotted/theme-default` por `file:../.registry/*.tgz` e
`@slotted/demo-nexora-operations` por `workspace:*`. O backend expõe fonte
TypeScript; o `serve` exclui-o do prebundle do Vite
(`angular.json` › `serve.options.prebundle.exclude`).

## 4. Cliente Angular — infraestrutura

### 4.1 Backend no cliente

`provideNexoraBackend()` regista `NEXORA_BACKEND: InjectionToken<BackendHandle>`.
`BackendHandle` expõe `api: Signal<NexoraApi | null>`, `status: Signal<'idle' |
'seeding' | 'ready'>`, `create(options)` e `recreate(options)`. A criação corre
em `setTimeout(0)` depois do primeiro paint, com `scale` lido de `?scale=` (por
defeito `light`), `persona` e `scenario` lidos de `localStorage`
(`nexora:demo`). Os stores esperam `status() === 'ready'` antes do primeiro
pedido. Nos testes, `provideTestBackend()` cria o backend de forma síncrona com
`scale: 'light'` e `latency: 'none'` (uma instância por ficheiro de teste,
partilhada entre os `it`, porque o seed custa 3 s).

Erros chegam como `NexoraApiError`; `isApiError(error, code?)` é o único
teste que o cliente faz sobre eles.

### 4.2 Estado

Serviços `providedIn: 'root'`, estado em signals:

- `SessionStore`: `session: Signal<SessionInfo | null>`, `status: 'idle' |
  'loading' | 'ready' | 'error' | 'unauthenticated'`, `load()`, `reload()`,
  `can(permission)`, `canAny(...permissions)` (sobre `session.permissions`;
  o escopo por registo é decidido pelo backend), `warehouses:
  Signal<Warehouse[]>` (de `inventory.warehouses()` filtrado por
  `warehouseIds`). `unauthenticated` quando não há persona guardada e o
  utilizador fez sign-out nesta sessão de browser.
- `PreferencesStore`: `preferences: Signal<UserPreferences>` por utilizador
  em `localStorage` (`nexora:preferences:<userId>`); `update(patch)`; escreve
  `data-slotted-scheme`, `data-slotted-density` no `html`; `scheme: 'system'`
  segue `prefers-color-scheme`.
- `NotificationsStore`: `unread` (de `session.unreadNotifications`, recarregado
  por `SessionStore.reload()`), lista por vista (`all` = não arquivadas,
  `unread`, `archived` = `includeArchived: true` filtrado no cliente), ações
  `markRead`, `markAllRead`, `archive`; `routeFor(notification)` deriva a
  rota de `entityType`/`entityId`.
- `ApprovalsStore`, `TasksStore`: contagens (`session.pendingApprovals`,
  `tasks.list({ mine: true }).page.totalItems`) e listas.
- `SearchService`: `search(q)` com debounce 150 ms e cancelamento; `recent`
  (últimos 8 documentos abertos, `localStorage`, por utilizador).
- `DemoStore`: `session.personas`, `demo.scenarios()`, ações; após persona,
  cenário ou reset: grava `nexora:demo`, `SessionStore.reload()`, navegação
  para `preferences.startRoute`, toast.
- `ClockService`: `now()` a partir de `session.demo.demoClock` mais o tempo
  decorrido desde o carregamento; `relative(instant)` ("14 minutes ago", "in
  3 days") e formatação em `organization.timezone`; `Intl` com `en-US`.

### 4.3 Roteamento

`/sign-in` fora do Shell. Tudo o resto sob `ShellLayout` com `canMatch`
`sessionReady` (carrega a sessão; `unauthenticated` redireciona para
`/sign-in`). Cada rota do Apêndice A é um `PermissionGate` com a página e as
permissões em `data`. Acesso negado não redireciona: a rota renderiza
`ForbiddenPage` no lugar, com a permissão em falta e um link para o Dashboard.
Rotas desconhecidas: `NotFoundPage`.

Mapa módulo → permissão → destinos:

| Módulo | Permissão | Destinos |
| --- | --- | --- |
| Home | — | `/dashboard` |
| CRM | `customers.view` | customers, contacts |
| Sales | `orders.view` ou `quotes.view` | quotes, orders, approvals (`orders.approve` ou `quotes.approve`) |
| Catalog | `catalog.view` | products, categories, price-lists |
| Inventory | `inventory.view` | overview, warehouses, transfers, movements |
| Procurement | `suppliers.view` ou `purchase_orders.view` | suppliers, purchase-orders, receiving |
| Finance | `finance.dashboard` ou `invoices.view` | overview, invoices, payments, reconciliation |
| Support | `support.view` | inbox |
| Analytics | `analytics.view` | executive, sales, inventory, finance, support |
| Automations | `workflows.view` | workflows |
| Activity | — | `/activity` |
| Audit | `audit.view` | `/audit` |
| Settings | `organization.view` ou `users.view` ou `roles.view` | organization, users, teams, roles, warehouses, preferences, integrations |

`/notifications`, `/profile`, `/settings/preferences` sem permissão: são do
próprio utilizador.

Páginas de espera: `PlaceholderPage` recebe título e módulo, renderiza
`slPage` + `slPageHeader` com breadcrumbs e um `slResultState` "This area is
not built yet" com a fatia em que entra. A rota existe, o URL é estável e o
título do documento é `<Página> · Nexora`.

## 5. Shell

`ShellLayout` compõe `slAppShell` com `primary="banner"`, `canvas="inset"`,
`navMode="auto"`, `collapsedTo="rail"`, `scroll="content"`. Estado
`navOpen` persistido por utilizador em `localStorage`.

### 5.1 Banner — `top-navigation`

`header[slAppShellBanner]` contém um `slTopNavigation`:

- `[slTopNavigationBrand]`: `[slTopNavigationHome]` (link para
  `startRoute`) com `[slTopNavigationMark]` (a marca, §11) e
  `[slTopNavigationName]` "Nexora"; `[slTopNavigationContext]` com o nome de
  exibição da organização e, para sessões com escopo de armazém, o código e o
  nome do armazém ("CHI-01 · Chicago Central"). Com mais de um armazém no
  escopo, o primeiro e "+n".
- `button[slAppShellNavToggle]` antes da marca, só em `navMode` overlay.
- `[slTopNavigationSearch]`: `[slCommandPaletteTrigger]` com aspeto de campo
  de pesquisa (placeholder "Search or jump to…", `kbd[slShortcut] mod+k`).
- `[slTopNavigationActions]`, por ordem: Approvals (ícone `clipboard-check`,
  `[slTopNavigationCount]` com pendentes; abre popover), Tasks (ícone
  `list-todo`, contagem de abertas; popover), Notifications
  (`button[slTopNavigationNotifications]`, contagem de não lidas; popover
  §9), Help (`slTopNavigationHelp`; menu: Keyboard shortcuts, Documentation,
  What's new, Support), Demo (ícone `flask-conical`, `tone="secondary"`,
  tooltip "Demo controls"; abre o drawer §7.4), Account
  (`button[slTopNavigationAccount]` com avatar de iniciais; menu §8).

Contagens vêm dos stores e atualizam depois de cada mutação. Cada botão tem
`aria-label` com a contagem ("Notifications, 4 unread").

### 5.2 Navegação — `side-navigation`

`nav[slAppShellNav]`:

- `[slAppShellNavHeader]`: avatar quadrado da organização (iniciais "AI",
  `tone="accent" variant="solid"`), nome da organização e, abaixo, o papel do
  utilizador. Na calha (rail) só o avatar.
- `[slAppShellNavBody]`: `slSideNavigation` com `[(value)]` ligado à rota
  ativa (o `value` é o id do destino; a sincronização é `router.events` →
  `value` e `valueChangeRequest` → `router.navigate`). Secções:
  - sem rótulo: Home;
  - "Operate": CRM, Sales, Catalog, Inventory, Procurement, Finance, Support —
    cada módulo com `slSideNavigationTrigger` que abre os destinos (grupo
    `ul[slSideNavigationGroup]`); Sales › Approvals e Support › Inbox mostram
    `[slSideNavigationCount]`;
  - "Insight": Analytics, Automations, Activity, Audit;
  - "Manage": Settings.

  Um módulo sem permissão não é renderizado (a rota continua guardada). A
  secção fica ausente quando nenhum módulo dela é visível. Ícones Lucide por
  módulo: `layout-dashboard, users, shopping-cart, package, warehouse,
  truck, landmark, life-buoy, chart-column, workflow, activity,
  scroll-text, settings`.
- `[slAppShellNavFooter]`: `button[slAppShellNavToggle]` (recolher para a
  calha) e, ao lado, o estado da ligação — `slStatusIndicator` "All systems
  normal" ou "Degraded" quando `transportProfile === 'system_degraded'` ou
  após um `503` nos últimos 60 s.

### 5.3 Conteúdo

`main[slAppShellMain]` com `<router-outlet>`. Cada página é `slPage` com
`slPageHeader`; o Shell não desenha cabeçalhos. Enquanto a sessão carrega, o
Shell renderiza esqueletos (`slSkeletonRegion`: 8 linhas na navegação, um
cabeçalho e três blocos no conteúdo). Falha ao carregar a sessão: página
inteira com `slResultState` "Nexora is unavailable", a mensagem do erro, botão
Retry.

### 5.4 Painel de demonstração — `drawer`

`sl-drawer` à direita, título "Demo controls", descrição "Simulated Asteron
environment. Nothing here exists in the product.". Secções:

- **Persona**: lista (`slList` de `slListItem` selecionável) das nove personas
  com avatar, nome, papel e contexto; a ativa marcada; clicar → `POST
  /demo/persona`, o drawer fecha, toast "Signed in as Noah Bennett".
- **Scenario**: `sl-select` com os nove estruturais e a descrição de cada um;
  trocar abre `sl-alert-dialog` "Switching scenario resets demo data" com
  Continue/Cancel.
- **Business date**: a data em `America/Chicago`, e botões "+1 day", "+7 days",
  "End of month".
- **Transport**: `slToggle` "System degraded" (latência e falhas do §77.10).
- **Reset**: `slButton tone="danger" variant="outline"` "Reset demo data" →
  `sl-alert-dialog`.

Atalho `mod+shift+d`. O drawer e as ações estão também no command palette.

### 5.5 Atalhos

`mod+k` pesquisa, `mod+shift+d` demo, `?` (fora de campos) diálogo de
atalhos, `g` seguido de `h/c/s/i/f` navega para Home/CRM/Sales/Inventory/
Finance (só para módulos visíveis), `esc` fecha o que estiver aberto. O
diálogo de atalhos lista-os com `kbd[slShortcut]`.

## 6. Menu de utilizador e preferências

`sl-menu` aberto por `button[slTopNavigationAccount]`:

- cabeçalho (não interativo): avatar, nome, e-mail, "Sales Manager · Enterprise
  Sales";
- Your profile → `/profile`;
- Preferences → `/settings/preferences`;
- `sl-menu-radio-group` "Appearance": Light / Dark / System (escreve
  `PreferencesStore.scheme`; efeito imediato);
- `sl-menu-radio-group` "Density": Comfortable / Compact / Dense;
- Keyboard shortcuts (abre o diálogo);
- separador; Sign out → limpa `nexora:demo` e marca a sessão
  `unauthenticated`; navegação para `/sign-in`.

`/profile`: `slPage` com `slPageHeader` (avatar grande, nome, título,
departamento, equipas com `slBadge`, papel), `slDescriptionList` com e-mail,
gestor, fuso, último acesso, e a lista das permissões efetivas agrupadas por
área — a leitura humana de `session.permissions`.

`/settings/preferences`: formulário com `slForm`: Appearance, Density, Start
page (`sl-select` dos destinos visíveis), Notification preferences (§89.3:
`emailApprovals`, `emailMentions`, `inAppOperationalAlerts` editáveis;
`inAppApprovals` e `inAppMentions` fixas e mostradas desativadas). Guardar →
`PreferencesStore.update`, toast.

`/sign-in`: fora do Shell, centrado: marca, "Sign in to Asteron Industrial
Supply", e "Accounts on this device" — as nove personas como cartões
(`slCard` clicável) com avatar, nome, papel. Escolher → `demo.setPersona(key)`,
`SessionStore.load()`, navegação para `startRoute`. É a forma que a
demonstração dá a um sign-in; não há palavra-passe.

## 7. Notificações

Popover (`slPopover`, `placement="bottom-end"`, largura 400 px) aberto pelo
sino:

- cabeçalho: "Notifications", contagem de não lidas, botão "Mark all as read"
  (desativado a zero), link "View all";
- lista das 10 mais recentes não arquivadas, agrupadas "Today" / "Earlier"
  pelo relógio de demonstração; item: círculo tonalizado com ícone por tipo
  (`info, circle-check, triangle-alert, circle-alert`), título, corpo em duas
  linhas, tempo relativo, ponto de não lida; clicar no título navega para a
  rota da entidade (quando existe) e marca como lida; ações por item ao hover
  ou foco: Mark as read/unread, Archive;
- vazio: `slResultState` compacto "You're all caught up".

`/notifications`: `slPage` com `slTabs` All / Unread / Archived, a mesma
lista paginada (`slPagination`, 25 por página), as mesmas ações, e "Mark all
as read" no cabeçalho.

A família `notification-center` da biblioteca está em desenho e não está no
beta consumido; quando entrar num beta, esta página e o popover passam a
compor-se com ela e este parágrafo é removido.

## 8. Pesquisa e command palette

`sl-command-palette` único, aberto pelo campo do banner ou por `mod+k`:

- query vazia: grupo "Recent" (últimos 8 documentos abertos) e grupo "Go to"
  com os destinos visíveis;
- query com 1 caractere: só comandos filtrados;
- query com ≥ 2 caracteres: grupo "Commands" (navegação "Go to Customers",
  ações "Create customer" / "Create sales order" / "Open approval queue"
  filtradas por permissão, e "Switch persona…", "Change scenario…", "Reset
  demo data", "Open demo controls") seguido dos grupos de entidades por ordem
  fixa (Customers, Contacts, Sales orders, Quotes, Invoices, Products,
  Suppliers, Purchase orders, Tickets), 8 por grupo, vindos de `GET /search`;
  cada resultado mostra número de negócio, título e subtítulo ("SO-2026-01842
  · Meridian Controls Group");
- ações "Create …" navegam para a rota do módulo com `?new=1` (a página de
  espera reconhece e diz que a criação chega com o módulo);
- rodapé: `kbd` ↑↓ navigate, ↵ open, esc close;
- estado de carregamento por grupo com `slSkeleton`; sem resultados:
  "Nothing matches “xyz”".

Abrir um resultado regista-o em `recent`.

## 9. Marca

- Marca gráfica: SVG inline de 24×24 — um hexágono de traço 2 com três nós
  ligados ao centro (um "nexus"); cor `currentColor`. Usada em
  `[slTopNavigationMark]`, no sign-in (48 px) e no favicon (`public/favicon.svg`,
  cor de acento sobre transparente).
- Nome: "Nexora"; contexto: a organização. Título do documento:
  `<Página> · Nexora`.
- Cor: a família de acento teal já definida em `src/styles.css` por esquema;
  é a marca Nexora, não a de Asteron. Nada mais é sobreposto às famílias.
- Avatar da organização: iniciais "AI", quadrado, acento sólido. Avatares de
  utilizador: iniciais, `tone` derivado do id (seis tons, hash estável), sem
  imagens.

## 10. Estados

| Situação | Comportamento |
| --- | --- |
| Sessão a carregar | esqueletos §7.3 |
| `GET /session` falha | `slResultState` de página inteira com Retry |
| Rota sem permissão | `ForbiddenPage` no lugar, permissão nomeada |
| Rota inexistente | `NotFoundPage` |
| Mutação `503 retryable` | toast `tone="danger"` com ação Retry que repete o pedido |
| `system_degraded` ativo | indicador "Degraded" no rodapé da navegação; latência visível |
| Persona sem armazém (`new_tenant` fora de Maya/Sofia/Noah) | contexto do banner sem armazém |
| Sem notificações / tarefas / aprovações | estado vazio compacto em cada popover |
| Sem persona ativa | `/sign-in` |

## 11. Testes

- `@slotted/demo-nexora-angular` (`vitest` + `@angular/build:unit-test`):
  `provideTestBackend` (backend em memória, `latency: 'none'`),
  `SessionStore.can`, `ShellLayout` renderiza módulos por persona (Sofia vê
  Sales; Jordan não vê Finance), contagens no banner, menu de utilizador
  aplica o esquema ao `html`, popover de notificações marca lida e atualiza a
  contagem, command palette agrupa e filtra por permissão, `PermissionGate`
  renderiza `ForbiddenPage`, atalhos. O backend tem a sua própria suíte em
  `apps/demos/nexora-operations`.
- Verificação visual: screenshots light/dark em 1280 e 420 px pelo mesmo
  método usado nesta sessão (Chrome headless via CDP), guardados em
  `apps/demos/nexora-angular/screenshots/` e não commitados.

## 12. Reconciliação com a biblioteca

Cada fricção encontrada ao construir o Shell é registada em
`apps/demos/nexora-angular/LIBRARY-FEEDBACK.md`: família, o que faltou ou custou, a
versão beta em causa. O documento alimenta a avaliação da API pública; nada
na biblioteca é alterado a partir da demo.
