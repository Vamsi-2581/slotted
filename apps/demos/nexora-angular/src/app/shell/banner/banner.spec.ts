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

  /**
   * The end cluster is one row of equals. A control the app draws with another
   * family — an icon button, a badge in an anchor — brings that family's
   * height, ink and count into the row beside the bell's, and the row reads as
   * two kinds of button. Every control here is a top-navigation part, and every
   * count is the family's own.
   */
  it('draws every control in the actions cluster as a top-navigation part', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();
    const actions = harness.fixture.nativeElement.querySelector(
      '[data-ui="top-navigation"] [data-part="actions"]',
    ) as HTMLElement;
    const controls = [...actions.querySelectorAll('button, a')] as HTMLElement[];
    expect(controls.length).toBeGreaterThan(3);
    for (const control of controls) {
      expect(control.getAttribute('data-part'), control.outerHTML).toMatch(
        /^(search-toggle|help|notifications|account|action)$/,
      );
      expect(control.getAttribute('data-ui'), control.outerHTML).toBeNull();
    }
    expect(actions.querySelector('[data-ui="badge"]')).toBeNull();
    for (const count of actions.querySelectorAll('[data-part="count"]')) {
      expect(count.closest('[data-part="notifications"], [data-part="action"]')).not.toBeNull();
    }
  });

  it('adds the warehouse to the context for Jordan', async () => {
    await signInAs('jordan-wells');
    await TestBed.inject(SessionStore).reload();
    const harness = await RouterTestingHarness.create('/dashboard');
    const banner = harness.fixture.nativeElement.querySelector('[data-ui="top-navigation"]') as HTMLElement;
    expect(banner.textContent).toContain('CHI-01');
  });
});
