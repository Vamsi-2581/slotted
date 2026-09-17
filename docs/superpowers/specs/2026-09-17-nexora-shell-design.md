# Nexora Operations — Shell: desenho

Fonte normativa do domínio: `docs/nexora-op-demo-domain.md` (referências `§n`
abaixo). Este documento fixa o que a primeira fatia do produto constrói: os
pacotes `@nexora/*` no recorte que o Shell exige e o Shell do cliente Angular.

Decisões que divergem do documento de domínio:

- O cliente canónico desta fase é Angular 22 (§84 fixa React). O cliente React
  entra depois como paridade em `apps/react`.
- Papéis canónicos: 13, a lista do §55.5 (§75.1 escreve 12). A lista é
  normativa; a contagem é corrigida.
- `Read-only User` (§7) não é seeded: Auditor cobre o caso.

## 1. Escopo

Entra:

- monorepo do produto em `apps/demos/nexora`;
- `@nexora/domain`, `@nexora/data`, `@nexora/api` com identidade, autorização,
  armazéns, notificações, tarefas, aprovações, pesquisa, sessão, cenários,
  relógio, persistência e simulação de transporte;
- Shell: banner, navegação, conteúdo, painel de demonstração, menu de
  utilizador, preferências, notificações, pesquisa e command palette, ecrã de
  sign-in, estados de espera, erro e acesso negado;
- todas as rotas do Apêndice A registadas, com página de espera honesta nas
  áreas ainda não construídas;
- Dashboard mínimo: cabeçalho de página e os contadores da sessão.

Não entra: qualquer módulo de negócio (CRM, Sales, …), o motor de aprovações
completo (§79), idempotência de mutações (§73.9), IndexedDB com Dexie (adapter
próprio, ver §5.5), analytics.

## 2. Estrutura

```
apps/demos/nexora/
  pnpm-workspace.yaml          packages/*, apps/*
  package.json                 scripts: build, test, typecheck, start
  packages/domain/             @nexora/domain
  packages/data/               @nexora/data
  packages/api/                @nexora/api
  apps/angular/                @nexora/angular   (a app atual, movida de apps/demos/nexora-operations)
```

Dependência: `domain ← data ← api ← angular`. `domain` não importa browser,
Angular, `@slotted/*` nem `data`. `@slotted/*` continua a entrar em
`apps/angular` por tarball de `apps/demos/.registry`; `@nexora/*` entram por
`workspace:*`. Os três pacotes são TypeScript puro compilados por `tsc`
(`dist/` com `exports` por subpath), testados com `vitest` em Node.
De `apps/angular`, o registo é `../../../.registry`.

## 3. `@nexora/domain`

Subpaths: `common`, `identity`, `warehouses`, `activity`, `approvals`,
`search`, `session`, `permissions`.

### 3.1 `common`

`EntityMetadata` (§53.3), `Money`, `Quantity`, `CurrencyCode`, ids
`<prefix>_<6 dígitos>` (§53.2) com `makeId(prefix, sequence)` e `parseId`,
`Instant` (UTC ISO-8601) e `BusinessDate` (`YYYY-MM-DD`), `DomainError` com os
códigos do §81 que este recorte usa (`FORBIDDEN`, `NOT_FOUND`,
`INVALID_STATE_TRANSITION`).

### 3.2 `identity`

`Organization` (§89.2), `User` (§89.3), `UserStatus` (§55.1), `Team` (§89.4),
`TeamMembership` (§55.2), `Role`, `PermissionGrant` (§89.5), `RoleAssignment`
(§89.6), `PermissionScope` (§55.3).

### 3.3 `permissions`

`PERMISSION_CATALOG`: o catálogo do §55.4 como `as const`; `Permission` é a
união dos seus valores. `ROLE_GRANTS`: os 13 papéis do §55.5, cada um como
lista de `PermissionGrant`. `authorize(session, permission, resource?)`:

1. falha quando a permissão não está em `session.permissions`;
2. quando `resource` é dado, falha quando nenhum `scope` da sessão para essa
   permissão cobre o recurso: `all` cobre tudo; `own` exige
   `resource.ownerId === session.user.id`; `team` exige interseção entre
   `resource.teamIds` e `scope.teamIds`; `warehouse` exige
   `resource.warehouseId ∈ scope.warehouseIds`.

Devolve `{ allowed: true } | { allowed: false; reason: 'missing' | 'scope' }`.

### 3.4 `warehouses`

