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
    harness.fixture.detectChanges();
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
