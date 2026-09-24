import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import radioGroupTokens from '@slotted/styles/radio-group/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const REACT_RADIO_GROUP_TOKENS = radioGroupTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Radio Group decision',
}));

const imports: ReferenceImport = {
  source: "import { Radio, RadioGroup, RadioGroupDefaultsProvider } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, or the element render returns',
    required: true,
    purpose:
      'The group. It arranges the items, holds the value, and carries data-ui="radio-group", the three axes and data-disabled, data-invalid and data-readonly. Its role is radiogroup, and it is withdrawn inside a field group, whose fieldset and legend already name the set.',
  },
  {
    part: 'item',
    element: 'div, or the element Radio’s render returns',
    required: true,
    purpose:
      'One choice: a two-column grid holding the control, its mark, its label and its description, with data-checked and data-disabled mirrored onto it. It is a part rather than a family, because a radio outside a group has no exclusive set to belong to.',
  },
  {
    part: 'control',
    element: 'input type="radio"',
    required: true,
    purpose:
      'The control. Holds the value, the name the group shares, the identifier and every native attribute a consumer wrote. Sharing that name is what buys the platform’s whole keyboard model, and ref reaches the element so focus() needs no handle of its own.',
  },
  {
    part: 'indicator',
    element: 'span',
    required: true,
    purpose:
      'The dot, drawn as a mask from the glyph scale over the control. It is a sibling and not a pseudo-element, because Firefox renders neither ::before nor ::after on an input, and it takes no pointer events.',
  },
  {
    part: 'label',
    element: 'label',
    required: false,
    purpose:
      'Names the item’s control through for, and carries the target and the hover wash: a 24-pixel square around the circle, and a wash behind the circle and the text that stands half the control gap off the circle and half as far again past the text. It hugs its text, so the empty row beside it does not toggle the circle.',
  },
  {
    part: 'description',
    element: 'p',
    required: false,
    purpose:
      'Help text under one item’s label, aligned to the label rather than to the circle and wired with aria-describedby. It describes that item and not the set — what the set says belongs to the field group above it.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One set with every axis on it, driven by the controls below the canvas. Tab into it once: the whole group is a single stop, and the arrows move the choice from there.',
    snippet: defineSnippet({
      id: 'radio-group-react-playground',
      language: 'tsx',
      label: 'A set of exclusive choices',
      source: `<RadioGroup defaultValue="standard" name="shipping">
  <Radio value="standard">Entrega padrão</Radio>
  <Radio value="express">Entrega expressa</Radio>
  <Radio value="pickup">Retirar na loja</Radio>
</RadioGroup>;`,
    }),
  },
  {
    id: 'orientation',
    title: 'How the choices flow',
    note: 'A horizontal set wraps rather than scrolling or clipping, and aria-orientation is written only where the group owns its role — on an element with no role the attribute describes nothing.',
    snippet: defineSnippet({
      id: 'radio-group-react-orientation',
      language: 'tsx',
      label: 'Stacked, and in a row that wraps',
      source: `<RadioGroup orientation="vertical" defaultValue="today">
  <Radio value="today">Hoje</Radio>
  <Radio value="tomorrow">Amanhã</Radio>
</RadioGroup>;

<RadioGroup orientation="horizontal" defaultValue="today">
  <Radio value="today">Hoje</Radio>
  <Radio value="tomorrow">Amanhã</Radio>
</RadioGroup>;`,
    }),
  },
  {
    id: 'tile',
    title: 'The plan picker, which is what tiles are for',
    note: 'An exclusive set of framed choices is the case Cloudscape built a whole Tiles family for and Carbon a selectable Tile. Here it is one axis on the group: each item becomes the surface, the arrow keys and the roving tab stop stay the platform’s, and Grid gives the row equal widths and equal heights.',
    snippet: defineSnippet({
      id: 'radio-group-react-tile',
      language: 'tsx',
      label: 'One choice out of a framed set',
      source: `<RadioGroup defaultValue="team" name="plan" variant="tile">
  <Grid minItemWidth="sm">
    <Radio description="Até três projetos e um assento." value="starter">
      Starter
    </Radio>
    <Radio description="Projetos sem limite e dez assentos." value="team">
      Team
    </Radio>
  </Grid>
</RadioGroup>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the set sits at',
    note: 'The circle is the control glyph scale, so the three steps shrink together with the type and the gap when the toolbar switches to dense — and every label keeps its 24-pixel target at every one of them.',
    snippet: defineSnippet({
      id: 'radio-group-react-sizes',
      language: 'tsx',
      label: 'Three steps, all answering density',
      source: `<RadioGroup size="sm" defaultValue="a" />;
<RadioGroup size="md" defaultValue="a" />;
<RadioGroup size="lg" defaultValue="a" />;

// Inside a field, the field decides and the set follows.
<Field size="sm">
  <RadioGroup defaultValue="a" />
</Field>;`,
    }),
  },
  {
    id: 'states',
    title: 'Every state the set paints',
    note: 'Read-only keeps every tab stop and the chosen item keeps its accent, because the value is real; disabled loses both. A single unavailable option dims from its own element’s state rather than from the group’s.',
    snippet: defineSnippet({
      id: 'radio-group-react-states',
      language: 'tsx',
      label: 'Four shared states, and one item on its own',
      source: `<RadioGroup invalid required>
  <Radio value="a">Sem escolha ainda</Radio>
</RadioGroup>;

<RadioGroup readOnly defaultValue="a" />;
<RadioGroup disabled defaultValue="a" />;

// One option out of stock, in an otherwise live set.
<RadioGroup>
  <Radio value="a">Disponível</Radio>
  <Radio disabled value="b">
    Indisponível
  </Radio>
</RadioGroup>;`,
    }),
  },
  {
    id: 'placement',
    title: 'Which side of its label the circle is on',
    note: 'start pushes every circle to the end of the row, and the column is a fraction rather than each label’s own width because a column of controls has to line up with itself.',
    snippet: defineSnippet({
      id: 'radio-group-react-placement',
      language: 'tsx',
      label: 'The circle first, or the label first',
      source: `<RadioGroup labelPlacement="end" defaultValue="card" />;
<RadioGroup labelPlacement="start" defaultValue="card" />;

// Never inherited from a field: that family's labelPlacement answers
// where a field's label sits relative to its control.`,
    }),
  },
  {
    id: 'description',
    title: 'Saying more about one option',
    note: 'The description belongs to the item and reaches only that item’s control, so a reader on the second option hears the second sentence rather than everything the set has to say.',
    snippet: defineSnippet({
      id: 'radio-group-react-description',
      language: 'tsx',
      label: 'Help that describes one choice',
      source: `<RadioGroup defaultValue="monthly">
  <Radio description="Cobrado todo dia 5, sem multa de cancelamento." value="monthly">
    Mensal
  </Radio>
  <Radio description="Dois meses de desconto, cobrados na contratação." value="yearly">
    Anual
  </Radio>
</RadioGroup>;`,
    }),
  },
  {
    id: 'field',
    title: 'Inside a group of fields',
    note: 'The fieldset and its legend are what group and name the set, so the group withdraws its own radiogroup role rather than announcing the same set twice under the same name.',
    snippet: defineSnippet({
      id: 'radio-group-react-field',
      language: 'tsx',
      label: 'The legend names the set; the group holds the value',
      source: `<FieldGroup required>
  <FieldGroupLegend>Forma de pagamento</FieldGroupLegend>
  <RadioGroup defaultValue="card" name="payment">
    <Radio value="card">Cartão</Radio>
    <Radio value="pix">Pix</Radio>
  </RadioGroup>
</FieldGroup>;`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'An option that wraps to three lines keeps its circle on the first of them, an unbroken token breaks instead of taking the page with it, and a right-to-left label mirrors the whole row.',
    snippet: defineSnippet({
      id: 'radio-group-react-content',
      language: 'tsx',
      label: 'Long, unbroken and right-to-left',
      source: `<RadioGroup defaultValue="a">
  <Radio description="O círculo continua na primeira linha do rótulo." value="a">
    Autorizo o compartilhamento dos dados de entrega com a transportadora responsável pela última
    etapa do trajeto.
  </Radio>
  <Radio dir="rtl" value="b">
    أوافق على مشاركة بيانات التسليم مع شركة الشحن.
  </Radio>
</RadioGroup>;`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, and reaching past it',
    note: 'The provider carries the three decisions an application takes once, render substitutes both roots so a set can be a real list, and useRadioGroup reads the same state an item reads.',
    snippet: defineSnippet({
      id: 'radio-group-react-composition',
      language: 'tsx',
      label: 'A provider, and a set that is a list',
      source: `<RadioGroupDefaultsProvider orientation="horizontal" size="sm">
  <RadioGroup defaultValue="a" />
</RadioGroupDefaultsProvider>;

<RadioGroup render={(props) => <ul {...props} />} defaultValue="a">
  <Radio render={(props) => <li {...props} />} value="a">
    Um item
  </Radio>
</RadioGroup>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The APG table, implemented by the platform',
    note: 'Tab lands on the chosen item or on the first, the arrows move focus and selection together in both axes, the set wraps at both ends, and disabled options are skipped — none of it written here.',
    snippet: defineSnippet({
      id: 'radio-group-react-keyboard',
      language: 'tsx',
      label: 'Why the items share a name',
      source: `// Native radios in one form owner with one name already implement the
// whole APG table, in a right-to-left document too. The group generates
// a name when the consumer writes none, because an unnamed set is not a
// set — the price is that such a group inside a form submits under a
// generated key.
<RadioGroup name="shipping">
  <Radio value="standard">Padrão</Radio>
  <Radio value="express">Expressa</Radio>
</RadioGroup>;`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onValueChange',
    payload: '(value: string, request: ChangeRequest<string | undefined>)',
    when: 'Before the value moves. The request carries the new value, the value it replaces — undefined while nothing has been chosen, which is the state the APG asks a group to start in — the reason, the originating event, and cancel(), which refuses the move before anything commits, including the platform’s own selection.',
  },
  {
    name: 'onChange, onClick, onFocus, onBlur, on each item',
    payload: 'the element’s own events',
    when: 'Whenever that item’s element fires them. The family composes with a consumer’s handler rather than replacing it: the consumer’s runs first, and always runs. Calling preventDefault() in onClick stops the change as well.',
  },
];

export const REACT_RADIO_GROUP_DOCS = {
  radioGroup: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'value',
        'string',
        '—',
        'RadioGroup',
        'Present means the consumer owns the choice, for the life of the component. Absent, the group owns it and starts from defaultValue',
      ],
      [
        'defaultValue',
        'string',
        '—',
        'RadioGroup',
        'The value an uncontrolled group starts from, read once. Left unset, nothing is chosen and Tab lands on the first item — the APG’s answer for an empty set',
      ],
      [
        'name',
        'string',
        'generated',
        'RadioGroup',
        'The submission name every item shares, and the reason the platform treats the set as one group. Generated when the consumer writes none, because grouping is by name within the form owner and an unnamed set is not a set',
      ],
      [
        'variant',
        "'plain' | 'tile'",
        'plain',
        'RadioGroup, RadioGroupDefaultsProvider',
        'How every item in the set is drawn. A tile frames each item and makes its whole surface the target; the inputs still share a name, so the arrow keys, the wrap and the single tab stop are unchanged. Arrangement stays Grid’s',
      ],
      [
        'orientation',
        "'vertical' | 'horizontal'",
        'vertical',
        'RadioGroup, RadioGroupDefaultsProvider',
        'How the choices flow. A horizontal set wraps rather than scrolling, and aria-orientation is written only where the group owns its role',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'RadioGroup, RadioGroupDefaultsProvider',
        'The type step, handed to every item. Read from the field or field group first, then from the provider. The circle is the control glyph scale, which the theme restates per density',
      ],
      [
        'labelPlacement',
        "'end' | 'start'",
        'end',
        'RadioGroup, RadioGroupDefaultsProvider',
        'Which side of its own label each circle is on, decided once for the set so the controls line up with each other',
      ],
      [
        'disabled',
        'boolean',
        'from the field, or false',
        'RadioGroup, Radio',
        'Unstated rather than false. Reaches every item as the native attribute — which is also what makes the browser skip it with the arrow keys — and one item may state it alone',
      ],
      [
        'readOnly',
        'boolean',
        'from the field, or false',
        'RadioGroup',
        'Unstated rather than false. The platform has no readonly for a radio, so the group refuses the change and announces aria-readonly; every item keeps its tab stop, its ring and its contrast',
      ],
      [
        'invalid',
        'boolean',
        'from the field, or false',
        'RadioGroup',
        'Unstated rather than false. Writes aria-invalid on the group and data-invalid on the root, which reddens and thickens every circle',
      ],
      [
        'required',
        'boolean',
        'from the field, or false',
        'RadioGroup',
        'Unstated rather than false. Writes aria-required on the group, never the native attribute, which would engage browser constraint validation',
      ],
      [
        'value, on Radio',
        'string',
        '—',
        'Radio',
        'What this item selects, and what the group’s value holds. It is required: an item with no value is a choice a reader cannot make',
      ],
      [
        'description, on Radio',
        'ReactNode',
        '—',
        'Radio',
        'Help text under one item’s label, wired with aria-describedby so it describes that item rather than the set',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props: RadioGroupRootProps | RadioRootProps) => ReactNode',
        '—',
        'RadioGroup, Radio',
        'Substitutes either root and hands it every attribute. The props are typed against HTMLAttributes<HTMLElement>, so a set of choices can be a real ul with each item rendered as a li. The control is fixed: substituting the element that holds the value and the platform’s keyboard would leave the family with nothing to be',
      ],
      [
        'ref',
        'Ref<HTMLInputElement>',
        '—',
        'Radio',
        'Reaches that item’s input. focus() and click() are the element’s own, so no imperative handle is invented for what the platform already ships',
      ],
      [
        'useRadioGroup()',
        '() => RadioGroupContextValue',
        '—',
        'inside a RadioGroup',
        'What an item reads to know whether it is chosen, what its step is, and how to ask for a change. It throws outside a group rather than rendering a control that looks right and behaves like nothing',
      ],
      [
        'RadioGroupDefaultsProvider',
        '{ size, orientation, labelPlacement }',
        '—',
        'a subtree',
        'The three decisions an application takes once. size is outranked by the field around the group',
      ],
      [
        'role',
        'string',
        'radiogroup, or none inside a field group',
        'RadioGroup',
        'A consumer’s own role wins over both. The group withdraws its role inside a field group because a fieldset with a legend is already a named group, and a second one named by the same legend is the same set announced twice',
      ],
    ]),
    accessibility: [
      'The pattern is the WAI-ARIA APG’s Radio Group (w3.org/WAI/ARIA/apg/patterns/radio/), and its entire keyboard table is answered by the platform: Tab lands on the checked item or on the first when none is checked, Space checks the focused one, the arrows move focus and selection together in both axes, the set wraps at both ends, and disabled items are skipped. Native radios sharing a name within one form owner implement all of it — including the arrow directions of a right-to-left document, which a roving tabindex written once per binding would have to relearn twice.',
      'That is why the items share a name, and why one is generated when the consumer writes none: grouping is by name within the form owner, so an unnamed set is not a set. The cost is written rather than hidden — such a group inside a form submits under a generated key.',
      'Each item takes its name from its own label, through for pointing at an identifier the control generates. The group takes its name from the field group’s legend, or from an aria-label the consumer writes when it stands alone; the role is withdrawn inside a field group so the same set is not announced twice.',
      'aria-required on the group, never the native required on an item. The native attribute engages browser constraint validation and changes submit behaviour, which the library must not impose as a side effect of describing a field. disabled is native, because that is also what makes the browser skip the option with the arrow keys.',
      'Read-only has no platform answer for a radio, so it is enforced: the change is refused on the click a pointer and Space share, aria-readonly announces it on the group, and every item keeps its tab stop, its focus ring and its full contrast — the chosen option even keeps its accent, because the value is real.',
      'The invalid state is never colour alone. In the high-contrast scheme the theme paints the danger border the same black as every other border, so the circle thickens its edge as well, and the sentence that says what is wrong is the field group’s error.',
      'The target is not the circle alone. A 24-pixel square around the circle meets WCAG 2.2 SC 2.5.8 at every size and density, where the circle is fourteen pixels at size="sm"; the label extends it to the end of the text, and the hover wash lights exactly that area. The row keeps its line height: the target is drawn around the circle, not laid out beside it.',
    ],
    snippets: [
      defineSnippet({
        id: 'radio-group-react-anatomy',
        language: 'tsx',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div
  data-ui="radio-group"
  data-part="root"
  data-size="md"
  data-orientation="vertical"
  data-label-placement="end"
  role="radiogroup"
>
  <div data-part="item" data-checked>
    <input data-part="control" type="radio" name="shipping" id="std" value="standard" checked />
    <span data-part="indicator" />
    <label data-part="label" for="std">
      Entrega padrão
    </label>
    <p data-part="description" id="std-description">
      Chega em até cinco dias úteis.
    </p>
  </div>
</div>;`,
      }),
      defineSnippet({
        id: 'radio-group-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `[data-ui='radio-group'] {
  --slotted-radio-group-size: 18px;
  --slotted-radio-group-gap: var(--slotted-space-5);
  --slotted-radio-group-checked-border-color: var(--slotted-tone-success-solid);
  --slotted-radio-group-halo-color: var(--slotted-tone-success-text);
}`,
      }),
    ],
  },
} as const;
