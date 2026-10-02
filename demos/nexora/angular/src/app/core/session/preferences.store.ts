import { computed, DestroyRef, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { applyTheme, SEED_NAMES, seedStyle } from '@slotted/theme';

import { DEFAULT_SHELL_PRESET, shellPreset, type ShellPresetId } from '../shell/shell-presets';
import {
  appearanceSeeds,
  DEFAULT_BRAND,
  DEFAULT_NEUTRAL,
  isNeutralPreset,
  readBrand,
  type BrandPreference,
  type NeutralPresetId,
} from '../theming/appearance';
import { DEFAULT_THEME_ID, nexoraTheme, RUNTIME_THEMES } from '../theming/nexora-themes';
import { SessionStore } from './session.store';

/** The languages the library publishes a catalog for. */
export const NEXORA_LOCALES = ['en-US', 'pt-BR'] as const;
export type NexoraLocale = (typeof NEXORA_LOCALES)[number];

export interface UserPreferences {
  scheme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact' | 'dense';
  /** A theme of the catalogue in `core/theming/nexora-themes.ts`. */
  theme: string;
  /** The accent seed: a preset, or the reader's own colour. */
  brand: BrandPreference;
  /** The neutral seed, or `theme` for the theme's own. */
  neutral: NeutralPresetId;
  /** The language the library writes in; the demo's own pages stay in English. */
  locale: NexoraLocale;
  /** The arrangement of the shell, one of the catalogue in `core/shell/shell-presets.ts`. */
  shell: ShellPresetId;
  startRoute: string;
  notifications: {
    emailApprovals: boolean;
    emailMentions: boolean;
    inAppOperationalAlerts: boolean;
  };
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  scheme: 'system',
  density: 'comfortable',
  theme: DEFAULT_THEME_ID,
  brand: DEFAULT_BRAND,
  neutral: DEFAULT_NEUTRAL,
  locale: 'en-US',
  shell: DEFAULT_SHELL_PRESET,
  startRoute: '/dashboard',
  notifications: { emailApprovals: true, emailMentions: true, inAppOperationalAlerts: true },
};

/**
 * Preferences live in the browser, per user: the simulated backend keeps no
 * user preferences, and the scheme has to apply before the backend has seeded.
 *
 * The theme, the scheme, the density, the seeds and the language are written
 * onto `html`, because everything under it answers them. The arrangement is an
 * input of one shell, so the shell reads it here instead.
 *
 * A runtime theme's sheet is compiled once, the first time the theme is
 * used — named by the preferences, or shown by the appearance section — and
 * stays until the application ends; a later change of theme moves only the
 * attribute. A reader who keeps `default` never pays for the other three
 * (179 kB of CSS each, LIBRARY-FEEDBACK.md row "a theme built at runtime").
 */
@Injectable({ providedIn: 'root' })
export class PreferencesStore {
  private readonly document = inject(DOCUMENT);
  private readonly sessionStore = inject(SessionStore);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
  private readonly version = signal(0);
  /** The disposer of every runtime theme sheet applied so far, by theme name. */
  private readonly sheets = new Map<string, () => void>();

  readonly preferences = computed<UserPreferences>(() => {
    this.version();
    return this.read(this.sessionStore.user()?.id);
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.sheets.forEach((dispose) => dispose()));
    effect(() => this.apply(this.preferences()));
    this.media?.addEventListener('change', () => this.apply(this.preferences()));
  }

  /** Puts the sheets of the named runtime themes on the page, each once; `default` is in `styles.css`. */
  useThemes(ids: readonly string[] = RUNTIME_THEMES.map((theme) => theme.name)): void {
    for (const theme of RUNTIME_THEMES) {
      if (!ids.includes(theme.name) || this.sheets.has(theme.name)) continue;
      this.sheets.set(theme.name, applyTheme(theme, { document: this.document }));
    }
  }

  apply(preferences: UserPreferences): void {
    const html = this.document.documentElement;
    const scheme =
      preferences.scheme === 'system'
        ? this.media?.matches
          ? 'dark'
          : 'light'
        : preferences.scheme;
    const theme = nexoraTheme(preferences.theme).id;
    this.useThemes([theme]);
    html.setAttribute('data-slotted-theme', theme);
    const seeds = seedStyle(appearanceSeeds(preferences.brand, preferences.neutral));
    for (const name of SEED_NAMES) {
      const property = `--slotted-seed-${name}`;
      if (property in seeds) html.style.setProperty(property, seeds[property]!);
      else html.style.removeProperty(property);
    }
    html.setAttribute('data-slotted-scheme', scheme);
    html.setAttribute('data-slotted-density', preferences.density);
    html.lang = preferences.locale;
    html.style.colorScheme = scheme;
  }

  update(patch: Partial<UserPreferences>): void {
    const userId = this.sessionStore.user()?.id;
    if (userId === undefined) return;
    const current = this.read(userId);
    const next: UserPreferences = {
      ...current,
      ...patch,
      notifications: { ...current.notifications, ...(patch.notifications ?? {}) },
    };
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
      const stored = JSON.parse(
        localStorage.getItem(this.key(userId)) ?? 'null',
      ) as Partial<UserPreferences> | null;
      if (stored === null) return DEFAULT_PREFERENCES;
      return {
        ...DEFAULT_PREFERENCES,
        ...stored,
        shell: shellPreset(stored.shell).id,
        theme: nexoraTheme(stored.theme).id,
        brand: readBrand(stored.brand),
        neutral: isNeutralPreset(stored.neutral) ? stored.neutral : DEFAULT_NEUTRAL,
        locale: NEXORA_LOCALES.includes(stored.locale as NexoraLocale)
          ? (stored.locale as NexoraLocale)
          : DEFAULT_PREFERENCES.locale,
        notifications: { ...DEFAULT_PREFERENCES.notifications, ...(stored.notifications ?? {}) },
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }
}
