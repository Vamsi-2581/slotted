import { keyedProps } from '@slotted/core/selector-key';
import '@slotted/styles/inline-message/inline-message.css';

import { useId } from 'react';

import { Glyph, Icon } from '../icon';
import type { GlyphName } from '../icon';
import { useInlineMessageDefaults } from './inline-message-defaults';
import type {
  InlineMessageLive,
  InlineMessageProps,
  InlineMessageRootProps,
  InlineMessageTone,
} from './inline-message.types';

/**
 * The glyph each tone draws: `specs/components/inline-message/contract.json`
 * holds the map. Help is not a severity and draws none.
 */
const TONE_GLYPH: Record<InlineMessageTone, GlyphName | null> = {
  accent: 'circle-info',
  secondary: null,
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-alert',
};

/**
 * The two roles that announce, and the value that does not. Both roles imply
 * `aria-live` and `aria-atomic`, so the whole message is read rather than the
 * word that changed, and nothing here writes either attribute by hand.
 */
const LIVE_ROLE: Record<InlineMessageLive, string | undefined> = {
  off: undefined,
  polite: 'status',
  assertive: 'alert',
};

/**
 * One sentence about something else: a field, a section, an action. Help, an
 * error, a warning, a confirmation, or a wait.
 *
 * **The severity is a word as well as a colour.** A reader who cannot see the
 * message hears the sentence and nothing else — neither the red ink nor the
 * crossed circle reaches the accessibility tree — so the family writes the
 * severity in clipped text before the message, which is GOV.UK's answer
 * generalised to every tone and to a table an application replaces once.
 *
 * **The role goes on this element, not on an inner one.** `Alert` puts its live
 * role on the text part because it has a dismiss button beside the text, and
 * MDN's `alert` role reference is explicit that the role is for text content
 * alone. This family has no controls, so there is nothing to keep out.
 *
 * **The line can be held open.** `reserve` gives the box one line box of its own
 * leading whether or not there is a message, and the mark and the severity word
 * withdraw when there is not — so a form renders the message unconditionally
 * and never moves when the error arrives.
 */
export function InlineMessage({
  children,
  disabled,
  hideIcon = false,
  icon,
  id,
  live,
  loading = false,
  mark,
  prefix,
  ref,
  render,
  reserve = false,
  size,
  tone,
  ...nativeProps
}: InlineMessageProps) {
  const defaults = useInlineMessageDefaults();
  const generatedId = useId();

  const resolvedTone = tone ?? defaults.tone;
  const resolvedMark = mark ?? defaults.mark;
  /* The glyph the family draws when the page supplies none. A message that is
     waiting draws a ring instead, and one that asked for no mark draws none. */
  const glyph: GlyphName | null =
    loading || resolvedMark === 'none'
      ? null
      : resolvedMark === 'dot'
        ? 'dot'
        : TONE_GLYPH[resolvedTone];
  const resolvedLive = live ?? defaults.live;
  const role = LIVE_ROLE[resolvedLive];
  /* Unstated asks the table; the empty string is a consumer removing the word. */
  const word = prefix ?? defaults.prefixes[resolvedTone] ?? '';

  const rootProps: InlineMessageRootProps = keyedProps({
    ...(role === undefined ? {} : { role }),
    ...nativeProps,
    ...(loading ? { 'data-loading': '' } : {}),
    ...(disabled === true ? { 'data-disabled': '' } : {}),
    ...(reserve ? { 'data-reserve': '' } : {}),
    children: (
      <>
        {word === '' ? null : (
          <span data-part="prefix" data-part-prefix="">
            {word}
          </span>
        )}
        {hideIcon ? null : (
          <span aria-hidden="true" data-part="icon" data-part-icon="">
            {icon ??
              (glyph === null ? null : (
                <Icon>
                  <Glyph name={glyph} />
                </Icon>
              ))}
          </span>
        )}
        {/* The wrapper is the family's, not the consumer's: it is what makes
            "is there a message?" a question the stylesheet can ask, and what
            keeps a message holding a link one grid item rather than two. */}
        <span data-part="text" data-part-text="">
          {children}
        </span>
      </>
    ),
    'data-live': resolvedLive,
    'data-mark': resolvedMark,
    'data-part': 'root',
    'data-size': size ?? defaults.size,
    'data-tone': resolvedTone,
    'data-ui': 'inline-message',
    id: id ?? generatedId,
    ref,
  });

  return render === undefined ? <p {...rootProps} /> : render(rootProps);
}
