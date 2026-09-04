import { useState } from 'react';
import type { ReactNode } from 'react';

/**
 * A box a layer can open inside, so a demonstration is a panel in a scene
 * rather than a full-page overlay drawn over the reference page it documents.
 *
 * `.slotted-demo-viewport` carries `contain: paint`, which makes it the
 * containing block for the `position: fixed` layer; `data-size="tall"` is the
 * height an overlay needs, added to the workbench when this family met it. The
 * `container` prop is the same one an application shell uses to name its own
 * stacking context, so nothing here is a demo-only escape hatch.
 *
 * The caption of every scene using this says so: in an application the
 * containing block is the viewport, and the layer covers the page.
 */
export function Layer({ children }: { children: (container: Element) => ReactNode }) {
  const [box, setBox] = useState<HTMLElement | null>(null);

  return (
    <div className="slotted-demo-viewport" data-size="tall" ref={setBox}>
      {box === null ? null : children(box)}
    </div>
  );
}