`Warehouse { id, organizationId, code, name, timezone, status, metadata }`.

### 3.5 `activity`

`Notification` (§70.3), `Task` (§70.4), `ActivityEvent` (§70.1).

### 3.6 `approvals`

`ApprovalRequest { id, organizationId, type: 'sales_order' | 'quote' |
'purchase_order' | 'credit_limit', entityType, entityId, businessNumber,
subject, amount?: Money, requestedBy, requiredPermission: Permission, status:
'pending' | 'approved' | 'rejected', createdAt, decidedAt?, decidedBy?,
metadata }`. Uma aprovação é "minha" quando `authorize(session,
requiredPermission)` permite e `status === 'pending'`. O motor completo (§79)
substitui esta forma sem mudar o que o Shell lê: um contador e uma lista.

### 3.7 `search`

`SearchEntityType` = `customer | contact | product | sales_order | quote |
invoice | supplier | purchase_order | ticket`. `SearchDocument { type, id,
businessNumber?, title, subtitle?, route, terms: string[], requiredPermission
}`. `SearchHit = SearchDocument & { score }`. `search(index, query, session)`:
mínimo 2 caracteres, case-insensitive, prefixo em `terms`, filtra por
`authorize`, agrupa por tipo, 8 por grupo (§71.2), ordem dos grupos fixa.

### 3.8 `session`

```ts
interface Session {
  organization: Organization;
  user: User;
  roles: Role[];
  teams: Team[];
  permissions: Permission[];
  scopes: Partial<Record<Permission, PermissionScope[]>>;
  warehouses: Warehouse[];          // os acessíveis: todos, ou os do escopo
  now: Instant;                     // demoClock.now()
  businessDate: BusinessDate;       // em America/Chicago
  scenario: ScenarioId;
  transportProfile: 'normal' | 'system_degraded';
  preferences: UserPreferences;
}

interface UserPreferences {
  scheme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact' | 'dense';
  startRoute: string;               // '/dashboard' por defeito
  notifications: User['notificationPreferences'];
}
```

`ScenarioId`: os nove estruturais do §74.6.

## 4. `@nexora/data`

Subpaths: `seed`, `scenarios`, `clock`, `persistence`, `store`.

### 4.1 `seed`

Determinístico: um PRNG (`mulberry32`) semeado por `seedVersion = 'nexora-v1'`
e pelo nome da coleção. Duas execuções produzem estruturas iguais
(`deepEqual`).

- `organization`: `org_000001`, Asteron Industrial Supply (§53.1, §89.2),
  `timezone America/Chicago`, moedas `USD, EUR, GBP`, regiões
  `Midwest, South, Northeast, Mountain`.
- `warehouses`: os cinco do §75.1.1.
- `teams` (14): Enterprise Sales, SMB Sales, Inside Sales, Field Operations,
  Finance, Accounting, Procurement, Customer Support, Warehouse Chicago,
  Warehouse Dallas, Warehouse Atlanta, Warehouse Denver, Executive, IT
  Administration; `type` conforme §89.4.
- `roles` (13): §55.5 com `grants` de `ROLE_GRANTS`; `isSystem: true`.
- `users` (205 = 170 active + 20 invited + 10 suspended + 5 deactivated): as
  nove personas do §55.6 com ids fixos (`usr_000001` Maya Chen … `usr_000009`
  Owen Price), e-mail `<first>.<last>@asteron.example`, título, departamento,
  equipa, gestor; os restantes gerados com nomes de listas fixas, distribuídos
  pelas equipas e papéis. Jordan Wells: `RoleAssignment` com escopo
  `{ type: 'warehouse', warehouseIds: ['wh_000001'] }`; Noah Bennett: escopo
  `team` para as mutações, `all` para leitura (§55.5). Cada persona tem
  `lastActiveAt` relativo ao instante canónico.
- `curated`: os registos do §76 que o Shell referencia sem os módulos
  existirem — Meridian Controls Group `cus_010428 / CUS-010428`,
  `ord_018420 / SO-2026-01842`, `inv_028910 / INV-2026-02891`,
  `sku_000240 / MX-240 Servo Motor`, `shp_009841 / SHP-009841`,
  `tck_010492 / TCK-10492`, mais 40 clientes, 30 produtos, 12 fornecedores, 20
  ordens, 20 faturas, 10 ordens de compra, 12 tickets e 25 contactos nomeados
  — o corpus mínimo para a pesquisa ter resultados agrupados. Cada um vira um
  `SearchDocument`. Quando um módulo for construído, o seu gerador substitui a
  lista curada e continua a produzir os ids do §76.
