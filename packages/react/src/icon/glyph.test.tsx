import { GLYPHS } from '@slotted/core/glyph';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Glyph, Icon } from './index';

describe('Glyph', () => {
  it('draws the library’s geometry as a real svg inside the icon box', () => {
    const { container } = render(
      <Icon>
        <Glyph name="x" />
      </Icon>,
    );
    const svg = container.querySelector('svg');
    expect(svg?.parentElement).toHaveAttribute('data-ui', 'icon');
    expect(svg).toHaveAttribute('data-part', 'glyph');
    expect(svg).toHaveAttribute('data-glyph', 'x');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(
      [...(svg?.querySelectorAll('path') ?? [])].map((path) => path.getAttribute('d')),
    ).toEqual(GLYPHS.x.paths);
  });

  it('strokes with the colour it inherits, at the manifest’s weight, or fills', () => {
    const { container } = render(
      <>
        <Glyph name="check" />
        <Glyph name="dot" />
      </>,
    );
    const [check, dot] = [...container.querySelectorAll('svg')];
    expect(check).toHaveAttribute('stroke', 'currentColor');
    expect(check).toHaveAttribute('stroke-width', String(GLYPHS.check.strokeWidth));
    expect(check).toHaveAttribute('fill', 'none');
    expect(dot).toHaveAttribute('fill', 'currentColor');
    expect(dot).not.toHaveAttribute('stroke');
  });

  it('moves the ink onto the centre the mask centred it on', () => {
    const { container } = render(<Glyph name="check" />);
    const [dx, dy] = GLYPHS.check.offset;
    expect(container.querySelector('g')).toHaveAttribute('transform', `translate(${dx} ${dy})`);
  });

  it('fills the enclosing shape and cuts the symbol out of it when solid', () => {
    const { container } = render(<Glyph name="circle-alert" solid />);
    const svg = container.querySelector('svg');
    const mask = svg?.querySelector('mask');
    const shape = svg?.querySelector(':scope > g > path');
    expect(svg).toHaveAttribute('data-solid');
    expect(svg).not.toHaveAttribute('stroke');
    expect(shape).toHaveAttribute('d', GLYPHS['circle-alert'].paths[0]);
    expect(shape).toHaveAttribute('fill', 'currentColor');
    expect(shape?.getAttribute('mask')).toBe(`url(#${mask?.id ?? ''})`);
    expect(
      [...(mask?.querySelectorAll('path') ?? [])].map((path) => path.getAttribute('d')),
    ).toEqual(GLYPHS['circle-alert'].paths.slice(1));
  });
});
