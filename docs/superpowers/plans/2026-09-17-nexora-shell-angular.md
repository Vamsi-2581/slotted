# Nexora — Shell Angular: plano

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O Shell da Nexora Operations em `apps/demos/nexora-angular`: banner, navegação, conteúdo, menu de utilizador, preferências, notificações, pesquisa/command palette, painel de demonstração, sign-in, rotas de todos os módulos, estados de espera/erro/acesso negado — sobre `@slotted/angular` (beta por tarball) e `@slotted/demo-nexora-operations` (backend simulado in-process, `apps/demos/nexora-operations`).

**Architecture:** `createNexoraBackend()` criado após o primeiro paint e exposto por `NEXORA_BACKEND`; estado em serviços `providedIn: 'root'` com signals que chamam a API tipada; rotas sob um `ShellLayout` que compõe `app-shell`, `top-navigation`, `side-navigation`; cada rota do Apêndice A é um `PermissionGate` que renderiza `ForbiddenPage` no lugar.

**Tech Stack:** Angular 22.1 (standalone, signals, zoneless), `@slotted/angular` 0.1.0-beta.x, `@slotted/demo-nexora-operations` (workspace), `@ng-icons/core` + `@ng-icons/lucide`, vitest via `ng test`.

**Spec:** `docs/superpowers/specs/2026-09-17-nexora-shell-design.md`.

## Global Constraints

- `@slotted/*` só por tarball (`file:../.registry/…`); `@slotted/demo-nexora-operations` por `workspace:*` (fonte TypeScript, excluída do prebundle do Vite em `angular.json`).
- O backend não é alterado a partir deste plano; nomes de campos dos read models (`SessionInfo`, `Notification`, `ApprovalListItem`, `TaskListItem`, `SearchHit`, `Warehouse`) são confirmados em `apps/demos/nexora-operations/backend` antes de escrever um template; uma lacuna do backend é registada em `LIBRARY-FEEDBACK.md` › "Backend".
- Personas por chave: `maya-chen`, `evan-brooks`, `sofia-ramirez`, `noah-bennett`, `priya-shah`, `marcus-lee`, `jordan-wells`, `aisha-grant`, `owen-price`.
- Idioma da UI: en-US. Mensagens das famílias `@slotted` em inglês por `provide*Defaults` em `app.config.ts`.
- `Date.now()` proibido fora de `ClockService`; datas relativas a partir de `session.demo.demoClock`.
- Contrato de DOM da biblioteca: seletores `data-ui`/`data-part` são o único gancho de CSS da app; a app não escreve classes de partes da biblioteca.
- Título do documento `<Página> · Nexora`; `lang="en"`; `data-slotted-theme="default"` no `html`.
- Um `sl-toast-region` na raiz; `SlToastService.show` para confirmações.
- Formatação: `pnpm exec prettier --write <paths>` da raiz do repositório. Commits: `git add <paths> && git commit` num só comando.
- `ng test` corre com `pnpm --filter @slotted/demo-nexora-angular test`; `ng build` com `pnpm --filter @slotted/demo-nexora-angular build:demo`.

---

## Estrutura de ficheiros

```
apps/demos/nexora-angular/src/
  main.ts
  index.html                       lang, data-slotted-*
  styles.css                       @layer, tema, marca (existente)
  app/
    app.config.ts                  providers: router, http+interceptor, icons, slotted defaults, title strategy
    app.routes.ts                  /sign-in, /* → ShellLayout com filhos por módulo
    app.ts / app.html              <router-outlet> + <sl-toast-region>
    core/
      backend/nexora-backend.provider.ts  provideNexoraBackend(): createNexoraBackend após o primeiro paint
      backend/api-error.ts                isApiError(error, code?)
      backend/demo-state.ts               persona, cenário e scale em localStorage
      session/session.store.ts     SessionStore
      session/clock.service.ts     ClockService
      session/preferences.store.ts PreferencesStore
      activity/notifications.store.ts, approvals.store.ts, tasks.store.ts
      demo/demo.store.ts
      search/search.service.ts
      nav/nav.model.ts             NAV_MODULES, NavModule, NavDestination, visibleModules(session)
      nav/title.strategy.ts        NexoraTitleStrategy
      nav/permission-gate.ts       PermissionGate (renderiza a página ou ForbiddenPage)
      shortcuts/shortcuts.service.ts
    shell/
      shell-layout.ts / .html / .css
      banner/banner.ts / .html     top-navigation
      banner/brand-mark.ts         SVG
      banner/approvals-popover.ts, tasks-popover.ts, help-menu.ts
      user-menu/user-menu.ts
      notifications/notifications-popover.ts
      palette/command-palette.ts
      demo/demo-drawer.ts
      shortcuts/shortcuts-dialog.ts
      status/connection-status.ts
    pages/
      sign-in/sign-in-page.ts
      dashboard/dashboard-page.ts
      placeholder/placeholder-page.ts
      forbidden/forbidden-page.ts
      not-found/not-found-page.ts
      notifications/notifications-page.ts
      profile/profile-page.ts
      preferences/preferences-page.ts
  test/
    testing.ts                     provideTestBackend(), resetTestBackend(), signInAs(key)
```

---

### Task 1: Backend no cliente — `provideNexoraBackend`

**Files:**
- Create: `src/app/core/backend/nexora-backend.provider.ts`, `src/app/core/backend/api-error.ts`, `src/app/core/backend/demo-state.ts`, `src/test/testing.ts`
- Modify: `src/app/app.config.ts`
- Test: `src/app/core/backend/nexora-backend.provider.spec.ts`

**Interfaces:**
- Consumes: `createNexoraBackend`, `NexoraApi`, `BackendOptions`, `NexoraApiError`, `ScenarioId`, `LatencyProfile` de `@slotted/demo-nexora-operations`.
- Produces:
  - `NEXORA_BACKEND = new InjectionToken<BackendHandle>('nexora backend')`
  - `BackendHandle { api: Signal<NexoraApi | null>; status: Signal<'idle' | 'seeding' | 'ready'>; ready(): Promise<NexoraApi>; create(options?: Partial<BackendOptions>): Promise<NexoraApi>; recreate(options?: Partial<BackendOptions>): Promise<NexoraApi> }`
  - `provideNexoraBackend(options?: { defer?: boolean; options?: Partial<BackendOptions> }): EnvironmentProviders` — `defer: true` (default) cria em `setTimeout(0)` no `provideAppInitializer` sem bloquear o arranque; `defer: false` cria de forma síncrona (testes)
  - `readDemoState(): { persona?: string; scenario?: ScenarioId; scale?: 'light' | 'demo'; signedOut?: boolean }` / `writeDemoState(patch)` sobre `localStorage['nexora:demo']`, com `?scale=` da URL a prevalecer
  - `isApiError(error, code?): error is NexoraApiError`
  - `provideTestBackend(): EnvironmentProviders` em `src/test/testing.ts` — `defer: false`, `{ scale: 'light', latency: 'none' }`; uma instância por ficheiro de teste via cache de módulo (`let shared: NexoraApi | undefined`) para o seed (≈3 s) correr uma vez; `resetTestBackend()` chama `api.demo.reset()` e `api.demo.setPersona('sofia-ramirez')` no `beforeEach`

- [ ] **Step 1: Teste**

```ts
// src/app/core/backend/nexora-backend.provider.spec.ts
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { isApiError } from './api-error';
import { NEXORA_BACKEND } from './nexora-backend.provider';

describe('nexora backend provider', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend()] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
  });

  it('is ready with Sofia signed in', async () => {
    const backend = TestBed.inject(NEXORA_BACKEND);
    const api = await backend.ready();
    expect(backend.status()).toBe('ready');
    const session = await api.session.get();
    expect(session.user.displayName).toBe('Sofia Ramirez');
  });

  it('exposes api errors with their code', async () => {
    const api = await TestBed.inject(NEXORA_BACKEND).ready();
    await api.demo.setPersona('jordan-wells');
    const error = await api.finance.invoices.list({}).catch((e: unknown) => e);
    expect(isApiError(error, 'FORBIDDEN')).toBe(true);
  });
});
```

`api.finance.invoices.list` — confirmar o nome exato em `apps/demos/nexora-operations/backend/api/index.ts` (`finance: { invoices: … }`); ajustar se a superfície for `api.invoices.list`.

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora-angular && pnpm test`
Expected: FAIL — módulos inexistentes.

- [ ] **Step 3: Implementação**

```ts
// src/app/core/backend/api-error.ts
import { NexoraApiError } from '@slotted/demo-nexora-operations';

export function isApiError(error: unknown, code?: string): error is NexoraApiError {
  return error instanceof NexoraApiError && (code === undefined || error.code === code);
}
```

```ts
// src/app/core/backend/demo-state.ts
import type { ScenarioId } from '@slotted/demo-nexora-operations';

export interface DemoState {
  persona?: string;
  scenario?: ScenarioId;
  scale?: 'light' | 'demo';
  signedOut?: boolean;
}

const KEY = 'nexora:demo';

export function readDemoState(): DemoState {
  let state: DemoState = {};
  try {
    state = JSON.parse(localStorage.getItem(KEY) ?? '{}') as DemoState;
  } catch {
    state = {};
  }
  const scale = new URLSearchParams(location.search).get('scale');
  if (scale === 'light' || scale === 'demo') state.scale = scale;
  return state;
}

