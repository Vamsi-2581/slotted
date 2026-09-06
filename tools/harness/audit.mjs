import { fileURLToPath } from 'node:url';

import { launch } from './shoot.mjs';

/**
 * Measures a rendered page and reports the three failures a screenshot shows
 * and no offline test can: an element that collapsed to a sliver, content that
 * ran outside the box that owns it, and a mark that sits off the axis of the
 * text it annotates.
 *
 * All three are read as geometry rather than as causes. A demonstration
 * standing eighteen pixels wide inside a nine-hundred-pixel stage is broken
 * whether it collapsed because it answers its own width, because a flex item
 * shrank past its content, or because a column count halved the page twice
 * over. Naming the symptom is what makes the guard hold for the next cause
 * nobody predicted.
 *
 * ── What the page does, and what this file does ────────────────────────────
 *
 * The page measures and this file judges. Everything below `MEASURE` is a pure
 * function over records, so every rule the audit applies can be tested without
 * a browser — which is what three sessions of false findings cost before it
 * was split this way (G5, G7, G10). A rule that only exists inside a string
 * evaluated in Chrome is a rule nobody can put a case to.
 */

/** Below this, an element is a sliver rather than a demonstration. */
const COLLAPSE_FLOOR = 96;

/** A stage narrower than this has no room to collapse anything meaningfully. */
const STAGE_MINIMUM = 320;

/** Overflow under this is a rounding artefact, not content leaving its box. */
const OVERFLOW_TOLERANCE = 2;

/**
 * How far a mark's centre may sit from the centre of the line it annotates.
 *
 * A font's ascent and descent are not symmetrical, so a mark centred perfectly
 * on its line box still measures a quarter of a pixel from the middle of the
 * glyphs beside it. One pixel is above that floor and below anything a reader
 * would call aligned.
 *
 * The defect this catches was found by eye, three times, in three reviews, and
 * measured once: `block-size: 1lh` on a mark resolves against the *mark's own*
 * line-height, so a mark inside an element that left its line box at `normal`
 * stood 15 pixels tall beside a 19.5-pixel line and sat two pixels high. The
 * cure is structural — one line box, stated on the element the cells inherit
 * from — and this is what stops the next family from rediscovering it by eye.
 */
const AXIS_TOLERANCE = 1;

/**
 * Elements that never draw anything, whatever the stylesheet says about them.
 *
 * A harness fragment carries its own `script` and `style` where a scene needs
 * them, and both are children of the stage. Measured as demonstrations they are
 * nought pixels wide inside a 446-pixel stage, which is the shape of the worst
 * defect the collapse rule exists to catch — so the audit reported ninety of
 * them across the families and every one of them was the tool talking to itself
 * (G5).
 */
export const UNRENDERED_TAGS = new Set([
  'script',
  'style',
  'template',
  'link',
  'meta',
  'title',
  'noscript',
]);

/**
 * The stage children that collapsed to a sliver.
 *
 * The walk is here rather than in the page because two of its three rules are
 * about what an element *is* rather than about how wide it is, and both were
 * got wrong while they lived in a string:
 *
 * **An element that draws nothing is not a demonstration.** `script` and
 * `style` sit in a stage because the fragment put them there (G5).
 *
 * **An element with no box of its own is not a demonstration either — its
 * children are.** `display: contents` makes an element a wrapper the layout
 * does not see, so it measures nought however wide its content is, and the tag
 * group measured 0px in every scheme while the capture plainly showed the tags
 * (TG1). The walk descends through it and judges what it actually drew.
 */
export function collapsedElements(candidates, floor = COLLAPSE_FLOOR) {
  const found = [];

  const visit = (node) => {
    if (UNRENDERED_TAGS.has(node.tag)) return;
    if (node.boxes === 0) {
      for (const child of node.children ?? []) visit(child);
      return;
    }
    if (node.width < floor) {
      found.push({
        scene: node.scene,
        element: node.element,
        width: Math.round(node.width),
        stage: Math.round(node.stage),
      });
    }
  };

  for (const candidate of candidates) visit(candidate);
  return found;
}

