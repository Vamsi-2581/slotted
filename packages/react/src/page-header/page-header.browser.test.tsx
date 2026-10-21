import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { Tab, TabList, Tabs } from '../tabs';
import { PageHeader } from './page-header';
import {
  PageHeaderControls,
  PageHeaderHeading,
  PageHeaderProgress,
  PageHeaderTabs,
  PageHeaderTitleArea,
  PageHeaderToggle,
} from './page-header-parts';

const strip = (
  <PageHeaderTabs>
    <Tabs defaultValue="a">
      <TabList aria-label="Sections">
        <Tab value="a">A</Tab>
        <Tab value="b">B</Tab>
      </TabList>
    </Tabs>
  </PageHeaderTabs>
);

function placed(children: ReactNode) {
  const { unmount } = render(<PageHeader>{children}</PageHeader>);
  const root = document.querySelector('[data-ui="page-header"]') as HTMLElement;
  const frame = root.querySelector('[data-part="progress"]') as HTMLElement;
  const controls = root.querySelector('[data-part="controls"]');
  const position = {
    frame: frame.getBoundingClientRect().bottom,
    root: root.getBoundingClientRect().bottom,
    controls: controls?.getBoundingClientRect().top ?? null,
  };
  unmount();
  return position;
}

/**
 * The bar's frame ends where the line ends: the bar stands on the line where the chrome ends, wherever it is written
 * among the parts. With a pill over the tabs that line is the one the pill
 * straddles; without one it is the root's own hairline, under the tabs.
 * Written before the tabs with no pill, the bar was a row of its own between
 * the title and the strip, over no line at all.
 */
describe('the refresh bar of a header with tabs', () => {
  const title = (
    <PageHeaderTitleArea>
      <PageHeaderHeading>Contracts</PageHeaderHeading>
    </PageHeaderTitleArea>
  );
  const bar = <PageHeaderProgress delay={0} loading />;

  it('stands on the root’s closing line without a pill, in either order', () => {
    const before = placed(
      <>
        {title}
        {bar}
        {strip}
      </>,
    );
    const after = placed(
      <>
        {title}
        {strip}
        {bar}
      </>,
    );

    expect(after.frame).toBeCloseTo(after.root, 0);
    expect(before.frame).toBeCloseTo(before.root, 0);
  });

  it('stands on the line the pill straddles, in either order', () => {
    const controls = (
      <PageHeaderControls>
        <PageHeaderToggle />
      </PageHeaderControls>
    );
    const documented = placed(
      <>
        {title}
        {controls}
        {bar}
        {strip}
      </>,
    );
    const last = placed(
      <>
        {title}
        {controls}
        {strip}
        {bar}
      </>,
    );

    /* The pill's line is drawn one hairline down from the controls row's top. */
    expect(documented.frame).toBeCloseTo(documented.controls! + 1, 0);
    expect(last.frame).toBeCloseTo(last.controls! + 1, 0);
  });
});
