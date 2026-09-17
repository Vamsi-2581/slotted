# Nexora — pacotes `@nexora/domain`, `@nexora/data`, `@nexora/api`: plano

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O backend simulado da Nexora no recorte que o Shell exige: identidade, autorização por escopo, armazéns, notificações, tarefas, aprovações, pesquisa, sessão, cenários, relógio, persistência e transporte simulado, num monorepo do produto em `apps/demos/nexora`.

**Architecture:** Três pacotes TypeScript puros (`domain ← data ← api`) sem dependência de browser além do adaptador IndexedDB; `@nexora/api` expõe `handle(request)`; o cliente Angular (plano seguinte) liga-o por interceptor.

**Tech Stack:** TypeScript 6, Node 24, pnpm 11, vitest 4, `fake-indexeddb` (testes). Sem outras dependências de runtime.

**Spec:** `docs/superpowers/specs/2026-09-17-nexora-shell-design.md` (§1–§5, §13). Domínio: `docs/nexora-op-demo-domain.md`.

## Global Constraints

- Node `>=24 <25`, pnpm `11.24.0` (raiz do repositório).
- `apps/demos/nexora` é uma instalação pnpm separada: `pnpm-workspace.yaml` próprio; `@slotted/*` só por tarball de `apps/demos/.registry`.
- `@nexora/domain` não importa `@nexora/data`, `@nexora/api`, Angular, `@slotted/*` nem APIs de browser.
- Ids: `<prefix>_<6 dígitos>`; instantes UTC ISO-8601; datas de negócio `YYYY-MM-DD`; fuso da organização `America/Chicago`; instante canónico `2026-09-04T15:00:00Z`; `seedVersion = 'nexora-v1'`; `schemaVersion = 1`.
- `Date.now()` só dentro de `@nexora/data/clock`.
- Base da API `/api/v1`; respostas `{ data }`; erros `ApiError` (§73.10) com os códigos do §73.11.
- Formatação: `pnpm exec prettier --write <paths>` da raiz do repositório para os ficheiros de `apps/demos/nexora` (o `.prettierignore` da raiz exclui `apps/demos`; o comando explícito formata na mesma).
- Commits: sempre `git add <paths> && git commit` num só comando (índice partilhado com outras sessões).

---

## Estrutura de ficheiros

```
apps/demos/nexora/
  package.json                      scripts: build, test, typecheck (pnpm -r)
  pnpm-workspace.yaml               packages/*, apps/*
  tsconfig.base.json                strict, ES2023, moduleResolution bundler
  vitest.config.ts               os três pacotes + apps/angular
  packages/domain/
    package.json  tsconfig.json  vitest.config.ts
    src/common/{ids,metadata,money,time,errors,index}.ts
    src/identity/index.ts
    src/permissions/{catalog,roles,authorize,index}.ts
    src/warehouses/index.ts
    src/activity/index.ts
    src/approvals/index.ts
    src/search/index.ts
    src/session/index.ts
    src/index.ts
  packages/data/
    src/prng.ts
    src/clock/index.ts
    src/seed/{names,organization,warehouses,teams,roles,users,curated,activity,index}.ts
    src/scenarios/index.ts
    src/persistence/{types,memory,indexeddb,index}.ts
    src/store/index.ts
    src/index.ts
  packages/api/
    src/transport/{types,errors,router,index}.ts
    src/simulation/index.ts
    src/handlers/{session,demo,preferences,notifications,tasks,approvals,search,activity}.ts
    src/index.ts
  apps/angular/                     movida de apps/demos/nexora-operations (Task 1)
```

Alias de teste: `vitest.config.ts` mapeia `@nexora/domain` → `packages/domain/src`, `@nexora/data` → `packages/data/src`, `@nexora/api` → `packages/api/src`, para os testes correrem sem `dist`. O build (`tsc -b`) produz `dist/` e é o que `apps/angular` consome.

---

### Task 1: Monorepo do produto

**Files:**
- Move: `apps/demos/nexora-operations/` → `apps/demos/nexora/apps/angular/`
- Create: `apps/demos/nexora/package.json`, `apps/demos/nexora/pnpm-workspace.yaml`, `apps/demos/nexora/tsconfig.base.json`, `apps/demos/nexora/vitest.config.ts`
- Create: `apps/demos/nexora/packages/{domain,data,api}/{package.json,tsconfig.json,vitest.config.ts,src/index.ts}`
- Modify: `apps/demos/nexora/apps/angular/package.json` (caminhos `file:` e nome), `apps/demos/nexora/apps/angular/pnpm-workspace.yaml` (remover), `apps/demos/nexora/apps/angular/README.md` (caminhos)
- Modify: `scripts/pack-beta.mjs` (nenhuma mudança: `REGISTRY_DIRECTORY` continua `apps/demos/.registry`)

**Interfaces:**
- Produces: três pacotes vazios `@nexora/domain`, `@nexora/data`, `@nexora/api` com `exports` por subpath e teste vazio a passar.

- [ ] **Step 1: Mover a app e apagar o workspace dela**

```bash
cd /home/dreco/dev/slotted/apps/demos
mkdir -p nexora/apps nexora/packages
git mv nexora-operations nexora/apps/angular 2>/dev/null || mv nexora-operations nexora/apps/angular
rm nexora/apps/angular/pnpm-workspace.yaml
rm -rf nexora/apps/angular/node_modules nexora/apps/angular/pnpm-lock.yaml
```

- [ ] **Step 2: Raiz do produto**

`apps/demos/nexora/pnpm-workspace.yaml`:

```yaml
# The product's own installation. `@nexora/*` link by workspace; `@slotted/*`
# arrive as tarballs from ../.registry, written by `pnpm pack:beta` at the
# repository root.
packages:
  - 'packages/*'
  - 'apps/*'
allowBuilds:
  '@parcel/watcher': true
  esbuild: true
  lmdb: true
  msgpackr-extract: true
```

`apps/demos/nexora/package.json`:

```json
{
  "name": "@nexora/root",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.24.0",
  "scripts": {
    "build": "pnpm -r --filter './packages/**' build",
    "test": "vitest run",
    "typecheck": "pnpm -r typecheck",
    "start": "pnpm --filter @nexora/angular start"
  },
  "devDependencies": {
    "@types/node": "24.13.3",
    "fake-indexeddb": "6.0.0",
    "typescript": "6.0.3",
    "vitest": "4.1.11"
  }
}
```

`apps/demos/nexora/tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2023", "DOM"],
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true
  }
}
```

`apps/demos/nexora/vitest.config.ts`:

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@nexora/domain': here('./packages/domain/src'),
      '@nexora/data': here('./packages/data/src'),
      '@nexora/api': here('./packages/api/src'),
    },
  },
  test: {
    projects: ['packages/domain', 'packages/data', 'packages/api'],
  },
});
```

- [ ] **Step 3: Os três pacotes**

Para cada `name` em `domain`, `data`, `api` — `apps/demos/nexora/packages/<name>/package.json` (dependências: `data` depende de `domain`; `api` depende de `domain` e `data`):

```json
{
  "name": "@nexora/domain",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "./*": { "types": "./dist/*/index.d.ts", "default": "./dist/*/index.js" }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run"
  }
}
```

`packages/data/package.json` acrescenta `"dependencies": { "@nexora/domain": "workspace:*" }`; `packages/api/package.json` acrescenta `"dependencies": { "@nexora/domain": "workspace:*", "@nexora/data": "workspace:*" }`.

`packages/<name>/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist" },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts"]
}
```

`packages/<name>/vitest.config.ts`:

```ts
import { fileURLToPath } from 'node:url';
import { defineProject } from 'vitest/config';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineProject({
  resolve: {
    alias: {
      '@nexora/domain': here('../domain/src'),
      '@nexora/data': here('../data/src'),
      '@nexora/api': here('../api/src'),
    },
  },
  test: { name: '@nexora/domain', environment: 'node', include: ['src/**/*.test.ts'] },
});
```

(`name` por pacote.) `src/index.ts` em cada um: `export {};`.

- [ ] **Step 4: A app Angular no workspace**

Em `apps/demos/nexora/apps/angular/package.json`: `"name": "@nexora/angular"`; os três `file:../.registry/...` passam a `file:../../../.registry/...`; acrescentar `"@nexora/domain": "workspace:*"`, `"@nexora/data": "workspace:*"`, `"@nexora/api": "workspace:*"` em `dependencies`. No `README.md` da app, `../.registry` → `../../../.registry` e o comando `pnpm install` passa a correr em `apps/demos/nexora`.

- [ ] **Step 5: Instalar e verificar**

```bash
cd /home/dreco/dev/slotted/apps/demos/nexora && pnpm install && pnpm test && pnpm build && pnpm --filter @nexora/angular build
```

Esperado: `pnpm test` "no test files found" nos três projetos sem erro de configuração (vitest 4 sai 0 com `passWithNoTests`; acrescentar `passWithNoTests: true` em `vitest.config.ts` › `test` se sair 1); `pnpm build` produz `dist/index.js` nos três; a app compila.

- [ ] **Step 6: Commit**

```bash
cd /home/dreco/dev/slotted && git add apps/demos/nexora && git commit -m "feat(nexora): monorepo do produto — packages/domain|data|api vazios, apps/angular movida, vitest com alias para src"
```

---

### Task 2: `@nexora/domain/common`

**Files:**
- Create: `packages/domain/src/common/ids.ts`, `metadata.ts`, `money.ts`, `time.ts`, `errors.ts`, `index.ts`
- Test: `packages/domain/src/common/common.test.ts`

**Interfaces:**
- Produces:
  - `makeId(prefix: IdPrefix, sequence: number): string`; `parseId(id): { prefix; sequence }`; `IdPrefix` = `'org' | 'usr' | 'tem' | 'rol' | 'ras' | 'wh' | 'ntf' | 'tsk' | 'apr' | 'act' | 'cus' | 'con' | 'sku' | 'ord' | 'quo' | 'inv' | 'sup' | 'po' | 'tck' | 'shp' | 'req'`
  - `EntityMetadata`, `newMetadata(id, organizationId, actorId, at): EntityMetadata`, `touch(metadata, actorId, at): EntityMetadata`
  - `Money { amount: number; currency: CurrencyCode }`, `CurrencyCode`, `money(amount, currency)`
  - `Instant = string`, `BusinessDate = string`, `toBusinessDate(instant, timezone)`, `addDays(instant, days)`, `addHours`, `isInstant`, `isBusinessDate`
  - `DomainError` com `code: DomainErrorCode` (`'FORBIDDEN' | 'NOT_FOUND' | 'INVALID_STATE_TRANSITION' | 'VALIDATION_FAILED'`), `details?: Record<string, unknown>`

- [ ] **Step 1: Teste**

```ts
// packages/domain/src/common/common.test.ts
import { describe, expect, it } from 'vitest';
import { addDays, DomainError, makeId, money, newMetadata, parseId, toBusinessDate, touch } from './index';

describe('ids', () => {
  it('formats prefix and six-digit sequence', () => {
    expect(makeId('usr', 21)).toBe('usr_000021');
    expect(parseId('inv_028910')).toEqual({ prefix: 'inv', sequence: 28910 });
  });
  it('rejects a malformed id', () => {
    expect(() => parseId('usr-1')).toThrow(DomainError);
  });
});

describe('time', () => {
  it('writes the business date in the organization timezone', () => {
    expect(toBusinessDate('2026-09-04T15:00:00Z', 'America/Chicago')).toBe('2026-09-04');
    expect(toBusinessDate('2026-09-05T03:30:00Z', 'America/Chicago')).toBe('2026-09-04');
  });
  it('adds days as instants', () => {
    expect(addDays('2026-09-04T15:00:00Z', 7)).toBe('2026-09-11T15:00:00.000Z');
  });
});

describe('metadata', () => {
  it('starts at version 1 and increments on touch', () => {
    const m = newMetadata('usr_000001', 'org_000001', 'system', '2026-09-04T15:00:00Z');
    expect(m.version).toBe(1);
    const t = touch(m, 'usr_000002', '2026-09-05T15:00:00Z');
    expect(t.version).toBe(2);
    expect(t.updatedBy).toBe('usr_000002');
    expect(m.version).toBe(1);
  });
});