/**
 * The largest amount a square of `width` × `height` can gain on the inline axis
 * by being turned about its centre: its diagonal, less the width it started at.
 *
 * A rotation moves no layout and changes no box, but the *bounding* box of a
 * turned element is its diagonal, and scrollable overflow is measured from
 * bounding boxes. So a fourteen-pixel ring inside a fourteen-pixel slot reports
 * up to twenty pixels of content, and the audit called it overflow every time a
 * button was photographed mid-spin (G10).
 */
export function turningExcess({ width, height }) {
  return Math.sqrt(width * width + height * height) - width;
}

/**
 * The elements whose content ran outside them.
 *
 * A finding is withdrawn when the whole of it fits inside what a turning
 * descendant can add: the ring is the same size it was laid out at, and the
 * pixels the audit is looking at belong to the corner of a square that is
 * halfway round. Overflow larger than that is content, and is still reported —
 * a slot holding both a spinner and something genuinely too wide keeps its
 * finding.
 */
export function overflowingElements(candidates, tolerance = OVERFLOW_TOLERANCE) {
  return candidates
    .filter((node) => node.scrollWidth > node.clientWidth + tolerance)
    .filter((node) => node.scrollWidth - node.clientWidth > (node.turning ?? 0))
    .map((node) => ({
      scene: node.scene,
      element: node.element,
      width: node.scrollWidth,
      stage: node.clientWidth,
    }));
}

/**
 * Whether a mark stands beside the line it was paired with, rather than above
 * or below it.
 *
 * A glyph on a row of its own — `result-state` puts one over its title by
 * design — has no axis to miss: it is aligned to a block, and the question the
 * audit asks about a mark is a question about a line. Two boxes that share no
 * band of the page share no line, and that is the whole of the test (G7).
 */
export function annotatesTheLine({ markTop, markBottom, lineTop, lineBottom }) {
  if (markTop === undefined || lineTop === undefined) return true;
  return markTop < lineBottom && lineTop < markBottom;
}

/**
 * The marks whose centre misses the centre of the line beside them. Kept out of
 * the page so the judgement is testable without a browser: the page measures,
 * this decides.
 */
export function offAxisMarks(marks, tolerance = AXIS_TOLERANCE) {
  return marks
    .filter((mark) => annotatesTheLine(mark))
    .map((mark) => ({ ...mark, offset: +(mark.markCentre - mark.textCentre).toFixed(2) }))
    .filter((mark) => Math.abs(mark.offset) > tolerance);
}

