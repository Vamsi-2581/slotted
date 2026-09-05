import menuTokens from '@slotted/styles/menu/tokens.json';
import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const ANGULAR_MENU_TOKENS = menuTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Menu decision',
}));

const imports: ReferenceImport = {
  source:
    "import { SlMenu, SlMenuGroup, SlMenuItem, SlMenuItemDescription, SlMenuItemIcon, SlMenuRadioGroup, SlMenuSeparator, SlMenuTrigger } from '@slotted/angular/menu';",
  selector:
    'sl-menu, [slMenuTriggerFor], button[slMenuItem], button[slMenuCheckboxItem], button[slMenuRadioItem], sl-menu-group, sl-menu-radio-group, hr[slMenuSeparator]',
  exportAs: 'slMenu, slMenuTrigger, slMenuItem, slMenuGroup, slMenuRadioGroup',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, built into the portal when the menu opens',
    required: true,
    purpose:
      'The layer. It carries data-ui="menu", the size, the side and the align the positioner resolved, and data-open; a layer kept by mount="lazy" or "eager" carries inert while it is closed.',
  },
  {
    part: 'content',
    element: 'div',
    required: true,
    purpose:
      'The painted surface, and the element carrying role="menu". It owns the three columns every item passes through, is bounded by the height the positioner reports, and scrolls inside it.',
  },
  {
    part: 'group',
    element: 'sl-menu-group, or sl-menu-radio-group',
    required: false,
    purpose:
      'A set of items with a name, as role="group". It spans every column and inherits them, so its items keep the menu\'s columns rather than starting a second set.',
  },
  {
    part: 'group-label',
    element: 'div',
    required: false,
    purpose: 'The name of a group, which the group points at with aria-labelledby.',
  },
  {
    part: 'item',
    element: 'button[slMenuItem], or a[slMenuItem] for a link',
    required: true,
    purpose:
      'One command, option or choice. slMenuCheckboxItem and slMenuRadioItem decide the role; a disabled item keeps its place in the ring and takes aria-disabled, because the pattern asks that disabled items stay focusable.',
  },
  {
    part: 'indicator',
    element: 'span, drawn by the item',
    required: false,
    purpose:
      'The check or the dot on a checkbox or radio item. Its box exists whether or not the mark is drawn, so a menu of options does not shift as one is checked.',
  },
  {
    part: 'icon',
    element: 'span[slMenuItemIcon]',
    required: false,
    purpose:
      "The mark in the first column, from a glyph token or the consumer's own element. It shares the column with the indicator, because a checkbox item's mark is its icon.",
  },
  {
    part: 'label',
    element: 'span, drawn by the item around its content',
    required: true,
    purpose: "The item's words, and the only column that gives way when the surface is narrow.",
  },
  {
    part: 'description',
    element: 'span[slMenuItemDescription]',
    required: false,
    purpose:
      'The line under the label. The item points at it with aria-describedby, so a reader hears the command and then the warning rather than one long name.',
  },
  {
    part: 'shortcut',
    element: 'span, drawn by the item',
    required: false,
    purpose:
      'The binding printed for the platform — ⌘K on a Mac, Ctrl+K elsewhere. It is aria-hidden, because the item announces the binding with aria-keyshortcuts.',
  },
  {
    part: 'separator',
    element: 'hr[slMenuSeparator]',
    required: false,
    purpose: 'A rule between two runs of items. Not focusable and not interactive.',
  },
  {
    part: 'empty',
    element: '[slMenuEmpty]',
    required: false,
    purpose:
      "What the surface says when it holds no items, and what it shows while it is loading. It keeps the surface's measure rather than collapsing to a two-pixel box.",
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One menu with every input on it, driven by the controls under the canvas. Change side and align and watch the surface move around the control that opened it.',
    snippet: defineSnippet({
      id: 'menu-angular-playground',
      language: 'angular',
      label: 'A control, and the commands it opens',
      source: `<button slButton variant="outline" [slMenuTriggerFor]="document">Document</button>
<sl-menu #document>
  <button slMenuItem shortcut="Mod+D">Duplicate</button>
  <button slMenuItem [disabled]="true">Publish</button>
  <hr slMenuSeparator />
  <button slMenuItem tone="danger">Delete…</button>
</sl-menu>`,
    }),
  },
  {
    id: 'commands',
    title: 'Commands',
    note: 'The default: an item runs and the menu closes. The second asks to stay open, which is what a command a reader repeats needs.',
    snippet: defineSnippet({
      id: 'menu-angular-commands',
      language: 'angular',
      label: 'Running an item, and staying open',
      source: `<button slMenuItem (select)="duplicate($event.reason)">Duplicate</button>
<button slMenuItem [closeOnSelect]="false" (select)="zoomIn()">Zoom in</button>`,
    }),
  },
  {
    id: 'icons',
    title: 'Icons',
    note: 'Two items carry a mark and two do not, and every label still starts on the same line: the column exists for the menu rather than for the item.',
    snippet: defineSnippet({
      id: 'menu-angular-icons',
      language: 'angular',
      label: 'A glyph in the first column',
      source: `<button slMenuItem>
  <sl-icon slMenuItemIcon name="copy" />
  Duplicate
</button>`,
    }),
  },
  {
    id: 'shortcuts',
    title: 'Shortcuts',
    note: 'Written once as Mod+S and printed as ⌘S on a Mac and Ctrl+S elsewhere. The legend is hidden from a screen reader, which hears aria-keyshortcuts instead.',
    snippet: defineSnippet({
      id: 'menu-angular-shortcuts',
      language: 'angular',
      label: 'One notation, every platform',
      source: `<button slMenuItem shortcut="Mod+S">Save</button>
<button slMenuItem shortcut="Shift+Mod+S">Save as…</button>`,
    }),
  },
  {
    id: 'checkbox-items',
    title: 'Checkbox items',
    note: 'Each item holds a state of its own and the menu stays open, so a reader can turn three things on without opening it three times. Space toggles without closing.',
    snippet: defineSnippet({
      id: 'menu-angular-checkbox-items',
      language: 'angular',
      label: 'An option that stays put',
      source: `<button slMenuCheckboxItem [(checked)]="rulers">Rulers</button>`,
    }),
  },
  {
    id: 'radio-items',
    title: 'Radio items',
    note: 'One value across the group, chosen among the items inside it. The mark sits in the same column an icon would, so the labels stay in line.',
    snippet: defineSnippet({
      id: 'menu-angular-radio-items',
      language: 'angular',
      label: 'One choice among several',
      source: `<sl-menu-radio-group [(value)]="sort">
  <button slMenuRadioItem value="name">Name</button>
  <button slMenuRadioItem value="date">Date modified</button>
</sl-menu-radio-group>`,
    }),
  },
  {
    id: 'groups',
    title: 'Groups',
    note: 'A label names the run under it and the group points at it, so a reader hears "Sort by" before the options rather than a heading belonging to nothing.',
    snippet: defineSnippet({
      id: 'menu-angular-groups',
      language: 'angular',
      label: 'A named run of items',
      source: `<sl-menu-group label="Sort by">
  <button slMenuItem>Name</button>
  <button slMenuItem>Date modified</button>
</sl-menu-group>`,
    }),
  },
  {
    id: 'submenu',
    title: 'Submenus',
    note: 'A menu nested in a menu. Hover opens it after a pause, the inline-end arrow opens it from the keyboard, and the pointer may cut diagonally across the items between.',
    snippet: defineSnippet({
      id: 'menu-angular-submenu',
      language: 'angular',
      label: 'The same family, opened from an item',
      source: `<sl-menu #share>
  <button slMenuItem>Copy link</button>
  <button slMenuItem [slMenuTriggerFor]="sendTo">Send to</button>
  <sl-menu #sendTo>
    <button slMenuItem>Slack</button>
  </sl-menu>
</sl-menu>`,
    }),
  },
  {
    id: 'tone',
    title: 'Tone',
    note: 'A destructive command reads as destructive before it is read at all: the tone paints the label, the mark and the highlight together, in all three schemes.',
    snippet: defineSnippet({
      id: 'menu-angular-tone',
      language: 'angular',
      label: 'A command that destroys something',
      source: `<button slMenuItem tone="danger" (select)="remove()">
  Delete document
  <span slMenuItemDescription>This cannot be undone.</span>
</button>`,
    }),
  },
  {
    id: 'placement',
    title: 'Placement',
    note: 'The surface hangs from the start edge of its control by default, and flips or slides rather than leaving the screen. Both inline values mirror in a right-to-left document.',
    snippet: defineSnippet({
      id: 'menu-angular-placement',
      language: 'angular',
      label: 'Where the surface hangs',
      source: `<sl-menu #actions side="inline-end" align="start" [sideOffset]="4">
  <button slMenuItem>Rename…</button>
</sl-menu>`,
    }),
  },
  {
    id: 'scrolling',
    title: 'A menu taller than the screen',
    note: 'The surface is bounded by the room the positioner reports and scrolls inside it, so thirty commands never run off the bottom of the window.',
    snippet: defineSnippet({
      id: 'menu-angular-scrolling',
      language: 'angular',
      label: 'Bounded by the room that is left',
      source: `<sl-menu #moveTo aria-label="Move to">
  @for (folder of folders; track folder) {
    <button slMenuItem>{{ folder }}</button>
  }
</sl-menu>`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'Disabled, checked, the parent item while its submenu is open, and the surface waiting for its items. A disabled item still takes focus and still runs nothing.',
    snippet: defineSnippet({
      id: 'menu-angular-states',
      language: 'angular',
      label: 'Every state the contract declares',
      source: `<sl-menu #labels [loading]="pending()">
  <button slMenuItem [disabled]="true">Publish</button>
  <button slMenuCheckboxItem [checked]="true">Show comments</button>
  <div slMenuEmpty>Loading labels…</div>
</sl-menu>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'Keyboard',
    note: 'Arrows move and wrap, Home and End reach the ends, typing jumps to a command by name, Escape closes one surface and Tab closes them all and moves on down the page.',
    snippet: defineSnippet({
      id: 'menu-angular-keyboard',
      language: 'angular',
      label: 'Nothing to write: the pattern is the default',
      source: `<sl-menu #commands [loop]="true" [typeahead]="true">
  <button slMenuItem textValue="Save">Save</button>
</sl-menu>`,
    }),
  },
  {
    id: 'composition',
    title: 'In context',
    note: "A row of actions in a table: the trigger is the consumer's own icon button, the menu holds the row's commands, and provideMenuDefaults sets the side once.",
    snippet: defineSnippet({
      id: 'menu-angular-composition',
      language: 'angular',
      label: "The consumer's own control, wired",
      source: `<button slButton variant="ghost" aria-label="Row actions" [slMenuTriggerFor]="rowActions">⋯</button>
<sl-menu #rowActions>
  <button slMenuItem>Open</button>
</sl-menu>`,
    }),
  },
];

const api = apiRows([
  [
    'open',
    'model<boolean>',
    'false',
    'sl-menu',
    'Whether the surface is showing. A model, so [(open)] is both the value and the write-back; on a bar the bar holds it instead.',
  ],
  [
    'value',
    'string | undefined',
    '—',
    'sl-menu, button[slMenuRadioItem]',
    'The name a menu answers to on a bar, and the value a radio item stands for.',
  ],
  [
    'checked',
    'model<boolean>',
    'false',
    'button[slMenuCheckboxItem]',
    'Whether one option is on. A model, so [(checked)] is both the value and the write-back.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'sl-menu',
    "The surface's measure and the geometry of its items.",
  ],
  [
    'side',
    "'top' | 'bottom' | 'inline-start' | 'inline-end' | 'left' | 'right'",
    'bottom',
    'sl-menu',
    'The edge the surface hangs from. The two logical values mirror.',
  ],
  [
    'align',
    "'start' | 'center' | 'end'",
    'start',
    'sl-menu',
    'Where the surface sits along that edge.',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'sl-menu',
    'When the layer exists: only while open, from the first open, or from the start. A layer kept while closed carries inert.',
  ],
  [
    'strategy',
    "'absolute' | 'fixed'",
    'absolute',
    'sl-menu',
    'Which containing block the layer is measured against.',
  ],
  [
    'closeOnSelect',
    'boolean',
    'true',
    'sl-menu, button[slMenuItem]',
    'Whether running an item closes the menu. A checkbox or radio item defaults to keeping it open.',
  ],
  ['loop', 'boolean', 'true', 'sl-menu', 'Whether the arrows wrap past the ends.'],
  [
    'typeahead',
    'boolean',
    'true',
    'sl-menu',
    'Whether typing moves to the item whose label begins with it.',
  ],
  [
    'openOnHover',
    'boolean',
    'true',
    'sl-menu',
    'Whether a submenu opens when the pointer rests on its item.',
  ],
  ['closeOnEscape', 'boolean', 'true', 'sl-menu', 'Whether Escape closes the topmost surface.'],
  [
    'closeOnOutsidePress',
    'boolean',
    'true',
    'sl-menu',
    'Whether a press outside the layer closes the stack.',
  ],
  [
    'flip',
    'boolean',
    'true',
    'sl-menu',
    'Whether the surface moves to the opposite side when this one collides.',
  ],
  [
    'shift',
    'boolean',
    'true',
    'sl-menu',
    'Whether the surface slides along its side to stay in view.',
  ],
  [
    'hideWhenDetached',
    'boolean',
    'true',
    'sl-menu',
    'Whether the surface hides once its control has scrolled out of its clipper.',
  ],
  [
    'portal',
    'boolean',
    'true',
    'sl-menu',
    'Whether the layer is built at the end of the document.',
  ],
  [
    'disabled',
    'boolean',
    'false',
    'sl-menu, button[slMenuItem]',
    'A disabled menu never opens; a disabled item stays focusable and runs nothing.',
  ],
  [
    'loading',
    'boolean',
    'false',
    'sl-menu',
    'The surface is waiting for its items: it keeps its measure and says so with aria-busy.',
  ],
  [
    'sideOffset',
    'number',
    '0',
    'sl-menu',
    "Additional distance from the control, beyond the layer's own gap.",
  ],
  ['alignOffset', 'number', '0', 'sl-menu', 'Distance along the alignment axis.'],
  ['collisionPadding', 'number', '8', 'sl-menu', 'How close to the boundary the surface may come.'],
  [
    'submenuOpenDelay',
    'number',
    '100',
    'sl-menu',
    'How long a submenu waits before hover opens it.',
  ],
  [
    'submenuCloseDelay',
    'number',
    '300',
    'sl-menu',
    'How long the grace area survives without movement.',
  ],
  [
    'typeaheadTimeout',
    'number',
    '500',
    'sl-menu',
    'How long a typed sequence survives before the next key starts a new one.',
  ],
  [
    'shortcut',
    'string',
    '—',
    'button[slMenuItem]',
    "A binding in this library's notation, printed for the platform and announced.",
  ],
  [
    'textValue',
    'string',
    '—',
    'button[slMenuItem]',
    'What typeahead matches on, when the visible label is not the word.',
  ],
  [
    'tone',
    "'accent' | 'secondary' | 'success' | 'warning' | 'danger'",
    '—',
    'button[slMenuItem]',
    'The tone the label, the mark and the highlight take.',
  ],
  ['label', 'string', '—', 'sl-menu-group', 'The name of the group, rendered as its label part.'],
  [
    'slMenuTriggerFor',
    'SlMenu',
    '—',
    '[slMenuTriggerFor]',
    "The menu a control opens. On the consumer's own element, which is what Angular composes with.",
  ],
  [
    'aria-label',
    'string',
    '—',
    'sl-menu',
    'Names the surface itself, for a menu opened from a control with no words.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'openChange',
    payload: 'boolean',
    when: 'After the surface has opened or closed, as the write-back half of [(open)].',
  },
  {
    name: 'openChangeRequest',
    payload: 'ChangeRequest<boolean>',
    when: 'Before the surface moves. It carries pointer, keyboard, escape, outsidePress, select, dismiss or programmatic, the originating event, and cancel() — which refuses the move before anything commits.',
  },
  {
    name: 'checkedChange, checkedChangeRequest',
    payload: 'boolean, ChangeRequest<boolean>',
    when: 'After and before a checkbox item moves, with pointer or keyboard as the reason.',
  },
  {
    name: 'valueChange, valueChangeRequest',
    payload: 'string, ChangeRequest<string>',
    when: 'After and before a radio group moves to another value.',
  },
  {
    name: 'select',
    payload: 'MenuSelectEvent',
    when: 'When an item runs. preventDefault() keeps the menu open for that one interaction, which is what closeOnSelect cannot say per press.',
  },
];

const composition = apiRows([
  [
    'provideMenuDefaults',
    'provider',
    '—',
    'Application',
    'Sets every axis once, in the bootstrap or on a route. A menu that states one itself still wins.',
  ],
  [
    'slMenuTriggerFor',
    'directive',
    '—',
    'Any control',
    "Put on the consumer's own element rather than replacing it: the wiring, the state attributes and the keyboard arrive on the button, the link or the icon control they already have.",
  ],
  [
    'exportAs',
    'template reference',
    '—',
    'sl-menu, [slMenuTriggerFor]',
    'A template reaches the instance — #menu="slMenu" — for toggle(), closeAll() and the resolved axes.',
  ],
  [
    'ng-content',
    'projection',
    '—',
    'sl-menu, sl-menu-group',
    "The items are the consumer's own elements, projected into the surface the layer builds.",
  ],
  [
    'HostAttributeToken',
    'attribute',
    '—',
    'button[slMenuItem]',
    'Which of the three roles an item takes is read from the attribute the consumer wrote, because one element cannot carry two components.',
  ],
]);

const accessibility = [
  'The platform supplies the press: an item is a native button, so Enter and Space run it and the pointer semantics are the browser\'s own. role="menuitem" replaces role="button" so a reader hears an item rather than a control, and an item written as an anchor keeps its href.',
  'The family supplies the composite keyboard the WAI-ARIA menu and menubar pattern describes: arrows move and wrap, Home and End reach the ends, printable characters jump by name, the inline-end arrow opens a submenu and the inline-start one closes it, Escape closes one surface and Tab closes every surface and moves focus past the control that opened them.',
  'A disabled item stays focusable and takes aria-disabled rather than the native attribute, because the pattern asks that a reader be able to find a command that is currently unavailable — and a natively disabled button cannot be focused at all.',
  'A reader hears the surface named by the control that opened it, each option as checked or not through aria-checked, each group by the label inside it, and a shortcut through aria-keyshortcuts — the printed legend is hidden, so the name stays the command rather than the command and its keys.',
];

const code = defineSnippet({
  id: 'menu-angular-code',
  language: 'angular',
  label: 'The anatomy as it reaches the DOM',
  source: `<div data-ui="menu" data-part="root" data-side="bottom" data-align="start" data-size="md" data-open>
  <div data-part="content" role="menu" aria-labelledby="sl-menu-trigger-a1b2c3" tabindex="-1">
    <sl-menu-group data-part="group" role="group" aria-labelledby="sl-menu-group-d4e5f6">
      <div data-part="group-label" id="sl-menu-group-d4e5f6">File</div>
      <button
        data-part="item"
        role="menuitem"
        type="button"
        tabindex="-1"
        aria-keyshortcuts="Control+D"
      >
        <span data-part="label">Duplicate</span>
        <span data-part="shortcut" aria-hidden="true">Ctrl+D</span>
      </button>
    </sl-menu-group>
    <hr data-part="separator" role="separator" aria-orientation="horizontal" />
  </div>
</div>`,
});

const theming = defineSnippet({
  id: 'menu-theming',
  language: 'css',
  label: 'What an application retunes',
  source: `[data-ui='menu'] {
  --slotted-menu-surface: var(--slotted-surface-raised);
  --slotted-menu-radius: var(--slotted-radius-lg);
  --slotted-menu-measure: 18rem;
  --slotted-menu-highlight: var(--slotted-tone-accent-surface);
}`,
});

export const ANGULAR_MENU_DOCS = {
  menu: {
    accessibility,
    anatomy,
    api,
    composition,
    events,
    imports,
    scenes,
    snippets: [code, theming],
  },
};
