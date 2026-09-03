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

export const REACT_NUMBER_FIELD_TOKENS = numberFieldTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Number Field decision',
}));

const imports: ReferenceImport = {
  source: "import { NumberField, NumberFieldDefaultsProvider } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, or the element render returns',
    required: true,
    purpose:
      'The frame. Carries data-ui="number-field", the three axes, and data-disabled, data-invalid and data-readonly. It has no role: a spinbutton may hold only non-interactive children, so the two steppers are the control’s siblings and the box around them announces nothing. className and style reach this element.',
  },
  {
    part: 'input',
    element: 'input[type=text][role=spinbutton]',
    required: true,
    purpose:
      'The control. Holds the formatted text, the identifier, aria-valuenow, aria-valuemin, aria-valuemax and aria-valuetext. It is type="text" because type="number" empties itself whenever the text is not a valid floating-point number, so no grouping separator and no currency affix survives it. ref reaches it.',
  },
  {
    part: 'start',
    element: 'span',
    required: false,
    purpose:
      'An adornment before the value in the reading direction, and a sibling of the number rather than part of it. A symbol that belongs inside the value is format’s job instead.',
  },
  {
    part: 'end',
    element: 'span',
    required: false,
    purpose: 'An adornment after the value in the reading direction: a unit, a currency code.',
  },
  {
    part: 'stepper',
    element: 'span',
    required: false,
    purpose:
      'The column the two buttons share under stepper="stacked", with a hairline between the halves and one against the value. It is not rendered at all under split, where the buttons are direct children of the frame.',
  },
  {
    part: 'decrement',
    element: 'button[type=button][tabindex=-1]',
    required: false,
    purpose:
      'Steps down by step, by largeStep with Shift and by smallStep with Alt. Held, it repeats. It is disabled at min, and out of the tab order because the arrow keys reach the same behaviour from the control.',
  },
  {
    part: 'increment',
    element: 'button[type=button][tabindex=-1]',
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
      id: 'number-field-react-playground',
      language: 'tsx',
      label: 'A quantity, its label and its help',
      source: `<Field>
  <FieldLabel>Quantidade</FieldLabel>
  <NumberField defaultValue={3} max={99} min={1} />
  <FieldDescription>Máximo de 99 unidades por pedido.</FieldDescription>
</Field>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the control sits at',
    note: 'Three steps, and inside a field the control takes the field’s rather than its own: a small field holding a medium control is a field and a control disagreeing about one row.',
    snippet: defineSnippet({
      id: 'number-field-react-sizes',
      language: 'tsx',
      label: 'Three steps, all answering density',
      source: `<NumberField defaultValue={8} size="sm" />;
<NumberField defaultValue={12} size="md" />;
<NumberField defaultValue={24} size="lg" />;

// Inside a field the field decides, and the control follows.
<Field size="sm">
  <NumberField defaultValue={4} />
</Field>;`,
    }),
  },
  {
    id: 'variants',
    title: 'How much frame the control shows',
    note: 'outline takes the ground it is placed on, subtle sinks into the page, and plain shows nothing until the pointer or the caret arrives — which is what a dense table cell of amounts needs.',
    snippet: defineSnippet({
      id: 'number-field-react-variants',
      language: 'tsx',
      label: 'Three frames, one box',
      source: `<NumberField defaultValue={1480} variant="outline" />;
<NumberField defaultValue={1480} variant="subtle" />;

// A cell that is only a control while it is being used. The box never
// changes, so the row does not reflow when the pointer crosses it.
<NumberField defaultValue={1480} stepper="none" variant="plain" />;`,
    }),
  },
  {
    id: 'stepper',
    title: 'Where the two buttons sit, and whether they sit at all',
    note: 'stacked is one column at the inline end; split puts decrement and increment at either end of the frame with the value centred between them, which is the only arrangement whose targets clear 24 pixels in both axes.',
    snippet: defineSnippet({
      id: 'number-field-react-stepper',
      language: 'tsx',
      label: 'A form field, a quantity picker, and a table cell',
      source: `<NumberField defaultValue={12} stepper="stacked" />;

// The arrangement a thumb can hit, and the one a quantity wants.
<NumberField defaultValue={3} max={99} min={1} stepper="split" />;

// Typed and never spun, which is what a dense table asks for.
<NumberField defaultValue={1480} stepper="none" />;`,
    }),
  },
  {
    id: 'range',
    title: 'The bounds, the step, and what happens at the edge',
    note: 'The stepper that would leave the range is disabled rather than silently inert. Type 400 into the first control and tab away: clamp="blur" brings it back, while clamp="none" leaves it where you put it and says so.',
    snippet: defineSnippet({
      id: 'number-field-react-range',
      language: 'tsx',
      label: 'Bounds, steps and the three clamp policies',
      source: `<NumberField defaultValue={5} max={10} min={0} step={1} />;

// Shift and the page keys move by largeStep, Alt by smallStep.
<NumberField defaultValue={0} largeStep={25} smallStep={0.5} step={5} />;

// strict refuses the keystroke; none keeps the value and reports it.
<NumberField clamp="strict" max={100} min={0} />;
<NumberField clamp="none" max={100} min={0} />;`,
    }),
  },
  {
    id: 'format',
    title: 'Currency, percent and unit are formattings, not types',
    note: 'One numeric value, written by Intl.NumberFormat. The symbol inside the value comes from format and is part of what a reader copies; a symbol beside the value is an adornment instead, and the two sit side by side below.',
    snippet: defineSnippet({
      id: 'number-field-react-format',
      language: 'tsx',
      label: 'The same number, written four ways',
      source: `<NumberField defaultValue={1480} format={{ currency: 'BRL', style: 'currency' }} />;
<NumberField defaultValue={0.125} format={{ style: 'percent' }} />;
<NumberField
  defaultValue={240}
  format={{ style: 'unit', unit: 'kilogram', unitDisplay: 'short' }}
/>;

// Precision is maximumFractionDigits, not a prop of its own.
<NumberField defaultValue={1.5} format={{ maximumFractionDigits: 0 }} />;`,
    }),
  },
  {
    id: 'formatOn',
    title: 'When the grouping appears',
    note: 'The two amounts below are the same under both settings; the axis decides only what the field shows between two keystrokes. The number itself moves on every keystroke that parses either way.',
    snippet: defineSnippet({
      id: 'number-field-react-format-on',
      language: 'tsx',
      label: 'Regrouped as it is typed, or held until the commit',
      source: `// The default. The caret stays on the character it was on, because it is
// counted in the reader's own characters rather than in string indices.
<NumberField locale="pt-BR" />;

// The reader's own text until blur, Enter, a stepper press or a key step.
// For an amount that is pasted and audited rather than typed.
<NumberField formatOn="commit" locale="pt-BR" />;

// Rounding and padding belong to the commit under both: 1,50 keeps its
// nought while it is being typed, and 1, keeps its separator.`,
    }),
  },
  {
    id: 'locale',
    title: 'The separator, the grouping and the numerals',
    note: 'Paste “R$ 1.480,00” into the Brazilian control and “١٬٤٨٠” into the Arabic one: both parse, because the parser is built from the same Intl parts the formatter writes with.',
    snippet: defineSnippet({
      id: 'number-field-react-locale',
      language: 'tsx',
      label: 'One number, three locales, one application decision',
      source: `<NumberField defaultValue={1480.5} locale="pt-BR" />; // 1.480,5
<NumberField defaultValue={1480.5} locale="en-US" />; // 1,480.5
<NumberField defaultValue={1480.5} locale="ar-EG" />; // ١٬٤٨٠٫٥

// Set once for the application rather than per amount.
<NumberFieldDefaultsProvider locale="pt-BR">
  <OrderForm />
</NumberFieldDefaultsProvider>;`,
    }),
  },
  {
    id: 'adornments',
    title: 'What sits beside the number',
    note: 'start and end name the reading direction rather than a side, and neither is ever squeezed: the value gives up width first. Switch the toolbar to rtl and the mark stays before the amount.',
    snippet: defineSnippet({
      id: 'number-field-react-adornments',
      language: 'tsx',
      label: 'A mark before the value and a unit after it',
      source: `<NumberField defaultValue={1480} end="BRL" start="R$" />;

// Anything renders: an icon, a kbd, a select.
<NumberField
  defaultValue={240}
  end="un"
  start={
    <Icon>
      <Package />
    </Icon>
  }
/>;`,
    }),
  },
  {
    id: 'states',
    title: 'The states the frame paints',
    note: 'Read-only keeps full-strength ink and softens its edge, because the value is real and still submitted; disabled is muted to a measured colour rather than faded, and both withdraw the steppers by disabling them rather than removing them.',
    snippet: defineSnippet({
      id: 'number-field-react-states',
      language: 'tsx',
      label: 'Every state unset by default, and native where the word means native',
      source: `// Unstated rather than false, so the control defers to its field.
<NumberField defaultValue={120} invalid />;
<NumberField defaultValue={12} readOnly />;
<NumberField defaultValue={12} disabled />;

// A control inside a disabled fieldset is painted too, because the
// stylesheet matches :disabled beside the attribute.`,
    }),
  },
  {
    id: 'content',
    title: 'Numbers the family did not choose',
    note: 'A value longer than the control ellipsises rather than clipping mid-glyph; a negative keeps its sign in front of the digits in both directions; and at 240 pixels the value surrenders width while the steppers keep their target size.',
    snippet: defineSnippet({
      id: 'number-field-react-content',
      language: 'tsx',
      label: 'Long, negative and right-to-left',
      source: `<NumberField defaultValue={1480320559774.25} locale="pt-BR" />;

// The digits are tabular, so nothing shifts as they are typed over,
// and the minus stays in front of the amount in an Arabic document.
<NumberField defaultValue={-1480} end="BRL" locale="pt-BR" start="R$" />;`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, reaching past it, and putting it in a form',
    note: 'The provider carries the seven decisions an application takes once; ref reaches the element and handle reaches the two actions a value cannot express; name submits the raw number through a hidden input rather than the formatted string.',
    snippet: defineSnippet({
      id: 'number-field-react-composition',
      language: 'tsx',
      label: 'A provider, a handle, and a form',
      source: `<NumberFieldDefaultsProvider locale="pt-BR" stepper="split">
  <NumberField defaultValue={3} />
</NumberFieldDefaultsProvider>;

const handle = useRef<NumberFieldHandle>(null);
<NumberField handle={handle} />;
<Button onClick={() => handle.current?.increment()}>Mais um</Button>;

// The hidden input carries 1480, never "R$ 1.480,00".
<NumberField format={{ currency: 'BRL', style: 'currency' }} name="amount" />;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does, and what it deliberately does not',
    note: 'Arrows step, Shift and the page keys move by the large amount, Alt by the small one, Home and End reach the bounds. Tab never lands on a stepper: twenty amounts in a form would be forty extra stops.',
    snippet: defineSnippet({
      id: 'number-field-react-keyboard',
      language: 'tsx',
      label: 'Every key the pattern lists, and the wheel that is not bound',
      source: `// ArrowUp/ArrowDown: step. Shift or PageUp/PageDown: largeStep.
// Alt: smallStep. Home: min. End: max. Enter: commits, then submits.
<NumberField defaultValue={0} largeStep={10} max={100} min={0} smallStep={0.1} />;

// The wheel is not bound unless it is asked for, and even then only
// while the control has focus.
<NumberField defaultValue={50} wheel />;`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onValueChange',
    payload: '(value: number | null, request: ChangeRequest<number | null>)',
    when: 'Before the number moves. The request carries the new value, the value it replaces, the reason — "keyboard" for typing, an arrow, a page key, Home or End; "pointer" for a stepper press or a wheel turn; "blur" for the commit that formats and clamps; "programmatic" for handle.increment() — the originating event, and cancel(), which refuses the move before anything commits. A request for the value the family already holds is not emitted.',
  },
  {
    name: 'onChange, onBlur, onKeyDown, onFocus',
    payload: 'the element’s own events',
    when: 'Whenever the element fires them. The family composes with a consumer’s handler rather than replacing it: the consumer’s runs first, always runs, and calling preventDefault() on a key stops the family from acting on it.',
  },
];

export const REACT_NUMBER_FIELD_DOCS = {
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
        'NumberField',
        'Present means the consumer owns the number, for the life of the component. null is empty, and empty is not nought: a required amount left blank and an amount of nought are different facts',
      ],
      [
        'defaultValue',
        'number | null',
        '—',
        'NumberField',
        'What an uncontrolled control starts from, read once. A native form reset returns to it',
      ],
      [
        'min',
        'number',
        '—',
        'NumberField',
        'The smallest value the control holds. It disables the decrement button at the bound, gives Home somewhere to go, and is where the step grid starts when snapToStep is set',
      ],
      [
        'max',
        'number',
        '—',
        'NumberField',
        'The largest value the control holds, and where End goes',
      ],
      ['step', 'number', '1', 'NumberField', 'What the arrows and the two buttons move by'],
      [
        'largeStep',
        'number',
        'step × 10',
        'NumberField',
        'What Shift and the page keys move by, so a range of ten thousand is crossable without holding a key',
      ],
      ['smallStep', 'number', 'step ÷ 10', 'NumberField', 'What Alt moves by'],
      [
        'stepFrom',
        'number',
        'min, or 0',
        'NumberField',
        'Where an empty control starts stepping from. Pressing increment on a blank amount has to produce a number, and this is the number it produces',
      ],
      [
        'snapToStep',
        'boolean',
        'false',
        'NumberField',
        'Steps to the multiples of step measured from min, so with min 2 and step 3 the valid values are 2, 5, 8, 11',
      ],
      [
        'clamp',
        "'blur' | 'strict' | 'none'",
        'blur',
        'NumberField, NumberFieldDefaultsProvider',
        'Where a value outside the range goes and when. blur returns it at the commit, strict refuses the keystroke, none keeps it and reports aria-invalid',
      ],
      [
        'format',
        'Intl.NumberFormatOptions',
        '—',
        'NumberField',
        'How the value is written and read back. Currency, percent and unit are formattings of one numeric type, and precision is maximumFractionDigits rather than a prop of its own',
      ],
      [
        'formatOn',
        "'change' | 'commit'",
        'change',
        'NumberField, NumberFieldDefaultsProvider',
        'When the text takes that shape. change regroups on every keystroke, so a long number is scannable while it is being typed; commit holds the reader’s own text until blur, Enter or a step. Neither decides when the number moves — it moves on every keystroke that parses',
      ],
      [
        'locale',
        'string',
        'the runtime’s',
        'NumberField, NumberFieldDefaultsProvider',
        'BCP 47. It decides the decimal separator, the grouping and the numbering system, on the way out and on the way back in',
      ],
      [
        'stepper',
        "'stacked' | 'split' | 'none'",
        'stacked',
        'NumberField, NumberFieldDefaultsProvider',
        'Where the two buttons sit. split is the quantity picker’s arrangement and the only one whose targets clear 24 CSS pixels in both axes',
      ],
      [
        'wheel',
        'boolean',
        'false',
        'NumberField',
        'Lets the wheel move the value while the control has focus and the pointer is over it. Off by default: a reader scrolling a form must not change an amount by passing over it',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'NumberField, NumberFieldDefaultsProvider',
        'The type step, read from the field first when there is one, then from the provider. Height, padding, type and glyph all come from the control scales the theme restates per density',
      ],
      [
        'variant',
        "'outline' | 'subtle' | 'plain'",
        'outline',
        'NumberField, NumberFieldDefaultsProvider',
        'How much frame the control shows. plain paints no border at rest and keeps the same box, which is what a dense table cell needs',
      ],
      [
        'start',
        'ReactNode',
        '—',
        'NumberField',
        'An adornment before the value in the reading direction. It is a sibling of the number, never selected, copied or parsed',
      ],
      [
        'end',
        'ReactNode',
        '—',
        'NumberField',
        'An adornment after the value in the reading direction',
      ],
      [
        'disabled',
        'boolean',
        'from the field, or false',
        'NumberField',
        'Unstated rather than false, so the control defers to the field around it. Stated, it wins, and it is the native attribute: out of the tab order and out of submission',
      ],
      [
        'readOnly',
        'boolean',
        'from the field, or false',
        'NumberField',
        'Unstated rather than false. The native readonly, which stays focusable, selectable and submitted, and which disables both steppers',
      ],
      [
        'invalid',
        'boolean',
        'from the field, or false',
        'NumberField',
        'Unstated rather than false. Writes aria-invalid on the control and data-invalid on the frame',
      ],
      [
        'required',
        'boolean',
        '—',
        'NumberField',
        'The element’s own attribute, passed straight through and never written by the family. A field marks necessity with aria-required instead, because the native attribute engages browser constraint validation',
      ],
      [
        'name / form',
        'string',
        '—',
        'NumberField',
        'Reach a hidden input beside the visible one, which carries the raw number. Submitting "R$ 1.480,00" to a server expecting 1480 is the defect this avoids',
      ],
      [
        'incrementLabel / decrementLabel',
        'string',
        'Increase / Decrease',
        'NumberField, NumberFieldDefaultsProvider',
        'What the two buttons announce. Both are set once for an application rather than per amount',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props: NumberFieldRootProps) => ReactNode',
        '—',
        'NumberField',
        'Substitutes the frame and hands it every attribute. The props are typed against HTMLAttributes<HTMLElement>, so they can be spread onto a label or a fieldset. The control and the two buttons are fixed: substituting the element that holds the value and the role would leave the family with nothing to be',
      ],
      [
        'ref',
        'Ref<HTMLInputElement>',
        '—',
        'NumberField',
        'Reaches the input. focus(), select() and setSelectionRange() are the element’s own, so no imperative handle is invented for what the platform already ships',
      ],
      [
        'handle',
        'Ref<NumberFieldHandle>',
        '—',
        'NumberField',
        'increment() and decrement(), the two actions a consumer cannot express by passing a value — a keyboard shortcut elsewhere on the page that steps this field. Both report reason "programmatic"',
      ],
      [
        'className / style',
        'string / CSSProperties',
        '—',
        'NumberField',
        'Reach the frame, because the frame is what a consumer sees. Every other native prop reaches the input',
      ],
      [
        'NumberFieldDefaultsProvider',
        '{ size, variant, stepper, locale, formatOn, clamp, incrementLabel, decrementLabel }',
        '—',
        'a subtree',
        'The seven decisions an application takes once. locale is the one worth setting first: a form where one field reads 1.234 as a thousand and another as one point two three four is a form that loses money',
      ],
      [
        'useField()',
        '() => FieldContextValue | undefined',
        '—',
        'inside a Field',
        'What the control reads to wire itself: the identifier, the description and the four shared states. A control that wires itself cannot be written wrong',
      ],
    ]),
    accessibility: [
      'The pattern is the WAI-ARIA APG’s Spinbutton (w3.org/WAI/ARIA/apg/patterns/spinbutton/), taken whole: role="spinbutton" on the focusable element with aria-valuenow, aria-valuemin, aria-valuemax and aria-valuetext, Up and Down stepping, Home and End reaching the bounds, and Page Up and Page Down as the larger step the pattern lists as optional.',
      'aria-valuetext carries the formatted string, because aria-valuenow alone announces 1480 for a control showing R$ 1.480,00. When the control is empty neither property is set: no value is not the value nought.',
      'The frame carries no role. WAI-ARIA requires the children of a spinbutton to be non-interactive and presentational, so the two steppers are the control’s siblings inside a box that announces nothing, rather than children of the control.',
      'The steppers are out of the tab order — the APG’s “the text field is usually the only focusable component” — and stay in the accessibility tree with translatable names and aria-controls pointing at the value. A screen-reader cursor reaches them; twenty amounts in a form would otherwise cost forty extra tab stops. A stepper at its bound is disabled rather than silently inert, so its name still announces and its appearance says why nothing happens.',
      'aria-required, never the native required. The native attribute engages browser constraint validation and changes submit behaviour, which the library must not impose as a side effect of describing a field. disabled and readonly are native, because that is what those two words mean.',
      'The element is type="text" with inputMode derived from the props rather than from the user agent: numeric for a positive integer, decimal when the format admits a fraction, and text when a negative is possible, because neither numeric keypad offers a minus sign on every platform. A user-agent check during render would be a hydration mismatch.',
      'The wheel is not bound unless a consumer asks for it, and nothing is bound to Escape. MDN’s own note on type="number" names accidental increment as the reason the platform’s spinner is worth avoiding, and WCAG 2.1.4 exists for the class of defect a single-key shortcut produces.',
      'The invalid state is never colour alone: aria-invalid announces it and the field’s error says it in words. In the high-contrast scheme the border cannot carry it at all, which is why it never has to.',
    ],
    snippets: [
      defineSnippet({
        id: 'number-field-react-anatomy',
        language: 'tsx',
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
    <button data-part="increment" type="button" tabIndex={-1} aria-label="Increase" />
    <button data-part="decrement" type="button" tabIndex={-1} aria-label="Decrease" />
  </span>
  <input type="hidden" name="valor" value="1480" />
</div>;`,
      }),
      defineSnippet({
        id: 'number-field-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `[data-ui='number-field'] {
  --slotted-number-field-border-color: var(--slotted-tone-secondary-border);
  --slotted-number-field-hover-border-color: var(--slotted-tone-accent-solid);
  --slotted-number-field-stepper-border-color: var(--slotted-border-subtle);
  --slotted-number-field-radius: var(--slotted-radius-md);
}`,
      }),
    ],
  },
} as const;
