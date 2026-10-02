import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { SlAlert, SlAlertContent, SlAlertDescription, SlAlertTitle } from '@slotted/angular/alert';
import { SlBadge } from '@slotted/angular/badge';
import { SlButton } from '@slotted/angular/button';
import { SlCard, SlCardBody, SlCardHeader } from '@slotted/angular/card';
import { SlChart } from '@slotted/angular/chart';
import { SlField, SlFieldLabel } from '@slotted/angular/field';
import { SlInline } from '@slotted/angular/inline';
import { SlSelect, SlSelectItem } from '@slotted/angular/select';
import { SlSkeleton } from '@slotted/angular/skeleton';
import {
  SlStatCard,
  SlStatCardComparison,
  SlStatCardFigure,
  SlStatCardHeader,
  SlStatCardLabel,
  SlStatCardValue,
} from '@slotted/angular/stat-card';
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
import { SlTabList, SlTab, SlTabs } from '@slotted/angular/tabs';
import { SlTextField, SlTextFieldInput } from '@slotted/angular/text-field';
import { SlThemeScope } from '@slotted/angular/theme';
import { SlHeading } from '@slotted/angular/typography';
import type { ChartSeries } from '@slotted/core/chart';
import type { Density, Scheme, SeedName } from '@slotted/theme';

const SCHEME_LABELS = { light: 'Light', dark: 'Dark', 'high-contrast': 'High contrast' } as const;

/**
 * One scheme of the candidate appearance, as a small operations dashboard in
 * a region of its own: an `slThemeScope` naming the theme, the scheme, the
 * density and the seeds, so every family inside — and the select's list,
 * which opens at the end of the body — derives its tokens there and nowhere
 * else. The families are the ones Nexora's screens use: tabs, stat cards, a
 * chart in the data palette, a card, a table, a form, buttons, badges and an
 * alert, so a theme's corners, faces, lines, shadows, spacing and palette all
 * show at once.
 *
 * The region paints its own ground and ink from the scheme it names (CP-05).
 * Each sample sits under a placeholder that reads the enclosing skeleton
 * region, so while the theme's sheet loads the region keeps every box and
 * shows none of them; the tab strip and the headings are chrome and stay.
 */
