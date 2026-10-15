import { computed, Directive, input } from '@angular/core';
import type { Density, Scheme } from '@slotted/theme';
import { seedStyle, type SeedName } from '@slotted/theme/seeds';

/** The five seeds a theme derives its colours from (`@slotted/theme` › `SEED_NAMES`). */
export type ThemeSeedName = SeedName;
/** A recipe scheme (`@slotted/theme` › `Scheme`), plus `system`: resolved from `prefers-color-scheme`. */
export type ThemeSchemeName = Scheme | 'system';
export type ThemeDensityName = Density;

/**
 * A subtree with its own theme, scheme, density or seeds, written on the host
 * as the attributes and custom properties an application can write by hand.
 */
@Directive({
  selector: '[slThemeScope]',
  host: {
    '[attr.data-slotted-theme]': 'theme() ?? null',
    '[attr.data-slotted-scheme]': 'scheme() ?? null',
    '[attr.data-slotted-density]': 'density() ?? null',
    '[attr.data-slotted-seeds]': "seedProperties() ? '' : null",
    '[style]': 'seedProperties()',
  },
})
export class SlThemeScope {
  readonly theme = input<string | undefined>(undefined);
  readonly scheme = input<ThemeSchemeName | undefined>(undefined);
  readonly density = input<ThemeDensityName | undefined>(undefined);
  readonly seeds = input<Readonly<Partial<Record<ThemeSeedName, string>>> | undefined>(undefined);

  protected readonly seedProperties = computed(() => {
    const style = seedStyle(this.seeds() ?? {});
    return Object.keys(style).length > 0 ? style : null;
  });
}