export function writeDemoState(patch: DemoState): DemoState {
  const next = { ...readDemoState(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  return next;
}
```

```ts
// src/app/core/backend/nexora-backend.provider.ts
import { InjectionToken, makeEnvironmentProviders, provideAppInitializer, signal, type EnvironmentProviders, type Signal } from '@angular/core';
import { createNexoraBackend, type BackendOptions, type NexoraApi } from '@slotted/demo-nexora-operations';
import { readDemoState } from './demo-state';

export type BackendStatus = 'idle' | 'seeding' | 'ready';

export interface BackendHandle {
  api: Signal<NexoraApi | null>;
  status: Signal<BackendStatus>;
  ready(): Promise<NexoraApi>;
  create(options?: Partial<BackendOptions>): Promise<NexoraApi>;
  recreate(options?: Partial<BackendOptions>): Promise<NexoraApi>;
}

export const NEXORA_BACKEND = new InjectionToken<BackendHandle>('nexora backend');

/**
 * The seed is synchronous and costs seconds; the handle defers it to the next
 * macrotask so the shell paints its skeleton first, and every store awaits
 * `ready()` before its first call.
 */
export function createBackendHandle(base: Partial<BackendOptions>, defer: boolean): BackendHandle {
  const api = signal<NexoraApi | null>(null);
  const status = signal<BackendStatus>('idle');
  let pending: Promise<NexoraApi> | null = null;

  const build = (options: Partial<BackendOptions>): Promise<NexoraApi> => {
    status.set('seeding');
    api.set(null);
    const state = readDemoState();
    const merged: BackendOptions = {
      scale: state.scale ?? 'light',
      latency: 'normal',
      ...(state.persona === undefined ? {} : { persona: state.persona }),
      ...(state.scenario === undefined ? {} : { scenario: state.scenario }),
      ...base,
      ...options,
    };
    const run = () => {
      const instance = createNexoraBackend(merged);
      api.set(instance);
      status.set('ready');
      return instance;
    };
    pending = defer ? new Promise<NexoraApi>((resolve) => setTimeout(() => resolve(run()), 0)) : Promise.resolve(run());
    return pending;
  };

  return {
    api: api.asReadonly(),
    status: status.asReadonly(),
    ready: () => pending ?? build({}),
    create: (options = {}) => pending ?? build(options),
    recreate: (options = {}) => build(options),
  };
}

export function provideNexoraBackend(config: { defer?: boolean; options?: Partial<BackendOptions> } = {}): EnvironmentProviders {
  const handle = createBackendHandle(config.options ?? {}, config.defer ?? true);
  return makeEnvironmentProviders([
    { provide: NEXORA_BACKEND, useValue: handle },
    provideAppInitializer(() => {
      void handle.create();
    }),
  ]);
}
```

```ts
// src/test/testing.ts
import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { NexoraApi } from '@slotted/demo-nexora-operations';
import { createBackendHandle, NEXORA_BACKEND, type BackendHandle } from '../app/core/backend/nexora-backend.provider';

let shared: BackendHandle | undefined;

/** One seeded backend per test file: the seed costs seconds and every test resets it instead. */
export function provideTestBackend(): EnvironmentProviders {
  shared ??= createBackendHandle({ scale: 'light', latency: 'none' }, false);
  return makeEnvironmentProviders([{ provide: NEXORA_BACKEND, useValue: shared }]);
}

export async function resetTestBackend(): Promise<NexoraApi> {
  const api = await TestBed.inject(NEXORA_BACKEND).ready();
  await api.demo.reset();
  await api.demo.setPersona('sofia-ramirez');
  try {
    localStorage.clear();
  } catch {
    /* jsdom without storage */
  }
  return api;
}

export async function signInAs(personaKey: string): Promise<void> {
  const api = await TestBed.inject(NEXORA_BACKEND).ready();
  await api.demo.setPersona(personaKey);
}
```

Em `src/app/app.config.ts`, acrescentar `provideNexoraBackend()` aos providers.

- [ ] **Step 4: Correr e ver passar**

Run: `cd apps/demos/nexora-angular && pnpm test`
Expected: PASS (2 testes).

- [ ] **Step 5: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora-angular/src && git add apps/demos/nexora-angular && git commit -m "feat(nexora-angular): provideNexoraBackend — backend simulado criado após o primeiro paint, estado de demonstração em localStorage, isApiError, provideTestBackend partilhado por ficheiro"
```

---

### Task 2: Estado — sessão, relógio, preferências, contadores, demo, pesquisa

**Files:**
- Create: `src/app/core/session/session.store.ts`, `clock.service.ts`, `preferences.store.ts`, `src/app/core/activity/notifications.store.ts`, `approvals.store.ts`, `tasks.store.ts`, `src/app/core/demo/demo.store.ts`, `src/app/core/search/search.service.ts`
- Test: `src/app/core/session/session.store.spec.ts`, `src/app/core/session/preferences.store.spec.ts`, `src/app/core/activity/notifications.store.spec.ts`

**Interfaces:**
- Consumes: `NEXORA_BACKEND`, `isApiError`, `readDemoState`, `writeDemoState`; tipos `SessionInfo`, `Warehouse`, `Notification`, `TaskListItem`, `ApprovalListItem`, `SearchResponse`, `SearchHit`, `ScenarioId`, `LatencyProfile` de `@slotted/demo-nexora-operations`.
- Produces:
  - `UserPreferences { scheme: 'light' | 'dark' | 'system'; density: 'comfortable' | 'compact' | 'dense'; startRoute: string; notifications: { emailApprovals: boolean; emailMentions: boolean; inAppOperationalAlerts: boolean } }` em `preferences.store.ts`
  - `SessionStore`: `session: Signal<SessionInfo | null>`, `status: Signal<'idle' | 'loading' | 'ready' | 'error' | 'unauthenticated'>`, `error`, `user`, `warehouses: Signal<Warehouse[]>`, `loadedAt`, `load()`, `reload()`, `signOut()`, `can(permission)`, `canAny(...permissions)`
  - `ClockService`: `now()`, `businessDate()`, `relative(instant)`, `formatDate(value, options?)`, `formatTime(instant)`, `isToday(instant)`
  - `PreferencesStore`: `preferences: Signal<UserPreferences>`, `update(patch)`, `apply(preferences)`
  - `NotificationsStore`: `unread`, `items`, `view: WritableSignal<'all' | 'unread' | 'archived'>`, `page`, `total`, `loading`, `refreshCount()`, `loadPage(page?, size?)`, `markRead(id)`, `archive(id)`, `markAllRead()`, `routeFor(notification): string | null`
  - `ApprovalsStore`: `pending`, `items`, `refresh()`, `load()`
  - `TasksStore`: `open`, `items`, `refresh()`
  - `DemoStore`: `info: Signal<DemoInfo | null>`, `busy`, `load()`, `setPersona(key)`, `signOut()`, `switchScenario(id)`, `advanceDays(days)`, `reset()`, `setLatency(profile)`; `DemoInfo { personas: SessionInfo['personas']; activePersonaKey: string | null; scenarios: { id: ScenarioId; label: string; description: string }[]; scenarioId: ScenarioId; clock: { now: string; today: string }; latency: LatencyProfile }`
  - `SearchService`: `search(q): Promise<SearchResponse['groups']>`, `recent: Signal<SearchHit[]>`, `remember(hit)`, `routeFor(hit)`

- [ ] **Step 1: Testes**

```ts
// src/app/core/session/session.store.spec.ts
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend, signInAs } from '../../../test/testing';
import { SessionStore } from './session.store';

describe('SessionStore', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend()] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
  });

  it('loads Sofia and answers can()', async () => {
    const store = TestBed.inject(SessionStore);
    await store.load();
    expect(store.status()).toBe('ready');
    expect(store.can('orders.approve')).toBe(true);
    expect(store.can('inventory.adjust')).toBe(false);
    expect(store.canAny('finance.dashboard', 'invoices.view')).toBe(true);
    expect(store.warehouses().length).toBeGreaterThanOrEqual(5);
  });

  it('scopes Jordan to one warehouse', async () => {
    await signInAs('jordan-wells');
    const store = TestBed.inject(SessionStore);
    await store.load();
    expect(store.warehouses().map((w) => w.code)).toEqual(['CHI-01']);
  });

  it('is unauthenticated after sign-out until a persona is chosen', async () => {
    const store = TestBed.inject(SessionStore);
    await store.load();
    store.signOut();
    expect(store.status()).toBe('unauthenticated');
  });
});
```

```ts
// src/app/core/session/preferences.store.spec.ts
import { ApplicationInitStatus, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { PreferencesStore } from './preferences.store';
import { SessionStore } from './session.store';

describe('PreferencesStore', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend()] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
    await TestBed.inject(SessionStore).load();
  });

  it('writes the scheme and density onto html and persists per user', () => {
    const prefs = TestBed.inject(PreferencesStore);
    const html = TestBed.inject(DOCUMENT).documentElement;
    prefs.update({ scheme: 'dark', density: 'compact' });
    expect(html.getAttribute('data-slotted-scheme')).toBe('dark');
    expect(html.getAttribute('data-slotted-density')).toBe('compact');
    expect(JSON.parse(localStorage.getItem('nexora:preferences:' + TestBed.inject(SessionStore).user()!.id) ?? '{}').scheme).toBe('dark');
  });
});
```

```ts
// src/app/core/activity/notifications.store.spec.ts
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { SessionStore } from '../session/session.store';
import { NotificationsStore } from './notifications.store';

describe('NotificationsStore', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend()] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
    await TestBed.inject(SessionStore).load();
  });

  it('counts unread and updates after markRead', async () => {
    const store = TestBed.inject(NotificationsStore);
    await store.refreshCount();
    const before = store.unread();
    expect(before).toBeGreaterThan(0);
    await store.loadPage();
    const unread = store.items().find((n) => n.readAt === undefined)!;
    await store.markRead(unread.id);
    expect(store.unread()).toBe(before - 1);
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora-angular && pnpm test`
Expected: FAIL.

- [ ] **Step 3: Sessão e relógio**

```ts
// src/app/core/session/session.store.ts
import { computed, inject, Injectable, signal } from '@angular/core';
import type { SessionInfo, Warehouse } from '@slotted/demo-nexora-operations';
import { isApiError } from '../backend/api-error';
import { readDemoState, writeDemoState } from '../backend/demo-state';
import { NEXORA_BACKEND } from '../backend/nexora-backend.provider';

export type SessionStatus = 'idle' | 'loading' | 'ready' | 'error' | 'unauthenticated';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly backend = inject(NEXORA_BACKEND);
  private readonly _session = signal<SessionInfo | null>(null);
  private readonly _status = signal<SessionStatus>('idle');
  private readonly _error = signal<string | null>(null);
  private readonly _warehouses = signal<Warehouse[]>([]);

  readonly session = this._session.asReadonly();
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly warehouses = this._warehouses.asReadonly();
  readonly user = computed(() => this._session()?.user ?? null);
  readonly loadedAt = signal(0);

  async load(): Promise<void> {
    if (readDemoState().signedOut === true) {
      this._session.set(null);
      this._status.set('unauthenticated');
      return;
    }
    this._status.set('loading');
    this._error.set(null);
    try {
      const api = await this.backend.ready();
      const session = await api.session.get();
      const all = await api.inventory.warehouses();
      const ids = session.warehouseIds;
      this._warehouses.set(ids === 'all' ? all : all.filter((w) => ids.includes(w.id)));
      this._session.set(session);
      this.loadedAt.set(performance.now());
      this._status.set('ready');
    } catch (error) {
      this._error.set(isApiError(error) ? error.message : 'Nexora is unavailable');
      this._status.set('error');
    }
  }

  reload(): Promise<void> {
    return this.load();
  }

  signOut(): void {
    writeDemoState({ signedOut: true });
    this._session.set(null);
    this._status.set('unauthenticated');
  }

  can(permission: string): boolean {
    return this._session()?.permissions.includes(permission) ?? false;
  }

  canAny(...permissions: string[]): boolean {
    return permissions.some((p) => this.can(p));
  }
}
```

`api.inventory.warehouses()` — o nome vem de `backend/api/index.ts` (linha `warehouses: () => request('GET /warehouses', …)`), dentro do bloco `inventory`; confirmar o bloco e ajustar. O tipo devolvido é `Warehouse[]` ou `{ data: Warehouse[] }` conforme `operations.listWarehouses`; ajustar a atribuição.

```ts
// src/app/core/session/clock.service.ts
import { inject, Injectable } from '@angular/core';
import { SessionStore } from './session.store';

@Injectable({ providedIn: 'root' })
export class ClockService {
  private readonly sessionStore = inject(SessionStore);

  private timezone(): string {
    return this.sessionStore.session()?.organization.timezone ?? 'America/Chicago';
  }

  /** The demo instant plus the time elapsed since the session was loaded. */
  now(): string {
    const session = this.sessionStore.session();
    if (session === null) return new Date(0).toISOString();
    const elapsed = performance.now() - this.sessionStore.loadedAt();
    return new Date(new Date(session.demo.demoClock).getTime() + elapsed).toISOString();
  }

  businessDate(): string {
    return this.sessionStore.session()?.demo.today ?? '';
  }

  relative(instant: string): string {
    const diff = new Date(instant).getTime() - new Date(this.now()).getTime();
    const abs = Math.abs(diff);
    const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (abs < minute) return 'just now';
    if (abs < hour) return rtf.format(Math.round(diff / minute), 'minute');
    if (abs < day) return rtf.format(Math.round(diff / hour), 'hour');
    if (abs < 30 * day) return rtf.format(Math.round(diff / day), 'day');
    return this.formatDate(instant);
  }

  formatDate(value: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }): string {
    return new Intl.DateTimeFormat('en-US', { timeZone: this.timezone(), ...options }).format(new Date(value));
  }

  formatTime(instant: string): string {
    return this.formatDate(instant, { hour: 'numeric', minute: '2-digit' });
  }

  isToday(instant: string): boolean {
    return this.formatDate(instant) === this.formatDate(this.now());
  }
}
```

- [ ] **Step 4: Preferências**

```ts
// src/app/core/session/preferences.store.ts
import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { SessionStore } from './session.store';

export interface UserPreferences {
  scheme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact' | 'dense';
  startRoute: string;
  notifications: { emailApprovals: boolean; emailMentions: boolean; inAppOperationalAlerts: boolean };
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  scheme: 'system',
  density: 'comfortable',
  startRoute: '/dashboard',
  notifications: { emailApprovals: true, emailMentions: true, inAppOperationalAlerts: true },
};

@Injectable({ providedIn: 'root' })
export class PreferencesStore {
  private readonly document = inject(DOCUMENT);
  private readonly sessionStore = inject(SessionStore);
  private readonly media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
  private readonly version = signal(0);

  readonly preferences = computed<UserPreferences>(() => {
    this.version();
    return this.read(this.sessionStore.user()?.id);
  });

  constructor() {
    effect(() => this.apply(this.preferences()));
    this.media?.addEventListener('change', () => this.apply(this.preferences()));
  }

  apply(preferences: UserPreferences): void {
    const html = this.document.documentElement;
    const scheme = preferences.scheme === 'system' ? (this.media?.matches ? 'dark' : 'light') : preferences.scheme;
    html.setAttribute('data-slotted-scheme', scheme);
    html.setAttribute('data-slotted-density', preferences.density);
    html.style.colorScheme = scheme;
  }

  update(patch: Partial<UserPreferences>): void {
    const userId = this.sessionStore.user()?.id;
    if (userId === undefined) return;
    const next: UserPreferences = { ...this.read(userId), ...patch, notifications: { ...this.read(userId).notifications, ...(patch.notifications ?? {}) } };
    try {
      localStorage.setItem(this.key(userId), JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    this.version.update((n) => n + 1);
  }

  private key(userId: string): string {
    return `nexora:preferences:${userId}`;
  }

  private read(userId: string | undefined): UserPreferences {
    if (userId === undefined) return DEFAULT_PREFERENCES;
    try {
      const stored = JSON.parse(localStorage.getItem(this.key(userId)) ?? 'null') as Partial<UserPreferences> | null;
      return stored === null ? DEFAULT_PREFERENCES : { ...DEFAULT_PREFERENCES, ...stored, notifications: { ...DEFAULT_PREFERENCES.notifications, ...(stored.notifications ?? {}) } };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }
}
```

- [ ] **Step 5: Contadores, demo e pesquisa**

```ts
// src/app/core/activity/notifications.store.ts
import { inject, Injectable, signal } from '@angular/core';
import type { Notification } from '@slotted/demo-nexora-operations';
import { NEXORA_BACKEND } from '../backend/nexora-backend.provider';
import { SessionStore } from '../session/session.store';

export type NotificationsView = 'all' | 'unread' | 'archived';

const ROUTE_BY_ENTITY: Record<string, string> = {
  customer: '/crm/customers', order: '/sales/orders', quote: '/sales/quotes', invoice: '/finance/invoices',
  product: '/catalog/products', sku: '/catalog/products', ticket: '/support/tickets', shipment: '/inventory/movements',
  purchase_order: '/procurement/purchase-orders', supplier: '/procurement/suppliers', approval: '/sales/approvals',
};

@Injectable({ providedIn: 'root' })
export class NotificationsStore {
  private readonly backend = inject(NEXORA_BACKEND);
  private readonly sessionStore = inject(SessionStore);
  readonly unread = signal(0);
  readonly items = signal<Notification[]>([]);
  readonly view = signal<NotificationsView>('all');
  readonly page = signal(1);
  readonly total = signal(0);
  readonly loading = signal(false);

  async refreshCount(): Promise<void> {
    const api = await this.backend.ready();
    const session = await api.session.get();
    this.unread.set(session.unreadNotifications);
  }

  async loadPage(page = 1, size = 25): Promise<void> {
    this.loading.set(true);
    try {
      const api = await this.backend.ready();
      const view = this.view();
      const r = await api.notifications.list({ page, pageSize: size, includeArchived: view === 'archived' });
      const rows = r.data.filter((n) =>
        view === 'archived' ? n.archivedAt !== undefined : view === 'unread' ? n.readAt === undefined && n.archivedAt === undefined : n.archivedAt === undefined,
      );
      this.items.set(rows);
      this.page.set(r.page.number);
      this.total.set(view === 'all' ? r.page.totalItems : rows.length);
    } finally {
      this.loading.set(false);
    }
  }

  async markRead(id: string): Promise<void> {
    const api = await this.backend.ready();
    await api.notifications.markRead(id);
    await Promise.all([this.refreshCount(), this.loadPage(this.page())]);
  }

  async archive(id: string): Promise<void> {
    const api = await this.backend.ready();
    await api.notifications.archive(id);
    await Promise.all([this.refreshCount(), this.loadPage(this.page())]);
  }

  async markAllRead(): Promise<void> {
    const api = await this.backend.ready();
    await api.notifications.markAllRead();
    await Promise.all([this.refreshCount(), this.loadPage(this.page())]);
  }

  routeFor(notification: Notification): string | null {
    if (notification.entityType === undefined || notification.entityId === undefined) return null;
    const base = ROUTE_BY_ENTITY[notification.entityType];
    return base === undefined ? null : `${base}/${notification.entityId}`;
  }
}
```

O filtro de vista no cliente existe porque `notifications.list` só distingue `includeArchived`; `total` para `unread`/`archived` é o da página carregada. Os nomes `markRead`, `markAllRead`, `archive` e a existência de `archive` são confirmados em `backend/api/commands/platform.ts` (`const notifications = { markRead, markAllRead, … }`); se `archive` não existir, o botão de arquivar fica fora e a vista `archived` também, registado em `LIBRARY-FEEDBACK.md` como pendência do backend.

```ts
// src/app/core/activity/approvals.store.ts
import { inject, Injectable, signal } from '@angular/core';
import type { ApprovalListItem } from '@slotted/demo-nexora-operations';
import { NEXORA_BACKEND } from '../backend/nexora-backend.provider';

@Injectable({ providedIn: 'root' })
export class ApprovalsStore {
  private readonly backend = inject(NEXORA_BACKEND);
  readonly pending = signal(0);
  readonly items = signal<ApprovalListItem[]>([]);

  async refresh(): Promise<void> {
    const api = await this.backend.ready();
    this.pending.set((await api.session.get()).pendingApprovals);
  }

  async load(): Promise<void> {
    const api = await this.backend.ready();
    const r = await api.approvals.list({ filter: { status: 'pending' }, pageSize: 25 });
    this.items.set(r.data.filter((a) => a.actionable));
    this.pending.set(this.items().length);
  }
}
```

```ts
// src/app/core/activity/tasks.store.ts
import { inject, Injectable, signal } from '@angular/core';
import type { TaskListItem } from '@slotted/demo-nexora-operations';
import { NEXORA_BACKEND } from '../backend/nexora-backend.provider';

@Injectable({ providedIn: 'root' })
export class TasksStore {
  private readonly backend = inject(NEXORA_BACKEND);
  readonly open = signal(0);
  readonly items = signal<TaskListItem[]>([]);

  async refresh(): Promise<void> {
    const api = await this.backend.ready();
    const r = await api.tasks.list({ mine: true, filter: { status: 'open' }, sort: 'dueDate', pageSize: 25 });
    this.items.set(r.data);
    this.open.set(r.page.totalItems);
  }
}
```

```ts
// src/app/core/demo/demo.store.ts
import { inject, Injectable, signal } from '@angular/core';
import type { LatencyProfile, ScenarioId, SessionInfo } from '@slotted/demo-nexora-operations';
import { SCENARIOS } from '@slotted/demo-nexora-operations';
import { ApprovalsStore } from '../activity/approvals.store';
import { NotificationsStore } from '../activity/notifications.store';
import { TasksStore } from '../activity/tasks.store';
import { readDemoState, writeDemoState } from '../backend/demo-state';
import { NEXORA_BACKEND } from '../backend/nexora-backend.provider';
import { SessionStore } from '../session/session.store';

export interface DemoInfo {
  personas: SessionInfo['personas'];
  activePersonaKey: string | null;
  scenarios: { id: ScenarioId; label: string; description: string }[];
  scenarioId: ScenarioId;
  clock: { now: string; today: string };
  latency: LatencyProfile;
}

@Injectable({ providedIn: 'root' })
export class DemoStore {
  private readonly backend = inject(NEXORA_BACKEND);
  private readonly sessionStore = inject(SessionStore);
  private readonly notifications = inject(NotificationsStore);
  private readonly approvals = inject(ApprovalsStore);
  private readonly tasks = inject(TasksStore);
  readonly info = signal<DemoInfo | null>(null);
  readonly busy = signal(false);
  private latency: LatencyProfile = 'normal';

  async load(): Promise<void> {
    const api = await this.backend.ready();
    const session = await api.session.get();
    const scenarios = Object.values(SCENARIOS).map((s) => ({ id: s.id, label: s.label, description: s.description }));
    const active = session.personas.find((p) => p.userId === session.user.id);
    this.info.set({
      personas: session.personas,
      activePersonaKey: active?.key ?? null,
      scenarios,
      scenarioId: session.demo.scenarioId as ScenarioId,
      clock: { now: session.demo.demoClock, today: session.demo.today },
      latency: this.latency,
    });
  }

  private async after(): Promise<void> {
    await this.sessionStore.reload();
    if (this.sessionStore.status() === 'ready') {
      await Promise.all([this.notifications.refreshCount(), this.approvals.refresh(), this.tasks.refresh()]);
    }
    await this.load();
  }

  private async run(action: () => Promise<unknown>): Promise<void> {
    this.busy.set(true);
    try {
      await action();
      await this.after();
    } finally {
      this.busy.set(false);
    }
  }

  setPersona(key: string): Promise<void> {
    return this.run(async () => {
      const api = await this.backend.ready();
      await api.demo.setPersona(key);
      writeDemoState({ persona: key, signedOut: false });
    });
  }

  signOut(): Promise<void> {
    this.sessionStore.signOut();
    return this.load();
  }

  switchScenario(id: ScenarioId): Promise<void> {
    return this.run(async () => {
      const api = await this.backend.ready();
      await api.demo.setScenario(id);
      writeDemoState({ scenario: id });
    });
  }

  advanceDays(days: number): Promise<void> {
    return this.run(async () => (await this.backend.ready()).demo.advanceClock(days * 24));
  }

  reset(): Promise<void> {
    return this.run(async () => (await this.backend.ready()).demo.reset(readDemoState().scenario));
  }

  setLatency(profile: LatencyProfile): Promise<void> {
    return this.run(async () => {
      (await this.backend.ready()).demo.setLatency(profile);
      this.latency = profile;
    });
  }
}
```

`SCENARIOS` — a forma (`Record<ScenarioId, ScenarioDefinition>` com `label`/`description`) é confirmada em `backend/api/scenarios.ts`; ajustar os nomes dos campos. `demo.setScenario` já faz reset (§74.6); `setPersona` depois de `setScenario` pode ser necessário quando o cenário fixa a persona — ler `applyScenario`.

```ts
// src/app/core/search/search.service.ts
import { inject, Injectable, signal } from '@angular/core';
import type { SearchHit, SearchResponse } from '@slotted/demo-nexora-operations';
import { NEXORA_BACKEND } from '../backend/nexora-backend.provider';
import { SessionStore } from '../session/session.store';

const RECENT_LIMIT = 8;
const DEBOUNCE_MS = 150;

const ROUTE_BY_TYPE: Record<SearchHit['type'], string> = {
  customer: '/crm/customers', contact: '/crm/contacts', sku: '/catalog/products', product: '/catalog/products',
  order: '/sales/orders', quote: '/sales/quotes', invoice: '/finance/invoices', supplier: '/procurement/suppliers',
  purchase_order: '/procurement/purchase-orders', ticket: '/support/tickets',
};

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly backend = inject(NEXORA_BACKEND);
  private readonly sessionStore = inject(SessionStore);
  private sequence = 0;
  readonly recent = signal<SearchHit[]>(this.readRecent());

  async search(q: string): Promise<SearchResponse['groups']> {
    const mine = ++this.sequence;
    if (q.trim().length < 2) return [];
    await new Promise((r) => setTimeout(r, DEBOUNCE_MS));
    if (mine !== this.sequence) return [];
    const api = await this.backend.ready();
    const response = await api.search(q);
    return mine === this.sequence ? response.groups : [];
  }

  routeFor(hit: SearchHit): string {
    return `${ROUTE_BY_TYPE[hit.type]}/${hit.id}`;
  }

  remember(hit: SearchHit): void {
    const next = [hit, ...this.recent().filter((d) => d.id !== hit.id)].slice(0, RECENT_LIMIT);
    this.recent.set(next);
    try {
      localStorage.setItem(this.key(), JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }

  private key(): string {
    return `nexora:recent:${this.sessionStore.user()?.id ?? 'anonymous'}`;
  }

  private readRecent(): SearchHit[] {
    try {
      return JSON.parse(localStorage.getItem(this.key()) ?? '[]') as SearchHit[];
    } catch {
      return [];
    }
  }
}
```

- [ ] **Step 6: Correr e ver passar**

Run: `cd apps/demos/nexora-angular && pnpm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora-angular/src && git add apps/demos/nexora-angular && git commit -m "feat(nexora-angular): SessionStore sobre session.get() com armazéns do escopo, ClockService sobre demo.demoClock, PreferencesStore em localStorage por utilizador, stores de notificações/aprovações/tarefas, DemoStore, SearchService com recentes"
```

---

### Task 3: Navegação — modelo, rotas, guarda em lugar, páginas de sistema, sign-in

**Files:**
- Create: `src/app/core/nav/nav.model.ts`, `src/app/core/nav/title.strategy.ts`, `src/app/core/nav/permission-gate.ts`, `src/app/pages/placeholder/placeholder-page.ts`, `src/app/pages/forbidden/forbidden-page.ts`, `src/app/pages/not-found/not-found-page.ts`, `src/app/pages/sign-in/sign-in-page.ts`, `src/app/pages/dashboard/dashboard-page.ts`, `src/app/shell/shell-layout.ts` (esqueleto mínimo: `<router-outlet>`; a Task 4 completa)
- Modify: `src/app/app.routes.ts`, `src/app/app.config.ts`, `src/app/app.ts`, `src/app/app.html`
- Test: `src/app/core/nav/nav.model.spec.ts`, `src/app/core/nav/permission-gate.spec.ts`

**Interfaces:**
- Produces:
  - `NavDestination { id: string; label: string; path: string; permissions?: string[]; count?: 'approvals' | 'support' }`
  - `NavModule { id: string; label: string; icon: string; section: 'home' | 'operate' | 'insight' | 'manage'; path: string; permissions?: string[]; destinations: NavDestination[]; key?: string }` (`key` = letra do atalho `g <key>`)
  - `NAV_MODULES: readonly NavModule[]`, `visibleModules(can: (p: Permission) => boolean): NavModule[]`, `moduleFor(url): NavModule | undefined`, `destinationFor(url): { module; destination } | undefined`
  - `PermissionGate` (component): lê `route.data['permissions']` e `route.data['page']`; renderiza `ForbiddenPage` ou a página por `NgComponentOutlet`
  - `NexoraTitleStrategy extends TitleStrategy`
  - `PlaceholderPage` (lê `route.data['title']`, `['module']`, `['slice']`), `ForbiddenPage` (`input permission`), `NotFoundPage`, `SignInPage`, `DashboardPage` (cabeçalho + contadores)
  - `sessionReady: CanMatchFn` — carrega a sessão se `idle`; `unauthenticated` → `UrlTree('/sign-in')`; `error` → deixa passar (o `ShellLayout` mostra o erro)
  - `signedOut: CanMatchFn` para `/sign-in` — sessão `ready` → `UrlTree(startRoute)`

- [ ] **Step 1: Testes**

```ts
// src/app/core/nav/nav.model.spec.ts
import { describe, expect, it } from 'vitest';
import { destinationFor, NAV_MODULES, visibleModules } from './nav.model';

describe('nav model', () => {
  it('hides modules the session cannot view', () => {
    const jordan = new Set(['inventory.view', 'shipments.view', 'catalog.view', 'orders.view']);
    const visible = visibleModules((p) => jordan.has(p)).map((m) => m.id);
    expect(visible).toEqual(['home', 'sales', 'catalog', 'inventory', 'activity']);
  });
  it('shows every module to an administrator', () => {
    expect(visibleModules(() => true).length).toBe(NAV_MODULES.length);
  });
  it('resolves a url to its destination', () => {
    expect(destinationFor('/sales/orders/ord_000001')?.destination.id).toBe('sales.orders');
    expect(destinationFor('/nowhere')).toBeUndefined();
  });
});
```

```ts
// src/app/core/nav/permission-gate.spec.ts
import { ApplicationInitStatus, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend, signInAs } from '../../../test/testing';
import { SessionStore } from '../session/session.store';
import { PermissionGate } from './permission-gate';

@Component({ selector: 'app-probe', template: '<p>finance overview</p>' })
class Probe {}

describe('PermissionGate', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTestBackend(),
        provideRouter([{ path: 'finance', component: PermissionGate, data: { permissions: ['finance.dashboard'], page: Probe, title: 'Finance' } }]),
      ],
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
    await TestBed.inject(SessionStore).load();
  });

  it('renders ForbiddenPage for Sofia, who lacks finance.dashboard', async () => {
    const harness = await RouterTestingHarness.create('/finance');
    expect(harness.routeNativeElement?.textContent).toContain('finance.dashboard');
    expect(harness.routeNativeElement?.textContent).not.toContain('finance overview');
  });

  it('renders the page for Priya', async () => {
    await signInAs('priya-shah');
    await TestBed.inject(SessionStore).reload();
    const harness = await RouterTestingHarness.create('/finance');
    expect(harness.routeNativeElement?.textContent).toContain('finance overview');
  });
});

```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora-angular && pnpm test`
Expected: FAIL.

- [ ] **Step 3: Modelo de navegação**

```ts
// src/app/core/nav/nav.model.ts

export interface NavDestination {
  id: string;
  label: string;
  path: string;
  permissions?: string[];
  count?: 'approvals' | 'support';
}

export interface NavModule {
  id: string;
  label: string;
  icon: string;
  section: 'home' | 'operate' | 'insight' | 'manage';
  path: string;
  permissions?: string[];
  destinations: NavDestination[];
  key?: string;
  slice: string;
}

const d = (module: string, id: string, label: string, path: string, extra: Partial<NavDestination> = {}): NavDestination => ({ id: `${module}.${id}`, label, path, ...extra });

export const NAV_MODULES: readonly NavModule[] = [
  { id: 'home', label: 'Home', icon: 'lucideLayoutDashboard', section: 'home', path: '/dashboard', destinations: [], key: 'h', slice: 'Shell' },
  { id: 'crm', label: 'CRM', icon: 'lucideUsers', section: 'operate', path: '/crm', permissions: ['customers.view'], key: 'c', slice: 'CRM',
    destinations: [d('crm', 'customers', 'Customers', '/crm/customers'), d('crm', 'contacts', 'Contacts', '/crm/contacts', { permissions: ['contacts.view'] })] },
  { id: 'sales', label: 'Sales', icon: 'lucideShoppingCart', section: 'operate', path: '/sales', permissions: ['orders.view', 'quotes.view'], key: 's', slice: 'Sales',
    destinations: [d('sales', 'quotes', 'Quotes', '/sales/quotes', { permissions: ['quotes.view'] }), d('sales', 'orders', 'Orders', '/sales/orders', { permissions: ['orders.view'] }),
      d('sales', 'approvals', 'Approvals', '/sales/approvals', { permissions: ['orders.approve', 'quotes.approve'], count: 'approvals' })] },
  { id: 'catalog', label: 'Catalog', icon: 'lucidePackage', section: 'operate', path: '/catalog', permissions: ['catalog.view'], slice: 'Catalog',
    destinations: [d('catalog', 'products', 'Products', '/catalog/products'), d('catalog', 'categories', 'Categories', '/catalog/categories'), d('catalog', 'price-lists', 'Price lists', '/catalog/price-lists', { permissions: ['pricing.view'] })] },
  { id: 'inventory', label: 'Inventory', icon: 'lucideWarehouse', section: 'operate', path: '/inventory', permissions: ['inventory.view'], key: 'i', slice: 'Inventory',
    destinations: [d('inventory', 'overview', 'Overview', '/inventory/overview'), d('inventory', 'warehouses', 'Warehouses', '/inventory/warehouses'), d('inventory', 'transfers', 'Transfers', '/inventory/transfers'), d('inventory', 'movements', 'Movements', '/inventory/movements')] },
  { id: 'procurement', label: 'Procurement', icon: 'lucideTruck', section: 'operate', path: '/procurement', permissions: ['suppliers.view', 'purchase_orders.view'], slice: 'Procurement',
    destinations: [d('procurement', 'suppliers', 'Suppliers', '/procurement/suppliers', { permissions: ['suppliers.view'] }), d('procurement', 'purchase-orders', 'Purchase orders', '/procurement/purchase-orders', { permissions: ['purchase_orders.view'] }), d('procurement', 'receiving', 'Receiving', '/procurement/receiving', { permissions: ['receipts.view'] })] },
  { id: 'finance', label: 'Finance', icon: 'lucideLandmark', section: 'operate', path: '/finance', permissions: ['finance.dashboard', 'invoices.view'], key: 'f', slice: 'Finance',
    destinations: [d('finance', 'overview', 'Overview', '/finance/overview', { permissions: ['finance.dashboard'] }), d('finance', 'invoices', 'Invoices', '/finance/invoices', { permissions: ['invoices.view'] }), d('finance', 'payments', 'Payments', '/finance/payments', { permissions: ['payments.view'] }), d('finance', 'reconciliation', 'Reconciliation', '/finance/reconciliation', { permissions: ['reconciliation.view'] })] },
  { id: 'support', label: 'Support', icon: 'lucideLifeBuoy', section: 'operate', path: '/support', permissions: ['support.view'], slice: 'Support',
    destinations: [d('support', 'inbox', 'Inbox', '/support/inbox', { count: 'support' })] },
  { id: 'analytics', label: 'Analytics', icon: 'lucideChartColumn', section: 'insight', path: '/analytics', permissions: ['analytics.view'], slice: 'Analytics',
    destinations: ['executive', 'sales', 'inventory', 'finance', 'support'].map((k) => d('analytics', k, k[0]!.toUpperCase() + k.slice(1), `/analytics/${k}`)) },
  { id: 'automations', label: 'Automations', icon: 'lucideWorkflow', section: 'insight', path: '/automations', permissions: ['workflows.view'], slice: 'Workflow',
    destinations: [d('automations', 'workflows', 'Workflows', '/automations/workflows')] },
  { id: 'activity', label: 'Activity', icon: 'lucideActivity', section: 'insight', path: '/activity', destinations: [], slice: 'Activity' },
  { id: 'audit', label: 'Audit', icon: 'lucideScrollText', section: 'insight', path: '/audit', permissions: ['audit.view'], destinations: [], slice: 'Activity' },
  { id: 'settings', label: 'Settings', icon: 'lucideSettings', section: 'manage', path: '/settings', permissions: ['organization.view', 'users.view', 'roles.view'], slice: 'Administration',
    destinations: [d('settings', 'organization', 'Organization', '/settings/organization', { permissions: ['organization.view'] }), d('settings', 'users', 'Users', '/settings/users', { permissions: ['users.view'] }), d('settings', 'teams', 'Teams', '/settings/teams', { permissions: ['teams.view'] }),
      d('settings', 'roles', 'Roles & permissions', '/settings/roles', { permissions: ['roles.view'] }), d('settings', 'warehouses', 'Warehouses', '/settings/warehouses', { permissions: ['organization.view'] }), d('settings', 'integrations', 'Integrations', '/settings/integrations', { permissions: ['organization.edit'] })] },
];

export const SECTION_LABELS: Record<NavModule['section'], string | null> = { home: null, operate: 'Operate', insight: 'Insight', manage: 'Manage' };

const allowed = (can: (p: string) => boolean, permissions?: string[]) => permissions === undefined || permissions.some(can);

export function visibleModules(can: (p: string) => boolean): NavModule[] {
  return NAV_MODULES.filter((m) => allowed(can, m.permissions)).map((m) => ({ ...m, destinations: m.destinations.filter((x) => allowed(can, x.permissions)) }));
}

export function moduleFor(url: string): NavModule | undefined {
  const path = url.split('?')[0] ?? '';
  return NAV_MODULES.find((m) => path === m.path || path.startsWith(`${m.path}/`));
}

export function destinationFor(url: string): { module: NavModule; destination: NavDestination } | undefined {
  const module = moduleFor(url);
  if (module === undefined) return undefined;
  const path = url.split('?')[0] ?? '';
  const destination = module.destinations.find((x) => path === x.path || path.startsWith(`${x.path}/`));
  return destination === undefined ? undefined : { module, destination };
}
```

- [ ] **Step 4: Gate, título, guardas, páginas**

```ts
// src/app/core/nav/permission-gate.ts
import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, type Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ForbiddenPage } from '../../pages/forbidden/forbidden-page';
import { SessionStore } from '../session/session.store';

@Component({
  selector: 'app-permission-gate',
  imports: [NgComponentOutlet, ForbiddenPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (missing(); as permission) {
      <app-forbidden-page [permission]="permission" />
    } @else {
      <ng-container *ngComponentOutlet="page()" />
    }
  `,
})
export class PermissionGate {
  private readonly route = inject(ActivatedRoute);
  private readonly sessionStore = inject(SessionStore);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  readonly page = computed(() => this.data()['page'] as Type<unknown>);
  readonly missing = computed(() => {
    const permissions = (this.data()['permissions'] ?? []) as string[];
    void this.sessionStore.session();
    if (permissions.length === 0 || permissions.some((p) => this.sessionStore.can(p))) return null;
    return permissions[0] ?? null;
  });
}
```

```ts
// src/app/core/nav/title.strategy.ts
import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, type RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NexoraTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const page = this.buildTitle(snapshot);
    this.title.setTitle(page === undefined ? 'Nexora' : `${page} · Nexora`);
  }
}
```

```ts
// src/app/core/nav/guards.ts
import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { PreferencesStore } from '../session/preferences.store';
import { SessionStore } from '../session/session.store';

export const sessionReady: CanMatchFn = async () => {
  const store = inject(SessionStore);
  if (store.status() === 'idle') await store.load();
  return store.status() === 'unauthenticated' ? inject(Router).createUrlTree(['/sign-in']) : true;
};

export const signedOut: CanMatchFn = async () => {
  const store = inject(SessionStore);
  if (store.status() === 'idle') await store.load();
  return store.status() === 'ready' ? inject(Router).createUrlTree([inject(PreferencesStore).preferences().startRoute]) : true;
};
```

```ts
// src/app/pages/forbidden/forbidden-page.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlButtonLink } from '@slotted/angular/button';
import { SlPage, SlPageBody } from '@slotted/angular/page';
import { SlResultState, SlResultStateActions, SlResultStateContent, SlResultStateDescription, SlResultStateTitle } from '@slotted/angular/result-state';

@Component({
  selector: 'app-forbidden-page',
  imports: [RouterLink, SlButtonLink, SlPage, SlPageBody, SlResultState, SlResultStateActions, SlResultStateContent, SlResultStateDescription, SlResultStateTitle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div slPage>
      <div slPageBody>
        <div slResultState status="error" reach="page">
          <div slResultStateContent>
            <h1 slResultStateTitle>You don't have access to this area</h1>
            <p slResultStateDescription>Your role is missing the <code>{{ permission() }}</code> permission. Ask an administrator, or switch persona from the demo panel.</p>
          </div>
          <div slResultStateActions><a slButtonLink routerLink="/dashboard" variant="outline">Back to dashboard</a></div>
        </div>
      </div>
    </div>
  `,
})
export class ForbiddenPage {
  readonly permission = input.required<string>();
}
```

```ts
// src/app/pages/not-found/not-found-page.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlButtonLink } from '@slotted/angular/button';
import { SlPage, SlPageBody } from '@slotted/angular/page';
import { SlResultState, SlResultStateActions, SlResultStateContent, SlResultStateDescription, SlResultStateTitle } from '@slotted/angular/result-state';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, SlButtonLink, SlPage, SlPageBody, SlResultState, SlResultStateActions, SlResultStateContent, SlResultStateDescription, SlResultStateTitle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div slPage><div slPageBody>
      <div slResultState status="empty" reach="page">
        <div slResultStateContent>
          <h1 slResultStateTitle>Page not found</h1>
          <p slResultStateDescription>Nothing lives at this address.</p>
        </div>
        <div slResultStateActions><a slButtonLink routerLink="/dashboard" variant="outline">Back to dashboard</a></div>
      </div>
    </div></div>
  `,
})
export class NotFoundPage {}
```

```ts
// src/app/pages/placeholder/placeholder-page.ts
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SlBreadcrumb, SlBreadcrumbItem, SlBreadcrumbLink, SlBreadcrumbList, SlBreadcrumbPage } from '@slotted/angular/breadcrumb';
import { SlPage, SlPageBody } from '@slotted/angular/page';
import { SlPageHeader, SlPageHeaderBreadcrumbs, SlPageHeaderHeading, SlPageHeaderNav, SlPageHeaderTitle, SlPageHeaderTitleArea, SlPageHeaderTitleRow } from '@slotted/angular/page-header';
import { SlResultState, SlResultStateContent, SlResultStateDescription, SlResultStateTitle } from '@slotted/angular/result-state';
import { destinationFor, moduleFor } from '../../core/nav/nav.model';

@Component({
  selector: 'app-placeholder-page',
  imports: [RouterLink, SlBreadcrumb, SlBreadcrumbItem, SlBreadcrumbLink, SlBreadcrumbList, SlBreadcrumbPage, SlPage, SlPageBody, SlPageHeader, SlPageHeaderBreadcrumbs, SlPageHeaderHeading, SlPageHeaderNav, SlPageHeaderTitle, SlPageHeaderTitleArea, SlPageHeaderTitleRow, SlResultState, SlResultStateContent, SlResultStateDescription, SlResultStateTitle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div slPage>
      <header slPageHeader>
        <div slPageHeaderTitleArea>
          @if (module(); as m) {
            <div slPageHeaderNav>
              <nav slBreadcrumb slPageHeaderBreadcrumbs>
                <ol slBreadcrumbList>
                  <li slBreadcrumbItem><a slBreadcrumbLink [routerLink]="m.path">{{ m.label }}</a></li>
                  <li slBreadcrumbItem><span slBreadcrumbPage>{{ title() }}</span></li>
                </ol>
              </nav>
            </div>
          }
          <div slPageHeaderTitleRow>
            <div slPageHeaderTitle><h1 slPageHeaderHeading>{{ title() }}</h1></div>
          </div>
        </div>
      </header>
      <div slPageBody>
        <div slResultState status="empty" reach="section">
          <div slResultStateContent>
            <h2 slResultStateTitle>{{ creating() ? 'Creation arrives with this module' : 'This area is not built yet' }}</h2>
            <p slResultStateDescription>{{ title() }} is part of the {{ slice() }} slice. The route, its permission and its place in the navigation are already real.</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PlaceholderPage {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  readonly url = computed(() => this.data()['path'] as string);
  readonly title = computed(() => this.data()['title'] as string);
  readonly module = computed(() => moduleFor(this.url()));
  readonly slice = computed(() => this.module()?.slice ?? destinationFor(this.url())?.module.slice ?? 'a later');
  readonly creating = computed(() => this.query().get('new') === '1');
}
```

```ts
// src/app/pages/dashboard/dashboard-page.ts
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SlPage, SlPageBody } from '@slotted/angular/page';
import { SlPageHeader, SlPageHeaderDescription, SlPageHeaderHeading, SlPageHeaderTitle, SlPageHeaderTitleArea, SlPageHeaderTitleRow } from '@slotted/angular/page-header';
import { SlStatCard } from '@slotted/angular/stat-card';
import { SlGrid } from '@slotted/angular/grid';
import { ApprovalsStore } from '../../core/activity/approvals.store';
import { NotificationsStore } from '../../core/activity/notifications.store';
import { TasksStore } from '../../core/activity/tasks.store';
import { ClockService } from '../../core/session/clock.service';
import { SessionStore } from '../../core/session/session.store';

@Component({
  selector: 'app-dashboard-page',
  imports: [SlPage, SlPageBody, SlPageHeader, SlPageHeaderDescription, SlPageHeaderHeading, SlPageHeaderTitle, SlPageHeaderTitleArea, SlPageHeaderTitleRow, SlStatCard, SlGrid],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div slPage>
      <header slPageHeader>
        <div slPageHeaderTitleArea><div slPageHeaderTitleRow><div slPageHeaderTitle>
          <h1 slPageHeaderHeading>Good {{ dayPart() }}, {{ session.user()?.firstName }}</h1>
          <p slPageHeaderDescription>{{ session.session()?.organization?.displayName }} · business date {{ clock.formatDate(clock.now(), { weekday: 'long', month: 'long', day: 'numeric' }) }}</p>
        </div></div></div>
      </header>
      <div slPageBody>
        <div slGrid columns="3" gap="4">
          <div slStatCard label="Pending approvals" [value]="approvals.pending()"></div>
          <div slStatCard label="Open tasks" [value]="tasks.open()"></div>
          <div slStatCard label="Unread notifications" [value]="notifications.unread()"></div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardPage implements OnInit {
  readonly session = inject(SessionStore);
  readonly clock = inject(ClockService);
  readonly approvals = inject(ApprovalsStore);
  readonly tasks = inject(TasksStore);
  readonly notifications = inject(NotificationsStore);

  ngOnInit(): void {
    void Promise.all([this.approvals.refresh(), this.tasks.refresh(), this.notifications.refreshCount()]);
  }

  dayPart(): string {
    const hour = Number(this.clock.formatDate(this.clock.now(), { hour: 'numeric', hour12: false }));
    return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  }
}
```

A API de `slStatCard` (`label`, `value`) é verificada em `node_modules/@slotted/angular/types/slotted-angular-stat-card.d.ts` antes de escrever; se os inputs tiverem outro nome, usar os da declaração e registar a diferença em `LIBRARY-FEEDBACK.md`.

```ts
// src/app/pages/sign-in/sign-in-page.ts
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SlAvatar, SlAvatarFallback } from '@slotted/angular/avatar';
import { SlCard, SlCardBody } from '@slotted/angular/card';
import { DemoStore } from '../../core/demo/demo.store';
import { PreferencesStore } from '../../core/session/preferences.store';
import { SessionStore } from '../../core/session/session.store';
import { BrandMark } from '../../shell/banner/brand-mark';

@Component({
  selector: 'app-sign-in-page',
  imports: [SlAvatar, SlAvatarFallback, SlCard, SlCardBody, BrandMark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: grid; place-items: center; min-height: 100dvh; padding: var(--slotted-space-8); }
    .panel { display: grid; gap: var(--slotted-space-6); inline-size: min(100%, 36rem); }
    .brand { display: flex; align-items: center; gap: var(--slotted-space-3); font-weight: 600; font-size: var(--slotted-font-size-lg); }
    .accounts { display: grid; gap: var(--slotted-space-2); }
    .account { display: flex; align-items: center; gap: var(--slotted-space-3); inline-size: 100%; text-align: start; }
    .account small { color: var(--slotted-text-muted); display: block; }
  `,
  template: `
    <div class="panel">
      <div class="brand"><app-brand-mark size="32" /> Nexora</div>
      <h1>Sign in to Asteron Industrial Supply</h1>
      <p>Accounts on this device</p>
      <div class="accounts">
        @for (p of demo.info()?.personas ?? []; track p.key) {
          <div slCard size="sm">
            <button type="button" class="account" slCardBody [disabled]="!p.active || demo.busy()" (click)="signIn(p.key)">
              <span slAvatar [name]="p.name" size="sm" tone="accent" variant="soft"><span slAvatarFallback></span></span>
              <span>{{ p.name }}<small>{{ p.role }} · {{ p.context }}</small></span>
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class SignInPage implements OnInit {
  readonly demo = inject(DemoStore);
  private readonly session = inject(SessionStore);
  private readonly preferences = inject(PreferencesStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    void this.demo.load();
  }

  async signIn(key: string): Promise<void> {
    await this.demo.setPersona(key);
    if (this.session.status() === 'ready') await this.router.navigateByUrl(this.preferences.preferences().startRoute);
  }
}
```

`BrandMark` é criado na Task 5; nesta tarefa, criar já `src/app/shell/banner/brand-mark.ts`:

```ts
// src/app/shell/banner/brand-mark.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A hexagon with three nodes joined at the centre: a nexus. Inherits `currentColor`. */
@Component({
  selector: 'app-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[style.display]': '"inline-flex"' },
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2.5 20.2 7.25v9.5L12 21.5 3.8 16.75v-9.5z" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <path d="M12 12 12 6.5M12 12l4.8 2.75M12 12l-4.8 2.75" />
      <circle cx="12" cy="6.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="16.8" cy="14.75" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="7.2" cy="14.75" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  `,
})
export class BrandMark {
  readonly size = input<number | string>(24);
}
```

- [ ] **Step 5: Rotas**

```ts
// src/app/app.routes.ts
import type { Routes } from '@angular/router';
import { signedOut, sessionReady } from './core/nav/guards';
import { NAV_MODULES } from './core/nav/nav.model';
import { PermissionGate } from './core/nav/permission-gate';
import { DashboardPage } from './pages/dashboard/dashboard-page';
import { NotFoundPage } from './pages/not-found/not-found-page';
import { PlaceholderPage } from './pages/placeholder/placeholder-page';
import { SignInPage } from './pages/sign-in/sign-in-page';
import { ShellLayout } from './shell/shell-layout';