- `approvals`: pendentes por persona — Sofia: 6 (incluindo `SO-2026-01842`,
  `$86,420`); Priya: 4 (`credit_limit` de Meridian entre elas); Marcus: 0;
  Procurement Manager: 3 `purchase_order`.
- `tasks`: 3 a 8 por persona, `dueDate` relativo ao relógio, uma vencida.
- `notifications`: 12 a 30 por persona, dos quatro tipos, `createdAt` entre
  −21 dias e −5 minutos; as do §17 (`Approval required for SO-2026-01842`,
  `Invoice INV-2026-02891 is 14 days overdue`, `Stock for MX-240 fell below
  safety level`, `Ticket TCK-10492 breached first-response SLA`) atribuídas às
  personas cujo papel as recebe; 30 % lidas.
- `activity`: 40 eventos globais para o Dashboard.

### 4.2 `clock`

`DemoClock { now(): Instant; businessDate(timezone): BusinessDate;
advance(duration) }`, instante canónico `2026-09-04T15:00:00Z` (§53.6). O
avanço persiste (§4.4). Toda a data relativa nos pacotes e no cliente é
calculada a partir dele; `Date.now()` não é chamado fora do `clock`.

### 4.3 `scenarios`

`applyScenario(seed, scenarioId) → SeedState`. Neste recorte:

- `healthy`: seed sem alteração; persona por defeito Sofia Ramirez.
- `restricted_user`: persona Jordan Wells, escopo `CHI-01`, `inventory.adjust`
  removido (§77.8).
- `new_tenant`: 3 utilizadores ativos (Maya, Sofia, Noah), 1 armazém, corpus
  de pesquisa reduzido a 14 clientes e 24 produtos, notificações de
  onboarding, aprovações e tarefas vazias.
- `month_end`: `businessDate` = último dia útil do mês do instante canónico;
  aprovações ×1.8; notificações de finanças elevadas.
- `inventory_crisis`, `collections_pressure`, `support_incident`: só o que o
  Shell mostra — notificações e aprovações adicionais coerentes com §77.6,
  §77.7, §77.9.
- `enterprise_scale`, `heavy_data`: sem efeito neste recorte; registados para
  não falhar a troca.

`system_degraded` não é estrutural: é `transportProfile` (§74.6) e não faz
reset.

### 4.4 `persistence`

`Persistence { read(collection, id), list(collection), write(collection,
record), remove(collection, id), readMetadata(), writeMetadata(), clear() }`.
Dois adaptadores: `IndexedDbPersistence` (nome `nexora`, uma object store por
coleção, `DemoDatabaseMetadata` §74.1 em `metadata`) e
`MemoryPersistence` para testes. Coleções mutáveis: `notifications`,
`tasks`, `approvals`, `preferences`, `demo` (persona ativa, cenário, relógio,
perfil de transporte). O seed não é persistido: é recalculado ao arrancar e as
coleções mutáveis sobrepõem-se por id.

### 4.5 `store`

`Store` junta seed, cenário, relógio e persistência: `open()` lê os metadados,
recalcula o seed, aplica o cenário, carrega as coleções mutáveis;
`reset(scenarioId)` executa §74.5; `switchScenario(id)` faz `reset` (§74.6);
`setPersona(userId)` exige `status === 'active'` (§55.1). Um `schemaVersion` ou
`seedVersion` diferente do persistido apaga a base e recomeça (§74.2).

## 5. `@nexora/api`

Subpaths: `.` (`createApi(store, options)`), `transport`, `simulation`.

### 5.1 Transporte

```ts
interface ApiRequest  { method: 'GET' | 'POST' | 'PATCH'; path: string; query: URLSearchParams; headers: Record<string, string>; body?: unknown }
interface ApiResponse { status: number; headers: Record<string, string>; body: unknown }
interface Api { handle(request: ApiRequest): Promise<ApiResponse> }
```

Base `/api/v1` (§73.2). Respostas `{ data }` e `ListResponse` (§73.3, §73.4).
Erros `ApiError` (§73.10) com os códigos do §73.11; `correlationId` é
`req_<6 dígitos>` sequencial por sessão de browser.

### 5.2 Rotas

