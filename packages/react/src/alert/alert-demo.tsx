import type { ReactNode } from 'react';

/**
 * One demonstration: what it is called, what to look at, and the stage that
 * owns the distance between the examples on it. Every story composes this
 * rather than laying itself out, so no two examples can end up against each
 * other and no story reaches for an inline style.
 */
export function Scene({
  children,
  label,
  layout = 'block',
  note,
}: {
  children: ReactNode;
  label: string;
  /**
   * `block` by default: an alert is a block, and the stage layout that keeps a
   * child at its own width collapses one to nothing — a family declaring
   * `container-type: inline-size` has no intrinsic width to keep.
   */
  layout?: 'block' | 'row' | 'stack' | 'prose';
  note: ReactNode;
}) {
  return (
    <section className="slotted-demo-scene">
      <header className="slotted-demo-scene__header">
        <span className="slotted-demo-scene__label">{label}</span>
        <span className="slotted-demo-scene__note">{note}</span>
      </header>
      <div className="slotted-demo-stage" data-layout={layout}>
        {children}
      </div>
    </section>
  );
}

export function Grid({ children, columns }: { children: ReactNode; columns: 1 | 2 | 3 }) {
  return (
    <div className="slotted-demo-grid" data-columns={String(columns)}>
      {children}
    </div>
  );
}

/** A shield, for the one demonstration where the page supplies its own mark. */
export function ShieldGlyph() {
  return (
    <svg aria-hidden="true" fill="none" height="1em" viewBox="0 0 24 24" width="1em">
      <path
        d="M12 3 5 6v5.5c0 4.2 2.9 7.9 7 9.5 4.1-1.6 7-5.3 7-9.5V6l-7-3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