const MEASURE = `(() => {
  const stages = [...document.querySelectorAll('.slotted-demo-stage, .stage')];
  const label = (node) => {
    const scene = node.closest('.slotted-demo-scene, figure');
    const caption = scene?.querySelector('.slotted-demo-scene__label, figcaption');
    return (caption?.textContent ?? node.closest('[id]')?.id ?? '').trim().slice(0, 70);
  };
  const describe = (node) =>
    node.tagName.toLowerCase() +
    (node.dataset.ui ? '[data-ui=' + node.dataset.ui + ']' : '') +
    (node.dataset.part ? '[data-part=' + node.dataset.part + ']' : '');

  /**
   * How much a turning descendant can add to this element's scrollable
   * overflow. A rotation is read off the computed matrix — \`matrix(a,b,c,d,..)\`
   * is axis-aligned only while \`b\` and \`c\` are nought — and off the \`rotate\`
   * property, which a family may animate instead of \`transform\`.
   */
  const turningExcessOf = (node) => {
    let most = 0;
    for (const child of node.querySelectorAll('*')) {
      const style = getComputedStyle(child);
      const matrix = /matrix\\(([^)]*)\\)/.exec(style.transform ?? '');
      const parts = matrix ? matrix[1].split(',').map(Number) : [];
      const skewed = parts.length >= 4 && (Math.abs(parts[1]) > 1e-6 || Math.abs(parts[2]) > 1e-6);
      const turned = (style.rotate ?? 'none') !== 'none' && !/^0(deg|rad|turn|grad)?$/.test(style.rotate.trim());
      if (!skewed && !turned) continue;
      const box = { width: child.offsetWidth, height: child.offsetHeight };
      const excess = Math.sqrt(box.width * box.width + box.height * box.height) - box.width;
      if (excess > most) most = excess;
    }
    return most;
  };

  /** A stage child, and the children it stands in for when it has no box. */
  const candidateOf = (node, stageWidth) => ({
    scene: label(node),
    element: describe(node),
    tag: node.tagName.toLowerCase(),
    width: node.getBoundingClientRect().width,
    stage: stageWidth,
    boxes: node.getClientRects().length,
    children: [...node.children].map((child) => candidateOf(child, stageWidth)),
  });

  const candidates = [];
  const overflow = [];

  for (const stage of stages) {
    const stageWidth = stage.getBoundingClientRect().width;
    if (stageWidth < ${STAGE_MINIMUM}) continue;

    for (const child of stage.children) candidates.push(candidateOf(child, stageWidth));

    if (stage.scrollWidth > stage.clientWidth) {
      overflow.push({
        scene: label(stage),
        element: 'the stage itself',
        scrollWidth: stage.scrollWidth,
        clientWidth: stage.clientWidth,
        turning: turningExcessOf(stage),
      });
    }
  }

  for (const node of document.querySelectorAll('.slotted-demo-stage *, .stage *')) {
    if (node.scrollWidth <= node.clientWidth) continue;
    if (getComputedStyle(node).overflowX !== 'visible') continue;
    overflow.push({
      scene: label(node),
      element: describe(node),
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
      turning: turningExcessOf(node),
    });
  }

  /**
   * Every mark on the page, paired with the line of text it sits beside.
   *
   * A mark is an element painting a glyph from the scale — a mask, which is
   * what this library draws every component-owned icon with. The text is the
   * nearest sibling that has any, following first and preceding second, which
   * is the order a mark reads in: an icon annotates the label after it.
   *
   * The comparison is against the *first line's* own rectangle rather than the
   * sibling's box, because a label that wrapped onto three lines has a box
   * whose centre no mark should ever be aligned to.
   *
   * A pseudo-element mark has no box to measure and is invisible here. So is a
   * mark with no text beside it, which is a mark centred in a control of its
   * own and has no axis to miss.
   */
  const firstTextNode = (node) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode: (text) =>
        text.textContent.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    });
    return walker.nextNode();
  };

  /**
   * A range over an *element* returns one rectangle per child box, so the first
   * one is the whole of the title — 39 pixels when it wraps — and every glyph
   * beside a title that wrapped was reported off its axis by half the second
   * line (G7). A range over a text node returns one rectangle per line box, and
   * the first of those is the line the mark actually sits on.
   */
  const firstLineOf = (node) => {
    const text = firstTextNode(node);
    if (text === null) return null;
    const range = document.createRange();
    range.selectNodeContents(text);
    const rects = [...range.getClientRects()].filter((rect) => rect.height > 0);
    return rects[0] ?? null;
  };

  const textBeside = (node) => {
    const siblings = [
      ...[...node.parentElement?.children ?? []].filter((sibling) => sibling !== node),
    ];
    const after = siblings.filter((sibling) => node.compareDocumentPosition(sibling) & Node.DOCUMENT_POSITION_FOLLOWING);
    const before = siblings.filter((sibling) => !after.includes(sibling)).reverse();
    return [...after, ...before].find((sibling) => sibling.textContent.trim().length > 0) ?? null;
  };

  const marks = [];
  for (const node of document.querySelectorAll('.slotted-demo-stage *, .stage *')) {
    const style = getComputedStyle(node);
    if ((style.maskImage ?? 'none') === 'none' && (style.webkitMaskImage ?? 'none') === 'none') continue;
    const box = node.getBoundingClientRect();
    if (box.height === 0 || box.width === 0) continue;

    const sibling = textBeside(node);
    if (!sibling) continue;
    const line = firstLineOf(sibling);
    if (!line) continue;

    /* A mark twice the height of the line it sits beside is a picture rather
       than a glyph, and a picture is aligned to a block, not to an axis. */
    if (box.height > line.height * 2) continue;

    marks.push({
      scene: label(node),
      element: describe(node),
      markCentre: +((box.top + box.bottom) / 2).toFixed(2),
      textCentre: +((line.top + line.bottom) / 2).toFixed(2),
      markTop: +box.top.toFixed(2),
      markBottom: +box.bottom.toFixed(2),
      lineTop: +line.top.toFixed(2),
      lineBottom: +line.bottom.toFixed(2),
    });
  }

  return {
    stages: stages.length,
    documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    candidates,
    overflow,
    marks,
  };
})()`;

