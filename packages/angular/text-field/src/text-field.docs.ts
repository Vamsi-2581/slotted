import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import textFieldTokens from '@slotted/styles/text-field/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const ANGULAR_TEXT_FIELD_TOKENS = textFieldTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Text Field decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  provideTextFieldDefaults,\n  SlTextField,\n  SlTextFieldAction,\n  SlTextFieldEnd,\n  SlTextFieldInput,\n  SlTextFieldStart,\n} from '@slotted/angular/text-field';",
  selector: '[slTextField]',
  exportAs: 'slTextField',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'the element carrying slTextField',
    required: true,
    purpose:
      'The frame. Carries data-ui="text-field", the two axes, and data-disabled, data-invalid, data-readonly and data-loading. It has no role: a textbox may hold only non-interactive children, so the two buttons are the control’s siblings and the box around them announces nothing.',
  },
  {
    part: 'input',
    element: 'input[slTextFieldInput]',
    required: true,
    purpose:
      'The control. Holds the value, the identifier and every native attribute the consumer wrote — type, autocomplete, inputmode, enterkeyhint, pattern, maxlength, name, required — each read before the host binding computes so none is written over. It is the ControlValueAccessor, so the control belongs in a reactive form as it stands.',
  },
  {
    part: 'start',
    element: 'any element carrying slTextFieldStart',
    required: false,
    purpose:
      'An adornment before the value in the reading direction: a currency mark, an icon, an @. It is its own bidi run, so R$ stays R$ in a right-to-left document, and any icon inside it is sized from the control’s own glyph scale.',
  },
  {
    part: 'end',
    element: 'any element carrying slTextFieldEnd',
    required: false,
    purpose: 'An adornment after the value in the reading direction: a unit, a domain, a suffix.',
  },
  {
    part: 'action',
    element: 'button[slTextFieldAction], inside slTextFieldStart or slTextFieldEnd',
    required: false,
    purpose:
      'A button of the consumer’s inside the frame: a submit, a menu trigger naming a country, a tooltip on an information mark. Square when named by aria-label, padded when named by its text; aria-expanded="true" keeps it pressed while its menu is open. slMenuTriggerFor may sit on the same element.',
  },
  {
    part: 'busy',
    element: 'span[data-ui="spinner"], rendered by the frame',
    required: false,
    purpose:
      'The shared ring, before the buttons, while [loading] is true. Rendered whenever loading is bound and hidden while it is false, so it leaves as well as arrives. Hidden from assistive technology: aria-busy on the input says it.',
  },
  {
    part: 'caps-lock',
    element: 'span, rendered by the frame',
    required: false,
    purpose:
      'A mark in a password while Caps Lock is on and the control has focus. Hidden from assistive technology; capsLockLabel is announced once as it turns on.',
  },
  {
    part: 'clear',
    element: 'button, rendered by the frame',
    required: false,
    purpose:
      'Empties the value with reason "clear" and returns focus to the control. Rendered while clearable, hidden while there is nothing to clear or the reader may not change it, and never smaller than 24 CSS pixels.',
  },
  {
    part: 'copy',
    element: 'button, rendered by the frame',
    required: false,
    purpose:
      'Writes the value to the clipboard, turns to a check with data-complete for two seconds and announces the outcome. Stays for a read-only value; hidden while the value is empty or disabled.',
  },
  {
    part: 'reveal',
    element: 'button, rendered by the frame',
    required: false,
    purpose:
      'Turns a password from dots into characters and back, holding the caret where it was. Its name does not change with its state — the APG’s rule for a toggle — and aria-pressed carries the state.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One control with every axis on it, driven by the controls below the canvas. Type into it: the clear button appears only once there is something to clear.',
    snippet: defineSnippet({
      id: 'text-field-angular-playground',
      language: 'angular',
      label: 'A control, its label and its help',
      source: `<div slField>
  <label slFieldLabel>E-mail</label>
  <div slTextField clearable>
    <input slTextFieldInput type="email" placeholder="voce@empresa.com.br" />
  </div>
  <span slFieldDescription>Usaremos este endereço para a cobrança.</span>
</div>`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the control sits at',
    note: 'Three steps, and inside a field the control takes the field’s rather than its own: a small field holding a medium control is a field and a control disagreeing about one row.',
    snippet: defineSnippet({
      id: 'text-field-angular-sizes',
      language: 'angular',
      label: 'Three steps, all answering density',
      source: `<div slTextField size="sm"><input slTextFieldInput /></div>
<div slTextField size="lg"><input slTextFieldInput /></div>

<!-- Inside a field the field decides, and the control follows. -->
<div slField size="sm">
  <div slTextField><input slTextFieldInput /></div>
</div>`,
    }),
  },
  {
    id: 'variants',
    title: 'How much frame the control shows',
    note: 'outline takes the ground it is placed on, subtle sinks into the page, and plain shows nothing until the pointer or the caret arrives — which is what a dense table cell needs.',
    snippet: defineSnippet({
      id: 'text-field-angular-variants',
      language: 'angular',
      label: 'Three frames, one box',
      source: `<div slTextField variant="subtle"><input slTextFieldInput /></div>

<!-- A cell that is only a control while it is being used. -->
<div slTextField variant="plain" mono><input slTextFieldInput /></div>`,
    }),
  },
  {
    id: 'adornments',
    title: 'What sits inside the border',
    note: 'start and end name the reading direction rather than a side, so the currency mark stays before the amount in Arabic as well. Neither of them is ever squeezed: the value gives up width first.',
    snippet: defineSnippet({
      id: 'text-field-angular-adornments',
      language: 'angular',
      label: 'A mark before the value and a unit after it',
      source: `<div slTextField>
  <span slTextFieldStart>R$</span>
  <input slTextFieldInput inputmode="decimal" defaultValue="1.480,00" />
  <span slTextFieldEnd>BRL</span>
</div>`,
    }),
  },
  {
    id: 'actions',
    title: 'The two buttons the frame draws',
    note: 'Both are real buttons inside the frame, both keep the caret, and both are held to the 24-pixel minimum. Tab into the field and press Tab again: the ring moves to the button rather than staying around the box.',
    snippet: defineSnippet({
      id: 'text-field-angular-actions',
      language: 'angular',
      label: 'Clear, and reveal',
      source: `<div slTextField clearable>
  <input slTextFieldInput type="search" defaultValue="nota fiscal 2026" />
</div>

<div slTextField revealable>
  <input slTextFieldInput type="password" autocomplete="current-password" />
</div>`,
    }),
  },
  {
    id: 'menu',
    title: 'A button of your own inside the frame',
    note: 'A country code that opens a menu, a category beside a search, a submit named in words, an overflow mark: each is a real button in start or end. Open one — it stays pressed while its menu is open, and the value keeps its place beside it.',
    snippet: defineSnippet({
      id: 'text-field-angular-menu',
      language: 'angular',
      label: 'A menu trigger on an action',
      source: `<div slTextField>
  <span slTextFieldStart>
    <button slTextFieldAction [slMenuTriggerFor]="countries">
      {{ country() }}
      <span slIcon><svg slGlyph name="chevron-down"></svg></span>
    </button>
  </span>
  <input slTextFieldInput type="tel" autocomplete="tel-national" />
</div>
<sl-menu #countries>
  <sl-menu-radio-group [(value)]="country">
    <button slMenuRadioItem value="+55">Brasil +55</button>
    <button slMenuRadioItem value="+351">Portugal +351</button>
  </sl-menu-radio-group>
</sl-menu>`,
    }),
  },
  {
    id: 'copy',
    title: 'Copying a value somebody has to paste elsewhere',
    note: 'Press the copy button: the mark turns to a check in the success ink for two seconds and the outcome is announced. A clipboard that refuses — an insecure page, a denied permission — is announced as a failure and shows no check.',
    snippet: defineSnippet({
      id: 'text-field-angular-copy',
      language: 'angular',
      label: 'A read-only link',
      source: `<div slTextField copyable (valueCopy)="$event.copied && track('invite-copied')">
  <input slTextFieldInput readonly defaultValue="https://nexora.app/convite/8f3a" />
</div>`,
    }),
  },
  {
    id: 'password',
    title: 'A password: showing it, and warning about Caps Lock',
    note: 'Focus the password and turn Caps Lock on: the warning mark appears before the eye and is announced once. The eye swaps to a crossed eye and back, and the caret stays where it was.',
    snippet: defineSnippet({
      id: 'text-field-angular-password',
      language: 'angular',
      label: 'Reveal, and the Caps Lock mark every password gets',
      source: `<div slTextField revealable>
  <span slTextFieldStart><span slIcon><svg slGlyph name="lock"></svg></span></span>
  <input slTextFieldInput type="password" autocomplete="current-password" />
</div>`,
    }),
  },
  {
    id: 'loading',
    title: 'Checking the value while the reader keeps typing',
    note: 'A user name checked against the server: the ring stands before the buttons and the input is aria-busy, but it stays editable. Turn loading off and the ring shrinks out rather than vanishing.',
    snippet: defineSnippet({
      id: 'text-field-angular-loading',
      language: 'angular',
      label: 'An asynchronous check',
      source: `<div slTextField clearable [loading]="checking()">
  <span slTextFieldStart>@</span>
  <input slTextFieldInput [formControl]="handle" />
</div>`,
    }),
  },
  {
    id: 'states',
    title: 'The four states the frame paints',
    note: 'Read-only keeps full-strength ink and only its ground changes, because the value is real and still submitted; disabled is muted to a measured colour rather than faded, so a disabled form still says what it holds.',
    snippet: defineSnippet({
      id: 'text-field-angular-states',
      language: 'angular',
      label: 'Every state unset by default, and native where the word means native',
      source: `<!-- Unstated rather than false, so the control defers to its field. -->
<div slTextField>
  <input slTextFieldInput invalid />
</div>
<div slTextField>
  <input slTextFieldInput readonly defaultValue="Somente leitura" />
</div>
<div slTextField>
  <input slTextFieldInput disabled defaultValue="Desativado" />
</div>`,
    }),
  },
  {
    id: 'count',
    title: 'Counting what has been typed',
    note: 'The control counts and the field places it, in the spare column of the label row. Pass countMax without maxlength and the limit becomes a soft one: the value may pass it, and the counter turns before validation runs.',
    snippet: defineSnippet({
      id: 'text-field-angular-count',
      language: 'angular',
      label: 'A hard limit, and a soft one',
      source: `<div slField>
  <label slFieldLabel>Assunto</label>
  <div slTextField>
    <input slTextFieldInput showCount maxlength="60" />
  </div>
</div>

<!-- A limit the browser does not enforce: the value may pass it. -->
<div slField>
  <div slTextField>
    <input slTextFieldInput showCount countMax="16" />
  </div>
</div>`,
    }),
  },
  {
    id: 'types',
    title: 'What kind of text this is',
    note: 'type is the element’s own, and so is everything that travels with it. A phone field that offers the wrong keyboard on a phone is a field nobody fills in twice.',
    snippet: defineSnippet({
      id: 'text-field-angular-types',
      language: 'angular',
      label: 'The six types, and the attributes that go with them',
      source: `<div slTextField>
  <input slTextFieldInput type="email" autocomplete="email" inputmode="email" />
</div>
<div slTextField>
  <input slTextFieldInput type="tel" autocomplete="tel" inputmode="tel" />
</div>
<div slTextField clearable>
  <input slTextFieldInput type="search" enterkeyhint="search" />
</div>`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A value longer than the control ellipsises rather than clipping mid-glyph; an unbroken token scrolls, which is the platform’s answer; and at 240 pixels the value surrenders width while the adornments keep their target size.',
    snippet: defineSnippet({
      id: 'text-field-angular-content',
      language: 'angular',
      label: 'Long, translated and right-to-left',
      source: `<div slTextField>
  <input slTextFieldInput defaultValue="Kraftfahrzeug-Haftpflichtversicherungsnummer" />
</div>

<!-- Nothing is removed from the DOM: the whole value stays selectable. -->
<div slTextField clearable>
  <input slTextFieldInput dir="rtl" defaultValue="مرحبا بالعالم" />
</div>`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, and reaching past it',
    note: 'provideTextFieldDefaults carries the decisions an application takes once; exportAs reaches the instance, and inputElement is the native element with focus, select and setSelectionRange already on it.',
    snippet: defineSnippet({
      id: 'text-field-angular-composition',
      language: 'angular',
      label: 'A token, a reactive form, and the element itself',
      source: `<!-- ControlValueAccessor: the control belongs in a form as it stands. -->
<div slTextField clearable>
  <input slTextFieldInput [formControl]="email" type="email" />
</div>

<!-- exportAs, for the element the template has to reach. -->
<div slTextField>
  <input slTextFieldInput #campo="slTextFieldInput" />
  <span slTextFieldEnd>
    <button slTextFieldAction (click)="campo.inputElement.select()">Selecionar</button>
  </span>
</div>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does, and what it deliberately does not',
    note: 'Tab reaches the value, then each button in turn. Nothing is bound to Escape: some user agents clear a search input on it, and a control that swallowed the key inside a dialog would be one a keyboard user cannot leave.',
    snippet: defineSnippet({
      id: 'text-field-angular-keyboard',
      language: 'angular',
      label: 'No key is bound, and the buttons are real buttons',
      source: `<form (ngSubmit)="buscar()">
  <div slTextField clearable>
    <input slTextFieldInput type="search" name="q" [(ngModel)]="q" />
  </div>
</form>`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: '(valueChange)',
    payload: 'ChangeRequest<string>',
    when: 'Before the value moves, on slTextFieldInput. The request carries the new value, the value it replaces, the reason — "keyboard" for an edit made in the control, "clear" for the clear button — the originating event, and cancel(), which refuses the move before anything commits.',
  },
  {
    name: '(revealedChange)',
    payload: 'ChangeRequest<boolean>',
    when: 'Before the password toggle moves, with reason "pointer" or "keyboard" recovered from the click. A form that hides the password again on blur owns this bit.',
  },
  {
    name: '(valueCopy)',
    payload: 'TextFieldCopyDetail — { copied, reason, source, value }',
    when: 'On slTextField, once the copy button has asked the clipboard. copied is false when the clipboard refused; reason is "pointer" or "keyboard".',
  },
  {
    name: 'ControlValueAccessor',
    payload: 'the form’s own value and touched state',
    when: 'Whenever the value moves and the request was not cancelled, and on blur for touched. It is the two-way binding the ecosystem expects, and the reason there is no [(value)]: a two-way binding has one slot and can carry neither a reason nor cancel().',
  },
];

export const ANGULAR_TEXT_FIELD_DOCS = {
  textField: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'value',
        'string',
        '—',
        'slTextFieldInput',
        'Present means the consumer owns the value, and it is written onto the element the way a form’s value is. Absent, the element owns it',
      ],
      [
        'defaultValue',
        'string',
        '—',
        'slTextFieldInput',
        'What the control starts from when nobody else writes one. Read after the inputs are bound, which is the only moment it exists',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'slTextField, provideTextFieldDefaults',
        'The type step, read from the field first when there is one, then from the token. Height, padding, type and glyph all come from the control scales the theme restates per density',
      ],
      [
        'variant',
        "'outline' | 'subtle' | 'plain'",
        'outline',
        'slTextField, provideTextFieldDefaults',
        'How much frame the control shows. plain paints no border at rest and keeps the same box, which is what a dense table cell needs',
      ],
      [
        'mono',
        'boolean',
        'false',
        'slTextField, provideTextFieldDefaults',
        'Sets the value in the monospaced family with tabular figures, for identifiers, hashes and keys',
      ],
      [
        'clearable',
        'boolean',
        'false',
        'slTextField',
        'Draws a button that empties the value with reason "clear" and returns focus to the control. It is withdrawn when the value is empty, disabled or read-only',
      ],
      [
        'revealable',
        'boolean',
        'false',
        'slTextField',
        'Draws a toggle that turns a password into characters. It appears only on type="password" and is withdrawn when the control is disabled',
      ],
      [
        'revealed',
        'boolean',
        '—',
        'slTextFieldInput',
        'Present means the consumer owns whether the password is showing. defaultRevealed is the uncontrolled half',
      ],
      [
        'showCount',
        'boolean',
        'false',
        'slTextFieldInput',
        'Publishes the length of the value to the field around it, which draws the count in the spare column of its label row',
      ],
      [
        'countMax',
        'number',
        'maxlength',
        'slTextFieldInput',
        'The limit the count is measured against. Set without maxlength it is a soft limit: the value may pass it and the counter turns before validation runs',
      ],
      [
        'start',
        'slTextFieldStart',
        '—',
        'any element',
        'An adornment before the value in the reading direction, on the consumer’s own element so it keeps its own semantics',
      ],
      [
        'end',
        'slTextFieldEnd',
        '—',
        'any element',
        'An adornment after the value in the reading direction',
      ],
      [
        'disabled',
        'boolean',
        'from the field, or false',
        'slTextFieldInput',
        'Unstated rather than false, so the control defers to the field around it and to a disabled reactive form control. Stated, it wins, and it is the native attribute',
      ],
      [
        'readOnly',
        'boolean',
        'from the field, or false',
        'slTextFieldInput',
        'Unstated rather than false. The native readonly, which stays focusable, selectable and submitted. A static readonly the consumer wrote is read before the binding computes',
      ],
      [
        'invalid',
        'boolean',
        'from the field, or false',
        'slTextFieldInput',
        'Unstated rather than false. Writes aria-invalid on the control and data-invalid on the frame',
      ],
      [
        'required',
        'boolean',
        '—',
        'the input element',
        'The element’s own attribute, never written by the family. A field marks necessity with aria-required instead, because the native attribute engages browser constraint validation',
      ],
      [
        'type',
        "'text' | 'search' | 'email' | 'url' | 'tel' | 'password'",
        'text',
        'the input element',
        'The element’s own type, read before the host binding computes so the reveal toggle can swap it without losing what the consumer wrote',
      ],
      [
        'copyable',
        'boolean',
        'false',
        'slTextField',
        'Draws a button that writes the value to the clipboard, shows a check for two seconds and announces the outcome. Hidden while the value is empty or disabled',
      ],
      [
        'loading',
        'boolean',
        'false',
        'slTextField',
        'Draws the shared ring before the buttons and marks the input aria-busy; the value stays editable. Bound at all, false included, the ring keeps its place so it can leave with motion',
      ],
      [
        'copyLabel / copiedLabel / copyFailedLabel',
        'string',
        'Copy / Copied / Copy failed',
        'slTextField, provideTextFieldDefaults',
        'The copy button’s name, and the two announcements of its outcome',
      ],
      [
        'capsLockLabel',
        'string',
        'Caps Lock is on',
        'slTextField, provideTextFieldDefaults',
        'What a password announces once as Caps Lock turns on while it has focus',
      ],
      [
        'clearLabel / revealLabel',
        'string',
        'Clear / Show password',
        'slTextField, provideTextFieldDefaults',
        'What the two buttons announce. The reveal label does not change with its state — aria-pressed carries that — and both are set once for an application',
      ],
    ]),
    composition: apiRows([
      [
        'button[slTextFieldAction]',
        'directive',
        'type="button"',
        'inside slTextFieldStart or slTextFieldEnd',
        'A button of the consumer’s inside the frame. slMenuTriggerFor, slTooltipTrigger or a popover trigger sit on the same element; the part is written back after the first render, because slMenuTriggerFor binds data-part to null. exportAs slTextFieldAction',
      ],
      [
        'the directives themselves',
        'slTextField, slTextFieldInput, slTextFieldStart, slTextFieldEnd',
        '—',
        'the consumer’s own elements',
        'Every part but the two buttons is a directive on an element the consumer wrote, so nothing loses its own semantics, its own attributes or its own listeners',
      ],
      [
        'exportAs',
        "'slTextField' / 'slTextFieldInput'",
        '—',
        'a template',
        'Reaches the instance. inputElement on the input is the native element, which already has focus(), select() and setSelectionRange()',
      ],
      [
        'provideTextFieldDefaults()',
        '{ size, variant, mono, clearLabel, revealLabel, copyLabel, copiedLabel, copyFailedLabel, capsLockLabel }',
        '—',
        'an injector',
        'The decisions an application takes once. size is the one a field outranks, so a control inside a field takes the field’s step',
      ],
      [
        'ControlValueAccessor',
        'formControl, formControlName, ngModel',
        '—',
        'slTextFieldInput',
        'The control belongs in a reactive form and a template form as it stands. There is no Validator: the family owns no validity, and form does',
      ],
    ]),
    accessibility: [
      'There is no WAI-ARIA APG pattern for a text field: the APG lists thirty patterns and none of them is a single-line text input, so the sources are the HTML specification for the element, the APG’s Providing Accessible Names and Descriptions practice (w3.org/WAI/ARIA/apg/practices/names-and-descriptions/) for the name, and the ARIA textbox role for what may sit inside it.',
      'The frame carries no role. WAI-ARIA requires the children of a textbox to be non-interactive and presentational, so the clear and reveal buttons are the control’s siblings inside a box that announces nothing, rather than children of the control.',
      'The control takes its name from the field’s label, through for pointing at the identifier the field derived. The APG’s naming practice records that the implicit form — wrapping the control in the label — is one some combinations of assistive technology and browser fail to treat as a name at all.',
      'aria-required, never the native required. A host binding beats a static attribute in Angular, so every value the consumer wrote — id, aria-describedby, aria-invalid, aria-required, readonly, type — is read before the binding computes and is never written over.',
      'Both buttons are real buttons with names an application translates once, and both are at least 24 CSS pixels wide — WCAG 2.2 SC 2.5.8 — at every step and every density. The reveal toggle keeps one label and carries its state in aria-pressed, which is the APG’s rule for a toggle.',
      'The copy button announces its outcome through the shared live announcer — Copied, or Copy failed — because the check that replaces the mark is seen and not heard. The Caps Lock mark is hidden from assistive technology and its label is announced once as it turns on, while the password has focus.',
      'loading writes aria-busy on the input and leaves it enabled: an asynchronous check of a user name must not take the keyboard away. The ring is hidden from assistive technology.',
      'A menu inside the frame is the APG Menu Button pattern (w3.org/WAI/ARIA/apg/patterns/menu-button/), supplied by slMenuTriggerFor on the action: aria-haspopup, aria-expanded, and Enter, Space and ArrowDown to open.',
      'Nothing is bound to Escape. Some user agents clear a search input on the key; a control that swallowed it inside a dialog would be a control a keyboard user cannot leave, and WCAG 2.1.4 exists for the class of defect single-key shortcuts produce.',
    ],
    snippets: [
      defineSnippet({
        id: 'text-field-angular-anatomy',
        language: 'angular',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div data-ui="text-field" data-part="root" data-size="md" data-variant="outline">
  <span data-part="start">R$</span>
  <input data-part="input" id="valor-control" aria-describedby="valor-description" />
  <button data-part="clear" type="button" aria-label="Clear">
    <span data-ui="icon" data-part="root" aria-hidden="true"
      ><svg data-part="glyph" data-glyph="x" aria-hidden="true"></svg
    ></span>
  </button>
  <span data-part="end">BRL</span>
</div>`,
      }),
      defineSnippet({
        id: 'text-field-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `[data-ui='text-field'] {
  --slotted-text-field-border-color: var(--slotted-tone-secondary-border);
  --slotted-text-field-hover-border-color: var(--slotted-tone-accent-solid);
  --slotted-text-field-radius: var(--slotted-radius-md);
  --slotted-text-field-autofill-background: var(--slotted-tone-success-surface);
}`,
      }),
    ],
  },
} as const;
