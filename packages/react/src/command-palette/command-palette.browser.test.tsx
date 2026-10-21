import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { press } from '../test/press';
import { CommandPalette } from './command-palette';
import type { CommandPaletteItem } from './command-palette.types';

const ITEMS: CommandPaletteItem[] = [
  { id: 'inbox', label: 'Inbox', group: 'nav' },
  { id: 'projects', label: 'Projects', group: 'nav' },
  { id: 'deploy', label: 'Deploy to production', group: 'actions' },
];
const GROUPS = [
  { id: 'nav', label: 'Go to' },
  { id: 'actions', label: 'Actions' },
];

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Focus stays in the input while the palette is open: a press on a group
 * label or on the list's own space, with a mouse or a finger, leaves it there.
 * The press's default action used to blur the input, and focus rested on the
 * body, outside the modal dialog; on a phone the keyboard closed.
 */
describe('a press inside the open palette', () => {
  it.each(['mouse', 'touch'] as const)('keeps focus in the input, with a %s', async (pointer) => {
    render(<CommandPalette defaultOpen groups={GROUPS} items={ITEMS} />);
    const input = screen.getByRole('combobox');
    input.focus();
    await frame();
    expect(document.activeElement).toBe(input);

    const label = document.querySelector('[data-part="group-label"]') as HTMLElement;
    await press(label, pointer);
    expect(document.activeElement).toBe(input);

    /* The list's own space: a point inside it that no row covers. */
    const list = document.querySelector('[data-part="list"]') as HTMLElement;
    const rect = list.getBoundingClientRect();
    const point = { x: rect.left + rect.width / 2, y: rect.bottom - 2 };
    expect(document.elementFromPoint(point.x, point.y)).toBe(list);
    await press(list, pointer, point);
    expect(document.activeElement).toBe(input);
  });
});
