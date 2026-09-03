/**
 * What a shortcut is made of, resolved once for both bindings.
 *
 * Four decisions live here, and every one of them would otherwise be taken
 * twice — once in React and once in Angular — with no test able to prove the
 * two copies agree:
 *
 * 1. which key a token names on the reader's platform;
 * 2. which word a screen reader hears in place of a symbol;
 * 3. what order the modifiers are written in;
 * 4. what, if anything, is drawn between two keys.
 *
 * Nothing here touches the DOM or a framework, and nothing here binds a key.
 * Registering a shortcut is the application's, because WCAG 2.2 2.1.4
 * Character Key Shortcuts can only be answered by whoever knows whether the
 * shortcut can be turned off.
 */

export type KbdPlatform = 'mac' | 'windows' | 'linux' | 'other';

/** `auto` asks the runtime; everything else states the answer. */
export type KbdPlatformInput = 'auto' | KbdPlatform;

export interface ResolvedKey {
  /** The canonical token, or `undefined` for a key the vocabulary does not hold. */
  token: string | undefined;
  /** What the eye sees. */
  legend: string;
  /**
   * What a reader hears, or `undefined` when the legend is already the word.
   * A key in the vocabulary always carries one: `⌘` is U+2318 PLACE OF INTEREST
   * SIGN, and `Ctrl` is an abbreviation whose pronunciation belongs to the
   * screen reader's dictionary rather than to this library.
   */
  name: string | undefined;
  /**
   * Whether the legend is a mark rather than a word — `⌘`, `↑`, `+`.
   *
   * It is resolved here rather than guessed by a stylesheet because it decides
   * two things a stylesheet cannot see: a mark is set in the interface face
   * rather than the monospaced one, whose symbol coverage is incidental to why
   * it was chosen; and a mark is not trimmed to the cap and the baseline,
   * because those are Latin metrics and a mark has no relation to either.
   */
  symbolic: boolean;
}

export interface ResolvedShortcut {
  /** The platform the legends were drawn for, so the DOM can say which. */
  platform: KbdPlatform;
  /** One entry per step of a sequence; each holds the keys pressed together. */
  steps: ResolvedKey[][];
  /** Between two simultaneous keys. Empty on a Mac, which joins with nothing. */
  separator: string;
  /** Between two steps of a sequence. Read aloud, because it is what makes a sequence one. */
  thenLabel: string;
}

export interface KeyOptions {
  platform: KbdPlatform;
  /** Replaces what the eye sees, per token. `{ ctrl: 'Strg' }`. */
  legends?: Readonly<Record<string, string>> | undefined;
  /** Replaces what the ear gets, per token. `{ ctrl: 'Steuerung' }`. */
  names?: Readonly<Record<string, string>> | undefined;
}

export interface ShortcutOptions extends KeyOptions {
  separator?: string | undefined;
  thenLabel?: string | undefined;
}

/** A legend or a name, stated per platform where the platforms disagree. */
interface PerPlatform {
  default: string;
  mac?: string;
  windows?: string;
  linux?: string;
}

interface KeyDefinition {
  legend: PerPlatform;
  name: PerPlatform;
  /**
   * Where the key sits among the modifiers, per platform. Absent for a key
   * that is not a modifier, which keeps the order it was written in.
   */
  order?: { mac: number; other: number };
}

const ARROWS: Record<string, [string, string]> = {
  up: ['↑', 'Up arrow'],
  down: ['↓', 'Down arrow'],
  left: ['←', 'Left arrow'],
  right: ['→', 'Right arrow'],
};

/**
 * The vocabulary. Legends follow the platform each one belongs to: Apple's
 * symbols on a Mac, Microsoft's words on Windows, and the word everywhere the
 * platform has no opinion.
 *
 * `mod` and `meta` are two keys and not one. `mod` is whichever key the
 * platform accelerates with — ⌘ on a Mac and Ctrl everywhere else — and `meta`
 * is the physical Meta key, which is ⌘ on a Mac, the Windows key on Windows and
 * Super on a free desktop. Nuxt's `useKbd` is the only surveyed implementation
 * that resolves a modifier at all, and it holds one entry for both meanings, so
 * the same string tells a Windows reader to press ⌘ or a Mac reader to press the
 * Windows key depending on which meaning the author had.
 */
