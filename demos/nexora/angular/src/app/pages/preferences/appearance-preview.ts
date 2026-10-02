import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { SlAlert, SlAlertContent, SlAlertDescription, SlAlertTitle } from '@slotted/angular/alert';
import { SlBadge } from '@slotted/angular/badge';
import { SlButton } from '@slotted/angular/button';
import { SlField, SlFieldLabel } from '@slotted/angular/field';
import { SlInline } from '@slotted/angular/inline';
import { SlSelect, SlSelectItem } from '@slotted/angular/select';
import { SlSkeleton } from '@slotted/angular/skeleton';
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
import { SlTextField, SlTextFieldInput } from '@slotted/angular/text-field';
import { SlThemeScope } from '@slotted/angular/theme';
import { SlHeading } from '@slotted/angular/typography';
import type { Density, Scheme, SeedName } from '@slotted/theme';

const SCHEME_LABELS = { light: 'Light', dark: 'Dark', 'high-contrast': 'High contrast' } as const;

/**
 * One scheme of the candidate appearance, as a region of its own: an
 * `slThemeScope` naming the theme, the scheme, the density and the seeds,
 * so every family inside — and the select's list, which opens at the end of
 * the body — derives its colours there and nowhere else.
 *
 * The region paints its own ground and ink from the scheme it names (CP-05);
 * the families inside are the ones the product's screens use. Each sample
 * sits under a placeholder that reads the enclosing skeleton region, so while
 * the theme's sheet loads the region keeps every box and shows none of them.
 */
@Component({
  selector: 'app-appearance-preview',
  imports: [
    SlThemeScope,
    SlAlert,
    SlAlertContent,
    SlAlertDescription,
    SlAlertTitle,
    SlBadge,
    SlButton,
    SlField,
    SlFieldLabel,
    SlInline,
    SlSelect,
    SlSelectItem,
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
    SlHeading,
    SlSkeleton,
    SlTextField,
    SlTextFieldInput,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
    }
    .region {
      padding: var(--slotted-space-6);
      border: var(--slotted-border-width-thin) solid var(--slotted-border-subtle);
      border-radius: var(--slotted-radius-lg);
      background: var(--slotted-surface);
      color: var(--slotted-text);
      box-shadow: var(--slotted-shadow-sm);
    }
  `,
  template: `
    <div
      class="region"
      slThemeScope
      role="group"
      [attr.aria-label]="label()"
      [attr.data-preview-scheme]="scheme()"
      [theme]="theme()"
      [scheme]="scheme()"
      [density]="density()"
      [seeds]="seeds()"
    >
      <div slStack [gap]="5">
        <h4 slHeading size="sm" data-preview-heading>{{ label() }}</h4>
        <!-- Samples to look at, not actions: out of the tab order and the pointer's reach. -->
        <div slInline [gap]="2" wrap="wrap" inert>
          <span slSkeleton><button slButton data-preview-solid>Approve</button></span>
          <span slSkeleton><button slButton variant="outline">Export</button></span>
          <span slSkeleton><button slButton variant="ghost" tone="secondary">Cancel</button></span>
          <span slSkeleton><button slButton tone="danger">Delete</button></span>
        </div>
        <div slInline [gap]="2" wrap="wrap">
          <span slSkeleton><span slBadge tone="accent" variant="soft">New</span></span>
          <span slSkeleton><span slBadge tone="success" variant="soft">Paid</span></span>
          <span slSkeleton><span slBadge tone="warning" variant="soft">Due soon</span></span>
          <span slSkeleton><span slBadge tone="danger" variant="solid">Overdue</span></span>
        </div>
        <div slField>
          <label slFieldLabel>Customer</label>
          <div slSkeleton shape="block">
            <div slTextField>
              <input slTextFieldInput placeholder="Search by name or number" />
            </div>
          </div>
        </div>
        <div slField>
          <label slFieldLabel>Warehouse</label>
          <div slSkeleton shape="block">
            <sl-select [value]="warehouse()" (valueChangeRequest)="choose($event.value)">
              <sl-select-item value="lisbon">Lisbon</sl-select-item>
              <sl-select-item value="porto">Porto</sl-select-item>
              <sl-select-item value="madrid">Madrid</sl-select-item>
            </sl-select>
          </div>
        </div>
        <section slAlert tone="accent" live="off">
          <div slAlertContent>
            <div slAlertTitle>
              <span slSkeleton><span>Cycle count due</span></span>
            </div>
            <p slAlertDescription>
              <span slSkeleton><span>Lisbon closes its count on Friday.</span></span>
            </p>
          </div>
        </section>
        <div slTable variant="framed" [columns]="2" layout="fixed">
          <div slTableContent>
            <caption slTableCaption>
              Open orders
            </caption>
            <thead slTableHead>
              <tr slTableRow>
                <th slTableColumnHeader>Order</th>
                <th slTableColumnHeader>State</th>
              </tr>
            </thead>
            <tbody slTableBody>
              @for (order of orders; track order.id) {
                <tr slTableRow>
                  <th slTableRowHeader>
                    <span slSkeleton
                      ><span>{{ order.id }}</span></span
                    >
                  </th>
                  <td slTableCell>
                    <span slSkeleton
                      ><span slBadge [tone]="order.tone" variant="soft" size="sm">{{
                        order.state
                      }}</span></span
                    >
                  </td>
                </tr>
              }
            </tbody>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AppearancePreview {
  readonly theme = input.required<string>();
  readonly scheme = input.required<Scheme>();
  readonly density = input.required<Density>();
  readonly seeds = input.required<Partial<Record<SeedName, string>>>();
  protected readonly warehouse = signal('lisbon');
  protected readonly orders = [
    { id: 'SO-1042', state: 'Picking', tone: 'accent' },
    { id: 'SO-1043', state: 'Shipped', tone: 'success' },
    { id: 'SO-1044', state: 'On hold', tone: 'warning' },
  ] as const;

  protected label(): string {
    return SCHEME_LABELS[this.scheme()];
  }

  protected choose(value: unknown): void {
    if (typeof value === 'string') this.warehouse.set(value);
  }
}