const strip = (path: string) => path.replace(/^\//, '');

const moduleRoutes: Routes = NAV_MODULES.flatMap((m) => {
  if (m.id === 'home') return [];
  const gate = (path: string, title: string, permissions?: string[]) => ({
    path: strip(path), component: PermissionGate, title,
    data: { permissions: permissions ?? [], page: PlaceholderPage, title, path },
  });
  const children = m.destinations.flatMap((x) => [
    gate(x.path, x.label, x.permissions ?? m.permissions),
    { ...gate(`${x.path}/:id`, x.label, x.permissions ?? m.permissions), path: `${strip(x.path)}/:id` },
  ]);
  if (m.destinations.length === 0) return [gate(m.path, m.label, m.permissions)];
  return [
    { path: strip(m.path), pathMatch: 'full' as const, redirectTo: strip(m.destinations[0]!.path) },
    ...children,
  ];
});

export const routes: Routes = [
  { path: 'sign-in', component: SignInPage, title: 'Sign in', canMatch: [signedOut] },
  {
    path: '', component: ShellLayout, canMatch: [sessionReady],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardPage, title: 'Dashboard' },
      { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications-page').then((m) => m.NotificationsPage), title: 'Notifications' },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile-page').then((m) => m.ProfilePage), title: 'Your profile' },
      { path: 'settings/preferences', loadComponent: () => import('./pages/preferences/preferences-page').then((m) => m.PreferencesPage), title: 'Preferences' },
      ...moduleRoutes,
      { path: '**', component: NotFoundPage, title: 'Not found' },
    ],
  },
];
```

As três páginas `loadComponent` são criadas nas Tasks 6 e 7; até lá, criar ficheiros mínimos exportando um componente vazio com o nome certo, para o build passar.

Em `app.config.ts`: `{ provide: TitleStrategy, useClass: NexoraTitleStrategy }`, `provideRouter(routes, withComponentInputBinding())`. Em `app.html`: `<router-outlet /><sl-toast-region />`; em `app.ts`, `imports: [RouterOutlet, SlToastRegion]`. `ShellLayout` mínimo nesta tarefa:

```ts
// src/app/shell/shell-layout.ts (versão mínima; a Task 4 substitui)
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({ selector: 'app-shell-layout', imports: [RouterOutlet], changeDetection: ChangeDetectionStrategy.OnPush, template: '<router-outlet />' })
export class ShellLayout {}
```

- [ ] **Step 6: Correr e ver passar**

Run: `cd apps/demos/nexora-angular && pnpm test && pnpm build:demo`
Expected: PASS; build sem erros. Se `RouterTestingHarness` não renderizar `PermissionGate` por falta de `sessionReady` na rota de teste, isso é esperado: a rota de teste não tem guarda.

- [ ] **Step 7: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora-angular/src && git add apps/demos/nexora-angular && git commit -m "feat(nexora-angular): modelo de navegação por permissão, rotas de todos os módulos do Apêndice A, PermissionGate em lugar, páginas de espera/403/404, sign-in por persona, título · Nexora"
```

