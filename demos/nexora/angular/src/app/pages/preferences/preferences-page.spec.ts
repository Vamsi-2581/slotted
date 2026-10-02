import { ApplicationInitStatus, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CHART_ENGINE } from '@slotted/angular/chart';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { routes } from '../../app.routes';
import { PreferencesStore } from '../../core/session/preferences.store';
import { SessionStore } from '../../core/session/session.store';
import { NO_CUSTOMISATION } from '../../core/theming/customisation';

/**
 * jsdom has no ResizeObserver and no layout, so the preview's charts are drawn
 * by an engine that records nothing: the token the family publishes for this.
 */
const silentEngine = () => ({
  update: () => Promise.resolve(),
  locate: () => null,
  emphasize: () => undefined,
  toDataURL: () => null,
  dispose: () => undefined,
});

describe('PreferencesPage › Appearance', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTestBackend(),
        provideRouter(routes),
        { provide: CHART_ENGINE, useValue: silentEngine },
      ],
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
    await TestBed.inject(SessionStore).load();
  });

  /** Polls `ready`, running change detection between reads; fails after `ms`. */
  async function until(
    harness: RouterTestingHarness,
    ready: () => boolean,
    ms = 5000,
  ): Promise<void> {
    const end = Date.now() + ms;
    for (;;) {
      harness.detectChanges();
      if (ready()) return;
      if (Date.now() > end) throw new Error('the condition did not hold in time');
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const ratios = (root: HTMLElement) =>
    root.querySelectorAll('[data-contrast] [data-ratio]').length;
  const counts = (root: HTMLElement) => root.querySelectorAll('[data-anatomy] [data-count]').length;

  /** Opens the page and waits for the runtime sheets and the contrast readings the section asks for. */
  async function open(): Promise<{ harness: RouterTestingHarness; root: HTMLElement }> {
    const harness = await RouterTestingHarness.create('/settings/preferences');
    const root = harness.fixture.nativeElement as HTMLElement;
    await TestBed.inject(PreferencesStore).useThemes();
    await until(harness, () => ratios(root) === 21 && counts(root) === 9);
    return { harness, root };
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

    choose(root, 'theme', 'nexora-brutalist');
    choose(root, 'brand', 'amber');
    choose(root, 'neutral', 'clay');
    harness.detectChanges();

    for (const region of regions(root)) {
      expect(region.theme).toBe('nexora-brutalist');
      expect(region.accent).toBe('#d97706');
      expect(region.neutral).toBe('#9c6644');
    }
    expect(html.getAttribute('data-slotted-theme')).toBe('default');
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#7c3aed');
  });

  const samples = (root: HTMLElement) =>
    [...root.querySelectorAll<HTMLElement>('[data-theme-sample]')].map((sample) => ({
      theme: sample.getAttribute('data-slotted-theme'),
      reserved: sample.classList.contains('reserved'),
    }));
  const painted = (root: HTMLElement) =>
    root.querySelectorAll('[data-appearance] [data-ui=skeleton][data-loading]').length;

  /**
   * AF-05: the region's placeholders are painted from the first frame, even
   * when every definition is already at hand; the application's minimum
   * (AF-06) then holds them.
   */
  it('paints its placeholders from the first frame', async () => {
    await TestBed.inject(PreferencesStore).useThemes();
    await import('../../core/theming/contrast-reading');
    const harness = await RouterTestingHarness.create('/settings/preferences');
    const root = harness.fixture.nativeElement as HTMLElement;
    const region = () => root.querySelector<HTMLElement>('[data-appearance]')!;
    harness.detectChanges();

    expect(region().getAttribute('aria-busy')).toBe('true');
    expect(painted(root)).toBeGreaterThan(0);
    expect(samples(root).some((sample) => sample.reserved)).toBe(false);

    await until(harness, () => !region().hasAttribute('aria-busy'), 2000);
    expect(painted(root)).toBe(0);
    expect(ratios(root)).toBe(21);
  });

  /**
   * A longer wait is one busy skeleton region for as long as it lasts: the
   * samples are drawn in `default` under their placeholders, and the contrast
   * cells hold theirs. Then the themes land.
   */
  it('keeps one skeleton region over a wait longer than the minimum', async () => {
    const store = TestBed.inject(PreferencesStore);
    const load = store.useThemes.bind(store);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const held = vi
      .spyOn(store, 'useThemes')
      .mockImplementation((ids) => gate.then(() => load(ids)));
    const harness = await RouterTestingHarness.create('/settings/preferences');
    const root = harness.fixture.nativeElement as HTMLElement;
    const region = () => root.querySelector<HTMLElement>('[data-appearance]')!;
    harness.detectChanges();

    expect(region().getAttribute('aria-busy')).toBe('true');
    expect(
      TestBed.inject(DOCUMENT).head.querySelectorAll('style[data-slotted-theme-sheet]'),
    ).toHaveLength(0);
    expect(samples(root).map((sample) => sample.theme)).toEqual([
      'default',
      'default',
      'default',
      'default',
      'default',
    ]);
    expect(samples(root).some((sample) => sample.reserved)).toBe(false);
    expect(root.querySelectorAll('[data-contrast] [data-ui=skeleton][data-loading]')).toHaveLength(
      21,
    );
    expect(root.querySelectorAll('[data-anatomy] [data-ui=skeleton][data-loading]')).toHaveLength(
      18,
    );

    await wait(500);
    harness.detectChanges();
    expect(region().getAttribute('aria-busy')).toBe('true');

    release();
    await until(harness, () => !region().hasAttribute('aria-busy'), 2000);
    held.mockRestore();

    expect(painted(root)).toBe(0);
    expect(ratios(root)).toBe(21);
    expect(counts(root)).toBe(9);
    expect(samples(root).map((sample) => sample.theme)).toEqual([
      'default',
      'nexora-friendly',
      'nexora-brutalist',
      'nexora-editorial',
      'nexora-terminal',
    ]);
  });

  /**
   * A theme whose sheet never arrives is not drawn in `default` in its place:
   * with no placeholder over them, the preview and the swatches keep their
   * boxes and draw nothing.
   */
  it('draws nothing in place of a theme whose sheet did not load', async () => {
    const store = TestBed.inject(PreferencesStore);
    store.update({ theme: 'nexora-brutalist' });
    const load = vi.spyOn(store, 'useThemes').mockRejectedValue(new Error('chunk'));
    const harness = await RouterTestingHarness.create('/settings/preferences');
    const root = harness.fixture.nativeElement as HTMLElement;
    await until(harness, () => root.querySelector('[data-themes-failed]') !== null);

    const previews = [...root.querySelectorAll('app-appearance-preview')];
    expect(previews).toHaveLength(3);
    expect(previews.every((preview) => preview.classList.contains('reserved'))).toBe(true);
    expect(
      [...root.querySelectorAll('.swatch')].every((swatch) =>
        swatch.classList.contains('reserved'),
      ),
    ).toBe(true);
    expect(TestBed.inject(DOCUMENT).documentElement.getAttribute('data-slotted-theme')).toBe(
      'default',
    );
    load.mockRestore();
  });

  /** A load that fails is said once, with a way to try again; the themes it could not draw cannot be chosen. */
  it('offers a retry when the theme definitions do not arrive', async () => {
    const store = TestBed.inject(PreferencesStore);
    const load = vi.spyOn(store, 'useThemes').mockRejectedValueOnce(new Error('chunk'));
    const harness = await RouterTestingHarness.create('/settings/preferences');
    const root = harness.fixture.nativeElement as HTMLElement;
    await until(harness, () => root.querySelector('[data-themes-failed]') !== null);

    expect(root.querySelector('[data-contrast]')).toBeNull();
    expect(root.querySelector('[data-anatomy]')).toBeNull();
    expect(root.querySelector('[data-appearance]')!.hasAttribute('aria-busy')).toBe(false);
    const disabled = [...root.querySelectorAll<HTMLInputElement>('input[name="theme"]')]
      .filter((input) => input.disabled)
      .map((input) => input.value);
    expect(disabled).toEqual([
      'nexora-friendly',
      'nexora-brutalist',
      'nexora-editorial',
      'nexora-terminal',
    ]);

    load.mockRestore();
    const retry = [...root.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Try again',
    );
    retry!.click();
    await until(harness, () => ratios(root) === 21);

    expect(root.querySelector('[data-themes-failed]')).toBeNull();
    expect(
      [...root.querySelectorAll<HTMLInputElement>('input[name="theme"]')].some(
        (input) => input.disabled,
      ),
    ).toBe(false);
  });

  it('saves a brand preset into the store, which writes it onto html', async () => {
    const { harness, root } = await open();
    const html = TestBed.inject(DOCUMENT).documentElement;

    choose(root, 'brand', 'emerald');
    choose(root, 'theme', 'nexora-friendly');
    harness.detectChanges();
    const save = [...root.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Save preferences',
    );
    save!.click();
    harness.detectChanges();
    TestBed.flushEffects();

    const preferences = TestBed.inject(PreferencesStore).preferences();
    expect(preferences.brand.preset).toBe('emerald');
    expect(preferences.theme).toBe('nexora-friendly');
    expect(html.getAttribute('data-slotted-theme')).toBe('nexora-friendly');
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#059669');
  });

  const typeColour = (root: HTMLElement, value: string) => {
    const field = root.querySelector<HTMLInputElement>('[data-brand-custom] input');
    expect(field).not.toBeNull();
    field!.value = value;
    field!.dispatchEvent(new Event('input', { bubbles: true }));
    field!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  };
  const checkedBrand = (root: HTMLElement) =>
    root.querySelector<HTMLInputElement>('input[name="brand"]:checked')?.value;

  /** The reader's own colour is a candidate like a preset, and choosing it selects Custom. */
  it('takes a custom colour from the colour field', async () => {
    const { harness, root } = await open();
    typeColour(root, '#0f766e');
    harness.detectChanges();

    expect(regions(root)[0]!.accent).toBe('#0f766e');
    expect(checkedBrand(root)).toBe('custom');
  });

  /** A colour typed that is a preset's own chooses the preset, and the custom colour stays as it was. */
  it('chooses the preset a typed colour equals', async () => {
    const { harness, root } = await open();
    typeColour(root, '#E11D48');
    harness.detectChanges();

    expect(checkedBrand(root)).toBe('rose');
    expect(regions(root)[0]!.accent).toBe('#e11d48');
    choose(root, 'brand', 'custom');
    harness.detectChanges();
    expect(regions(root)[0]!.accent).toBe('#7c3aed');
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

  /**
   * The samples show the candidate scheme, not the one `html` carries: a theme
   * card and a swatch are regions naming the draft's scheme.
   */
  it('draws the theme cards and the swatches in the candidate scheme', async () => {
    const { harness, root } = await open();
    const schemes = () =>
      [...root.querySelectorAll<HTMLElement>('[data-theme-sample], .swatch')].map((sample) =>
        sample.getAttribute('data-slotted-scheme'),
      );
    expect(new Set(schemes())).toEqual(new Set(['system']));

    choose(root, 'scheme', 'dark');
    harness.detectChanges();
    expect(new Set(schemes())).toEqual(new Set(['dark']));
    expect(TestBed.inject(DOCUMENT).documentElement.getAttribute('data-slotted-scheme')).not.toBe(
      'dark',
    );
  });

  /** A card's sample is decoration: the radio is named by the theme's name alone. */
  it('names each theme card by its label, not by its sample', async () => {
    const { root } = await open();
    const labels = [...root.querySelectorAll<HTMLInputElement>('input[name="theme"]')].map(
      (input) => {
        const label = root.querySelector<HTMLElement>(`label[for="${input.id}"]`)!;
        const sample = label.querySelector('[data-theme-sample]');
        expect(sample?.getAttribute('aria-hidden'), input.value).toBe('true');
        const named = label.cloneNode(true) as HTMLElement;
        named.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
        return named.textContent?.trim();
      },
    );
    expect(labels).toEqual(['Standard', 'Friendly', 'Brutalist', 'Editorial', 'Terminal']);
  });

  /** The preview's buttons are samples: the select is the one control a preview region adds to the tab order. */
  it('keeps the preview buttons out of the tab order and the select in it', async () => {
    const { root } = await open();
    for (const region of root.querySelectorAll<HTMLElement>('[data-preview-scheme]')) {
      const buttons = [...region.querySelectorAll<HTMLElement>('[data-ui=button]')];
      expect(buttons).toHaveLength(4);
      expect(buttons.every((button) => button.closest('[inert]') !== null)).toBe(true);
      expect(region.querySelector('[data-preview-tabs]')!.hasAttribute('inert')).toBe(true);
      expect(region.querySelector('sl-select')!.closest('[inert]')).toBeNull();
    }
  });

  const regionThemes = (root: HTMLElement) => new Set(regions(root).map((region) => region.theme));

  /**
   * A change in the builder is a candidate like any other: once the changes
   * pause, the candidate is compiled into its own theme, which the three
   * regions name and `html` does not; Reset brings the theme back as it came.
   */
  it('compiles the builder’s changes into the theme the preview names, and resets them', async () => {
    const { harness, root } = await open();
    const html = TestBed.inject(DOCUMENT).documentElement;
    choose(root, 'theme', 'nexora-editorial');
    harness.detectChanges();
    choose(root, 'axis-cards', 'flat');
    harness.detectChanges();
    choose(root, 'font-body', 'jetbrains-mono');
    harness.detectChanges();

    await until(harness, () => regionThemes(root).has('nexora-custom-draft'), 3000);
    expect(regionThemes(root)).toEqual(new Set(['nexora-custom-draft']));
    expect(html.getAttribute('data-slotted-theme')).toBe('default');
    const sheet = TestBed.inject(DOCUMENT).head.querySelector(
      'style[data-slotted-theme-sheet="nexora-custom-draft"]',
    )!.textContent!;
    expect(sheet.match(/--slotted-card-background: [^;]+/g)).toEqual([
      '--slotted-card-background: var(--slotted-surface-sunken)',
    ]);
    expect(sheet).toContain("--slotted-font-family-sans: 'JetBrains Mono Variable'");
    expect(root.querySelector('[data-changes]')!.textContent!.trim()).toBe('2 changes');
    expect(root.querySelector('[data-anatomy] caption')!.textContent).toContain(
      'Editorial, customised',
    );

    (root.querySelector('[data-reset]') as HTMLButtonElement).click();
    harness.detectChanges();
    expect(regionThemes(root)).toEqual(new Set(['nexora-editorial']));
    expect(root.querySelector('[data-changes]')).toBeNull();
    expect(
      root.querySelector<HTMLInputElement>('input[name="axis-cards"][value="theme"]')!.checked,
    ).toBe(true);
  });

  /**
   * A saved customisation is part of the opening wait: the region stays busy
   * until its candidate is compiled. A change made afterwards is no wait — the
   * preview keeps what it shows until the new candidate lands.
   */
  it('waits on opening for a saved customisation, and never for a later change', async () => {
    const store = TestBed.inject(PreferencesStore);
    store.update({ customisation: { ...NO_CUSTOMISATION, cards: 'elevated' } });
    const harness = await RouterTestingHarness.create('/settings/preferences');
    const root = harness.fixture.nativeElement as HTMLElement;
    const region = () => root.querySelector<HTMLElement>('[data-appearance]')!;
    harness.detectChanges();
    expect(region().getAttribute('aria-busy')).toBe('true');

    await until(harness, () => !region().hasAttribute('aria-busy'), 5000);
    expect(regionThemes(root)).toEqual(new Set(['nexora-custom-draft']));

    choose(root, 'axis-motion', 'off');
    harness.detectChanges();
    expect(region().hasAttribute('aria-busy')).toBe(false);
    expect(regionThemes(root)).toEqual(new Set(['nexora-custom-draft']));
  });

  /** The anatomy is the chosen theme object's, layer by layer. */
  it('reads the anatomy of the chosen theme', async () => {
    const { harness, root } = await open();
    const row = (layer: string) => ({
      count: Number(root.querySelector(`[data-layer="${layer}"] [data-count]`)!.textContent),
      entries: root.querySelector(`[data-layer="${layer}"] [data-entries]`)!.textContent!,
    });
    expect(row('components').count).toBe(0);
    expect(row('seeds').entries).toContain('accent #1d4ed8');

    choose(root, 'theme', 'nexora-brutalist');
    harness.detectChanges();
    expect(root.querySelectorAll('[data-anatomy] [data-layer]')).toHaveLength(9);
    expect(row('seeds').entries).toContain('accent #ffd400');
    expect(row('components').count).toBeGreaterThanOrEqual(15);
    expect(row('rules').count).toBeGreaterThanOrEqual(1);
    expect(row('fonts').entries).toBe('Inter Variable, JetBrains Mono Variable');
  });

  /** Save keeps the builder's changes, and `html` names the compiled theme. */
  it('saves a customisation, which html names once it is compiled', async () => {
    const { harness, root } = await open();
    const html = TestBed.inject(DOCUMENT).documentElement;
    choose(root, 'axis-shadow', 'strong');
    harness.detectChanges();
    [...root.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === 'Save preferences')!
      .click();
    harness.detectChanges();

    expect(TestBed.inject(PreferencesStore).preferences().customisation.shadow).toBe('strong');
    await until(harness, () => html.getAttribute('data-slotted-theme') === 'nexora-custom', 3000);
  });

  /**
   * Each group of preferences is a section with its own heading, so the shell
   * layout and the notifications are not read as part of Appearance.
   */
  it('groups the preferences in three sections, each under its own heading', async () => {
    const { root } = await open();
    const sections = [...root.querySelectorAll<HTMLElement>('form [data-ui=section]')]
      .filter((section) => section.parentElement!.closest('[data-ui=section]') === null)
      .map((section) => section.querySelector('h2')?.textContent?.trim());
    expect(sections).toEqual(['Appearance', 'Workspace', 'Notifications']);

    const owner = (selector: string) =>
      root
        .querySelector(selector)!
        .closest('[data-ui=section]')!
        .querySelector('h2')!
        .textContent?.trim();
    expect(owner('input[name="theme"]')).toBe('Appearance');
    expect(owner('input[name="shell"]')).toBe('Workspace');
    expect(owner('[data-ui=checkbox]')).toBe('Notifications');
  });
});
