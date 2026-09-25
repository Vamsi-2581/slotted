import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SlButton } from '@slotted/angular/button';
import { SlCheckbox } from '@slotted/angular/checkbox';
import { SlField, SlFieldDescription, SlFieldLabel } from '@slotted/angular/field';
import { SlForm } from '@slotted/angular/form';
import { SlPage, SlPageBody, SlPageFooter } from '@slotted/angular/page';
import {
  SlPageHeader,
  SlPageHeaderArea,
  SlPageHeaderContent,
  SlPageHeaderDescription,
  SlPageHeaderHeading,
  SlPageHeaderTitle,
  SlPageHeaderTitleArea,
  SlPageHeaderTitleRow,
} from '@slotted/angular/page-header';
import { SlRadio, SlRadioGroup } from '@slotted/angular/radio-group';
import { SlSelect, SlSelectItem } from '@slotted/angular/select';
import { SlToastService } from '@slotted/angular/toast';

import { visibleModules } from '../../core/nav/nav.model';
import { PreferencesStore, type UserPreferences } from '../../core/session/preferences.store';
import { SessionStore } from '../../core/session/session.store';

@Component({
  selector: 'app-preferences-page',
  imports: [
    SlButton,
    SlCheckbox,
    SlField,
    SlFieldDescription,
    SlFieldLabel,
    SlForm,
    SlPage,
    SlPageBody,
    SlPageFooter,
    SlPageHeader,
    SlPageHeaderArea,
    SlPageHeaderContent,
    SlPageHeaderDescription,
    SlPageHeaderHeading,
    SlPageHeaderTitle,
    SlPageHeaderTitleArea,
    SlPageHeaderTitleRow,
    SlRadio,
    SlRadioGroup,
    SlSelect,
    SlSelectItem,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    form {
      display: grid;
      gap: var(--slotted-space-6);
    }
    .checks {
      display: grid;
      gap: var(--slotted-space-2);
    }
  `,
  template: `
    <div slPage width="measure">
      <header slPageHeader>
        <div slPageHeaderTitleArea>
          <div slPageHeaderTitleRow>
            <div slPageHeaderTitle><h1 slPageHeaderHeading>Preferences</h1></div>
          </div>
        </div>
        <div slPageHeaderArea>
          <div slPageHeaderContent>
            <p slPageHeaderDescription>
              How Nexora looks and what it tells you. Saved on this device, for your account.
            </p>
          </div>
        </div>
      </header>
      <div slPageBody>
        <form slForm (submit)="$event.preventDefault(); save()">
          <div slField>
            <label slFieldLabel>Appearance</label>
            <div
              slRadioGroup
              [value]="draft().scheme"
              (valueChange)="patch({ scheme: $any($event.value) })"
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
              [value]="draft().density"
              (valueChange)="patch({ density: $any($event.value) })"
            >
              <div slRadio value="comfortable">Comfortable</div>
              <div slRadio value="compact">Compact</div>
              <div slRadio value="dense">Dense</div>
            </div>
          </div>
          <div slField>
            <label slFieldLabel>Shell canvas</label>
            <div
              slRadioGroup
              [value]="draft().canvas"
              (valueChange)="patch({ canvas: $any($event.value) })"
            >
              <div slRadio value="inset">Inset</div>
              <div slRadio value="flush">Flush</div>
            </div>
            <span slFieldDescription>
              Inset sinks the frame and raises the content as a card. Flush runs the content to the
              edge of the window and separates it with a rule.
            </span>
          </div>
          <div slField>
            <label slFieldLabel>Start page</label>
            <sl-select [value]="draft().startRoute" (valueChangeRequest)="setStart($event.value)">
              @for (m of startPages(); track m.path) {
                <sl-select-item [value]="m.path">{{ m.label }}</sl-select-item>
              }
            </sl-select>
            <span slFieldDescription>Where Nexora opens after sign-in.</span>
          </div>
          <div slField>
            <label slFieldLabel>Notifications</label>
            <div class="checks">
              <div
                slCheckbox
                [checked]="draft().notifications.emailApprovals"
                (checkedChange)="patchNotifications({ emailApprovals: $event.value })"
              >
                Email me approval requests
              </div>
              <div
                slCheckbox
                [checked]="draft().notifications.emailMentions"
                (checkedChange)="patchNotifications({ emailMentions: $event.value })"
              >
                Email me mentions
              </div>
              <div
                slCheckbox
                [checked]="draft().notifications.inAppOperationalAlerts"
                (checkedChange)="patchNotifications({ inAppOperationalAlerts: $event.value })"
              >
                In-app operational alerts
              </div>
              <div slCheckbox [checked]="true" disabled>In-app approvals (always on)</div>
              <div slCheckbox [checked]="true" disabled>In-app mentions (always on)</div>
            </div>
          </div>
        </form>
      </div>
      <footer slPageFooter [open]="dirty()">
        <button slButton variant="ghost" tone="secondary" (click)="reset()">Discard</button>
        <button slButton tone="accent" (click)="save()">Save preferences</button>
      </footer>
    </div>
  `,
})
export class PreferencesPage {
  private readonly preferences = inject(PreferencesStore);
  private readonly session = inject(SessionStore);
  private readonly toasts = inject(SlToastService);
  readonly draft = signal<UserPreferences>(structuredClone(this.preferences.preferences()));
  readonly dirty = computed(
    () => JSON.stringify(this.draft()) !== JSON.stringify(this.preferences.preferences()),
  );
  readonly startPages = computed(() =>
    visibleModules((p) => this.session.can(p)).map((m) => ({
      path: m.destinations[0]?.path ?? m.path,
      label: m.label,
    })),
  );

  patch(p: Partial<UserPreferences>): void {
    this.draft.update((d) => ({ ...d, ...p }));
  }

  setStart(value: unknown): void {
    if (typeof value === 'string') this.patch({ startRoute: value });
  }

  patchNotifications(p: Partial<UserPreferences['notifications']>): void {
    this.draft.update((d) => ({ ...d, notifications: { ...d.notifications, ...p } }));
  }

  reset(): void {
    this.draft.set(structuredClone(this.preferences.preferences()));
  }

  save(): void {
    this.preferences.update(this.draft());
    this.toasts.show({ title: 'Preferences saved', tone: 'success' });
  }
}
