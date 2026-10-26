import { describe, expect, it } from 'vitest';

import { parseMarkdown } from './parse';
import type { MarkdownNode } from './markdown';

/** The tree without what a reader of the test does not need. */
const shape = (node: MarkdownNode): unknown => {
  const { children, type, value, ...rest } = node;
  const out: Record<string, unknown> = { type };
  if (value !== undefined) out['value'] = value;
  for (const field of ['depth', 'ordered', 'start', 'spread', 'url', 'lang'] as const) {
    if (rest[field] !== undefined && rest[field] !== null) out[field] = rest[field];
  }
  if (children) out['children'] = children.map(shape);
  return out;
};

const text = (value: string) => ({ type: 'text', value });

describe('parseMarkdown', () => {
  it('reads a list with a strong and a link', () => {
    expect(shape(parseMarkdown('- **a** [b](/c)'))).toEqual({
      type: 'root',
      children: [
        {
          type: 'list',
          ordered: false,
          spread: false,
          children: [
            {
              type: 'listItem',
              spread: false,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    { type: 'strong', children: [text('a')] },
                    text(' '),
                    { type: 'link', url: '/c', children: [text('b')] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('keeps the syntax of a type outside the allowlist as text', () => {
    const allow = ['paragraph', 'text', 'list', 'listItem', 'strong', 'link'];
    expect(shape(parseMarkdown('# t', { allow }))).toEqual({
      type: 'root',
      children: [{ type: 'paragraph', children: [text('# t')] }],
    });
    expect(shape(parseMarkdown('*a* `b`', { allow }))).toEqual({
      type: 'root',
      children: [{ type: 'paragraph', children: [text('*a* `b`')] }],
    });
  });

  it('reads headings, fences, quotes, rules and ordered lists', () => {
    const tree = parseMarkdown(
      '## Title\n\n```ts\nconst a = 1;\n```\n\n> quoted *word*\n\n---\n\n3. three\n4. four',
    );
    expect(shape(tree)).toEqual({
      type: 'root',
      children: [
        { type: 'heading', depth: 2, children: [text('Title')] },
        { type: 'code', lang: 'ts', value: 'const a = 1;' },
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [text('quoted '), { type: 'emphasis', children: [text('word')] }],
            },
          ],
        },
        { type: 'thematicBreak' },
        {
          type: 'list',
          ordered: true,
          start: 3,
          spread: false,
          children: [
            {
              type: 'listItem',
              spread: false,
              children: [{ type: 'paragraph', children: [text('three')] }],
            },
            {
              type: 'listItem',
              spread: false,
              children: [{ type: 'paragraph', children: [text('four')] }],
            },
          ],
        },
      ],
    });
  });

  it('nests a list by indentation, and reads a loose list', () => {
    const tree = parseMarkdown('- a\n  - b\n\n- c');
    const list = tree.children?.[0] as MarkdownNode;
    expect(list.spread).toBe(true);
    const first = list.children?.[0] as MarkdownNode;
    expect(first.children?.map((child) => child.type)).toEqual(['paragraph', 'list']);
    expect(list.children).toHaveLength(2);
  });

  it('reads code spans, escapes, emphasis inside strong and hard breaks', () => {
    expect(shape(parseMarkdown('**a *b* c** `x*y*` \\*z\\*  \nnext'))).toEqual({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'strong',
              children: [text('a '), { type: 'emphasis', children: [text('b')] }, text(' c')],
            },
            text(' '),
            { type: 'inlineCode', value: 'x*y*' },
            text(' *z*'),
            { type: 'break' },
            text('next'),
          ],
        },
      ],
    });
  });

  it('leaves an unclosed delimiter and an unfinished link as text', () => {
    expect(shape(parseMarkdown('**a [b](c snake_case_word'))).toEqual({
      type: 'root',
      children: [{ type: 'paragraph', children: [text('**a [b](c snake_case_word')] }],
    });
  });
});
