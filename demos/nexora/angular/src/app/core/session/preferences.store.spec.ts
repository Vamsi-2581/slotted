import { ApplicationInitStatus, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { NO_CUSTOMISATION } from '../theming/customisation';
import { PreferencesStore } from './preferences.store';
import { SessionStore } from './session.store';

describe('PreferencesStore', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend()] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
    await TestBed.inject(SessionStore).load();
  });

  it('writes the scheme and density onto html and persists per user', async () => {
    const prefs = TestBed.inject(PreferencesStore);
    const html = TestBed.inject(DOCUMENT).documentElement;
    prefs.update({ scheme: 'dark', density: 'compact' });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    TestBed.flushEffects();
    expect(html.getAttribute('data-slotted-scheme')).toBe('dark');
    expect(html.getAttribute('data-slotted-density')).toBe('compact');
    const userId = TestBed.inject(SessionStore).user()!.id;
    expect(
      (
        JSON.parse(localStorage.getItem(`nexora:preferences:${userId}`) ?? '{}') as {
          scheme: string;
        }
      ).scheme,
    ).toBe('dark');
  });

  /**
   * The shell arrangement is not written onto `html`: it is an input of one
   * shell, so the store only has to keep it and give it back.
   */
  it('keeps the shell arrangement per user, inset until the reader says otherwise', () => {
    const prefs = TestBed.inject(PreferencesStore);
    expect(prefs.preferences().shell).toBe('inset');

    prefs.update({ shell: 'floating' });

    expect(prefs.preferences().shell).toBe('floating');
    const userId = TestBed.inject(SessionStore).user()!.id;
    const stored = JSON.parse(localStorage.getItem(`nexora:preferences:${userId}`) ?? '{}') as {
      shell: string;
    };
    expect(stored.shell).toBe('floating');
  });

  /**
   * The theme is an attribute and the brand and the neutral are seeds, all on
   * `html`: the theme sheets scope by the attribute, and an inline seed on the
   * element that names the theme outranks the seed the sheet declares there.
   */
  it('writes the theme and the seeds of the brand and the neutral onto html', async () => {
    const prefs = TestBed.inject(PreferencesStore);
    const html = TestBed.inject(DOCUMENT).documentElement;
    TestBed.flushEffects();
    expect(html.getAttribute('data-slotted-theme')).toBe('default');
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#7c3aed');
    expect(html.style.getPropertyValue('--slotted-seed-neutral')).toBe('');

    prefs.update({
      theme: 'nexora-brutalist',
      brand: { preset: 'custom', custom: '#0f766e' },
      neutral: 'clay',
    });
    TestBed.flushEffects();
    await prefs.useThemes(['nexora-brutalist']);
    TestBed.flushEffects();

    expect(html.getAttribute('data-slotted-theme')).toBe('nexora-brutalist');
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#0f766e');
    expect(html.style.getPropertyValue('--slotted-seed-neutral')).toBe('#9c6644');
    const userId = TestBed.inject(SessionStore).user()!.id;
    const stored = JSON.parse(localStorage.getItem(`nexora:preferences:${userId}`) ?? '{}') as {
      theme: string;
      neutral: string;
    };
    expect(stored.theme).toBe('nexora-brutalist');
    expect(stored.neutral).toBe('clay');
  });

  /**
   * `default.css` declares every token under `[data-slotted-theme='default']`,
   * so a name whose sheet is not on the page yet would leave `html` without a
   * single token. The attribute keeps the theme it shows until the sheet of the
   * new one exists; the seeds do not wait.
   */
  it('names a runtime theme on html only once its sheet is on the page', async () => {
    const doc = TestBed.inject(DOCUMENT);
    const prefs = TestBed.inject(PreferencesStore);
    const html = doc.documentElement;
    TestBed.flushEffects();

    prefs.update({ theme: 'nexora-editorial', brand: { preset: 'amber', custom: '#7c3aed' } });
    TestBed.flushEffects();
    expect(html.getAttribute('data-slotted-theme')).toBe('default');
    expect(doc.head.querySelector('style[data-slotted-theme-sheet]')).toBeNull();
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#d97706');

    await prefs.useThemes(['nexora-editorial']);
    TestBed.flushEffects();
    expect(
      doc.head.querySelector('style[data-slotted-theme-sheet="nexora-editorial"]'),
    ).not.toBeNull();
    expect(html.getAttribute('data-slotted-theme')).toBe('nexora-editorial');
  });

  /** A seed the preferences no longer name leaves `html`, so the theme's own value holds again. */
  it('removes a seed the preferences stop writing', () => {
    const prefs = TestBed.inject(PreferencesStore);
    const html = TestBed.inject(DOCUMENT).documentElement;
    prefs.update({ neutral: 'plum' });
    TestBed.flushEffects();
    expect(html.style.getPropertyValue('--slotted-seed-neutral')).toBe('#7e5a86');

    prefs.update({ neutral: 'theme' });
    TestBed.flushEffects();
    expect(html.style.getPropertyValue('--slotted-seed-neutral')).toBe('');
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#7c3aed');
  });

  /** `seedStyle` refuses the colour, and the brand is read as the default rather than breaking the page. */
  it('reads a stored brand that is no colour as the default', () => {
    const prefs = TestBed.inject(PreferencesStore);
    const html = TestBed.inject(DOCUMENT).documentElement;
    const userId = TestBed.inject(SessionStore).user()!.id;
    localStorage.setItem(
      `nexora:preferences:${userId}`,
      JSON.stringify({
        brand: { preset: 'custom', custom: 'red; color: blue' },
        theme: 'retired',
        neutral: 'teal',
      }),
    );
    prefs.update({});
    TestBed.flushEffects();

    expect(prefs.preferences().brand).toEqual({ preset: 'theme', custom: '#7c3aed' });
    expect(prefs.preferences().theme).toBe('default');
    expect(prefs.preferences().neutral).toBe('theme');
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#7c3aed');
    expect(html.getAttribute('data-slotted-theme')).toBe('default');
  });

  /** Only the broken half is dropped: the preset the reader chose holds, and Custom starts over. */
  it('keeps a stored preset whose custom colour is no colour', () => {
    const prefs = TestBed.inject(PreferencesStore);
    const html = TestBed.inject(DOCUMENT).documentElement;
    const userId = TestBed.inject(SessionStore).user()!.id;
    localStorage.setItem(
      `nexora:preferences:${userId}`,
      JSON.stringify({ brand: { preset: 'rose', custom: 'url(x)' } }),
    );
    prefs.update({});
    TestBed.flushEffects();

    expect(prefs.preferences().brand).toEqual({ preset: 'rose', custom: '#7c3aed' });
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#e11d48');
  });

  /** The system scheme follows the media query; the theme and the seeds stay what the reader chose. */
  it('keeps the theme and the seeds when the system scheme changes', async () => {
    const listeners: (() => void)[] = [];
    const query = {
      matches: false,
      addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
    };
    const view = TestBed.inject(DOCUMENT).defaultView!;
    const own = Object.getOwnPropertyDescriptor(view, 'matchMedia');
    Object.defineProperty(view, 'matchMedia', { configurable: true, value: () => query });
    try {
      const prefs = TestBed.inject(PreferencesStore);
      const html = TestBed.inject(DOCUMENT).documentElement;
      prefs.update({
        scheme: 'system',
        theme: 'nexora-brutalist',
        brand: { preset: 'amber', custom: '#7c3aed' },
        neutral: 'ocean',
      });
      await prefs.useThemes(['nexora-brutalist']);
      TestBed.flushEffects();
      expect(html.getAttribute('data-slotted-scheme')).toBe('light');

      query.matches = true;
      listeners.forEach((listener) => listener());

      expect(html.getAttribute('data-slotted-scheme')).toBe('dark');
      expect(html.style.colorScheme).toBe('dark');
      expect(html.getAttribute('data-slotted-theme')).toBe('nexora-brutalist');
      expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#d97706');
      expect(html.style.getPropertyValue('--slotted-seed-neutral')).toBe('#0e7490');
    } finally {
      if (own) Object.defineProperty(view, 'matchMedia', own);
      else delete (view as { matchMedia?: unknown }).matchMedia;
    }
  });

  /**
   * A runtime theme is compiled the first time it is used, and never again: a
   * reader on `default` carries no runtime sheet (`default` is in
   * `styles.css`), and a change back to a theme already used moves only the
   * attribute.
   */
  it('applies a runtime theme sheet once, the first time the theme is used', async () => {
    const doc = TestBed.inject(DOCUMENT);
    const prefs = TestBed.inject(PreferencesStore);
    let announced = 0;
    doc.addEventListener('slotted-themechange', () => (announced += 1));
    const names = () =>
      [...doc.head.querySelectorAll('style[data-slotted-theme-sheet]')].map((sheet) =>
        sheet.getAttribute('data-slotted-theme-sheet'),
      );
    TestBed.flushEffects();
    await prefs.useThemes([]);
    expect(names()).toEqual([]);

    prefs.update({ theme: 'nexora-brutalist' });
    TestBed.flushEffects();
    await prefs.useThemes(['nexora-brutalist']);
    prefs.update({ theme: 'nexora-friendly' });
    TestBed.flushEffects();
    await prefs.useThemes(['nexora-friendly']);
    prefs.update({ theme: 'nexora-brutalist', neutral: 'ocean' });
    TestBed.flushEffects();
    await prefs.useThemes(['nexora-brutalist', 'nexora-friendly']);
    expect(names()).toEqual(['nexora-brutalist', 'nexora-friendly']);
    expect(announced).toBe(2);

    await prefs.useThemes();
    expect(names()).toEqual([
      'nexora-brutalist',
      'nexora-friendly',
      'nexora-editorial',
      'nexora-terminal',
    ]);
    expect(announced).toBe(4);
    expect(['default', ...names()].every((name) => prefs.hasSheet(name!))).toBe(true);
  });

  /**
   * The brand the theme brings writes no accent, so the theme sheet's own
   * holds; Standard's own is Nexora's violet. A status colour is one more seed.
   */
  it('writes the theme’s own accent only for Standard, and the status colours as seeds', async () => {
    const prefs = TestBed.inject(PreferencesStore);
    const html = TestBed.inject(DOCUMENT).documentElement;
    prefs.update({
      theme: 'nexora-terminal',
      status: { success: null, warning: null, danger: '#be123c' },
    });
    TestBed.flushEffects();
    await prefs.useThemes(['nexora-terminal']);
    TestBed.flushEffects();

    expect(html.getAttribute('data-slotted-theme')).toBe('nexora-terminal');
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('');
    expect(html.style.getPropertyValue('--slotted-seed-danger')).toBe('#be123c');
    expect(html.style.getPropertyValue('--slotted-seed-success')).toBe('');

    prefs.update({ theme: 'default' });
    TestBed.flushEffects();
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#7c3aed');
  });

  /** A stored customisation and stored status colours are read axis by axis and seed by seed. */
  it('reads a stored customisation and status colours, dropping only what it does not offer', () => {
    const prefs = TestBed.inject(PreferencesStore);
    const userId = TestBed.inject(SessionStore).user()!.id;
    localStorage.setItem(
      `nexora:preferences:${userId}`,
      JSON.stringify({
        customisation: { radius: 12, body: 'papyrus', cards: 'flat', motion: 'off', scale: 300 },
        status: { success: '#16a34a', warning: 'yellow', danger: 42 },
      }),
    );
    prefs.update({});

    expect(prefs.preferences().customisation).toEqual({
      radius: 12,
      body: null,
      heading: null,
      scale: null,
      border: null,
      shadow: null,
      motion: 'off',
      cards: 'flat',
      chart: null,
    });
    expect(prefs.preferences().status).toEqual({ success: '#16a34a', warning: null, danger: null });
  });

  /**
   * A customised theme is compiled in the browser under `nexora-custom`, and
   * `html` names it once the sheet is there; without a change left, `html`
   * names the theme under it again.
   */
  it('names the compiled custom theme on html, and the base theme after a reset', async () => {
    const doc = TestBed.inject(DOCUMENT);
    const prefs = TestBed.inject(PreferencesStore);
    const html = doc.documentElement;
    await prefs.useThemes(['nexora-brutalist']);
    prefs.update({
      theme: 'nexora-brutalist',
      customisation: { ...NO_CUSTOMISATION, cards: 'flat' },
    });
    TestBed.flushEffects();

    await vi.waitFor(() => {
      TestBed.flushEffects();
      expect(html.getAttribute('data-slotted-theme')).toBe('nexora-custom');
    });
    const sheet = doc.head.querySelector('style[data-slotted-theme-sheet="nexora-custom"]');
    expect(sheet?.textContent).toContain(
      '--slotted-card-background: var(--slotted-surface-sunken)',
    );
    expect(sheet?.textContent).toContain('text-transform: uppercase');

    prefs.update({ customisation: NO_CUSTOMISATION });
    TestBed.flushEffects();
    expect(html.getAttribute('data-slotted-theme')).toBe('nexora-brutalist');
  });

  /**
   * The candidate compiles 200 ms after the last change: a burst of changes —
   * a slider dragged across its range — compiles once, with its last value,
   * and asking again for what is on the page compiles nothing.
   */
  it('compiles a burst of candidate changes once, with the last one', async () => {
    const doc = TestBed.inject(DOCUMENT);
    const prefs = TestBed.inject(PreferencesStore);
    let compiled = 0;
    doc.addEventListener('slotted-themechange', (event) => {
      if ((event as CustomEvent<{ name: string }>).detail.name === 'nexora-custom-draft')
        compiled += 1;
    });
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let radius = 0; radius <= 18; radius += 2) {
      prefs.previewCustomisation('nexora-friendly', { ...NO_CUSTOMISATION, radius });
      await wait(10);
    }
    await wait(150);
    expect(compiled).toBe(0);

    await vi.waitFor(() => expect(compiled).toBe(1));
    expect(prefs.previewTheme('nexora-friendly')?.base?.['--slotted-radius-lg']).toBe('18px');
    expect(prefs.previewTheme('nexora-terminal')).toBeNull();
    expect(prefs.previewHolds('nexora-friendly', { ...NO_CUSTOMISATION, radius: 18 })).toBe(true);
    expect(doc.documentElement.getAttribute('data-slotted-theme')).toBe('default');

    prefs.previewCustomisation('nexora-friendly', { ...NO_CUSTOMISATION, radius: 18 });
    await wait(400);
    expect(compiled).toBe(1);

    /* Back to the theme as it came: the candidate is forgotten, so the next one shows nothing older. */
    prefs.previewCustomisation('nexora-friendly', NO_CUSTOMISATION);
    expect(prefs.previewTheme('nexora-friendly')).toBeNull();
  });

  /** A stored arrangement the catalogue no longer has falls back to the default. */
  it('reads an arrangement it does not know as the default', () => {
    const prefs = TestBed.inject(PreferencesStore);
    const userId = TestBed.inject(SessionStore).user()!.id;
    localStorage.setItem(`nexora:preferences:${userId}`, JSON.stringify({ shell: 'retired' }));
    prefs.update({});
    expect(prefs.preferences().shell).toBe('inset');
  });
});
