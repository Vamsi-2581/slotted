import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { PageHeader, PageHeaderHeading } from '../page-header';
import { DetailPanel, DetailPanelBody, DetailPanelSection } from './index';

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Under `scroll="self"` the panel is a pane that scrolls on its own, and its
 * header sticks to the top of it. A pane beside a list is narrower than the
 * compact class in a desktop frame; the header read its own width, took itself
 * out of `sticky` and scrolled away with the record.
 */
describe('a detail panel that scrolls itself in a desktop frame', () => {
  afterEach(async () => {
    await page.viewport(412, 915);
  });

  it('keeps its header at the top of the pane after a scroll', async () => {
    await page.viewport(1440, 900);
    render(
      <div
        style={{
          blockSize: '400px',
          inlineSize: '420px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DetailPanel recordKey="SO-1" scroll="self">
          <PageHeader>
            <PageHeaderHeading>SO-1</PageHeaderHeading>
          </PageHeader>
          <DetailPanelBody>
            <DetailPanelSection name="lines" label="Lines">
              <div style={{ blockSize: '600px' }} />
            </DetailPanelSection>
            <DetailPanelSection name="history" label="History">
              <div style={{ blockSize: '600px' }} />
            </DetailPanelSection>
          </DetailPanelBody>
        </DetailPanel>
      </div>,
    );
    await frame();
    await frame();
    const panel = document.querySelector('[data-ui="detail-panel"]') as HTMLElement;
    const header = panel.querySelector('[data-ui="page-header"]') as HTMLElement;
    expect(panel.scrollHeight).toBeGreaterThan(1000);

    panel.scrollTop = 600;
    await frame();
    await frame();

    expect(header.hasAttribute('data-compact')).toBe(false);
    expect(Math.round(header.getBoundingClientRect().top)).toBe(
      Math.round(panel.getBoundingClientRect().top),
    );
  });
});