---

### Task 4: `ShellLayout` — app-shell, navegação por permissão, esqueleto, erro, estado da ligação

**Files:**
- Replace: `src/app/shell/shell-layout.ts`, create `src/app/shell/shell-layout.html`, `src/app/shell/shell-layout.css`, `src/app/shell/status/connection-status.ts`, `src/app/core/api/transport-health.ts`
- Test: `src/app/shell/shell-layout.spec.ts`

**Interfaces:**
- Consumes: `SessionStore`, `PreferencesStore`, `ApprovalsStore`, `TasksStore`, `NotificationsStore`, `visibleModules`, `destinationFor`, `moduleFor`, `SECTION_LABELS`.
- Produces:
  - `TransportHealth` (`providedIn: 'root'`): `degraded: Signal<boolean>` — `true` quando `DemoStore.info().latency === 'degraded'` ou quando `reportFailure()` foi chamado nos últimos 60 s
  - `ShellLayout` com `navOpen` persistido em `localStorage` (`nexora:nav-open:<userId>`), `modules: Signal<NavModule[]>`, `current: Signal<string | null>` (id do destino ou do módulo para a rota ativa), `sections`
  - `<app-banner>` é inserido na Task 5; nesta tarefa o banner contém só a marca e o `slAppShellNavToggle`

- [ ] **Step 1: Teste**

```ts
// src/app/shell/shell-layout.spec.ts
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend, signInAs } from '../../test/testing';
import { routes } from '../app.routes';
import { SessionStore } from '../core/session/session.store';

async function persona(key: string): Promise<void> {
  await signInAs(key);
  await TestBed.inject(SessionStore).reload();
}

describe('ShellLayout', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend(), provideRouter(routes)] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
  });

  it('shows Sofia the Sales module and hides Finance overview', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    const nav = harness.fixture.nativeElement.querySelector('nav[data-ui="app-shell"], [data-ui="side-navigation"]') as HTMLElement;
    const text = harness.fixture.nativeElement.textContent as string;
    expect(text).toContain('Sales');
    expect(text).toContain('Approvals');
    expect(text).not.toContain('Reconciliation');
    void nav;
  });

  it('shows Jordan only what a warehouse operator can view', async () => {
    await persona('jordan-wells');
    const harness = await RouterTestingHarness.create('/dashboard');
    const text = harness.fixture.nativeElement.textContent as string;
    expect(text).toContain('Inventory');
    expect(text).not.toContain('Finance');
    expect(text).not.toContain('Settings');
  });

  it('marks the current destination from the url', async () => {
    const harness = await RouterTestingHarness.create('/sales/orders');
    const current = harness.fixture.nativeElement.querySelector('[data-ui="side-navigation"] [aria-current="page"]') as HTMLElement | null;
    expect(current?.textContent).toContain('Orders');
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora-angular && pnpm test`
Expected: FAIL (o layout mínimo não renderiza navegação).

- [ ] **Step 3: Saúde do transporte**

```ts
// src/app/core/api/transport-health.ts
import { computed, inject, Injectable, signal } from '@angular/core';
import { DemoStore } from '../demo/demo.store';

const WINDOW_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class TransportHealth {
  private readonly demo = inject(DemoStore);
  private readonly lastFailure = signal<number | null>(null);
  private readonly tick = signal(0);

  readonly degraded = computed(() => {
    this.tick();
    const last = this.lastFailure();
    return this.demo.info()?.latency === 'degraded' || (last !== null && performance.now() - last < WINDOW_MS);
  });

  reportFailure(): void {
    this.lastFailure.set(performance.now());
    setTimeout(() => this.tick.update((n) => n + 1), WINDOW_MS + 50);
  }
}
```

Os stores chamam `TransportHealth.reportFailure()` quando apanham `isApiError(error, 'SERVICE_UNAVAILABLE')` — em `NotificationsStore`, `ApprovalsStore`, `TasksStore` e `SessionStore.load` (um `catch` que reporta e relança).

```ts
// src/app/shell/status/connection-status.ts
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SlStatusIndicator } from '@slotted/angular/status-indicator';
import { TransportHealth } from '../../core/backend/transport-health';

@Component({
  selector: 'app-connection-status',
  imports: [SlStatusIndicator],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span slStatusIndicator [status]="status()" size="sm" [label]="label()" live="polite">{{ label() }}</span>`,
})
export class ConnectionStatus {
  private readonly health = inject(TransportHealth);
  readonly status = computed(() => (this.health.degraded() ? 'warning' : 'success'));
  readonly label = computed(() => (this.health.degraded() ? 'Degraded' : 'All systems normal'));
}
```

Os valores de `status` (`success` | `warning` …) são os de `StatusIndicatorStatus` em `slotted-angular-status-indicator.d.ts`; ajustar aos literais da declaração.

- [ ] **Step 4: Layout**

```ts
// src/app/shell/shell-layout.ts
import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import {
  SlAppShell, SlAppShellBanner, SlAppShellMain, SlAppShellNav, SlAppShellNavBody, SlAppShellNavFooter, SlAppShellNavHeader, SlAppShellNavToggle,
} from '@slotted/angular/app-shell';
import { SlAvatar, SlAvatarFallback } from '@slotted/angular/avatar';
import { SlButton } from '@slotted/angular/button';
import { SlResultState, SlResultStateActions, SlResultStateContent, SlResultStateDescription, SlResultStateTitle } from '@slotted/angular/result-state';
import {
  SlSideNavigation, SlSideNavigationCount, SlSideNavigationGroup, SlSideNavigationIcon, SlSideNavigationItem, SlSideNavigationLabel,
  SlSideNavigationLink, SlSideNavigationList, SlSideNavigationSection, SlSideNavigationSectionLabel, SlSideNavigationSkeleton, SlSideNavigationTrigger,
} from '@slotted/angular/side-navigation';
import { SlSkeleton, SlSkeletonRegion, SlSkeletonText } from '@slotted/angular/skeleton';
import { filter, map, startWith } from 'rxjs';
import { ApprovalsStore } from '../core/activity/approvals.store';
import { NotificationsStore } from '../core/activity/notifications.store';
import { TasksStore } from '../core/activity/tasks.store';
import { destinationFor, moduleFor, SECTION_LABELS, visibleModules, type NavModule } from '../core/nav/nav.model';
import { SessionStore } from '../core/session/session.store';
import { Banner } from './banner/banner';
import { ConnectionStatus } from './status/connection-status';

type Section = { id: NavModule['section']; label: string | null; modules: NavModule[] };

@Component({
  selector: 'app-shell-layout',
  imports: [
    RouterOutlet, NgIcon, Banner, ConnectionStatus,
    SlAppShell, SlAppShellBanner, SlAppShellMain, SlAppShellNav, SlAppShellNavBody, SlAppShellNavFooter, SlAppShellNavHeader, SlAppShellNavToggle,
    SlAvatar, SlAvatarFallback, SlButton, SlResultState, SlResultStateActions, SlResultStateContent, SlResultStateDescription, SlResultStateTitle,
    SlSideNavigation, SlSideNavigationCount, SlSideNavigationGroup, SlSideNavigationIcon, SlSideNavigationItem, SlSideNavigationLabel,
    SlSideNavigationLink, SlSideNavigationList, SlSideNavigationSection, SlSideNavigationSectionLabel, SlSideNavigationSkeleton, SlSideNavigationTrigger,
    SlSkeleton, SlSkeletonRegion, SlSkeletonText,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell-layout.html',
  styleUrl: './shell-layout.css',
})
export class ShellLayout implements OnInit {
  readonly session = inject(SessionStore);
  readonly approvals = inject(ApprovalsStore);
  readonly tasks = inject(TasksStore);
  readonly notifications = inject(NotificationsStore);
  private readonly router = inject(Router);

  readonly navOpen = signal(this.readNavOpen());
  readonly url = toSignal(this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => this.router.url), startWith(this.router.url)), { initialValue: this.router.url });

  readonly modules = computed(() => {
    void this.session.session();
    return visibleModules((p) => this.session.can(p));
  });
  readonly sections = computed<Section[]>(() =>
    (['home', 'operate', 'insight', 'manage'] as const)
      .map((id) => ({ id, label: SECTION_LABELS[id], modules: this.modules().filter((m) => m.section === id) }))
      .filter((s) => s.modules.length > 0),
  );
  readonly current = computed(() => destinationFor(this.url())?.destination.id ?? moduleFor(this.url())?.id ?? null);
  readonly expanded = computed(() => {
    const m = moduleFor(this.url());
    return m === undefined ? [] : [m.id];
  });
  readonly role = computed(() => this.session.session()?.roles[0]?.name ?? '');
  readonly organization = computed(() => this.session.session()?.organization ?? null);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(this.navKey(), String(this.navOpen()));
      } catch { /* storage unavailable */ }
    });
  }

  ngOnInit(): void {
    if (this.session.status() === 'ready') void Promise.all([this.approvals.refresh(), this.tasks.refresh(), this.notifications.refreshCount()]);
  }

  navigate(request: { value: string | null }): void {
    const target = this.modules().flatMap((m) => [m, ...m.destinations]).find((x) => x.id === request.value);
    if (target !== undefined) void this.router.navigateByUrl(target.path);
  }

  countFor(destination: { count?: 'approvals' | 'support' }): number | null {
    if (destination.count === 'approvals') return this.approvals.pending();
    return null;
  }

  retry(): void {
    void this.session.load();
  }

  private navKey(): string {
    return `nexora:nav-open:${this.session.user()?.id ?? 'anonymous'}`;
  }

  private readNavOpen(): boolean {
    try {
      return localStorage.getItem(this.navKey()) !== 'false';
    } catch {
      return true;
    }
  }
}
```

```html
<!-- src/app/shell/shell-layout.html -->
@switch (session.status()) {
  @case ('error') {
    <div class="shell-error" slResultState status="error" reach="page">
      <div slResultStateContent>
        <h1 slResultStateTitle>Nexora is unavailable</h1>
        <p slResultStateDescription>{{ session.error() }}</p>
      </div>
      <div slResultStateActions><button slButton (click)="retry()">Retry</button></div>
    </div>
  }
  @default {
    <div slAppShell primary="banner" canvas="inset" navMode="auto" collapsedTo="rail" scroll="content" [(navOpen)]="navOpen">
      <header slAppShellBanner>
        <app-banner />
      </header>

      <nav slAppShellNav>
        <div slAppShellNavHeader>
          @if (organization(); as org) {
            <span slAvatar shape="square" size="sm" tone="accent" variant="solid" [name]="org.displayName"><span slAvatarFallback></span></span>
            <span class="org">
              <span class="org-name">{{ org.displayName }}</span>
              <span class="org-role">{{ role() }}</span>
            </span>
          } @else {
            <span slSkeleton shape="square" size="sm"></span>
          }
        </div>
        <div slAppShellNavBody>
          @if (session.status() === 'ready') {
            <div slSideNavigation [value]="current()" [expanded]="expanded()" (valueChangeRequest)="navigate($event)" autoExpand>
              @for (section of sections(); track section.id) {
                <div slSideNavigationSection>
                  @if (section.label) {
                    <div slSideNavigationSectionLabel>{{ section.label }}</div>
                  }
                  <ul slSideNavigationList>
                    @for (m of section.modules; track m.id) {
                      <li slSideNavigationItem [value]="m.id">
                        @if (m.destinations.length === 0) {
                          <a slSideNavigationLink [href]="m.path">
                            <span slSideNavigationIcon><ng-icon [name]="m.icon" size="16" /></span>
                            <span slSideNavigationLabel>{{ m.label }}</span>
                          </a>
                        } @else {
                          <button slSideNavigationTrigger>
                            <span slSideNavigationIcon><ng-icon [name]="m.icon" size="16" /></span>
                            <span slSideNavigationLabel>{{ m.label }}</span>
                          </button>
                          <ul slSideNavigationGroup>
                            @for (x of m.destinations; track x.id) {
                              <li slSideNavigationItem [value]="x.id">
                                <a slSideNavigationLink [href]="x.path">
                                  <span slSideNavigationLabel>{{ x.label }}</span>
                                  @if (countFor(x); as count) {
                                    <span slSideNavigationCount>{{ count }}</span>
                                  }
                                </a>
                              </li>
                            }
                          </ul>
                        }
                      </li>
                    }
                  </ul>
                </div>
              }
            </div>
          } @else {
            <ul slSideNavigationList>
              @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
                <li slSideNavigationSkeleton></li>
              }
            </ul>
          }
        </div>
        <div slAppShellNavFooter>
          <button slAppShellNavToggle></button>
          <app-connection-status />
        </div>
      </nav>

      <main slAppShellMain>
        @if (session.status() === 'ready') {
          <router-outlet />
        } @else {
          <div slSkeletonRegion aria-label="Loading page" class="page-skeleton">
            <span slSkeleton shape="line" size="lg"></span>
            <p slSkeletonText lines="3"></p>
            <p slSkeletonText lines="3"></p>
          </div>
        }
      </main>
    </div>
  }
}
```

Os `a[slSideNavigationLink]` usam `href` e a navegação é feita por `valueChangeRequest` → `router.navigateByUrl` (o clique nativo é prevenido pela família quando há request handler; confirmar no `.d.ts`/docs de `side-navigation`; se a família deixar o clique seguir, trocar `[href]` por `[routerLink]` e importar `RouterLink`). Registar o que foi preciso em `LIBRARY-FEEDBACK.md`.

```css
/* src/app/shell/shell-layout.css */
.org { display: grid; min-inline-size: 0; }
.org-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.org-role { color: var(--slotted-text-muted); font-size: var(--slotted-font-size-sm); }
.shell-error { min-height: 100dvh; }
.page-skeleton { display: grid; gap: var(--slotted-space-4); padding: var(--slotted-space-6); }
```

Antes da Task 5, criar `src/app/shell/banner/banner.ts` mínimo:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SlAppShellNavToggle } from '@slotted/angular/app-shell';
import { BrandMark } from './brand-mark';

@Component({
  selector: 'app-banner',
  imports: [SlAppShellNavToggle, BrandMark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button slAppShellNavToggle></button><app-brand-mark /> Nexora`,
})
export class Banner {}
```

- [ ] **Step 5: Correr e ver passar**

Run: `cd apps/demos/nexora-angular && pnpm test && pnpm build:demo`
Expected: PASS. Os ícones `lucideShoppingCart, lucidePackage, lucideWarehouse, lucideTruck, lucideLandmark, lucideLifeBuoy, lucideChartColumn, lucideWorkflow, lucideActivity, lucideScrollText, lucideSettings, lucideUsers, lucideLayoutDashboard` entram em `provideIcons` em `app.config.ts`.

- [ ] **Step 6: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora-angular/src && git add apps/demos/nexora-angular && git commit -m "feat(nexora-angular): ShellLayout — app-shell com navegação por permissão em side-navigation, destino corrente pela rota, esqueletos, erro de sessão com retry, estado da ligação"
```

