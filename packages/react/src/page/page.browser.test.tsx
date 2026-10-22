import { render } from '@testing-library/react';
import { cdp } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';

import { DetailPanel, DetailPanelBody } from '../detail-panel';
import { Page, PageBody, PageFooter } from './index';

const THEME = {
  '--slotted-page-footer-background': 'rgb(10 20 30 / 0.5)',
  '--slotted-page-footer-backdrop-filter': 'blur(7px)',
  '--slotted-detail-panel-footer-background': 'rgb(40 50 60 / 0.5)',
  '--slotted-detail-panel-footer-backdrop-filter': 'blur(5px)',
};

function paint(element: Element) {
  const style = getComputedStyle(element);
  return { background: style.backgroundColor, filter: style.backdropFilter };
}

/**
 * A theme draws the bars at the bottom edge as a material: a ground with
 * alpha and a filter behind it, each from the family's own tokens. A reader
 * who asked for less transparency gets no filter whatever the theme set.
 */
describe('a footer drawn as a material', () => {
  afterEach(async () => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [] });
  });

  it('paints the page footer’s ground and filter from its tokens', () => {
    render(
      <div style={THEME as React.CSSProperties}>
        <Page footer={<PageFooter>Save</PageFooter>}>
          <PageBody>Content</PageBody>
        </Page>
      </div>,
    );
    expect(paint(document.querySelector('[data-ui="page"] > [data-part="footer"]')!)).toEqual({
      background: 'rgba(10, 20, 30, 0.5)',
      filter: 'blur(7px)',
    });
  });

  it('paints the detail panel footer’s ground and filter from its own tokens', () => {
    render(
      <div style={THEME as React.CSSProperties}>
        <DetailPanel footer="Save">
          <DetailPanelBody>Content</DetailPanelBody>
        </DetailPanel>
      </div>,
    );
    const footer = document.querySelector('[data-ui="detail-panel"] > [data-part="footer"]')!;
    expect(paint(footer)).toEqual({ background: 'rgba(40, 50, 60, 0.5)', filter: 'blur(5px)' });
  });

  it('filters nothing under reduced transparency', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
    });
    render(
      <div style={THEME as React.CSSProperties}>
        <Page footer={<PageFooter>Save</PageFooter>}>
          <PageBody>
            <DetailPanel footer="Save">
              <DetailPanelBody>Content</DetailPanelBody>
            </DetailPanel>
          </PageBody>
        </Page>
      </div>,
    );
    for (const footer of document.querySelectorAll('[data-part="footer"]')) {
      expect(getComputedStyle(footer).backdropFilter).toBe('none');
    }
  });
});
