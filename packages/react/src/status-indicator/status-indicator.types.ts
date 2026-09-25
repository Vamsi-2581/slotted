import type { ComponentPropsWithRef, HTMLAttributes, ReactNode } from 'react';

/**
 * The six operational states. The vocabulary is closed, and that is a decision
 * rather than an omission: a seventh value would carry no tone, no glyph and
 * no fallback word, which are the three things this family exists to supply.
 * A product with a domain status of its own maps it onto one of these and
 * writes its own word beside it.
 */
export type StatusIndicatorStatus =
  'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'unknown';

/** The compact mark, and the one that says the status without colour. */
export type StatusIndicatorMark = 'dot' | 'icon';
export type StatusIndicatorSize = 'sm' | 'md' | 'lg';
export type StatusIndicatorLive = 'off' | 'polite' | 'assertive';

/** What a reader hears when the page showed no words. Replaceable per status. */
export type StatusIndicatorLabels = Partial<Record<StatusIndicatorStatus, string>>;

/**
 * What every status in an application looks like, and what it is called,
 * before any one of them states anything of its own. The wording belongs here
 * more than anywhere else: it is the same six words on every page, in the
 * language the application ships, and a team should decide it once.
 */
export interface StatusIndicatorDefaults {
  labels?: StatusIndicatorLabels | undefined;
  live?: StatusIndicatorLive | undefined;
  mark?: StatusIndicatorMark | undefined;
  size?: StatusIndicatorSize | undefined;
}

export interface StatusIndicatorDefaultsProviderProps extends StatusIndicatorDefaults {
  children?: ReactNode;
}

/**
 * What `render` receives. It names the family's own attributes over the native
 * ones every element shares; `ref` is not named because the element the
 * consumer renders decides its own type, and React passes it through the same
 * spread either way — the shape `badge` settled on for the same question.
 */
export interface StatusIndicatorRootProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  'data-mark': StatusIndicatorMark;
  'data-part': string;
  'data-pulse': true | undefined;
  'data-size': StatusIndicatorSize;
  'data-status': StatusIndicatorStatus;
  'data-ui': string;
}

export interface StatusIndicatorProps extends ComponentPropsWithRef<'span'> {
  /**
   * The words a reader sees. They are also the accessible name: a status that
   * shows its own words needs no second copy of them.
   */
  children?: ReactNode;
  /**
   * What a reader hears when there are no visible words. Ignored when there
   * are, because naming an element twice is how a screen reader comes to read
   * “Success Healthy”. Falls back to the provider's table, then to the
   * family's own.
   */
  label?: string;
  /**
   * Whether a change of status is announced, and how loudly. `off` by default:
   * a status that was already on the page when it loaded is not news, and
   * Shoelace — which makes every badge a live region — announces text nobody
   * changed.
   */
  live?: StatusIndicatorLive;
  /**
   * `dot` is the compact mark and `icon` is the one that carries the status
   * without colour, which is what WCAG 2.2 1.4.1 asks for wherever a product
   * cannot spare the room for words.
   */
  mark?: StatusIndicatorMark;
  /**
   * A wave leaving the dot, for a change happening now. An icon mark does not
   * pulse, and the wave is withdrawn under reduced motion and under forced
   * colours, so nothing is ever said by the wave alone.
   */
  pulse?: boolean;
  render?: (props: StatusIndicatorRootProps) => ReactNode;
  size?: StatusIndicatorSize;
  status?: StatusIndicatorStatus;
}
