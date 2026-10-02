import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import numberFieldTokens from '@slotted/styles/number-field/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const ANGULAR_NUMBER_FIELD_TOKENS = numberFieldTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Number Field decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  provideNumberFieldDefaults,\n  SlNumberField,\n  SlNumberFieldEnd,\n  SlNumberFieldInput,\n  SlNumberFieldScrub,\n  SlNumberFieldStart,\n} from '@slotted/angular/number-field';",
  selector: '[slNumberField]',
  exportAs: 'slNumberField',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'the element carrying slNumberField',
    required: true,
    purpose:
      'The frame. Carries data-ui="number-field", the three axes, and data-disabled, data-invalid and data-readonly. It has no role: a spinbutton may hold only non-interactive children, so the two steppers are the control’s siblings and the box around them announces nothing.',
  },
  {
    part: 'input',
    element: 'input[slNumberFieldInput], as text with role="spinbutton"',
    required: true,
    purpose:
      'The control. Holds the formatted text, the identifier, aria-valuenow, aria-valuemin, aria-valuemax and aria-valuetext, and it is the ControlValueAccessor, so the control belongs in a reactive form as it stands. It is type="text" because type="number" empties itself whenever the text is not a valid floating-point number.',
  },
  {
    part: 'start',
    element: 'any element carrying slNumberFieldStart',
    required: false,
    purpose:
      'An adornment before the value in the reading direction, and a sibling of the number rather than part of it. A symbol that belongs inside the value is format’s job instead.',
  },
  {
    part: 'end',
    element: 'any element carrying slNumberFieldEnd',
    required: false,
    purpose: 'An adornment after the value in the reading direction: a unit, a currency code.',
  },
  {
    part: 'scrub',
    element: 'any element carrying slNumberFieldScrub, inside an adornment',
    required: false,
    purpose:
      'A mark that moves the number when it is dragged sideways: one step per sensitivity pixels towards the inline end, the large step with Shift, the small one with Alt. It carries data-scrubbing while dragged, as the frame does, and is hidden from assistive technology because the arrow keys on the input are the same movement.',
  },
  {
    part: 'stepper',
    element: 'span, rendered by the frame',
    required: false,
    purpose:
      'The column the two buttons share under stepper="stacked", inset one step from the frame with no rule of its own; each half gives that inset back to the pointer. It is not rendered at all under split, where the buttons are direct children of the frame.',
  },
  {
    part: 'decrement',
    element: 'button[type=button][tabindex=-1], rendered by the frame',
    required: false,
    purpose:
      'Steps down by step, by largeStep with Shift and by smallStep with Alt. Held, it repeats. It is disabled at min, and out of the tab order because the arrow keys reach the same behaviour from the control.',
  },
  {
    part: 'increment',
    element: 'button[type=button][tabindex=-1], rendered by the frame',
    required: false,
    purpose:
      'Steps up by the same three amounts, disabled at max. Both buttons carry a translatable name and aria-controls pointing at the value they move.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One control with every axis on it, driven by the controls below the canvas. Type a number, then hold the increment button: it steps once, waits, and then repeats.',
    snippet: defineSnippet({
      id: 'number-field-angular-playground',
      language: 'angular',
      label: 'A quantity, its label and its help',
      source: `<div slField>
  <label slFieldLabel>Quantidade</label>
  <div slNumberField>
    <input slNumberFieldInput defaultValue="3" min="1" max="99" />
  </div>
  <span slFieldDescription>Máximo de 99 unidades por pedido.</span>
</div>`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the control sits at',
    note: 'Three steps, and inside a field the control takes the field’s rather than its own: a small field holding a medium control is a field and a control disagreeing about one row.',
    snippet: defineSnippet({
      id: 'number-field-angular-sizes',
      language: 'angular',
      label: 'Three steps, all answering density',
      source: `<div slNumberField size="sm"><input slNumberFieldInput defaultValue="8" /></div>
<div slNumberField size="md"><input slNumberFieldInput defaultValue="12" /></div>
<div slNumberField size="lg"><input slNumberFieldInput defaultValue="24" /></div>

<!-- Inside a field the field decides, and the control follows. -->
<div slField size="sm">
  <div slNumberField><input slNumberFieldInput defaultValue="4" /></div>
</div>`,
    }),
  },
  {
    id: 'variants',
    title: 'How much frame the control shows',
    note: 'outline takes the ground it is placed on, subtle sinks into the page, and plain shows nothing until the pointer or the caret arrives — which is what a dense table cell of amounts needs.',
    snippet: defineSnippet({
      id: 'number-field-angular-variants',
      language: 'angular',
      label: 'Three frames, one box',
      source: `<div slNumberField variant="outline"><input slNumberFieldInput defaultValue="1480" /></div>
<div slNumberField variant="subtle"><input slNumberFieldInput defaultValue="1480" /></div>

<!-- A cell that is only a control while it is being used. -->
<div slNumberField variant="plain" stepper="none">
  <input slNumberFieldInput defaultValue="1480" />
</div>`,
    }),
  },
  {
    id: 'stepper',
    title: 'Where the two buttons sit, and whether they sit at all',
    note: 'stacked is one column at the inline end; split puts decrement and increment at either end of the frame with the value centred between them, which is the only arrangement whose targets clear 24 pixels in both axes.',
    snippet: defineSnippet({
      id: 'number-field-angular-stepper',
      language: 'angular',
      label: 'A form field, a quantity picker, and a table cell',
      source: `<div slNumberField stepper="stacked"><input slNumberFieldInput defaultValue="12" /></div>

<!-- The arrangement a thumb can hit, and the one a quantity wants. -->
<div slNumberField stepper="split">
  <input slNumberFieldInput defaultValue="3" min="1" max="99" />
</div>

<!-- Typed and never spun, which is what a dense table asks for. -->
<div slNumberField stepper="none"><input slNumberFieldInput defaultValue="1480" /></div>`,
    }),
  },
  {
    id: 'range',
    title: 'The bounds, the step, and what happens at the edge',
    note: 'The stepper that would leave the range is disabled rather than silently inert. Type 400 into the first control and tab away: clamp="blur" brings it back, while clamp="none" leaves it where you put it and says so.',
    snippet: defineSnippet({
      id: 'number-field-angular-range',
      language: 'angular',
      label: 'Bounds, steps and the three clamp policies',
      source: `<div slNumberField>
  <input slNumberFieldInput defaultValue="5" min="0" max="10" step="1" />
</div>

<!-- Shift and the page keys move by largeStep, Alt by smallStep. -->
<div slNumberField>
  <input slNumberFieldInput defaultValue="0" step="5" largeStep="25" smallStep="0.5" />
</div>

<!-- strict refuses the keystroke; none keeps the value and reports it. -->
<div slNumberField><input slNumberFieldInput min="0" max="100" clamp="strict" /></div>
<div slNumberField><input slNumberFieldInput min="0" max="100" clamp="none" /></div>`,
    }),
  },
  {
    id: 'format',
    title: 'Currency, percent and unit are formattings, not types',
    note: 'One numeric value, written by Intl.NumberFormat. The symbol inside the value comes from format and is part of what a reader copies; a symbol beside the value is an adornment instead, and the two sit side by side below.',
    snippet: defineSnippet({
      id: 'number-field-angular-format',
      language: 'angular',
      label: 'The same number, written three ways',
      source: `<div slNumberField>
  <input slNumberFieldInput defaultValue="1480" [format]="{ style: 'currency', currency: 'BRL' }" />
</div>
<div slNumberField>
  <input slNumberFieldInput defaultValue="0.125" [format]="{ style: 'percent' }" />
</div>

<!-- Precision is maximumFractionDigits, not an input of its own. -->
<div slNumberField>
  <input slNumberFieldInput defaultValue="1.5" [format]="{ maximumFractionDigits: 0 }" />
</div>`,
    }),
  },
  {
    id: 'formatOn',
    title: 'When the grouping appears',
    note: 'The two amounts below are the same under both settings; the axis decides only what the field shows between two keystrokes. The number itself moves on every keystroke that parses either way.',
    snippet: defineSnippet({
      id: 'number-field-angular-format-on',
      language: 'angular',
      label: 'Regrouped as it is typed, or held until the commit',
      source: `<!-- The default. The caret stays on the character it was on, because it is
     counted in the reader's own characters rather than in string indices. -->
<div slNumberField><input slNumberFieldInput locale="pt-BR" /></div>

<!-- The reader's own text until blur, Enter, a stepper press or a key step.
     For an amount that is pasted and audited rather than typed. -->
<div slNumberField>
  <input slNumberFieldInput locale="pt-BR" formatOn="commit" />
</div>

<!-- Rounding and padding belong to the commit under both: 1,50 keeps its
     nought while it is being typed, and 1, keeps its separator. -->`,
    }),
  },
  {
    id: 'locale',
    title: 'The separator, the grouping and the numerals',
    note: 'Paste “R$ 1.480,00” into the Brazilian control and “١٬٤٨٠” into the Arabic one: both parse, because the parser is built from the same Intl parts the formatter writes with.',
    snippet: defineSnippet({
      id: 'number-field-angular-locale',
      language: 'ts',
      label: 'One number, three locales, one application decision',
      source: `// Per control, when one amount really is written differently.
// <input slNumberFieldInput locale="pt-BR" defaultValue="1480.5" />

// Set once for the application rather than per amount.
bootstrapApplication(App, {
  providers: [provideSlotted({ locale: 'pt-BR' })],
});`,
    }),
  },
  {
    id: 'adornments',
    title: 'What sits beside the number',
    note: 'start and end name the reading direction rather than a side, and neither is ever squeezed: the value gives up width first. Switch the toolbar to rtl and the mark stays before the amount.',
    snippet: defineSnippet({
      id: 'number-field-angular-adornments',
      language: 'angular',
      label: 'A mark before the value and a unit after it',
      source: `<div slNumberField>
  <span slNumberFieldStart>R$</span>
  <input slNumberFieldInput defaultValue="1480" locale="pt-BR" />
  <span slNumberFieldEnd>BRL</span>
</div>

<!-- A directive on the consumer's own element, so an icon keeps its own
     semantics and its own attributes. -->
<div slNumberField>
  <input slNumberFieldInput defaultValue="240" min="0" />
  <span slNumberFieldEnd>un</span>
</div>`,
    }),
  },
  {
    id: 'scrub',
    title: 'Drag the mark to move the number',
    note: 'The design tools’ gesture. Press the mark and drag sideways: two pixels per step, Shift for the large step, Alt for the small one. A right-to-left document steps up towards the left, the inline end.',
    snippet: defineSnippet({
      id: 'number-field-angular-scrub',
      language: 'angular',
      label: 'A width and an angle, each with its mark',
      source: `<div slNumberField>
  <span slNumberFieldStart><span slNumberFieldScrub>L</span></span>
  <input slNumberFieldInput aria-label="Largura" defaultValue="320" min="0" />
  <span slNumberFieldEnd>px</span>
</div>

<div slNumberField>
  <span slNumberFieldStart><span slNumberFieldScrub [sensitivity]="4">A</span></span>
  <input slNumberFieldInput aria-label="Ângulo" defaultValue="45" min="0" max="360" />
  <span slNumberFieldEnd>°</span>
</div>`,
    }),
  },
  {
    id: 'states',
    title: 'The states the frame paints',
    note: 'Read-only keeps full-strength ink and softens its edge, because the value is real and still submitted; disabled is muted to a measured colour rather than faded, and both withdraw the steppers by disabling them rather than removing them.',
    snippet: defineSnippet({
      id: 'number-field-angular-states',
      language: 'angular',
      label: 'Every state unset by default, and native where the word means native',
      source: `<!-- Unstated rather than false, so the control defers to its field. -->
<div slNumberField><input slNumberFieldInput defaultValue="120" invalid /></div>
<div slNumberField><input slNumberFieldInput defaultValue="12" readOnly /></div>
<div slNumberField><input slNumberFieldInput defaultValue="12" disabled /></div>

<!-- A form that disables the control disables it here too, through
     setDisabledState on the ControlValueAccessor. -->
<div slNumberField><input slNumberFieldInput [formControl]="quantity" /></div>`,
    }),
  },
  {
    id: 'content',
    title: 'Numbers the family did not choose',
    note: 'A value longer than the control ellipsises rather than clipping mid-glyph; a negative keeps its sign in front of the digits in both directions; and at 240 pixels the value surrenders width while the steppers keep their target size.',
    snippet: defineSnippet({
      id: 'number-field-angular-content',
      language: 'angular',
      label: 'Long, negative and right-to-left',
      source: `<div slNumberField>
  <input slNumberFieldInput defaultValue="1480320559774.25" locale="pt-BR" />
</div>

<!-- The digits are tabular, so nothing shifts as they are typed over,
     and the minus stays in front of the amount in an Arabic document. -->
<div slNumberField>
  <span slNumberFieldStart>R$</span>
  <input slNumberFieldInput defaultValue="-1480" locale="pt-BR" />
</div>`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, reaching past it, and putting it in a form',
    note: 'ControlValueAccessor is the two-way binding the ecosystem expects; exportAs hands the template the directive, which carries increment(), decrement() and the native element; name submits the raw number through a hidden input.',
    snippet: defineSnippet({
      id: 'number-field-angular-composition',
      language: 'angular',
      label: 'A reactive form, an instance, and a hidden input',
      source: `<div slNumberField>
  <input slNumberFieldInput [formControl]="quantity" min="1" max="99" />
</div>

<div slNumberField>
  <input slNumberFieldInput #campo="slNumberFieldInput" defaultValue="3" />
</div>
<button type="button" (click)="campo.increment()">Mais um</button>

<!-- The hidden input carries 1480, never "R$ 1.480,00". -->
<div slNumberField>
  <input
    slNumberFieldInput
    name="amount"
    defaultValue="1480"
    [format]="{ style: 'currency', currency: 'BRL' }"
  />
</div>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does, and what it deliberately does not',
    note: 'Arrows step, Shift and the page keys move by the large amount, Alt by the small one, Home and End reach the bounds. Tab never lands on a stepper: twenty amounts in a form would be forty extra stops.',
    snippet: defineSnippet({
      id: 'number-field-angular-keyboard',
      language: 'angular',
      label: 'Every key the pattern lists, and the wheel that is not bound',
      source: `<!-- ArrowUp/ArrowDown: step. Shift or PageUp/PageDown: largeStep.
     Alt: smallStep. Home: min. End: max. Enter: commits, then submits. -->
<div slNumberField>
  <input
    slNumberFieldInput
    defaultValue="50"
    min="0"
    max="100"
    step="5"
    largeStep="25"
    smallStep="0.5"
  />
</div>

<!-- The wheel is not bound unless it is asked for. -->
<div slNumberField><input slNumberFieldInput defaultValue="50" wheel /></div>`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: '(valueChange)',
    payload: 'ChangeRequest<number | null>',
    when: 'Before the number moves. The request carries the new value, the value it replaces, the reason — "keyboard" for typing, an arrow, a page key, Home or End; "pointer" for a stepper press or a wheel turn; "blur" for the commit that formats and clamps; "programmatic" for increment() — the originating event, and cancel(), which refuses the move before anything commits. There is no [(value)]: a two-way binding has one slot and can carry none of those.',
  },
  {
    name: 'ControlValueAccessor',
    payload: 'writeValue, registerOnChange, registerOnTouched, setDisabledState',
    when: 'Whenever a reactive or template form reads or writes the control. The form receives the number, never the formatted string, and a disabled form control disables the element and both steppers.',
  },
  {
    name: 'the element’s own events',
    payload: '(input), (keydown), (blur), (focus)',
    when: 'Whenever the element fires them. A consumer’s listener runs alongside the directive’s rather than instead of it, and calling preventDefault() on a key stops the directive from acting on it.',
  },
];

export const ANGULAR_NUMBER_FIELD_DOCS = {
  numberField: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'value',
        'number | null',
        '—',
        'input[slNumberFieldInput]',
        'Present means the consumer owns the number, for the life of the component. null is empty, and empty is not nought: a required amount left blank and an amount of nought are different facts',
      ],
      [
        'defaultValue',
        'number | null',
        '—',
        'input[slNumberFieldInput]',
        'What an uncontrolled control starts from, read once in ngOnInit because Angular binds inputs after it creates directives',
      ],
      [
        'min',
        'number',
        '—',
        'input[slNumberFieldInput]',
        'The smallest value the control holds. It disables the decrement button at the bound, gives Home somewhere to go, and is where the step grid starts when snapToStep is set',
      ],
      [
        'max',
        'number',
        '—',
        'input[slNumberFieldInput]',
        'The largest value the control holds, and where End goes',
      ],
      [
        'step',
        'number',
        '1',
        'input[slNumberFieldInput]',
        'What the arrows and the two buttons move by',
      ],
      [
        'largeStep',
        'number',
        'step × 10',
        'input[slNumberFieldInput]',
        'What Shift and the page keys move by, so a range of ten thousand is crossable without holding a key',
      ],
      ['smallStep', 'number', 'step ÷ 10', 'input[slNumberFieldInput]', 'What Alt moves by'],
      [
        'stepFrom',
        'number',
        'min, or 0',
        'input[slNumberFieldInput]',
        'Where an empty control starts stepping from. Pressing increment on a blank amount has to produce a number, and this is the number it produces',
      ],
      [
        'snapToStep',
        'boolean',
        'false',
        'input[slNumberFieldInput]',
        'Steps to the multiples of step measured from min, so with min 2 and step 3 the valid values are 2, 5, 8, 11',
      ],
      [
        'clamp',
        "'blur' | 'strict' | 'none'",
        'blur',
        'input[slNumberFieldInput], provideNumberFieldDefaults',
        'Where a value outside the range goes and when. blur returns it at the commit, strict refuses the keystroke, none keeps it and reports aria-invalid',
      ],
      [
        'format',
        'Intl.NumberFormatOptions',
        '—',
        'input[slNumberFieldInput]',
        'How the value is written and read back. Currency, percent and unit are formattings of one numeric type, and precision is maximumFractionDigits rather than an input of its own',
      ],
      [
        'formatOn',
        "'change' | 'commit'",
        'change',
        'input[slNumberFieldInput], provideNumberFieldDefaults',
        'When the text takes that shape. change regroups on every keystroke, so a long number is scannable while it is being typed; commit holds the reader’s own text until blur, Enter or a step. Neither decides when the number moves — it moves on every keystroke that parses',
      ],
      [
        'locale',
        'string',
        'the language in force',
        'input[slNumberFieldInput]',
        'BCP 47. It decides the decimal separator, the grouping and the numbering system, on the way out and on the way back in',
      ],
      [
        'stepper',
        "'stacked' | 'split' | 'none'",
        'stacked',
        '[slNumberField], provideNumberFieldDefaults',
        'Where the two buttons sit. split is the quantity picker’s arrangement and the only one whose targets clear 24 CSS pixels in both axes',
      ],
      [
        'wheel',
        'boolean',
        'false',
        'input[slNumberFieldInput]',
        'Lets the wheel move the value while the control has focus and the pointer is over it. Off by default: a reader scrolling a form must not change an amount by passing over it',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        '[slNumberField], provideNumberFieldDefaults',
        'The type step, read from the field first when there is one, then from the injection token. Height, padding, type and glyph all come from the control scales the theme restates per density',
      ],
      [
        'variant',
        "'outline' | 'subtle' | 'plain'",
        'outline',
        '[slNumberField], provideNumberFieldDefaults',
        'How much frame the control shows. plain paints no border at rest and keeps the same box, which is what a dense table cell needs',
      ],
      [
        'start',
        'slNumberFieldStart',
        '—',
        'any projected element',
        'An adornment before the value in the reading direction. It is a sibling of the number, never selected, copied or parsed',
      ],
      [
        'end',
        'slNumberFieldEnd',
        '—',
        'any projected element',
        'An adornment after the value in the reading direction',
      ],
      [
        'sensitivity',
        'number',
        '2',
        'slNumberFieldScrub',
        'Pixels of horizontal travel per step. A wide range wants fewer pixels per step; a fine one, more',
      ],
      [
        'disabled',
        'boolean',
        'from the field, or false',
        'input[slNumberFieldInput]',
        'Unstated rather than false, so the control defers to the field around it. Stated, it wins, and it is the native attribute: out of the tab order and out of submission. A disabled form control sets it too',
      ],
      [
        'readOnly',
        'boolean',
        'from the field, or false',
        'input[slNumberFieldInput]',
        'Unstated rather than false. The native readonly, which stays focusable, selectable and submitted, and which disables both steppers',
      ],
      [
        'invalid',
        'boolean',
        'from the field, or false',
        'input[slNumberFieldInput]',
        'Unstated rather than false. Writes aria-invalid on the control and data-invalid on the frame',
      ],
      [
        'required',
        'boolean',
        '—',
        'input[slNumberFieldInput]',
        'The element’s own attribute, written by the consumer and never by the family. A field marks necessity with aria-required instead, because the native attribute engages browser constraint validation',
      ],
      [
        'name / form',
        'string',
        '—',
        'input[slNumberFieldInput]',
        'Read as static attributes, removed from the visible control and given to a hidden input beside it that carries the raw number. Submitting "R$ 1.480,00" to a server expecting 1480 is the defect this avoids',
      ],
      [
        'messages',
        'Partial<NumberFieldMessages>',
        '—',
        '[slNumberField]',
        'Words laid over the language in force, key by key: increment and decrement are what the two buttons announce',
      ],
    ]),
    composition: apiRows([
      [
        'exportAs',
        "'slNumberField' / 'slNumberFieldInput'",
        '—',
        'both directives',
        'Hands the template the instance. The control’s carries inputElement — which already has focus(), select() and setSelectionRange() — plus increment() and decrement(), the two actions a consumer cannot express by passing a value',
      ],
      [
        'ControlValueAccessor',
        'NG_VALUE_ACCESSOR',
        '—',
        'input[slNumberFieldInput]',
        'The control belongs in a reactive form as it stands, and the form receives the number rather than the formatted string. There is no Validator: min, max and step are reported, and when an error is shown is the form’s policy',
      ],
      [
        'ng-content',
        '[slNumberFieldStart], [slNumberFieldEnd], the control',
        '—',
        '[slNumberField]',
        'Three named slots on the consumer’s own elements, so a span, an icon or a kbd all work and none loses its own semantics. The frame itself is a directive on the consumer’s box',
      ],
      [
        'provideNumberFieldDefaults',
        '{ size, variant, stepper, formatOn, clamp }',
        '—',
        'an injector',
        'The five decisions an application takes once. The locale comes from provideSlotted, for the whole application: a form where one field reads 1.234 as a thousand and another as one point two three four is a form that loses money',
      ],
      [
        'HostAttributeToken',
        'id, name, form, inputmode, aria-describedby, aria-invalid, aria-required, readonly',
        '—',
        'input[slNumberFieldInput]',
        'Each read before the host binding computes, so a static attribute the consumer wrote is never written over',
      ],
    ]),
    accessibility: [
      'The pattern is the WAI-ARIA APG’s Spinbutton (w3.org/WAI/ARIA/apg/patterns/spinbutton/), taken whole: role="spinbutton" on the focusable element with aria-valuenow, aria-valuemin, aria-valuemax and aria-valuetext, Up and Down stepping, Home and End reaching the bounds, and Page Up and Page Down as the larger step the pattern lists as optional.',
      'aria-valuetext carries the formatted string, because aria-valuenow alone announces 1480 for a control showing R$ 1.480,00. When the control is empty neither property is set: no value is not the value nought.',
      'The frame carries no role. WAI-ARIA requires the children of a spinbutton to be non-interactive and presentational, so the two steppers are the control’s siblings inside a box that announces nothing, rather than children of the control.',
      'The steppers are out of the tab order — the APG’s “the text field is usually the only focusable component” — and stay in the accessibility tree with translatable names and aria-controls pointing at the value. A stepper at its bound is disabled rather than silently inert, so its name still announces and its appearance says why nothing happens.',
      'aria-required, never the native required. The native attribute engages browser constraint validation and changes submit behaviour, which the library must not impose as a side effect of describing a field. disabled and readonly are native, because that is what those two words mean.',
      'The element is type="text" with inputmode derived from the inputs rather than from the user agent: numeric for a positive integer, decimal when the format admits a fraction, and text when a negative is possible, because neither numeric keypad offers a minus sign on every platform.',
      'The wheel is not bound unless a consumer asks for it, and nothing is bound to Escape. MDN’s own note on type="number" names accidental increment as the reason the platform’s spinner is worth avoiding.',
    ],
    snippets: [
      defineSnippet({
        id: 'number-field-angular-anatomy',
        language: 'angular',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div data-ui="number-field" data-part="root" data-size="md" data-stepper="stacked">
  <span data-part="start">R$</span>
  <input
    data-part="input"
    type="text"
    role="spinbutton"
    id="valor-control"
    aria-valuenow="1480"
    aria-valuetext="R$ 1.480,00"
    aria-valuemin="0"
  />
  <span data-part="end">BRL</span>
  <span data-part="stepper">
    <button data-part="increment" type="button" tabindex="-1" aria-label="Increase">
      <span data-ui="icon" data-part="root" aria-hidden="true"
        ><svg data-part="glyph" data-glyph="chevron-down" aria-hidden="true"></svg
      ></span>
    </button>
    <button data-part="decrement" type="button" tabindex="-1" aria-label="Decrease">
      <span data-ui="icon" data-part="root" aria-hidden="true"
        ><svg data-part="glyph" data-glyph="chevron-down" aria-hidden="true"></svg
      ></span>
    </button>
  </span>
  <input type="hidden" name="valor" value="1480" />
</div>`,
      }),
      defineSnippet({
        id: 'number-field-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `[data-ui='number-field'] {
  --slotted-number-field-border-color: var(--slotted-tone-secondary-border);
  --slotted-number-field-hover-border-color: var(--slotted-tone-accent-solid);
  --slotted-number-field-scrub-active-color: var(--slotted-tone-accent-text);
  --slotted-number-field-radius: var(--slotted-radius-md);
}`,
      }),
    ],
  },
} as const;