@Component({
  selector: 'app-appearance-preview',
  imports: [
    SlAlert,
    SlAlertContent,
    SlAlertDescription,
    SlAlertTitle,
    SlBadge,
    SlButton,
    SlCard,
    SlCardBody,
    SlCardHeader,
    SlChart,
    SlField,
    SlFieldLabel,
    SlHeading,
    SlInline,
    SlSelect,
    SlSelectItem,
    SlSkeleton,
    SlStatCard,
    SlStatCardComparison,
    SlStatCardFigure,
    SlStatCardHeader,
    SlStatCardLabel,
    SlStatCardValue,
    SlTab,
    SlTabList,
    SlTable,
    SlTableBody,
    SlTableCaption,
    SlTableCell,
    SlTableColumnHeader,
    SlTableContent,
    SlTableHead,
    SlTableRow,
    SlTableRowHeader,
    SlTabs,
    SlTextField,
    SlTextFieldInput,
    SlThemeScope,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
    }
    .region {
      display: grid;
      gap: var(--slotted-space-6);
      padding: var(--slotted-space-7);
      border: var(--slotted-border-width-thin) solid var(--slotted-border-subtle);
      border-radius: var(--slotted-radius-lg);
      background: var(--slotted-surface);
      color: var(--slotted-text);
      /* The page's face was resolved on html; the region reads its own theme's. */
      font-family: var(--slotted-font-family-sans);
      box-shadow: var(--slotted-shadow-sm);
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      justify-content: space-between;
      gap: var(--slotted-space-5);
    }
    /* CP-03: tracks that hold a chart and a table state a zero minimum. */
    .figures {
      display: grid;
      gap: var(--slotted-space-5);
      grid-template-columns: repeat(auto-fit, minmax(min(11rem, 100%), 1fr));
    }
    .split {
      display: grid;
      gap: var(--slotted-space-5);
      grid-template-columns: repeat(auto-fit, minmax(min(20rem, 100%), 1fr));
      align-items: start;
    }
    .form {
      display: grid;
      gap: var(--slotted-space-5);
      grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr));
      align-items: start;
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
      <div class="head">
        <h4 slHeading size="sm" data-preview-heading>{{ label() }}</h4>
        <!-- Samples to look at, not destinations: out of the tab order. -->
        <div slTabs value="overview" inert data-preview-tabs>
          <div slTabList aria-label="Views">
            <div slTab value="overview">Overview</div>
            <div slTab value="orders">Orders</div>
            <div slTab value="stock">Stock</div>
          </div>
        </div>
      </div>

      <div class="figures">
        @for (figure of figures; track figure.label) {
          <div slStatCard size="sm" data-preview-figure>
            <div slStatCardHeader>
              <span slStatCardLabel>{{ figure.label }}</span>
            </div>
            <div slStatCardFigure>
              <span slStatCardValue
                ><span slSkeleton
                  ><span>{{ figure.value }}</span></span
                ></span
              >
              <p slStatCardComparison>
                <span slSkeleton
                  ><span>{{ figure.comparison }}</span></span
                >
              </p>
            </div>
          </div>
        }
      </div>

      <div class="split">
        <div slCard data-preview-card>
          <div slCardHeader>
            <h5 slHeading size="xs">Orders by channel</h5>
          </div>
          <div slCardBody>
            <div slSkeleton shape="block">
              <figure
                slChart
                data-preview-chart
                title="Orders by channel"
                description="Orders a day this week, by the channel they came in through"
                size="sm"
                variant="plain"
                renderer="svg"
                locale="en-US"
                toolbar="none"
                [animate]="false"
                [data]="days"
                [series]="channels"
                [x]="{ field: 'day' }"
                [y]="{ label: 'Orders' }"
              ></figure>
            </div>
          </div>
        </div>

        <div slTable variant="framed" [columns]="2" layout="fixed" data-preview-table>
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

      <div class="form">
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
      </div>

      <!-- Samples to look at, not actions: out of the tab order and the pointer's reach. -->
      <div slInline [gap]="3" wrap="wrap" inert>
        <span slSkeleton><button slButton data-preview-solid>Approve</button></span>
        <span slSkeleton><button slButton variant="outline">Export</button></span>
        <span slSkeleton><button slButton variant="ghost" tone="secondary">Cancel</button></span>
        <span slSkeleton><button slButton tone="danger">Delete</button></span>
        <span slSkeleton><span slBadge tone="accent" variant="soft">New</span></span>
        <span slSkeleton><span slBadge tone="success" variant="soft">Paid</span></span>
        <span slSkeleton><span slBadge tone="warning" variant="solid">Due soon</span></span>
        <span slSkeleton><span slBadge tone="danger" variant="solid">Overdue</span></span>
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
    </div>
  `,
})
export class AppearancePreview {
  readonly theme = input.required<string>();
  readonly scheme = input.required<Scheme>();
  readonly density = input.required<Density>();
  readonly seeds = input.required<Partial<Record<SeedName, string>>>();
  protected readonly warehouse = signal('lisbon');

  protected readonly figures = [
    { label: 'Revenue', value: '€48.2k', comparison: '+12% on last week' },
    { label: 'Open orders', value: '128', comparison: '14 due today' },
    { label: 'Fill rate', value: '96.4%', comparison: 'Target 95%' },
  ] as const;
  protected readonly days = [
    { day: 'Mon', online: 42, store: 28, wholesale: 12 },
    { day: 'Tue', online: 51, store: 24, wholesale: 18 },
    { day: 'Wed', online: 47, store: 31, wholesale: 15 },
    { day: 'Thu', online: 63, store: 29, wholesale: 21 },
    { day: 'Fri', online: 58, store: 36, wholesale: 17 },
  ];
  protected readonly channels: readonly ChartSeries[] = [
    { id: 'online', kind: 'bar', field: 'online', label: 'Online' },
    { id: 'store', kind: 'bar', field: 'store', label: 'Store' },
    { id: 'wholesale', kind: 'bar', field: 'wholesale', label: 'Wholesale' },
  ];
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
