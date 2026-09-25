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

export const ANGULAR_RADIO_GROUP_TOKENS = radioGroupTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Radio Group decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  provideRadioGroupDefaults,\n  SlRadio,\n  SlRadioDescription,\n  SlRadioGroup,\n} from '@slotted/angular/radio-group';",
  selector: '[slRadioGroup]',
  exportAs: 'slRadioGroup',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'the element carrying slRadioGroup',
    required: true,
    purpose:
      'The group. It arranges the items, holds the value, and carries data-ui="radio-group", the three axes and data-disabled, data-invalid and data-readonly. Its role is radiogroup, withdrawn inside a field group. It is also where formControlName goes: the value accessor and the validator are both on this element.',
  },
  {
    part: 'item',
    element: 'the element carrying slRadio',
    required: true,
    purpose:
      'One choice: a two-column grid holding the control, its mark, its label and its description, with data-checked and data-disabled mirrored onto it. It is a part rather than an entry point, because a radio outside a group has no exclusive set to belong to — SlRadioGroup is injected without optional, so writing one alone fails at construction.',
  },
  {
    part: 'control',
    element: 'input type="radio", in the item’s template',
    required: true,
    purpose:
      'The control. Holds the value, the name the group shares and the identifier. Sharing that name is what buys the platform’s whole keyboard model, and the element is reached through the item’s exportAs: item.inputElement gives focus() and click().',
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
    element: 'label, in the item’s template',
    required: false,
    purpose:
      'Names the item’s control through for, and carries the target and the hover wash: a 24-pixel square around the circle, and a wash behind the circle and the text that stands half the control gap off the circle and half as far again past the text. It hugs its text, so the empty row beside it does not toggle the circle. Its content is the item’s default ng-content slot.',
  },
  {
    part: 'description',
    element: 'the element carrying slRadioDescription',
    required: false,
    purpose:
      'Help text under one item’s label, projected into a named slot and wired with aria-describedby. It describes that item and not the set — what the set says belongs to the field group above it.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One set with every axis on it, driven by the controls below the canvas. Tab into it once: the whole group is a single stop, and the arrows move the choice from there.',
    snippet: defineSnippet({
      id: 'radio-group-angular-playground',
      language: 'angular',
      label: 'A set of exclusive choices',
      source: `<div slRadioGroup name="shipping" defaultValue="standard">
  <div slRadio value="standard">Entrega padrão</div>
  <div slRadio value="express">Entrega expressa</div>
  <div slRadio value="pickup">Retirar na loja</div>
</div>`,
    }),
  },
  {
    id: 'orientation',
    title: 'How the choices flow',
    note: 'A horizontal set wraps rather than scrolling or clipping, and aria-orientation is written only where the group owns its role — on an element with no role the attribute describes nothing.',
    snippet: defineSnippet({
      id: 'radio-group-angular-orientation',
      language: 'angular',
      label: 'Stacked, and in a row that wraps',
      source: `<div slRadioGroup orientation="vertical" defaultValue="today">
  <div slRadio value="today">Hoje</div>
  <div slRadio value="tomorrow">Amanhã</div>
</div>

<div slRadioGroup orientation="horizontal" defaultValue="today">
  <div slRadio value="today">Hoje</div>
  <div slRadio value="tomorrow">Amanhã</div>
</div>`,
    }),
  },
  {
    id: 'tile',
    title: 'The plan picker, which is what tiles are for',
    note: 'An exclusive set of framed choices is the case Cloudscape built a whole Tiles family for and Carbon a selectable Tile. Here it is one axis on the group: each item becomes the surface, the arrow keys and the roving tab stop stay the platform’s, and Grid gives the row equal widths and equal heights.',
    snippet: defineSnippet({
      id: 'radio-group-angular-tile',
      language: 'angular',
      label: 'One choice out of a framed set',
      source: `<div slRadioGroup name="plan" variant="tile" defaultValue="team">
  <div slGrid minItemWidth="sm">
    <div slRadio value="starter">
      Starter
      <p slRadioDescription>Até três projetos e um assento.</p>
    </div>
    <div slRadio value="team">
      Team
      <p slRadioDescription>Projetos sem limite e dez assentos.</p>
    </div>
  </div>
</div>`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the set sits at',
    note: 'The circle is the control glyph scale, so the three steps shrink together with the type and the gap when the toolbar switches to dense — and every label keeps its 24-pixel target at every one of them.',
    snippet: defineSnippet({
      id: 'radio-group-angular-sizes',
      language: 'angular',
      label: 'Three steps, all answering density',
      source: `<div slRadioGroup size="sm" defaultValue="a">
  <div slRadio value="a">Compacto</div>
</div>

<!-- Inside a field, the field decides and the set follows. -->
<div slField size="sm">
  <label slFieldLabel>Prioridade</label>
  <div slRadioGroup defaultValue="low">
    <div slRadio value="low">Normal</div>
  </div>
</div>`,
    }),
  },
  {
    id: 'states',
    title: 'Every state the set paints',
    note: 'Read-only keeps every tab stop and the chosen item keeps its accent, because the value is real; disabled loses both. A single unavailable option dims from its own element’s state rather than from the group’s.',
    snippet: defineSnippet({
      id: 'radio-group-angular-states',
      language: 'angular',
      label: 'Four shared states, and one item on its own',
      source: `<div slRadioGroup invalid required>
  <div slRadio value="a">Sem escolha ainda</div>
</div>

<div slRadioGroup readOnly defaultValue="a">
  <div slRadio value="a">Plano contratado</div>
</div>

<!-- One option out of stock, in an otherwise live set. -->
<div slRadioGroup>
  <div slRadio value="a">Disponível</div>
  <div slRadio value="b" disabled>Indisponível</div>
</div>`,
    }),
  },
  {
    id: 'placement',
    title: 'Which side of its label the circle is on',
    note: 'start pushes every circle to the end of the row, and the column is a fraction rather than each label’s own width because a column of controls has to line up with itself.',
    snippet: defineSnippet({
      id: 'radio-group-angular-placement',
      language: 'angular',
      label: 'The circle first, or the label first',
      source: `<div slRadioGroup labelPlacement="end" defaultValue="card">
  <div slRadio value="card">Cartão</div>
</div>

<div slRadioGroup labelPlacement="start" defaultValue="card">
  <div slRadio value="card">Cartão</div>
</div>`,
    }),
  },
  {
    id: 'description',
    title: 'Saying more about one option',
    note: 'The description belongs to the item and reaches only that item’s control, so a reader on the second option hears the second sentence rather than everything the set has to say.',
    snippet: defineSnippet({
      id: 'radio-group-angular-description',
      language: 'angular',
      label: 'Help that describes one choice',
      source: `<div slRadioGroup defaultValue="monthly">
  <div slRadio value="monthly">
    Mensal
    <p slRadioDescription>Cobrado todo dia 5, sem multa de cancelamento.</p>
  </div>
  <div slRadio value="yearly">
    Anual
    <p slRadioDescription>Dois meses de desconto, cobrados na contratação.</p>
  </div>
</div>`,
    }),
  },
  {
    id: 'field',
    title: 'Inside a group of fields, and in a reactive form',
    note: 'The fieldset and its legend are what group and name the set, so the group withdraws its own radiogroup role — and the same element takes formControlName, because the accessor and the validator both live on the root.',
    snippet: defineSnippet({
      id: 'radio-group-angular-field',
      language: 'angular',
      label: 'The legend names the set; the form owns the value',
      source: `<fieldset slFieldGroup required>
  <legend slFieldGroupLegend>Forma de pagamento</legend>
  <div slRadioGroup required formControlName="payment">
    <div slRadio value="card">Cartão</div>
    <div slRadio value="pix">Pix</div>
  </div>
</fieldset>`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'An option that wraps to three lines keeps its circle on the first of them, an unbroken token breaks instead of taking the page with it, and a right-to-left label mirrors the whole row.',
    snippet: defineSnippet({
      id: 'radio-group-angular-content',
      language: 'angular',
      label: 'Long, unbroken and right-to-left',
      source: `<div slRadioGroup defaultValue="a">
  <div slRadio value="a">
    Autorizo o compartilhamento dos dados de entrega com a transportadora.
    <p slRadioDescription>O círculo continua na primeira linha do rótulo.</p>
  </div>
  <div slRadio value="b" dir="rtl">أوافق على مشاركة بيانات التسليم.</div>
</div>`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, and reaching past it',
    note: 'The token carries the three decisions an application takes once, exportAs reaches both instances, and the root is the consumer’s own element — so a set of choices can be a real list.',
    snippet: defineSnippet({
      id: 'radio-group-angular-composition',
      language: 'angular',
      label: 'A set of choices that is a real list',
      source: `<ul slRadioGroup class="slotted-demo-list" defaultValue="a">
  <li slRadio value="a">Um item</li>
  <li slRadio value="b">E outro abaixo dele</li>
</ul>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The APG table, implemented by the platform',
    note: 'Tab lands on the chosen item or on the first, the arrows move focus and selection together in both axes, the set wraps at both ends, and disabled options are skipped — none of it written here.',
    snippet: defineSnippet({
      id: 'radio-group-angular-keyboard',
      language: 'angular',
      label: 'Why the items share a name',
      source: `<!-- Native radios in one form owner with one name already implement the
     whole APG table, in a right-to-left document too. The group generates
     a name when the consumer writes none, because an unnamed set is not a
     set — the price is that such a group inside a form submits under a
     generated key. -->
<div slRadioGroup name="shipping">
  <div slRadio value="standard">Padrão</div>
  <div slRadio value="express">Expressa</div>
</div>`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: '(valueChange)',
    payload: 'ChangeRequest<string | undefined>',
    when: 'Before the value moves. The request carries the new value, the value it replaces — undefined while nothing has been chosen, which is the state the APG asks a group to start in — the reason, the originating event, and cancel(). There is no [(value)], because a two-way binding has one slot and can carry none of those.',
  },
  {
    name: 'ControlValueAccessor and Validator',
    payload: 'string',
    when: 'Whenever the value moves under a formControl, formControlName or ngModel written on the root. The group also validates the set: required means "choose one", which is a fact about the group and not about any one option.',
  },
];

export const ANGULAR_RADIO_GROUP_DOCS = {
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
        'SlRadioGroup',
        'Present means the consumer owns the choice. Absent, the group owns it and starts from defaultValue — or from the form control bound to the root',
      ],
      [
        'defaultValue',
        'string',
        '—',
        'SlRadioGroup',
        'The value an uncontrolled group starts from, read once when the directive initialises. Left unset, nothing is chosen and Tab lands on the first item — the APG’s answer for an empty set',
      ],
      [
        'name',
        'string',
        'generated',
        'SlRadioGroup',
        'The submission name every item shares, and the reason the platform treats the set as one group. Generated when the consumer writes none, because grouping is by name within the form owner and an unnamed set is not a set',
      ],
      [
        'variant',
        "'plain' | 'tile'",
        'plain',
        'SlRadioGroup, provideRadioGroupDefaults',
        'How every item in the set is drawn. A tile frames each item and makes its whole surface the target; the inputs still share a name, so the arrow keys, the wrap and the single tab stop are unchanged. Arrangement stays Grid’s',
      ],
      [
        'orientation',
        "'vertical' | 'horizontal'",
        'vertical',
        'SlRadioGroup, provideRadioGroupDefaults',
        'How the choices flow. A horizontal set wraps rather than scrolling, and aria-orientation is written only where the group owns its role',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'SlRadioGroup, provideRadioGroupDefaults',
        'The type step, handed to every item. Read from the field or field group first, then from the token. The circle is the control glyph scale, which the theme restates per density',
      ],
      [
        'labelPlacement',
        "'end' | 'start'",
        'end',
        'SlRadioGroup, provideRadioGroupDefaults',
        'Which side of its own label each circle is on, decided once for the set so the controls line up with each other',
      ],
      [
        'disabled',
        'boolean',
        'from the field, or false',
        'SlRadioGroup, SlRadio',
        'Unstated rather than false. Reaches every item as the native attribute — which is also what makes the browser skip it with the arrow keys — and one item may state it alone. A disabled form control sets it too',
      ],
      [
        'readOnly',
        'boolean',
        'from the field, or false',
        'SlRadioGroup',
        'Unstated rather than false. The platform has no readonly for a radio, so the group refuses the activation and announces aria-readonly; every item keeps its tab stop, its ring and its contrast',
      ],
      [
        'invalid',
        'boolean',
        'from the field, or false',
        'SlRadioGroup',
        'Unstated rather than false. Writes aria-invalid on the group and data-invalid on the root, which reddens and thickens every circle',
      ],
      [
        'required',
        'boolean',
        'from the field, or false',
        'SlRadioGroup',
        'Unstated rather than false. Writes aria-required on the group and makes its Validator demand a value. Never the native attribute, which would engage browser constraint validation',
      ],
      [
        'value, on SlRadio',
        'string',
        '—',
        'SlRadio',
        'What this item selects, and what the group’s value holds. It is required: an item with no value is a choice a reader cannot make',
      ],
      [
        'slRadioDescription',
        'directive',
        '—',
        'a projected element',
        'Help text under one item’s label, wired with aria-describedby so it describes that item rather than the set',
      ],
    ]),
    composition: apiRows([
      [
        'exportAs="slRadioGroup" / "slRadio"',
        'SlRadioGroup / SlRadio',
        '—',
        'a template',
        'Reaches either instance. inputElement on an item reaches its input, which already has focus() and click(), so no imperative handle is invented for what the platform ships',
      ],
      [
        'ControlValueAccessor and Validator',
        'formControl, formControlName, ngModel',
        '—',
        'the host element',
        'Both are on the group’s root, so a form binding goes where the consumer already writes the directive. required becomes a validator over the set, which is the integration React has no equivalent of',
      ],
      [
        'provideRadioGroupDefaults()',
        '{ size, orientation, labelPlacement }',
        '—',
        'an injector',
        'The three decisions an application takes once. size is outranked by the field around the group',
      ],
      [
        'the host element',
        'any element',
        '—',
        'SlRadioGroup, SlRadio',
        'Angular pays one element for each root and React pays none: the host is the wrapper, so a set of choices can be a ul with each item written as a li',
      ],
      [
        'role',
        'string',
        'radiogroup, or none inside a field group',
        'the host element',
        'A role the consumer wrote as a static attribute wins over both, because it is read before the host binding computes',
      ],
    ]),
    accessibility: [
      'The pattern is the WAI-ARIA APG’s Radio Group (w3.org/WAI/ARIA/apg/patterns/radio/), and its entire keyboard table is answered by the platform: Tab lands on the checked item or on the first when none is checked, Space checks the focused one, the arrows move focus and selection together in both axes, the set wraps at both ends, and disabled items are skipped. Native radios sharing a name within one form owner implement all of it — including the arrow directions of a right-to-left document.',
      'That is why the items share a name, and why one is generated when the consumer writes none: grouping is by name within the form owner, so an unnamed set is not a set. The cost is written rather than hidden — such a group inside a form submits under a generated key.',
      'Each item takes its name from its own label, through for pointing at an identifier the component generates. The group takes its name from the field group’s legend, or from an aria-label the consumer writes when it stands alone; the role is withdrawn inside a field group so the same set is not announced twice.',
      'aria-required on the group, never the native required on an item — and "choose one" is a fact about the set, which is why the group and not the item is the Validator. disabled is native, because that is also what makes the browser skip the option with the arrow keys.',
      'Read-only has no platform answer for a radio, so it is enforced: the activation is refused, aria-readonly announces it on the group, and every item keeps its tab stop, its focus ring and its full contrast — the chosen option even keeps its accent, because the value is real.',
      'Refusing the activation is not the whole correction here, and the difference is written down: the HTML standard’s canceled activation behaviour restores the clicked radio and not the neighbour it unchecked, so the group writes every element from the value afterwards. A controlled group that refused a change would otherwise show no choice at all.',
      'The invalid state is never colour alone. In the high-contrast scheme the theme paints the danger border the same black as every other border, so the circle thickens its edge as well. The target is not the circle alone. A 24-pixel square around the circle meets WCAG 2.2 SC 2.5.8 at every size and density, where the circle is fourteen pixels at size="sm"; the label extends it to the end of the text, and the hover wash lights exactly that area. The row keeps its line height: the target is drawn around the circle, not laid out beside it.',
    ],
    snippets: [
      defineSnippet({
        id: 'radio-group-angular-defaults',
        language: 'ts',
        label: 'The three decisions an application takes once',
        source: `import { provideRadioGroupDefaults } from '@slotted/angular/radio-group';

bootstrapApplication(App, {
  providers: [provideRadioGroupDefaults({ orientation: 'horizontal', size: 'sm' })],
});`,
      }),
      defineSnippet({
        id: 'radio-group-angular-anatomy',
        language: 'angular',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div
  data-ui="radio-group"
  data-part="root"
  data-size="md"
  data-orientation="vertical"
  role="radiogroup"
>
  <div data-part="item" data-checked>
    <input data-part="control" type="radio" name="shipping" id="std" value="standard" checked />
    <span data-part="indicator"
      ><span data-ui="icon" data-part="root" aria-hidden="true"
        ><svg data-part="glyph" data-glyph="dot" aria-hidden="true"></svg></span
    ></span>
    <label data-part="label" for="std">Entrega padrão</label>
    <p data-part="description" id="std-description">Chega em até cinco dias úteis.</p>
  </div>
</div>`,
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
