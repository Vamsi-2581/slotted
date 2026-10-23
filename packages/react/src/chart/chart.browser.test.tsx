import { render } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { page } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';

import { Segment, SegmentedControl } from '../segmented-control';
import { Chart } from './index';

const data = [
  { month: 'Jan', revenue: 120 },
  { month: 'Feb', revenue: 132 },
];

const centre = (element: Element) => {
  const box = element.getBoundingClientRect();
  return box.top + box.height / 2;
};

/**
 * The controls of the consumer's `actions` and the chart's own toolbar sit on
 * the title's first line, so they share one vertical centre.
 */
describe('the header of a card chart', () => {
  afterEach(async () => {
    await page.viewport(412, 915);
  });

  it('centres a small segmented control in actions on the toolbar buttons', async () => {
    /* A phone's frame draws the toolbar's 44px touch targets and folds it into a menu. */
    await page.viewport(1024, 915);
    render(
      <Chart
        actions={
          <SegmentedControl aria-label="Range" defaultValue="week" size="sm">
            <Segment value="week">Week</Segment>
            <Segment value="month">Month</Segment>
          </SegmentedControl>
        }
        data={data}
        series={[{ kind: 'line', field: 'revenue', label: 'Revenue' }]}
        /* The fine pointer's sizes: the test frame emulates touch, which grows the toolbar to the comfortable target. */
        style={
          {
            '--slotted-control-height-sm': '1.75rem',
            '--slotted-target-comfortable': '1.75rem',
          } as CSSProperties
        }
        title="Revenue"
        variant="card"
        x={{ field: 'month' }}
      />,
    );
    const actions = document.querySelector('[data-part="actions"] [data-ui="segmented-control"]')!;
    const toolbarButton = document.querySelector('[data-part="toolbar"] button')!;
    expect(actions).not.toBeNull();
    expect(toolbarButton).not.toBeNull();
    expect(Math.abs(centre(actions) - centre(toolbarButton))).toBeLessThan(0.5);
  });
});
