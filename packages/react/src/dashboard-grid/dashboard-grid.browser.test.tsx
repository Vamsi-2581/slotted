import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { DashboardGrid } from './dashboard-grid';
import { DashboardWidget } from './dashboard-widget';

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * The class a grid draws in comes from its own width. A grid beside a
 * navigation rail in a 1280-pixel window is 970 pixels wide, under the
 * expanded threshold, and a stored layout of twelve columns flowed in halves.
 * `expandedFrom` states the width the expanded class starts at.
 */
describe('a dashboard grid narrower than the expanded threshold', () => {
  afterEach(async () => {
    await page.viewport(412, 915);
  });

  it('stands its widgets at their stored cells from expandedFrom', async () => {
    await page.viewport(1280, 900);
    render(
      <div style={{ inlineSize: 970 }}>
        <DashboardGrid
          aria-label="Sales"
          expandedFrom={900}
          defaultLayout={[
            { key: 'a', x: 0, y: 0, w: 4, h: 2 },
            { key: 'b', x: 4, y: 0, w: 4, h: 2 },
            { key: 'c', x: 8, y: 0, w: 4, h: 2 },
          ]}
        >
          <DashboardWidget value="a" title="A" />
          <DashboardWidget value="b" title="B" />
          <DashboardWidget value="c" title="C" />
        </DashboardGrid>
      </div>,
    );
    for (let index = 0; index < 3; index += 1) await frame();
    const tops = [...document.querySelectorAll<HTMLElement>('[data-part="widget"]')].map((widget) =>
      Math.round(widget.getBoundingClientRect().top),
    );

    expect(new Set(tops).size).toBe(1);
  });
});

/**
 * A widget whose content length depends on data — a list of rows — clipped or
 * scrolled inside its card at the height its rows gave it. `rows="auto"` gives
 * it the rows its content measures.
 */
describe('a dashboard widget sized by its content', () => {
  afterEach(async () => {
    await page.viewport(412, 915);
  });

  it('takes the rows its list needs, so its body does not scroll', async () => {
    await page.viewport(1280, 900);
    render(
      <div style={{ inlineSize: 1200 }}>
        <DashboardGrid aria-label="Sales">
          <DashboardWidget value="list" title="Latest" rows="auto">
            <ul style={{ margin: 0 }}>
              {Array.from({ length: 6 }, (_, index) => (
                <li key={index} style={{ blockSize: 32 }}>
                  Row {index + 1}
                </li>
              ))}
            </ul>
          </DashboardWidget>
          <DashboardWidget value="next" title="Next" />
        </DashboardGrid>
      </div>,
    );
    for (let index = 0; index < 5; index += 1) await frame();
    const body = document.querySelector<HTMLElement>(
      '[data-part="widget"] [data-ui="card"] > [data-part="body"]',
    )!;

    expect(body.scrollHeight).toBe(body.clientHeight);
  });
});
