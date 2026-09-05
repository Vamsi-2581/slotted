import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideRedo2, lucideTrash2, lucideUndo2 } from '@ng-icons/lucide';
import { createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import { SlButton, SlIconButton, SlToggleButton } from '@slotted/angular/button';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlButtonGroup } from './button-group';
import { SlButtonGroupSeparator } from './button-group-separator';
import { ANGULAR_BUTTON_GROUP_DOCS, ANGULAR_BUTTON_GROUP_TOKENS } from './button-group.docs';
import type {
  ButtonGroupCollapse,
  ButtonGroupGap,
  ButtonGroupOrientation,
} from './button-group-defaults';

interface ButtonGroupStoryArgs {
  attached: boolean;
  collapse: ButtonGroupCollapse;
  fullWidth: boolean;
  gap: ButtonGroupGap;
  orientation: ButtonGroupOrientation;
}

/**
 * Captions and frames are demonstration devices of the reference page and
 * never part of the family.
 */
const demo = {
  caption: 'color: var(--slotted-text-muted); font-size: 11px',
  frame: [
    'border: 1px dashed var(--slotted-border-strong)',
    'border-radius: var(--slotted-radius-md)',
    'inline-size: 100%',
    'padding: var(--slotted-space-3)',
  ].join('; '),
  column:
    'display: grid; gap: var(--slotted-space-8); grid-template-columns: minmax(0, 1fr); inline-size: 100%',
  row: 'display: grid; gap: var(--slotted-space-3); grid-template-columns: minmax(0, 1fr); justify-items: start',
};

const referenceStories: ReferencePageConfig['stories'] = () => ({
  essential: Playground as never,
  matrix: Attachment as never,
});

