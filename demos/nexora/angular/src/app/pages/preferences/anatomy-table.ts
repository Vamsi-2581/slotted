import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SlSkeleton } from '@slotted/angular/skeleton';
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
import { SlText } from '@slotted/angular/typography';

import type { AnatomyLayer, AnatomyLayerId } from '../../core/theming/theme-anatomy';

/** The layers in the order a theme is built, as the table names them. */
const LAYERS: readonly {
  readonly id: AnatomyLayerId;
  readonly label: string;
  readonly what: string;
}[] = [
  { id: 'seeds', label: 'Seeds', what: 'The five colours every other colour is derived from' },
  { id: 'recipe', label: 'Recipe', what: 'Derivations that differ from the library’s' },
  { id: 'base', label: 'Scales', what: 'Type, weights, space, corners and lines' },
  { id: 'schemes', label: 'Schemes', what: 'Shadows and the chart palette, per scheme' },
  { id: 'densities', label: 'Densities', what: 'Control heights, insets and sizes' },
  { id: 'motion', label: 'Motion', what: 'Durations and easings' },
  { id: 'components', label: 'Components', what: 'The families’ own tokens' },
  { id: 'rules', label: 'Rules', what: 'CSS for what no token reaches' },
  { id: 'fonts', label: 'Fonts', what: 'The faces the theme brings' },
];
/** How many entries a cell lists before it counts the rest. */
const SHOWN = 6;

/**
 * A theme object read layer by layer: how many entries each layer declares
 * over the library's own theme, and the first of them. With no anatomy yet
 * the nine rows stand, and the count and the entries hold placeholders.
 */
@Component({
  selector: 'app-anatomy-table',
  imports: [
    SlSkeleton,
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .layer {
      display: grid;
      gap: var(--slotted-space-1);
    }
    /* Token names and selectors are code. */
    .entries {
      font-family: var(--slotted-font-family-mono);
      overflow-wrap: anywhere;
    }
    .pending-count {
      inline-size: 3ch;
    }
    .pending-entries {
      inline-size: 24ch;
    }
  `,
  template: `
    <div slTable variant="framed" [columns]="3" layout="fixed" data-anatomy>
      <div slTableContent>
        <caption slTableCaption>
          {{
            caption()
          }}
        </caption>
        <thead slTableHead>
          <tr slTableRow>
            <th slTableColumnHeader>Layer</th>
            <th slTableColumnHeader data-align="end">Entries</th>
            <th slTableColumnHeader>What it sets</th>
          </tr>
        </thead>
        <tbody slTableBody>
          @for (row of rows(); track row.id) {
            <tr slTableRow [attr.data-layer]="row.id">
              <th slTableRowHeader>
                <span class="layer">
                  <span slText size="sm" weight="medium">{{ row.label }}</span>
                  <span slText size="xs" tone="muted">{{ row.what }}</span>
                </span>
              </th>
              <td slTableCell data-align="end">
                @if (row.layer; as layer) {
                  <span slText size="sm" numeric="tabular" data-count>{{ layer.count }}</span>
                } @else {
                  <span class="pending-count" slSkeleton shape="text"></span>
                }
              </td>
              <td slTableCell>
                @if (row.layer; as layer) {
                  <span class="entries" slText size="xs" data-entries>{{ row.entries }}</span>
                } @else {
                  <span class="pending-entries" slSkeleton shape="text"></span>
                }
              </td>
            </tr>
          }
        </tbody>
      </div>
    </div>
  `,
})
export class AnatomyTable {
  /** `null` while the theme module loads. */
  readonly anatomy = input.required<readonly AnatomyLayer[] | null>();
  /** The theme the anatomy reads, as the reader knows it. */
  readonly name = input.required<string>();

  protected readonly caption = computed(
    () => `The layers of ${this.name()}, as its theme object declares them over the library’s`,
  );
  protected readonly rows = computed(() => {
    const anatomy = this.anatomy();
    return LAYERS.map((layer) => {
      const read = anatomy?.find((entry) => entry.id === layer.id) ?? null;
      const rest = (read?.items.length ?? 0) - SHOWN;
      return {
        ...layer,
        layer: read,
        entries:
          read === null || read.items.length === 0
            ? '—'
            : `${read.items.slice(0, SHOWN).join(', ')}${rest > 0 ? `, +${rest} more` : ''}`,
      };
    });
  });
}