---

### Task 5: Banner — `top-navigation`, marca, contexto, contagens, aprovações, tarefas, ajuda

**Files:**
- Replace: `src/app/shell/banner/banner.ts`; create `src/app/shell/banner/banner.html`, `banner.css`, `approvals-popover.ts`, `tasks-popover.ts`, `help-menu.ts`
- Test: `src/app/shell/banner/banner.spec.ts`

**Interfaces:**
- Consumes: `SessionStore`, `ApprovalsStore`, `TasksStore`, `NotificationsStore`, `ClockService`, `BrandMark`, `PreferencesStore`; componentes das Tasks 6–9 (`UserMenu`, `NotificationsPopover`, `CommandPalette`, `DemoDrawer`) — nesta tarefa, os quatro são criados como componentes mínimos com o seletor certo e substituídos depois.
- Produces: `Banner` com `context: Signal<string>` ("Asteron Industrial Supply" ou "Asteron Industrial Supply · CHI-01 Chicago Central"), `ApprovalsPopover`, `TasksPopover`, `HelpMenu`.

- [ ] **Step 1: Teste**

```ts
// src/app/shell/banner/banner.spec.ts
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend, signInAs } from '../../../test/testing';
import { routes } from '../../app.routes';
import { SessionStore } from '../../core/session/session.store';

describe('Banner', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend(), provideRouter(routes)] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
  });

  it('shows the organization and the approvals count', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    await harness.fixture.whenStable();
    const banner = harness.fixture.nativeElement.querySelector('[data-ui="top-navigation"]') as HTMLElement;
    expect(banner.textContent).toContain('Asteron Industrial Supply');
    const approvals = banner.querySelector('[aria-label^="Approvals"]') as HTMLElement;
    expect(approvals.getAttribute('aria-label')).toMatch(/^Approvals, \d+ pending$/);
  });

  it('adds the warehouse to the context for Jordan', async () => {
    await signInAs('jordan-wells');
    await TestBed.inject(SessionStore).reload();
    const harness = await RouterTestingHarness.create('/dashboard');
    const banner = harness.fixture.nativeElement.querySelector('[data-ui="top-navigation"]') as HTMLElement;
    expect(banner.textContent).toContain('CHI-01');
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora-angular && pnpm test`
Expected: FAIL.

- [ ] **Step 3: Banner**

```ts
// src/app/shell/banner/banner.ts
import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { SlAppShellNavToggle } from '@slotted/angular/app-shell';
import { SlKbd } from '@slotted/angular/kbd';
import {
  SlTopNavigation, SlTopNavigationAccount, SlTopNavigationActions, SlTopNavigationBrand, SlTopNavigationContext, SlTopNavigationCount,
  SlTopNavigationHelp, SlTopNavigationHome, SlTopNavigationMark, SlTopNavigationName, SlTopNavigationNotifications, SlTopNavigationSearch,
} from '@slotted/angular/top-navigation';
import { SlAvatar, SlAvatarFallback } from '@slotted/angular/avatar';
import { SlIconButton } from '@slotted/angular/button';
import { SlTooltip, SlTooltipContent, SlTooltipLayer, SlTooltipTrigger } from '@slotted/angular/tooltip';
import { ApprovalsStore } from '../../core/activity/approvals.store';
import { NotificationsStore } from '../../core/activity/notifications.store';
import { TasksStore } from '../../core/activity/tasks.store';
import { PreferencesStore } from '../../core/session/preferences.store';
import { SessionStore } from '../../core/session/session.store';
import { DemoDrawer } from '../demo/demo-drawer';
import { NotificationsPopover } from '../notifications/notifications-popover';
import { CommandPalette } from '../palette/command-palette';
import { UserMenu } from '../user-menu/user-menu';
import { ApprovalsPopover } from './approvals-popover';
import { BrandMark } from './brand-mark';
import { HelpMenu } from './help-menu';
import { TasksPopover } from './tasks-popover';

@Component({
  selector: 'app-banner',
  imports: [
    NgIcon, SlAppShellNavToggle, SlKbd, SlAvatar, SlAvatarFallback, SlIconButton, SlTooltip, SlTooltipContent, SlTooltipLayer, SlTooltipTrigger,
    SlTopNavigation, SlTopNavigationAccount, SlTopNavigationActions, SlTopNavigationBrand, SlTopNavigationContext, SlTopNavigationCount,
    SlTopNavigationHelp, SlTopNavigationHome, SlTopNavigationMark, SlTopNavigationName, SlTopNavigationNotifications, SlTopNavigationSearch,
    BrandMark, ApprovalsPopover, TasksPopover, HelpMenu, UserMenu, NotificationsPopover, CommandPalette, DemoDrawer,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {
  readonly session = inject(SessionStore);
  readonly approvals = inject(ApprovalsStore);
  readonly tasks = inject(TasksStore);
  readonly notifications = inject(NotificationsStore);
  readonly preferences = inject(PreferencesStore);
  readonly palette = viewChild.required(CommandPalette);
  readonly demo = viewChild.required(DemoDrawer);

  readonly context = computed(() => {
    const s = this.session.session();
    if (s === null) return '';
    const scoped = s.warehouses.length > 0 && s.warehouses.length < 5;
    if (!scoped) return s.organization.displayName;
    const first = s.warehouses[0]!;
    const rest = s.warehouses.length - 1;
    return `${s.organization.displayName} · ${first.code} ${first.name}${rest > 0 ? ` +${rest}` : ''}`;
  });
  readonly approvalsLabel = computed(() => `Approvals, ${this.approvals.pending()} pending`);
  readonly tasksLabel = computed(() => `Tasks, ${this.tasks.open()} open`);
  readonly notificationsLabel = computed(() => `Notifications, ${this.notifications.unread()} unread`);
}
```

```html
<!-- src/app/shell/banner/banner.html -->
<header slTopNavigation [landmark]="false">
  <div slTopNavigationBrand>
    <button slAppShellNavToggle></button>
    <a slTopNavigationHome [href]="preferences.preferences().startRoute">
      <span slTopNavigationMark><app-brand-mark /></span>
      <span slTopNavigationName>Nexora</span>
    </a>
    <span slTopNavigationContext>{{ context() }}</span>
  </div>

  <div slTopNavigationSearch>
    <button type="button" class="search-trigger" [slCommandPaletteTrigger]="palette().palette()" aria-label="Search or jump to…">
      <ng-icon name="lucideSearch" size="16" />
      <span class="search-placeholder">Search or jump to…</span>
      <kbd slShortcut keys="mod+k" size="sm" variant="soft"></kbd>
    </button>
  </div>

  <div slTopNavigationActions>
    <app-approvals-popover [label]="approvalsLabel()" />
    <app-tasks-popover [label]="tasksLabel()" />
    <app-notifications-popover [label]="notificationsLabel()" />
    <app-help-menu />
    <ng-container slTooltip>
      <button slIconButton slTooltipTrigger size="sm" tone="secondary" variant="ghost" aria-label="Demo controls" (click)="demo().open.set(true)">
        <ng-icon name="lucideFlaskConical" size="16" />
      </button>
      <ng-template slTooltipLayer><div slTooltipContent>Demo controls</div></ng-template>
    </ng-container>
    <app-user-menu />
  </div>
</header>

<app-command-palette />
<app-demo-drawer />
```

`slCommandPaletteTrigger` importado de `@slotted/angular/command-palette` (acrescentar ao `imports`). `CommandPalette` (Task 8) expõe `palette = viewChild.required(SlCommandPalette)`; `DemoDrawer` (Task 9) expõe `open = signal(false)`. Nesta tarefa os componentes mínimos já têm essas duas superfícies.

```css
/* src/app/shell/banner/banner.css */
.search-trigger {
  display: inline-flex; align-items: center; gap: var(--slotted-space-2); inline-size: 100%; min-inline-size: 16rem;
  padding-block: var(--slotted-space-1); padding-inline: var(--slotted-space-3);
  border: var(--slotted-border-width-thin) solid var(--slotted-border-subtle); border-radius: var(--slotted-radius-md);
  background: var(--slotted-surface-sunken, transparent); color: var(--slotted-text-muted); font: inherit; cursor: pointer;
}
.search-trigger:focus-visible { outline: 2px solid var(--slotted-focus-ring-color); outline-offset: 2px; }
.search-placeholder { flex: 1; text-align: start; }
```

Os tokens `--slotted-surface-sunken`, `--slotted-border-subtle`, `--slotted-focus-ring-color` são confirmados em `node_modules/@slotted/theme-default/styles.css`; um nome ausente é substituído pelo que o tema define e registado em `LIBRARY-FEEDBACK.md`.

- [ ] **Step 4: Popovers de aprovações e tarefas, menu de ajuda**

```ts
// src/app/shell/banner/approvals-popover.ts
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { SlButtonLink, SlIconButton } from '@slotted/angular/button';
import { SlList } from '@slotted/angular/list';
import { SlListItem, SlListItemBody, SlListItemContent, SlListItemDescription, SlListItemEnd, SlListItemLabel } from '@slotted/angular/list-item';
import { SlPopover, SlPopoverBody, SlPopoverContent, SlPopoverFooter, SlPopoverHeader, SlPopoverLayer, SlPopoverTitle, SlPopoverTrigger } from '@slotted/angular/popover';
import { SlTopNavigationCount } from '@slotted/angular/top-navigation';
import { ApprovalsStore } from '../../core/activity/approvals.store';
import { ClockService } from '../../core/session/clock.service';

@Component({
  selector: 'app-approvals-popover',
  imports: [RouterLink, NgIcon, SlButtonLink, SlIconButton, SlList, SlListItem, SlListItemBody, SlListItemContent, SlListItemDescription, SlListItemEnd, SlListItemLabel, SlPopover, SlPopoverBody, SlPopoverContent, SlPopoverFooter, SlPopoverHeader, SlPopoverLayer, SlPopoverTitle, SlPopoverTrigger, SlTopNavigationCount],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container slPopover side="bottom" align="end" (openChangeRequest)="$event.value && store.load()">
      <button slIconButton slPopoverTrigger size="sm" tone="secondary" variant="ghost" [attr.aria-label]="label()">
        <ng-icon name="lucideClipboardCheck" size="16" />
        @if (store.pending() > 0) { <span slTopNavigationCount>{{ store.pending() }}</span> }
      </button>
      <ng-template slPopoverLayer>
        <div slPopoverContent style="--slotted-popover-measure: 26rem">
          <div slPopoverHeader><div slPopoverTitle>Approvals</div></div>
          <div slPopoverBody>
            @if (store.items().length === 0) {
              <p class="empty">Nothing waiting for you.</p>
            } @else {
              <ul slList>
                @for (a of store.items().slice(0, 6); track a.id) {
                  <li slListItem size="sm">
                    <div slListItemContent>
                      <div slListItemBody>
                        <span slListItemLabel>{{ a.targetNumber }} · {{ a.targetLabel }}</span>
                        <span slListItemDescription>{{ a.amount ? (a.amount.amount | currency: a.amount.currency) + ' · ' : '' }}{{ a.reasons.join(', ') }} · {{ clock.relative(a.metadata.createdAt) }}</span>
                      </div>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>
          <div slPopoverFooter><a slButtonLink routerLink="/sales/approvals" size="sm" variant="ghost">Open approval queue</a></div>
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class ApprovalsPopover {
  readonly label = input.required<string>();
  readonly store = inject(ApprovalsStore);
  readonly clock = inject(ClockService);
}
```

(`CurrencyPipe` de `@angular/common` no `imports`.) `TasksPopover` é o mesmo componente com `TasksStore`, ícone `lucideListTodo`, título "Tasks", cada linha `t.title` e `Due {{ t.dueDate }}` com `tone="danger"` quando `t.dueDate < clock.businessDate()`, e rodapé sem link (as tarefas não têm página nesta fatia).

```ts
// src/app/shell/banner/help-menu.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SlMenu, SlMenuItem, SlMenuSeparator, SlMenuTrigger } from '@slotted/angular/menu';
import { SlTopNavigationHelp } from '@slotted/angular/top-navigation';
import { ShortcutsService } from '../../core/shortcuts/shortcuts.service';

@Component({
  selector: 'app-help-menu',
  imports: [SlMenu, SlMenuItem, SlMenuSeparator, SlMenuTrigger, SlTopNavigationHelp],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button slTopNavigationHelp [slMenuTriggerFor]="menu" aria-label="Help"></button>
    <sl-menu #menu align="end">
      <button slMenuItem shortcut="?" (select)="shortcuts.openDialog()">Keyboard shortcuts</button>
      <a slMenuItem href="https://github.com/slotted" target="_blank" rel="noreferrer">Documentation</a>
      <button slMenuItem [disabled]="true">What's new</button>
      <hr slMenuSeparator />
      <a slMenuItem href="mailto:support@nexora.example">Contact support</a>
    </sl-menu>
  `,
})
export class HelpMenu {
  readonly shortcuts = inject(ShortcutsService);
}
```

`ShortcutsService` (Task 10) — nesta tarefa criar `src/app/core/shortcuts/shortcuts.service.ts` com `dialogOpen = signal(false)` e `openDialog() { this.dialogOpen.set(true); }`.

Componentes mínimos para as Tasks 6–9 (substituídos depois): `UserMenu` (`selector: 'app-user-menu'`, template `<button slTopNavigationAccount aria-label="Account"><span slAvatar size="xs" [name]="session.user()?.displayName"><span slAvatarFallback></span></span></button>`), `NotificationsPopover` (`input label`, botão `slTopNavigationNotifications` com contagem), `CommandPalette` (`<sl-command-palette #p [items]="[]" hotkey="mod+k" />` e `palette = viewChild.required(SlCommandPalette)`), `DemoDrawer` (`open = signal(false)`, `<sl-drawer [(open)]="open" side="end">…</sl-drawer>`).

- [ ] **Step 5: Correr e ver passar**

Run: `cd apps/demos/nexora-angular && pnpm test && pnpm build:demo`
Expected: PASS. Ícones novos em `provideIcons`: `lucideSearch, lucideClipboardCheck, lucideListTodo, lucideFlaskConical`.

- [ ] **Step 6: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora-angular/src && git add apps/demos/nexora-angular && git commit -m "feat(nexora-angular): banner em top-navigation — marca Nexora, contexto da organização e do armazém, gatilho de pesquisa, popovers de aprovações e tarefas com contagens, menu de ajuda, botão do painel de demonstração"
```

---

### Task 6: Menu de utilizador, perfil, preferências

**Files:**
- Replace: `src/app/shell/user-menu/user-menu.ts`; create `src/app/core/nav/permission-area.ts`, `src/app/pages/profile/profile-page.ts`, `src/app/pages/preferences/preferences-page.ts`
- Test: `src/app/shell/user-menu/user-menu.spec.ts`

**Interfaces:**
- Consumes: `SessionStore`, `PreferencesStore`, `DemoStore`, `ShortcutsService`, `Router`, `SlToastService`, `permissionArea`.
- Produces: `UserMenu`, `ProfilePage`, `PreferencesPage`.

- [ ] **Step 1: Teste**

```ts
// src/app/shell/user-menu/user-menu.spec.ts
import { ApplicationInitStatus, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { routes } from '../../app.routes';
import { PreferencesStore } from '../../core/session/preferences.store';

describe('UserMenu', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend(), provideRouter(routes)] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
  });

  it('opens with the signed-in user and switches the scheme', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    const account = harness.fixture.nativeElement.querySelector('[data-ui="top-navigation"] [data-part="account"]') as HTMLButtonElement;
    account.click();
    await harness.fixture.whenStable();
    const menu = TestBed.inject(DOCUMENT).querySelector('[data-ui="menu"]') as HTMLElement;
    expect(menu.textContent).toContain('Sofia Ramirez');
    expect(menu.textContent).toContain('Sales Manager');
    const dark = [...menu.querySelectorAll('[role="menuitemradio"]')].find((el) => el.textContent?.includes('Dark')) as HTMLElement;
    dark.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(PreferencesStore).preferences().scheme).toBe('dark');
    expect(TestBed.inject(DOCUMENT).documentElement.getAttribute('data-slotted-scheme')).toBe('dark');
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora-angular && pnpm test`
Expected: FAIL (o menu mínimo não tem itens).

- [ ] **Step 3: Menu**

```ts
// src/app/shell/user-menu/user-menu.ts
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SlAvatar, SlAvatarFallback } from '@slotted/angular/avatar';
import { SlMenu, SlMenuGroup, SlMenuItem, SlMenuRadioGroup, SlMenuSeparator, SlMenuTrigger } from '@slotted/angular/menu';
import { SlTopNavigationAccount } from '@slotted/angular/top-navigation';
import { DemoStore } from '../../core/demo/demo.store';
import { PreferencesStore } from '../../core/session/preferences.store';
import { SessionStore } from '../../core/session/session.store';
import { ShortcutsService } from '../../core/shortcuts/shortcuts.service';