```
GET   /session                          → { data: Session }
PATCH /me/preferences                   → { data: UserPreferences }
GET   /notifications?view=all|unread|archived&page&size
POST  /notifications/:id/read
POST  /notifications/:id/unread
POST  /notifications/:id/archive
POST  /notifications/read-all
GET   /notifications/count             → { data: { unread } }
GET   /tasks?assignee=me&status=open
GET   /approvals?assignee=me            → pendentes cobertas por authorize
GET   /approvals/count                  → { data: { pending } }
GET   /search?q=                        → { data: SearchGroup[] }
GET   /activity?page&size
GET   /demo                             → { data: { personas, scenarios, clock, transportProfile } }
POST  /demo/persona   { userId }
POST  /demo/sign-out
POST  /demo/scenario  { scenarioId }
POST  /demo/clock/advance { days }
POST  /demo/reset
POST  /demo/transport { profile }
```

`personas` em `GET /demo` são as nove do §55.6 com papel e contexto; a troca
aceita qualquer utilizador ativo.

### 5.3 Autorização

Cada handler chama `authorize` antes de ler ou escrever (§55.3: esconder na UI
não é autorização). `403 FORBIDDEN` leva `details.permission` para o cliente
nomear o que falta. Notificações, tarefas e preferências são sempre do
utilizador da sessão; um id de outro utilizador responde `404`.

### 5.4 Simulação

`normal` (§78.1): leitura 120–450 ms, escrita 180–650 ms, pesquisa 180–500
ms, jitter determinístico por hash de `method+path+query`. `system_degraded`
(§77.10): base 700 ms + jitter 0–900 ms, `GET /activity` 15 % `503`, mutações
5 % `503` com `retryable: true`. Uma opção `latency: 'none'` para testes.

## 6. Cliente Angular — infraestrutura

### 6.1 Transporte

`provideNexoraApi()` regista um `HttpInterceptorFn` que intercepta
`/api/v1/*`, converte `HttpRequest` em `ApiRequest`, chama `api.handle` e
devolve `HttpResponse` ou `HttpErrorResponse`. Os serviços usam `HttpClient`
como contra um servidor. Um `ApiErrorPipe`/`parseApiError(error)` extrai
`ApiError` de `HttpErrorResponse`.

### 6.2 Estado

Serviços `providedIn: 'root'`, estado em signals:

- `SessionStore`: `session`, `status: 'loading' | 'ready' | 'error'`,
  `load()`, `can(permission, resource?)` (o mesmo `authorize` do domínio sobre
  a sessão carregada), `reload()`.
- `PreferencesStore`: escreve `data-slotted-scheme`, `data-slotted-density`
  no `html`; `scheme: 'system'` segue `prefers-color-scheme`; persiste via
  `PATCH /me/preferences`.
- `NotificationsStore`: contagem, lista por vista, ações; recarrega a contagem
  após cada mutação e quando o painel abre.
- `ApprovalsStore`, `TasksStore`: contagens e listas.
- `SearchService`: `search(q)` com debounce 150 ms e cancelamento; `recent`
  (últimos 8 documentos abertos, `localStorage`, por utilizador).
- `DemoStore`: `GET /demo`, ações; após persona, cenário ou reset: `SessionStore.reload()`,
  navegação para `session.preferences.startRoute`, toast de confirmação.
- `ClockService`: `now()` a partir de `session.now` mais o tempo decorrido
  desde o carregamento; `relative(instant)` ("14 minutes ago", "in 3 days")
  e formatação em `America/Chicago`; `Intl` com `en-US`.

### 6.3 Roteamento

`/sign-in` fora do Shell. Tudo o resto sob `ShellLayout` com `canMatch`
`sessionReady` (carrega a sessão; sem persona ativa redireciona para
`/sign-in`). Cada módulo do Apêndice A é um `loadChildren` lazy com
`canActivate: requirePermission(...)`. Acesso negado não redireciona: a rota
renderiza `ForbiddenPage` no lugar, com a permissão em falta e um link para o
Dashboard. Rotas desconhecidas: `NotFoundPage`.

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

## 7. Shell

`ShellLayout` compõe `slAppShell` com `primary="banner"`, `canvas="inset"`,
`navMode="auto"`, `collapsedTo="rail"`, `scroll="content"`. Estado
`navOpen` persistido por utilizador em `localStorage`.

### 7.1 Banner — `top-navigation`

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

### 7.2 Navegação — `side-navigation`

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

### 7.3 Conteúdo