const meta: Meta<ButtonGroupStoryArgs> = {
  title: 'Components/Button group',
  component: SlButtonGroup,
  decorators: [
    moduleMetadata({
      imports: [
        NgIcon,
        SlButtonGroup,
        SlButtonGroupSeparator,
        SlButton,
        SlIconButton,
        SlToggleButton,
      ],
      providers: [provideIcons({ lucideChevronDown, lucideRedo2, lucideTrash2, lucideUndo2 })],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Button group',
        description:
          'Related actions laid out as one unit: separated by the space scale, or joined into a single shape.',
        framework: 'Angular',
        ...ANGULAR_BUTTON_GROUP_DOCS.buttonGroup,
        tokens: ANGULAR_BUTTON_GROUP_TOKENS,
        stories: referenceStories,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<ButtonGroupStoryArgs>;

export const Playground: Story = {
  args: {
    attached: false,
    collapse: 'wrap',
    fullWidth: false,
    gap: 4,
    orientation: 'horizontal',
  },
  argTypes: {
    collapse: { control: 'inline-radio', options: ['wrap', 'nowrap', 'stack'] },
    gap: { control: { type: 'range', min: 0, max: 12, step: 1 } },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: { ...args, demo },
    template: `
<div class="slotted-demo-stage" data-align="start">
  <div
    slButtonGroup
    aria-label="Record actions"
    [gap]="gap"
    [orientation]="orientation"
    [collapse]="collapse"
    [attached]="attached"
    [fullWidth]="fullWidth"
    tone="secondary"
    variant="outline"
  >
    <button slButton>Duplicate</button>
    <button slButton>Archive</button>
    <button slButton>Export</button>
  </div>
</div>`,
  }),
};

export const Attachment: Story = {
  parameters: scenario('attachment'),
  render: () => ({
    props: { demo },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">Separated, and joined</span>
      <span class="slotted-demo-scene__note">
        A separated group keeps each control its own shape. A joined one shares the edges and rounds
        only the ends. In a joined bar the edge belongs to the group, not to each control: a filled
        control's border is its own fill, so two of them overlapped would be one uninterrupted
        rectangle, and the seam between them is the darkest step of the control's own tone.
      </span>
    </header>
    <div class="slotted-demo-stage" data-align="start">
      <div [style]="demo.column">
        <div [style]="demo.row">
          <span [style]="demo.caption">separated · the default</span>
          <div slButtonGroup aria-label="Save or cancel">
            <button slButton tone="secondary" variant="outline">Cancel</button>
            <button slButton>Save changes</button>
          </div>
        </div>
        <div [style]="demo.row">
          <span [style]="demo.caption">attached · outline</span>
          <div slButtonGroup aria-label="Range" attached tone="secondary" variant="outline">
            <button slButton>Day</button>
            <button slButton>Week</button>
            <button slButton>Month</button>
          </div>
        </div>
        <div [style]="demo.row">
          <span [style]="demo.caption">attached · solid, with a split action at the end</span>
          <div slButtonGroup aria-label="Publish" attached>
            <button slButton>Publish</button>
            <button slButton>Schedule</button>
            <button slIconButton aria-label="More publish options" tone="accent" variant="solid">
              <ng-icon aria-hidden="true" name="lucideChevronDown"></ng-icon>
            </button>
          </div>
        </div>
        <div [style]="demo.row">
          <span [style]="demo.caption">attached · one action keeps all four corners</span>
          <div slButtonGroup aria-label="Only one" attached tone="secondary" variant="outline">
            <button slButton>Alone</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>`,
  }),
};

export const Orientation: Story = {
  parameters: scenario('orientation'),
  render: () => ({
    props: { demo },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">A row, and a column</span>
      <span class="slotted-demo-scene__note">
        A column stretches its controls to one width, because a column at their natural widths is a
        ragged edge rather than a group. The joined corners turn with the axis, and they are
        logical, so a right-to-left document is the same bar mirrored. A framed bar keeps its
        destructive action off the frequent ones with a nested group, not with a rule: the shared
        edges are already that colour and that width, so a rule laid among them is the same line
        drawn twice.
      </span>
    </header>
    <div class="slotted-demo-stage" data-align="start">
      <div [style]="demo.column">
        <div [style]="demo.row">
          <span [style]="demo.caption">vertical · separated</span>
          <div slButtonGroup aria-label="Reminder" orientation="vertical">
            <button slButton tone="secondary" variant="outline">No, thanks</button>
            <button slButton tone="secondary" variant="outline">Remind me later</button>
            <button slButton>Rate now</button>
          </div>
        </div>
        <div [style]="demo.row">
          <span [style]="demo.caption">vertical · two joined runs, kept apart by distance</span>
          <div slButtonGroup aria-label="Row menu" orientation="vertical">
            <div
              slButtonGroup
              aria-label="Edit"
              attached
              orientation="vertical"
              tone="secondary"
              variant="outline"
            >
              <button slButton>Duplicate</button>
              <button slButton>Archive</button>
            </div>
            <div slButtonGroup aria-label="Destructive" orientation="vertical">
              <button slButton tone="danger" variant="outline">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>`,
  }),
};

export const Separation: Story = {
  parameters: scenario('separation'),
  render: () => ({
    props: { demo, steps: [2, 4, 8] },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">Gaps, clusters and rules</span>
      <span class="slotted-demo-scene__note">
        Two ways to say that actions belong apart, and both produce the same boundary width. A
        nested group stands half a gap further out on each side; a rule stands in the same place.
        Inside a joined bar the rule takes no room of its own: the bar stays one shape, and the
        boundary is painted in the column the shared edge already occupies, one step stronger than
        the seams around it.
      </span>
    </header>
    <div class="slotted-demo-stage" data-align="start">
      <div [style]="demo.column">
        @for (step of steps; track step) {
          <div [style]="demo.row">
            <span [style]="demo.caption">gap {{ step }}</span>
            <div slButtonGroup [attr.aria-label]="'Gap ' + step" [gap]="step">
              <button slButton tone="secondary" variant="outline">Cancel</button>
              <button slButton>Save</button>
            </div>
          </div>
        }
        <div [style]="demo.row">
          <span [style]="demo.caption">clusters · a nested group is a boundary</span>
          <div slButtonGroup aria-label="Record">
            <div slButtonGroup aria-label="Edit" attached tone="secondary" variant="outline">
              <button slButton>Duplicate</button>
              <button slButton>Archive</button>
            </div>
            <div slButtonGroup aria-label="Destructive">
              <button slButton tone="danger">Delete</button>
            </div>
          </div>
        </div>
        <div [style]="demo.row">
          <span [style]="demo.caption">a rule inside a joined icon bar</span>
          <div slButtonGroup aria-label="Editor tools" attached>
            <button slIconButton aria-label="Undo">
              <ng-icon aria-hidden="true" name="lucideUndo2"></ng-icon>
            </button>
            <button slIconButton aria-label="Redo">
              <ng-icon aria-hidden="true" name="lucideRedo2"></ng-icon>
            </button>
            <div slButtonGroupSeparator></div>
            <button slIconButton aria-label="Delete" tone="danger">
              <ng-icon aria-hidden="true" name="lucideTrash2"></ng-icon>
            </button>
          </div>
        </div>
        <div [style]="demo.row">
          <span [style]="demo.caption">a rule inside a framed bar</span>
          <div slButtonGroup aria-label="View" attached tone="secondary" variant="outline">
            <button slButton>Day</button>
            <button slButton>Week</button>
            <div slButtonGroupSeparator></div>
            <button slButton>Today</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>`,
  }),
};

export const Collapse: Story = {
  parameters: scenario('collapse'),
  render: () => ({
    props: { demo },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">When the row does not fit</span>
      <span class="slotted-demo-scene__note">
        Narrow the window. The first group wraps and its lines keep the same separation. The second
        turns into a column below 360 pixels of its own inline size, decided by a container query
        rather than by measuring after hydration — so it is already right in a server render. A
        stacking group holds the line it measures, which is why justify places its buttons on it.
      </span>
    </header>
    <div class="slotted-demo-stage" data-align="start">
      <div [style]="demo.column">
        <div [style]="demo.row">
          <span [style]="demo.caption">wrap · the default</span>
          <div [style]="demo.frame">
            <div slButtonGroup aria-label="Filters" size="sm" tone="secondary" variant="outline">
              <button slButton>Overdue</button>
              <button slButton>Awaiting review</button>
              <button slButton>Paid in full</button>
              <button slButton>Disputed</button>
            </div>
          </div>
        </div>
        <div [style]="demo.row">
          <span [style]="demo.caption">stack · a row above 360px, a column below it</span>
          <div [style]="demo.frame">
            <div slButtonGroup aria-label="Dialog actions" collapse="stack" justify="end">
              <button slButton tone="secondary" variant="outline">Cancel</button>
              <button slButton tone="secondary" variant="outline">Save as draft</button>
              <button slButton>Publish now</button>
            </div>
          </div>
        </div>
        <div [style]="demo.row">
          <span [style]="demo.caption">fullWidth · equal segments, whatever the labels weigh</span>
          <div [style]="demo.frame">
            <div slButtonGroup aria-label="Range" fullWidth tone="secondary" variant="outline">
              <button slButton>Day</button>
              <button slButton>This quarter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>`,
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    props: { demo },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">What the group hands down</span>
      <span class="slotted-demo-scene__note">
        tone, variant and size travel through the button family's own defaults token, so a button
        that states one itself still wins. Every other state belongs to the control: the group does
        not disable, does not wait, and does not press. What the group does own is the bar's edge —
        a control that is on, or unavailable, keeps the frame it sits in and changes only its fill,
        so the bar never has a hole where that control is.
      </span>
    </header>
    <div class="slotted-demo-stage" data-align="start">
      <div [style]="demo.column">
        <div [style]="demo.row">
          <span [style]="demo.caption">the group paints, the button overrules</span>
          <div slButtonGroup aria-label="Painted" size="sm" tone="secondary" variant="outline">
            <button slButton>Inherits</button>
            <button slButton>Inherits</button>
            <button slButton tone="danger" variant="solid">States its own</button>
          </div>
        </div>
        <div [style]="demo.row">
          <span [style]="demo.caption">a toggle that is on — at each of the three positions</span>
          <div slButtonGroup aria-label="View" attached tone="secondary" variant="outline">
            <button slToggleButton [defaultPressed]="true">List</button>
            <button slToggleButton [defaultPressed]="false">Board</button>
            <button slToggleButton [defaultPressed]="false">Calendar</button>
          </div>
          <div slButtonGroup aria-label="View" attached tone="secondary" variant="outline">
            <button slToggleButton [defaultPressed]="false">List</button>
            <button slToggleButton [defaultPressed]="true">Board</button>
            <button slToggleButton [defaultPressed]="false">Calendar</button>
          </div>
          <div slButtonGroup aria-label="View" attached tone="secondary" variant="outline">
            <button slToggleButton [defaultPressed]="false">List</button>
            <button slToggleButton [defaultPressed]="false">Board</button>
            <button slToggleButton [defaultPressed]="true">Calendar</button>
          </div>
        </div>
        <div [style]="demo.row">
          <span [style]="demo.caption">
            two variants joined · the seam is the filled control's own edge
          </span>
          <div slButtonGroup aria-label="Save or cancel" attached>
            <button slButton tone="secondary" variant="outline">Cancel</button>
            <button slButton>Save</button>
          </div>
        </div>
        <div [style]="demo.row">
          <span [style]="demo.caption">one control waiting, one unavailable</span>
          <div slButtonGroup aria-label="Review" attached tone="secondary" variant="outline">
            <button slButton>Approve</button>
            <button slButton loading loadingLabel="Reassigning">Reassign</button>
            <button slButton disabled>Reject</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>`,
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => ({
    props: { demo },
    template: `
<div class="slotted-demo-grid" data-columns="1">
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">Several tab stops, and a name</span>
      <span class="slotted-demo-scene__note">
        Tab through the bar below. Every control is its own stop and its focus ring is painted over
        its neighbours rather than under them, which is the whole reason a joined group raises the
        control being touched. The arrow-key model — one tab stop, Left and Right between controls —
        is the toolbar family, not this one.
      </span>
    </header>
    <div class="slotted-demo-stage" data-align="start">
      <div [style]="demo.column">
        <div [style]="demo.row">
          <span [style]="demo.caption">aria-label names the group</span>
          <div slButtonGroup aria-label="Text alignment" attached tone="secondary" variant="outline">
            <button slButton>Day</button>
            <button slButton>Week</button>
            <button slButton>Month</button>
          </div>
        </div>
        <div [style]="demo.row">
          <span [style]="demo.caption">a named cluster says more than a rule can</span>
          <div slButtonGroup aria-label="Record">
            <div slButtonGroup aria-label="Edit" attached tone="secondary" variant="outline">
              <button slButton>Duplicate</button>
              <button slButton>Archive</button>
            </div>
            <div slButtonGroup aria-label="Destructive">
              <button slButton tone="danger">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>`,
  }),
};
