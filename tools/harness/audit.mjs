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

  const collapsed = [];
  const overflowing = [];

  for (const stage of stages) {
    const stageWidth = stage.getBoundingClientRect().width;
    if (stageWidth < ${STAGE_MINIMUM}) continue;

    for (const child of stage.children) {
      const width = child.getBoundingClientRect().width;
      if (width < ${COLLAPSE_FLOOR}) {
        collapsed.push({ scene: label(child), element: describe(child), width: Math.round(width), stage: Math.round(stageWidth) });
      }
    }

    if (stage.scrollWidth > stage.clientWidth + ${OVERFLOW_TOLERANCE}) {
      overflowing.push({ scene: label(stage), element: 'the stage itself', width: stage.scrollWidth, stage: Math.round(stageWidth) });
    }
  }

  for (const node of document.querySelectorAll('.slotted-demo-stage *, .stage *')) {
    if (node.scrollWidth <= node.clientWidth + ${OVERFLOW_TOLERANCE}) continue;
    if (getComputedStyle(node).overflowX !== 'visible') continue;
    overflowing.push({ scene: label(node), element: describe(node), width: node.scrollWidth, stage: node.clientWidth });
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
  const firstLineOf = (node) => {
    const range = document.createRange();
    range.selectNodeContents(node);
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
    });
  }

  return {
    stages: stages.length,
    documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    collapsed,
    overflowing,
    marks,
  };
})()`;

/**
 * The marks whose centre misses the centre of the line beside them. Kept out of
 * the page so the judgement is testable without a browser: the page measures,
 * this decides.
 */
export function offAxisMarks(marks, tolerance = AXIS_TOLERANCE) {
  return marks
    .map((mark) => ({ ...mark, offset: +(mark.markCentre - mark.textCentre).toFixed(2) }))
    .filter((mark) => Math.abs(mark.offset) > tolerance);
}

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
    return { ...result.value, offAxis: offAxisMarks(result.value.marks ?? []) };
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
