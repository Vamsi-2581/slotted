import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import switchTokens from '@slotted/styles/switch/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const REACT_SWITCH_TOKENS = switchTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Switch decision',
}));

const imports: ReferenceImport = {
  source: "import { Switch, SwitchDefaultsProvider } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'span, or the element render returns',
    required: true,
    purpose:
      'The box. Carries data-ui="switch", the three axes, and data-checked, data-disabled, data-readonly, data-invalid and data-loading. It has no role: ARIA declares the switch role Children Presentational, so a root carrying it would fold the label and the description into the control’s own name. className and style reach this element.',
  },
  {
    part: 'control',
    element: 'input[type=checkbox][role=switch]',
    required: true,
    purpose:
      'The control. Holds the state, the identifier, the name and every native attribute a consumer wrote — name, value, form, required, autoFocus, tabIndex. Transparent and over the pill, so a press on the pill is a press on the control. ref reaches this element.',
  },
  {
    part: 'track',
    element: 'span',
    required: true,
    purpose:
      'The pill. Paints the ground, the edge and the focus ring, and it is the box the thumb travels inside.',
  },
  {
    part: 'thumb',
    element: 'span',
    required: true,
    purpose:
      'The part that moves, and the ground the mark is drawn on. It travels on the inline axis, so a right-to-left document mirrors the movement with no second rule.',
  },
  {
    part: 'label',
    element: 'label',
    required: false,
    purpose:
      'The label, from children. It points at the control through for, so it names the switch and doubles its target — and a switch written without children takes aria-label or the field’s label instead.',
  },
  {
    part: 'description',
    element: 'p',
    required: false,
    purpose:
      'Help text under the label, outside it: inside, it would join the accessible name, and help text that toggles a setting when it is clicked is help text nobody reads. Its identifier reaches the control through aria-describedby.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One switch with every axis on it, driven by the controls below the canvas. Click the label as well as the pill: the label names the control and doubles its target.',
    snippet: defineSnippet({
      id: 'switch-react-playground',
      language: 'tsx',
      label: 'A switch, its label and its help',
      source: `<Switch defaultChecked description="A fatura é debitada no dia 5 de cada mês." name="autopay">
  Cobrança automática
</Switch>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the control sits at',
    note: 'Three steps, and inside a field the switch takes the field’s rather than its own: a small field holding a medium control is a field and a control disagreeing about one row.',
    snippet: defineSnippet({
      id: 'switch-react-sizes',
      language: 'tsx',
      label: 'Three steps, all answering density',
      source: `<Switch size="sm">Compacto</Switch>;
<Switch size="lg">Confortável</Switch>;

// Inside a field the field decides, and the control follows.
<Field size="sm">
  <Switch>Notificações</Switch>
</Field>;`,
    }),
  },
  {
    id: 'indicator',
    title: 'The mark inside the thumb',
    note: 'On draws a check and off draws nothing, so the state is readable without colour and without comparing the thumb’s position to a switch you cannot see.',
    snippet: defineSnippet({
      id: 'switch-react-indicator',
      language: 'tsx',
      label: 'A mark, or nothing at all',
      source: `<Switch defaultChecked>Com marca</Switch>;

// Withdraw the mark only where something else carries the state.
<Switch defaultChecked indicator="none">
  Sem marca
</Switch>;`,
    }),
  },
  {
    id: 'placement',
    title: 'Which side the pill sits on',
    note: 'start is the settings row every product writes: the label takes the free width, the pill sits at the end, and a column of rows ends with every pill at the same distance from the edge.',
    snippet: defineSnippet({
      id: 'switch-react-placement',
      language: 'tsx',
      label: 'The label first, and the pill at the end',
      source: `<Switch labelPlacement="start">Alertas por e-mail</Switch>;
<Switch labelPlacement="start">Resumo semanal de pedidos em atraso</Switch>;`,
    }),
  },
  {
    id: 'description',
    title: 'Help text under the label',
    note: 'It sits outside the label, so it describes the switch rather than naming it — and so a paragraph of help text does not change a setting when it is clicked.',
    snippet: defineSnippet({
      id: 'switch-react-description',
      language: 'tsx',
      label: 'A label, and the sentence under it',
      source: `<Switch defaultChecked description="A fatura é debitada no dia 5 de cada mês.">
  Cobrança automática
</Switch>;`,
    }),
  },
  {
    id: 'states',
    title: 'The states the pill paints',
    note: 'Read-only goes hollow and keeps its colour, because the value is real and still submitted; disabled goes grey and its knob goes with it, so a locked setting still says which way it is set.',
    snippet: defineSnippet({
      id: 'switch-react-states',
      language: 'tsx',
      label: 'Every state unset by default, and native where the word means native',
      source: `// Unstated rather than false, so the switch defers to its field.
<Switch invalid>Aceito os termos</Switch>;
<Switch defaultChecked readOnly>
  Chave de produção
</Switch>;
<Switch defaultChecked disabled>
  Incluído no plano
</Switch>;

// A switch inside a disabled FieldGroup — a native fieldset — is painted
// too, because the stylesheet matches :disabled beside the attribute.
<FieldGroup disabled>
  <FieldGroupLegend>Integração</FieldGroupLegend>
  <Switch defaultChecked>Sincronizar pedidos</Switch>
</FieldGroup>;`,
    }),
  },
  {
    id: 'loading',
    title: 'A setting that has not landed yet',
    note: 'The thumb draws an arc where its mark was, the pill keeps its size so the row does not move, and a second press is refused before the DOM can show a state the server does not have.',
    snippet: defineSnippet({
      id: 'switch-react-loading',
      language: 'tsx',
      label: 'The write, and the state that waits for it',
      source: `const [on, setOn] = useState(false);
const [saving, setSaving] = useState(false);

// The switch moves when the server says it did, and refuses a second
// press until then.
<Switch
  checked={on}
  loading={saving}
  loadingLabel="Salvando a preferência"
  onCheckedChange={async (next) => {
    setSaving(true);
    await save(next).then(() => setOn(next));
    setSaving(false);
  }}
>
  Sincronização automática
</Switch>;`,
    }),
  },
  {
    id: 'field',
    title: 'Inside a field',
    note: 'The switch takes the identifier, the description, the error and the four shared states without being asked, and it writes aria-required rather than the native attribute.',
    snippet: defineSnippet({
      id: 'switch-react-field',
      language: 'tsx',
      label: 'Nothing wires the control; the control wires itself',
      source: `<Field invalid required>
  <FieldLabel>Termos de uso</FieldLabel>
  <Switch>Aceito os termos</Switch>
  <FieldError>É necessário aceitar para continuar.</FieldError>
</Field>;`,
    }),
  },
  {
    id: 'settings',
    title: 'A row on a settings page',
    note: 'Where a switch actually lives: the label takes the free width, the pill sits at the end of the row, and the description sits under the label rather than under the pill.',
    snippet: defineSnippet({
      id: 'switch-react-settings',
      language: 'tsx',
      label: 'Three rows that line up',
      source: `<Stack gap={7}>
  <Switch defaultChecked description="Um aviso a cada pedido em atraso." labelPlacement="start">
    Alertas por e-mail
  </Switch>
  <Switch description="Os pedidos criados aqui não são cobrados." labelPlacement="start">
    Ambiente de homologação
  </Switch>
</Stack>;`,
    }),
  },
  {
    id: 'composition',
    title: 'What a consumer can replace',
    note: 'The root becomes any element render returns, an application sets the family’s defaults once, and every native attribute a consumer writes lands on the control rather than on the box.',
    snippet: defineSnippet({
      id: 'switch-react-composition',
      language: 'tsx',
      label: 'The root, the defaults, and the element underneath',
      source: `<SwitchDefaultsProvider labelPlacement="start" size="sm">
  <Switch>Alertas por e-mail</Switch>
</SwitchDefaultsProvider>;

// The root becomes a list item, so a settings list is a list.
<Switch render={(props) => <li {...props} />}>Resumo semanal</Switch>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The keyboard',
    note: 'Tab reaches the control and Space toggles it, both from the platform. Enter is deliberately not bound: inside a form it submits, and a switch that stole it would break the form.',
    snippet: defineSnippet({
      id: 'switch-react-keyboard',
      language: 'tsx',
      label: 'What the request says about how it was made',
      source: `<Switch
  onCheckedChange={(next, request) => {
    // "pointer", "keyboard" or "programmatic".
    if (request.reason === 'pointer' && next) request.cancel();
  }}
>
  Receber a nota fiscal
</Switch>;`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onCheckedChange',
    payload: '(checked: boolean, request: ChangeRequest<boolean>)',
    when: 'Before the switch moves. The request carries the new state, the state it replaces, the reason — "pointer" for a press, "keyboard" for Space, "programmatic" for element.click() — the originating event, and cancel(), which refuses the move before anything commits.',
  },
  {
    name: 'onClick, onChange, onFocus, onBlur',
    payload: 'the element’s own events',
    when: 'Whenever the element fires them. The family composes with a consumer’s handler rather than replacing it: the consumer’s runs first, and a consumer who calls preventDefault() on the click has refused the move before the family asks.',
  },
];

export const REACT_SWITCH_DOCS = {
  switch: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'checked',
        'boolean',
        '—',
        'Switch',
        'Present means the consumer owns the state, for the life of the component. Absent, the element owns it and a native form reset restores it',
      ],
      [
        'defaultChecked',
        'boolean',
        'false',
        'Switch',
        'What an uncontrolled switch starts from, read once and written to the element as the native attribute',
      ],
      [
        'children',
        'ReactNode',
        '—',
        'Switch',
        'The label, beside the pill. It is a real label pointing at the control through for, so it names the switch and doubles its target',
      ],
      [
        'description',
        'ReactNode',
        '—',
        'Switch',
        'Help text under the label and outside it, reaching the control through aria-describedby so it describes rather than names',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'Switch, SwitchDefaultsProvider',
        'The control step, read from the field first when there is one, then from the provider. The pill, the thumb, the mark and the label all come from the control scales the theme restates per density',
      ],
      [
        'indicator',
        "'mark' | 'none'",
        'mark',
        'Switch, SwitchDefaultsProvider',
        'What the thumb carries. mark draws a check when the switch is on and nothing when it is off; none is only correct where something else carries the state',
      ],
      [
        'labelPlacement',
        "'end' | 'start'",
        'end',
        'Switch, SwitchDefaultsProvider',
        'Which side of the label the pill sits on. start is the settings row: the label takes the free width and the pill sits at the end of it',
      ],
      [
        'loading',
        'boolean',
        'false',
        'Switch',
        'The value is not settled yet. Activation is refused, the geometry does not change, aria-busy is set, and the pending label is announced politely two seconds in',
      ],
      [
        'loadingLabel',
        'string',
        'Saving',
        'Switch, SwitchDefaultsProvider',
        'What a reader hears while the switch is pending. It reaches a live region rather than the control’s name, which never changes with the state',
      ],
      [
        'disabled',
        'boolean',
        'from the field, or false',
        'Switch',
        'Unstated rather than false, so the control defers to the field around it. Stated, it wins, and it is the native attribute: out of the tab order and out of submission',
      ],
      [
        'readOnly',
        'boolean',
        'from the field, or false',
        'Switch',
        'Unstated rather than false. The native readonly attribute does nothing on a checkbox, so this is aria-readonly plus a refused activation: focusable, announced and still submitted',
      ],
      [
        'invalid',
        'boolean',
        'from the field, or false',
        'Switch',
        'Unstated rather than false. Writes aria-invalid on the control and data-invalid on the root, which retargets the focus ring',
      ],
      [
        'required',
        'boolean',
        '—',
        'Switch',
        'The element’s own attribute, passed straight through and never written by the family. A field marks necessity with aria-required instead, because the native attribute engages browser constraint validation',
      ],
      [
        'name / value / form',
        'string',
        '— / on / —',
        'Switch',
        'The element’s own. The value is submitted when the switch is on and nothing is submitted when it is off, which is what a checkbox does and what a button could not',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props: SwitchRootProps) => ReactNode',
        '—',
        'Switch',
        'Substitutes the root and hands it every attribute. The props are typed against HTMLAttributes<HTMLElement>, so they can be spread onto a list item or a table cell. The control, the pill and the label are fixed: the first holds the state and the identifier, and the rest are the family’s own paint',
      ],
      [
        'ref',
        'Ref<HTMLInputElement>',
        '—',
        'Switch',
        'Reaches the control. focus() and click() are the element’s own, so no imperative handle is invented for what the platform already ships — and a click() reports itself as "programmatic" rather than as a key press',
      ],
      [
        'className / style',
        'string / CSSProperties',
        '—',
        'Switch',
        'Reach the root, because the root is what a consumer sees. Every other native prop reaches the control',
      ],
      [
        'SwitchDefaultsProvider',
        '{ size, indicator, labelPlacement, loadingLabel }',
        '—',
        'a subtree',
        'The four decisions an application takes once. size is the one a field outranks, so a switch inside a field takes the field’s step',
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
      'The pattern is the WAI-ARIA APG’s Switch (w3.org/WAI/ARIA/apg/patterns/switch/), built on the third of its three reference implementations: an input[type=checkbox] with role="switch". Space toggles it, the label names it and doubles the target, name and value are submitted, form.reset() restores it, and a disabled fieldset disables it — all from the platform.',
      'aria-checked is deliberately absent. The APG states that a checkbox-based switch uses the HTML checked attribute instead, and writing both would be the state said twice by two things that can disagree.',
      'Enter is a deliberate departure. The APG lists it as optional, and inside a form Enter submits: a switch that stole the key would break the form for the sake of an optional shortcut. The cost is that a reader who expects Enter presses Space.',
      'The root carries no role, because ARIA declares the switch role Children Presentational: the label and the description would otherwise be folded into the control’s accessible name — and the name of a switch must not change when its state does, which is why the pending label is a live region rather than part of the name.',
      'aria-required, never the native required. The native attribute engages browser constraint validation and changes submit behaviour, which the library must not impose as a side effect of describing a field; a consumer who wants it writes required and it survives. disabled is native, because that is what the word means, and read-only is implemented rather than declared: the native readonly attribute does nothing at all on a checkbox.',
      'The target is at least 24 CSS pixels in both axes at every step and every density — WCAG 2.2 SC 2.5.8 — because the label carries the slack that makes one line of text that tall, and a switch written without a label states the minimum on its own row.',
      'The description sits outside the label, so it describes the switch rather than naming it, and clicking it changes nothing.',
    ],
    snippets: [
      defineSnippet({
        id: 'switch-react-anatomy',
        language: 'tsx',
        label: 'Anatomy, as it reaches the DOM',
        source: `<span data-ui="switch" data-part="root" data-size="md" data-indicator="mark" data-checked>
  <input data-part="control" type="checkbox" role="switch" id="autopay" checked />
  <span data-part="track">
    <span data-part="thumb">
      <span data-ui="icon" data-part="root" aria-hidden="true">
        <svg data-part="glyph" data-glyph="check" aria-hidden="true"></svg>
      </span>
    </span>
  </span>
  <label data-part="label" htmlFor="autopay">
    Cobrança automática
  </label>
  <p data-part="description" id="autopay-description">
    Debitada no dia 5.
  </p>
</span>;`,
      }),
      defineSnippet({
        id: 'switch-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `[data-ui='switch'] {
  --slotted-switch-checked-background: var(--slotted-tone-success-solid);
  --slotted-switch-checked-border-color: var(--slotted-tone-success-solid);
  --slotted-switch-mark-color: var(--slotted-tone-success-solid);
  --slotted-switch-radius: var(--slotted-radius-sm);
}`,
      }),
    ],
  },
} as const;
