import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SlBadge } from '@slotted/angular/badge';
import { SlInline } from '@slotted/angular/inline';
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

import type { ContrastReading } from '../../core/theming/contrast-reading';

const SCHEME_NAMES = { light: 'Light', dark: 'Dark', 'high-contrast': 'High contrast' } as const;

/**
 * The contrast readings of a candidate appearance: one row per pair, one
 * column per scheme, each ratio beside the floor it is held to.
 */
@Component({
  selector: 'app-contrast-table',
  imports: [
    SlBadge,
    SlInline,
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
  template: `
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
                <td slTableCell [attr.data-pair]="row.id" [attr.data-scheme]="cell.scheme">
                  <span slInline [gap]="2">
                    <span slText size="sm" numeric="tabular" data-ratio>{{ cell.ratio }}</span>
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
  `,
})
export class ContrastTable {
  readonly readings = input.required<readonly ContrastReading[]>();

  protected readonly schemeNames = SCHEME_NAMES;
  /** The readings turned to the table's rows: one pair, its ratio in each scheme. */
  protected readonly rows = computed(() => {
    const readings = this.readings();
    return (readings[0]?.pairs ?? []).map((pair, index) => ({
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
}
