import assert from 'node:assert/strict';

import { buildReactPage } from '../react-page.mjs';
import { launch } from '../shoot.mjs';

/**
 * A family placed inside a stat card renders as it does outside it: the
 * card's part rules reach the card's own parts and stop at a nested family's.
 *
 * The request came from an application whose success badge in
 * `StatCardStatus` printed grey 13-pixel text inside a green border: the rule
 * for the card's `label` part matched the badge's `label` part as well.
 *
 * The page renders the same badge twice, inside `StatCardStatus` and beside the
 * card, and reads the computed colour, size and weight of each badge's label.
 *
 * Run: node tools/harness/scenarios/stat-card-nested.mjs
 * Exits non-zero when the two differ.
 */

const entry = `
import { createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { Badge } from '@slotted/react/badge';
import {
  StatCard,
  StatCardFigure,
  StatCardHeader,
  StatCardLabel,
  StatCardStatus,
  StatCardValue,
} from '@slotted/react/stat-card';

const badge = () => h(Badge, { tone: 'success', variant: 'soft', size: 'sm' }, 'Paid');

createRoot(document.getElementById('root')).render(
  h('div', { style: { padding: '24px', display: 'grid', gap: '24px', inlineSize: '360px' } },
    h('div', { 'data-probe': 'outside' }, badge()),
    h(StatCard, null,
      h(StatCardHeader, null, h(StatCardLabel, null, 'Card'), h(StatCardStatus, null, badge())),
      h(StatCardFigure, null, h(StatCardValue, { value: '1' })),
    ),
  ),
);
`;

const url = await buildReactPage('stat-card-nested', entry);

const READ = `(() => {
  const read = (badge) => {
    const style = getComputedStyle(badge.querySelector('[data-part="label"]'));
    return { color: style.color, fontSize: style.fontSize, fontWeight: style.fontWeight };
  };
  return {
    outside: read(document.querySelector('[data-probe="outside"] [data-ui="badge"]')),
    inside: read(document.querySelector('[data-ui="stat-card"] [data-ui="badge"]')),
  };
})()`;

const { devtools, close } = await launch();
let reading;
try {
  await devtools.send('Page.enable');
  await devtools.send('Runtime.enable');
  const loaded = devtools.once('Page.loadEventFired');
  await devtools.send('Page.navigate', { url: url.href });
  await loaded;
  await new Promise((resolve) => setTimeout(resolve, 300));
  reading = (await devtools.send('Runtime.evaluate', { expression: READ, returnByValue: true }))
    .result.value;
} finally {
  devtools.close();
  await close();
}

console.log(JSON.stringify(reading));
assert.deepEqual(reading.inside, reading.outside, 'the badge inside the card renders as outside');
console.log('ok — a badge inside StatCardStatus renders as it does outside the card');
