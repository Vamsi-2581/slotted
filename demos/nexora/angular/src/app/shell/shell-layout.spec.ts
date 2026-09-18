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

  it('marks the current destination from the url', async () => {
    const harness = await RouterTestingHarness.create('/sales/orders');
    const current = harness.fixture.nativeElement.querySelector(
      '[data-ui="side-navigation"] [aria-current="page"]',
    ) as HTMLElement | null;
    expect(current?.textContent).toContain('Orders');
  });
});