const KEYS: Readonly<Record<string, KeyDefinition>> = {
  mod: {
    legend: { default: 'Ctrl', mac: '⌘' },
    name: { default: 'Control', mac: 'Command' },
    order: { mac: 4, other: 2 },
  },
  meta: {
    legend: { default: 'Meta', mac: '⌘', windows: 'Win', linux: 'Super' },
    name: { default: 'Meta', mac: 'Command', windows: 'Windows', linux: 'Super' },
    order: { mac: 4, other: 1 },
  },
  ctrl: {
    legend: { default: 'Ctrl', mac: '⌃' },
    name: { default: 'Control' },
    order: { mac: 1, other: 2 },
  },
  alt: {
    legend: { default: 'Alt', mac: '⌥' },
    name: { default: 'Alt', mac: 'Option' },
    order: { mac: 2, other: 3 },
  },
  shift: {
    legend: { default: 'Shift', mac: '⇧' },
    name: { default: 'Shift' },
    order: { mac: 3, other: 4 },
  },
  /**
   * First on both platforms. It is a hardware key rather than an accelerator,
   * so it is written where a keyboard puts it — outside everything else.
   */
  fn: {
    legend: { default: 'Fn', mac: 'fn' },
    name: { default: 'Function' },
    order: { mac: 0, other: 0 },
  },

  enter: { legend: { default: 'Enter', mac: '↩' }, name: { default: 'Enter', mac: 'Return' } },
  escape: { legend: { default: 'Esc' }, name: { default: 'Escape' } },
  tab: { legend: { default: 'Tab', mac: '⇥' }, name: { default: 'Tab' } },
  /**
   * The word on every platform. `␣` is the Unicode open box, and a cap holding
   * one is a cap nobody can read at eleven pixels — the only legend in the
   * vocabulary where the symbol is less legible than the word it replaces.
   */
  space: { legend: { default: 'Space' }, name: { default: 'Space' } },
  backspace: {
    legend: { default: 'Backspace', mac: '⌫' },
    name: { default: 'Backspace', mac: 'Delete' },
  },
  delete: {
    legend: { default: 'Del', mac: '⌦' },
    name: { default: 'Delete', mac: 'Forward delete' },
  },
  capslock: { legend: { default: 'Caps Lock', mac: '⇪' }, name: { default: 'Caps lock' } },
  pageup: { legend: { default: 'Page Up', mac: '⇞' }, name: { default: 'Page up' } },
  pagedown: { legend: { default: 'Page Down', mac: '⇟' }, name: { default: 'Page down' } },
  home: { legend: { default: 'Home', mac: '↖' }, name: { default: 'Home' } },
  end: { legend: { default: 'End', mac: '↘' }, name: { default: 'End' } },
  /** The escape hatch for a literal plus, which is what the grammar splits on. */
  plus: { legend: { default: '+' }, name: { default: 'Plus' } },

  ...Object.fromEntries(
    Object.entries(ARROWS).map(([token, [legend, name]]) => [
      token,
      { legend: { default: legend }, name: { default: name } },
    ]),
  ),
};

/** The names the field already writes, mapped onto the canonical token. */
const ALIASES: Readonly<Record<string, string>> = {
  cmd: 'meta',
  command: 'meta',
  win: 'meta',
  windows: 'meta',
  super: 'meta',
  control: 'ctrl',
  option: 'alt',
  opt: 'alt',
  return: 'enter',
  esc: 'escape',
  del: 'delete',
  bksp: 'backspace',
  caps: 'capslock',
  spacebar: 'space',
  pgup: 'pageup',
  pgdn: 'pagedown',
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
};

export const KBD_KEYS: readonly string[] = Object.freeze(Object.keys(KEYS));

const FUNCTION_KEY = /^f([1-9]|1\d|2[0-4])$/;
const SINGLE_LETTER = /^\p{Letter}$/u;
const WORDLIKE = /[\p{Letter}\p{Number}]/u;

function pick(value: PerPlatform, platform: KbdPlatform) {
  return value[platform as 'mac' | 'windows' | 'linux'] ?? value.default;
}

