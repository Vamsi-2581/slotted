import { computed, DestroyRef, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { SEED_NAMES, seedStyle } from '@slotted/theme/seeds';

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
import { catalogueTheme, DEFAULT_THEME_ID, RUNTIME_THEME_IDS } from '../theming/theme-catalogue';
import { SessionStore } from './session.store';

/** The languages the library publishes a catalog for. */
export const NEXORA_LOCALES = ['en-US', 'pt-BR'] as const;
export type NexoraLocale = (typeof NEXORA_LOCALES)[number];

export interface UserPreferences {
  scheme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact' | 'dense';
  /** A theme of the catalogue in `core/theming/theme-catalogue.ts`. */
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
 * attribute. The definitions arrive by `import()`, so a reader who keeps
 * `default` downloads and compiles none of the other three (LIBRARY-FEEDBACK.md
 * row "a theme built at runtime").
 *
 * `html` names a theme only once its sheet is on the page: `default.css`
 * declares every token under `[data-slotted-theme='default']`, and a name with
 * no sheet behind it would leave the page without one. Until then it keeps
 * the theme it shows — `default` on a reload — and the seeds apply at once.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesStore {
  private readonly document = inject(DOCUMENT);
  private readonly sessionStore = inject(SessionStore);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
  private readonly version = signal(0);
  /** The themes whose sheet is on the page. */
  private readonly sheets = signal<ReadonlySet<string>>(new Set([DEFAULT_THEME_ID]));
  /** The load of each runtime theme asked for, settled or not; a failed one is forgotten. */
  private readonly loads = new Map<string, Promise<void>>();
  private readonly disposers: (() => void)[] = [];
  private destroyed = false;
  /** The theme `html` names, which trails the preferences while a sheet loads. */
  private shown = DEFAULT_THEME_ID;

  readonly preferences = computed<UserPreferences>(() => {
    this.version();
    return this.read(this.sessionStore.user()?.id);
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.disposers.forEach((dispose) => dispose());
    });
    effect(() => this.apply(this.preferences()));
    this.media?.addEventListener('change', () => this.apply(this.preferences()));
  }

  /** Whether the sheet of `theme` is on the page; a signal read, so a template follows it. */
  hasSheet(theme: string): boolean {
    return this.sheets().has(theme);
  }

  /**
   * Puts the sheets of the named runtime themes on the page, each once, and
   * settles when all of them are there; `default` is in `styles.css`. A load
   * that fails rejects and is tried again by the next call.
   */
  useThemes(ids: readonly string[] = RUNTIME_THEME_IDS): Promise<void> {
    return Promise.all(
      ids.filter((id) => RUNTIME_THEME_IDS.includes(id)).map((id) => this.load(id)),
    ).then(() => undefined);
  }

  private load(theme: string): Promise<void> {
    let load = this.loads.get(theme);
    if (load === undefined) {
      load = import('../theming/nexora-themes').then(
        ({ applyNexoraTheme }) => {
          if (this.destroyed) return;
          this.disposers.push(applyNexoraTheme(theme, this.document));
          this.sheets.update((sheets) => new Set(sheets).add(theme));
        },
        (error: unknown) => {
          this.loads.delete(theme);
          throw error;
        },
      );
      this.loads.set(theme, load);
    }
    return load;
  }

  apply(preferences: UserPreferences): void {
    const html = this.document.documentElement;
    const scheme =
      preferences.scheme === 'system'
        ? this.media?.matches
          ? 'dark'
          : 'light'
        : preferences.scheme;
    const theme = catalogueTheme(preferences.theme).id;
    if (this.hasSheet(theme)) this.shown = theme;
    else this.useThemes([theme]).catch(() => undefined);
    html.setAttribute('data-slotted-theme', this.shown);
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
        theme: catalogueTheme(stored.theme).id,
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
