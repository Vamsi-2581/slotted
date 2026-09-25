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

export const REACT_MENU_TOKENS = menuTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Menu decision',
}));

const imports: ReferenceImport = {
  source:
    "import { Menu, MenuCheckboxItem, MenuContent, MenuGroup, MenuItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuTrigger } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, or the element render returns',
    required: true,
    purpose:
      'The layer. It carries data-ui="menu", the size, the side and the align the positioner resolved, and data-open; the engine writes its position onto it, and the gap between the control and the surface is its own padding.',
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
    element: 'div',
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
    element: 'button, or a when the item is a link',
    required: true,
    purpose:
      'One command, option or choice. Its role is menuitem, menuitemcheckbox or menuitemradio; a disabled item keeps its place in the ring and takes aria-disabled, because the pattern asks that disabled items stay focusable.',
  },
  {
    part: 'indicator',
    element: 'span',
    required: false,
    purpose:
      'The check or the dot on a checkbox or radio item. Its box exists whether or not the mark is drawn, so a menu of options does not shift as one is checked.',
  },
  {
    part: 'icon',
    element: 'span',
    required: false,
    purpose:
      "The mark in the first column: content the consumer passes — the library's Glyph in an icon box, or their own element — which the column sizes and never paints. It shares the column with the indicator, because a checkbox item's mark is its icon.",
  },
  {
    part: 'label',
    element: 'span',
    required: true,
    purpose: "The item's words, and the only column that gives way when the surface is narrow.",
  },
  {
    part: 'description',
    element: 'span',
    required: false,
    purpose:
      'The line under the label. The item points at it with aria-describedby, so a reader hears the command and then the warning rather than one long name.',
  },
  {
    part: 'shortcut',
    element: 'span',
    required: false,
    purpose:
      'The binding printed for the platform — ⌘K on a Mac, Ctrl+K elsewhere. It is aria-hidden, because the item announces the binding with aria-keyshortcuts.',
  },
  {
    part: 'separator',
    element: 'hr',
    required: false,
    purpose: 'A rule between two runs of items. Not focusable and not interactive.',
  },
  {
    part: 'empty',
    element: 'div',
    required: false,
    purpose:
      "What the surface says when it holds no items, and what it shows while it is loading. It keeps the surface's measure rather than collapsing to a two-pixel box.",
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One menu with every axis on it, driven by the controls under the canvas. Change side and align and watch the surface move around the control that opened it.',
    snippet: defineSnippet({
      id: 'menu-react-playground',
      language: 'tsx',
      label: 'A control, and the commands it opens',
      source: `<Menu>
  <MenuTrigger render={(props) => <Button {...props} variant="outline" />}>Document</MenuTrigger>
  <MenuContent>
    <MenuItem shortcut="Mod+D">Duplicate</MenuItem>
    <MenuItem disabled>Publish</MenuItem>
    <MenuSeparator />
    <MenuItem tone="danger">Delete…</MenuItem>
  </MenuContent>
</Menu>;`,
    }),
  },
  {
    id: 'commands',
    title: 'Commands',
    note: 'The default: an item runs and the menu closes. The second item asks to stay open, which is what a command a reader repeats needs.',
    snippet: defineSnippet({
      id: 'menu-react-commands',
      language: 'tsx',
      label: 'Running an item, and staying open',
      source: `<>
  <MenuItem onSelect={(event) => duplicate(event.reason)}>Duplicate</MenuItem>
  <MenuItem closeOnSelect={false} onSelect={zoomIn}>
    Zoom in
  </MenuItem>
</>;`,
    }),
  },
  {
    id: 'icons',
    title: 'Icons',
    note: 'Two items carry a mark and two do not, and every label still starts on the same line: the column exists for the menu rather than for the item.',
    snippet: defineSnippet({
      id: 'menu-react-icons',
      language: 'tsx',
      label: 'A glyph in the first column',
      source: `<>
  <MenuItem
    icon={
      <Icon>
        <Glyph name="copy" />
      </Icon>
    }
  >
    Duplicate
  </MenuItem>
  <MenuItem>Rename</MenuItem>
</>;`,
    }),
  },
  {
    id: 'shortcuts',
    title: 'Shortcuts',
    note: 'Written once as Mod+S and printed as ⌘S on a Mac and Ctrl+S elsewhere. The legend is hidden from a screen reader, which hears aria-keyshortcuts instead.',
    snippet: defineSnippet({
      id: 'menu-react-shortcuts',
      language: 'tsx',
      label: 'One notation, every platform',
      source: `<>
  <MenuItem shortcut="Mod+S">Save</MenuItem>
  <MenuItem shortcut="Shift+Mod+S">Save as…</MenuItem>
</>;`,
    }),
  },
  {
    id: 'checkbox-items',
    title: 'Checkbox items',
    note: 'Each item holds a state of its own and the menu stays open, so a reader can turn three things on without opening it three times. Space toggles without closing.',
    snippet: defineSnippet({
      id: 'menu-react-checkbox-items',
      language: 'tsx',
      label: 'An option that stays put',
      source: `<MenuCheckboxItem checked={rulers} onCheckedChange={setRulers}>
  Rulers
</MenuCheckboxItem>;`,
    }),
  },
  {
    id: 'radio-items',
    title: 'Radio items',
    note: 'One value across the group, chosen among the items inside it. The mark sits in the same column an icon would, so the labels stay in line.',
    snippet: defineSnippet({
      id: 'menu-react-radio-items',
      language: 'tsx',
      label: 'One choice among several',
      source: `<MenuRadioGroup value={sort} onValueChange={setSort}>
  <MenuRadioItem value="name">Name</MenuRadioItem>
  <MenuRadioItem value="date">Date modified</MenuRadioItem>
</MenuRadioGroup>;`,
    }),
  },
  {
    id: 'groups',
    title: 'Groups',
    note: 'A label names the run under it and the group points at it, so a reader hears "Sort by" before the options rather than a heading belonging to nothing.',
    snippet: defineSnippet({
      id: 'menu-react-groups',
      language: 'tsx',
      label: 'A named run of items',
      source: `<MenuGroup label="Sort by">
  <MenuItem>Name</MenuItem>
  <MenuItem>Date modified</MenuItem>
</MenuGroup>;`,
    }),
  },
  {
    id: 'submenu',
    title: 'Submenus',
    note: 'A menu nested in a menu. Hover opens it after a pause, the inline-end arrow opens it from the keyboard, and the pointer may cut diagonally across the items between.',
    snippet: defineSnippet({
      id: 'menu-react-submenu',
      language: 'tsx',
      label: 'The same family, opened from an item',
      source: `<MenuContent>
  <MenuItem>Copy link</MenuItem>
  <Menu>
    <MenuTrigger>Send to</MenuTrigger>
    <MenuContent>
      <MenuItem>Slack</MenuItem>
    </MenuContent>
  </Menu>
</MenuContent>;`,
    }),
  },
  {
    id: 'submenu-open',
    title: 'Submenu open',
    note: 'The submenu as it lands: its panel one gap out from the parent surface, not against the item, and its first item level with the item that opened it. Every other scene keeps its submenu closed until it is hovered or the inline-end arrow asks for it.',
    snippet: defineSnippet({
      id: 'menu-react-submenu-open',
      language: 'tsx',
      label: 'Open from the start, for a capture',
      source: `<Menu defaultOpen>
  <MenuTrigger>Send to</MenuTrigger>
  <MenuContent>
    <MenuItem>Slack</MenuItem>
  </MenuContent>
</Menu>;`,
    }),
  },
  {
    id: 'tone',
    title: 'Tone',
    note: 'A destructive command reads as destructive before it is read at all: the tone paints the label, the mark and the highlight together, in all three schemes.',
    snippet: defineSnippet({
      id: 'menu-react-tone',
      language: 'tsx',
      label: 'A command that destroys something',
      source: `<MenuItem tone="danger" onSelect={remove}>
  Delete document
</MenuItem>;`,
    }),
  },
  {
    id: 'placement',
    title: 'Placement',
    note: 'The surface hangs from the start edge of its control by default, and flips or slides rather than leaving the screen. Both inline values mirror in a right-to-left document.',
    snippet: defineSnippet({
      id: 'menu-react-placement',
      language: 'tsx',
      label: 'Where the surface hangs',
      source: `<Menu side="inline-end" align="start" sideOffset={4}>
  <MenuTrigger>Actions</MenuTrigger>
  <MenuContent>
    <MenuItem>Rename</MenuItem>
  </MenuContent>
</Menu>;`,
    }),
  },
  {
    id: 'scrolling',
    title: 'A menu taller than the screen',
    note: 'The surface is bounded by the room the positioner reports and scrolls inside it, so thirty commands never run off the bottom of the window.',
    snippet: defineSnippet({
      id: 'menu-react-scrolling',
      language: 'tsx',
      label: 'Bounded by the room that is left',
      source: `<MenuContent aria-label="Move to">
  {folders.map((folder) => (
    <MenuItem key={folder}>{folder}</MenuItem>
  ))}
</MenuContent>;`,
    }),
  },
  {
    id: 'states',
    title: 'States',
    note: 'Disabled, checked, the parent item while its submenu is open, and the surface waiting for its items. A disabled item still takes focus and still runs nothing.',
    snippet: defineSnippet({
      id: 'menu-react-states',
      language: 'tsx',
      label: 'Every state the contract declares',
      source: `<MenuContent loading={pending}>
  <MenuItem disabled>Publish</MenuItem>
  <MenuCheckboxItem checked>Show comments</MenuCheckboxItem>
  <MenuEmpty>Loading labels…</MenuEmpty>
</MenuContent>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'Keyboard',
    note: 'Arrows move and wrap, Home and End reach the ends, typing jumps to a command by name, Escape closes one surface and Tab closes them all and moves on down the page.',
    snippet: defineSnippet({
      id: 'menu-react-keyboard',
      language: 'tsx',
      label: 'Nothing to write: the pattern is the default',
      source: `<Menu loop typeahead>
  <MenuTrigger>Commands</MenuTrigger>
  <MenuContent>
    <MenuItem textValue="Save">Save</MenuItem>
  </MenuContent>
</Menu>;`,
    }),
  },
  {
    id: 'composition',
    title: 'In context',
    note: "A row of actions in a table: the trigger is the consumer's own icon button, the menu holds the row's commands, and the defaults provider sets the side once.",
    snippet: defineSnippet({
      id: 'menu-react-composition',
      language: 'tsx',
      label: "The consumer's own control, wired",
      source: `<MenuDefaultsProvider side="bottom" align="end">
  <Menu>
    <MenuTrigger render={(props) => <Button {...props} variant="ghost" aria-label="Row actions" />}>
      ⋯
    </MenuTrigger>
    <MenuContent>
      <MenuItem>Open</MenuItem>
    </MenuContent>
  </Menu>
</MenuDefaultsProvider>;`,
    }),
  },
];

const api = apiRows([
  [
    'open',
    'boolean | undefined',
    '—',
    'Menu',
    "The consumer's value. Present at all puts the menu in controlled mode for its lifetime.",
  ],
  [
    'defaultOpen',
    'boolean',
    'false',
    'Menu',
    'The value an uncontrolled menu starts from, read once.',
  ],
  [
    'onOpenChange',
    '(open, request) => void',
    '—',
    'Menu',
    'Asked before the surface moves, with the reason and the event, and refusable.',
  ],
  [
    'value',
    'string',
    '—',
    'Menu',
    'The name this menu answers to on a bar. On its own a menu needs none.',
  ],
  [
    'checked',
    'boolean | undefined',
    '—',
    'MenuCheckboxItem',
    "The consumer's value for one option.",
  ],
  [
    'defaultChecked',
    'boolean',
    'false',
    'MenuCheckboxItem',
    'What an uncontrolled option starts as.',
  ],
  [
    'onCheckedChange',
    '(checked, request) => void',
    '—',
    'MenuCheckboxItem',
    'Asked before the option moves, with the device that moved it.',
  ],
  [
    'defaultValue',
    'string',
    '—',
    'MenuRadioGroup',
    'The choice an uncontrolled group starts with.',
  ],
  [
    'onValueChange',
    '(value, request) => void',
    '—',
    'MenuRadioGroup',
    'Asked before the choice moves, with the device that moved it.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'Menu',
    "The surface's measure and the geometry of its items.",
  ],
  [
    'side',
    "'top' | 'bottom' | 'inline-start' | 'inline-end' | 'left' | 'right'",
    'bottom',
    'Menu',
    'The edge the surface hangs from. The two logical values mirror.',
  ],
  [
    'align',
    "'start' | 'center' | 'end'",
    'start',
    'Menu',
    'Where the surface sits along that edge.',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'Menu',
    'When the layer exists: only while open, from the first open, or from the start.',
  ],
  [
    'strategy',
    "'absolute' | 'fixed'",
    'absolute',
    'Menu',
    'Which containing block the layer is measured against.',
  ],
  [
    'closeOnSelect',
    'boolean',
    'true',
    'Menu, MenuItem',
    'Whether running an item closes the menu. A checkbox or radio item defaults to keeping it open.',
  ],
  ['loop', 'boolean', 'true', 'Menu', 'Whether the arrows wrap past the ends.'],
  [
    'typeahead',
    'boolean',
    'true',
    'Menu',
    'Whether typing moves to the item whose label begins with it.',
  ],
  [
    'openOnHover',
    'boolean',
    'true',
    'Menu',
    'Whether a submenu opens when the pointer rests on its item.',
  ],
  ['closeOnEscape', 'boolean', 'true', 'Menu', 'Whether Escape closes the topmost surface.'],
  [
    'closeOnOutsidePress',
    'boolean',
    'true',
    'Menu',
    'Whether a press outside the layer closes the stack.',
  ],
  [
    'flip',
    'boolean',
    'true',
    'Menu',
    'Whether the surface moves to the opposite side when this one collides.',
  ],
  [
    'shift',
    'boolean',
    'true',
    'Menu',
    'Whether the surface slides along its side to stay in view.',
  ],
  [
    'hideWhenDetached',
    'boolean',
    'true',
    'Menu',
    'Whether the surface hides once its control has scrolled out of its clipper.',
  ],
  [
    'portal',
    'boolean',
    'true',
    'Menu',
    'Whether the layer is rendered at the end of the document.',
  ],
  [
    'disabled',
    'boolean',
    'false',
    'Menu',
    'A disabled menu never opens, and its control keeps aria-expanded="false".',
  ],
  [
    'loading',
    'boolean',
    'false',
    'MenuContent',
    'The surface is waiting for its items: it keeps its measure and says so with aria-busy.',
  ],
  [
    'sideOffset',
    'number',
    '0',
    'Menu',
    "Additional distance from the control, beyond the layer's own gap.",
  ],
  ['alignOffset', 'number', '0', 'Menu', 'Distance along the alignment axis.'],
  ['collisionPadding', 'number', '8', 'Menu', 'How close to the boundary the surface may come.'],
  ['submenuOpenDelay', 'number', '150', 'Menu', 'How long a submenu waits before hover opens it.'],
  [
    'submenuCloseDelay',
    'number',
    '300',
    'Menu',
    'How long the grace area survives without movement.',
  ],
  [
    'typeaheadTimeout',
    'number',
    '500',
    'Menu',
    'How long a typed sequence survives before the next key starts a new one.',
  ],
  [
    'icon',
    'ReactNode',
    '—',
    'MenuItem',
    'The mark in the first column, which shares it with the indicator.',
  ],
  [
    'description',
    'ReactNode',
    '—',
    'MenuItem',
    'The line under the label, referenced with aria-describedby.',
  ],
  [
    'shortcut',
    'string',
    '—',
    'MenuItem',
    "A binding in this library's notation, printed for the platform and announced.",
  ],
  [
    'textValue',
    'string',
    '—',
    'MenuItem',
    'What typeahead matches on, when the visible label is not the word.',
  ],
  [
    'tone',
    "'accent' | 'secondary' | 'success' | 'warning' | 'danger'",
    '—',
    'MenuItem',
    'The tone the label, the mark and the highlight take.',
  ],
  ['label', 'ReactNode', '—', 'MenuGroup', 'The name of the group, rendered as its label part.'],
  [
    'render',
    '(props) => ReactNode',
    '—',
    'MenuTrigger, MenuContent, MenuItem',
    "Renders the consumer's own element with the wiring, the state and the handlers on it.",
  ],
]);

const events: EventRow[] = [
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: MenuChangeRequest)',
    when: 'Before the surface opens or closes. The request carries pointer, keyboard, escape, outsidePress, select, dismiss or programmatic, the originating event, and cancel() — which refuses the move before anything commits.',
  },
  {
    name: 'onCheckedChange',
    payload: '(checked: boolean, request: MenuCheckedChangeRequest)',
    when: 'Before a checkbox item moves, with pointer or keyboard as the reason.',
  },
  {
    name: 'onValueChange',
    payload: '(value: string, request: MenuValueChangeRequest)',
    when: 'Before a radio group moves to another value, with pointer or keyboard as the reason.',
  },
  {
    name: 'onSelect',
    payload: '(event: MenuSelectEvent)',
    when: 'When an item runs. preventDefault() keeps the menu open for that one interaction, which is what closeOnSelect cannot say per press.',
  },
];

const composition = apiRows([
  [
    'MenuDefaultsProvider',
    'component',
    '—',
    'Application',
    'Sets every axis once for a subtree, including the portal container. A menu that states one itself still wins.',
  ],
  [
    'render',
    'prop',
    '—',
    'MenuTrigger, MenuContent, MenuItem',
    "Replaces the rendered element with the consumer's own, keeping the wiring, the state attributes and the handlers.",
  ],
  [
    'useMenu',
    'hook',
    '—',
    'Inside a Menu',
    'Reads the menu around a part: whether it is open, its resolved axes, and toggle().',
  ],
  [
    'ref',
    'prop',
    '—',
    'Menu',
    'A handle carrying open(), close() and focus(), for the shortcut an application binds outside the menu.',
  ],
  [
    'native props',
    'attributes',
    '—',
    'Every part',
    "Anything the underlying element takes reaches it, and a consumer's own onClick, onKeyDown or onPointerEnter runs before the family's rather than instead of it.",
  ],
]);

const accessibility = [
  'The platform supplies the press: an item is a native button, so Enter and Space run it and the pointer semantics are the browser\'s own. role="menuitem" replaces role="button" so a reader hears an item rather than a control, and an item that is a link keeps its href and its role.',
  'The family supplies the composite keyboard the WAI-ARIA menu and menubar pattern describes: arrows move and wrap, Home and End reach the ends, printable characters jump by name, the inline-end arrow opens a submenu and the inline-start one closes it, Escape closes one surface and Tab closes every surface and moves focus past the control that opened them.',
  'A disabled item stays focusable and takes aria-disabled rather than the native attribute, because the pattern asks that a reader be able to find a command that is currently unavailable — and a natively disabled button cannot be focused at all.',
  'A reader hears the surface named by the control that opened it, each option as checked or not through aria-checked, each group by the label inside it, and a shortcut through aria-keyshortcuts — the printed legend is hidden, so the name stays the command rather than the command and its keys.',
];

const code = defineSnippet({
  id: 'menu-react-code',
  language: 'tsx',
  label: 'The anatomy as it reaches the DOM',
  source: `<div data-ui="menu" data-part="root" data-side="bottom" data-align="start" data-size="md" data-open>
  <div data-part="content" role="menu" aria-labelledby="trigger-id" tabindex="-1">
    <div data-part="group" role="group" aria-labelledby="group-id">
      <div data-part="group-label" id="group-id">
        File
      </div>
      <button
        data-part="item"
        role="menuitem"
        type="button"
        tabindex="-1"
        aria-keyshortcuts="Control+D"
      >
        <span data-part="icon">
          <span data-ui="icon" data-part="root" aria-hidden="true">
            <svg data-part="glyph" data-glyph="copy" />
          </span>
        </span>
        <span data-part="label">Duplicate</span>
        <span data-part="shortcut" aria-hidden="true">
          Ctrl+D
        </span>
      </button>
    </div>
    <hr data-part="separator" role="separator" aria-orientation="horizontal" />
    <button
      data-part="item"
      role="menuitemcheckbox"
      aria-checked="true"
      data-checked
      type="button"
      tabindex="-1"
    >
      <span data-part="indicator">
        <span data-ui="icon" data-part="root" aria-hidden="true">
          <svg data-part="glyph" data-glyph="check" />
        </span>
      </span>
      <span data-part="label">Show comments</span>
    </button>
  </div>
</div>;`,
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

export const REACT_MENU_DOCS = {
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
