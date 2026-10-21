import { render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  PromptComposer,
  PromptComposerAction,
  PromptComposerFooter,
  PromptComposerInput,
} from './index';

const MOTION = { '--slotted-duration-loop-slow': '4s' } as CSSProperties;

/**
 * An AI input marked by a ring of turning hues. An application drew it behind
 * the composer and zeroed the focus outline through tokens, which also took
 * the focus mark from the buttons inside.
 */
describe('a composer with the emphasis ring', () => {
  it('turns the ring by a transform and leaves the actions their focus ring', async () => {
    render(
      <div style={MOTION}>
        <PromptComposer emphasis="ring">
          <PromptComposerInput aria-label="Prompt" />
          <PromptComposerFooter>
            <PromptComposerAction aria-label="Attach">+</PromptComposerAction>
          </PromptComposerFooter>
        </PromptComposer>
      </div>,
    );
    const ring = document.querySelector('[data-part="ring"]') as HTMLElement;
    const [turn] = ring.getAnimations({ subtree: true });
    const properties = (turn?.effect as KeyframeEffect)
      .getKeyframes()
      .flatMap((frame) => Object.keys(frame));

    expect(turn?.playState).toBe('running');
    expect(properties).toContain('transform');
    expect(properties.some((name) => name.startsWith('--'))).toBe(false);

    await userEvent.click(screen.getByRole('textbox', { name: 'Prompt' }));
    await userEvent.keyboard('{Tab}');
    const action = screen.getByRole('button', { name: 'Attach' });
    expect(document.activeElement).toBe(action);
    expect(getComputedStyle(action).outlineStyle).toBe('solid');
  });
});
