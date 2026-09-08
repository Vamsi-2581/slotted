import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DismissRequest } from './dismissable-layer';
import {
  LAYER_DEPTH_PROPERTY,
  createDismissableLayer,
  createScrollLock,
  pressOrigin,
} from './dismissable-layer';

function mount(markup: string) {
  document.body.innerHTML = markup;
}

function element(id: string) {
  return document.getElementById(id) as HTMLElement;
}

function press(target: Element, type: 'pointerdown' | 'click' = 'pointerdown') {
  target.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
}

function escape(init: KeyboardEventInit = {}) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, ...init }));
}

function focusTo(target: Element) {
  target.dispatchEvent(new Event('focusin', { bubbles: true }));
}

/** Records the reason of every dismissal, which is the whole public report. */
function recorder() {
  const reasons: string[] = [];
  const onDismiss = (request: DismissRequest) => reasons.push(request.reason);
  return { reasons, onDismiss };
}

describe('createDismissableLayer', () => {
  beforeEach(() => {
    mount('');
  });

  describe('escape', () => {
    beforeEach(() => {
      mount('<div id="outer"></div><div id="inner"></div><button id="away">away</button>');
    });

    it('is answered by the topmost layer alone', () => {
      const outer = recorder();
      const inner = recorder();
      const first = createDismissableLayer(element('outer'), outer);
      const second = createDismissableLayer(element('inner'), inner);

      escape();

      expect(inner.reasons).toEqual(['escape']);
      expect(outer.reasons).toEqual([]);
      second.destroy();
      first.destroy();
    });

    it('reaches the layer below once the one above is gone', () => {
      const outer = recorder();
      const first = createDismissableLayer(element('outer'), outer);
      const second = createDismissableLayer(element('inner'), recorder());

      second.destroy();
      escape();

      expect(outer.reasons).toEqual(['escape']);
      first.destroy();
    });

    /** A held key closes one layer, not the whole stack in one press. */
    it('ignores a repeat', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('outer'), layer);

      escape({ repeat: true });

      expect(layer.reasons).toEqual([]);
      handle.destroy();
    });

    /** Escape ends an IME composition; it is not a request to close anything. */
    it('ignores a key press that is cancelling a composition', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('outer'), layer);

      escape({ isComposing: true });

      expect(layer.reasons).toEqual([]);
      handle.destroy();
    });

    it('is swallowed by a topmost layer that refuses it', () => {
      const outer = recorder();
      const first = createDismissableLayer(element('outer'), outer);
      const second = createDismissableLayer(element('inner'), { ...recorder(), escape: false });

      escape();

      expect(outer.reasons).toEqual([]);
      second.destroy();
      first.destroy();
    });
  });

  describe('outside press', () => {
    beforeEach(() => {
      mount(`
        <button id="trigger">open</button>
        <div id="parent"><button id="within">inside</button></div>
        <div id="child"></div>
        <main id="page"></main>`);
    });

    it('dismisses on a press outside the layer', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('parent'), layer);

      press(element('page'));

      expect(layer.reasons).toEqual(['outsidePress']);
      handle.destroy();
    });

    it('leaves the layer alone for a press inside it', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('parent'), layer);

      press(element('within'));

      expect(layer.reasons).toEqual([]);
      handle.destroy();
    });

    /** The trigger is the first branch: a press on it must not both dismiss and reopen. */
    it('counts a registered branch as inside', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('parent'), {
        ...layer,
        branches: [element('trigger')],
      });

      press(element('trigger'));

      expect(layer.reasons).toEqual([]);
      handle.destroy();
    });

    it('takes a branch registered after the layer opened', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('parent'), layer);
      const remove = handle.addBranch(element('trigger'));

      press(element('trigger'));
      expect(layer.reasons).toEqual([]);

      remove();
      press(element('trigger'));
      expect(layer.reasons).toEqual(['outsidePress']);
      handle.destroy();
    });

    /**
     * The rule `docs/component-features.md` §3 states: a submenu is outside its
     * parent menu in the DOM and inside it in the stack.
     */
    it('does not dismiss an ancestor layer for a press inside a descendant', () => {
      const parent = recorder();
      const child = recorder();
      const first = createDismissableLayer(element('parent'), parent);
      const second = createDismissableLayer(element('child'), child);

      press(element('child'));

      expect(parent.reasons).toEqual([]);
      expect(child.reasons).toEqual([]);
      second.destroy();
      first.destroy();
    });

    it('dismisses the descendant alone for a press inside the ancestor', () => {
      const parent = recorder();
      const child = recorder();
      const first = createDismissableLayer(element('parent'), parent);
      const second = createDismissableLayer(element('child'), child);

      press(element('within'));

      expect(child.reasons).toEqual(['outsidePress']);
      expect(parent.reasons).toEqual([]);
      second.destroy();
      first.destroy();
    });

    it('dismisses the whole stack for a press outside all of it', () => {
      const parent = recorder();
      const child = recorder();
      const first = createDismissableLayer(element('parent'), parent);
      const second = createDismissableLayer(element('child'), child);

      press(element('page'));

      expect(child.reasons).toEqual(['outsidePress']);
      expect(parent.reasons).toEqual(['outsidePress']);
      second.destroy();
      first.destroy();
    });

    /**
     * A layer that refuses to close cannot be left standing on an ancestor that
     * closed underneath it.
     */
    it('stops the cascade when a layer cancels its own dismissal', () => {
      const parent = recorder();
      const first = createDismissableLayer(element('parent'), parent);
      const second = createDismissableLayer(element('child'), {
        onDismiss: (request) => request.cancel(),
      });

      press(element('page'));

      expect(parent.reasons).toEqual([]);
      second.destroy();
      first.destroy();
    });

    it('can be turned off for one layer', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('parent'), {
        ...layer,
        outsidePress: false,
      });

      press(element('page'));

      expect(layer.reasons).toEqual([]);
      handle.destroy();
    });

    it('asks the predicate the consumer wrote which presses count', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('parent'), {
        ...layer,
        outsidePress: (target) => (target as Element).id !== 'page',
      });

      press(element('page'));
      expect(layer.reasons).toEqual([]);

      press(element('trigger'));
      expect(layer.reasons).toEqual(['outsidePress']);
      handle.destroy();
    });

    /**
     * A press that starts inside and ends outside is a selection dragged past
     * the edge. The family that wants the other answer asks for it.
     */
    it('waits for the click when the layer asked for the click', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('parent'), {
        ...layer,
        outsidePressEvent: 'click',
      });

      press(element('page'), 'pointerdown');
      expect(layer.reasons).toEqual([]);

      press(element('page'), 'click');
      expect(layer.reasons).toEqual(['outsidePress']);
      handle.destroy();
    });

    /**
     * DG1. A dialog's node is a frame — a scrim and a viewport around the
     * panel — and a press on the scrim landed inside the node, so the scrim
     * was never a way out. The frame still carries the depth and the `inert`
     * boundary; the panel is what a press is inside of.
     */
    describe('a frame around the content', () => {
      beforeEach(() => {
        mount(`
          <div id="frame">
            <div id="scrim"></div>
            <div id="viewport"><div id="panel"><button id="inside">ok</button></div></div>
          </div>
          <main id="page"></main>`);
      });

      it('reads a press on the frame as outside, and a press in the content as inside', () => {
        const layer = recorder();
        const handle = createDismissableLayer(element('frame'), {
          ...layer,
          content: element('panel'),
        });

        press(element('inside'));
        expect(layer.reasons).toEqual([]);

        press(element('scrim'));
        press(element('viewport'));
        expect(layer.reasons).toEqual(['outsidePress', 'outsidePress']);
        expect(element('frame').style.getPropertyValue(LAYER_DEPTH_PROPERTY)).toBe('0');
        handle.destroy();
      });

      /** A selection dragged out of the panel ends over the scrim, and clicks it. */
      it('ignores a click whose press began inside the content', () => {
        const layer = recorder();
        const handle = createDismissableLayer(element('frame'), {
          ...layer,
          content: element('panel'),
          outsidePressEvent: 'click',
        });

        press(element('inside'), 'pointerdown');
        press(element('scrim'), 'click');
        expect(layer.reasons).toEqual([]);

        press(element('scrim'), 'pointerdown');
        press(element('scrim'), 'click');
        expect(layer.reasons).toEqual(['outsidePress']);
        handle.destroy();
      });

      it('forgets where the pointer went down once a key is pressed', () => {
        const layer = recorder();
        const handle = createDismissableLayer(element('frame'), {
          ...layer,
          content: element('panel'),
          outsidePressEvent: 'click',
        });

        press(element('inside'), 'pointerdown');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        press(element('page'), 'click');
        expect(layer.reasons).toEqual(['outsidePress']);
        handle.destroy();
      });
    });
  });

  describe('focus leaving the layer', () => {
    beforeEach(() => {
      mount('<div id="parent"><button id="within"></button></div><button id="away"></button>');
    });

    it('is not a dismissal unless the layer asked for it', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('parent'), layer);

      focusTo(element('away'));

      expect(layer.reasons).toEqual([]);
      handle.destroy();
    });

    it('dismisses with the blur reason when it is asked for', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('parent'), {
        ...layer,
        focusOutside: true,
      });

      focusTo(element('within'));
      expect(layer.reasons).toEqual([]);

      focusTo(element('away'));
      expect(layer.reasons).toEqual(['blur']);
      handle.destroy();
    });
  });

  describe('the stack', () => {
    beforeEach(() => {
      mount('<div id="a"></div><div id="b"></div><div id="c"></div>');
    });

    it('writes each layer its depth, and reindexes when one leaves', () => {
      const first = createDismissableLayer(element('a'), recorder());
      const second = createDismissableLayer(element('b'), recorder());
      const third = createDismissableLayer(element('c'), recorder());

      expect(element('a').style.getPropertyValue(LAYER_DEPTH_PROPERTY)).toBe('0');
      expect(element('c').style.getPropertyValue(LAYER_DEPTH_PROPERTY)).toBe('2');
      expect(third.depth).toBe(2);
      expect(third.topmost).toBe(true);
      expect(first.topmost).toBe(false);

      second.destroy();
      expect(element('c').style.getPropertyValue(LAYER_DEPTH_PROPERTY)).toBe('1');
      expect(third.depth).toBe(1);

      third.destroy();
      first.destroy();
      expect(element('a').style.getPropertyValue(LAYER_DEPTH_PROPERTY)).toBe('');
    });

    it('dismisses on demand, with the programmatic reason', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('a'), layer);

      handle.dismiss();

      expect(layer.reasons).toEqual(['programmatic']);
      handle.destroy();
    });

    it('answers nothing once it is destroyed', () => {
      const layer = recorder();
      const handle = createDismissableLayer(element('a'), layer);

      handle.destroy();
      escape();
      press(element('b'));

      expect(layer.reasons).toEqual([]);
    });
  });

  describe('a modal layer', () => {
    beforeEach(() => {
      mount('<main id="page"></main><aside id="side"></aside><div id="layer"></div>');
    });

    it('makes every sibling inert, and gives them back', () => {
      const handle = createDismissableLayer(element('layer'), {
        ...recorder(),
        modal: true,
      });

      expect(element('page').hasAttribute('inert')).toBe(true);
      expect(element('side').hasAttribute('inert')).toBe(true);
      expect(element('layer').hasAttribute('inert')).toBe(false);

      handle.destroy();
      expect(element('page').hasAttribute('inert')).toBe(false);
      expect(element('side').hasAttribute('inert')).toBe(false);
    });

    it('leaves an element that was already inert as it found it', () => {
      element('side').setAttribute('inert', '');
      const handle = createDismissableLayer(element('layer'), {
        ...recorder(),
        modal: true,
      });

      handle.destroy();
      expect(element('side').hasAttribute('inert')).toBe(true);
    });

    it('locks the scroll, and unlocks it', () => {
      const handle = createDismissableLayer(element('layer'), {
        ...recorder(),
        modal: true,
      });

      expect(document.body.style.overflow).toBe('hidden');
      handle.destroy();
      expect(document.body.style.overflow).toBe('');
    });

    it('locks nothing when the layer asks it not to', () => {
      const handle = createDismissableLayer(element('layer'), {
        ...recorder(),
        modal: true,
        scrollLock: false,
      });

      expect(document.body.style.overflow).toBe('');
      handle.destroy();
    });
  });
});