export async function audit({ url, width = 1280, density = 'comfortable' }) {
  const { devtools, close } = await launch();

  try {
    await devtools.send('Page.enable');
    await devtools.send('Runtime.enable');
    await devtools.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const loaded = devtools.once('Page.loadEventFired');
    await devtools.send('Page.navigate', { url });
    await loaded;

    if (density !== 'comfortable') {
      await devtools.send('Runtime.evaluate', {
        expression: `document.documentElement.dataset.slottedDensity = ${JSON.stringify(density)}`,
      });
    }

    /**
     * A Storybook docs page mounts after the load event, so measuring at load
     * measures an empty document — which reports no defect and no stages, and
     * reads exactly like a clean page.
     */
    const { result: waited } = await devtools.send('Runtime.evaluate', {
      expression: `new Promise((done) => {
        const deadline = Date.now() + 15000;
        const settle = () => requestAnimationFrame(() => requestAnimationFrame(() => done(true)));
        const poll = () => {
          if (document.querySelector('.slotted-demo-stage, .stage')) return settle();
          if (Date.now() > deadline) return done(false);
          setTimeout(poll, 100);
        };
        poll();
      })`,
      awaitPromise: true,
      returnByValue: true,
    });

    if (waited.value !== true) {
      throw new Error(`${url} rendered no demonstration stage within 15 seconds`);
    }

    const { result } = await devtools.send('Runtime.evaluate', {
      expression: MEASURE,
      returnByValue: true,
    });

    devtools.close();
    const measured = result.value;
    return {
      stages: measured.stages,
      documentOverflow: measured.documentOverflow,
      collapsed: collapsedElements(measured.candidates ?? []),
      overflowing: overflowingElements(measured.overflow ?? []),
      offAxis: offAxisMarks(measured.marks ?? []),
    };
  } finally {
    await close();
  }
}

function report(findings, { url, width }) {
  const lines = [`${url} at ${width}px — ${findings.stages} stages`];

  for (const { scene, element, width: measured, stage } of findings.collapsed) {
    lines.push(`  collapsed  ${measured}px inside a ${stage}px stage  ${element}  ${scene}`);
  }
  for (const { scene, element, width: measured, stage } of findings.overflowing) {
    lines.push(`  overflows  ${measured}px out of ${stage}px  ${element}  ${scene}`);
  }
  for (const { scene, element, offset } of findings.offAxis ?? []) {
    const direction = offset < 0 ? 'above' : 'below';
    lines.push(
      `  off-axis   ${Math.abs(offset)}px ${direction} the line it annotates  ${element}  ${scene}`,
    );
  }
  if (findings.documentOverflow > OVERFLOW_TOLERANCE) {
    lines.push(`  the page itself scrolls sideways by ${findings.documentOverflow}px`);
  }

  return lines.join('\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [url, ...rest] = process.argv.slice(2);
  if (!url) {
    throw new Error(
      'usage: node tools/harness/audit.mjs <url> [--width 1280] [--density comfortable|compact|dense]',
    );
  }

  const options = { url, width: 1280, density: 'comfortable' };
  for (let index = 0; index < rest.length; index += 2) {
    const flag = rest[index]?.replace(/^--/, '');
    const value = rest[index + 1];
    if (flag === 'width') options.width = Number(value);
    else if (flag === 'density') options.density = String(value);
    else throw new Error(`unknown option ${rest[index]}`);
  }

  const findings = await audit(options);
  console.log(report(findings, options));

  if (
    findings.collapsed.length > 0 ||
    findings.overflowing.length > 0 ||
    findings.offAxis.length > 0 ||
    findings.documentOverflow > OVERFLOW_TOLERANCE
  ) {
    process.exitCode = 1;
  }
}