`main[slAppShellMain]` com `<router-outlet>`. Cada página é `slPage` com
`slPageHeader`; o Shell não desenha cabeçalhos. Enquanto a sessão carrega, o
Shell renderiza esqueletos (`slSkeletonRegion`: 8 linhas na navegação, um
cabeçalho e três blocos no conteúdo). Falha ao carregar a sessão: página
inteira com `slResultState` "Nexora is unavailable", a mensagem do erro, botão
Retry.

### 7.4 Painel de demonstração — `drawer`

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

### 7.5 Atalhos

`mod+k` pesquisa, `mod+shift+d` demo, `?` (fora de campos) diálogo de
atalhos, `g` seguido de `h/c/s/i/f` navega para Home/CRM/Sales/Inventory/
Finance (só para módulos visíveis), `esc` fecha o que estiver aberto. O
diálogo de atalhos lista-os com `kbd[slShortcut]`.

## 8. Menu de utilizador e preferências

`sl-menu` aberto por `button[slTopNavigationAccount]`:

- cabeçalho (não interativo): avatar, nome, e-mail, "Sales Manager · Enterprise
  Sales";
- Your profile → `/profile`;
- Preferences → `/settings/preferences`;
- `sl-menu-radio-group` "Appearance": Light / Dark / System (escreve
  `PreferencesStore.scheme`; efeito imediato);
- `sl-menu-radio-group` "Density": Comfortable / Compact / Dense;
- Keyboard shortcuts (abre o diálogo);
- separador; Sign out → `POST /demo/sign-out` (limpa a persona ativa) e
  navegação para `/sign-in`.

`/profile`: `slPage` com `slPageHeader` (avatar grande, nome, título,
departamento, equipas com `slBadge`, papel), `slDescriptionList` com e-mail,
gestor, fuso, último acesso, e a lista das permissões efetivas agrupadas por
área — a leitura humana de `session.permissions`.

`/settings/preferences`: formulário com `slForm`: Appearance, Density, Start
page (`sl-select` dos destinos visíveis), Notification preferences (§89.3:
`emailApprovals`, `emailMentions`, `inAppOperationalAlerts` editáveis;
`inAppApprovals` e `inAppMentions` fixas e mostradas desativadas). Guardar →
`PATCH /me/preferences`, toast.

`/sign-in`: fora do Shell, centrado: marca, "Sign in to Asteron Industrial
Supply", e "Accounts on this device" — as nove personas como cartões
(`slCard` clicável) com avatar, nome, papel. Escolher → `POST /demo/persona`,
`SessionStore.load()`, navegação para `startRoute`. É a forma que a
demonstração dá a um sign-in; não há palavra-passe.

## 9. Notificações

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

## 10. Pesquisa e command palette

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

## 11. Marca

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

## 12. Estados

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

## 13. Testes

- `@nexora/domain`: `authorize` por escopo (`all`, `own`, `team`,
  `warehouse`), catálogo completo, `search` (mínimo, limite, agrupamento,
  filtro por permissão).
- `@nexora/data`: determinismo (dois seeds iguais), contagens do §75.1 e
  §55.6, `restricted_user` remove `inventory.adjust`, `reset` reproduz o seed,
  `MemoryPersistence` e `IndexedDbPersistence` com a mesma suíte (`fake-indexeddb`).
- `@nexora/api`: cada rota com persona certa e errada (`403` com
  `details.permission`), `404` para notificação de outro utilizador,
  paginação, `system_degraded` determinístico com `latency: 'none'`.
- `@nexora/angular` (`vitest` + `@angular/build:unit-test`): interceptor
  (pedido → `handle` → resposta e erro), `SessionStore.can`, `ShellLayout`
  renderiza módulos por persona (Sofia vê Sales; Jordan não vê Finance),
  contagens no banner, menu de utilizador aplica o esquema ao `html`, popover
  de notificações marca lida e atualiza a contagem, command palette agrupa e
  filtra por permissão, guarda de rota renderiza `ForbiddenPage`, atalhos.
- Verificação visual: screenshots light/dark em 1280 e 420 px pelo mesmo
  método usado nesta sessão (Chrome headless via CDP), guardados em
  `apps/demos/nexora/apps/angular/screenshots/` e não commitados.

## 14. Reconciliação com a biblioteca

Cada fricção encontrada ao construir o Shell é registada em
`apps/demos/nexora/LIBRARY-FEEDBACK.md`: família, o que faltou ou custou, a
versão beta em causa. O documento alimenta a avaliação da API pública; nada
na biblioteca é alterado a partir da demo.
