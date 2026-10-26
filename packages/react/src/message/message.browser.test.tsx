import { fromMarkedTokens } from '@slotted/core/markdown';
import { render } from '@testing-library/react';
import { marked } from 'marked';
import { describe, expect, it } from 'vitest';

import { Markdown } from '../markdown';
import { Bubble, BubbleContent, Message, MessageBody } from './index';

/**
 * A bubble is as wide as its words, up to its share of the row. A markdown
 * tree inside it measured nothing — its root is a size container — and the
 * bubble shrank to its padding, one letter a line.
 */
describe('a bubble holding a markdown tree', () => {
  it('sizes to the text like plain text', () => {
    render(
      <div style={{ inlineSize: 340 }}>
        <Message align="start">
          <MessageBody>
            <Bubble>
              <BubbleContent>
                <Markdown tree={fromMarkedTokens(marked.lexer('Hello world, a long answer'))} />
              </BubbleContent>
            </Bubble>
          </MessageBody>
        </Message>
      </div>,
    );
    const bubble = document.querySelector('[data-part="bubble"]') as HTMLElement;

    expect(bubble.getBoundingClientRect().width).toBeGreaterThan(150);
  });
});
