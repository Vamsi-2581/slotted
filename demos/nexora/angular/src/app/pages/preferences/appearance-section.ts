import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  SlAlert,
  SlAlertActions,
  SlAlertContent,
  SlAlertDescription,
  SlAlertTitle,
} from '@slotted/angular/alert';
import { SlBadge } from '@slotted/angular/badge';
import { SlButton } from '@slotted/angular/button';
import { SlColorField } from '@slotted/angular/color-picker';
import { SlField, SlFieldDescription, SlFieldLabel } from '@slotted/angular/field';
import { SlInline } from '@slotted/angular/inline';
import { SlRadio, SlRadioDescription, SlRadioGroup } from '@slotted/angular/radio-group';
import {
  SlSection,
  SlSectionBody,
  SlSectionDescription,
  SlSectionHeader,
  SlSectionHeading,
  SlSectionTitle,
} from '@slotted/angular/section';
import { SlSkeleton, SlSkeletonRegion } from '@slotted/angular/skeleton';
import { SlStack } from '@slotted/angular/stack';
import { SlThemeScope } from '@slotted/angular/theme';
import { SlHeading, SlHeadingLevel } from '@slotted/angular/typography';
import type { Scheme } from '@slotted/theme';

import { PreferencesStore, type UserPreferences } from '../../core/session/preferences.store';
import {
  appearanceSeeds,
  BRAND_PRESETS,
  isNeutralPreset,
  isSeed,
  NEUTRAL_PRESETS,
  type BrandPresetId,
} from '../../core/theming/appearance';
import type * as ContrastReadingModule from '../../core/theming/contrast-reading';
import {
  DEFAULT_THEME_ID,
  RUNTIME_THEME_IDS,
  THEME_CATALOGUE,
} from '../../core/theming/theme-catalogue';
import { AppearancePreview } from './appearance-preview';
import { ContrastTable } from './contrast-table';

/**
 * How Nexora is drawn: the theme, the brand colour, the grey, the scheme and
 * the density, each a candidate in the page's draft until Save.
 *
 * Every sample on this section is a theme region of its own — a theme card
 * names its theme, a swatch carries its seed, both in the candidate scheme —
 * so what it shows is what the recipe derives for that choice, not a colour
 * the page wrote. The preview repeats the candidate in the three schemes, and
 * the contrast table reads the same recipe's numbers.
 *
 * The runtime themes' definitions and the contrast arithmetic load by
 * `import()` when the section opens, and the sheets are compiled then: one
 * wait, one skeleton region, on the application's timing. A sample whose
 * sheet is missing and that no placeholder covers keeps its box and draws
 * nothing, since in `default` it would show another theme. A load that fails
 * leaves the themes without a sheet out of the choice, hides the contrast
 * table and offers a retry.
 */
