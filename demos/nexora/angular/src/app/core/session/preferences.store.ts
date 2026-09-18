import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';

import { SessionStore } from './session.store';

export interface UserPreferences {
  scheme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact' | 'dense';
  startRoute: string;
  notifications: { emailApprovals: boolean; emailMentions: boolean; inAppOperationalAlerts: boolean };
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  scheme: 'system',
  density: 'comfortable',
  startRoute: '/dashboard',
  notifications: { emailApprovals: true, emailMentions: true, inAppOperationalAlerts: true },
};

/**
 * Preferences live in the browser, per user: the simulated backend keeps no
 * user preferences, and the scheme has to apply before the backend has seeded.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesStore {
  private readonly document = inject(DOCUMENT);
  private readonly sessionStore = inject(SessionStore);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
  private readonly version = signal(0);

  readonly preferences = computed<UserPreferences>(() => {
    this.version();
    return this.read(this.sessionStore.user()?.id);
  });

  constructor() {
    effect(() => this.apply(this.preferences()));
    this.media?.addEventListener('change', () => this.apply(this.preferences()));
  }

  apply(preferences: UserPreferences): void {
    const html = this.document.documentElement;
    const scheme =
      preferences.scheme === 'system'
        ? this.media?.matches
          ? 'dark'
          : 'light'
        : preferences.scheme;
    html.setAttribute('data-slotted-scheme', scheme);
    html.setAttribute('data-slotted-density', preferences.density);
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
        notifications: { ...DEFAULT_PREFERENCES.notifications, ...(stored.notifications ?? {}) },
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }
}
