import { inject, Injectable, InjectionToken } from '@angular/core';

/** Which of the five semantic colours the tag speaks in. */
export type TagTone = 'accent' | 'secondary' | 'success' | 'warning' | 'danger';

/** How that colour is painted. `soft` is the tinted chip a tag usually is. */
export type TagVariant = 'solid' | 'soft' | 'outline';

export type TagSize = 'sm' | 'md' | 'lg';

export type TagShape = 'pill' | 'square';

export type TagOrientation = 'horizontal' | 'vertical';

/**
 * The word the remove control announces before the tag's own label. A constant
 * rather than a string built inside the component, because the only
 * translation layer this library has today is the consumer's — the token below,
 * or an input on the tag.
 */
export const TAG_REMOVE_LABEL = 'Remove';

export interface TagDefaults {
  removeLabel: string;
  shape: TagShape;
  size: TagSize;
  tone: TagTone;
  variant: TagVariant;
}

const FALLBACK: TagDefaults = {
  removeLabel: TAG_REMOVE_LABEL,
  shape: 'pill',
  size: 'md',
  tone: 'secondary',
  variant: 'soft',
};

export const TAG_DEFAULTS = new InjectionToken<TagDefaults>('slotted tag defaults', {
  providedIn: 'root',
  factory: () => FALLBACK,
});

/**
 * An application decides once how its tags are painted, how large they are and
 * what its remove controls are called, rather than repeating five inputs on
 * every chip in a filter bar. A tag that states any of them itself still wins:
 * an explicit input is never overridden by the token.
 */
export function provideTagDefaults(defaults: Partial<TagDefaults>) {
  return {
    provide: TAG_DEFAULTS,
    useFactory: (): TagDefaults => ({
      removeLabel: defaults.removeLabel ?? FALLBACK.removeLabel,
      shape: defaults.shape ?? FALLBACK.shape,
      size: defaults.size ?? FALLBACK.size,
      tone: defaults.tone ?? FALLBACK.tone,
      variant: defaults.variant ?? FALLBACK.variant,
    }),
  };
}

/** What a tag renders as here, before it states anything of its own. */
export function injectTagDefaults(): TagDefaults {
  return inject(TAG_DEFAULTS);
}

/**
 * Application-scoped rather than module-scoped, for the reason the field
 * primitive records: a module-level counter produces colliding sequences when
 * two applications render in one server process, and the server and the client
 * sequences must match for hydration.
 */
@Injectable({ providedIn: 'root' })
export class SlTagIdFactory {
  private count = 0;

  next() {
    this.count += 1;
    return `slotted-tag-${this.count}`;
  }
}
