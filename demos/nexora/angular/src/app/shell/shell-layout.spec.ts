import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend, signInAs } from '../../test/testing';
import { routes } from '../app.routes';
import { PreferencesStore } from '../core/session/preferences.store';
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

  it('shows Sofia the Sales module and hides Finance reconciliation', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    const text = harness.fixture.nativeElement.textContent as string;
    expect(text).toContain('Sales');
    expect(text).toContain('Approvals');
    expect(text).not.toContain('Reconciliation');
  });

  it('shows Jordan only what a warehouse operator can view', async () => {
    await persona('jordan-wells');
    const harness = await RouterTestingHarness.create('/dashboard');
    const text = harness.fixture.nativeElement.textContent as string;
    expect(text).toContain('Inventory');
    expect(text).not.toContain('Finance');
    expect(text).not.toContain('Settings');
  });

  /**
   * The shell draws the plane the reader chose. `inset` is what the preference
   * starts at, so a reader who has chosen nothing sees the shell the demo has
   * always drawn.
   */
  it('draws the canvas the reader chose in their preferences', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    const shell = () =>
      harness.fixture.nativeElement.querySelector('[data-ui="app-shell"]') as HTMLElement;
    expect(shell().getAttribute('data-canvas')).toBe('inset');

    TestBed.inject(PreferencesStore).update({ canvas: 'flush' });
    harness.fixture.detectChanges();

    expect(shell().getAttribute('data-canvas')).toBe('flush');
  });

  /**
   * A persona switch reloads the session. The column and the page are already painted, so
   * they stay, and say they are busy until the new session arrives (loading-states §1).
   */
  it('keeps the destinations and the page on screen while the session reloads', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    const root = harness.fixture.nativeElement as HTMLElement;
    const reload = TestBed.inject(SessionStore).reload();
    harness.fixture.detectChanges();

    const nav = root.querySelector('[data-ui="side-navigation"]');
    expect(nav?.getAttribute('aria-busy')).toBe('true');
    expect(nav?.textContent).toContain('Sales');
    expect(root.querySelector('[data-ui="skeleton"]')).toBeNull();
    expect(root.querySelector('main')?.getAttribute('aria-busy')).toBe('true');

    await reload;
    harness.fixture.detectChanges();
    expect(root.querySelector('[data-ui="side-navigation"]')?.hasAttribute('aria-busy')).toBe(
      false,
    );
    expect(root.querySelector('main')?.hasAttribute('aria-busy')).toBe(false);
  });

  it('marks the current destination from the url', async () => {
    const harness = await RouterTestingHarness.create('/sales/orders');
    const current = harness.fixture.nativeElement.querySelector(
      '[data-ui="side-navigation"] [aria-current="page"]',
    ) as HTMLElement | null;
    expect(current?.textContent).toContain('Orders');
  });
});
