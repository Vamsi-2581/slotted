export function scenario(id: string) {
  return { slotted: { scenarioId: id } } as const;
}

export function storyScenarioIds(storyModule: Record<string, unknown>) {
  return Object.entries(storyModule)
    .filter(([name]) => name !== 'default')
    .flatMap(([, value]) => {
      if (typeof value !== 'object' || value === null) return [];
      const parameters = Reflect.get(value, 'parameters');
      const slotted =
        typeof parameters === 'object' && parameters !== null
          ? Reflect.get(parameters, 'slotted')
          : undefined;
      const id =
        typeof slotted === 'object' && slotted !== null
          ? Reflect.get(slotted, 'scenarioId')
          : undefined;
      return typeof id === 'string' ? [id] : [];
    });
}

export function scenarioCoverageErrors(
  expected: readonly string[],
  storyModule: Record<string, unknown>,
) {
  const actual = storyScenarioIds(storyModule);
  const duplicates = [
    ...new Set(
      actual.filter(
        (id) => expected.includes(id) && actual.filter((actualId) => actualId === id).length > 1,
      ),
    ),
  ];
  return [
    ...expected.filter((id) => !actual.includes(id)).map((id) => `missing ${id}`),
    ...actual.filter((id) => !expected.includes(id)).map((id) => `unknown ${id}`),
    ...duplicates.map((id) => `duplicate ${id}`),
  ];
}

interface ContractMember {
  capabilities: readonly string[];
  defaults: Record<string, boolean | number | string>;
}

/**
 * What a capability obliges a reference page to document, beyond the member's
 * own defaults — which are already required row by row below. The axes that
 * paint a family are named by its contract, not by this table, and hard-coding
 * `variant` and `fill` here made the table the authority on an axis it cannot
 * see. Button renames `fill` to `variant` and `variant` to `tone`, and both
 * still reach the page through its declared defaults.
 *
 * `appearance` asks for nothing at all, for the same reason one step further
 * on. It used to ask for `size`, which held only while every family that
 * paints itself also scales itself. Link paints three variants and takes its
 * type from the text around it, because `typography` owns the type scale — and
 * the table demanded a row for a prop the contract does not declare. A family
 * that does ship a size step still documents it, because the step is in its
 * declared defaults and every default is required row by row below.
 */
const capabilityApi = {
  appearance: [],
  arrangement: ['gap', 'align', 'justify'],
  size: ['size'],
  shape: ['shape'],
  measurement: ['value', 'max'],
  live: ['live'],
  current: ['current'],
  open: ['open'],
  /**
   * Nothing, for the reason `selection` asks for nothing: the table cannot see
   * what a family's placement *is*. An overlay places itself relative to a
   * trigger and names it `placement`; a field places its label relative to its
   * control and names it `labelPlacement`, because a field has two things that
   * could be placed and the shorter word says neither. Requiring one name here
   * made the table the authority on a prop it cannot know, and every declared
   * default is already required row by row below.
   */
  placement: [],
  status: ['status'],
  content: ['start', 'end'],
  fullWidth: ['fullWidth'],
  disabled: ['disabled'],
  loading: ['loading'],
  pressed: ['pressed'],
  orientation: ['orientation'],
  invalid: ['invalid'],
  required: ['required'],
  readOnly: ['readOnly'],
  wiring: [],
  focusable: ['focusable'],
  decorative: ['decorative'],
  underline: ['underline'],
  external: ['external'],
  activation: ['activation'],
  /**
   * Nothing, for the reason `appearance` asks for nothing: the table cannot
   * see what a family's selection *is*. Tabs selects one of a set and names it
   * `value`; a tag holds its own selection and names it `selected`. Naming one
   * of the two here made the table the authority on a prop it cannot know, and
   * the family with the other shape had to document a prop it does not have.
   * Every declared default is already required row by row below, so both
   * families still document their own.
   */
  selection: [],
  removable: ['removeLabel'],
  virtualization: ['itemCount', 'itemSize', 'overscan'],
  files: ['accept', 'files', 'maxSize', 'multiple'],
  checked: ['checked'],
  /**
   * The text a control holds. Unlike `selection` and `placement`, there is
   * nothing here the table cannot know: a family that holds a value has one
   * value, `docs/state-and-events.md` names the pair `value` and
   * `defaultValue`, and a page that documents neither has documented a control
   * a reader cannot fill in.
   */
  value: ['value', 'defaultValue'],
  revealed: ['revealed'],
  /**
   * The errors a form holds. Like `value`, there is nothing here the table
   * cannot know: `docs/state-and-events.md` names the pair, and a form page
   * that documented neither would leave a reader unable to hand a server's
   * answer back to the component that has to show it.
   */
  validity: ['errors', 'defaultErrors'],
} as const;

/** The two sides of one mutable capability, as the family contract names them. */
interface StateModelEntry {
  controlled: string;
  uncontrolled: string;
}

/**
 * `capabilityApi` guesses a prop name from a capability, and the guess is
 * wrong for every family that holds two values of the same kind or calls its
 * own by another name: pagination holds a page and a page size, and neither of
 * them is `value`; its current page is `page` where a stepper's is `step`.
 *
 * The contract already names both sides of every mutable capability, in its
 * `stateModel`, and `specs/contract.schema.mjs` refuses a mutable capability
 * that declares none. So when a caller hands the model over it is the
 * authority, and the table stays the fallback for a capability the model does
 * not name and for a family that declares no model at all.
 */
export function apiMetadataErrors(
  member: ContractMember,
  rows: readonly { name: string; defaultValue: string }[],
  stateModel?: Readonly<Record<string, StateModelEntry>> | undefined,
) {
  const errors: string[] = [];
  const names = rows.map((row) => row.name);
  const duplicates = [
    ...new Set(names.filter((name) => names.filter((candidate) => candidate === name).length > 1)),
  ];
  if (duplicates.length > 0) return duplicates.map((name) => `duplicate API ${name}`);
  for (const capability of member.capabilities) {
    const declared = stateModel?.[capability];
    const required = declared
      ? [declared.controlled, declared.uncontrolled]
      : (capabilityApi[capability as keyof typeof capabilityApi] ?? []);
    for (const name of required) {
      if (!names.includes(name)) errors.push(`missing API ${name}`);
    }
  }
  for (const [name, value] of Object.entries(member.defaults)) {
    const row = rows.find((candidate) => candidate.name === name);
    if (row === undefined) errors.push(`missing default ${name}`);
    else if (row.defaultValue !== String(value)) {
      errors.push(`default ${name}: expected ${String(value)}, received ${row.defaultValue}`);
    }
  }
  return errors;
}

/**
 * Binds the scenes a docs module declares to the stories that render them. The
 * metadata lives in the docs module so a test can read a page's
 * demonstrations without importing Storybook, and the story objects live in
 * the stories module; this is the one place the two meet, and it refuses a
 * scene with no story rather than rendering a page with a hole in it.
 */
export function bindScenes<Story>(
  scenes: readonly { id: string; title: string; note: string; snippet: unknown }[],
  stories: Record<string, Story>,
) {
  return scenes.map((scene) => {
    const story = stories[scene.id];
    if (story === undefined) throw new Error(`Scene "${scene.id}" is bound to no story`);
    return { ...scene, of: story };
  });
}
