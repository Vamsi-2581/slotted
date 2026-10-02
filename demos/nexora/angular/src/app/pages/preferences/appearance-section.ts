import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { SlBadge } from '@slotted/angular/badge';
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
import { SlStack } from '@slotted/angular/stack';
import {
  SlTable,
  SlTableBody,
  SlTableCaption,
  SlTableCell,
  SlTableColumnHeader,
  SlTableContent,
  SlTableHead,
  SlTableRow,
  SlTableRowHeader,
} from '@slotted/angular/table';
import { SlThemeScope } from '@slotted/angular/theme';
import { SlHeading, SlText } from '@slotted/angular/typography';
import { parseSeed, SCHEMES } from '@slotted/theme';

import { PreferencesStore, type UserPreferences } from '../../core/session/preferences.store';
import {
  appearanceSeeds,
  BRAND_PRESETS,
  isNeutralPreset,
  NEUTRAL_PRESETS,
  type BrandPresetId,
} from '../../core/theming/appearance';
import { contrastReadings } from '../../core/theming/contrast-reading';
import { NEXORA_THEMES } from '../../core/theming/nexora-themes';
import { AppearancePreview } from './appearance-preview';

const SCHEME_NAMES = { light: 'Light', dark: 'Dark', 'high-contrast': 'High contrast' } as const;

/**
 * How Nexora is drawn: the theme, the brand colour, the grey, the scheme and
 * the density, each a candidate in the page's draft until Save.
 *
 * Every sample on this section is a theme region of its own — a theme card
 * names its theme, a swatch carries its seed — so what it shows is what the
 * recipe derives for that choice, not a colour the page wrote. The preview
 * repeats the candidate in the three schemes, and the contrast table reads the
 * same recipe's numbers.
 */
@Component({
  selector: 'app-appearance-section',
  imports: [
    AppearancePreview,
    SlBadge,
    SlColorField,
    SlField,
    SlFieldDescription,
    SlFieldLabel,
    SlHeading,
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
    SlStack,
    SlTable,
    SlTableBody,
    SlTableCaption,
    SlTableCell,
    SlTableColumnHeader,
    SlTableContent,
    SlTableHead,
    SlTableRow,
    SlTableRowHeader,
    SlText,
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
    /* A theme's own corner, shadow and accent, drawn inside its region. */
    .sample {
      display: flex;
      align-items: center;
      gap: var(--slotted-space-3);
      padding: var(--slotted-space-5);
      border: var(--slotted-border-width-thin) solid var(--slotted-border-subtle);
      border-radius: var(--slotted-radius-lg);
      background: var(--slotted-surface-raised);
      box-shadow: var(--slotted-shadow-md);
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
        <div slStack [gap]="7">
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
                  <div slRadio [value]="entry.id">
                    <span slStack [gap]="3">
                      <span class="sample" slThemeScope [theme]="entry.id" [seeds]="seeds()">
                        <span slBadge tone="accent" variant="solid">Aa</span>
                        <span class="sample-bar"></span>
                      </span>
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
                      <span
                        class="swatch"
                        slThemeScope
                        [theme]="draft().theme"
                        [seeds]="{ accent: preset.color }"
                      ></span>
                      {{ preset.label }}
                    </span>
                  </div>
                }
                <div slRadio value="custom">
                  <span slInline [gap]="3">
                    <span
                      class="swatch"
                      slThemeScope
                      [theme]="draft().theme"
                      [seeds]="{ accent: draft().brand.custom }"
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
            <span slFieldDescription>Any colour; the recipe keeps every text on it readable.</span>
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
                    <span
                      class="swatch"
                      data-neutral
                      slThemeScope
                      [theme]="draft().theme"
                      [seeds]="preset.color === null ? undefined : { neutral: preset.color }"
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

          <div slStack [gap]="4">
            <h3 slHeading size="md">Preview</h3>
            <div class="previews">
              @for (scheme of schemes; track scheme) {
                <app-appearance-preview
                  [theme]="draft().theme"
                  [scheme]="scheme"
                  [density]="draft().density"
                  [seeds]="seeds()"
                />
              }
            </div>
          </div>

          <div slTable variant="framed" [columns]="4" data-contrast>
            <div slTableContent>
              <caption slTableCaption>
                Contrast of the chosen colours, as the theme’s recipe computes them
              </caption>
              <thead slTableHead>
                <tr slTableRow>
                  <th slTableColumnHeader>Pair</th>
                  @for (reading of readings(); track reading.scheme) {
                    <th slTableColumnHeader>{{ schemeNames[reading.scheme] }}</th>
                  }
                </tr>
              </thead>
              <tbody slTableBody>
                @for (row of rows(); track row.id) {
                  <tr slTableRow>
                    <th slTableRowHeader>{{ row.label }}</th>
                    @for (cell of row.cells; track cell.scheme) {
                      <td slTableCell>
                        <span slInline [gap]="2">
                          <span slText size="sm" numeric="tabular">{{ cell.ratio }}</span>
                          <span
                            slBadge
                            size="sm"
                            variant="soft"
                            [tone]="cell.passes ? 'success' : 'danger'"
                            >{{ cell.passes ? 'Meets' : 'Below' }} {{ cell.floor }}:1</span
                          >
                        </span>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AppearanceSection {
  readonly draft = input.required<UserPreferences>();
  readonly patch = output<Partial<UserPreferences>>();

  protected readonly themes = NEXORA_THEMES;
  protected readonly brands = BRAND_PRESETS;
  protected readonly neutrals = NEUTRAL_PRESETS;
  protected readonly schemes = SCHEMES;
  protected readonly schemeNames = SCHEME_NAMES;
  protected readonly presetColors = BRAND_PRESETS.map((preset) => preset.color);

  constructor() {
    // Every theme card and the preview name a theme the reader may not use yet.
    inject(PreferencesStore).useThemes();
  }

  /** The candidate seeds, as the preview regions and the theme cards carry them. */
  protected readonly seeds = computed(() =>
    appearanceSeeds(this.draft().brand, this.draft().neutral),
  );
  protected readonly readings = computed(() => contrastReadings(this.draft().theme, this.seeds()));
  /** The readings turned to the table's rows: one pair, its ratio in each scheme. */
  protected readonly rows = computed(() => {
    const readings = this.readings();
    return readings[0]!.pairs.map((pair, index) => ({
      id: pair.id,
      label: pair.label,
      cells: readings.map((reading) => ({
        scheme: reading.scheme,
        ratio: `${reading.pairs[index]!.ratio.toFixed(2)}:1`,
        floor: reading.pairs[index]!.floor,
        passes: reading.pairs[index]!.passes,
      })),
    }));
  });

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
    if (parseSeed(value) === null) return;
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
