import { ApplicationInitStatus, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { routes } from '../../app.routes';
import { PreferencesStore } from '../../core/session/preferences.store';
import { SessionStore } from '../../core/session/session.store';

describe('PreferencesPage › Appearance', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend(), provideRouter(routes)] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
    await TestBed.inject(SessionStore).load();
  });

  async function open(): Promise<{ harness: RouterTestingHarness; root: HTMLElement }> {
    const harness = await RouterTestingHarness.create('/settings/preferences');
    harness.detectChanges();
    return { harness, root: harness.fixture.nativeElement as HTMLElement };
  }

  const choose = (root: HTMLElement, name: string, value: string) => {
    const input = root.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
    expect(input, `${name}=${value}`).not.toBeNull();
    input!.click();
  };

  const regions = (root: HTMLElement) =>
    [...root.querySelectorAll<HTMLElement>('[data-preview-scheme]')].map((region) => ({
      scheme: region.getAttribute('data-slotted-scheme'),
      theme: region.getAttribute('data-slotted-theme'),
      density: region.getAttribute('data-slotted-density'),
      seeds: region.hasAttribute('data-slotted-seeds'),
      accent: region.style.getPropertyValue('--slotted-seed-accent'),
      neutral: region.style.getPropertyValue('--slotted-seed-neutral'),
    }));

  /**
   * The preview is three regions, one per scheme, each naming the candidate
   * theme and carrying the candidate seeds itself: nothing reaches `html`
   * before Save.
   */
  it('previews the candidate theme and seeds in three scheme regions, leaving html alone', async () => {
    const { harness, root } = await open();
    const html = TestBed.inject(DOCUMENT).documentElement;

    expect(regions(root)).toEqual(
      ['light', 'dark', 'high-contrast'].map((scheme) => ({
        scheme,
        theme: 'default',
        density: 'comfortable',
        seeds: true,
        accent: '#7c3aed',
        neutral: '',
      })),
    );

    choose(root, 'theme', 'nexora-sharp');
    choose(root, 'brand', 'amber');
    choose(root, 'neutral', 'warm');
    harness.detectChanges();

    for (const region of regions(root)) {
      expect(region.theme).toBe('nexora-sharp');
      expect(region.accent).toBe('#d97706');
      expect(region.neutral).toBe('#78716c');
    }
    expect(html.getAttribute('data-slotted-theme')).toBe('default');
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#7c3aed');
  });

  /** The theme cards and the preview draw every theme, so the page puts every runtime sheet on. */
  it('applies the sheets of the three runtime themes when it opens', async () => {
    await open();
    const names = [
      ...TestBed.inject(DOCUMENT).head.querySelectorAll('style[data-slotted-theme-sheet]'),
    ].map((sheet) => sheet.getAttribute('data-slotted-theme-sheet'));
    expect(names.sort()).toEqual(['nexora-editorial', 'nexora-sharp', 'nexora-soft']);
  });

  it('saves a brand preset into the store, which writes it onto html', async () => {
    const { harness, root } = await open();
    const html = TestBed.inject(DOCUMENT).documentElement;

    choose(root, 'brand', 'emerald');
    choose(root, 'theme', 'nexora-soft');
    harness.detectChanges();
    const save = [...root.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Save preferences',
    );
    save!.click();
    harness.detectChanges();
    TestBed.flushEffects();

    const preferences = TestBed.inject(PreferencesStore).preferences();
    expect(preferences.brand.preset).toBe('emerald');
    expect(preferences.theme).toBe('nexora-soft');
    expect(html.getAttribute('data-slotted-theme')).toBe('nexora-soft');
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#059669');
  });

  /** The reader's own colour is a candidate like a preset, and choosing it selects Custom. */
  it('takes a custom colour from the colour field', async () => {
    const { harness, root } = await open();
    const field = root.querySelector<HTMLInputElement>('[data-brand-custom] input');
    expect(field).not.toBeNull();
    field!.value = '#0f766e';
    field!.dispatchEvent(new Event('input', { bubbles: true }));
    field!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    harness.detectChanges();

    expect(regions(root)[0]!.accent).toBe('#0f766e');
    expect(
      root.querySelector<HTMLInputElement>('input[name="brand"][value="custom"]')!.checked,
    ).toBe(true);
  });

  it('reads the contrast of the candidate seeds in the three schemes', async () => {
    const { harness, root } = await open();
    const table = root.querySelector('[data-contrast]');
    expect(table).not.toBeNull();
    const before = table!.textContent;
    expect(before).toMatch(/Text on solid/);
    expect(before).toMatch(/\d+\.\d{2}:1/);

    choose(root, 'brand', 'amber');
    harness.detectChanges();
    expect(root.querySelector('[data-contrast]')!.textContent).not.toBe(before);
  });
});
