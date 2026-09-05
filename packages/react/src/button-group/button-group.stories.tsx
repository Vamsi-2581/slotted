import { createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown, Redo2, Trash2, Undo2 } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import { Button, IconButton, ToggleButton } from '../button';
import { ButtonGroup } from './button-group';
import { ButtonGroupSeparator } from './button-group-separator';
import { REACT_BUTTON_GROUP_DOCS, REACT_BUTTON_GROUP_TOKENS } from './button-group.docs';
import type {
  ButtonGroupCollapse,
  ButtonGroupGap,
  ButtonGroupOrientation,
} from './button-group.types';

function Caption({ children }: { children: ReactNode }) {
  return <span style={{ color: 'var(--slotted-text-muted)', fontSize: '11px' }}>{children}</span>;
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: '1px dashed var(--slotted-border-strong)',
        borderRadius: 'var(--slotted-radius-md)',
        inlineSize: '100%',
        padding: 'var(--slotted-space-3)',
      }}
    >
      {children}
    </div>
  );
}

/** Consumer content, and it is Lucide's, so the page needs no icon family to read. */
const UNDO = <Undo2 aria-hidden="true" focusable="false" />;
const REDO = <Redo2 aria-hidden="true" focusable="false" />;
const TRASH = <Trash2 aria-hidden="true" focusable="false" />;
const CHEVRON = <ChevronDown aria-hidden="true" focusable="false" />;

const column: CSSProperties = {
  display: 'grid',
  gap: 'var(--slotted-space-8)',
  gridTemplateColumns: 'minmax(0, 1fr)',
  inlineSize: '100%',
};
const row: CSSProperties = { ...column, gap: 'var(--slotted-space-3)', justifyItems: 'start' };

interface ButtonGroupStoryArgs {
  attached: boolean;
  collapse: ButtonGroupCollapse;
  fullWidth: boolean;
  gap: ButtonGroupGap;
  orientation: ButtonGroupOrientation;
}

const referenceStories: ReferencePageConfig['stories'] = () => ({
  essential: Playground as never,
  matrix: Attachment as never,
});

const meta = {
  title: 'Components/Button group',
  component: ButtonGroup,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Button group',
        description:
          'Related actions laid out as one unit: separated by the space scale, or joined into a single shape.',
        framework: 'React',
        ...REACT_BUTTON_GROUP_DOCS.buttonGroup,
        tokens: REACT_BUTTON_GROUP_TOKENS,
        stories: referenceStories,
      }),
    },
  },
} satisfies Meta<typeof ButtonGroup>;

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
  render: (args) => (
    <div className="slotted-demo-stage" data-align="start">
      <ButtonGroup {...args} aria-label="Record actions">
        <Button tone="secondary" variant="outline">
          Duplicate
        </Button>
        <Button tone="secondary" variant="outline">
          Archive
        </Button>
        <Button tone="secondary" variant="outline">
          Export
        </Button>
      </ButtonGroup>
    </div>
  ),
};