/**
 * Which platform's keyboard the reader has.
 *
 * `userAgentData.platform` is the declared answer and `navigator.platform` the
 * legacy one, and the absence of both is answered `other` rather than guessed.
 * That is what lets the server and the first client render agree: Nuxt resolves
 * this in `onMounted`, so a server-rendered `Ctrl` becomes `⌘` under the reader
 * after hydration. An application that knows its audience states the platform
 * instead and nothing is detected at all.
 */
export function resolvePlatform(input: KbdPlatformInput = 'auto'): KbdPlatform {
  if (input !== 'auto') return input;
  if (typeof navigator === 'undefined' || navigator === null) return 'other';

  const declared = (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform;
  const platform =
    typeof declared === 'string' && declared.length > 0 ? declared : (navigator.platform ?? '');

  /* iPadOS reports `MacIntel`, an iPhone reports `iPhone`, and both take ⌘. */
  if (/mac|iphone|ipad|ipod/i.test(platform)) return 'mac';
  if (/win/i.test(platform)) return 'windows';
  if (/linux|x11|cros|android/i.test(platform)) return 'linux';
  return 'other';
}

/**
 * The steps of a shortcut, each holding the tokens pressed together.
 *
 * `+` joins simultaneous keys and whitespace joins sequential steps, which is
 * how Gmail, Linear and GitHub write the sequences none of the surveyed
 * implementations can express. An empty token is dropped rather than read as a
 * key, so `mod++k` never has to be understood: the literal plus is `plus`.
 */
export function parseShortcut(keys: string): string[][] {
  return keys
    .trim()
    .split(/\s+/)
    .filter((step) => step.length > 0)
    .map((step) => step.split('+').filter((token) => token.length > 0))
    .filter((step) => step.length > 0);
}

export function resolveKey(token: string, options: KeyOptions): ResolvedKey {
  const lower = token.toLowerCase();
  const canonical = lower in KEYS ? lower : ALIASES[lower];
  const definition = canonical === undefined ? undefined : KEYS[canonical];

  if (canonical === undefined || definition === undefined) {
    /* A function key is a word already; there is no other word to say. */
    if (FUNCTION_KEY.test(lower)) {
      return { token: undefined, legend: lower.toUpperCase(), name: undefined, symbolic: false };
    }
    /* Apple and Microsoft both write the letter of a shortcut in upper case. */
    const legend = SINGLE_LETTER.test(token) ? token.toUpperCase() : token;
    return { token: undefined, legend, name: undefined, symbolic: !WORDLIKE.test(legend) };
  }

  const legend = options.legends?.[canonical] ?? pick(definition.legend, options.platform);

  return {
    token: canonical,
    legend,
    name: options.names?.[canonical] ?? pick(definition.name, options.platform),
    symbolic: !WORDLIKE.test(legend),
  };
}

function rank(token: string | undefined, platform: KbdPlatform) {
  if (token === undefined) return Number.MAX_SAFE_INTEGER;
  const order = KEYS[token]?.order;
  if (order === undefined) return Number.MAX_SAFE_INTEGER;
  return platform === 'mac' ? order.mac : order.other;
}

/**
 * A whole shortcut, in the order and the joining its platform uses.
 *
 * The reordering is the part no surveyed implementation does, and it is why one
 * authored string can be right on both platforms: the Apple Style Guide writes
 * Fn, Control, Option, Shift, Command, and Microsoft writes the Windows key
 * ahead of Ctrl, Alt and Shift. Keys that are not modifiers keep the order they
 * were written in, which is what makes a two-key chord readable.
 *
 * The escape hatch is composition rather than a fifth option: a shortcut whose
 * keys are authored one by one is rendered exactly as written.
 */
export function resolveShortcut(keys: string, options: ShortcutOptions): ResolvedShortcut {
  const { platform } = options;

  const steps = parseShortcut(keys).map((step) =>
    step
      .map((token, index) => ({ key: resolveKey(token, options), index }))
      .sort((a, b) => {
        const difference = rank(a.key.token, platform) - rank(b.key.token, platform);
        return difference === 0 ? a.index - b.index : difference;
      })
      .map(({ key }) => key),
  );

  return {
    platform,
    steps,
    /* macOS writes ⌘⇧K with nothing between the keys; Windows writes Ctrl+Shift+K. */
    separator: platform === 'mac' ? '' : (options.separator ?? '+'),
    thenLabel: options.thenLabel ?? 'then',
  };
}
