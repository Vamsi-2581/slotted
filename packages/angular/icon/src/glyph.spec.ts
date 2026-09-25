import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GLYPHS } from '@slotted/core/glyph';
import { describe, expect, it } from 'vitest';

import { SlGlyph } from './glyph';
import { SlIcon } from './icon';

@Component({
  imports: [SlGlyph, SlIcon],
  template: `
    <span slIcon id="close"><svg slGlyph name="x"></svg></span>
    <svg slGlyph name="check" id="check"></svg>
    <svg slGlyph name="dot" id="dot"></svg>
    <svg slGlyph name="circle-alert" solid id="solid"></svg>
  `,
})
class GlyphHost {}

function host() {
  const fixture = TestBed.createComponent(GlyphHost);
  fixture.detectChanges();
  return (selector: string) => fixture.nativeElement.querySelector(selector) as Element;
}

describe('SlGlyph', () => {
  it('draws the library’s geometry as a real svg inside the icon box', () => {
    const query = host();
    const svg = query('#close svg');
    expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svg.parentElement?.getAttribute('data-ui')).toBe('icon');
    expect(svg.getAttribute('data-part')).toBe('glyph');
    expect(svg.getAttribute('data-glyph')).toBe('x');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    const paths = [...svg.querySelectorAll('path')];
    expect(paths.every((path) => path.namespaceURI === 'http://www.w3.org/2000/svg')).toBe(true);
    expect(paths.map((path) => path.getAttribute('d'))).toEqual(GLYPHS.x.paths);
  });

  it('strokes with the colour it inherits, at the manifest’s weight, or fills', () => {
    const query = host();
    const check = query('#check');
    const dot = query('#dot');
    expect(check.getAttribute('stroke')).toBe('currentColor');
    expect(check.getAttribute('stroke-width')).toBe(String(GLYPHS.check.strokeWidth));
    expect(check.getAttribute('fill')).toBe('none');
    expect(dot.getAttribute('fill')).toBe('currentColor');
    expect(dot.hasAttribute('stroke')).toBe(false);
  });

  it('moves the ink onto the centre the mask centred it on', () => {
    const query = host();
    const [dx, dy] = GLYPHS.check.offset;
    expect(query('#check g').getAttribute('transform')).toBe(`translate(${dx} ${dy})`);
  });

  it('fills the enclosing shape and cuts the symbol out of it when solid', () => {
    const query = host();
    const svg = query('#solid');
    const mask = svg.querySelector('mask');
    const shape = svg.querySelector(':scope > g > path');
    expect(svg.hasAttribute('data-solid')).toBe(true);
    expect(svg.hasAttribute('stroke')).toBe(false);
    expect(shape?.getAttribute('d')).toBe(GLYPHS['circle-alert'].paths[0]);
    expect(shape?.getAttribute('mask')).toBe(`url(#${mask?.id ?? ''})`);
    expect(
      [...(mask?.querySelectorAll('path') ?? [])].map((path) => path.getAttribute('d')),
    ).toEqual(GLYPHS['circle-alert'].paths.slice(1));
  });
});