@Component({
  selector: 'app-user-menu',
  imports: [SlAvatar, SlAvatarFallback, SlMenu, SlMenuGroup, SlMenuItem, SlMenuRadioGroup, SlMenuSeparator, SlMenuTrigger, SlTopNavigationAccount],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .identity { display: grid; grid-template-columns: auto 1fr; gap: var(--slotted-space-3); padding: var(--slotted-space-3); align-items: center; }
    .identity small { display: block; color: var(--slotted-text-muted); }
  `,
  template: `
    <button slTopNavigationAccount [slMenuTriggerFor]="menu" aria-label="Account">
      <span slAvatar size="xs" tone="accent" variant="soft" [name]="user()?.displayName"><span slAvatarFallback></span></span>
    </button>
    <sl-menu #menu align="end" size="md">
      <div class="identity" role="presentation">
        <span slAvatar size="md" tone="accent" variant="soft" [name]="user()?.displayName"><span slAvatarFallback></span></span>
        <span><strong>{{ user()?.displayName }}</strong><small>{{ user()?.email }}</small><small>{{ roleLine() }}</small></span>
      </div>
      <hr slMenuSeparator />
      <a slMenuItem href="/profile" (select)="go('/profile')">Your profile</a>
      <a slMenuItem href="/settings/preferences" (select)="go('/settings/preferences')">Preferences</a>
      <hr slMenuSeparator />
      <sl-menu-group label="Appearance">
        <sl-menu-radio-group [value]="preferences.preferences().scheme" (valueChangeRequest)="setScheme($event.value)">
          <button slMenuRadioItem value="light" [closeOnSelect]="false">Light</button>
          <button slMenuRadioItem value="dark" [closeOnSelect]="false">Dark</button>
          <button slMenuRadioItem value="system" [closeOnSelect]="false">System</button>
        </sl-menu-radio-group>
      </sl-menu-group>
      <sl-menu-group label="Density">
        <sl-menu-radio-group [value]="preferences.preferences().density" (valueChangeRequest)="setDensity($event.value)">
          <button slMenuRadioItem value="comfortable" [closeOnSelect]="false">Comfortable</button>
          <button slMenuRadioItem value="compact" [closeOnSelect]="false">Compact</button>
          <button slMenuRadioItem value="dense" [closeOnSelect]="false">Dense</button>
        </sl-menu-radio-group>
      </sl-menu-group>
      <hr slMenuSeparator />
      <button slMenuItem shortcut="?" (select)="shortcuts.openDialog()">Keyboard shortcuts</button>
      <hr slMenuSeparator />
      <button slMenuItem tone="danger" (select)="signOut()">Sign out</button>
    </sl-menu>
  `,
})
export class UserMenu {
  readonly session = inject(SessionStore);
  readonly preferences = inject(PreferencesStore);
  readonly shortcuts = inject(ShortcutsService);
  private readonly demo = inject(DemoStore);
  private readonly router = inject(Router);

  readonly user = this.session.user;
  readonly roleLine = computed(() => {
    const s = this.session.session();
    if (s === null) return '';
    return [s.roles[0]?.name, s.teams[0]?.name].filter(Boolean).join(' · ');
  });

  go(url: string): void {
    void this.router.navigateByUrl(url);
  }

  setScheme(value: string): void {
    void this.preferences.update({ scheme: value as 'light' | 'dark' | 'system' });
  }

  setDensity(value: string): void {
    void this.preferences.update({ density: value as 'comfortable' | 'compact' | 'dense' });
  }

  async signOut(): Promise<void> {
    await this.demo.signOut();
    await this.router.navigateByUrl('/sign-in');
  }
}
```

`signOut` só limpa o estado do cliente (§2 do spec); o backend continua com a persona, e o sign-in escolhe outra por `demo.setPersona`.

Os `a[slMenuItem]` com `href` e `(select)` navegam pelo router: se a família seguir o `href` nativamente antes do `select`, remover o `href` e manter só `(select)`; registar em `LIBRARY-FEEDBACK.md`.

- [ ] **Step 4: Perfil e preferências**

```ts
// src/app/core/nav/permission-area.ts
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
};

/** The §55.4 area of a permission key, by its prefix; anything unlisted is administration. */
export function permissionArea(permission: string): PermissionArea {
  return AREA_BY_PREFIX[permission.split('.')[0] ?? ''] ?? 'administration';
}
```

```ts
// src/app/pages/profile/profile-page.ts
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { permissionArea, type PermissionArea } from '../../core/nav/permission-area';
import { SlAvatar, SlAvatarFallback } from '@slotted/angular/avatar';
import { SlBadge } from '@slotted/angular/badge';
import { SlDescriptionList, SlDescriptionListDescription, SlDescriptionListItem, SlDescriptionListTerm } from '@slotted/angular/description-list';
import { SlPage, SlPageBody } from '@slotted/angular/page';
import { SlPageHeader, SlPageHeaderDescription, SlPageHeaderHeading, SlPageHeaderMarks, SlPageHeaderTitle, SlPageHeaderTitleArea, SlPageHeaderTitleRow, SlPageHeaderVisual } from '@slotted/angular/page-header';
import { SlSection } from '@slotted/angular/section';
import { ClockService } from '../../core/session/clock.service';
import { SessionStore } from '../../core/session/session.store';

const AREA_LABELS: Record<PermissionArea, string> = {
  identity: 'Organization & identity', crm: 'CRM', catalog: 'Catalog', sales: 'Sales', inventory: 'Inventory & fulfillment',
  procurement: 'Procurement', finance: 'Finance', support: 'Support', administration: 'Workflow & administration',
};

@Component({
  selector: 'app-profile-page',
  imports: [SlAvatar, SlAvatarFallback, SlBadge, SlDescriptionList, SlDescriptionListDescription, SlDescriptionListItem, SlDescriptionListTerm, SlPage, SlPageBody, SlPageHeader, SlPageHeaderDescription, SlPageHeaderHeading, SlPageHeaderMarks, SlPageHeaderTitle, SlPageHeaderTitleArea, SlPageHeaderTitleRow, SlPageHeaderVisual, SlSection],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `.permissions { display: flex; flex-wrap: wrap; gap: var(--slotted-space-1); }`,
  template: `
    @if (session.session(); as s) {
      <div slPage>
        <header slPageHeader>
          <div slPageHeaderTitleArea><div slPageHeaderTitleRow>
            <div slPageHeaderVisual><span slAvatar size="lg" tone="accent" variant="soft" [name]="s.user.displayName"><span slAvatarFallback></span></span></div>
            <div slPageHeaderTitle>
              <h1 slPageHeaderHeading>{{ s.user.displayName }}</h1>
              <p slPageHeaderDescription>{{ s.user.title }} · {{ s.user.department }}</p>
              <div slPageHeaderMarks>
                @for (r of s.roles; track r.id) { <span slBadge tone="accent" variant="soft" size="sm">{{ r.name }}</span> }
                @for (t of s.teams; track t.id) { <span slBadge tone="secondary" variant="soft" size="sm">{{ t.name }}</span> }
              </div>
            </div>
          </div></div>
        </header>
        <div slPageBody>
          <section slSection heading="Account">
            <dl slDescriptionList columns="2">
              <div slDescriptionListItem><dt slDescriptionListTerm>Email</dt><dd slDescriptionListDescription copy>{{ s.user.email }}</dd></div>
              <div slDescriptionListItem><dt slDescriptionListTerm>Manager</dt><dd slDescriptionListDescription>{{ manager() }}</dd></div>
              <div slDescriptionListItem><dt slDescriptionListTerm>Timezone</dt><dd slDescriptionListDescription>{{ s.user.timezone }}</dd></div>
              <div slDescriptionListItem><dt slDescriptionListTerm>Last active</dt><dd slDescriptionListDescription>{{ s.user.lastActiveAt ? clock.relative(s.user.lastActiveAt) : '—' }}</dd></div>
              <div slDescriptionListItem><dt slDescriptionListTerm>Warehouses</dt><dd slDescriptionListDescription>{{ warehouses() }}</dd></div>
            </dl>
          </section>
          <section slSection heading="Effective permissions">
            @for (group of grouped(); track group.area) {
              <h3>{{ group.label }}</h3>
              <div class="permissions">
                @for (p of group.permissions; track p) { <span slBadge tone="secondary" variant="outline" size="sm"><code>{{ p }}</code></span> }
              </div>
            }
          </section>
        </div>
      </div>
    }
  `,
})
export class ProfilePage {
  readonly session = inject(SessionStore);
  readonly clock = inject(ClockService);
  readonly manager = computed(() => this.session.session()?.user.managerId ?? '—');
  readonly warehouses = computed(() => (this.session.session()?.warehouses ?? []).map((w) => `${w.code} ${w.name}`).join(', ') || 'None');
  readonly grouped = computed(() => {
    const byArea = new Map<PermissionArea, string[]>();
    for (const p of this.session.session()?.permissions ?? []) (byArea.get(permissionArea(p)) ?? byArea.set(permissionArea(p), []).get(permissionArea(p))!).push(p);
    return [...byArea.entries()].map(([area, permissions]) => ({ area, label: AREA_LABELS[area], permissions: permissions.sort() }));
  });
}
```

`SlSection` com `heading`: confirmar o input em `slotted-angular-section.d.ts`; `manager` mostra o nome quando o Dashboard/`SessionStore` ainda não expõe utilizadores — nesta fatia é o id (`usr_…`); registar em `LIBRARY-FEEDBACK.md` não se aplica (é do produto): anotar no `README.md` da app como pendente do módulo Identity.

```ts
// src/app/pages/preferences/preferences-page.ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { UserPreferences } from '../../core/session/preferences.store';
import { SlButton } from '@slotted/angular/button';
import { SlCheckbox } from '@slotted/angular/checkbox';
import { SlField, SlFieldDescription, SlFieldLabel } from '@slotted/angular/field';
import { SlForm } from '@slotted/angular/form';
import { SlPage, SlPageBody, SlPageFooter } from '@slotted/angular/page';
import { SlPageHeader, SlPageHeaderDescription, SlPageHeaderHeading, SlPageHeaderTitle, SlPageHeaderTitleArea, SlPageHeaderTitleRow } from '@slotted/angular/page-header';
import { SlRadioGroup, SlRadio } from '@slotted/angular/radio-group';
import { SlSelect, SlSelectItem } from '@slotted/angular/select';
import { SlToastService } from '@slotted/angular/toast';
import { visibleModules } from '../../core/nav/nav.model';
import { PreferencesStore } from '../../core/session/preferences.store';
import { SessionStore } from '../../core/session/session.store';

@Component({
  selector: 'app-preferences-page',
  imports: [FormsModule, SlButton, SlCheckbox, SlField, SlFieldDescription, SlFieldLabel, SlForm, SlPage, SlPageBody, SlPageFooter, SlPageHeader, SlPageHeaderDescription, SlPageHeaderHeading, SlPageHeaderTitle, SlPageHeaderTitleArea, SlPageHeaderTitleRow, SlRadioGroup, SlRadio, SlSelect, SlSelectItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div slPage>
      <header slPageHeader>
        <div slPageHeaderTitleArea><div slPageHeaderTitleRow><div slPageHeaderTitle>
          <h1 slPageHeaderHeading>Preferences</h1>
          <p slPageHeaderDescription>How Nexora looks and what it tells you. Saved to your account.</p>
        </div></div></div>
      </header>
      <div slPageBody>
        <form slForm (ngSubmit)="save()">
          <div slField>
            <span slFieldLabel>Appearance</span>
            <div slRadioGroup [(value)]="draft().scheme" aria-label="Appearance">
              <label slRadio value="light">Light</label><label slRadio value="dark">Dark</label><label slRadio value="system">System</label>
            </div>
          </div>
          <div slField>
            <span slFieldLabel>Density</span>
            <div slRadioGroup [(value)]="draft().density" aria-label="Density">
              <label slRadio value="comfortable">Comfortable</label><label slRadio value="compact">Compact</label><label slRadio value="dense">Dense</label>
            </div>
          </div>
          <div slField>
            <label slFieldLabel for="start">Start page</label>
            <sl-select id="start" [(value)]="draft().startRoute">
              @for (m of startPages(); track m.path) { <sl-select-item [value]="m.path">{{ m.label }}</sl-select-item> }
            </sl-select>
            <span slFieldDescription>Where Nexora opens after sign-in.</span>
          </div>
          <div slField>
            <span slFieldLabel>Notifications</span>
            <label slCheckbox [(checked)]="draft().notifications.emailApprovals">Email me approval requests</label>
            <label slCheckbox [(checked)]="draft().notifications.emailMentions">Email me mentions</label>
            <label slCheckbox [(checked)]="draft().notifications.inAppOperationalAlerts">In-app operational alerts</label>
            <label slCheckbox [checked]="true" disabled>In-app approvals (always on)</label>
            <label slCheckbox [checked]="true" disabled>In-app mentions (always on)</label>
          </div>
        </form>
      </div>
      <footer slPageFooter [open]="dirty()">
        <button slButton variant="ghost" tone="secondary" (click)="reset()">Discard</button>
        <button slButton tone="accent" (click)="save()">Save preferences</button>
      </footer>
    </div>
  `,
})
export class PreferencesPage {
  private readonly preferences = inject(PreferencesStore);
  private readonly session = inject(SessionStore);
  private readonly toasts = inject(SlToastService);
  readonly draft = signal<UserPreferences>(structuredClone(this.preferences.preferences()));
  readonly dirty = computed(() => JSON.stringify(this.draft()) !== JSON.stringify(this.preferences.preferences()));
  readonly startPages = computed(() => visibleModules((p) => this.session.can(p)).map((m) => ({ path: m.destinations[0]?.path ?? m.path, label: m.label })));

  reset(): void {
    this.draft.set(structuredClone(this.preferences.preferences()));
  }

  save(): void {
    this.preferences.update(this.draft());
    this.toasts.show({ title: 'Preferences saved', tone: 'success' });
  }
}
```

As ligações `[(value)]="draft().scheme"` num signal de objeto não são válidas em Angular: escrever cada campo como `[value]="draft().scheme" (valueChangeRequest)="patch({ scheme: $event.value })"` (e o mesmo para os checkboxes com `(checkedChange)`), com `patch(p: Partial<UserPreferences>) { this.draft.update((d) => ({ ...d, ...p })); }` e `patchNotifications(...)`. Os seletores `slRadioGroup`/`slRadio`/`slCheckbox`/`slField` e os nomes dos outputs são confirmados nos `.d.ts` das famílias `radio-group`, `checkbox`, `field` antes de escrever.

- [ ] **Step 5: Correr e ver passar**

Run: `cd apps/demos/nexora-angular && pnpm test && pnpm build:demo`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora-angular/src && git add apps/demos/nexora-angular && git commit -m "feat(nexora-angular): menu de utilizador (identidade, aparência e densidade por radio group, atalhos, sign out), página de perfil com permissões efetivas, página de preferências persistida"
```

---

### Task 7: Notificações — popover e página

**Files:**
- Replace: `src/app/shell/notifications/notifications-popover.ts`; create `src/app/shell/notifications/notification-row.ts`, `src/app/pages/notifications/notifications-page.ts`
- Test: `src/app/shell/notifications/notifications-popover.spec.ts`

**Interfaces:**
- Consumes: `NotificationsStore`, `ClockService`, `Router`.
- Produces: `NotificationRow` (`input notification`, outputs `read`, `archive`, `open`), `NotificationsPopover`, `NotificationsPage`.

- [ ] **Step 1: Teste**

```ts
// src/app/shell/notifications/notifications-popover.spec.ts
import { ApplicationInitStatus, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { routes } from '../../app.routes';
import { NotificationsStore } from '../../core/activity/notifications.store';

describe('NotificationsPopover', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend(), provideRouter(routes)] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
  });

  it('lists notifications and marks one read from the row action', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    await harness.fixture.whenStable();
    const store = TestBed.inject(NotificationsStore);
    const before = store.unread();
    const bell = harness.fixture.nativeElement.querySelector('[data-ui="top-navigation"] [data-part="notifications"]') as HTMLButtonElement;
    bell.click();
    await harness.fixture.whenStable();
    const doc = TestBed.inject(DOCUMENT);
    const popover = doc.querySelector('[data-ui="popover"]') as HTMLElement;
    expect(popover.textContent).toContain('Notifications');
    const markRead = popover.querySelector('button[aria-label^="Mark as read"]') as HTMLButtonElement;
    markRead.click();
    await harness.fixture.whenStable();
    expect(store.unread()).toBe(before - 1);
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora-angular && pnpm test`
Expected: FAIL.

- [ ] **Step 3: Linha, popover, página**

```ts
// src/app/shell/notifications/notification-row.ts
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import type { Notification, NotificationType } from '@slotted/demo-nexora-operations';
import { SlIconButton } from '@slotted/angular/button';
import { SlListItem, SlListItemActions, SlListItemBody, SlListItemContent, SlListItemDescription, SlListItemLabel, SlListItemStart } from '@slotted/angular/list-item';
import { ClockService } from '../../core/session/clock.service';

const ICON: Record<NotificationType, string> = { info: 'lucideInfo', success: 'lucideCircleCheck', warning: 'lucideTriangleAlert', action_required: 'lucideCircleAlert' };
const TONE: Record<NotificationType, string> = { info: 'secondary', success: 'success', warning: 'warning', action_required: 'danger' };

@Component({
  selector: 'li[app-notification-row]',
  imports: [NgIcon, SlIconButton, SlListItemActions, SlListItemBody, SlListItemContent, SlListItemDescription, SlListItemLabel, SlListItemStart],
  hostDirectives: [{ directive: SlListItem, inputs: ['size', 'tone'] }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-unread]': 'unread() ? "" : null' },
  styles: `
    .glyph { display: inline-grid; place-items: center; inline-size: 2rem; block-size: 2rem; border-radius: var(--slotted-radius-full); background: var(--slotted-tone-secondary-surface); }
    .glyph[data-tone='success'] { background: var(--slotted-tone-success-surface); color: var(--slotted-tone-success-text); }
    .glyph[data-tone='warning'] { background: var(--slotted-tone-warning-surface); color: var(--slotted-tone-warning-text); }
    .glyph[data-tone='danger'] { background: var(--slotted-tone-danger-surface); color: var(--slotted-tone-danger-text); }
    .title { font-weight: 500; text-align: start; background: none; border: 0; padding: 0; color: inherit; font: inherit; cursor: pointer; }
    :host([data-unread]) .title::after { content: ''; display: inline-block; inline-size: 0.5rem; block-size: 0.5rem; margin-inline-start: var(--slotted-space-2); border-radius: 50%; background: var(--slotted-tone-accent-solid); }
  `,
  template: `
    <div slListItemContent>
      <span slListItemStart><span class="glyph" [attr.data-tone]="tone()"><ng-icon [name]="icon()" size="16" /></span></span>
      <div slListItemBody>
        <button type="button" class="title" slListItemLabel (click)="open.emit(notification())">{{ notification().title }}</button>
        <span slListItemDescription>{{ notification().body }} · {{ clock.relative(notification().createdAt) }}</span>
      </div>
      <div slListItemActions>
        @if (unread()) {
          <button slIconButton size="xs" tone="secondary" variant="ghost" [attr.aria-label]="'Mark as read: ' + notification().title" (click)="read.emit(notification().id)"><ng-icon name="lucideCheck" size="14" /></button>
        }
        @if (!notification().archivedAt) {
          <button slIconButton size="xs" tone="secondary" variant="ghost" [attr.aria-label]="'Archive: ' + notification().title" (click)="archive.emit(notification().id)"><ng-icon name="lucideArchive" size="14" /></button>
        }
      </div>
    </div>
  `,
})
export class NotificationRow {
  readonly notification = input.required<Notification>();
  readonly read = output<string>();
  readonly archive = output<string>();
  readonly open = output<Notification>();
  readonly clock = inject(ClockService);
  readonly unread = computed(() => this.notification().readAt === undefined);
  readonly icon = computed(() => ICON[this.notification().type]);
  readonly tone = computed(() => TONE[this.notification().type]);
}
```

```ts
// src/app/shell/notifications/notifications-popover.ts
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { Notification } from '@slotted/demo-nexora-operations';
import { SlButton, SlButtonLink } from '@slotted/angular/button';
import { SlList, SlListSection, SlListSectionLabel, SlListSectionList } from '@slotted/angular/list';
import { SlPopover, SlPopoverBody, SlPopoverContent, SlPopoverFooter, SlPopoverHeader, SlPopoverLayer, SlPopoverTitle, SlPopoverTrigger } from '@slotted/angular/popover';
import { SlTopNavigationCount, SlTopNavigationNotifications } from '@slotted/angular/top-navigation';
import { NotificationsStore } from '../../core/activity/notifications.store';
import { ClockService } from '../../core/session/clock.service';
import { NotificationRow } from './notification-row';

@Component({
  selector: 'app-notifications-popover',
  imports: [RouterLink, SlButton, SlButtonLink, SlList, SlListSection, SlListSectionLabel, SlListSectionList, SlPopover, SlPopoverBody, SlPopoverContent, SlPopoverFooter, SlPopoverHeader, SlPopoverLayer, SlPopoverTitle, SlPopoverTrigger, SlTopNavigationCount, SlTopNavigationNotifications, NotificationRow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `.empty { padding: var(--slotted-space-6); text-align: center; color: var(--slotted-text-muted); }`,
  template: `
    <ng-container slPopover side="bottom" align="end" [(open)]="open" (openChangeRequest)="$event.value && load()">
      <button slTopNavigationNotifications slPopoverTrigger [attr.aria-label]="label()">
        @if (store.unread() > 0) { <span slTopNavigationCount>{{ store.unread() }}</span> }
      </button>
      <ng-template slPopoverLayer>
        <div slPopoverContent style="--slotted-popover-measure: 25rem">
          <div slPopoverHeader>
            <div slPopoverTitle>Notifications @if (store.unread() > 0) { <span>({{ store.unread() }})</span> }</div>
            <button slButton size="xs" variant="ghost" tone="secondary" [disabled]="store.unread() === 0" (click)="store.markAllRead()">Mark all as read</button>
          </div>
          <div slPopoverBody>
            @if (store.items().length === 0) {
              <p class="empty">You're all caught up.</p>
            } @else {
              <ul slList>
                @for (group of groups(); track group.label) {
                  <li slListSection>
                    <span slListSectionLabel>{{ group.label }}</span>
                    <ul slListSectionList>
                      @for (n of group.items; track n.id) {
                        <li app-notification-row size="sm" [notification]="n" (read)="store.markRead($event)" (archive)="store.archive($event)" (open)="openNotification($event)"></li>
                      }
                    </ul>
                  </li>
                }
              </ul>
            }
          </div>
          <div slPopoverFooter><a slButtonLink routerLink="/notifications" size="sm" variant="ghost" (click)="open.set(false)">View all</a></div>
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class NotificationsPopover {
  readonly label = input.required<string>();
  readonly store = inject(NotificationsStore);
  readonly clock = inject(ClockService);
  private readonly router = inject(Router);
  readonly open = signal(false);
  readonly groups = computed(() => {
    const items = this.store.items().slice(0, 10);
    const today = items.filter((n) => this.clock.isToday(n.createdAt));
    const earlier = items.filter((n) => !this.clock.isToday(n.createdAt));
    return [{ label: 'Today', items: today }, { label: 'Earlier', items: earlier }].filter((g) => g.items.length > 0);
  });

  load(): void {
    this.store.view.set('all');
    void this.store.loadPage(1, 25);
  }

  async openNotification(n: Notification): Promise<void> {
    if (n.readAt === undefined) await this.store.markRead(n.id);
    this.open.set(false);
    const route = this.store.routeFor(n);
    if (route !== null) await this.router.navigateByUrl(route);
  }
}
```

```ts
// src/app/pages/notifications/notifications-page.ts
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import type { Notification } from '@slotted/demo-nexora-operations';
import { SlButton } from '@slotted/angular/button';
import { SlList } from '@slotted/angular/list';
import { SlPage, SlPageBody } from '@slotted/angular/page';
import { SlPageHeader, SlPageHeaderActions, SlPageHeaderHeading, SlPageHeaderTitle, SlPageHeaderTitleArea, SlPageHeaderTitleRow } from '@slotted/angular/page-header';
import { SlPagination } from '@slotted/angular/pagination';
import { SlResultState, SlResultStateContent, SlResultStateTitle } from '@slotted/angular/result-state';
import { SlTab, SlTabList, SlTabs } from '@slotted/angular/tabs';
import { NotificationsStore, type NotificationsView } from '../../core/activity/notifications.store';
import { NotificationRow } from '../../shell/notifications/notification-row';

