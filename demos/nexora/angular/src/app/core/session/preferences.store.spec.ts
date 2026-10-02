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
      theme: 'nexora-sharp',
      brand: { preset: 'custom', custom: '#0f766e' },
      neutral: 'warm',
    });
    TestBed.flushEffects();
    await prefs.useThemes(['nexora-sharp']);
    TestBed.flushEffects();

    expect(html.getAttribute('data-slotted-theme')).toBe('nexora-sharp');
    expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#0f766e');
    expect(html.style.getPropertyValue('--slotted-seed-neutral')).toBe('#78716c');
    const userId = TestBed.inject(SessionStore).user()!.id;
    const stored = JSON.parse(localStorage.getItem(`nexora:preferences:${userId}`) ?? '{}') as {
      theme: string;
      neutral: string;
    };
    expect(stored.theme).toBe('nexora-sharp');
    expect(stored.neutral).toBe('warm');
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
    prefs.update({ neutral: 'pure' });
    TestBed.flushEffects();
    expect(html.style.getPropertyValue('--slotted-seed-neutral')).toBe('#737373');

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

    expect(prefs.preferences().brand).toEqual({ preset: 'violet', custom: '#7c3aed' });
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
        theme: 'nexora-sharp',
        brand: { preset: 'amber', custom: '#7c3aed' },
        neutral: 'cool',
      });
      await prefs.useThemes(['nexora-sharp']);
      TestBed.flushEffects();
      expect(html.getAttribute('data-slotted-scheme')).toBe('light');

      query.matches = true;
      listeners.forEach((listener) => listener());

      expect(html.getAttribute('data-slotted-scheme')).toBe('dark');
      expect(html.style.colorScheme).toBe('dark');
      expect(html.getAttribute('data-slotted-theme')).toBe('nexora-sharp');
      expect(html.style.getPropertyValue('--slotted-seed-accent')).toBe('#d97706');
      expect(html.style.getPropertyValue('--slotted-seed-neutral')).toBe('#64748b');
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

    prefs.update({ theme: 'nexora-sharp' });
    TestBed.flushEffects();
    await prefs.useThemes(['nexora-sharp']);
    prefs.update({ theme: 'nexora-soft' });
    TestBed.flushEffects();
    await prefs.useThemes(['nexora-soft']);
    prefs.update({ theme: 'nexora-sharp', neutral: 'cool' });
    TestBed.flushEffects();
    await prefs.useThemes(['nexora-sharp', 'nexora-soft']);
    expect(names()).toEqual(['nexora-sharp', 'nexora-soft']);
    expect(announced).toBe(2);

    await prefs.useThemes();
    expect(names()).toEqual(['nexora-sharp', 'nexora-soft', 'nexora-editorial']);
    expect(announced).toBe(3);
    expect(['default', ...names()].every((name) => prefs.hasSheet(name!))).toBe(true);
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