/**
 * The same record read from the other side. A control that loses focus during a
 * press gets `relatedTarget: null` and cannot tell the reader leaving from the
 * reader pressing something of its own (CB11).
 */
describe('pressOrigin', () => {
  beforeEach(() => {
    mount('<div id="frame"><button id="inside"></button></div><button id="page"></button>');
  });

  it('reports nothing while no layer is open', () => {
    press(element('inside'));
    expect(pressOrigin(document)).toBeNull();
  });

  it('names where the press in flight went down, and forgets it at the click', () => {
    const layer = recorder();
    const handle = createDismissableLayer(element('frame'), { ...layer, outsidePress: false });

    press(element('inside'), 'pointerdown');
    expect(pressOrigin(document)).toBe(element('inside'));

    press(element('inside'), 'click');
    expect(pressOrigin(document)).toBeNull();
    handle.destroy();
  });

  it('names a press that went down outside just as plainly', () => {
    const layer = recorder();
    const handle = createDismissableLayer(element('frame'), { ...layer, outsidePress: false });

    press(element('page'), 'pointerdown');
    expect(pressOrigin(document)).toBe(element('page'));
    handle.destroy();
  });

  it('falls back to the ambient document', () => {
    const layer = recorder();
    const handle = createDismissableLayer(element('frame'), { ...layer, outsidePress: false });

    press(element('inside'), 'pointerdown');
    expect(pressOrigin()).toBe(element('inside'));
    handle.destroy();
  });
});