@Component({
  selector: 'app-notifications-page',
  imports: [SlButton, SlList, SlPage, SlPageBody, SlPageHeader, SlPageHeaderActions, SlPageHeaderHeading, SlPageHeaderTitle, SlPageHeaderTitleArea, SlPageHeaderTitleRow, SlPagination, SlResultState, SlResultStateContent, SlResultStateTitle, SlTab, SlTabList, SlTabs, NotificationRow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div slPage>
      <header slPageHeader>
        <div slPageHeaderTitleArea><div slPageHeaderTitleRow>
          <div slPageHeaderTitle><h1 slPageHeaderHeading>Notifications</h1></div>
          <div slPageHeaderActions><button slButton variant="outline" [disabled]="store.unread() === 0" (click)="store.markAllRead()">Mark all as read</button></div>
        </div></div>
      </header>
      <div slPageBody>
        <div slTabs [value]="store.view()" (valueChange)="setView($event.value)">
          <div slTabList aria-label="Views">
            <button slTab value="all">All</button>
            <button slTab value="unread">Unread @if (store.unread() > 0) { ({{ store.unread() }}) }</button>
            <button slTab value="archived">Archived</button>
          </div>
        </div>
        @if (store.items().length === 0 && !store.loading()) {
          <div slResultState status="empty" reach="section"><div slResultStateContent><h2 slResultStateTitle>Nothing here</h2></div></div>
        } @else {
          <ul slList>
            @for (n of store.items(); track n.id) {
              <li app-notification-row [notification]="n" (read)="store.markRead($event)" (archive)="store.archive($event)" (open)="open($event)"></li>
            }
          </ul>
          <nav slPagination [pageValue]="store.page()" [count]="store.total()" [pageSizeValue]="25" (pageChange)="store.loadPage($event.value)" label="Notifications pages"></nav>
        }
      </div>
    </div>
  `,
})
export class NotificationsPage implements OnInit {
  readonly store = inject(NotificationsStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    void this.store.loadPage(1, 25);
  }

  setView(view: string | undefined): void {
    this.store.view.set((view ?? 'all') as NotificationsView);
    void this.store.loadPage(1, 25);
  }

  async open(n: Notification): Promise<void> {
    if (n.readAt === undefined) await this.store.markRead(n.id);
    const route = this.store.routeFor(n);
    if (route !== null) await this.router.navigateByUrl(route);
  }
}
```

- [ ] **Step 4: Correr e ver passar**

Run: `cd apps/demos/nexora-angular && pnpm test && pnpm build:demo`
Expected: PASS. Ícones novos: `lucideInfo, lucideCircleCheck, lucideTriangleAlert, lucideCircleAlert, lucideCheck, lucideArchive`. `NotificationType` do backend: confirmar os quatro literais em `backend/domain/activity.ts` e ajustar `ICON`/`TONE`.

- [ ] **Step 5: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora-angular/src && git add apps/demos/nexora-angular && git commit -m "feat(nexora-angular): notificações — popover com Today/Earlier, ações por linha, marcar todas; página com vistas All/Unread/Archived e paginação"
```

---

### Task 8: Command palette e pesquisa

**Files:**
- Replace: `src/app/shell/palette/command-palette.ts`
- Test: `src/app/shell/palette/command-palette.spec.ts`

**Interfaces:**
- Consumes: `SearchService`, `SessionStore`, `DemoStore`, `visibleModules`, `Router`, `SlCommandPalette`, `CommandPaletteItem`, `CommandGroup`.
- Produces: `CommandPalette` com `palette = viewChild.required(SlCommandPalette)`, `open(): void`, `items: Signal<PaletteItem[]>`, `groups`; `PaletteItem extends CommandPaletteItem { kind: 'go' | 'action' | 'demo' | 'recent' | 'hit'; icon?: string; hit?: SearchHit }`.

- [ ] **Step 1: Teste**

```ts
// src/app/shell/palette/command-palette.spec.ts
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { routes } from '../../app.routes';
import { SessionStore } from '../../core/session/session.store';
import { CommandPalette } from './command-palette';

describe('CommandPalette', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend(), provideRouter(routes)] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
    await TestBed.inject(SessionStore).load();
  });

  it('offers Go to for visible modules and demo commands, and groups search hits', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    const palette = harness.fixture.debugElement.query((d) => d.componentInstance instanceof CommandPalette).componentInstance as CommandPalette;
    const labels = palette.items().map((i) => i.label);
    expect(labels).toContain('Go to Sales');
    expect(labels).not.toContain('Go to Finance overview');
    expect(labels).toContain('Switch persona…');
    await palette.query.set('meridian');
    await palette.runSearch('meridian');
    const hits = palette.items().filter((i) => i.kind === 'hit');
    expect(hits.map((h) => h.group)).toContain('customer');
    expect(hits.some((h) => h.label.includes('Meridian'))).toBe(true);
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora-angular && pnpm test`
Expected: FAIL.

- [ ] **Step 3: Implementação**

```ts
// src/app/shell/palette/command-palette.ts
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import type { SearchHit, SearchResponse } from '@slotted/demo-nexora-operations';
import type { CommandGroup } from '@slotted/core/commands';
import { SlCommandPalette, SlCommandPaletteEmpty, SlCommandPaletteItem, type CommandPaletteItem, type CommandPaletteSelectRequest } from '@slotted/angular/command-palette';
import { SlHighlight } from '@slotted/angular/highlight';
import { SlKbd } from '@slotted/angular/kbd';
import { DemoStore } from '../../core/demo/demo.store';
import { visibleModules } from '../../core/nav/nav.model';
import { SearchService } from '../../core/search/search.service';
import { SessionStore } from '../../core/session/session.store';
import { DemoDrawer } from '../demo/demo-drawer';

export interface PaletteItem extends CommandPaletteItem {
  kind: 'go' | 'action' | 'demo' | 'recent' | 'hit';
  icon?: string;
  hit?: SearchHit;
}

const SEARCH_GROUP_ORDER: readonly SearchHit['type'][] = ['customer', 'contact', 'order', 'quote', 'invoice', 'product', 'sku', 'supplier', 'purchase_order', 'ticket'];
const SEARCH_GROUP_LABELS: Record<SearchHit['type'], string> = {
  customer: 'Customers', contact: 'Contacts', order: 'Sales orders', quote: 'Quotes', invoice: 'Invoices', product: 'Products', sku: 'SKUs',
  supplier: 'Suppliers', purchase_order: 'Purchase orders', ticket: 'Tickets',
};

const ENTITY_ICON: Record<SearchHit['type'], string> = {
  customer: 'lucideBuilding2', contact: 'lucideUser', order: 'lucideShoppingCart', quote: 'lucideFileText', invoice: 'lucideReceipt',
  product: 'lucidePackage', sku: 'lucidePackage', supplier: 'lucideTruck', purchase_order: 'lucideClipboardList', ticket: 'lucideLifeBuoy',
};

@Component({
  selector: 'app-command-palette',
  imports: [NgIcon, SlCommandPalette, SlCommandPaletteEmpty, SlCommandPaletteItem, SlHighlight, SlKbd],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sl-command-palette
      #palette
      [items]="items()"
      [groups]="groups()"
      [rank]="rank"
      [loading]="loading()"
      [(query)]="query"
      [(open)]="open"
      hotkey="mod+k"
      label="Search or jump to"
      placeholder="Search customers, orders, invoices… or type a command"
      [emptyLabel]="emptyLabel()"
      hintNavigate="navigate"
      hintSelect="open"
      hintClose="close"
      (select)="run($event)"
    >
      <ng-template slCommandPaletteItem let-item let-query="query">
        <span data-part="icon"><ng-icon [name]="item.icon ?? 'lucideCornerDownRight'" size="16" /></span>
        <span data-part="label"><span slHighlight [text]="item.label" [query]="query"></span></span>
        @if (item.description) { <span data-part="description">{{ item.description }}</span> }
        @if (item.meta) { <span data-part="meta">{{ item.meta }}</span> }
      </ng-template>
    </sl-command-palette>
  `,
})
export class CommandPalette {
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);
  private readonly search = inject(SearchService);
  private readonly demo = inject(DemoStore);
  readonly palette = viewChild.required(SlCommandPalette);
  readonly drawer = signal<DemoDrawer | null>(null);

  readonly open = signal(false);
  readonly query = signal('');
  readonly loading = signal(false);
  readonly hits = signal<SearchResponse['groups']>([]);

  readonly groups = computed<CommandGroup[]>(() => [
    { id: 'recent', label: 'Recent' },
    { id: 'go', label: 'Go to' },
    { id: 'commands', label: 'Commands' },
    ...SEARCH_GROUP_ORDER.map((type) => ({ id: type, label: SEARCH_GROUP_LABELS[type] })),
  ]);

  readonly commands = computed<PaletteItem[]>(() => {
    void this.session.session();
    const modules = visibleModules((p) => this.session.can(p));
    const go: PaletteItem[] = modules.flatMap((m) => [
      { id: `go:${m.id}`, kind: 'go', label: `Go to ${m.label}`, group: 'go', icon: m.icon, href: m.destinations[0]?.path ?? m.path, keywords: [m.label.toLowerCase()] },
      ...m.destinations.filter((x) => m.destinations.length > 1).map((x): PaletteItem => ({ id: `go:${x.id}`, kind: 'go', label: `Go to ${m.label} › ${x.label}`, group: 'go', icon: m.icon, href: x.path, keywords: [x.label.toLowerCase()] })),
    ]);
    const actions: PaletteItem[] = [
      { id: 'act:customer', kind: 'action', label: 'Create customer', group: 'commands', icon: 'lucidePlus', href: '/crm/customers?new=1', disabled: !this.session.can('customers.create') },
      { id: 'act:order', kind: 'action', label: 'Create sales order', group: 'commands', icon: 'lucidePlus', href: '/sales/orders?new=1', disabled: !this.session.can('orders.create') },
      { id: 'act:approvals', kind: 'action', label: 'Open approval queue', group: 'commands', icon: 'lucideClipboardCheck', href: '/sales/approvals', disabled: !this.session.canAny('orders.approve', 'quotes.approve') },
      { id: 'act:notifications', kind: 'action', label: 'Open notifications', group: 'commands', icon: 'lucideBell', href: '/notifications' },
    ].filter((a) => !a.disabled);
    const demo: PaletteItem[] = [
      { id: 'demo:persona', kind: 'demo', label: 'Switch persona…', group: 'commands', icon: 'lucideFlaskConical', description: 'Demo', onSelect: () => this.openDrawer('persona') },
      { id: 'demo:scenario', kind: 'demo', label: 'Change scenario…', group: 'commands', icon: 'lucideFlaskConical', description: 'Demo', onSelect: () => this.openDrawer('scenario') },
      { id: 'demo:reset', kind: 'demo', label: 'Reset demo data', group: 'commands', icon: 'lucideFlaskConical', description: 'Demo', onSelect: () => this.openDrawer('reset') },
      { id: 'demo:open', kind: 'demo', label: 'Open demo controls', group: 'commands', icon: 'lucideFlaskConical', shortcut: 'mod+shift+d', onSelect: () => this.openDrawer() },
    ];
    return [...go, ...actions, ...demo];
  });

  readonly recent = computed<PaletteItem[]>(() =>
    this.search.recent().map((d) => ({ id: `recent:${d.id}`, kind: 'recent', label: d.title, group: 'recent', icon: ENTITY_ICON[d.type], meta: d.number, hit: d, href: this.search.routeFor(d) })),
  );

  readonly hitItems = computed<PaletteItem[]>(() =>
    this.hits().flatMap((g) => g.hits.map((h): PaletteItem => ({
      id: `hit:${h.id}`, kind: 'hit', label: h.title, group: h.type, icon: ENTITY_ICON[h.type], meta: h.number, description: h.subtitle, hit: h, href: this.search.routeFor(h),
      keywords: [h.title.toLowerCase(), h.subtitle.toLowerCase(), h.number?.toLowerCase() ?? ''],
    }))),
  );

  readonly items = computed<PaletteItem[]>(() => {
    const q = this.query().trim();
    if (q.length === 0) return [...this.recent(), ...this.commands()];
    return [...this.commands(), ...this.hitItems()];
  });

  readonly emptyLabel = computed(() => `Nothing matches “${this.query()}”`);

  /** Hits are already ranked by the server; commands match on label and keywords. */
  readonly rank = (item: PaletteItem, query: string): number | null => {
    if (item.kind === 'hit') return 1;
    if (item.kind === 'recent') return query.length === 0 ? 1 : null;
    const q = query.toLowerCase();
    if (item.label.toLowerCase().includes(q)) return 2;
    return item.keywords?.some((k) => k.includes(q)) ? 1 : null;
  };

  constructor() {
    effect(() => {
      const q = this.query().trim();
      void this.runSearch(q);
    });
  }

  async runSearch(q: string): Promise<void> {
    if (q.length < 2) {
      this.hits.set([]);
      return;
    }
    this.loading.set(true);
    try {
      this.hits.set(await this.search.search(q));
    } finally {
      this.loading.set(false);
    }
  }

  run(request: CommandPaletteSelectRequest<PaletteItem>): void {
    const item = request.item;
    if (item.hit !== undefined) this.search.remember(item.hit);
    if (item.href !== undefined) void this.router.navigateByUrl(item.href);
  }

  openDrawer(section?: 'persona' | 'scenario' | 'reset'): void {
    this.drawer()?.openAt(section);
  }
}
```

O `Banner` liga o drawer: `effect(() => this.palette().drawer.set(this.demo()))` no construtor do `Banner`. O debounce de 150 ms vive em `SearchService.search` (Task 2). `DemoDrawer.openAt(section?)` é criado na Task 9; até lá o componente mínimo expõe `openAt = (_?: string) => this.open.set(true)`.

- [ ] **Step 4: Correr e ver passar**

Run: `cd apps/demos/nexora-angular && pnpm test && pnpm build:demo`
Expected: PASS. Ícones novos: `lucideBuilding2, lucideUser, lucideFileText, lucideReceipt, lucideClipboardList, lucideCornerDownRight, lucidePlus, lucideBell`. Se `select` da família não expuser `keepOpen`/`onSelect` como descrito, ler `slotted-angular-command-palette.d.ts` e ajustar; registar em `LIBRARY-FEEDBACK.md`.

- [ ] **Step 5: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora-angular/src && git add apps/demos/nexora-angular && git commit -m "feat(nexora-angular): command palette — recentes, Go to por permissão, ações gated, comandos de demonstração, resultados de pesquisa agrupados por entidade"
```

---

### Task 9: Painel de demonstração

**Files:**
- Replace: `src/app/shell/demo/demo-drawer.ts`
- Test: `src/app/shell/demo/demo-drawer.spec.ts`

**Interfaces:**
- Consumes: `DemoStore`, `SessionStore`, `PreferencesStore`, `ClockService`, `SlToastService`, `Router`.
- Produces: `DemoDrawer` com `open = signal(false)`, `openAt(section?: 'persona' | 'scenario' | 'reset')`, `confirmScenario`, `confirmReset`.

- [ ] **Step 1: Teste**

```ts
// src/app/shell/demo/demo-drawer.spec.ts
import { ApplicationInitStatus, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { routes } from '../../app.routes';
import { SessionStore } from '../../core/session/session.store';
import { DemoDrawer } from './demo-drawer';

describe('DemoDrawer', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend(), provideRouter(routes)] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
  });

  it('switches persona from the list and reloads the session', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    const drawer = harness.fixture.debugElement.query((d) => d.componentInstance instanceof DemoDrawer).componentInstance as DemoDrawer;
    drawer.openAt('persona');
    await harness.fixture.whenStable();
    const doc = TestBed.inject(DOCUMENT);
    const noah = [...doc.querySelectorAll('[data-ui="drawer"] button')].find((b) => b.textContent?.includes('Noah Bennett')) as HTMLButtonElement;
    noah.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(SessionStore).user()?.displayName).toBe('Noah Bennett');
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora-angular && pnpm test`
Expected: FAIL.

- [ ] **Step 3: Implementação**

```ts
// src/app/shell/demo/demo-drawer.ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { ScenarioId } from '@slotted/demo-nexora-operations';
import { SlAvatar, SlAvatarFallback } from '@slotted/angular/avatar';
import { SlButton } from '@slotted/angular/button';
import { SlAlertDialog, SlAlertDialogAction, SlAlertDialogCancel, SlAlertDialogIcon, SlDialogDescription, SlDialogFooter, SlDialogHeader, SlDialogTitle } from '@slotted/angular/dialog';
import { SlDrawer, SlDrawerBody, SlDrawerClose, SlDrawerDescription, SlDrawerHeader, SlDrawerTitle } from '@slotted/angular/drawer';
import { SlList } from '@slotted/angular/list';
import { SlListItem, SlListItemBody, SlListItemContent, SlListItemDescription, SlListItemLabel, SlListItemStart } from '@slotted/angular/list-item';
import { SlSection } from '@slotted/angular/section';
import { SlSelect, SlSelectItem } from '@slotted/angular/select';
import { SlToastService } from '@slotted/angular/toast';
import { SlToggle } from '@slotted/angular/toggle';
import { DemoStore } from '../../core/demo/demo.store';
import { ClockService } from '../../core/session/clock.service';
import { PreferencesStore } from '../../core/session/preferences.store';
import { SessionStore } from '../../core/session/session.store';

@Component({
  selector: 'app-demo-drawer',
  imports: [SlAvatar, SlAvatarFallback, SlButton, SlAlertDialog, SlAlertDialogAction, SlAlertDialogCancel, SlAlertDialogIcon, SlDialogDescription, SlDialogFooter, SlDialogHeader, SlDialogTitle, SlDrawer, SlDrawerBody, SlDrawerClose, SlDrawerDescription, SlDrawerHeader, SlDrawerTitle, SlList, SlListItem, SlListItemBody, SlListItemContent, SlListItemDescription, SlListItemLabel, SlListItemStart, SlSection, SlSelect, SlSelectItem, SlToastService as never, SlToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .persona { display: flex; align-items: center; gap: var(--slotted-space-3); inline-size: 100%; text-align: start; background: none; border: 0; padding: 0; font: inherit; color: inherit; cursor: pointer; }
    .row { display: flex; gap: var(--slotted-space-2); flex-wrap: wrap; align-items: center; }
    .date { font-variant-numeric: tabular-nums; font-weight: 600; }
  `,
  template: `
    <sl-drawer [(open)]="open" side="end" size="md" aria-label="Demo controls">
      <header slDrawerHeader>
        <h2 slDrawerTitle>Demo controls</h2>
        <p slDrawerDescription>Simulated Asteron environment. Nothing here exists in the product.</p>
        <button slDrawerClose></button>
      </header>
      <div slDrawerBody>
        <section slSection heading="Persona" id="demo-persona">
          <ul slList>
            @for (p of demo.info()?.personas ?? []; track p.key) {
              <li slListItem size="sm" [selected]="p.userId === session.user()?.id" [disabled]="!p.active">
                <button type="button" class="persona" slListItemContent [disabled]="!p.active || demo.busy()" (click)="setPersona(p.key, p.name)">
                  <span slListItemStart><span slAvatar size="sm" tone="accent" variant="soft" [name]="p.name"><span slAvatarFallback></span></span></span>
                  <span slListItemBody><span slListItemLabel>{{ p.name }}</span><span slListItemDescription>{{ p.role }} · {{ p.context }}</span></span>
                </button>
              </li>
            }
          </ul>
        </section>

        <section slSection heading="Scenario" id="demo-scenario">
          <sl-select aria-label="Scenario" [value]="demo.info()?.scenarioId ?? 'healthy'" (valueChangeRequest)="askScenario($event.value)">
            @for (s of demo.info()?.scenarios ?? []; track s.id) { <sl-select-item [value]="s.id">{{ s.label }}</sl-select-item> }
          </sl-select>
          <p>{{ scenarioDescription() }}</p>
        </section>

        <section slSection heading="Business date">
          <p class="date">{{ clock.formatDate(clock.now(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }}</p>
          <div class="row">
            <button slButton size="sm" variant="outline" [disabled]="demo.busy()" (click)="advance(1)">+1 day</button>
            <button slButton size="sm" variant="outline" [disabled]="demo.busy()" (click)="advance(7)">+7 days</button>
            <button slButton size="sm" variant="outline" [disabled]="demo.busy()" (click)="advance(daysToMonthEnd())">End of month</button>
          </div>
        </section>

        <section slSection heading="Transport">
          <button slToggle [pressed]="demo.info()?.latency === 'degraded'" (pressedChange)="setDegraded($event.value)">System degraded</button>
          <p>700 ms base latency, random 503s on activity and finance, 5 % failed mutations.</p>
        </section>

        <section slSection heading="Reset" id="demo-reset">
          <button slButton tone="danger" variant="outline" [disabled]="demo.busy()" (click)="resetOpen.set(true)">Reset demo data</button>
        </section>
      </div>
    </sl-drawer>

    <sl-alert-dialog [(open)]="scenarioOpen">
      <header slDialogHeader>
        <span slAlertDialogIcon></span>
        <h2 slDialogTitle>Switch scenario?</h2>
        <p slDialogDescription>Switching resets demo data before applying “{{ pendingScenarioLabel() }}”. Anything you changed is lost.</p>
      </header>
      <footer slDialogFooter>
        <button slButton variant="outline" tone="secondary" slAlertDialogCancel>Cancel</button>
        <button slButton tone="danger" slAlertDialogAction (click)="confirmScenario()">Switch and reset</button>
      </footer>
    </sl-alert-dialog>

    <sl-alert-dialog [(open)]="resetOpen">
      <header slDialogHeader>
        <span slAlertDialogIcon></span>
        <h2 slDialogTitle>Reset demo data?</h2>
        <p slDialogDescription>Restores the canonical seed for the current scenario and the business date.</p>
      </header>
      <footer slDialogFooter>
        <button slButton variant="outline" tone="secondary" slAlertDialogCancel>Keep data</button>
        <button slButton tone="danger" slAlertDialogAction (click)="confirmReset()">Reset</button>
      </footer>
    </sl-alert-dialog>
  `,
})
export class DemoDrawer {
  readonly demo = inject(DemoStore);
  readonly session = inject(SessionStore);
  readonly clock = inject(ClockService);
  private readonly preferences = inject(PreferencesStore);
  private readonly toasts = inject(SlToastService);
  private readonly router = inject(Router);

  readonly open = signal(false);
  readonly scenarioOpen = signal(false);
  readonly resetOpen = signal(false);
  readonly pendingScenario = signal<ScenarioId | null>(null);
  readonly pendingScenarioLabel = computed(() => this.demo.info()?.scenarios.find((s) => s.id === this.pendingScenario())?.label ?? '');
  readonly scenarioDescription = computed(() => this.demo.info()?.scenarios.find((s) => s.id === this.demo.info()?.scenarioId)?.description ?? '');

  openAt(section?: 'persona' | 'scenario' | 'reset'): void {
    if (this.demo.info() === null) void this.demo.load();
    if (section === 'reset') {
      this.resetOpen.set(true);
      return;
    }
    this.open.set(true);
    if (section !== undefined) setTimeout(() => document.getElementById(`demo-${section}`)?.scrollIntoView({ block: 'start' }), 50);
  }

  async setPersona(key: string, name: string): Promise<void> {
    await this.demo.setPersona(key);
    this.open.set(false);
    this.toasts.show({ title: `Signed in as ${name}`, tone: 'success' });
    await this.router.navigateByUrl(this.preferences.preferences().startRoute);
  }

  askScenario(id: string): void {
    if (id === this.demo.info()?.scenarioId) return;
    this.pendingScenario.set(id as ScenarioId);
    this.scenarioOpen.set(true);
  }

  async confirmScenario(): Promise<void> {
    const id = this.pendingScenario();
    if (id === null) return;
    await this.demo.switchScenario(id);
    this.toasts.show({ title: `Scenario: ${this.pendingScenarioLabel()}`, description: `Signed in as ${this.session.user()?.displayName}`, tone: 'success' });
    this.open.set(false);
    await this.router.navigateByUrl(this.preferences.preferences().startRoute);
  }

  async advance(days: number): Promise<void> {
    await this.demo.advanceDays(days);
    this.toasts.show({ title: `Business date is now ${this.clock.formatDate(this.clock.now())}` });
  }

  daysToMonthEnd(): number {
    const now = new Date(this.clock.now());
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    return Math.max(1, end.getUTCDate() - now.getUTCDate());
  }

  async setDegraded(pressed: boolean): Promise<void> {
    await this.demo.setLatency(pressed ? 'degraded' : 'normal');
    this.toasts.show({ title: pressed ? 'Transport degraded' : 'Transport normal', tone: pressed ? 'warning' : 'success' });
  }

  async confirmReset(): Promise<void> {
    await this.demo.reset();
    this.toasts.show({ title: 'Demo data reset', tone: 'success' });
    this.open.set(false);
    await this.router.navigateByUrl(this.preferences.preferences().startRoute);
  }
}
```

Remover `SlToastService as never` do `imports` (serviço, não diretiva). O nome do output do `slToggle` (`pressedChange`) e o campo do evento (`value`) são confirmados em `slotted-angular-toggle.d.ts`. Atalho `mod+shift+d` registado na Task 10.

- [ ] **Step 4: Correr e ver passar**

Run: `cd apps/demos/nexora-angular && pnpm test && pnpm build:demo`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora-angular/src && git add apps/demos/nexora-angular && git commit -m "feat(nexora-angular): painel de demonstração em drawer — personas, cenário com confirmação e reset, data de negócio, transporte degradado, reset com alert dialog, toasts"
```

---

### Task 10: Atalhos, diálogo de atalhos, `system_degraded` nos toasts, screenshots, documentação

**Files:**
- Replace: `src/app/core/shortcuts/shortcuts.service.ts`; create `src/app/shell/shortcuts/shortcuts-dialog.ts`, `apps/demos/nexora-angular/LIBRARY-FEEDBACK.md`, `apps/demos/nexora-angular/README.md`
- Modify: `src/app/shell/shell-layout.ts` (instala o serviço de atalhos; inclui o diálogo), `src/app/core/api/nexora-api.provider.ts` (toast com Retry em `503 retryable` de mutações), `apps/demos/nexora-angular/README.md`
- Test: `src/app/core/shortcuts/shortcuts.service.spec.ts`

**Interfaces:**
- Produces: `ShortcutsService` com `install(): void` (um listener `keydown` no `document`), `dialogOpen`, `openDialog()`, `bindings: readonly Binding[]` (`{ keys: string; label: string; when?: string }`), sequência `g` + letra com janela de 800 ms; `ShortcutsDialog`.

- [ ] **Step 1: Teste**

```ts
// src/app/core/shortcuts/shortcuts.service.spec.ts
import { ApplicationInitStatus, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { routes } from '../../app.routes';
import { ShortcutsService } from './shortcuts.service';

const press = (doc: Document, key: string, init: KeyboardEventInit = {}) => doc.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));

describe('ShortcutsService', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend(), provideRouter(routes)] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
  });

  it('navigates with g then s, ignores modules the user cannot see, opens the dialog on ?', async () => {
    await RouterTestingHarness.create('/dashboard');
    const doc = TestBed.inject(DOCUMENT);
    const router = TestBed.inject(Router);
    press(doc, 'g');
    press(doc, 's');
    await new Promise((r) => setTimeout(r, 0));
    expect(router.url.startsWith('/sales')).toBe(true);
    press(doc, 'g');
    press(doc, 'f');
    await new Promise((r) => setTimeout(r, 0));
    expect(router.url.startsWith('/finance')).toBe(false);
    press(doc, '?', { shiftKey: true });
    expect(TestBed.inject(ShortcutsService).dialogOpen()).toBe(true);
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd apps/demos/nexora-angular && pnpm test`
Expected: FAIL.

- [ ] **Step 3: Serviço e diálogo**

```ts
// src/app/core/shortcuts/shortcuts.service.ts
import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { visibleModules } from '../nav/nav.model';
import { SessionStore } from '../session/session.store';

export interface Binding { keys: string; label: string }

const SEQUENCE_WINDOW_MS = 800;

@Injectable({ providedIn: 'root' })
export class ShortcutsService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);
  private installed = false;
  private pendingG = 0;
  readonly dialogOpen = signal(false);
  readonly demoRequested = signal(0);

  readonly bindings: readonly Binding[] = [
    { keys: 'mod+k', label: 'Search or jump to' },
    { keys: 'mod+shift+d', label: 'Demo controls' },
    { keys: '?', label: 'Keyboard shortcuts' },
    { keys: 'g h', label: 'Go to Home' },
    { keys: 'g c', label: 'Go to CRM' },
    { keys: 'g s', label: 'Go to Sales' },
    { keys: 'g i', label: 'Go to Inventory' },
    { keys: 'g f', label: 'Go to Finance' },
    { keys: 'esc', label: 'Close what is open' },
  ];

  openDialog(): void {
    this.dialogOpen.set(true);
  }

  install(): void {
    if (this.installed) return;
    this.installed = true;
    this.document.addEventListener('keydown', (event) => this.handle(event));
  }

  private handle(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing = target !== null && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    const mod = event.metaKey || event.ctrlKey;
    if (mod && event.shiftKey && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      this.demoRequested.update((n) => n + 1);
      return;
    }
    if (typing || mod || event.altKey) return;
    if (event.key === '?') {
      event.preventDefault();
      this.dialogOpen.set(true);
      return;
    }
    const now = performance.now();
    if (event.key === 'g') {
      this.pendingG = now;
      return;
    }
    if (this.pendingG !== 0 && now - this.pendingG < SEQUENCE_WINDOW_MS) {
      this.pendingG = 0;
      const module = visibleModules((p) => this.session.can(p)).find((m) => m.key === event.key);
      if (module !== undefined) {
        event.preventDefault();
        void this.router.navigateByUrl(module.destinations[0]?.path ?? module.path);
      }
    }
  }
}
```

```ts
// src/app/shell/shortcuts/shortcuts-dialog.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SlDialog, SlDialogBody, SlDialogClose, SlDialogHeader, SlDialogTitle } from '@slotted/angular/dialog';
import { SlKbd, SlShortcut } from '@slotted/angular/kbd';
import { ShortcutsService } from '../../core/shortcuts/shortcuts.service';

@Component({
  selector: 'app-shortcuts-dialog',
  imports: [SlDialog, SlDialogBody, SlDialogClose, SlDialogHeader, SlDialogTitle, SlKbd, SlShortcut],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `dl { display: grid; grid-template-columns: auto 1fr; gap: var(--slotted-space-2) var(--slotted-space-4); margin: 0; } dt { justify-self: end; }`,
  template: `
    <sl-dialog [(open)]="shortcuts.dialogOpen" size="sm">
      <header slDialogHeader><h2 slDialogTitle>Keyboard shortcuts</h2><button slDialogClose></button></header>
      <div slDialogBody>
        <dl>
          @for (b of shortcuts.bindings; track b.keys) {
            <dt>@if (b.keys.includes(' ')) { @for (k of b.keys.split(' '); track $index) { <kbd slKbd size="sm">{{ k }}</kbd> } } @else { <kbd slShortcut [keys]="b.keys" size="sm"></kbd> }</dt>
            <dd>{{ b.label }}</dd>
          }
        </dl>
      </div>
    </sl-dialog>
  `,
})
export class ShortcutsDialog {
  readonly shortcuts = inject(ShortcutsService);
}
```

Em `ShellLayout`: `inject(ShortcutsService).install()` no construtor; `<app-shortcuts-dialog />` no fim do template; `effect(() => { if (this.shortcuts.demoRequested() > 0) this.bannerRef().demo().openAt(); })` com `bannerRef = viewChild.required(Banner)` (ler o valor uma vez para o efeito depender dele).

Toast de `503 retryable` em mutações: nos stores de notificações e no `DemoStore`, um `catch` com `isApiError(error, 'SERVICE_UNAVAILABLE')` mostra `SlToastService.show({ title: 'Nexora did not answer', description: 'The change was not saved.', tone: 'danger', duration: 8000 })` e relança. A ação Retry do spec fica registada em `LIBRARY-FEEDBACK.md` como pendente: o `ToastInput` da beta consumida não expõe uma ação com handler (confirmar em `slotted-angular-toast.d.ts`; se expuser, ligar a uma repetição da chamada).

- [ ] **Step 4: Documentação e screenshots**

`apps/demos/nexora-angular/LIBRARY-FEEDBACK.md` — cabeçalho e uma entrada por fricção registada nas tarefas anteriores:

```markdown
# Library feedback from Nexora

One entry per friction met while consuming `@slotted/angular` as a beta. Family, version, what it cost, what would have removed the cost. The library is not changed from here.

| Beta | Family | Friction | Cost |
| --- | --- | --- | --- |
| 0.1.0-beta.0 | app-shell, page-header, page, side-navigation | four `provide*Defaults` calls to speak English | `app.config.ts` grows one provider per family that speaks |
| 0.1.0-beta.0 | date-field, calendar, currency-field, … | no root provider for locale/timeZone | not hit yet: the Shell has no date control |

## Backend

One entry per gap met in `@slotted/demo-nexora-operations` while building the Shell. The backend is not changed from here.

| Area | Gap | Cost |
| --- | --- | --- |
| persistence | in-memory only; a reload re-seeds | persona, scenario and preferences kept by the client in `localStorage` |
| notifications | no `route`; `archive` to confirm | route derived from `entityType`/`entityId` |
| session | no sign-out | client-side `unauthenticated` state |
```

`apps/demos/nexora-angular/README.md`: estrutura do monorepo do produto, comandos (`pnpm install`, `pnpm build`, `pnpm test`, `pnpm start`), o ritual de upgrade de beta (`pnpm release:beta` na raiz → editar os três `file:` em `apps/angular/package.json` → `pnpm install`), e o índice dos pacotes. Mover para aqui o conteúdo do `README.md` da app que descreve a instalação; o `README.md` da app fica com o que é só dela (porta 4250, `angular.json`).

Screenshots: com `pnpm start` a correr, o script da sessão (`scratchpad/shoot.mjs`, copiado para `apps/demos/nexora-angular/tools/shoot.mjs`) captura `/dashboard` em light e dark a 1280 e 420 px, `/sign-in`, `/finance/overview` com Sofia (403), o popover de notificações e o drawer aberto — as duas últimas por `Runtime.evaluate` a clicar no botão antes da captura. Ficheiros em `apps/demos/nexora-angular/screenshots/` (adicionar ao `.gitignore` da app). Ler cada imagem e corrigir o que estiver visivelmente errado antes do commit.

- [ ] **Step 5: Correr e ver passar**

Run: `cd apps/demos/nexora-angular && pnpm test && pnpm build:demo`
Expected: PASS em todos os projetos; build sem avisos de orçamento.

- [ ] **Step 6: Commit**

```bash
cd /home/dreco/dev/slotted && pnpm exec prettier --write apps/demos/nexora-angular && git add apps/demos/nexora-angular && git commit -m "feat(nexora-angular): atalhos (mod+k, mod+shift+d, ?, g+letra por permissão), diálogo de atalhos, toast em 503 de mutação, LIBRARY-FEEDBACK.md, README do produto"
```

---

## Self-review

- Cobertura do spec: §6.1 (T1), §6.2 (T2), §6.3 (T3), §7 (T4, T5, T9, T10), §8 (T6), §9 (T7), §10 (T8), §11 (T3 `BrandMark`, `styles.css` existente; favicon SVG entra na T10 junto dos screenshots: `public/favicon.svg` com o mesmo desenho em `#0f766e` e `<link rel="icon" type="image/svg+xml" href="favicon.svg">` em `index.html`), §12 (T3, T4, T10), §13 (testes por tarefa; screenshots T10), §14 (T10).
- Pontos que dependem de confirmação nos `.d.ts` da beta consumida e estão assinalados no texto: `slStatCard` inputs, `StatusIndicatorStatus`, `slSection heading`, `slRadioGroup`/`slRadio`/`slCheckbox`/`slField` seletores e outputs, `slToggle pressedChange`, `a[slSideNavigationLink]` com `href` vs `routerLink`, `a[slMenuItem]` com `href` + `(select)`, `ToastInput` sem ação. Cada confirmação que obrigar a mudar o plano é registada em `LIBRARY-FEEDBACK.md`.
- Nomes entre tarefas: `provideTestBackend`, `SessionStore.can/canAny/user/status/reload`, `PreferencesStore.preferences/update`, `NotificationsStore.unread/items/view/page/total/loading/refreshCount/loadPage/markRead/markUnread/archive/markAllRead`, `ApprovalsStore.pending/items/refresh/load`, `TasksStore.open/items/refresh`, `DemoStore.info/busy/load/setPersona/signOut/switchScenario/advance/reset/setTransport`, `SearchService.search/recent/remember`, `ClockService.now/businessDate/relative/formatDate/formatTime/isToday`, `visibleModules/moduleFor/destinationFor/NAV_MODULES/SECTION_LABELS`, `CommandPalette.palette/drawer/items/query/runSearch`, `DemoDrawer.open/openAt`, `ShortcutsService.install/dialogOpen/openDialog/bindings/demoRequested`, `TransportHealth.degraded/reportFailure` — consistentes nas tarefas em que aparecem.
