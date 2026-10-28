import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tag } from './tag';
import { TagToggle } from './tag-toggle';

const root = (name: string) =>
  [...document.querySelectorAll<HTMLElement>('[data-ui="tag"][data-part="root"]')].find(
    (element) => element.textContent === name,
  )!;

describe('a dashed tag', () => {
  it('draws the outline edge in dashes, and a solid edge once selected', () => {
    render(
      <>
        <Tag variant="outline">Outline</Tag>
        <Tag variant="dashed">Dashed</Tag>
        <TagToggle selected variant="dashed">
          Picked
        </TagToggle>
      </>,
    );
    const outline = getComputedStyle(root('Outline'));
    const dashed = getComputedStyle(root('Dashed'));

    expect(dashed.borderTopStyle).toBe('dashed');
    expect(dashed.borderTopColor).toBe(outline.borderTopColor);
    expect(dashed.backgroundColor).toBe(outline.backgroundColor);
    expect(getComputedStyle(root('Picked')).borderTopStyle).toBe('solid');
  });
});