@Component({
  selector: 'app-appearance-section',
  imports: [
    AppearancePreview,
    ContrastTable,
    SlAlert,
    SlAlertActions,
    SlAlertContent,
    SlAlertDescription,
    SlAlertTitle,
    SlBadge,
    SlButton,
    SlColorField,
    SlField,
    SlFieldDescription,
    SlFieldLabel,
    SlHeading,
    SlHeadingLevel,
    SlInline,
    SlRadio,
    SlRadioDescription,
    SlRadioGroup,
    SlSection,
    SlSectionBody,
    SlSectionDescription,
    SlSectionHeader,
    SlSectionHeading,
    SlSectionTitle,
    SlSkeleton,
    SlSkeletonRegion,
    SlStack,
    SlThemeScope,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    /* The choices, as grids of framed tiles of equal width. */
    .themes {
      display: grid;
      gap: var(--slotted-space-4);
      grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
    }
    .brands {
      display: grid;
      gap: var(--slotted-space-4);
      grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    }
    /* A theme's own heading face, corner, shadow, case and accent, drawn inside its region. */
    /* Items keep their own width, so the title's placeholder is as long as the title. */
    .sample {
      display: grid;
      justify-items: start;
      gap: var(--slotted-space-3);
      padding: var(--slotted-space-5);
      border: var(--slotted-border-width-thin) solid var(--slotted-border-subtle);
      border-radius: var(--slotted-radius-lg);
      background: var(--slotted-surface-raised);
      color: var(--slotted-text);
      box-shadow: var(--slotted-shadow-md);
    }
    .sample-title {
      font-family: var(--slotted-font-family-heading);
      font-size: var(--slotted-font-size-lg);
      font-weight: var(--slotted-font-weight-semibold);
      line-height: var(--slotted-line-height-lg);
    }
    .sample-row {
      justify-self: stretch;
      display: flex;
      align-items: center;
      gap: var(--slotted-space-3);
    }
    .sample-bar {
      flex: 1;
      block-size: var(--slotted-space-4);
      border-radius: var(--slotted-radius-sm);
      background: var(--slotted-border-subtle);
    }
    .swatch {
      flex: none;
      inline-size: var(--slotted-control-icon-size-lg);
      block-size: var(--slotted-control-icon-size-lg);
      border-radius: var(--slotted-radius-full);
      background: var(--slotted-tone-accent-solid);
    }
    .swatch[data-neutral] {
      background: var(--slotted-text-muted);
    }
    /* A sample whose theme's sheet is not on the page keeps its box and draws nothing. */
    .reserved {
      visibility: hidden;
    }
    /* CP-03: the regions hold tables; a track's minimum is stated, never the table's width. */
    .previews {
      display: grid;
      gap: var(--slotted-space-5);
      grid-template-columns: repeat(auto-fit, minmax(min(15rem, 100%), 1fr));
    }
  `,
  template: `
    <section slSection>
      <div slSectionHeader>
        <div slSectionTitle>
          <h2 slSectionHeading>Appearance</h2>
          <p slSectionDescription>
            The theme, the brand colour and the grey Nexora is drawn in. The preview shows a choice
            in every scheme; Save applies it to the whole application.
          </p>
        </div>
      </div>
      <div slSectionBody>
        <div
          slSkeletonRegion
          #wait="slSkeletonRegion"
          [loading]="pending()"
          [messages]="{ label: 'Loading the themes' }"
          data-appearance
        >
          <div slStack [gap]="5">
            @if (failed()) {
              <section slAlert tone="danger" live="polite" data-themes-failed>
                <div slAlertContent>
                  <div slAlertTitle>The themes did not load</div>
                  <p slAlertDescription>
                    Standard stays available. The other themes and the contrast readings need
                    definitions that did not arrive.
                  </p>
                </div>
                <div slAlertActions>
                  <button slButton size="sm" variant="outline" tone="danger" (click)="load()">
                    Try again
                  </button>
                </div>
              </section>
            }

            <div slField>
              <label slFieldLabel>Theme</label>
              <div
                slRadioGroup
                name="theme"
                variant="tile"
                [value]="draft().theme"
                (valueChange)="patch.emit({ theme: $event.value })"
              >
                <div class="themes">
                  @for (entry of themes; track entry.id) {
                    <div slRadio [value]="entry.id" [disabled]="unavailable(entry.id)">
                      <span slStack [gap]="3">
                        @if (!unavailable(entry.id)) {
                          <span
                            class="sample"
                            aria-hidden="true"
                            [class.reserved]="reserved(entry.id, wait.painted())"
                            slThemeScope
                            [attr.data-theme-sample]="entry.id"
                            [theme]="drawn(entry.id)"
                            [scheme]="draft().scheme"
                            [seeds]="seeds()"
                          >
                            <span slSkeleton><span class="sample-title">Orders</span></span>
                            <span class="sample-row">
                              <span class="sample-bar"></span>
                              <span slSkeleton
                                ><span slBadge tone="accent" variant="solid">New</span></span
                              >
                            </span>
                          </span>
                        }
                        {{ entry.label }}
                      </span>
                      <p slRadioDescription>{{ entry.description }}</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <div slField>
              <label slFieldLabel>Brand colour</label>
              <span slFieldDescription>
                The accent every primary action, link and selection is derived from.
              </span>
              <div
                slRadioGroup
                name="brand"
                variant="tile"
                [value]="draft().brand.preset"
                (valueChange)="chooseBrand($event.value)"
              >
                <div class="brands">
                  @for (preset of brands; track preset.id) {
                    <div slRadio [value]="preset.id">
                      <span slInline [gap]="3">
                        <span slSkeleton
                          ><span
                            class="swatch"
                            [class.reserved]="reserved(draft().theme, wait.painted())"
                            slThemeScope
                            [theme]="drawn(draft().theme)"
                            [scheme]="draft().scheme"
                            [seeds]="{ accent: preset.color }"
                          ></span
                        ></span>
                        {{ preset.label }}
                      </span>
                    </div>
                  }
                  <div slRadio value="custom">
                    <span slInline [gap]="3">
                      <span slSkeleton
                        ><span
                          class="swatch"
                          [class.reserved]="reserved(draft().theme, wait.painted())"
                          slThemeScope
                          [theme]="drawn(draft().theme)"
                          [scheme]="draft().scheme"
                          [seeds]="{ accent: draft().brand.custom }"
                        ></span
                      ></span>
                      Custom
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div slField data-brand-custom>
              <label slFieldLabel>Custom colour</label>
              <div
                slColorField
                format="hex"
                [alpha]="false"
                [presets]="presetColors"
                [value]="draft().brand.custom"
                (valueChange)="chooseCustom($event.value)"
              ></div>
              <span slFieldDescription
                >Any colour; the recipe keeps every text on it readable.</span
              >
            </div>

            <div slField>
              <label slFieldLabel>Grey</label>
              <div
                slRadioGroup
                name="neutral"
                orientation="horizontal"
                [value]="draft().neutral"
                (valueChange)="chooseNeutral($event.value)"
              >
                @for (preset of neutrals; track preset.id) {
                  <div slRadio [value]="preset.id">
                    <span slInline [gap]="2">
                      <span slSkeleton
                        ><span
                          class="swatch"
                          data-neutral
                          [class.reserved]="reserved(draft().theme, wait.painted())"
                          slThemeScope
                          [theme]="drawn(draft().theme)"
                          [scheme]="draft().scheme"
                          [seeds]="preset.color === null ? undefined : { neutral: preset.color }"
                        ></span
                      ></span>
                      {{ preset.label }}
                    </span>
                  </div>
                }
              </div>
            </div>

            <div slField>
              <label slFieldLabel>Colour scheme</label>
              <div
                slRadioGroup
                name="scheme"
                [value]="draft().scheme"
                (valueChange)="patch.emit({ scheme: $any($event.value) })"
              >
                <div slRadio value="light">Light</div>
                <div slRadio value="dark">Dark</div>
                <div slRadio value="system">System</div>
              </div>
            </div>

            <div slField>
              <label slFieldLabel>Density</label>
              <div
                slRadioGroup
                name="density"
                [value]="draft().density"
                (valueChange)="patch.emit({ density: $any($event.value) })"
              >
                <div slRadio value="comfortable">Comfortable</div>
                <div slRadio value="compact">Compact</div>
                <div slRadio value="dense">Dense</div>
              </div>
            </div>

            <div slStack [gap]="4" slHeadingLevel>
              <h3 slHeading size="md">Preview</h3>
              <div class="previews">
                @for (scheme of schemes; track scheme) {
                  <app-appearance-preview
                    [class.reserved]="reserved(draft().theme, wait.painted())"
                    [theme]="drawn(draft().theme)"
                    [scheme]="scheme"
                    [density]="draft().density"
                    [seeds]="seeds()"
                  />
                }
              </div>
            </div>

            @if (!failed() || readings() !== null) {
              <app-contrast-table [readings]="readings()" />
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AppearanceSection {
  readonly draft = input.required<UserPreferences>();
  readonly patch = output<Partial<UserPreferences>>();

  private readonly store = inject(PreferencesStore);

  protected readonly themes = THEME_CATALOGUE;
  protected readonly brands = BRAND_PRESETS;
  protected readonly neutrals = NEUTRAL_PRESETS;
  protected readonly schemes: readonly Scheme[] = ['light', 'dark', 'high-contrast'];
  protected readonly presetColors = BRAND_PRESETS.map((preset) => preset.color);

  /** The last load of the runtime sheets failed, and nothing has been tried since. */
  protected readonly failed = signal(false);
  /** The contrast arithmetic, once its module has loaded. */
  private readonly contrast = signal<typeof ContrastReadingModule | null>(null);
  /** Some runtime sheet, or the contrast arithmetic, is still on its way. */
  protected readonly pending = computed(
    () =>
      !this.failed() &&
      (this.contrast() === null || RUNTIME_THEME_IDS.some((id) => !this.store.hasSheet(id))),
  );

  constructor() {
    this.load();
  }

  /** The candidate seeds, as the preview regions and the theme cards carry them. */
  protected readonly seeds = computed(() =>
    appearanceSeeds(this.draft().brand, this.draft().neutral),
  );
  protected readonly readings = computed(
    () => this.contrast()?.contrastReadings(this.draft().theme, this.seeds()) ?? null,
  );

  /** Puts every runtime sheet on the page and loads the contrast arithmetic; the samples wait for both. */
  protected load(): void {
    this.failed.set(false);
    Promise.all([this.store.useThemes(), import('../../core/theming/contrast-reading')]).then(
      ([, contrast]) => this.contrast.set(contrast),
      () => this.failed.set(true),
    );
  }

  /** The theme a region names: `theme` once its sheet is on the page, `default` until then. */
  protected drawn(theme: string): string {
    return this.store.hasSheet(theme) ? theme : DEFAULT_THEME_ID;
  }

  /**
   * A sample drawn in `default` for a theme whose sheet is missing would show
   * another theme: it keeps its box and draws nothing until the placeholders
   * are painted over it or the sheet arrives.
   */
  protected reserved(theme: string, painted: boolean): boolean {
    return !painted && !this.store.hasSheet(theme);
  }

  /** A theme whose sheet failed to load cannot be drawn, so it cannot be chosen. */
  protected unavailable(theme: string): boolean {
    return this.failed() && !this.store.hasSheet(theme);
  }

  protected chooseBrand(value: unknown): void {
    if (value !== 'custom' && !BRAND_PRESETS.some((preset) => preset.id === value)) return;
    this.patch.emit({
      brand: { ...this.draft().brand, preset: value as BrandPresetId | 'custom' },
    });
  }

  /**
   * A colour typed or picked becomes the custom brand, and Custom is chosen
   * with it; one of the presets offered in the panel chooses that preset.
   * The field writes hex in capitals; the store keeps it in lower case.
   */
  protected chooseCustom(value: string): void {
    if (!isSeed(value)) return;
    const color = value.toLowerCase();
    const preset = BRAND_PRESETS.find((entry) => entry.color === color);
    this.patch.emit({
      brand: preset
        ? { ...this.draft().brand, preset: preset.id }
        : { preset: 'custom', custom: color },
    });
  }

  protected chooseNeutral(value: unknown): void {
    if (isNeutralPreset(value)) this.patch.emit({ neutral: value });
  }
}