describe('money', () => {
  it('rounds to cents', () => {
    expect(money(86420.004, 'USD')).toEqual({ amount: 86420, currency: 'USD' });
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/domain/src/common`
Expected: FAIL — módulo `./index` inexistente.

- [ ] **Step 3: Implementação**

```ts
// packages/domain/src/common/errors.ts
export type DomainErrorCode = 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID_STATE_TRANSITION' | 'VALIDATION_FAILED';

export class DomainError extends Error {
  constructor(
    readonly code: DomainErrorCode,
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
```

```ts
// packages/domain/src/common/ids.ts
import { DomainError } from './errors';

export type IdPrefix =
  | 'org' | 'usr' | 'tem' | 'rol' | 'ras' | 'wh' | 'ntf' | 'tsk' | 'apr' | 'act'
  | 'cus' | 'con' | 'sku' | 'ord' | 'quo' | 'inv' | 'sup' | 'po' | 'tck' | 'shp' | 'req';

const ID_PATTERN = /^([a-z]+)_(\d{6})$/;

export function makeId(prefix: IdPrefix, sequence: number): string {
  return `${prefix}_${String(sequence).padStart(6, '0')}`;
}

export function parseId(id: string): { prefix: IdPrefix; sequence: number } {
  const match = ID_PATTERN.exec(id);
  if (match === null) throw new DomainError('VALIDATION_FAILED', `Malformed id: ${id}`, { id });
  return { prefix: match[1] as IdPrefix, sequence: Number(match[2]) };
}
```

```ts
// packages/domain/src/common/time.ts
export type Instant = string;
export type BusinessDate = string;

const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isInstant = (value: string): value is Instant => INSTANT.test(value);
export const isBusinessDate = (value: string): value is BusinessDate => DATE.test(value);

export function toBusinessDate(instant: Instant, timezone: string): BusinessDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(instant));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function addHours(instant: Instant, hours: number): Instant {
  return new Date(new Date(instant).getTime() + hours * 3_600_000).toISOString();
}

export function addDays(instant: Instant, days: number): Instant {
  return addHours(instant, days * 24);
}
```

```ts
// packages/domain/src/common/metadata.ts
import type { Instant } from './time';

export interface EntityMetadata {
  id: string;
  organizationId: string;
  createdAt: Instant;
  createdBy: string;
  updatedAt: Instant;
  updatedBy: string;
  version: number;
  archivedAt?: Instant;
}

export function newMetadata(id: string, organizationId: string, actorId: string, at: Instant): EntityMetadata {
  return { id, organizationId, createdAt: at, createdBy: actorId, updatedAt: at, updatedBy: actorId, version: 1 };
}

export function touch(metadata: EntityMetadata, actorId: string, at: Instant): EntityMetadata {
  return { ...metadata, updatedAt: at, updatedBy: actorId, version: metadata.version + 1 };
}
```

```ts
// packages/domain/src/common/money.ts
export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export function money(amount: number, currency: CurrencyCode): Money {
  return { amount: Math.round(amount * 100) / 100, currency };
}
```

```ts
// packages/domain/src/common/index.ts
export * from './errors';
export * from './ids';
export * from './metadata';
export * from './money';
export * from './time';
```

- [ ] **Step 4: Correr e ver passar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/domain/src/common`
Expected: PASS (7 testes).

- [ ] **Step 5: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora/packages/domain/src && git add apps/demos/nexora/packages/domain && git commit -m "feat(nexora-domain): common — ids, metadata, money, time, DomainError"
```

---

### Task 3: `@nexora/domain` — identidade, permissões e `authorize`

**Files:**
- Create: `packages/domain/src/identity/index.ts`, `packages/domain/src/warehouses/index.ts`, `packages/domain/src/permissions/catalog.ts`, `roles.ts`, `authorize.ts`, `index.ts`
- Test: `packages/domain/src/permissions/authorize.test.ts`, `packages/domain/src/permissions/roles.test.ts`

**Interfaces:**
- Produces:
  - `PERMISSION_CATALOG: readonly Permission[]`, `Permission` (união literal), `PermissionArea`, `permissionArea(permission): PermissionArea`
  - `RoleName` (13 nomes), `ROLE_GRANTS: Record<RoleName, readonly PermissionGrant[]>`
  - `PermissionScope`, `ScopeResource { ownerId?: string; teamIds?: readonly string[]; warehouseId?: string }`
  - `AuthorizationInput { userId: string; permissions: readonly Permission[]; scopes: Partial<Record<Permission, readonly PermissionScope[]>> }`
  - `authorize(input, permission, resource?): { allowed: true } | { allowed: false; reason: 'missing' | 'scope' }`
  - tipos `Organization`, `User`, `UserStatus`, `Team`, `TeamType`, `TeamMembership`, `Role`, `PermissionGrant`, `RoleAssignment`, `Warehouse`, `NotificationPreferences`

- [ ] **Step 1: Testes**

```ts
// packages/domain/src/permissions/roles.test.ts
import { describe, expect, it } from 'vitest';
import { PERMISSION_CATALOG, ROLE_GRANTS, ROLE_NAMES, permissionArea } from './index';

describe('catalog', () => {
  it('has the 107 permissions of §55.4, unique', () => {
    expect(new Set(PERMISSION_CATALOG).size).toBe(PERMISSION_CATALOG.length);
    expect(PERMISSION_CATALOG.length).toBe(107);
    expect(permissionArea('orders.approve')).toBe('sales');
    expect(permissionArea('audit.export')).toBe('administration');
  });
});

describe('roles', () => {
  it('has the 13 roles of §55.5 and grants only catalog permissions', () => {
    expect(ROLE_NAMES.length).toBe(13);
    for (const name of ROLE_NAMES) {
      for (const grant of ROLE_GRANTS[name]) expect(PERMISSION_CATALOG).toContain(grant.permission);
    }
  });
  it('gives Administrator everything and Auditor nothing mutable', () => {
    expect(ROLE_GRANTS['Administrator'].length).toBe(PERMISSION_CATALOG.length);
    const auditor = ROLE_GRANTS['Auditor'].map((g) => g.permission);
    expect(auditor).toContain('audit.export');
    expect(auditor.filter((p) => /\.(create|edit|manage|approve|record|adjust)/.test(p))).toEqual([]);
  });
  it('lets a Warehouse Operator ship but not adjust', () => {
    const operator = ROLE_GRANTS['Warehouse Operator'].map((g) => g.permission);
    expect(operator).toContain('shipments.ship');
    expect(operator).not.toContain('inventory.adjust');
    expect(ROLE_GRANTS['Warehouse Operator'].every((g) => g.defaultScope === 'warehouse')).toBe(true);
  });
});
```

```ts
// packages/domain/src/permissions/authorize.test.ts
import { describe, expect, it } from 'vitest';
import { authorize, type AuthorizationInput } from './index';

const base: AuthorizationInput = {
  userId: 'usr_000004',
  permissions: ['orders.view', 'orders.edit_draft', 'inventory.view'],
  scopes: {
    'orders.view': [{ type: 'all' }],
    'orders.edit_draft': [{ type: 'own' }, { type: 'team', teamIds: ['tem_000001'] }],
    'inventory.view': [{ type: 'warehouse', warehouseIds: ['wh_000001'] }],
  },
};

describe('authorize', () => {
  it('denies a permission the session does not hold', () => {
    expect(authorize(base, 'orders.approve')).toEqual({ allowed: false, reason: 'missing' });
  });
  it('allows without a resource when the permission is held', () => {
    expect(authorize(base, 'orders.edit_draft')).toEqual({ allowed: true });
  });
  it('covers own and team resources', () => {
    expect(authorize(base, 'orders.edit_draft', { ownerId: 'usr_000004' })).toEqual({ allowed: true });
    expect(authorize(base, 'orders.edit_draft', { ownerId: 'usr_000009', teamIds: ['tem_000001'] })).toEqual({ allowed: true });
    expect(authorize(base, 'orders.edit_draft', { ownerId: 'usr_000009', teamIds: ['tem_000002'] })).toEqual({ allowed: false, reason: 'scope' });
  });
  it('covers the warehouse scope', () => {
    expect(authorize(base, 'inventory.view', { warehouseId: 'wh_000001' })).toEqual({ allowed: true });
    expect(authorize(base, 'inventory.view', { warehouseId: 'wh_000002' })).toEqual({ allowed: false, reason: 'scope' });
  });
  it('treats all as covering anything', () => {
    expect(authorize(base, 'orders.view', { warehouseId: 'wh_000005', ownerId: 'x' })).toEqual({ allowed: true });
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/domain/src/permissions`
Expected: FAIL — módulos inexistentes.

- [ ] **Step 3: Tipos de identidade**

```ts
// packages/domain/src/identity/index.ts
import type { CurrencyCode, EntityMetadata, Instant } from '../common';
import type { Permission } from '../permissions/catalog';

export type UserStatus = 'invited' | 'active' | 'suspended' | 'deactivated';
export type TeamType = 'sales' | 'finance' | 'procurement' | 'warehouse' | 'support' | 'executive' | 'administration';

export interface AddressSnapshot {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface Organization {
  id: string;
  legalName: string;
  displayName: string;
  industry: string;
  primaryCurrency: 'USD';
  supportedCurrencies: CurrencyCode[];
  timezone: 'America/Chicago';
  fiscalYearStartMonth: 1;
  billingAddress: AddressSnapshot;
  operationalRegions: string[];
  status: 'active';
  metadata: EntityMetadata;
}

export interface NotificationPreferences {
  emailApprovals: boolean;
  emailMentions: boolean;
  inAppApprovals: true;
  inAppMentions: true;
  inAppOperationalAlerts: boolean;
}

export interface User {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  title?: string;
  department?: string;
  managerId?: string;
  status: UserStatus;
  locale: 'en-US';
  timezone: string;
  lastActiveAt?: Instant;
  notificationPreferences: NotificationPreferences;
  metadata: EntityMetadata;
}

export interface Team {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  type: TeamType;
  status: 'active' | 'inactive';
  metadata: EntityMetadata;
}

export interface TeamMembership {
  teamId: string;
  userId: string;
  isLead: boolean;
}

export type PermissionScope =
  | { type: 'all' }
  | { type: 'own' }
  | { type: 'team'; teamIds: string[] }
  | { type: 'warehouse'; warehouseIds: string[] };

export interface PermissionGrant {
  permission: Permission;
  defaultScope: PermissionScope['type'];
}

export interface Role {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  isSystem: boolean;
  grants: PermissionGrant[];
  metadata: EntityMetadata;
}

export interface RoleAssignment {
  id: string;
  organizationId: string;
  userId: string;
  roleId: string;
  scope: PermissionScope;
  createdAt: Instant;
  createdBy: string;
}
```

```ts
// packages/domain/src/warehouses/index.ts
import type { EntityMetadata } from '../common';

export interface Warehouse {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  timezone: string;
  status: 'active' | 'inactive';
  metadata: EntityMetadata;
}
```

- [ ] **Step 4: Catálogo**

```ts
// packages/domain/src/permissions/catalog.ts
export const PERMISSION_CATALOG = [
  // organization and identity
  'organization.view', 'organization.edit', 'users.view', 'users.invite', 'users.edit', 'users.suspend',
  'teams.view', 'teams.manage', 'roles.view', 'roles.manage',
  // crm
  'customers.view', 'customers.create', 'customers.edit', 'customers.archive', 'customers.export',
  'customers.credit_view', 'customers.credit_edit', 'contacts.view', 'contacts.manage',
  'notes.view', 'notes.create', 'notes.delete_own',
  // catalog
  'catalog.view', 'catalog.manage', 'pricing.view', 'pricing.manage', 'cost.view',
  // sales
  'quotes.view', 'quotes.create', 'quotes.edit', 'quotes.send', 'quotes.approve', 'quotes.convert',
  'orders.view', 'orders.create', 'orders.edit_draft', 'orders.edit_confirmed', 'orders.submit',
  'orders.approve', 'orders.hold', 'orders.release_hold', 'orders.cancel', 'orders.override_price', 'orders.export',
  // inventory and fulfillment
  'inventory.view', 'inventory.allocate', 'inventory.deallocate', 'inventory.adjust', 'inventory.transfer',
  'inventory.cycle_count', 'shipments.view', 'shipments.create', 'shipments.pick', 'shipments.pack',
  'shipments.ship', 'shipments.mark_delivered', 'returns.view', 'returns.create', 'returns.authorize',
  'returns.receive', 'returns.inspect',
  // procurement
  'suppliers.view', 'suppliers.manage', 'purchase_orders.view', 'purchase_orders.create',
  'purchase_orders.edit', 'purchase_orders.submit', 'purchase_orders.approve', 'purchase_orders.send',
  'purchase_orders.cancel', 'receipts.view', 'receipts.create',
  // finance
  'finance.dashboard', 'invoices.view', 'invoices.create', 'invoices.edit_draft', 'invoices.open',
  'invoices.send', 'invoices.void', 'invoices.write_off', 'payments.view', 'payments.record',
  'payments.reverse', 'credit_memos.view', 'credit_memos.create', 'credit_memos.open', 'refunds.create',
  'reconciliation.view', 'reconciliation.manage',
  // support
  'support.view', 'support.create', 'support.reply', 'support.assign', 'support.change_status',
  'support.escalate', 'support.manage',
  // workflow and administration
  'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.activate', 'workflows.archive',
  'analytics.view', 'audit.view', 'audit.export', 'notifications.manage_own', 'saved_views.manage_own',
  'imports.run',
] as const;

export type Permission = (typeof PERMISSION_CATALOG)[number];

export type PermissionArea =
  | 'identity' | 'crm' | 'catalog' | 'sales' | 'inventory' | 'procurement' | 'finance' | 'support' | 'administration';

const AREA_BY_PREFIX: Record<string, PermissionArea> = {
  organization: 'identity', users: 'identity', teams: 'identity', roles: 'identity',
  customers: 'crm', contacts: 'crm', notes: 'crm',
  catalog: 'catalog', pricing: 'catalog', cost: 'catalog',
  quotes: 'sales', orders: 'sales',
  inventory: 'inventory', shipments: 'inventory', returns: 'inventory',
  suppliers: 'procurement', purchase_orders: 'procurement', receipts: 'procurement',
  finance: 'finance', invoices: 'finance', payments: 'finance', credit_memos: 'finance', refunds: 'finance', reconciliation: 'finance',
  support: 'support',
  workflows: 'administration', analytics: 'administration', audit: 'administration',
  notifications: 'administration', saved_views: 'administration', imports: 'administration',
};

export function permissionArea(permission: Permission): PermissionArea {
  const prefix = permission.split('.')[0] ?? '';
  return AREA_BY_PREFIX[prefix] ?? 'administration';
}

export const isPermission = (value: string): value is Permission =>
  (PERMISSION_CATALOG as readonly string[]).includes(value);
```

- [ ] **Step 5: Papéis**

```ts
// packages/domain/src/permissions/roles.ts
import type { PermissionGrant } from '../identity';
import { PERMISSION_CATALOG, permissionArea, type Permission, type PermissionArea } from './catalog';

export const ROLE_NAMES = [
  'Administrator', 'Executive', 'Sales Manager', 'Sales Representative', 'Finance Manager', 'Accountant',
  'Procurement Manager', 'Buyer', 'Warehouse Manager', 'Warehouse Operator', 'Support Manager',
  'Support Agent', 'Auditor',
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

type Scope = PermissionGrant['defaultScope'];

const grant = (permissions: readonly Permission[], scope: Scope = 'all'): PermissionGrant[] =>
  permissions.map((permission) => ({ permission, defaultScope: scope }));

const area = (...areas: PermissionArea[]): Permission[] =>
  PERMISSION_CATALOG.filter((p) => areas.includes(permissionArea(p)));

const readOnly = (permissions: readonly Permission[]): Permission[] =>
  permissions.filter((p) => /\.(view|dashboard|credit_view)$/.test(p));

const ALL: Permission[] = [...PERMISSION_CATALOG];
const EVERY_VIEW = readOnly(ALL);

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  Administrator: 'Every permission, every scope.',
  Executive: 'Reads all business data, dashboards and the audit log.',
  'Sales Manager': 'Runs CRM and sales, approves quotes and orders.',
  'Sales Representative': 'Works customers, quotes and orders for an assigned team.',
  'Finance Manager': 'Owns receivables, credit and finance approvals.',
  Accountant: 'Records invoices, payments and reconciliation.',
  'Procurement Manager': 'Manages suppliers and approves purchase orders.',
  Buyer: 'Creates and sends purchase orders.',
  'Warehouse Manager': 'Runs inventory and fulfillment for assigned warehouses.',
  'Warehouse Operator': 'Picks, packs, ships and receives in assigned warehouses.',
  'Support Manager': 'Runs support and reads related records.',
  'Support Agent': 'Answers tickets and reads related records.',
  Auditor: 'Reads everything and exports the audit log.',
};

export const ROLE_GRANTS: Record<RoleName, readonly PermissionGrant[]> = {
  Administrator: grant(ALL),
  Executive: grant([...new Set([...EVERY_VIEW, 'analytics.view', 'finance.dashboard', 'audit.view'] as Permission[])]),
  'Sales Manager': grant([
    ...area('crm').filter((p) => p !== 'customers.credit_edit'), 'catalog.view', 'pricing.view',
    ...area('sales'), 'inventory.view', 'shipments.view', 'invoices.view', 'support.view', 'analytics.view',
    'notifications.manage_own', 'saved_views.manage_own',
  ]),
  'Sales Representative': [
    ...grant(['customers.view', 'contacts.view', 'notes.view', 'catalog.view', 'pricing.view', 'quotes.view',
      'orders.view', 'inventory.view', 'shipments.view', 'invoices.view', 'support.view', 'analytics.view',
      'customers.credit_view', 'notifications.manage_own', 'saved_views.manage_own']),
    ...grant(['customers.create', 'customers.edit', 'contacts.manage', 'notes.create', 'quotes.create',
      'quotes.edit', 'quotes.send', 'quotes.convert', 'orders.create', 'orders.edit_draft', 'orders.submit'], 'team'),
  ],
  'Finance Manager': grant([
    ...area('finance'), 'customers.view', 'customers.credit_view', 'customers.credit_edit', 'contacts.view',
    'orders.view', 'orders.approve', 'orders.hold', 'orders.release_hold', 'quotes.view', 'analytics.view',
    'audit.view', 'notifications.manage_own', 'saved_views.manage_own',
  ]),
  Accountant: grant([
    'finance.dashboard', 'invoices.view', 'invoices.create', 'invoices.edit_draft', 'invoices.open', 'invoices.send',
    'payments.view', 'payments.record', 'payments.reverse', 'credit_memos.view', 'credit_memos.create',
    'reconciliation.view', 'reconciliation.manage', 'customers.view', 'customers.credit_view', 'orders.view',
    'notifications.manage_own', 'saved_views.manage_own',
  ]),
  'Procurement Manager': grant([
    ...area('procurement'), 'inventory.view', 'catalog.view', 'cost.view', 'analytics.view',
    'notifications.manage_own', 'saved_views.manage_own',
  ]),
  Buyer: grant([
    'suppliers.view', 'purchase_orders.view', 'purchase_orders.create', 'purchase_orders.edit',
    'purchase_orders.submit', 'purchase_orders.send', 'receipts.view', 'inventory.view', 'catalog.view',
    'cost.view', 'notifications.manage_own', 'saved_views.manage_own',
  ]),
  'Warehouse Manager': grant([...area('inventory'), 'catalog.view', 'orders.view', 'purchase_orders.view',
    'receipts.view', 'receipts.create', 'notifications.manage_own', 'saved_views.manage_own'], 'warehouse'),
  'Warehouse Operator': grant([
    'inventory.view', 'shipments.view', 'shipments.pick', 'shipments.pack', 'shipments.ship',
    'receipts.view', 'receipts.create', 'returns.view', 'returns.receive', 'inventory.cycle_count',
    'catalog.view', 'orders.view', 'notifications.manage_own',
  ], 'warehouse'),
  'Support Manager': grant([
    ...area('support'), 'customers.view', 'contacts.view', 'orders.view', 'invoices.view', 'catalog.view',
    'shipments.view', 'analytics.view', 'notifications.manage_own', 'saved_views.manage_own',
  ]),
  'Support Agent': grant([
    'support.view', 'support.create', 'support.reply', 'support.change_status', 'support.escalate',
    'customers.view', 'contacts.view', 'orders.view', 'invoices.view', 'catalog.view', 'shipments.view',
    'notifications.manage_own', 'saved_views.manage_own',
  ]),
  Auditor: grant([...EVERY_VIEW, 'audit.export']),
};
```

- [ ] **Step 6: `authorize`**

```ts
// packages/domain/src/permissions/authorize.ts
import type { PermissionScope } from '../identity';
import type { Permission } from './catalog';

export interface ScopeResource {
  ownerId?: string;
  teamIds?: readonly string[];
  warehouseId?: string;
}

export interface AuthorizationInput {
  userId: string;
  permissions: readonly Permission[];
  scopes: Partial<Record<Permission, readonly PermissionScope[]>>;
}

export type AuthorizationResult = { allowed: true } | { allowed: false; reason: 'missing' | 'scope' };

function covers(scope: PermissionScope, userId: string, resource: ScopeResource): boolean {
  switch (scope.type) {
    case 'all':
      return true;
    case 'own':
      return resource.ownerId === userId;
    case 'team':
      return (resource.teamIds ?? []).some((id) => scope.teamIds.includes(id));
    case 'warehouse':
      return resource.warehouseId !== undefined && scope.warehouseIds.includes(resource.warehouseId);
  }
}

export function authorize(input: AuthorizationInput, permission: Permission, resource?: ScopeResource): AuthorizationResult {
  if (!input.permissions.includes(permission)) return { allowed: false, reason: 'missing' };
  if (resource === undefined) return { allowed: true };
  const scopes = input.scopes[permission] ?? [{ type: 'all' }];
  return scopes.some((scope) => covers(scope, input.userId, resource))
    ? { allowed: true }
    : { allowed: false, reason: 'scope' };
}
```

```ts
// packages/domain/src/permissions/index.ts
export * from './authorize';
export * from './catalog';
export * from './roles';
```

- [ ] **Step 7: Correr e ver passar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/domain/src/permissions`
Expected: PASS. A contagem 107 é a do §55.4 do documento (`sed -n '3862,4015p' docs/nexora-op-demo-domain.md | grep -cE '^[a-z_]+\.[a-z_]+$'`).

- [ ] **Step 8: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora/packages/domain/src && git add apps/demos/nexora/packages/domain && git commit -m "feat(nexora-domain): identidade, catálogo de permissões §55.4, 13 papéis §55.5, authorize por escopo"
```

---

### Task 4: `@nexora/domain` — activity, approvals, search, session

**Files:**
- Create: `packages/domain/src/activity/index.ts`, `packages/domain/src/approvals/index.ts`, `packages/domain/src/search/index.ts`, `packages/domain/src/session/index.ts`, `packages/domain/src/index.ts`
- Test: `packages/domain/src/search/search.test.ts`

**Interfaces:**
- Produces:
  - `Notification`, `NotificationType`, `Task`, `ActivityEvent`
  - `ApprovalRequest`, `ApprovalType`, `isMyApproval(input: AuthorizationInput, approval): boolean`
  - `SearchEntityType`, `SEARCH_GROUP_ORDER`, `SearchDocument`, `SearchHit`, `SearchGroup { type; label; hits }`, `search(documents, query, input: AuthorizationInput): SearchGroup[]`, `SEARCH_MIN_QUERY = 2`, `SEARCH_GROUP_LIMIT = 8`
  - `Session`, `UserPreferences`, `ScenarioId`, `SCENARIO_IDS`, `TransportProfile`, `sessionAuthorization(session): AuthorizationInput`

- [ ] **Step 1: Teste**

```ts
// packages/domain/src/search/search.test.ts
import { describe, expect, it } from 'vitest';
import type { AuthorizationInput } from '../permissions';
import { search, type SearchDocument } from './index';

const doc = (type: SearchDocument['type'], id: string, title: string, terms: string[], requiredPermission: SearchDocument['requiredPermission'], businessNumber?: string): SearchDocument => ({
  type, id, title, terms, requiredPermission, route: `/${type}/${id}`, ...(businessNumber === undefined ? {} : { businessNumber }),
});

const docs: SearchDocument[] = [
  doc('customer', 'cus_010428', 'Meridian Controls Group', ['meridian', 'controls', 'group', 'cus-010428'], 'customers.view', 'CUS-010428'),
  doc('sales_order', 'ord_018420', 'SO-2026-01842', ['so-2026-01842', 'meridian'], 'orders.view', 'SO-2026-01842'),
  doc('invoice', 'inv_028910', 'INV-2026-02891', ['inv-2026-02891', 'meridian'], 'invoices.view', 'INV-2026-02891'),
  ...Array.from({ length: 10 }, (_, i) => doc('customer', `cus_00000${i}`, `Meridian ${i}`, ['meridian'], 'customers.view')),
];

const sales: AuthorizationInput = { userId: 'usr_000003', permissions: ['customers.view', 'orders.view'], scopes: {} };

describe('search', () => {
  it('needs two characters', () => {
    expect(search(docs, 'm', sales)).toEqual([]);
  });
  it('groups by type in a fixed order, eight per group, permission-filtered', () => {
    const groups = search(docs, 'meri', sales);
    expect(groups.map((g) => g.type)).toEqual(['customer', 'sales_order']);
    expect(groups[0]?.hits.length).toBe(8);
    expect(groups[0]?.hits[0]?.id).toBe('cus_010428');
  });
  it('matches business numbers case-insensitively', () => {
    const groups = search(docs, 'so-2026', sales);
    expect(groups[0]?.hits[0]?.businessNumber).toBe('SO-2026-01842');
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/domain/src/search`
Expected: FAIL.

- [ ] **Step 3: Implementação**

```ts
// packages/domain/src/activity/index.ts
import type { EntityMetadata, Instant } from '../common';

export type NotificationType = 'info' | 'success' | 'warning' | 'action_required';

export interface Notification {
  id: string;
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  route?: string;
  readAt?: Instant;
  archivedAt?: Instant;
  createdAt: Instant;
}

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  assigneeId: string;
  createdBy: string;
  dueDate?: string;
  priority: 'low' | 'normal' | 'high';
  status: 'open' | 'completed' | 'cancelled';
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata: EntityMetadata;
}

export interface ActivityEvent {
  id: string;
  organizationId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  occurredAt: Instant;
}
```

```ts
// packages/domain/src/approvals/index.ts
import type { EntityMetadata, Instant, Money } from '../common';
import { authorize, type AuthorizationInput, type Permission } from '../permissions';

export type ApprovalType = 'sales_order' | 'quote' | 'purchase_order' | 'credit_limit';

export interface ApprovalRequest {
  id: string;
  organizationId: string;
  type: ApprovalType;
  entityType: string;
  entityId: string;
  businessNumber: string;
  subject: string;
  amount?: Money;
  requestedBy: string;
  requiredPermission: Permission;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Instant;
  decidedAt?: Instant;
  decidedBy?: string;
  metadata: EntityMetadata;
}

export function isMyApproval(input: AuthorizationInput, approval: ApprovalRequest): boolean {
  return approval.status === 'pending' && authorize(input, approval.requiredPermission).allowed;
}
```

```ts
// packages/domain/src/search/index.ts
import { authorize, type AuthorizationInput, type Permission } from '../permissions';

export type SearchEntityType =
  | 'customer' | 'contact' | 'sales_order' | 'quote' | 'invoice' | 'product' | 'supplier' | 'purchase_order' | 'ticket';

export const SEARCH_GROUP_ORDER: readonly SearchEntityType[] = [
  'customer', 'contact', 'sales_order', 'quote', 'invoice', 'product', 'supplier', 'purchase_order', 'ticket',
];

export const SEARCH_GROUP_LABELS: Record<SearchEntityType, string> = {
  customer: 'Customers', contact: 'Contacts', sales_order: 'Sales orders', quote: 'Quotes', invoice: 'Invoices',
  product: 'Products', supplier: 'Suppliers', purchase_order: 'Purchase orders', ticket: 'Tickets',
};

export const SEARCH_MIN_QUERY = 2;
export const SEARCH_GROUP_LIMIT = 8;

export interface SearchDocument {
  type: SearchEntityType;
  id: string;
  businessNumber?: string;
  title: string;
  subtitle?: string;
  route: string;
  terms: string[];
  requiredPermission: Permission;
}

export interface SearchHit extends SearchDocument {
  score: number;
}

export interface SearchGroup {
  type: SearchEntityType;
  label: string;
  hits: SearchHit[];
}

function score(document: SearchDocument, query: string): number | null {
  let best: number | null = null;
  for (const term of document.terms) {
    const t = term.toLowerCase();
    if (t === query) return 3;
    if (t.startsWith(query)) best = Math.max(best ?? 0, 2);
    else if (t.includes(query)) best = Math.max(best ?? 0, 1);
  }
  return best;
}

export function search(documents: readonly SearchDocument[], rawQuery: string, input: AuthorizationInput): SearchGroup[] {
  const query = rawQuery.trim().toLowerCase();
  if (query.length < SEARCH_MIN_QUERY) return [];
  const byType = new Map<SearchEntityType, SearchHit[]>();
  for (const document of documents) {
    if (!authorize(input, document.requiredPermission).allowed) continue;
    const s = score(document, query);
    if (s === null) continue;
    const list = byType.get(document.type) ?? [];
    list.push({ ...document, score: s });
    byType.set(document.type, list);
  }
  return SEARCH_GROUP_ORDER.flatMap((type) => {
    const hits = byType.get(type);
    if (hits === undefined) return [];
    hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    return [{ type, label: SEARCH_GROUP_LABELS[type], hits: hits.slice(0, SEARCH_GROUP_LIMIT) }];
  });
}
```

```ts
// packages/domain/src/session/index.ts
import type { BusinessDate, Instant } from '../common';
import type { NotificationPreferences, Organization, PermissionScope, Role, Team, User } from '../identity';
import type { AuthorizationInput, Permission } from '../permissions';
import type { Warehouse } from '../warehouses';

export const SCENARIO_IDS = [
  'healthy', 'new_tenant', 'enterprise_scale', 'heavy_data', 'month_end', 'inventory_crisis',
  'collections_pressure', 'restricted_user', 'support_incident',
] as const;
export type ScenarioId = (typeof SCENARIO_IDS)[number];
export type TransportProfile = 'normal' | 'system_degraded';

export interface UserPreferences {
  scheme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact' | 'dense';
  startRoute: string;
  notifications: NotificationPreferences;
}

export interface Session {
  organization: Organization;
  user: User;
  roles: Role[];
  teams: Team[];
  permissions: Permission[];
  scopes: Partial<Record<Permission, PermissionScope[]>>;
  warehouses: Warehouse[];
  now: Instant;
  businessDate: BusinessDate;
  scenario: ScenarioId;
  transportProfile: TransportProfile;
  preferences: UserPreferences;
}

export function sessionAuthorization(session: Session): AuthorizationInput {
  return { userId: session.user.id, permissions: session.permissions, scopes: session.scopes };
}
```

```ts
// packages/domain/src/index.ts
export * from './activity';
export * from './approvals';
export * from './common';
export * from './identity';
export * from './permissions';
export * from './search';
export * from './session';
export * from './warehouses';
```

- [ ] **Step 4: Correr e ver passar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/domain && pnpm --filter @nexora/domain typecheck`
Expected: PASS; sem erros de tipo.

- [ ] **Step 5: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora/packages/domain/src && git add apps/demos/nexora/packages/domain && git commit -m "feat(nexora-domain): notificações, tarefas, atividade, aprovações, pesquisa agrupada §71.2, sessão"
```

---

### Task 5: `@nexora/data` — PRNG, relógio e seed de identidade

**Files:**
- Create: `packages/data/src/prng.ts`, `packages/data/src/clock/index.ts`, `packages/data/src/seed/names.ts`, `organization.ts`, `warehouses.ts`, `teams.ts`, `roles.ts`, `users.ts`, `packages/data/src/seed/index.ts`
- Test: `packages/data/src/clock/clock.test.ts`, `packages/data/src/seed/identity.test.ts`

**Interfaces:**
- Consumes: `@nexora/domain` (tipos, `makeId`, `newMetadata`, `ROLE_NAMES`, `ROLE_GRANTS`, `ROLE_DESCRIPTIONS`, `addDays`, `addHours`, `toBusinessDate`).
- Produces:
  - `createPrng(seed: string): Prng` com `next(): number` (0..1), `int(min, max)`, `pick<T>(list)`, `shuffle<T>(list)`
  - `CANONICAL_INSTANT = '2026-09-04T15:00:00Z'`, `SEED_VERSION = 'nexora-v1'`, `SCHEMA_VERSION = 1`
  - `DemoClock { now(): Instant; businessDate(timezone?): BusinessDate; advanceDays(days): void; set(instant): void }`, `createDemoClock(initial?: Instant): DemoClock`
  - `PERSONAS: readonly Persona[]` (`{ id, firstName, lastName, role: RoleName, title, department, teamCode, context, warehouseIds? }`), `DEFAULT_PERSONA_ID = 'usr_000003'`
  - `IdentitySeed { organization; warehouses; teams; roles; users; memberships; assignments }`, `seedIdentity(): IdentitySeed`
  - `ORGANIZATION_ID = 'org_000001'`, `SYSTEM_ACTOR = 'system'`

- [ ] **Step 1: Testes**

```ts
// packages/data/src/clock/clock.test.ts
import { describe, expect, it } from 'vitest';
import { CANONICAL_INSTANT, createDemoClock } from './index';

describe('demo clock', () => {
  it('starts at the canonical instant and advances', () => {
    const clock = createDemoClock();
    expect(clock.now()).toBe(CANONICAL_INSTANT);
    expect(clock.businessDate()).toBe('2026-09-04');
    clock.advanceDays(7);
    expect(clock.now()).toBe('2026-09-11T15:00:00.000Z');
  });
});
```

```ts
// packages/data/src/seed/identity.test.ts
import { describe, expect, it } from 'vitest';
import { DEFAULT_PERSONA_ID, PERSONAS, seedIdentity } from './index';

describe('identity seed', () => {
  const seed = seedIdentity();

  it('is deterministic', () => {
    expect(seedIdentity()).toEqual(seed);
  });
  it('has the §75.1 counts', () => {
    const byStatus = (status: string) => seed.users.filter((u) => u.status === status).length;
    expect(seed.users.length).toBe(205);
    expect(byStatus('active')).toBe(170);
    expect(byStatus('invited')).toBe(20);
    expect(byStatus('suspended')).toBe(10);
    expect(byStatus('deactivated')).toBe(5);
    expect(seed.teams.length).toBe(14);
    expect(seed.roles.length).toBe(13);
    expect(seed.warehouses.length).toBe(5);
  });
  it('seeds the nine personas with stable ids and emails', () => {
    expect(PERSONAS.length).toBe(9);
    const sofia = seed.users.find((u) => u.id === DEFAULT_PERSONA_ID);
    expect(sofia?.displayName).toBe('Sofia Ramirez');
    expect(sofia?.email).toBe('sofia.ramirez@asteron.example');
    const jordan = seed.assignments.find((a) => a.userId === 'usr_000007');
    expect(jordan?.scope).toEqual({ type: 'warehouse', warehouseIds: ['wh_000001'] });
  });
  it('gives every user exactly one team and one role', () => {
    for (const user of seed.users) {
      expect(seed.memberships.filter((m) => m.userId === user.id).length).toBeGreaterThanOrEqual(1);
      expect(seed.assignments.filter((a) => a.userId === user.id).length).toBeGreaterThanOrEqual(1);
    }
    expect(new Set(seed.users.map((u) => u.email.toLowerCase())).size).toBe(205);
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/data`
Expected: FAIL.

- [ ] **Step 3: PRNG e relógio**

```ts
// packages/data/src/prng.ts
export interface Prng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(list: readonly T[]): T;
  shuffle<T>(list: readonly T[]): T[];
}

function hash(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** mulberry32: small, fast, deterministic. Not cryptographic. */
export function createPrng(seed: string): Prng {
  let a = hash(seed);
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (list) => list[Math.floor(next() * list.length)] as (typeof list)[number],
    shuffle: (list) => {
      const out = [...list];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j] as (typeof out)[number], out[i] as (typeof out)[number]];
      }
      return out;
    },
  };
}
```

```ts
// packages/data/src/clock/index.ts
import { addDays, toBusinessDate, type BusinessDate, type Instant } from '@nexora/domain';

export const CANONICAL_INSTANT: Instant = '2026-09-04T15:00:00Z';
export const SEED_VERSION = 'nexora-v1';
export const SCHEMA_VERSION = 1;
export const ORGANIZATION_TIMEZONE = 'America/Chicago';

export interface DemoClock {
  now(): Instant;
  businessDate(timezone?: string): BusinessDate;
  advanceDays(days: number): void;
  set(instant: Instant): void;
}

export function createDemoClock(initial: Instant = CANONICAL_INSTANT): DemoClock {
  let current = initial;
  return {
    now: () => current,
    businessDate: (timezone = ORGANIZATION_TIMEZONE) => toBusinessDate(current, timezone),
    advanceDays: (days) => {
      current = addDays(current, days);
    },
    set: (instant) => {
      current = instant;
    },
  };
}
```

- [ ] **Step 4: Seed de identidade**

```ts
// packages/data/src/seed/names.ts
export const FIRST_NAMES = [
  'Ava', 'Liam', 'Grace', 'Ethan', 'Chloe', 'Mason', 'Zoe', 'Lucas', 'Nora', 'Henry', 'Layla', 'Jack',
  'Ella', 'Owen', 'Ivy', 'Leo', 'Ruby', 'Caleb', 'Hazel', 'Isaac', 'Mila', 'Wyatt', 'Aria', 'Julian',
  'Luna', 'Levi', 'Stella', 'Gabriel', 'Violet', 'Elias', 'Aurora', 'Miles', 'Penelope', 'Adrian',
  'Elena', 'Nathan', 'Camila', 'Theo', 'Naomi', 'Xavier', 'Daniela', 'Samuel', 'Iris', 'Diego', 'Rosa',
  'Felix', 'Maya', 'Tomas', 'Leah', 'Andre',
] as const;

export const LAST_NAMES = [
  'Anderson', 'Baker', 'Castillo', 'Dawson', 'Ellis', 'Foster', 'Garcia', 'Hughes', 'Ibarra', 'Jensen',
  'Kim', 'Lopez', 'Morgan', 'Nguyen', 'Ortega', 'Patel', 'Quinn', 'Reyes', 'Sullivan', 'Torres',
  'Underwood', 'Vargas', 'Walsh', 'Xu', 'Young', 'Zimmerman', 'Brennan', 'Cortez', 'Delgado', 'Fischer',
  'Gallagher', 'Holt', 'Iverson', 'Jordan', 'Keller', 'Lambert', 'Mendes', 'Navarro', 'Olsen', 'Pierce',
] as const;
```

```ts
// packages/data/src/seed/organization.ts
import { newMetadata, type Organization } from '@nexora/domain';
import { CANONICAL_INSTANT } from '../clock';

export const ORGANIZATION_ID = 'org_000001';
export const SYSTEM_ACTOR = 'system';

export function seedOrganization(): Organization {
  return {
    id: ORGANIZATION_ID,
    legalName: 'Asteron Industrial Supply, Inc.',
    displayName: 'Asteron Industrial Supply',
    industry: 'Industrial distribution and services',
    primaryCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    timezone: 'America/Chicago',
    fiscalYearStartMonth: 1,
    billingAddress: {
      line1: '1200 Industrial Parkway',
      city: 'Chicago',
      region: 'IL',
      postalCode: '60632',
      country: 'US',
    },
    operationalRegions: ['Midwest', 'South', 'Northeast', 'Mountain'],
    status: 'active',
    metadata: newMetadata(ORGANIZATION_ID, ORGANIZATION_ID, SYSTEM_ACTOR, '2019-01-15T14:00:00Z'),
  };
}
```

```ts
// packages/data/src/seed/warehouses.ts
import { makeId, newMetadata, type Warehouse } from '@nexora/domain';
import { ORGANIZATION_ID, SYSTEM_ACTOR } from './organization';

const ROWS: readonly [string, string, string][] = [
  ['CHI-01', 'Chicago Central', 'America/Chicago'],
  ['DAL-01', 'Dallas Distribution', 'America/Chicago'],
  ['ATL-01', 'Atlanta Hub', 'America/New_York'],
  ['DEN-01', 'Denver Regional', 'America/Denver'],
  ['NJ-01', 'New Jersey East', 'America/New_York'],
];

export function seedWarehouses(): Warehouse[] {
  return ROWS.map(([code, name, timezone], index) => {
    const id = makeId('wh', index + 1);
    return {
      id, organizationId: ORGANIZATION_ID, code, name, timezone, status: 'active',
      metadata: newMetadata(id, ORGANIZATION_ID, SYSTEM_ACTOR, '2019-03-01T14:00:00Z'),
    };
  });
}
```

```ts
// packages/data/src/seed/teams.ts
import { makeId, newMetadata, type Team, type TeamType } from '@nexora/domain';
import { ORGANIZATION_ID, SYSTEM_ACTOR } from './organization';

const ROWS: readonly [string, string, TeamType][] = [
  ['ENT-SALES', 'Enterprise Sales', 'sales'],
  ['SMB-SALES', 'SMB Sales', 'sales'],
  ['IN-SALES', 'Inside Sales', 'sales'],
  ['FIELD-OPS', 'Field Operations', 'sales'],
  ['FINANCE', 'Finance', 'finance'],
  ['ACCOUNTING', 'Accounting', 'finance'],
  ['PROCURE', 'Procurement', 'procurement'],
  ['SUPPORT', 'Customer Support', 'support'],
  ['WH-CHI', 'Warehouse Chicago', 'warehouse'],
  ['WH-DAL', 'Warehouse Dallas', 'warehouse'],
  ['WH-ATL', 'Warehouse Atlanta', 'warehouse'],
  ['WH-DEN', 'Warehouse Denver', 'warehouse'],
  ['EXEC', 'Executive', 'executive'],
  ['IT-ADMIN', 'IT Administration', 'administration'],
];

export function seedTeams(): Team[] {
  return ROWS.map(([code, name, type], index) => {
    const id = makeId('tem', index + 1);
    return {
      id, organizationId: ORGANIZATION_ID, code, name, type, status: 'active',
      metadata: newMetadata(id, ORGANIZATION_ID, SYSTEM_ACTOR, '2019-03-01T14:00:00Z'),
    };
  });
}

export const teamIdByCode = (teams: readonly Team[], code: string): string => {
  const team = teams.find((t) => t.code === code);
  if (team === undefined) throw new Error(`No team ${code}`);
  return team.id;
};
```

```ts
// packages/data/src/seed/roles.ts
import { makeId, newMetadata, ROLE_DESCRIPTIONS, ROLE_GRANTS, ROLE_NAMES, type Role, type RoleName } from '@nexora/domain';
import { ORGANIZATION_ID, SYSTEM_ACTOR } from './organization';

export function seedRoles(): Role[] {
  return ROLE_NAMES.map((name, index) => {
    const id = makeId('rol', index + 1);
    return {
      id, organizationId: ORGANIZATION_ID, name, description: ROLE_DESCRIPTIONS[name], isSystem: true,
      grants: [...ROLE_GRANTS[name]],
      metadata: newMetadata(id, ORGANIZATION_ID, SYSTEM_ACTOR, '2019-03-01T14:00:00Z'),
    };
  });
}

export const roleIdByName = (roles: readonly Role[], name: RoleName): string => {
  const role = roles.find((r) => r.name === name);
  if (role === undefined) throw new Error(`No role ${name}`);
  return role.id;
};
```

```ts
// packages/data/src/seed/users.ts
import {
  addHours, makeId, newMetadata, type PermissionScope, type Role, type RoleAssignment, type RoleName,
  type Team, type TeamMembership, type User, type UserStatus, type Warehouse,
} from '@nexora/domain';
import { CANONICAL_INSTANT } from '../clock';
import { createPrng } from '../prng';
import { FIRST_NAMES, LAST_NAMES } from './names';
import { ORGANIZATION_ID, SYSTEM_ACTOR } from './organization';
import { roleIdByName } from './roles';
import { teamIdByCode } from './teams';

export interface Persona {
  id: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  title: string;
  department: string;
  teamCode: string;
  context: string;
  warehouseIds?: string[];
}

export const PERSONAS: readonly Persona[] = [
  { id: 'usr_000001', firstName: 'Maya', lastName: 'Chen', role: 'Administrator', title: 'IT Administrator', department: 'IT', teamCode: 'IT-ADMIN', context: 'System administration' },
  { id: 'usr_000002', firstName: 'Evan', lastName: 'Brooks', role: 'Executive', title: 'Chief Operating Officer', department: 'Executive', teamCode: 'EXEC', context: 'Executive dashboards' },
  { id: 'usr_000003', firstName: 'Sofia', lastName: 'Ramirez', role: 'Sales Manager', title: 'Sales Manager', department: 'Sales', teamCode: 'ENT-SALES', context: 'Sales approvals and portfolio' },
  { id: 'usr_000004', firstName: 'Noah', lastName: 'Bennett', role: 'Sales Representative', title: 'Account Executive', department: 'Sales', teamCode: 'ENT-SALES', context: 'Customer and order workflow' },
  { id: 'usr_000005', firstName: 'Priya', lastName: 'Shah', role: 'Finance Manager', title: 'Finance Manager', department: 'Finance', teamCode: 'FINANCE', context: 'AR and credit' },
  { id: 'usr_000006', firstName: 'Marcus', lastName: 'Lee', role: 'Buyer', title: 'Buyer', department: 'Procurement', teamCode: 'PROCURE', context: 'Procurement' },
  { id: 'usr_000007', firstName: 'Jordan', lastName: 'Wells', role: 'Warehouse Operator', title: 'Warehouse Operator', department: 'Warehouse Operations', teamCode: 'WH-CHI', context: 'Chicago warehouse', warehouseIds: ['wh_000001'] },
  { id: 'usr_000008', firstName: 'Aisha', lastName: 'Grant', role: 'Support Agent', title: 'Support Agent', department: 'Customer Support', teamCode: 'SUPPORT', context: 'Support inbox' },
  { id: 'usr_000009', firstName: 'Owen', lastName: 'Price', role: 'Auditor', title: 'Internal Auditor', department: 'Finance', teamCode: 'FINANCE', context: 'Read-only and audit' },
];

export const DEFAULT_PERSONA_ID = 'usr_000003';

const ROLE_BY_TEAM: Record<string, readonly RoleName[]> = {
  'ENT-SALES': ['Sales Representative', 'Sales Representative', 'Sales Manager'],
  'SMB-SALES': ['Sales Representative', 'Sales Representative', 'Sales Manager'],
  'IN-SALES': ['Sales Representative'],
  'FIELD-OPS': ['Sales Representative'],
  FINANCE: ['Accountant', 'Finance Manager'],
  ACCOUNTING: ['Accountant'],
  PROCURE: ['Buyer', 'Buyer', 'Procurement Manager'],
  SUPPORT: ['Support Agent', 'Support Agent', 'Support Manager'],
  'WH-CHI': ['Warehouse Operator', 'Warehouse Operator', 'Warehouse Manager'],
  'WH-DAL': ['Warehouse Operator', 'Warehouse Operator', 'Warehouse Manager'],
  'WH-ATL': ['Warehouse Operator', 'Warehouse Manager'],
  'WH-DEN': ['Warehouse Operator', 'Warehouse Manager'],
  EXEC: ['Executive'],
  'IT-ADMIN': ['Administrator'],
};

const WAREHOUSE_BY_TEAM: Record<string, string> = {
  'WH-CHI': 'wh_000001', 'WH-DAL': 'wh_000002', 'WH-ATL': 'wh_000003', 'WH-DEN': 'wh_000004',
};

const TEAM_WEIGHTS: readonly [string, number][] = [
  ['ENT-SALES', 22], ['SMB-SALES', 24], ['IN-SALES', 16], ['FIELD-OPS', 14], ['FINANCE', 10], ['ACCOUNTING', 12],
  ['PROCURE', 14], ['SUPPORT', 26], ['WH-CHI', 18], ['WH-DAL', 12], ['WH-ATL', 10], ['WH-DEN', 8], ['EXEC', 5], ['IT-ADMIN', 5],
];

function scopeFor(role: RoleName, teamCode: string, teamId: string, warehouses: readonly Warehouse[]): PermissionScope {
  if (role.startsWith('Warehouse')) {
    const own = WAREHOUSE_BY_TEAM[teamCode];
    return { type: 'warehouse', warehouseIds: own === undefined ? warehouses.map((w) => w.id) : [own] };
  }
  if (role === 'Sales Representative') return { type: 'team', teamIds: [teamId] };
  return { type: 'all' };
}

export interface UsersSeed {
  users: User[];
  memberships: TeamMembership[];
  assignments: RoleAssignment[];
}

export function seedUsers(teams: readonly Team[], roles: readonly Role[], warehouses: readonly Warehouse[]): UsersSeed {
  const prng = createPrng('nexora-v1:users');
  const users: User[] = [];
  const memberships: TeamMembership[] = [];
  const assignments: RoleAssignment[] = [];
  const emails = new Set<string>();
  const statuses: UserStatus[] = [
    ...Array<UserStatus>(170 - PERSONAS.length).fill('active'),
    ...Array<UserStatus>(20).fill('invited'),
    ...Array<UserStatus>(10).fill('suspended'),
    ...Array<UserStatus>(5).fill('deactivated'),
  ];

  const add = (sequence: number, first: string, last: string, role: RoleName, teamCode: string, status: UserStatus, title: string, department: string, isLead: boolean, warehouseIds?: string[]) => {
    const id = makeId('usr', sequence);
    let email = `${first}.${last}@asteron.example`.toLowerCase();
    if (emails.has(email)) email = `${first}.${last}${sequence}@asteron.example`.toLowerCase();
    emails.add(email);
    const teamId = teamIdByCode(teams, teamCode);
    const created = addHours('2019-03-01T14:00:00Z', prng.int(0, 60_000));
    users.push({
      id, organizationId: ORGANIZATION_ID, firstName: first, lastName: last, displayName: `${first} ${last}`, email,
      title, department, status, locale: 'en-US', timezone: 'America/Chicago',
      ...(status === 'active' ? { lastActiveAt: addHours(CANONICAL_INSTANT, -prng.int(0, 240)) } : {}),
      notificationPreferences: { emailApprovals: true, emailMentions: true, inAppApprovals: true, inAppMentions: true, inAppOperationalAlerts: role.startsWith('Warehouse') || role === 'Buyer' },
      metadata: newMetadata(id, ORGANIZATION_ID, SYSTEM_ACTOR, created),
    });
    memberships.push({ teamId, userId: id, isLead });
    const scope: PermissionScope = warehouseIds === undefined ? scopeFor(role, teamCode, teamId, warehouses) : { type: 'warehouse', warehouseIds };
    assignments.push({ id: makeId('ras', sequence), organizationId: ORGANIZATION_ID, userId: id, roleId: roleIdByName(roles, role), scope, createdAt: created, createdBy: SYSTEM_ACTOR });
    if (role === 'Sales Representative' && warehouseIds === undefined) {
      // read scope is all: a second assignment of the same role with scope all covers reads (§55.5)
      assignments.push({ id: makeId('ras', 1000 + sequence), organizationId: ORGANIZATION_ID, userId: id, roleId: roleIdByName(roles, role), scope: { type: 'all' }, createdAt: created, createdBy: SYSTEM_ACTOR });
    }
  };

  PERSONAS.forEach((p, index) => add(index + 1, p.firstName, p.lastName, p.role, p.teamCode, 'active', p.title, p.department, p.role.endsWith('Manager') || p.role === 'Administrator', p.warehouseIds));

  const pool = prng.shuffle(statuses);
  let sequence = PERSONAS.length + 1;
  for (const [teamCode, weight] of TEAM_WEIGHTS) {
    const roleCycle = ROLE_BY_TEAM[teamCode] ?? ['Sales Representative'];
    for (let i = 0; i < weight && sequence <= 205; i++) {
      const role = roleCycle[i % roleCycle.length] as RoleName;
      const status = pool[sequence - PERSONAS.length - 1] ?? 'active';
      add(sequence, prng.pick(FIRST_NAMES), prng.pick(LAST_NAMES), role, teamCode, status, role, teams.find((t) => t.code === teamCode)?.name ?? teamCode, false);
      sequence++;
    }
  }
  while (sequence <= 205) {
    const status = pool[sequence - PERSONAS.length - 1] ?? 'active';
    add(sequence, prng.pick(FIRST_NAMES), prng.pick(LAST_NAMES), 'Sales Representative', 'SMB-SALES', status, 'Account Executive', 'Sales', false);
    sequence++;
  }

  // managers: each persona's manager is the team lead or Evan Brooks
  for (const user of users) {
    if (user.id === 'usr_000002') continue;
    const membership = memberships.find((m) => m.userId === user.id);
    const lead = memberships.find((m) => m.teamId === membership?.teamId && m.isLead && m.userId !== user.id);
    user.managerId = lead?.userId ?? 'usr_000002';
  }
  return { users, memberships, assignments };
}
```

```ts
// packages/data/src/seed/index.ts
import type { Organization, Role, RoleAssignment, Team, TeamMembership, User, Warehouse } from '@nexora/domain';
import { seedOrganization } from './organization';
import { seedRoles } from './roles';
import { seedTeams } from './teams';
import { seedUsers } from './users';
import { seedWarehouses } from './warehouses';

export * from './organization';
export * from './roles';
export * from './teams';
export * from './users';
export * from './warehouses';

export interface IdentitySeed {
  organization: Organization;
  warehouses: Warehouse[];
  teams: Team[];
  roles: Role[];
  users: User[];
  memberships: TeamMembership[];
  assignments: RoleAssignment[];
}

export function seedIdentity(): IdentitySeed {
  const organization = seedOrganization();
  const warehouses = seedWarehouses();
  const teams = seedTeams();
  const roles = seedRoles();
  const { users, memberships, assignments } = seedUsers(teams, roles, warehouses);
  return { organization, warehouses, teams, roles, users, memberships, assignments };
}
```

- [ ] **Step 5: Correr e ver passar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/data`
Expected: PASS. Se a soma dos pesos (196) mais 9 personas não fechar em 205, o `while` final completa; a asserção por estado depende só de `statuses` (196 entradas) — confirmar que `170 - 9 + 20 + 10 + 5 = 196`.

- [ ] **Step 6: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora/packages/data/src && git add apps/demos/nexora/packages/data && git commit -m "feat(nexora-data): PRNG determinístico, relógio de demonstração, seed de identidade — organização, 5 armazéns, 14 equipas, 13 papéis, 205 utilizadores com as 9 personas"
```

---

### Task 6: `@nexora/data` — corpus curado, notificações, tarefas, aprovações, atividade

**Files:**
- Create: `packages/data/src/seed/curated.ts`, `packages/data/src/seed/activity.ts`
- Modify: `packages/data/src/seed/index.ts`
- Test: `packages/data/src/seed/activity.test.ts`

**Interfaces:**
- Consumes: `IdentitySeed`, `PERSONAS`, `createPrng`, `CANONICAL_INSTANT`, tipos do domínio.
- Produces:
  - `CURATED: { customers, contacts, products, salesOrders, quotes, invoices, suppliers, purchaseOrders, tickets }` — cada entrada `{ id, businessNumber, title, subtitle, terms? }`; `MERIDIAN` com os ids do §76
  - `seedSearchDocuments(): SearchDocument[]`
  - `ActivitySeed { notifications; tasks; approvals; activity }`, `seedActivity(identity: IdentitySeed): ActivitySeed`
  - `FullSeed = IdentitySeed & ActivitySeed & { searchDocuments: SearchDocument[] }`, `seedAll(): FullSeed`

- [ ] **Step 1: Teste**

```ts
// packages/data/src/seed/activity.test.ts
import { describe, expect, it } from 'vitest';
import { seedAll } from './index';

describe('activity seed', () => {
  const seed = seedAll();

  it('is deterministic', () => {
    expect(seedAll()).toEqual(seed);
  });
  it('gives Sofia six pending approvals including the Meridian order', () => {
    const mine = seed.approvals.filter((a) => a.status === 'pending' && a.requiredPermission === 'orders.approve');
    expect(mine.some((a) => a.businessNumber === 'SO-2026-01842' && a.amount?.amount === 86420)).toBe(true);
    expect(mine.length).toBe(6);
  });
  it('gives every persona notifications of every type, a third read', () => {
    for (const id of ['usr_000003', 'usr_000007', 'usr_000009']) {
      const mine = seed.notifications.filter((n) => n.userId === id);
      expect(mine.length).toBeGreaterThanOrEqual(12);
      expect(new Set(mine.map((n) => n.type)).size).toBe(4);
      const read = mine.filter((n) => n.readAt !== undefined).length;
      expect(read / mine.length).toBeGreaterThan(0.2);
      expect(read / mine.length).toBeLessThan(0.4);
    }
  });
  it('indexes the Meridian records for search', () => {
    const numbers = seed.searchDocuments.map((d) => d.businessNumber);
    for (const n of ['CUS-010428', 'SO-2026-01842', 'INV-2026-02891', 'MX-240', 'TCK-10492']) expect(numbers).toContain(n);
  });
  it('gives each persona between three and eight open tasks, one overdue', () => {
    const jordan = seed.tasks.filter((t) => t.assigneeId === 'usr_000007' && t.status === 'open');
    expect(jordan.length).toBeGreaterThanOrEqual(3);
    expect(jordan.length).toBeLessThanOrEqual(8);
    expect(jordan.some((t) => t.dueDate !== undefined && t.dueDate < '2026-09-04')).toBe(true);
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/data/src/seed/activity`
Expected: FAIL.

- [ ] **Step 3: Corpus curado**

```ts
// packages/data/src/seed/curated.ts
import type { SearchDocument, SearchEntityType } from '@nexora/domain';
import { createPrng } from '../prng';

export interface CuratedRecord {
  id: string;
  businessNumber: string;
  title: string;
  subtitle: string;
  terms?: string[];
}

export const MERIDIAN = {
  customer: { id: 'cus_010428', businessNumber: 'CUS-010428', title: 'Meridian Controls Group', subtitle: 'Enterprise · At risk' },
  order: { id: 'ord_018420', businessNumber: 'SO-2026-01842', title: 'SO-2026-01842', subtitle: 'Meridian Controls Group · $86,420 · confirmed' },
  invoice: { id: 'inv_028910', businessNumber: 'INV-2026-02891', title: 'INV-2026-02891', subtitle: 'Meridian Controls Group · $41,860 · 14 days overdue' },
  product: { id: 'sku_000240', businessNumber: 'MX-240', title: 'Servo Motor MX-240', subtitle: '6 units backordered' },
  shipment: { id: 'shp_009841', businessNumber: 'SHP-009841', title: 'SHP-009841', subtitle: 'In transit' },
  ticket: { id: 'tck_010492', businessNumber: 'TCK-10492', title: 'Shipment delay for SO-2026-01842', subtitle: 'Meridian Controls Group · high' },
} as const;

const CUSTOMER_NAMES = [
  'Northwind Fabrication', 'Blue Ridge Machining', 'Harbor Point Logistics', 'Summit Valve & Fitting', 'Crescent Automation',
  'Ironclad Tooling', 'Pinnacle Conveyor Systems', 'Redwood Packaging', 'Lakeshore Precision', 'Granite Peak Mining',
  'Vantage Robotics', 'Copperline Electrical', 'Atlas Pump Works', 'Silverline Foods', 'Brightwater Utilities',
  'Keystone Hydraulics', 'Falcon Aerospace Components', 'Oakridge Plastics', 'Meadowbrook Dairy Equipment', 'Titan Steel Service',
  'Evergreen Timber Mills', 'Cobalt Marine Supply', 'Prairie Wind Energy', 'Sterling Medical Devices', 'Ridgeline Construction',
  'Beacon Bottling', 'Cascade Paper', 'Delta Print Systems', 'Horizon Textiles', 'Juniper Chemical',
  'Liberty Rail Services', 'Magnolia Furniture', 'Nautilus Offshore', 'Orchard Foods', 'Quarry Aggregates',
  'Riverbend Brewing', 'Sequoia Semiconductor', 'Trident Defense Systems', 'Union Glassworks', 'Westfield Agriculture',
];
const PRODUCT_NAMES = [
  'Servo Motor MX-180', 'Servo Motor MX-320', 'Gear Reducer GR-45', 'Linear Actuator LA-12', 'Pneumatic Cylinder PC-80',
  'Solenoid Valve SV-2', 'Pressure Transducer PT-500', 'Proximity Sensor PS-18', 'PLC Module PLC-16DI', 'HMI Panel HMI-10',
  'VFD Drive VF-7.5', 'Ball Bearing BB-6205', 'Roller Chain RC-60', 'Timing Belt TB-5M', 'Coupling CP-28',
  'Hydraulic Pump HP-40', 'Filter Element FE-10', 'Safety Relay SR-24', 'Encoder EN-1024', 'Servo Cable SC-5',
  'Contactor CT-32', 'Circuit Breaker CB-63', 'Power Supply PSU-24', 'Terminal Block TB-4', 'Cable Gland CG-M20',
  'Gearbox GB-90', 'Brake Module BM-3', 'Thermal Overload TO-25', 'Limit Switch LS-1', 'Vacuum Generator VG-10',
];
const SUPPLIER_NAMES = [
  'Osaka Drive Systems', 'Rheinland Automation GmbH', 'Midwest Bearings Co.', 'Pacific Sensor Corp', 'Alpine Hydraulics AG',
  'Great Lakes Fasteners', 'Nordic Cable Works', 'Lone Star Electrical Supply', 'Yangtze Precision', 'Delaware Valley Plastics',
  'Ontario Gear Ltd.', 'Bavaria Pneumatics',
];
const TICKET_SUBJECTS = [
  'Wrong quantity delivered', 'Damaged packaging on arrival', 'Invoice does not match PO', 'Request for return authorization',
  'Backorder ETA', 'Portal login issue', 'Duplicate shipment', 'Missing certificate of conformance', 'Pricing discrepancy',
  'Expedite request', 'Warranty claim', 'Address change for open order',
];

function words(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9-]+/).filter((w) => w.length > 0);
}

function list(prefix: string, count: number, names: readonly string[], number: (i: number) => string, subtitle: (i: number) => string, idPrefix: string): CuratedRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${idPrefix}_${String(i + 1).padStart(6, '0')}`,
    businessNumber: number(i),
    title: names[i % names.length] ?? `${prefix} ${i + 1}`,
    subtitle: subtitle(i),
  }));
}

const prng = createPrng('nexora-v1:curated');
const customer = (i: number) => CUSTOMER_NAMES[i % CUSTOMER_NAMES.length] ?? 'Customer';

export const CURATED = {
  customers: [
    { ...MERIDIAN.customer },
    ...list('Customer', 40, CUSTOMER_NAMES, (i) => `CUS-${String(10001 + i).padStart(6, '0')}`, (i) => `${['SMB', 'Mid-market', 'Enterprise'][i % 3]} · Active`, 'cus'),
  ],
  contacts: Array.from({ length: 25 }, (_, i) => ({
    id: `con_${String(i + 1).padStart(6, '0')}`,
    businessNumber: '',
    title: ['Dana Whitfield', 'Raj Patel', 'Elena Moreau', 'Tom Okafor', 'Lucia Ferrante'][i % 5] ?? 'Contact',
    subtitle: customer(i),
  })),
  products: [
    { ...MERIDIAN.product },
    ...list('Product', 30, PRODUCT_NAMES, (i) => (PRODUCT_NAMES[i] ?? '').split(' ').at(-1) ?? `SKU-${i}`, () => 'In stock', 'sku'),
  ],
  salesOrders: [
    { ...MERIDIAN.order },
    ...list('Order', 20, [], (i) => `SO-2026-${String(1700 + i).padStart(5, '0')}`, (i) => `${customer(i)} · $${prng.int(2, 90)},${String(prng.int(100, 999))} · ${['draft', 'confirmed', 'shipped'][i % 3]}`, 'ord'),
  ].map((o, i) => ({ ...o, title: o.businessNumber, ...(i === 0 ? {} : {}) })),
  quotes: list('Quote', 12, [], (i) => `Q-2026-${String(4800 + i).padStart(6, '0')}`, (i) => `${customer(i + 3)} · sent`, 'quo').map((q) => ({ ...q, title: q.businessNumber })),
  invoices: [
    { ...MERIDIAN.invoice },
    ...list('Invoice', 20, [], (i) => `INV-2026-${String(2800 + i).padStart(5, '0')}`, (i) => `${customer(i + 7)} · ${['open', 'paid', 'overdue'][i % 3]}`, 'inv'),
  ].map((v) => ({ ...v, title: v.businessNumber })),
  suppliers: list('Supplier', 12, SUPPLIER_NAMES, (i) => `SUP-${String(101 + i).padStart(4, '0')}`, () => 'Active', 'sup'),
  purchaseOrders: list('PO', 10, [], (i) => `PO-2026-${String(900 + i).padStart(5, '0')}`, (i) => `${SUPPLIER_NAMES[i % SUPPLIER_NAMES.length]} · ${['sent', 'received', 'urgent'][i % 3]}`, 'po').map((p) => ({ ...p, title: p.businessNumber })),
  tickets: [
    { ...MERIDIAN.ticket },
    ...list('Ticket', 12, TICKET_SUBJECTS, (i) => `TCK-${String(10400 + i)}`, (i) => `${customer(i + 11)} · ${['normal', 'high'][i % 2]}`, 'tck'),
  ],
} as const;

const TYPE_OF: Record<keyof typeof CURATED, [SearchEntityType, SearchDocument['requiredPermission'], string]> = {
  customers: ['customer', 'customers.view', '/crm/customers'],
  contacts: ['contact', 'contacts.view', '/crm/contacts'],
  products: ['product', 'catalog.view', '/catalog/products'],
  salesOrders: ['sales_order', 'orders.view', '/sales/orders'],
  quotes: ['quote', 'quotes.view', '/sales/quotes'],
  invoices: ['invoice', 'invoices.view', '/finance/invoices'],
  suppliers: ['supplier', 'suppliers.view', '/procurement/suppliers'],
  purchaseOrders: ['purchase_order', 'purchase_orders.view', '/procurement/purchase-orders'],
  tickets: ['ticket', 'support.view', '/support/tickets'],
};

export function seedSearchDocuments(): SearchDocument[] {
  return (Object.keys(CURATED) as (keyof typeof CURATED)[]).flatMap((key) => {
    const [type, requiredPermission, base] = TYPE_OF[key];
    return CURATED[key].map((record): SearchDocument => ({
      type, id: record.id, title: record.title, subtitle: record.subtitle, route: `${base}/${record.id}`, requiredPermission,
      ...(record.businessNumber === '' ? {} : { businessNumber: record.businessNumber }),
      terms: [...new Set([...words(record.title), ...words(record.subtitle), record.businessNumber.toLowerCase()].filter((t) => t !== ''))],
    }));
  });
}
```

- [ ] **Step 4: Notificações, tarefas, aprovações, atividade**

```ts
// packages/data/src/seed/activity.ts
import {
  addDays, addHours, makeId, money, newMetadata, type ActivityEvent, type ApprovalRequest, type Notification,
  type NotificationType, type Permission, type RoleName, type Task, toBusinessDate,
} from '@nexora/domain';
import { CANONICAL_INSTANT, ORGANIZATION_TIMEZONE } from '../clock';
import { createPrng } from '../prng';
import { CURATED, MERIDIAN } from './curated';
import type { IdentitySeed } from './index';
import { ORGANIZATION_ID, SYSTEM_ACTOR } from './organization';
import { PERSONAS } from './users';

export interface ActivitySeed {
  notifications: Notification[];
  tasks: Task[];
  approvals: ApprovalRequest[];
  activity: ActivityEvent[];
}

const TEMPLATES: Record<NotificationType, readonly [string, string][]> = {
  info: [
    ['New note on {customer}', 'A teammate added a note you follow.'],
    ['Shipment {shipment} in transit', 'Carrier picked up the shipment.'],
    ['Price list updated', 'Standard price list changed 14 SKUs.'],
  ],
  success: [
    ['Payment received for {invoice}', 'The invoice is now paid in full.'],
    ['Order {order} shipped', 'All lines shipped from Chicago Central.'],
    ['Ticket {ticket} resolved', 'Closed by the customer.'],
  ],
  warning: [
    ['Invoice {invoice} is 14 days overdue', 'Credit hold applies at 30 days.'],
    ['Stock for {product} fell below safety level', 'Reorder point reached in two warehouses.'],
    ['Requested date at risk for {order}', 'Allocation shortage on one line.'],
  ],
  action_required: [
    ['Approval required for {order}', 'Order exceeds your team discount policy.'],
    ['Ticket {ticket} breached first-response SLA', 'Assign or reply now.'],
    ['Credit limit review for {customer}', 'Utilization above 90 %.'],
  ],
};

const ROUTE_OF: Record<string, string> = {
  customer: '/crm/customers', order: '/sales/orders', invoice: '/finance/invoices', product: '/catalog/products',
  ticket: '/support/tickets', shipment: '/inventory/shipments',
};

function fill(text: string, refs: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => refs[key] ?? key);
}

export function seedActivity(identity: IdentitySeed): ActivitySeed {
  const prng = createPrng('nexora-v1:activity');
  const notifications: Notification[] = [];
  const tasks: Task[] = [];
  const approvals: ApprovalRequest[] = [];
  const activity: ActivityEvent[] = [];
  let n = 0;
  let t = 0;
  let a = 0;
  const roleOf = (userId: string): RoleName => {
    const assignment = identity.assignments.find((x) => x.userId === userId);
    return (identity.roles.find((r) => r.id === assignment?.roleId)?.name ?? 'Auditor') as RoleName;
  };

  const pickRef = (kind: 'customer' | 'order' | 'invoice' | 'product' | 'ticket' | 'shipment', meridian: boolean) => {
    if (meridian) {
      const m = { customer: MERIDIAN.customer, order: MERIDIAN.order, invoice: MERIDIAN.invoice, product: MERIDIAN.product, ticket: MERIDIAN.ticket, shipment: MERIDIAN.shipment }[kind];
      return { label: kind === 'customer' ? m.title : m.businessNumber, id: m.id, type: kind };
    }
    const pool = { customer: CURATED.customers, order: CURATED.salesOrders, invoice: CURATED.invoices, product: CURATED.products, ticket: CURATED.tickets, shipment: [MERIDIAN.shipment] }[kind];
    const r = prng.pick(pool);
    return { label: kind === 'customer' || kind === 'product' ? r.title : r.businessNumber, id: r.id, type: kind };
  };

  for (const persona of PERSONAS) {
    const count = prng.int(12, 30);
    const types: NotificationType[] = ['info', 'success', 'warning', 'action_required'];
    for (let i = 0; i < count; i++) {
      const type = i < 4 ? (types[i] as NotificationType) : prng.pick(types);
      const [title, body] = prng.pick(TEMPLATES[type]);
      const kind = (/\{(\w+)\}/.exec(title)?.[1] ?? 'customer') as 'customer' | 'order' | 'invoice' | 'product' | 'ticket' | 'shipment';
      const ref = pickRef(kind, i === 0);
      const createdAt = addHours(CANONICAL_INSTANT, -prng.int(0, 21 * 24 * 12) / 12);
      const read = (i + 1) % 3 === 0;
      notifications.push({
        id: makeId('ntf', ++n), organizationId: ORGANIZATION_ID, userId: persona.id, type,
        title: fill(title, { [kind]: ref.label }), body, entityType: ref.type, entityId: ref.id,
        route: `${ROUTE_OF[ref.type] ?? '/dashboard'}/${ref.id}`,
        ...(read ? { readAt: addHours(createdAt, 1) } : {}), createdAt,
      });
    }
    const taskCount = prng.int(3, 8);
    for (let i = 0; i < taskCount; i++) {
      const due = addDays(CANONICAL_INSTANT, i === 0 ? -2 : prng.int(1, 14));
      tasks.push({
        id: makeId('tsk', ++t), organizationId: ORGANIZATION_ID,
        title: prng.pick(['Call back {customer}', 'Review margin on {order}', 'Confirm ETA for {product}', 'Follow up on {ticket}', 'Reconcile {invoice}']).replace(/\{(\w+)\}/, (_, k: string) => pickRef(k as 'customer', false).label),
        assigneeId: persona.id, createdBy: prng.pick(['usr_000002', 'usr_000003', 'usr_000001']), dueDate: toBusinessDate(due, ORGANIZATION_TIMEZONE),
        priority: i === 0 ? 'high' : prng.pick(['low', 'normal', 'high']), status: 'open',
        metadata: newMetadata(makeId('tsk', t), ORGANIZATION_ID, SYSTEM_ACTOR, addDays(CANONICAL_INSTANT, -prng.int(1, 10))),
      });
    }
  }

  const approval = (type: ApprovalRequest['type'], ref: { id: string; businessNumber: string; title: string }, entityType: string, requiredPermission: Permission, amount: number | undefined, requestedBy: string, subject: string) => {
    const createdAt = addHours(CANONICAL_INSTANT, -prng.int(2, 96));
    approvals.push({
      id: makeId('apr', ++a), organizationId: ORGANIZATION_ID, type, entityType, entityId: ref.id, businessNumber: ref.businessNumber, subject,
      ...(amount === undefined ? {} : { amount: money(amount, 'USD') }), requestedBy, requiredPermission, status: 'pending', createdAt,
      metadata: newMetadata(makeId('apr', a), ORGANIZATION_ID, requestedBy, createdAt),
    });
  };
  approval('sales_order', MERIDIAN.order, 'sales_order', 'orders.approve', 86420, 'usr_000004', 'Discount above team policy');
  for (let i = 1; i <= 5; i++) approval('sales_order', CURATED.salesOrders[i] as { id: string; businessNumber: string; title: string }, 'sales_order', 'orders.approve', prng.int(5, 60) * 1000, 'usr_000004', 'Discount above team policy');
  approval('credit_limit', MERIDIAN.customer, 'customer', 'customers.credit_edit', 500000, 'usr_000003', 'Raise credit limit to $650,000');
  for (let i = 1; i <= 3; i++) approval('credit_limit', CURATED.customers[i] as { id: string; businessNumber: string; title: string }, 'customer', 'customers.credit_edit', prng.int(50, 300) * 1000, 'usr_000003', 'Credit limit increase');
  for (let i = 0; i < 3; i++) approval('purchase_order', CURATED.purchaseOrders[i] as { id: string; businessNumber: string; title: string }, 'purchase_order', 'purchase_orders.approve', prng.int(8, 40) * 1000, 'usr_000006', 'PO above buyer limit');

  const ACTIONS: readonly [string, string][] = [
    ['order.approved', 'approved {order}'], ['note.added', 'added a note on {customer}'], ['payment.received', 'recorded a payment on {invoice}'],
    ['ticket.escalated', 'escalated {ticket}'], ['shipment.delayed', 'flagged {shipment} as delayed'], ['customer.held', 'put {customer} on hold'],
  ];
  for (let i = 0; i < 40; i++) {
    const [action, summary] = prng.pick(ACTIONS);
    const kind = (/\{(\w+)\}/.exec(summary)?.[1] ?? 'customer') as 'customer' | 'order' | 'invoice' | 'ticket' | 'shipment';
    const ref = pickRef(kind, i < 3);
    const actor = prng.pick(PERSONAS).id;
    activity.push({
      id: makeId('act', i + 1), organizationId: ORGANIZATION_ID, actorId: actor, action, entityType: ref.type, entityId: ref.id,
      summary: `${identity.users.find((u) => u.id === actor)?.displayName ?? actor} ${fill(summary, { [kind]: ref.label })}`,
      occurredAt: addHours(CANONICAL_INSTANT, -prng.int(0, 72)),
    });
  }
  activity.sort((x, y) => (x.occurredAt < y.occurredAt ? 1 : -1));
  void roleOf;
  return { notifications, tasks, approvals, activity };
}
```

Acrescentar a `packages/data/src/seed/index.ts`:

```ts
import type { SearchDocument } from '@nexora/domain';
import { seedActivity, type ActivitySeed } from './activity';
import { seedSearchDocuments } from './curated';

export * from './activity';
export * from './curated';

export type FullSeed = IdentitySeed & ActivitySeed & { searchDocuments: SearchDocument[] };

export function seedAll(): FullSeed {
  const identity = seedIdentity();
  return { ...identity, ...seedActivity(identity), searchDocuments: seedSearchDocuments() };
}
```

- [ ] **Step 5: Correr e ver passar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/data && pnpm --filter @nexora/data typecheck`
Expected: PASS. A proporção de lidas é `floor(count/3)/count` ∈ (0.2, 0.4) para `count ∈ [12, 30]`. Remover `void roleOf;` e `roleOf` se o typecheck os apontar como não usados.

- [ ] **Step 6: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora/packages/data/src && git add apps/demos/nexora/packages/data && git commit -m "feat(nexora-data): corpus curado com a narrativa Meridian §76, documentos de pesquisa, notificações, tarefas, aprovações e atividade por persona"
```

---

### Task 7: `@nexora/data` — persistência

**Files:**
- Create: `packages/data/src/persistence/types.ts`, `memory.ts`, `indexeddb.ts`, `index.ts`
- Test: `packages/data/src/persistence/persistence.test.ts`

**Interfaces:**
- Produces:
  - `DemoDatabaseMetadata` (§74.1)
  - `MutableCollection = 'notifications' | 'tasks' | 'approvals' | 'preferences' | 'demo'`
  - `Persistence { read<T>(c, id): Promise<T | undefined>; list<T>(c): Promise<T[]>; write<T extends { id: string }>(c, record): Promise<void>; remove(c, id): Promise<void>; readMetadata(): Promise<DemoDatabaseMetadata | undefined>; writeMetadata(m): Promise<void>; clear(): Promise<void> }`
  - `createMemoryPersistence(): Persistence`, `createIndexedDbPersistence(name = 'nexora'): Persistence`

- [ ] **Step 1: Teste (a mesma suíte para os dois adaptadores)**

```ts
// packages/data/src/persistence/persistence.test.ts
import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { createIndexedDbPersistence, createMemoryPersistence, type Persistence } from './index';

const suite = (name: string, make: () => Persistence) =>
  describe(name, () => {
    it('writes, reads, lists, removes and clears', async () => {
      const p = make();
      await p.write('tasks', { id: 'tsk_000001', title: 'a' });
      await p.write('tasks', { id: 'tsk_000002', title: 'b' });
      expect(await p.read<{ title: string }>('tasks', 'tsk_000001')).toEqual({ id: 'tsk_000001', title: 'a' });
      expect((await p.list('tasks')).length).toBe(2);
      await p.remove('tasks', 'tsk_000001');
      expect((await p.list('tasks')).length).toBe(1);
      await p.writeMetadata({ schemaVersion: 1, seedVersion: 'nexora-v1', scenarioId: 'healthy', demoClock: '2026-09-04T15:00:00Z', activePersonaId: 'usr_000003', initializedAt: '2026-09-04T15:00:00Z' });
      expect((await p.readMetadata())?.activePersonaId).toBe('usr_000003');
      await p.clear();
      expect(await p.list('tasks')).toEqual([]);
      expect(await p.readMetadata()).toBeUndefined();
    });
  });

suite('memory', () => createMemoryPersistence());
suite('indexeddb', () => createIndexedDbPersistence(`nexora-test-${Math.random()}`));
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/data/src/persistence`
Expected: FAIL.

- [ ] **Step 3: Implementação**

```ts
// packages/data/src/persistence/types.ts
import type { Instant, ScenarioId } from '@nexora/domain';

export interface DemoDatabaseMetadata {
  schemaVersion: number;
  seedVersion: string;
  scenarioId: ScenarioId;
  demoClock: Instant;
  activePersonaId: string | null;
  transportProfile?: 'normal' | 'system_degraded';
  initializedAt: Instant;
}

export const MUTABLE_COLLECTIONS = ['notifications', 'tasks', 'approvals', 'preferences', 'demo'] as const;
export type MutableCollection = (typeof MUTABLE_COLLECTIONS)[number];

export interface Persistence {
  read<T>(collection: MutableCollection, id: string): Promise<T | undefined>;
  list<T>(collection: MutableCollection): Promise<T[]>;
  write<T extends { id: string }>(collection: MutableCollection, record: T): Promise<void>;
  remove(collection: MutableCollection, id: string): Promise<void>;
  readMetadata(): Promise<DemoDatabaseMetadata | undefined>;
  writeMetadata(metadata: DemoDatabaseMetadata): Promise<void>;
  clear(): Promise<void>;
}
```

```ts
// packages/data/src/persistence/memory.ts
import type { DemoDatabaseMetadata, MutableCollection, Persistence } from './types';

export function createMemoryPersistence(): Persistence {
  let stores = new Map<MutableCollection, Map<string, unknown>>();
  let metadata: DemoDatabaseMetadata | undefined;
  const store = (c: MutableCollection) => {
    const s = stores.get(c) ?? new Map<string, unknown>();
    stores.set(c, s);
    return s;
  };
  return {
    read: async (c, id) => structuredClone(store(c).get(id)) as never,
    list: async (c) => [...store(c).values()].map((v) => structuredClone(v)) as never,
    write: async (c, record) => void store(c).set(record.id, structuredClone(record)),
    remove: async (c, id) => void store(c).delete(id),
    readMetadata: async () => (metadata === undefined ? undefined : structuredClone(metadata)),
    writeMetadata: async (m) => void (metadata = structuredClone(m)),
    clear: async () => {
      stores = new Map();
      metadata = undefined;
    },
  };
}
```

```ts
// packages/data/src/persistence/indexeddb.ts
import { MUTABLE_COLLECTIONS, type DemoDatabaseMetadata, type MutableCollection, type Persistence } from './types';

const META_STORE = 'metadata';
const META_KEY = 'demo';

function request<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function open(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(name, 1);
    r.onupgradeneeded = () => {
      const db = r.result;
      for (const c of MUTABLE_COLLECTIONS) if (!db.objectStoreNames.contains(c)) db.createObjectStore(c, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE);
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export function createIndexedDbPersistence(name = 'nexora'): Persistence {
  let db: Promise<IDBDatabase> | undefined;
  const database = () => (db ??= open(name));
  const tx = async (store: string, mode: IDBTransactionMode) => (await database()).transaction(store, mode).objectStore(store);
  return {
    read: async (c, id) => request((await tx(c, 'readonly')).get(id)) as never,
    list: async (c) => request((await tx(c, 'readonly')).getAll()) as never,
    write: async (c, record) => void (await request((await tx(c, 'readwrite')).put(record))),
    remove: async (c, id) => void (await request((await tx(c, 'readwrite')).delete(id))),
    readMetadata: async () => request<DemoDatabaseMetadata | undefined>((await tx(META_STORE, 'readonly')).get(META_KEY)),
    writeMetadata: async (m) => void (await request((await tx(META_STORE, 'readwrite')).put(m, META_KEY))),
    clear: async () => {
      const d = await database();
      const names: string[] = [...MUTABLE_COLLECTIONS, META_STORE];
      const t = d.transaction(names, 'readwrite');
      await Promise.all(names.map((n) => request(t.objectStore(n).clear())));
    },
  };
}

export type { MutableCollection };
```

```ts
// packages/data/src/persistence/index.ts
export * from './indexeddb';
export * from './memory';
export * from './types';
```

- [ ] **Step 4: Correr e ver passar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/data/src/persistence`
Expected: PASS (2 testes).

- [ ] **Step 5: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora/packages/data/src && git add apps/demos/nexora/packages/data && git commit -m "feat(nexora-data): persistência — memória e IndexedDB com a mesma suíte, metadados §74.1"
```

---

### Task 8: `@nexora/data` — cenários e `Store`

**Files:**
- Create: `packages/data/src/scenarios/index.ts`, `packages/data/src/store/index.ts`, `packages/data/src/index.ts`
- Test: `packages/data/src/store/store.test.ts`

**Interfaces:**
- Consumes: `seedAll`, `FullSeed`, `Persistence`, `DemoClock`, `PERSONAS`, `DEFAULT_PERSONA_ID`.
- Produces:
  - `ScenarioDefinition { id: ScenarioId; label: string; description: string; personaId: string; apply(seed: FullSeed, clock: DemoClock): FullSeed }`, `SCENARIOS: Record<ScenarioId, ScenarioDefinition>`
  - `Store` com `open(): Promise<void>`, `state: FullSeed` (após overlay), `clock: DemoClock`, `metadata: DemoDatabaseMetadata`, `activePersonaId: string | null`, `transportProfile`, `setPersona(userId | null)`, `switchScenario(id)`, `advanceClock(days)`, `setTransportProfile(p)`, `reset()`, `writeMutable(collection, record)`, `readPreferences(userId)`, `writePreferences(userId, prefs)`
  - `createStore(persistence: Persistence): Store`

- [ ] **Step 1: Teste**

```ts
// packages/data/src/store/store.test.ts
import { describe, expect, it } from 'vitest';
import { createMemoryPersistence } from '../persistence';
import { createStore } from './index';

describe('store', () => {
  it('opens with the default persona and healthy scenario', async () => {
    const store = createStore(createMemoryPersistence());
    await store.open();
    expect(store.activePersonaId).toBe('usr_000003');
    expect(store.metadata.scenarioId).toBe('healthy');
    expect(store.clock.now()).toBe('2026-09-04T15:00:00Z');
  });
  it('overlays persisted mutations and drops them on reset', async () => {
    const persistence = createMemoryPersistence();
    const store = createStore(persistence);
    await store.open();
    const first = store.state.notifications[0]!;
    await store.writeMutable('notifications', { ...first, readAt: '2026-09-04T16:00:00Z' });
    expect(store.state.notifications[0]?.readAt).toBe('2026-09-04T16:00:00Z');
    const reopened = createStore(persistence);
    await reopened.open();
    expect(reopened.state.notifications[0]?.readAt).toBe('2026-09-04T16:00:00Z');
    await reopened.reset();
    expect(reopened.state.notifications[0]?.readAt).toBeUndefined();
  });
  it('restricted_user signs in Jordan without inventory.adjust and with one warehouse', async () => {
    const store = createStore(createMemoryPersistence());
    await store.open();
    await store.switchScenario('restricted_user');
    expect(store.activePersonaId).toBe('usr_000007');
    const role = store.state.roles.find((r) => r.name === 'Warehouse Operator');
    expect(role?.grants.some((g) => g.permission === 'inventory.adjust')).toBe(false);
  });
  it('new_tenant keeps three active users', async () => {
    const store = createStore(createMemoryPersistence());
    await store.open();
    await store.switchScenario('new_tenant');
    expect(store.state.users.filter((u) => u.status === 'active').length).toBe(3);
    expect(store.state.warehouses.length).toBe(1);
  });
  it('refuses a persona that is not active', async () => {
    const store = createStore(createMemoryPersistence());
    await store.open();
    const suspended = store.state.users.find((u) => u.status === 'suspended')!;
    await expect(store.setPersona(suspended.id)).rejects.toThrow(/active/);
  });
  it('advances the clock and persists it', async () => {
    const persistence = createMemoryPersistence();
    const store = createStore(persistence);
    await store.open();
    await store.advanceClock(7);
    const reopened = createStore(persistence);
    await reopened.open();
    expect(reopened.clock.now()).toBe('2026-09-11T15:00:00.000Z');
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/data/src/store`
Expected: FAIL.

- [ ] **Step 3: Cenários**

```ts
// packages/data/src/scenarios/index.ts
import { addDays, addHours, makeId, money, newMetadata, toBusinessDate, type ApprovalRequest, type Notification, type ScenarioId } from '@nexora/domain';
import { ORGANIZATION_TIMEZONE, type DemoClock } from '../clock';
import type { FullSeed } from '../seed';
import { DEFAULT_PERSONA_ID, MERIDIAN, ORGANIZATION_ID, SYSTEM_ACTOR } from '../seed';

export interface ScenarioDefinition {
  id: ScenarioId;
  label: string;
  description: string;
  personaId: string;
  apply(seed: FullSeed, clock: DemoClock): FullSeed;
}

const identity = (seed: FullSeed) => seed;

function extraNotifications(seed: FullSeed, userIds: string[], rows: readonly [Notification['type'], string, string][], clock: DemoClock): Notification[] {
  let n = seed.notifications.length;
  return userIds.flatMap((userId) =>
    rows.map(([type, title, body], i): Notification => ({
      id: makeId('ntf', ++n), organizationId: ORGANIZATION_ID, userId, type, title, body, createdAt: addHours(clock.now(), -(i + 1) * 3),
    })),
  );
}

function scaleApprovals(seed: FullSeed, factor: number, clock: DemoClock): ApprovalRequest[] {
  const extra = Math.round(seed.approvals.length * (factor - 1));
  let a = seed.approvals.length;
  return [...seed.approvals, ...Array.from({ length: extra }, (_, i) => {
    const base = seed.approvals[i % seed.approvals.length]!;
    const id = makeId('apr', ++a);
    return { ...base, id, createdAt: addHours(clock.now(), -i), metadata: newMetadata(id, ORGANIZATION_ID, SYSTEM_ACTOR, clock.now()) };
  })];
}

function lastBusinessDayOfMonth(instant: string): string {
  const d = new Date(instant);
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 15));
  while (end.getUTCDay() === 0 || end.getUTCDay() === 6) end.setUTCDate(end.getUTCDate() - 1);
  return end.toISOString();
}

export const SCENARIOS: Record<ScenarioId, ScenarioDefinition> = {
  healthy: { id: 'healthy', label: 'Healthy operations', description: 'Baseline: normal latency, limited exceptions.', personaId: DEFAULT_PERSONA_ID, apply: identity },
  new_tenant: {
    id: 'new_tenant', label: 'New tenant', description: 'Three users, one warehouse, no history: empty states everywhere.', personaId: 'usr_000001',
    apply: (seed, clock) => {
      const keep = new Set(['usr_000001', 'usr_000003', 'usr_000004']);
      const users = seed.users.map((u) => (keep.has(u.id) ? u : { ...u, status: 'deactivated' as const }));
      return {
        ...seed, users, warehouses: seed.warehouses.slice(0, 1),
        searchDocuments: seed.searchDocuments.filter((d) => (d.type === 'customer' ? Number(d.id.slice(4)) <= 14 : d.type === 'product' ? Number(d.id.slice(4)) <= 24 : false)),
        approvals: [], tasks: [], activity: [],
        notifications: extraNotifications({ ...seed, notifications: [] }, [...keep], [
          ['info', 'Welcome to Nexora', 'Invite your team from Settings › Users.'],
          ['action_required', 'Add your first warehouse', 'Chicago Central is the only site.'],
          ['info', 'Import your catalog', 'Settings › Integrations accepts CSV.'],
        ], clock),
      };
    },
  },
  enterprise_scale: { id: 'enterprise_scale', label: 'Enterprise scale', description: 'Customers ×4, SKUs ×3, history ×5. No change to rules.', personaId: DEFAULT_PERSONA_ID, apply: identity },
  heavy_data: { id: 'heavy_data', label: 'Heavy data', description: 'The hardest records: 148-line order, 120-message ticket.', personaId: DEFAULT_PERSONA_ID, apply: identity },
  month_end: {
    id: 'month_end', label: 'Month end', description: 'Last business day: invoices due, reconciliation, approvals ×1.8.', personaId: 'usr_000005',
    apply: (seed, clock) => {
      clock.set(lastBusinessDayOfMonth(clock.now()));
      return {
        ...seed, approvals: scaleApprovals(seed, 1.8, clock),
        notifications: [...seed.notifications, ...extraNotifications(seed, ['usr_000005', 'usr_000003'], [
          ['warning', '38 invoices due within 5 days', 'Collections queue is 2.5× baseline.'],
          ['action_required', '21 unmatched bank transactions', 'Reconciliation before close.'],
          ['info', 'Period close checklist opened', `Business date ${toBusinessDate(clock.now(), ORGANIZATION_TIMEZONE)}.`],
        ], clock)],
      };
    },
  },
  inventory_crisis: {
    id: 'inventory_crisis', label: 'Inventory crisis', description: '42 SKUs below safety stock, 17 orders short, MX-240 shortage.', personaId: 'usr_000006',
    apply: (seed, clock) => ({
      ...seed,
      notifications: [...seed.notifications, ...extraNotifications(seed, ['usr_000006', 'usr_000007', 'usr_000003'], [
        ['warning', 'Stock for MX-240 fell below safety level', '6 units short for SO-2026-01842.'],
        ['action_required', '8 urgent purchase orders', 'Three warehouses affected.'],
        ['warning', '17 customer orders delayed', 'Allocation shortage on confirmed orders.'],
      ], clock)],
    }),
  },
  collections_pressure: {
    id: 'collections_pressure', label: 'Collections pressure', description: 'Overdue receivables ×2.2, 18 customers near credit limit, 6 on hold.', personaId: 'usr_000005',
    apply: (seed, clock) => ({
      ...seed,
      approvals: [...seed.approvals, { ...seed.approvals.find((a) => a.type === 'credit_limit')!, id: makeId('apr', seed.approvals.length + 1), amount: money(650000, 'USD'), createdAt: clock.now() }],
      notifications: [...seed.notifications, ...extraNotifications(seed, ['usr_000005', 'usr_000003'], [
        ['warning', `Invoice ${MERIDIAN.invoice.businessNumber} is 14 days overdue`, 'Meridian Controls Group · $41,860.'],
        ['action_required', '18 customers above 90 % credit utilization', 'Review holds today.'],
        ['info', '6 customers on hold', 'Orders blocked until release.'],
      ], clock)],
    }),
  },
  restricted_user: {
    id: 'restricted_user', label: 'Restricted user', description: 'Jordan Wells, warehouse operator scoped to CHI-01, no adjustments.', personaId: 'usr_000007',
    apply: (seed) => ({
      ...seed,
      roles: seed.roles.map((r) => (r.name === 'Warehouse Operator' ? { ...r, grants: r.grants.filter((g) => g.permission !== 'inventory.adjust') } : r)),
    }),
  },
  support_incident: {
    id: 'support_incident', label: 'Support incident', description: 'A shipment incident, 12 related tickets, one SLA breach.', personaId: 'usr_000008',
    apply: (seed, clock) => ({
      ...seed,
      notifications: [...seed.notifications, ...extraNotifications(seed, ['usr_000008'], [
        ['action_required', 'Ticket TCK-10492 breached first-response SLA', 'Assign or reply now.'],
        ['warning', '12 tickets opened for the SHP-009841 incident', 'Queue load 2× baseline.'],
        ['info', 'Incident bridge opened', 'Support and warehouse leads joined.'],
      ], clock)],
    }),
  },
};

export const SCENARIO_LIST = Object.values(SCENARIOS);
export { addDays };
```

- [ ] **Step 4: Store**

```ts
// packages/data/src/store/index.ts
import type { ApprovalRequest, Notification, ScenarioId, Task, TransportProfile, UserPreferences } from '@nexora/domain';
import { CANONICAL_INSTANT, createDemoClock, SCHEMA_VERSION, SEED_VERSION, type DemoClock } from '../clock';
import type { DemoDatabaseMetadata, MutableCollection, Persistence } from '../persistence';
import { SCENARIOS } from '../scenarios';
import { seedAll, type FullSeed } from '../seed';

type Mutable = Notification | Task | ApprovalRequest;

export interface StoredPreferences extends UserPreferences {
  id: string; // userId
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  scheme: 'system', density: 'comfortable', startRoute: '/dashboard',
  notifications: { emailApprovals: true, emailMentions: true, inAppApprovals: true, inAppMentions: true, inAppOperationalAlerts: true },
};

export interface Store {
  readonly state: FullSeed;
  readonly clock: DemoClock;
  readonly metadata: DemoDatabaseMetadata;
  readonly activePersonaId: string | null;
  readonly transportProfile: TransportProfile;
  open(): Promise<void>;
  setPersona(userId: string | null): Promise<void>;
  switchScenario(id: ScenarioId): Promise<void>;
  advanceClock(days: number): Promise<void>;
  setTransportProfile(profile: TransportProfile): Promise<void>;
  reset(): Promise<void>;
  writeMutable(collection: 'notifications' | 'tasks' | 'approvals', record: Mutable): Promise<void>;
  readPreferences(userId: string): Promise<UserPreferences>;
  writePreferences(userId: string, preferences: UserPreferences): Promise<void>;
}

export function createStore(persistence: Persistence): Store {
  let state: FullSeed;
  let metadata: DemoDatabaseMetadata;
  const clock = createDemoClock();

  const build = () => {
    const scenario = SCENARIOS[metadata.scenarioId];
    clock.set(metadata.demoClock);
    state = scenario.apply(seedAll(), clock);
    metadata.demoClock = clock.now();
  };

  const overlay = async () => {
    for (const collection of ['notifications', 'tasks', 'approvals'] as const) {
      const persisted = await persistence.list<Mutable>(collection);
      if (persisted.length === 0) continue;
      const byId = new Map(persisted.map((r) => [r.id, r]));
      state = { ...state, [collection]: (state[collection] as Mutable[]).map((r) => byId.get(r.id) ?? r) };
    }
  };

  const fresh = (scenarioId: ScenarioId): DemoDatabaseMetadata => ({
    schemaVersion: SCHEMA_VERSION, seedVersion: SEED_VERSION, scenarioId, demoClock: CANONICAL_INSTANT,
    activePersonaId: SCENARIOS[scenarioId].personaId, transportProfile: 'normal', initializedAt: CANONICAL_INSTANT,
  });

  const save = () => persistence.writeMetadata(metadata);

  const requireActive = (userId: string) => {
    const user = state.users.find((u) => u.id === userId);
    if (user === undefined) throw new Error(`Unknown user ${userId}`);
    if (user.status !== 'active') throw new Error(`Only an active user may sign in; ${user.displayName} is ${user.status}`);
  };

  const store: Store = {
    get state() { return state; },
    clock,
    get metadata() { return metadata; },
    get activePersonaId() { return metadata.activePersonaId; },
    get transportProfile() { return metadata.transportProfile ?? 'normal'; },
    async open() {
      const persisted = await persistence.readMetadata();
      if (persisted === undefined || persisted.schemaVersion !== SCHEMA_VERSION || persisted.seedVersion !== SEED_VERSION) {
        await persistence.clear();
        metadata = fresh('healthy');
      } else {
        metadata = persisted;
      }
      build();
      await save();
      await overlay();
    },
    async setPersona(userId) {
      if (userId !== null) requireActive(userId);
      metadata.activePersonaId = userId;
      await save();
    },
    async switchScenario(id) {
      await persistence.clear();
      metadata = fresh(id);
      build();
      await save();
    },
    async advanceClock(days) {
      clock.advanceDays(days);
      metadata.demoClock = clock.now();
      await save();
    },
    async setTransportProfile(profile) {
      metadata.transportProfile = profile;
      await save();
    },
    async reset() {
      await store.switchScenario(metadata.scenarioId);
    },
    async writeMutable(collection, record) {
      await persistence.write(collection as MutableCollection, record);
      state = { ...state, [collection]: (state[collection] as Mutable[]).map((r) => (r.id === record.id ? record : r)) };
    },
    async readPreferences(userId) {
      const stored = await persistence.read<StoredPreferences>('preferences', userId);
      if (stored === undefined) return structuredClone(DEFAULT_PREFERENCES);
      const { id: _id, ...preferences } = stored;
      return preferences;
    },
    async writePreferences(userId, preferences) {
      await persistence.write('preferences', { id: userId, ...preferences });
    },
  };
  return store;
}
```

```ts
// packages/data/src/index.ts
export * from './clock';
export * from './persistence';
export * from './prng';
export * from './scenarios';
export * from './seed';
export * from './store';
```

- [ ] **Step 5: Correr e ver passar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/data && pnpm --filter @nexora/data typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora/packages/data/src && git add apps/demos/nexora/packages/data && git commit -m "feat(nexora-data): nove cenários §77 no recorte do Shell, Store com overlay persistido, reset §74.5, persona ativa, relógio"
```

---

### Task 9: `@nexora/api` — transporte, erros, router, simulação

**Files:**
- Create: `packages/api/src/transport/types.ts`, `errors.ts`, `router.ts`, `index.ts`, `packages/api/src/simulation/index.ts`
- Test: `packages/api/src/transport/router.test.ts`, `packages/api/src/simulation/simulation.test.ts`

**Interfaces:**
- Produces:
  - `ApiRequest`, `ApiResponse`, `Api { handle(request): Promise<ApiResponse> }`, `ApiErrorBody` (§73.10), `ApiErrorCode` (§73.11)
  - `ApiFailure extends Error { status; code; retryable; details?; fieldErrors? }`, `failure(status, code, message, extra?)`, `toErrorResponse(error, correlationId): ApiResponse`
  - `Handler = (context: RequestContext) => Promise<unknown>` onde `RequestContext { request; params: Record<string,string>; query: URLSearchParams; body: unknown }`
  - `createRouter(): Router` com `get(pattern, handler)`, `post(pattern, handler)`, `patch(pattern, handler)`, `match(method, path): { handler; params } | undefined`
  - `listResponse<T>(items, page, size)` (§73.3), `pageParams(query): { page; size }` (25|50|100, default 50)
  - `LatencyProfile { read: [min,max]; write: [min,max]; search: [min,max]; failures: { [pathPrefix]: rate } ; mutationFailureRate }`, `PROFILES: Record<TransportProfile, LatencyProfile>`, `createSimulation(options: { mode: 'real' | 'none'; profile: () => TransportProfile }): { delay(request): Promise<void>; shouldFail(request): boolean }` — jitter determinístico por hash de `method+path+query`

- [ ] **Step 1: Testes**

```ts
// packages/api/src/transport/router.test.ts
import { describe, expect, it } from 'vitest';
import { createRouter, listResponse, pageParams } from './index';

describe('router', () => {
  it('matches patterns with params', () => {
    const router = createRouter();
    router.post('/notifications/:id/read', async ({ params }) => ({ id: params['id'] }));
    const match = router.match('POST', '/notifications/ntf_000001/read');
    expect(match?.params).toEqual({ id: 'ntf_000001' });
    expect(router.match('GET', '/notifications/ntf_000001/read')).toBeUndefined();
  });
});

describe('pagination', () => {
  it('defaults to 50 and clamps to allowed sizes', () => {
    expect(pageParams(new URLSearchParams(''))).toEqual({ page: 1, size: 50 });
    expect(pageParams(new URLSearchParams('page=3&size=25'))).toEqual({ page: 3, size: 25 });
    expect(pageParams(new URLSearchParams('size=7'))).toEqual({ page: 1, size: 50 });
  });
  it('shapes the list response', () => {
    const r = listResponse([1, 2, 3, 4, 5], 2, 2);
    expect(r).toEqual({ data: [3, 4], page: { number: 2, size: 2, totalItems: 5, totalPages: 3 } });
  });
});
```

```ts
// packages/api/src/simulation/simulation.test.ts
import { describe, expect, it } from 'vitest';
import { createSimulation, latencyFor } from './index';

const req = (method: 'GET' | 'POST', path: string) => ({ method, path, query: new URLSearchParams(), headers: {} });

describe('simulation', () => {
  it('is deterministic per request fingerprint', () => {
    expect(latencyFor(req('GET', '/customers'), 'normal')).toBe(latencyFor(req('GET', '/customers'), 'normal'));
    const ms = latencyFor(req('GET', '/customers'), 'normal');
    expect(ms).toBeGreaterThanOrEqual(120);
    expect(ms).toBeLessThanOrEqual(450);
    const write = latencyFor(req('POST', '/notifications/x/read'), 'normal');
    expect(write).toBeGreaterThanOrEqual(180);
    expect(write).toBeLessThanOrEqual(650);
  });
  it('fails GET /activity 15% of the time when degraded, never when normal', () => {
    const sim = createSimulation({ mode: 'none', profile: () => 'system_degraded' });
    const failures = Array.from({ length: 200 }, (_, i) => sim.shouldFail({ ...req('GET', '/activity'), query: new URLSearchParams(`page=${i}`) })).filter(Boolean).length;
    expect(failures).toBeGreaterThan(10);
    expect(failures).toBeLessThan(60);
    const normal = createSimulation({ mode: 'none', profile: () => 'normal' });
    expect(normal.shouldFail(req('GET', '/activity'))).toBe(false);
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/api`
Expected: FAIL.

- [ ] **Step 3: Transporte**

```ts
// packages/api/src/transport/types.ts
export type ApiMethod = 'GET' | 'POST' | 'PATCH';

export interface ApiRequest {
  method: ApiMethod;
  path: string; // without /api/v1
  query: URLSearchParams;
  headers: Record<string, string>;
  body?: unknown;
}

export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

export interface Api {
  handle(request: ApiRequest): Promise<ApiResponse>;
}

export interface ListResponse<T> {
  data: T[];
  page: { number: number; size: number; totalItems: number; totalPages: number };
  meta?: Record<string, unknown>;
}

export const BASE_PATH = '/api/v1';
export const PAGE_SIZES = [25, 50, 100] as const;

export function pageParams(query: URLSearchParams): { page: number; size: number } {
  const page = Math.max(1, Number(query.get('page') ?? 1) || 1);
  const requested = Number(query.get('size') ?? 50);
  const size = (PAGE_SIZES as readonly number[]).includes(requested) ? requested : 50;
  return { page, size };
}

export function listResponse<T>(items: readonly T[], page: number, size: number): ListResponse<T> {
  const start = (page - 1) * size;
  return {
    data: items.slice(start, start + size),
    page: { number: page, size, totalItems: items.length, totalPages: Math.max(1, Math.ceil(items.length / size)) },
  };
}
```

```ts
// packages/api/src/transport/errors.ts
import type { ApiResponse } from './types';

export type ApiErrorCode =
  | 'INVALID_QUERY' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'STALE_VERSION' | 'INVALID_STATE_TRANSITION'
  | 'INVENTORY_CHANGED' | 'IDEMPOTENCY_KEY_REUSED' | 'VALIDATION_FAILED' | 'PRECONDITION_REQUIRED' | 'INTERNAL_ERROR' | 'SERVICE_UNAVAILABLE';

export interface FieldError { field: string; code: string; message: string }

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    retryable: boolean;
    correlationId: string;
    fieldErrors?: FieldError[];
    details?: Record<string, unknown>;
  };
}

export class ApiFailure extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly extra: { retryable?: boolean; details?: Record<string, unknown>; fieldErrors?: FieldError[] } = {},
  ) {
    super(message);
    this.name = 'ApiFailure';
  }
}

export const failure = (status: number, code: ApiErrorCode, message: string, extra?: ApiFailure['extra']) =>
  new ApiFailure(status, code, message, extra);

export function toErrorResponse(error: unknown, correlationId: string): ApiResponse {
  const f = error instanceof ApiFailure ? error : failure(500, 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unexpected error');
  const body: ApiErrorBody = {
    error: {
      code: f.code, message: f.message, retryable: f.extra.retryable ?? f.status === 503, correlationId,
      ...(f.extra.fieldErrors === undefined ? {} : { fieldErrors: f.extra.fieldErrors }),
      ...(f.extra.details === undefined ? {} : { details: f.extra.details }),
    },
  };
  return { status: f.status, headers: { 'content-type': 'application/json' }, body };
}
```

```ts
// packages/api/src/transport/router.ts
import type { ApiMethod, ApiRequest } from './types';

export interface RequestContext {
  request: ApiRequest;
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
}

export type Handler = (context: RequestContext) => Promise<unknown>;

interface Route { method: ApiMethod; pattern: RegExp; keys: string[]; handler: Handler }

export interface Router {
  get(pattern: string, handler: Handler): void;
  post(pattern: string, handler: Handler): void;
  patch(pattern: string, handler: Handler): void;
  match(method: ApiMethod, path: string): { handler: Handler; params: Record<string, string> } | undefined;
}

function compile(pattern: string): { pattern: RegExp; keys: string[] } {
  const keys: string[] = [];
  const source = pattern.replace(/:(\w+)/g, (_, key: string) => {
    keys.push(key);
    return '([^/]+)';
  });
  return { pattern: new RegExp(`^${source}/?$`), keys };
}

export function createRouter(): Router {
  const routes: Route[] = [];
  const add = (method: ApiMethod) => (pattern: string, handler: Handler) => routes.push({ method, ...compile(pattern), handler });
  return {
    get: add('GET'),
    post: add('POST'),
    patch: add('PATCH'),
    match(method, path) {
      for (const route of routes) {
        if (route.method !== method) continue;
        const m = route.pattern.exec(path);
        if (m === null) continue;
        const params: Record<string, string> = {};
        route.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1] ?? '')));
        return { handler: route.handler, params };
      }
      return undefined;
    },
  };
}
```

```ts
// packages/api/src/transport/index.ts
export * from './errors';
export * from './router';
export * from './types';
```

- [ ] **Step 4: Simulação**

```ts
// packages/api/src/simulation/index.ts
import type { TransportProfile } from '@nexora/domain';
import type { ApiRequest } from '../transport';

export interface LatencyProfile {
  read: [number, number];
  write: [number, number];
  search: [number, number];
  baseline: number;
  failures: Record<string, number>; // path prefix → probability for GET
  mutationFailureRate: number;
}

export const PROFILES: Record<TransportProfile, LatencyProfile> = {
  normal: { read: [120, 450], write: [180, 650], search: [180, 500], baseline: 0, failures: {}, mutationFailureRate: 0 },
  system_degraded: { read: [0, 900], write: [0, 900], search: [0, 900], baseline: 700, failures: { '/finance/overview': 0.35, '/activity': 0.15 }, mutationFailureRate: 0.05 },
};

export function fingerprint(request: Pick<ApiRequest, 'method' | 'path' | 'query'>): number {
  const text = `${request.method} ${request.path}?${request.query.toString()}`;
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

export function latencyFor(request: Pick<ApiRequest, 'method' | 'path' | 'query'>, profile: TransportProfile): number {
  const p = PROFILES[profile];
  const [min, max] = request.path.startsWith('/search') ? p.search : request.method === 'GET' ? p.read : p.write;
  return p.baseline + Math.round(min + fingerprint(request) * (max - min));
}

export interface Simulation {
  delay(request: ApiRequest): Promise<void>;
  shouldFail(request: Pick<ApiRequest, 'method' | 'path' | 'query'>): boolean;
}

export function createSimulation(options: { mode: 'real' | 'none'; profile: () => TransportProfile }): Simulation {
  return {
    delay: (request) =>
      options.mode === 'none' ? Promise.resolve() : new Promise((r) => setTimeout(r, latencyFor(request, options.profile()))),
    shouldFail(request) {
      const p = PROFILES[options.profile()];
      const roll = fingerprint({ ...request, query: new URLSearchParams(`${request.query.toString()}&salt=fail`) });
      if (request.method === 'GET') {
        const rate = Object.entries(p.failures).find(([prefix]) => request.path.startsWith(prefix))?.[1] ?? 0;
        return roll < rate;
      }
      return roll < p.mutationFailureRate;
    },
  };
}
```

- [ ] **Step 5: Correr e ver passar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/api`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora/packages/api/src && git add apps/demos/nexora/packages/api && git commit -m "feat(nexora-api): transporte — tipos §73, erros §73.10/11, router, paginação, simulação de latência e falhas §77.10/§78.1"
```

---

### Task 10: `@nexora/api` — `createApi`, sessão, preferências e demo

**Files:**
- Create: `packages/api/src/index.ts`, `packages/api/src/context.ts`, `packages/api/src/handlers/session.ts`, `preferences.ts`, `demo.ts`
- Test: `packages/api/src/api.test.ts` (partilhado com a Task 11)

**Interfaces:**
- Consumes: `Store`, `createStore`, `Simulation`, `Router`, `authorize`, `sessionAuthorization`, `PERSONAS`, `SCENARIO_LIST`.
- Produces:
  - `createApi(store: Store, options?: { latency?: 'real' | 'none' }): Api`
  - `buildSession(store): Session` — permissões = união dos grants dos papéis atribuídos; `scopes[permission]` = escopos das atribuições; `warehouses` = todos, ou os do escopo `warehouse` quando toda a permissão de inventário tem escopo de armazém
  - `requireSession(store): Session` (lança `401 UNAUTHENTICATED` sem persona)
  - `can(session, permission, resource?)` (lança `403 FORBIDDEN` com `details.permission`)
  - `ApiHelpers { store; session(): Session; can(...) }` disponível em cada handler via `context.helpers`

- [ ] **Step 1: Teste**

```ts
// packages/api/src/api.test.ts
import { createMemoryPersistence, createStore } from '@nexora/data';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApi } from './index';
import type { Api, ApiRequest } from './transport';

let api: Api;
let store: ReturnType<typeof createStore>;

const call = (method: ApiRequest['method'], path: string, body?: unknown, query = '') =>
  api.handle({ method, path, query: new URLSearchParams(query), headers: {}, ...(body === undefined ? {} : { body }) });

beforeEach(async () => {
  store = createStore(createMemoryPersistence());
  await store.open();
  api = createApi(store, { latency: 'none' });
});

describe('session', () => {
  it('returns Sofia with sales permissions and all warehouses', async () => {
    const r = await call('GET', '/session');
    expect(r.status).toBe(200);
    const s = (r.body as { data: { user: { displayName: string }; permissions: string[]; warehouses: unknown[]; scenario: string } }).data;
    expect(s.user.displayName).toBe('Sofia Ramirez');
    expect(s.permissions).toContain('orders.approve');
    expect(s.warehouses.length).toBe(5);
    expect(s.scenario).toBe('healthy');
  });
  it('is 401 without a persona', async () => {
    await store.setPersona(null);
    const r = await call('GET', '/session');
    expect(r.status).toBe(401);
  });
  it('scopes Jordan to CHI-01', async () => {
    await call('POST', '/demo/scenario', { scenarioId: 'restricted_user' });
    const s = ((await call('GET', '/session')).body as { data: { warehouses: { code: string }[]; permissions: string[] } }).data;
    expect(s.warehouses.map((w) => w.code)).toEqual(['CHI-01']);
    expect(s.permissions).not.toContain('inventory.adjust');
  });
});

describe('demo', () => {
  it('lists personas and scenarios', async () => {
    const d = ((await call('GET', '/demo')).body as { data: { personas: unknown[]; scenarios: unknown[]; clock: { businessDate: string } } }).data;
    expect(d.personas.length).toBe(9);
    expect(d.scenarios.length).toBe(9);
    expect(d.clock.businessDate).toBe('2026-09-04');
  });
  it('switches persona, refuses an inactive one, signs out', async () => {
    expect((await call('POST', '/demo/persona', { userId: 'usr_000004' })).status).toBe(200);
    expect(((await call('GET', '/session')).body as { data: { user: { id: string } } }).data.user.id).toBe('usr_000004');
    const suspended = store.state.users.find((u) => u.status === 'suspended')!;
    expect((await call('POST', '/demo/persona', { userId: suspended.id })).status).toBe(409);
    expect((await call('POST', '/demo/sign-out')).status).toBe(200);
    expect((await call('GET', '/session')).status).toBe(401);
  });
  it('advances the clock and resets', async () => {
    await call('POST', '/demo/clock/advance', { days: 3 });
    expect(((await call('GET', '/session')).body as { data: { businessDate: string } }).data.businessDate).toBe('2026-09-07');
    await call('POST', '/demo/reset');
    expect(((await call('GET', '/session')).body as { data: { businessDate: string } }).data.businessDate).toBe('2026-09-04');
  });
  it('switches the transport profile without reset', async () => {
    await call('POST', '/demo/clock/advance', { days: 1 });
    await call('POST', '/demo/transport', { profile: 'system_degraded' });
    const s = ((await call('GET', '/session')).body as { data: { transportProfile: string; businessDate: string } }).data;
    expect(s.transportProfile).toBe('system_degraded');
    expect(s.businessDate).toBe('2026-09-05');
  });
});

describe('preferences', () => {
  it('reads defaults and persists a patch', async () => {
    const r = await call('PATCH', '/me/preferences', { scheme: 'dark' });
    expect((r.body as { data: { scheme: string; density: string } }).data).toMatchObject({ scheme: 'dark', density: 'comfortable' });
    const s = ((await call('GET', '/session')).body as { data: { preferences: { scheme: string } } }).data;
    expect(s.preferences.scheme).toBe('dark');
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/api/src/api.test.ts`
Expected: FAIL.

- [ ] **Step 3: Contexto e sessão**

```ts
// packages/api/src/context.ts
import {
  authorize, type Permission, type PermissionScope, type ScopeResource, type Session, sessionAuthorization,
} from '@nexora/domain';
import type { Store } from '@nexora/data';
import { failure } from './transport';

export function buildSession(store: Store, preferences: Session['preferences']): Session | null {
  const userId = store.activePersonaId;
  if (userId === null) return null;
  const s = store.state;
  const user = s.users.find((u) => u.id === userId);
  if (user === undefined || user.status !== 'active') return null;
  const assignments = s.assignments.filter((a) => a.userId === userId);
  const roles = s.roles.filter((r) => assignments.some((a) => a.roleId === r.id));
  const scopes: Partial<Record<Permission, PermissionScope[]>> = {};
  for (const assignment of assignments) {
    const role = s.roles.find((r) => r.id === assignment.roleId);
    for (const grant of role?.grants ?? []) (scopes[grant.permission] ??= []).push(assignment.scope);
  }
  const permissions = Object.keys(scopes) as Permission[];
  const warehouseIds = new Set<string>();
  let warehouseScoped = assignments.length > 0;
  for (const assignment of assignments) {
    if (assignment.scope.type === 'warehouse') assignment.scope.warehouseIds.forEach((id) => warehouseIds.add(id));
    else warehouseScoped = false;
  }
  const warehouses = warehouseScoped ? s.warehouses.filter((w) => warehouseIds.has(w.id)) : s.warehouses;
  const teams = s.teams.filter((t) => s.memberships.some((m) => m.userId === userId && m.teamId === t.id));
  return {
    organization: s.organization, user, roles, teams, permissions, scopes, warehouses,
    now: store.clock.now(), businessDate: store.clock.businessDate(), scenario: store.metadata.scenarioId,
    transportProfile: store.transportProfile, preferences,
  };
}

export interface ApiHelpers {
  store: Store;
  session(): Promise<Session>;
  can(session: Session, permission: Permission, resource?: ScopeResource): void;
}

export function createHelpers(store: Store): ApiHelpers {
  return {
    store,
    async session() {
      const userId = store.activePersonaId;
      const preferences = userId === null ? null : await store.readPreferences(userId);
      const session = preferences === null ? null : buildSession(store, preferences);
      if (session === null) throw failure(401, 'UNAUTHENTICATED', 'No active persona');
      return session;
    },
    can(session, permission, resource) {
      const result = authorize(sessionAuthorization(session), permission, resource);
      if (!result.allowed) throw failure(403, 'FORBIDDEN', `Missing permission ${permission}`, { details: { permission, reason: result.reason } });
    },
  };
}
```

```ts
// packages/api/src/handlers/session.ts
import type { ApiHelpers } from '../context';
import type { Router } from '../transport';

export function registerSession(router: Router, helpers: ApiHelpers): void {
  router.get('/session', async () => ({ data: await helpers.session() }));
}
```

```ts
// packages/api/src/handlers/preferences.ts
import type { UserPreferences } from '@nexora/domain';
import type { ApiHelpers } from '../context';
import { failure, type Router } from '../transport';

const SCHEMES = ['light', 'dark', 'system'];
const DENSITIES = ['comfortable', 'compact', 'dense'];

export function registerPreferences(router: Router, helpers: ApiHelpers): void {
  router.patch('/me/preferences', async ({ body }) => {
    const session = await helpers.session();
    const patch = (body ?? {}) as Partial<UserPreferences>;
    if (patch.scheme !== undefined && !SCHEMES.includes(patch.scheme)) throw failure(422, 'VALIDATION_FAILED', 'Invalid scheme', { fieldErrors: [{ field: 'scheme', code: 'INVALID', message: 'light, dark or system' }] });
    if (patch.density !== undefined && !DENSITIES.includes(patch.density)) throw failure(422, 'VALIDATION_FAILED', 'Invalid density', { fieldErrors: [{ field: 'density', code: 'INVALID', message: 'comfortable, compact or dense' }] });
    const next: UserPreferences = {
      ...session.preferences, ...patch,
      notifications: { ...session.preferences.notifications, ...(patch.notifications ?? {}), inAppApprovals: true, inAppMentions: true },
    };
    await helpers.store.writePreferences(session.user.id, next);
    return { data: next };
  });
}
```

```ts
// packages/api/src/handlers/demo.ts
import { SCENARIO_IDS, type ScenarioId } from '@nexora/domain';
import { PERSONAS, SCENARIO_LIST } from '@nexora/data';
import type { ApiHelpers } from '../context';
import { failure, type Router } from '../transport';

export function registerDemo(router: Router, helpers: ApiHelpers): void {
  const { store } = helpers;
  router.get('/demo', async () => ({
    data: {
      personas: PERSONAS.map((p) => {
        const user = store.state.users.find((u) => u.id === p.id);
        return { id: p.id, displayName: `${p.firstName} ${p.lastName}`, role: p.role, context: p.context, title: p.title, active: user?.status === 'active' };
      }),
      activePersonaId: store.activePersonaId,
      scenarios: SCENARIO_LIST.map(({ id, label, description }) => ({ id, label, description })),
      scenarioId: store.metadata.scenarioId,
      clock: { now: store.clock.now(), businessDate: store.clock.businessDate() },
      transportProfile: store.transportProfile,
    },
  }));
  router.post('/demo/persona', async ({ body }) => {
    const userId = (body as { userId?: string } | undefined)?.userId;
    if (typeof userId !== 'string') throw failure(422, 'VALIDATION_FAILED', 'userId is required');
    try {
      await store.setPersona(userId);
    } catch (error) {
      throw failure(409, 'INVALID_STATE_TRANSITION', error instanceof Error ? error.message : 'Cannot sign in');
    }
    return { data: { activePersonaId: userId } };
  });
  router.post('/demo/sign-out', async () => {
    await store.setPersona(null);
    return { data: { activePersonaId: null } };
  });
  router.post('/demo/scenario', async ({ body }) => {
    const id = (body as { scenarioId?: string } | undefined)?.scenarioId;
    if (!(SCENARIO_IDS as readonly string[]).includes(id ?? '')) throw failure(422, 'VALIDATION_FAILED', 'Unknown scenario');
    await store.switchScenario(id as ScenarioId);
    return { data: { scenarioId: id, activePersonaId: store.activePersonaId } };
  });
  router.post('/demo/clock/advance', async ({ body }) => {
    const days = Number((body as { days?: number } | undefined)?.days);
    if (!Number.isFinite(days) || days <= 0 || days > 366) throw failure(422, 'VALIDATION_FAILED', 'days must be 1..366');
    await store.advanceClock(days);
    return { data: { now: store.clock.now(), businessDate: store.clock.businessDate() } };
  });
  router.post('/demo/reset', async () => {
    await store.reset();
    return { data: { scenarioId: store.metadata.scenarioId, activePersonaId: store.activePersonaId } };
  });
  router.post('/demo/transport', async ({ body }) => {
    const profile = (body as { profile?: string } | undefined)?.profile;
    if (profile !== 'normal' && profile !== 'system_degraded') throw failure(422, 'VALIDATION_FAILED', 'profile must be normal or system_degraded');
    await store.setTransportProfile(profile);
    return { data: { transportProfile: profile } };
  });
}
```

- [ ] **Step 4: `createApi`**

```ts
// packages/api/src/index.ts
import type { Store } from '@nexora/data';
import { createHelpers } from './context';
import { registerDemo } from './handlers/demo';
import { registerPreferences } from './handlers/preferences';
import { registerSession } from './handlers/session';
import { createSimulation } from './simulation';
import { BASE_PATH, createRouter, failure, toErrorResponse, type Api, type ApiRequest, type ApiResponse } from './transport';

export * from './context';
export * from './simulation';
export * from './transport';

export interface ApiOptions {
  latency?: 'real' | 'none';
}

export function createApi(store: Store, options: ApiOptions = {}): Api {
  const router = createRouter();
  const helpers = createHelpers(store);
  const simulation = createSimulation({ mode: options.latency ?? 'real', profile: () => store.transportProfile });
  let sequence = 0;

  registerSession(router, helpers);
  registerPreferences(router, helpers);
  registerDemo(router, helpers);
  // Task 11 registers notifications, tasks, approvals, search, activity here.

  return {
    async handle(request: ApiRequest): Promise<ApiResponse> {
      const correlationId = `req_${String(++sequence).padStart(6, '0')}`;
      const path = request.path.startsWith(BASE_PATH) ? request.path.slice(BASE_PATH.length) : request.path;
      const normalized = { ...request, path };
      await simulation.delay(normalized);
      try {
        if (!path.startsWith('/demo') && simulation.shouldFail(normalized)) throw failure(503, 'SERVICE_UNAVAILABLE', 'Simulated outage', { retryable: true });
        const match = router.match(request.method, path);
        if (match === undefined) throw failure(404, 'NOT_FOUND', `No route ${request.method} ${path}`);
        const body = await match.handler({ request: normalized, params: match.params, query: request.query, body: request.body });
        return { status: 200, headers: { 'content-type': 'application/json', 'x-correlation-id': correlationId }, body };
      } catch (error) {
        return toErrorResponse(error, correlationId);
      }
    },
  };
}
```

- [ ] **Step 5: Correr e ver passar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/api/src/api.test.ts`
Expected: PASS nos blocos `session`, `demo`, `preferences`.

- [ ] **Step 6: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora/packages/api/src && git add apps/demos/nexora/packages/api && git commit -m "feat(nexora-api): createApi — sessão com permissões e escopos por atribuição, preferências, rotas /demo (persona, sign-out, cenário, relógio, reset, transporte)"
```

---

### Task 11: `@nexora/api` — notificações, tarefas, aprovações, pesquisa, atividade

**Files:**
- Create: `packages/api/src/handlers/notifications.ts`, `tasks.ts`, `approvals.ts`, `search.ts`, `activity.ts`
- Modify: `packages/api/src/index.ts` (registos)
- Test: `packages/api/src/api.test.ts` (acrescentar blocos)

**Interfaces:**
- Consumes: `ApiHelpers`, `listResponse`, `pageParams`, `search`, `isMyApproval`, `sessionAuthorization`, `touch`.
- Produces: as rotas do spec §5.2 além das da Task 10. Corpos: `GET /notifications` → `ListResponse<Notification>` ordenado por `createdAt` desc, `view` ∈ `all | unread | archived` (`all` exclui arquivadas); `GET /notifications/count` → `{ data: { unread } }`; `POST /notifications/read-all` → `{ data: { updated } }`; `GET /tasks` → `ListResponse<Task>` do utilizador, `status` default `open`, ordenado por `dueDate` asc; `GET /approvals` → `ListResponse<ApprovalRequest>` pendentes cobertas; `GET /approvals/count` → `{ data: { pending } }`; `GET /search?q=` → `{ data: SearchGroup[] }` (422 sem `q`); `GET /activity` → `ListResponse<ActivityEvent>` (exige uma permissão `*.view` qualquer — todas as personas a têm).

- [ ] **Step 1: Testes (acrescentar a `api.test.ts`)**

```ts
describe('notifications', () => {
  it('lists mine newest first, counts unread, marks read and archives', async () => {
    const list = (await call('GET', '/notifications')).body as { data: { id: string; userId: string; readAt?: string; createdAt: string }[]; page: { totalItems: number } };
    expect(list.data.every((n) => n.userId === 'usr_000003')).toBe(true);
    expect(list.data[0]!.createdAt >= list.data[1]!.createdAt).toBe(true);
    const before = ((await call('GET', '/notifications/count')).body as { data: { unread: number } }).data.unread;
    const unread = list.data.find((n) => n.readAt === undefined)!;
    expect((await call('POST', `/notifications/${unread.id}/read`)).status).toBe(200);
    expect(((await call('GET', '/notifications/count')).body as { data: { unread: number } }).data.unread).toBe(before - 1);
    await call('POST', `/notifications/${unread.id}/archive`);
    const archived = (await call('GET', '/notifications', undefined, 'view=archived')).body as { data: { id: string }[] };
    expect(archived.data.map((n) => n.id)).toContain(unread.id);
    const all = (await call('GET', '/notifications')).body as { data: { id: string }[] };
    expect(all.data.map((n) => n.id)).not.toContain(unread.id);
  });
  it('is 404 for another user notification', async () => {
    const other = store.state.notifications.find((n) => n.userId === 'usr_000007')!;
    expect((await call('POST', `/notifications/${other.id}/read`)).status).toBe(404);
  });
  it('marks all read', async () => {
    await call('POST', '/notifications/read-all');
    expect(((await call('GET', '/notifications/count')).body as { data: { unread: number } }).data.unread).toBe(0);
  });
});

describe('approvals and tasks', () => {
  it('counts Sofia’s pending approvals and Jordan’s none', async () => {
    expect(((await call('GET', '/approvals/count')).body as { data: { pending: number } }).data.pending).toBe(6);
    await call('POST', '/demo/persona', { userId: 'usr_000007' });
    expect(((await call('GET', '/approvals/count')).body as { data: { pending: number } }).data.pending).toBe(0);
  });
  it('lists open tasks due-first', async () => {
    const tasks = (await call('GET', '/tasks')).body as { data: { assigneeId: string; dueDate?: string }[] };
    expect(tasks.data.every((t) => t.assigneeId === 'usr_000003')).toBe(true);
    expect(tasks.data[0]!.dueDate! <= tasks.data[1]!.dueDate!).toBe(true);
  });
});

describe('search', () => {
  it('groups and filters by permission', async () => {
    const groups = ((await call('GET', '/search', undefined, 'q=meridian')).body as { data: { type: string; hits: { businessNumber?: string }[] }[] }).data;
    expect(groups.map((g) => g.type)).toEqual(['customer', 'sales_order', 'invoice']);
    await call('POST', '/demo/persona', { userId: 'usr_000007' });
    const jordan = ((await call('GET', '/search', undefined, 'q=meridian')).body as { data: { type: string }[] }).data;
    expect(jordan.map((g) => g.type)).toEqual(['sales_order']);
  });
  it('rejects a missing query', async () => {
    expect((await call('GET', '/search')).status).toBe(422);
  });
});

describe('activity and degraded transport', () => {
  it('pages activity', async () => {
    const r = (await call('GET', '/activity', undefined, 'size=25')).body as { data: unknown[]; page: { totalItems: number } };
    expect(r.data.length).toBe(25);
    expect(r.page.totalItems).toBe(40);
  });
  it('fails some activity reads when degraded, never /demo', async () => {
    await call('POST', '/demo/transport', { profile: 'system_degraded' });
    const statuses = await Promise.all(Array.from({ length: 60 }, (_, i) => call('GET', '/activity', undefined, `page=1&size=25&i=${i}`).then((r) => r.status)));
    expect(statuses).toContain(503);
    expect((await call('GET', '/demo')).status).toBe(200);
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora && pnpm vitest run packages/api/src/api.test.ts`
Expected: FAIL nos blocos novos (404 das rotas).

- [ ] **Step 3: Handlers**

```ts
// packages/api/src/handlers/notifications.ts
import type { Notification } from '@nexora/domain';
import type { ApiHelpers } from '../context';
import { failure, listResponse, pageParams, type Router } from '../transport';

export function registerNotifications(router: Router, helpers: ApiHelpers): void {
  const { store } = helpers;
  const mine = async () => {
    const session = await helpers.session();
    return { session, items: store.state.notifications.filter((n) => n.userId === session.user.id) };
  };
  const one = async (id: string) => {
    const { items } = await mine();
    const n = items.find((x) => x.id === id);
    if (n === undefined) throw failure(404, 'NOT_FOUND', `No notification ${id}`);
    return n;
  };
  const write = (n: Notification) => store.writeMutable('notifications', n);

  router.get('/notifications', async ({ query }) => {
    const { items } = await mine();
    const view = query.get('view') ?? 'all';
    const filtered = items
      .filter((n) => (view === 'archived' ? n.archivedAt !== undefined : n.archivedAt === undefined))
      .filter((n) => (view === 'unread' ? n.readAt === undefined : true))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const { page, size } = pageParams(query);
    return listResponse(filtered, page, size);
  });
  router.get('/notifications/count', async () => {
    const { items } = await mine();
    return { data: { unread: items.filter((n) => n.readAt === undefined && n.archivedAt === undefined).length } };
  });
  router.post('/notifications/read-all', async () => {
    const { items } = await mine();
    const unread = items.filter((n) => n.readAt === undefined && n.archivedAt === undefined);
    for (const n of unread) await write({ ...n, readAt: store.clock.now() });
    return { data: { updated: unread.length } };
  });
  router.post('/notifications/:id/read', async ({ params }) => {
    const n = await one(params['id'] ?? '');
    await write({ ...n, readAt: n.readAt ?? store.clock.now() });
    return { data: await one(n.id) };
  });
  router.post('/notifications/:id/unread', async ({ params }) => {
    const n = await one(params['id'] ?? '');
    const { readAt: _readAt, ...rest } = n;
    await write(rest);
    return { data: await one(n.id) };
  });
  router.post('/notifications/:id/archive', async ({ params }) => {
    const n = await one(params['id'] ?? '');
    await write({ ...n, readAt: n.readAt ?? store.clock.now(), archivedAt: store.clock.now() });
    return { data: await one(n.id) };
  });
}
```

```ts
// packages/api/src/handlers/tasks.ts
import type { ApiHelpers } from '../context';
import { listResponse, pageParams, type Router } from '../transport';

export function registerTasks(router: Router, helpers: ApiHelpers): void {
  router.get('/tasks', async ({ query }) => {
    const session = await helpers.session();
    const status = query.get('status') ?? 'open';
    const items = helpers.store.state.tasks
      .filter((t) => t.assigneeId === session.user.id && t.status === status)
      .sort((a, b) => (a.dueDate ?? '9999') < (b.dueDate ?? '9999') ? -1 : 1);
    const { page, size } = pageParams(query);
    return listResponse(items, page, size);
  });
}
```

```ts
// packages/api/src/handlers/approvals.ts
import { isMyApproval, sessionAuthorization } from '@nexora/domain';
import type { ApiHelpers } from '../context';
import { listResponse, pageParams, type Router } from '../transport';

export function registerApprovals(router: Router, helpers: ApiHelpers): void {
  const mine = async () => {
    const session = await helpers.session();
    const input = sessionAuthorization(session);
    return helpers.store.state.approvals.filter((a) => isMyApproval(input, a)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  };
  router.get('/approvals', async ({ query }) => {
    const { page, size } = pageParams(query);
    return listResponse(await mine(), page, size);
  });
  router.get('/approvals/count', async () => ({ data: { pending: (await mine()).length } }));
}
```

```ts
// packages/api/src/handlers/search.ts
import { search, sessionAuthorization } from '@nexora/domain';
import type { ApiHelpers } from '../context';
import { failure, type Router } from '../transport';

export function registerSearch(router: Router, helpers: ApiHelpers): void {
  router.get('/search', async ({ query }) => {
    const q = query.get('q');
    if (q === null) throw failure(422, 'VALIDATION_FAILED', 'q is required', { fieldErrors: [{ field: 'q', code: 'REQUIRED', message: 'At least 2 characters' }] });
    const session = await helpers.session();
    return { data: search(helpers.store.state.searchDocuments, q, sessionAuthorization(session)) };
  });
}
```

```ts
// packages/api/src/handlers/activity.ts
import type { ApiHelpers } from '../context';
import { listResponse, pageParams, type Router } from '../transport';

export function registerActivity(router: Router, helpers: ApiHelpers): void {
  router.get('/activity', async ({ query }) => {
    await helpers.session();
    const { page, size } = pageParams(query);
    return listResponse(helpers.store.state.activity, page, size);
  });
}
```

Em `packages/api/src/index.ts`, substituir o comentário `// Task 11 registers …` por:

```ts
  registerNotifications(router, helpers);
  registerTasks(router, helpers);
  registerApprovals(router, helpers);
  registerSearch(router, helpers);
  registerActivity(router, helpers);
```

com os imports correspondentes de `./handlers/notifications`, `./handlers/tasks`, `./handlers/approvals`, `./handlers/search`, `./handlers/activity`.

- [ ] **Step 4: Correr e ver passar**

Run: `cd apps/demos/nexora && pnpm test && pnpm typecheck && pnpm build`
Expected: PASS em todos os projetos; `dist/` nos três pacotes.

- [ ] **Step 5: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora/packages/api/src && git add apps/demos/nexora/packages/api && git commit -m "feat(nexora-api): notificações (vistas, lida, arquivo, contagem), tarefas, aprovações cobertas por escopo, pesquisa agrupada, atividade paginada"
```

---

## Self-review

- Cobertura do spec §1–§5: estrutura (T1), `common` (T2), `identity`/`permissions`/`warehouses` (T3), `activity`/`approvals`/`search`/`session` (T4), `clock`/`seed` identidade (T5), corpus, notificações, tarefas, aprovações, atividade (T6), `persistence` (T7), `scenarios`/`store` (T8), transporte/simulação (T9), `createApi`/sessão/preferências/demo (T10), restantes rotas (T11). §13 testes: cada tarefa carrega os seus.
- Fora deste plano, por decisão do spec: `enterprise_scale` e `heavy_data` sem efeito; idempotência; motor de aprovações.
- Nomes usados entre tarefas: `createStore`, `Store.writeMutable`, `readPreferences`, `writePreferences`, `PERSONAS`, `SCENARIO_LIST`, `seedAll`, `FullSeed`, `createSimulation`, `latencyFor`, `createRouter`, `listResponse`, `pageParams`, `failure`, `toErrorResponse`, `createHelpers`, `buildSession` — definidos antes de serem consumidos.