export const Attachment: Story = {
  parameters: scenario('attachment'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <section className="slotted-demo-scene">
        <header className="slotted-demo-scene__header">
          <span className="slotted-demo-scene__label">Separated, and joined</span>
          <span className="slotted-demo-scene__note">
            A separated group keeps each control its own shape. A joined one shares the edges and
            rounds only the ends. In a joined bar the edge belongs to the group, not to each
            control: a filled control’s border is its own fill, so two of them overlapped would be
            one uninterrupted rectangle, and the seam between them is the darkest step of the
            control’s own tone.
          </span>
        </header>
        <div className="slotted-demo-stage" data-align="start">
          <div style={column}>
            <div style={row}>
              <Caption>separated · the default</Caption>
              <ButtonGroup aria-label="Save or cancel">
                <Button tone="secondary" variant="outline">
                  Cancel
                </Button>
                <Button>Save changes</Button>
              </ButtonGroup>
            </div>
            <div style={row}>
              <Caption>attached · outline</Caption>
              <ButtonGroup aria-label="Range" attached tone="secondary" variant="outline">
                <Button>Day</Button>
                <Button>Week</Button>
                <Button>Month</Button>
              </ButtonGroup>
            </div>
            <div style={row}>
              <Caption>attached · solid, with a split action at the end</Caption>
              <ButtonGroup aria-label="Publish" attached>
                <Button>Publish</Button>
                <Button>Schedule</Button>
                <IconButton aria-label="More publish options" tone="accent" variant="solid">
                  {CHEVRON}
                </IconButton>
              </ButtonGroup>
            </div>
            <div style={row}>
              <Caption>attached · one action keeps all four corners</Caption>
              <ButtonGroup aria-label="Only one" attached tone="secondary" variant="outline">
                <Button>Alone</Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const Orientation: Story = {
  parameters: scenario('orientation'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <section className="slotted-demo-scene">
        <header className="slotted-demo-scene__header">
          <span className="slotted-demo-scene__label">A row, and a column</span>
          <span className="slotted-demo-scene__note">
            A column stretches its controls to one width, because a column at their natural widths
            is a ragged edge rather than a group. The joined corners turn with the axis, and they
            are logical, so a right-to-left document is the same bar mirrored. A framed bar keeps
            its destructive action off the frequent ones with a nested group, not with a rule: the
            shared edges are already that colour and that width, so a rule laid among them is the
            same line drawn twice.
          </span>
        </header>
        <div className="slotted-demo-stage" data-align="start">
          <div style={column}>
            <div style={row}>
              <Caption>vertical · separated</Caption>
              <ButtonGroup aria-label="Reminder" orientation="vertical">
                <Button tone="secondary" variant="outline">
                  No, thanks
                </Button>
                <Button tone="secondary" variant="outline">
                  Remind me later
                </Button>
                <Button>Rate now</Button>
              </ButtonGroup>
            </div>
            <div style={row}>
              <Caption>vertical · two joined runs, kept apart by distance</Caption>
              <ButtonGroup aria-label="Row menu" orientation="vertical">
                <ButtonGroup
                  aria-label="Edit"
                  attached
                  orientation="vertical"
                  tone="secondary"
                  variant="outline"
                >
                  <Button>Duplicate</Button>
                  <Button>Archive</Button>
                </ButtonGroup>
                <ButtonGroup aria-label="Destructive" orientation="vertical">
                  <Button tone="danger" variant="outline">
                    Delete
                  </Button>
                </ButtonGroup>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const Separation: Story = {
  parameters: scenario('separation'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <section className="slotted-demo-scene">
        <header className="slotted-demo-scene__header">
          <span className="slotted-demo-scene__label">Gaps, clusters and rules</span>
          <span className="slotted-demo-scene__note">
            Two ways to say that actions belong apart, and both produce the same boundary width. A
            nested group stands half a gap further out on each side; a rule stands in the same
            place. Inside a joined bar the rule takes no room of its own: the bar stays one shape,
            and the boundary is painted in the column the shared edge already occupies, one step
            stronger than the seams around it.
          </span>
        </header>
        <div className="slotted-demo-stage" data-align="start">
          <div style={column}>
            {([2, 4, 8] as const).map((step) => (
              <div key={step} style={row}>
                <Caption>gap {step}</Caption>
                <ButtonGroup aria-label={`Gap ${step}`} gap={step}>
                  <Button tone="secondary" variant="outline">
                    Cancel
                  </Button>
                  <Button>Save</Button>
                </ButtonGroup>
              </div>
            ))}
            <div style={row}>
              <Caption>clusters · a nested group is a boundary</Caption>
              <ButtonGroup aria-label="Record">
                <ButtonGroup aria-label="Edit" attached tone="secondary" variant="outline">
                  <Button>Duplicate</Button>
                  <Button>Archive</Button>
                </ButtonGroup>
                <ButtonGroup aria-label="Destructive">
                  <Button tone="danger">Delete</Button>
                </ButtonGroup>
              </ButtonGroup>
            </div>
            <div style={row}>
              <Caption>a rule inside a joined icon bar</Caption>
              <ButtonGroup aria-label="Editor tools" attached>
                <IconButton aria-label="Undo">{UNDO}</IconButton>
                <IconButton aria-label="Redo">{REDO}</IconButton>
                <ButtonGroupSeparator />
                <IconButton aria-label="Delete" tone="danger">
                  {TRASH}
                </IconButton>
              </ButtonGroup>
            </div>
            <div style={row}>
              <Caption>a rule inside a framed bar</Caption>
              <ButtonGroup aria-label="View" attached tone="secondary" variant="outline">
                <Button>Day</Button>
                <Button>Week</Button>
                <ButtonGroupSeparator />
                <Button>Today</Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const Collapse: Story = {
  parameters: scenario('collapse'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <section className="slotted-demo-scene">
        <header className="slotted-demo-scene__header">
          <span className="slotted-demo-scene__label">When the row does not fit</span>
          <span className="slotted-demo-scene__note">
            Narrow the window. The first group wraps and its lines keep the same separation. The
            second turns into a column below 360 pixels of its own inline size, decided by a
            container query rather than by measuring after hydration — so it is already right in a
            server render. A stacking group holds the line it measures, which is why justify places
            its buttons on it.
          </span>
        </header>
        <div className="slotted-demo-stage" data-align="start">
          <div style={column}>
            <div style={row}>
              <Caption>wrap · the default</Caption>
              <Frame>
                <ButtonGroup aria-label="Filters" size="sm" tone="secondary" variant="outline">
                  <Button>Overdue</Button>
                  <Button>Awaiting review</Button>
                  <Button>Paid in full</Button>
                  <Button>Disputed</Button>
                </ButtonGroup>
              </Frame>
            </div>
            <div style={row}>
              <Caption>stack · a row above 360px, a column below it</Caption>
              <Frame>
                <ButtonGroup aria-label="Dialog actions" collapse="stack" justify="end">
                  <Button tone="secondary" variant="outline">
                    Cancel
                  </Button>
                  <Button tone="secondary" variant="outline">
                    Save as draft
                  </Button>
                  <Button>Publish now</Button>
                </ButtonGroup>
              </Frame>
            </div>
            <div style={row}>
              <Caption>fullWidth · equal segments, whatever the labels weigh</Caption>
              <Frame>
                <ButtonGroup aria-label="Range" fullWidth tone="secondary" variant="outline">
                  <Button>Day</Button>
                  <Button>This quarter</Button>
                </ButtonGroup>
              </Frame>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <section className="slotted-demo-scene">
        <header className="slotted-demo-scene__header">
          <span className="slotted-demo-scene__label">What the group hands down</span>
          <span className="slotted-demo-scene__note">
            tone, variant and size travel through the button family’s own defaults, so a button that
            states one itself still wins. Every other state belongs to the control: the group does
            not disable, does not wait, and does not press. What the group does own is the bar’s
            edge — a control that is on, or unavailable, keeps the frame it sits in and changes only
            its fill, so the bar never has a hole where that control is.
          </span>
        </header>
        <div className="slotted-demo-stage" data-align="start">
          <div style={column}>
            <div style={row}>
              <Caption>the group paints, the button overrules</Caption>
              <ButtonGroup aria-label="Painted" size="sm" tone="secondary" variant="outline">
                <Button>Inherits</Button>
                <Button>Inherits</Button>
                <Button tone="danger" variant="solid">
                  States its own
                </Button>
              </ButtonGroup>
            </div>
            <div style={row}>
              <Caption>a toggle that is on — at each of the three positions</Caption>
              <ButtonGroup aria-label="View" attached tone="secondary" variant="outline">
                <ToggleButton defaultPressed>List</ToggleButton>
                <ToggleButton defaultPressed={false}>Board</ToggleButton>
                <ToggleButton defaultPressed={false}>Calendar</ToggleButton>
              </ButtonGroup>
              <ButtonGroup aria-label="View" attached tone="secondary" variant="outline">
                <ToggleButton defaultPressed={false}>List</ToggleButton>
                <ToggleButton defaultPressed>Board</ToggleButton>
                <ToggleButton defaultPressed={false}>Calendar</ToggleButton>
              </ButtonGroup>
              <ButtonGroup aria-label="View" attached tone="secondary" variant="outline">
                <ToggleButton defaultPressed={false}>List</ToggleButton>
                <ToggleButton defaultPressed={false}>Board</ToggleButton>
                <ToggleButton defaultPressed>Calendar</ToggleButton>
              </ButtonGroup>
            </div>
            <div style={row}>
              <Caption>two variants joined · the seam is the filled control’s own edge</Caption>
              <ButtonGroup aria-label="Save or cancel" attached>
                <Button tone="secondary" variant="outline">
                  Cancel
                </Button>
                <Button>Save</Button>
              </ButtonGroup>
            </div>
            <div style={row}>
              <Caption>one control waiting, one unavailable</Caption>
              <ButtonGroup aria-label="Review" attached tone="secondary" variant="outline">
                <Button>Approve</Button>
                <Button loading loadingLabel="Reassigning">
                  Reassign
                </Button>
                <Button disabled>Reject</Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <section className="slotted-demo-scene">
        <header className="slotted-demo-scene__header">
          <span className="slotted-demo-scene__label">Several tab stops, and a name</span>
          <span className="slotted-demo-scene__note">
            Tab through the bar below. Every control is its own stop and its focus ring is painted
            over its neighbours rather than under them, which is the whole reason a joined group
            raises the control being touched. The arrow-key model — one tab stop, Left and Right
            between controls — is the toolbar family, not this one.
          </span>
        </header>
        <div className="slotted-demo-stage" data-align="start">
          <div style={column}>
            <div style={row}>
              <Caption>aria-label names the group</Caption>
              <ButtonGroup aria-label="Text alignment" attached tone="secondary" variant="outline">
                <Button>Day</Button>
                <Button>Week</Button>
                <Button>Month</Button>
              </ButtonGroup>
            </div>
            <div style={row}>
              <Caption>a named cluster says more than a rule can</Caption>
              <ButtonGroup aria-label="Record">
                <ButtonGroup aria-label="Edit" attached tone="secondary" variant="outline">
                  <Button>Duplicate</Button>
                  <Button>Archive</Button>
                </ButtonGroup>
                <ButtonGroup aria-label="Destructive">
                  <Button tone="danger">Delete</Button>
                </ButtonGroup>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
};
