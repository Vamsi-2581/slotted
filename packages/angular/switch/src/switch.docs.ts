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

export const ANGULAR_SWITCH_TOKENS = switchTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Switch decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  provideSwitchDefaults,\n  SlSwitch,\n  SlSwitchDescription,\n} from '@slotted/angular/switch';",
  selector: '[slSwitch]',
  exportAs: 'slSwitch',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'the element carrying slSwitch',
    required: true,
    purpose:
      'The box. Carries data-ui="switch", the three axes, and data-checked, data-disabled, data-readonly, data-invalid and data-loading. It has no role: ARIA declares the switch role Children Presentational, so a root carrying it would fold the status word into the control’s own name.',
  },
  {
    part: 'control',
    element: 'input[type=checkbox][role=switch], from the component’s template',
    required: true,
    purpose:
      'The control. Holds the state, the identifier, the name and the value; id, aria-* and required written on the host reach it untouched, and formControlName on the host reaches it through the value accessor. Transparent and over the pill, so a press on the pill is a press on the control.',
  },
  {
    part: 'track',
    element: 'span, from the component’s template',
    required: true,
    purpose:
      'The pill. Paints the ground, the edge and the focus ring, and it is the box the thumb travels inside.',
  },
  {
    part: 'thumb',
    element: 'span, from the component’s template',
    required: true,
    purpose:
      'The part that moves, and the ground the mark is drawn on. It travels on the inline axis, so a right-to-left document mirrors the movement with no second rule.',
  },
  {
    part: 'label',
    element: 'label, holding the projected content',
    required: false,
    purpose:
      'The label. It points at the control through for, so it names the switch and doubles its target — and a switch written without content takes aria-label or the field’s label instead.',
  },
  {
    part: 'description',
    element: 'the element carrying slSwitchDescription',
    required: false,
    purpose:
      'Help text under the label, projected outside it: inside, it would join the accessible name, and help text that toggles a setting when it is clicked is help text nobody reads. Its identifier reaches the control through aria-describedby.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One switch with every axis on it, driven by the controls below the canvas. Click the label as well as the pill: the label names the control and doubles its target.',
    snippet: defineSnippet({
      id: 'switch-angular-playground',
      language: 'angular',
      label: 'A switch, its label and its help',
      source: `<span slSwitch defaultChecked name="autopay">
  Cobrança automática
  <p slSwitchDescription>A fatura é debitada no dia 5 de cada mês.</p>
</span>`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the control sits at',
    note: 'Three steps, and inside a field the switch takes the field’s rather than its own: a small field holding a medium control is a field and a control disagreeing about one row.',
    snippet: defineSnippet({
      id: 'switch-angular-sizes',
      language: 'angular',
      label: 'Three steps, all answering density',
      source: `<span slSwitch size="sm">Compacto</span>
<span slSwitch size="lg">Confortável</span>

<!-- Inside a field the field decides, and the control follows. -->
<div slField size="sm">
  <span slSwitch>Notificações</span>
</div>`,
    }),
  },
  {
    id: 'indicator',
    title: 'The mark inside the thumb',
    note: 'On draws a check and off draws nothing, so the state is readable without colour and without comparing the thumb’s position to a switch you cannot see.',
    snippet: defineSnippet({
      id: 'switch-angular-indicator',
      language: 'angular',
      label: 'A mark, or nothing at all',
      source: `<span slSwitch defaultChecked>Com marca</span>

<!-- Withdraw the mark only where something else carries the state. -->
<span slSwitch indicator="none" defaultChecked>Sem marca</span>`,
    }),
  },
  {
    id: 'placement',
    title: 'Which side the pill sits on',
    note: 'start is the settings row every product writes: the label takes the free width, the pill sits at the end, and a column of rows ends with every pill at the same distance from the edge.',
    snippet: defineSnippet({
      id: 'switch-angular-placement',
      language: 'angular',
      label: 'The label first, and the pill at the end',
      source: `<span slSwitch labelPlacement="start">Alertas por e-mail</span>
<span slSwitch labelPlacement="start">Resumo semanal de pedidos em atraso</span>`,
    }),
  },
  {
    id: 'description',
    title: 'Help text under the label',
    note: 'It is projected outside the label, so it describes the switch rather than naming it — and so a paragraph of help text does not change a setting when it is clicked.',
    snippet: defineSnippet({
      id: 'switch-angular-description',
      language: 'angular',
      label: 'A label, and the sentence under it',
      source: `<span slSwitch defaultChecked>
  Cobrança automática
  <p slSwitchDescription>A fatura é debitada no dia 5 de cada mês.</p>
</span>`,
    }),
  },
  {
    id: 'states',
    title: 'The states the pill paints',
    note: 'Read-only goes hollow and keeps its colour, because the value is real and still submitted; disabled goes grey and its knob goes with it, so a locked setting still says which way it is set.',
    snippet: defineSnippet({
      id: 'switch-angular-states',
      language: 'angular',
      label: 'Every state unset by default, and native where the word means native',
      source: `<!-- Unstated rather than false, so the switch defers to its field. -->
<span slSwitch invalid>Aceito os termos</span>
<span slSwitch defaultChecked readOnly>Chave de produção</span>
<span slSwitch defaultChecked disabled>Incluído no plano</span>

<!-- A switch inside a disabled fieldset is painted too, because the
     stylesheet matches :disabled beside the attribute. -->
<fieldset slFieldGroup disabled>
  <legend slFieldGroupLegend>Integração</legend>
  <span slSwitch defaultChecked>Sincronizar pedidos</span>
</fieldset>`,
    }),
  },
  {
    id: 'loading',
    title: 'A setting that has not landed yet',
    note: 'The thumb draws an arc where its mark was, the pill keeps its size so the row does not move, and a second press is refused before the DOM can show a state the server does not have.',
    snippet: defineSnippet({
      id: 'switch-angular-loading',
      language: 'angular',
      label: 'The write, and the state that waits for it',
      source: `<span
  slSwitch
  [checked]="on()"
  [loading]="saving()"
  [messages]="{ loading: 'Salvando a preferência' }"
  (checkedChange)="save($event.value)"
>
  Sincronização automática
</span>`,
    }),
  },
  {
    id: 'field',
    title: 'Inside a field',
    note: 'The switch takes the description, the error and the four shared states without being asked, and it writes aria-required rather than the native attribute.',
    snippet: defineSnippet({
      id: 'switch-angular-field',
      language: 'angular',
      label: 'Nothing wires the control; the control wires itself',
      source: `<div slField invalid required>
  <label slFieldLabel>Preferências de cobrança</label>
  <span slSwitch>Debitar automaticamente</span>
  <p slFieldError>Escolha uma forma de cobrança.</p>
</div>`,
    }),
  },
  {
    id: 'settings',
    title: 'A row on a settings page',
    note: 'Where a switch actually lives: the label takes the free width, the pill sits at the end of the row, and the description sits under the label rather than under the pill.',
    snippet: defineSnippet({
      id: 'switch-angular-settings',
      language: 'angular',
      label: 'Three rows that line up',
      source: `<div slStack [gap]="7">
  <span slSwitch labelPlacement="start" defaultChecked>
    Alertas por e-mail
    <p slSwitchDescription>Um aviso a cada pedido em atraso.</p>
  </span>
  <span slSwitch labelPlacement="start">
    Ambiente de homologação
    <p slSwitchDescription>Os pedidos criados aqui não são cobrados.</p>
  </span>
</div>`,
    }),
  },
  {
    id: 'composition',
    title: 'What a consumer can replace',
    note: 'The host element is the consumer’s own, an application sets the family’s defaults once, and a form reaches the value through the accessor rather than through an input.',
    snippet: defineSnippet({
      id: 'switch-angular-composition',
      language: 'ts',
      label: 'Defaults once, and the form the control belongs in',
      source: `bootstrapApplication(App, {
  providers: [provideSwitchDefaults({ size: 'sm', labelPlacement: 'start' })],
});

// A switch that must be on is the form's rule, not the control's.
new FormControl(false, Validators.requiredTrue);`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The keyboard',
    note: 'Tab reaches the control and Space toggles it, both from the platform. Enter is deliberately not bound: inside a form it submits, and a switch that stole it would break the form.',
    snippet: defineSnippet({
      id: 'switch-angular-keyboard',
      language: 'angular',
      label: 'What the request says about how it was made',
      source: `<span slSwitch (checkedChange)="onRequest($event)">Receber a nota fiscal</span>

<!-- $event.reason is "pointer", "keyboard" or "programmatic",
     and $event.cancel() refuses the move before it commits. -->`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'checkedChange',
    payload: 'ChangeRequest<boolean>',
    when: 'Before the switch moves. The request carries the new state, the state it replaces, the reason — "pointer" for a press, "keyboard" for Space, "programmatic" for toggle() — the originating event, and cancel(), which refuses the move before anything commits. There is no [(checked)]: a two-way binding has one slot and can carry none of those.',
  },
  {
    name: 'ControlValueAccessor',
    payload: 'boolean',
    when: 'Whenever the switch moves inside a form. formControlName and ngModel sit on the host, writeValue moves the state, setDisabledState disables the control natively, and blur marks the control touched.',
  },
  {
    name: 'click, change, focus, blur',
    payload: 'the control’s own events',
    when: 'Whenever the control fires them. A consumer’s own (click) on the host still runs: the component listens on the input it renders, not on the host.',
  },
];

export const ANGULAR_SWITCH_DOCS = {
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
        '[slSwitch]',
        'Present means the consumer owns the state, for the life of the component. Absent, the switch owns it and a native form reset restores it',
      ],
      [
        'defaultChecked',
        'boolean',
        'false',
        '[slSwitch]',
        'What an uncontrolled switch starts from, read once in ngOnInit',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        '[slSwitch], provideSwitchDefaults',
        'The control step, read from the field first when there is one, then from the token. The pill, the thumb, the mark and the label all come from the control scales the theme restates per density',
      ],
      [
        'indicator',
        "'mark' | 'none'",
        'mark',
        '[slSwitch], provideSwitchDefaults',
        'What the thumb carries. mark draws a check when the switch is on and nothing when it is off; none is only correct where something else carries the state',
      ],
      [
        'labelPlacement',
        "'end' | 'start'",
        'end',
        '[slSwitch], provideSwitchDefaults',
        'Which side of the label the pill sits on. start is the settings row: the label takes the free width and the pill sits at the end of it',
      ],
      [
        'loading',
        'boolean',
        'false',
        '[slSwitch]',
        'The value is not settled yet. Activation is refused, the geometry does not change, aria-busy is set, and the pending label is announced politely two seconds in',
      ],
      [
        'messages',
        'Partial<SwitchMessages>',
        '—',
        '[slSwitch]',
        'Words laid over the language in force, key by key: loading is what a reader hears while the switch is pending. It reaches a live region rather than the control’s name, which never changes with the state',
      ],
      [
        'disabled',
        'boolean',
        'from the field, or false',
        '[slSwitch]',
        'Unstated rather than false, so the switch defers to the field around it. Stated, it wins, and it is the native attribute — as is a form’s own setDisabledState',
      ],
      [
        'readOnly',
        'boolean',
        'from the field, or false',
        '[slSwitch]',
        'Unstated rather than false. The native readonly attribute does nothing on a checkbox, so this is aria-readonly plus a refused activation: focusable, announced and still submitted',
      ],
      [
        'invalid',
        'boolean',
        'from the field, or false',
        '[slSwitch]',
        'Unstated rather than false. Writes aria-invalid on the control and data-invalid on the host, which retargets the focus ring',
      ],
      [
        'required',
        'boolean',
        '—',
        '[slSwitch]',
        'The element’s own attribute, written on the host and passed through untouched. A field marks necessity with aria-required instead, and a switch that must be on is Validators.requiredTrue in the form',
      ],
      [
        'name / value',
        'string',
        '— / on',
        '[slSwitch]',
        'What the switch submits when it is on. Nothing is submitted when it is off, which is what a checkbox does and what a button could not',
      ],
    ]),
    composition: apiRows([
      [
        'the host element',
        'any element',
        '—',
        '[slSwitch]',
        'The box is the consumer’s own — a span, a label, a list item — and the control, the pill and the label are rendered into it. Angular pays one element and React pays none, because a directive cannot create a wrapper around its own host; in exchange, formControlName, id and every aria-* a consumer writes land where a reader expects them',
      ],
      [
        'ng-content',
        'projected content',
        '—',
        '[slSwitch]',
        'The label is whatever the consumer projects, and slSwitchDescription is a directive on their own element, so a p, a span or an inline-message all work',
      ],
      [
        'exportAs',
        "'slSwitch'",
        '—',
        'a template',
        'Reaches the instance: inputElement for focus(), and toggle(), which clicks the control and reports the move as "programmatic"',
      ],
      [
        'provideSwitchDefaults()',
        '{ size, indicator, labelPlacement }',
        '—',
        'an injector',
        'The three decisions an application takes once. size is the one a field outranks, so a switch inside a field takes the field’s step',
      ],
      [
        'SlField',
        'injected, optional',
        '—',
        'inside a field',
        'What the switch reads to wire itself: the description, the four shared states, and the field’s identifier when it draws no label of its own — imported through @slotted/angular/field so one class and one injection token exist',
      ],
    ]),
    accessibility: [
      'The pattern is the WAI-ARIA APG’s Switch (w3.org/WAI/ARIA/apg/patterns/switch/), built on the third of its three reference implementations: an input[type=checkbox] with role="switch". Space toggles it, the label names it and doubles the target, name and value are submitted, form.reset() restores it, and a disabled fieldset disables it — all from the platform.',
      'aria-checked is deliberately absent. The APG states that a checkbox-based switch uses the HTML checked attribute instead, and writing both would be the state said twice by two things that can disagree.',
      'Enter is a deliberate departure. The APG lists it as optional, and inside a form Enter submits: a switch that stole the key would break the form for the sake of an optional shortcut. The cost is that a reader who expects Enter presses Space.',
      'The host carries no role, because ARIA declares the switch role Children Presentational: the label and the description would otherwise be folded into the control’s accessible name — and the name of a switch must not change when its state does, which is why the pending label is a live region rather than part of the name.',
      'aria-required, never the native required. The native attribute engages browser constraint validation and changes submit behaviour, which the library must not impose as a side effect of describing a field. disabled is native, because that is what the word means, and read-only is implemented rather than declared: the native readonly attribute does nothing at all on a checkbox.',
      'The target is at least 24 CSS pixels in both axes at every step and every density — WCAG 2.2 SC 2.5.8 — because the label carries the slack that makes one line of text that tall, and a switch written without a label states the minimum on its own row.',
      'The description is projected outside the label, so it describes the switch rather than naming it, and clicking it changes nothing.',
    ],
    snippets: [
      defineSnippet({
        id: 'switch-angular-anatomy',
        language: 'angular',
        label: 'Anatomy, as it reaches the DOM',
        source: `<span data-ui="switch" data-part="root" data-size="md" data-indicator="mark" data-checked>
  <input data-part="control" type="checkbox" role="switch" id="slotted-switch-1" checked />
  <span data-part="track"
    ><span data-part="thumb"
      ><span data-ui="icon" data-part="root" aria-hidden="true"
        ><svg data-part="glyph" data-glyph="check" aria-hidden="true"></svg></span></span
  ></span>
  <label data-part="label" for="slotted-switch-1">Cobrança automática</label>
  <p data-part="description" id="slotted-switch-2-description">Debitada no dia 5.</p>
</span>`,
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