describe('createScrollLock', () => {
  beforeEach(() => {
    document.body.removeAttribute('style');
  });

  it('holds the lock until the last holder releases it', () => {
    const first = createScrollLock();
    const second = createScrollLock();

    first.release();
    expect(document.body.style.overflow).toBe('hidden');

    second.release();
    expect(document.body.style.overflow).toBe('');
  });

  it('releases once however many times it is called', () => {
    const first = createScrollLock();
    const second = createScrollLock();

    first.release();
    first.release();
    expect(document.body.style.overflow).toBe('hidden');

    second.release();
    expect(document.body.style.overflow).toBe('');
  });

  /**
   * The failure a counter without recorded originals produces: released out of
   * order, the page keeps an `overflow` nobody asked for.
   */
  it('gives back the inline styles it found, whatever order the locks release in', () => {
    document.body.style.overflow = 'auto';
    document.body.style.paddingInlineEnd = '8px';

    const first = createScrollLock();
    const second = createScrollLock();
    second.release();
    first.release();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.paddingInlineEnd).toBe('8px');
  });

  it('compensates the scrollbar the lock takes away', () => {
    const clientWidth = vi
      .spyOn(document.documentElement, 'clientWidth', 'get')
      .mockReturnValue(window.innerWidth - 15);

    const lock = createScrollLock();
    expect(document.body.style.paddingInlineEnd).toBe('15px');

    lock.release();
    expect(document.body.style.paddingInlineEnd).toBe('');
    clientWidth.mockRestore();
  });

  it('adds no padding where the document reports no width to lose', () => {
    const lock = createScrollLock();

    expect(document.body.style.paddingInlineEnd).toBe('');
    lock.release();
  });
});
