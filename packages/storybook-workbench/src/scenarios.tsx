export function scenario(id: string) {
  return { slotted: { scenarioId: id } } as const;
}

/** The scenario a story declares through `scenario()`, or nothing. */
function scenarioIdOf(value: unknown) {
  if (typeof value !== 'object' || value === null) return undefined;
  const parameters = Reflect.get(value, 'parameters');
  const slotted =
    typeof parameters === 'object' && parameters !== null
      ? Reflect.get(parameters, 'slotted')
      : undefined;
  const id =
    typeof slotted === 'object' && slotted !== null
      ? Reflect.get(slotted, 'scenarioId')
      : undefined;
  return typeof id === 'string' ? id : undefined;
}

export function storyScenarioIds(storyModule: Record<string, unknown>) {
  return Object.entries(storyModule)
    .filter(([name]) => name !== 'default')
    .flatMap(([, value]) => {
      const id = scenarioIdOf(value);
      return id === undefined ? [] : [id];
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
  /**
   * Nothing, for the reason `appearance` and `placement` ask for nothing: the
   * table cannot see what a family's arrangement *is*. `stack` arranges
   * children along one axis and names the distance between them `gap`;
   * `description-list` arranges pairs into columns and names them `layout` and
   * `columns`, and declined an alignment axis in writing — so the table
   * demanded three rows for props the contract does not declare, and the
   * family that had the other shape would have had to document props it does
   * not have. A family that does ship `gap`, `align` or `justify` still
   * documents each one, because it is in its declared defaults and every
   * default is required row by row below.
   */
  arrangement: [],
  size: ['size'],
  shape: ['shape'],
  measurement: ['value', 'max'],
  /**
   * Nothing, for the reason `content` asks for nothing. `alert` names the axis
   * `live` because the box itself becomes a live region; `toast` names it
   * `priority`, per message, because the box deliberately never becomes one and
   * a prop called `live` would say the opposite of what the family does.
   */
  live: [],
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
  /**
   * Nothing, for the reason `appearance` and `arrangement` ask for nothing: the
   * table cannot see what a family's content *is*. A control has something
   * before its label and something after it, and names them `start` and `end`;
   * a message has a name and a sentence, and names them `title` and
   * `description`. Requiring the first pair made the table the authority on
   * slots the second family does not have — `toast` would have had to document
   * two props it never accepts — and every declared default is already
   * required row by row below.
   */
  content: [],
  fullWidth: ['fullWidth'],
  disabled: ['disabled'],
  loading: ['loading'],
  pressed: ['pressed'],
  orientation: ['orientation'],
  invalid: ['invalid'],
  required: ['required'],
  readOnly: ['readOnly'],
  wiring: [],
  /**
   * Nothing, for the same reason. A family that lets a consumer decide whether
   * a part can hold focus ships `focusable` and documents it as a declared
   * default; one whose parts are always reachable — `toast`, whose region and
   * messages carry `tabindex="-1"` so a hotkey has somewhere to land — has no
   * such prop, and the table cannot tell the two apart.
   */
  focusable: [],
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
  /**
   * Nothing, for the reason `selection` and `placement` ask for nothing: the
   * table cannot see what a family calls the control that takes an item away.
   * A chip is removed and names its label `removeLabel`; a tab is dismissed —
   * the APG's own word for closing one — and names it `dismissLabel`. Naming
   * one of the two here made the table the authority on a prop it cannot know,
   * and the family with the other word had to document a prop it does not have.
   * Every declared default is still required row by row below.
   */
  removable: [],
  /**
   * The row height and the buffer, and not the count. `itemCount` was a prop of
   * `virtual-list`, the family `docs/build-order.md` retired in wave 6 when
   * windowing became a capability of the collection engine: a family that
   * windows now holds a collection and the count is the collection's, so the
   * table demanded a prop no such family can declare.
   */
  virtualization: ['itemSize', 'overscan'],
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
 *
 * `stories` is either the stories module itself or a table keyed by scene id.
 * A key wins where one exists, and a story that declares the scene through
 * `scenario()` answers where none does — so a table that has fallen a scene
 * behind still binds, and a page is not blown up by a name nobody kept in step.
 * That is not a convenience: the table was hand-written, `scenarioCoverageErrors`
 * already proved the story existed, and the only thing left to get wrong was
 * the copy. A whole reference page failed to render over one missing line, and
 * every test passed.
 *
 * The scene type is generic so that it survives. Declaring the parameter as
 * `{ snippet: unknown }` widened every scene's snippet to `unknown` on the way
 * out, and the result was then assignable to nothing — which is why forty
 * stories files ended a call to this function with `as never`. A cast is not a
 * convention; it is a defect wearing one, and every one of those files was
 * silently opting out of the check that the scene it bound is the scene the
 * page declares.
 */
export function bindScenes<
  Scene extends { id: string; title: string; note: string; snippet: unknown },
  Story,
>(scenes: readonly Scene[], stories: Record<string, Story>): (Scene & { of: Story })[] {
  const declared = new Map<string, Story>();
  for (const [name, story] of Object.entries(stories)) {
    if (name === 'default') continue;
    const id = scenarioIdOf(story);
    if (id !== undefined && !declared.has(id)) declared.set(id, story);
  }

  return scenes.map((scene) => {
    const story = stories[scene.id] ?? declared.get(scene.id);
    if (story === undefined) throw new Error(`Scene "${scene.id}" is bound to no story`);
    return { ...scene, of: story };
  });
}
