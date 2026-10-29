import { render } from '@testing-library/react';
import type { CSSProperties, ReactNode } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';

import { Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem } from './combobox';
import { Menu, MenuContent, MenuGroup, MenuItem, MenuTrigger } from './menu';
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectControl,
  MultiSelectGroup,
  MultiSelectItem,
} from './multi-select';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const bounded: CSSProperties = { maxBlockSize: 200 };
const names = (group: string) =>
  Array.from({ length: 20 }, (_, index) => `${group} ${String(index + 1)}`);

/** Two groups of twenty, in each family's own parts. */
const families: {
  name: string;
  ui: string;
  open: string;
  tree: (filter?: boolean) => ReactNode;
}[] = [
  {
    name: 'select',
    ui: 'select',
    open: '[data-part="trigger"]',
    tree: () => (
      <Select>
        <SelectTrigger aria-label="Pick">
          <SelectValue />
        </SelectTrigger>
        <SelectContent style={bounded}>
          {['Alpha', 'Beta'].map((group) => (
            <SelectGroup key={group} label={group}>
              {names(group).map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    ),
  },
  {
    name: 'combobox',
    ui: 'combobox',
    open: 'input',
    tree: () => (
      <Combobox>
        <ComboboxInput aria-label="Pick" />
        <ComboboxContent aria-label="Pick" style={bounded}>
          {['Alpha', 'Beta'].map((group) => (
            <ComboboxGroup key={group} label={group}>
              {names(group).map((name) => (
                <ComboboxItem key={name} value={name}>
                  {name}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          ))}
        </ComboboxContent>
      </Combobox>
    ),
  },
  {
    name: 'multi-select',
    ui: 'multi-select',
    open: 'input',
    tree: () => (
      <MultiSelect>
        <MultiSelectControl aria-label="Pick" />
        <MultiSelectContent aria-label="Pick" style={bounded}>
          {['Alpha', 'Beta'].map((group) => (
            <MultiSelectGroup key={group} label={group}>
              {names(group).map((name) => (
                <MultiSelectItem key={name} value={name}>
                  {name}
                </MultiSelectItem>
              ))}
            </MultiSelectGroup>
          ))}
        </MultiSelectContent>
      </MultiSelect>
    ),
  },
  {
    name: 'menu',
    ui: 'menu',
    open: 'button',
    tree: () => (
      <Menu>
        <MenuTrigger>Pick</MenuTrigger>
        <MenuContent style={bounded}>
          {['Alpha', 'Beta'].map((group) => (
            <MenuGroup key={group} label={group}>
              {names(group).map((name) => (
                <MenuItem key={name}>{name}</MenuItem>
              ))}
            </MenuGroup>
          ))}
        </MenuContent>
      </Menu>
    ),
  },
];

/**
 * A group label scrolled away with its group's first items, and the options
 * left in view had no group a reader could see.
 */
describe.each(families)('the group labels of a $name', ({ ui, open, tree }) => {
  async function opened() {
    render(tree());
    await userEvent.click(document.querySelector<HTMLElement>(open)!);
    for (let index = 0; index < 10; index += 1) await frame();
    const content = document.querySelector<HTMLElement>(
      `[data-ui="${ui}"][data-part="content"], [data-ui="${ui}"] [data-part="content"]`,
    )!;
    const [alpha, beta] = [...content.querySelectorAll<HTMLElement>('[data-part="group-label"]')];
    const item = (name: string) =>
      [...content.querySelectorAll<HTMLElement>('[data-part="item"]')].find(
        (element) => element.textContent.trim() === name,
      )!;
    const scroller = item('Alpha 1').closest<HTMLElement>('[data-part="list"]') ?? content;
    const top = () => scroller.getBoundingClientRect().top + scroller.clientTop;
    /** Scrolls until `name` sits just under a label stuck to the top. */
    const scrollTo = async (name: string) => {
      scroller.scrollTop += item(name).getBoundingClientRect().top - top() - alpha!.offsetHeight;
      await frame();
    };
    return { alpha: alpha!, beta: beta!, item, scrollTo, top };
  }

  it('keeps the label of the group in view at the top of the list', async () => {
    const { alpha, beta, scrollTo, top } = await opened();

    await scrollTo('Alpha 10');
    expect(alpha.getBoundingClientRect().top).toBeCloseTo(top(), 0);

    await scrollTo('Beta 5');
    expect(beta.getBoundingClientRect().top).toBeCloseTo(top(), 0);
    expect(alpha.getBoundingClientRect().bottom).toBeLessThanOrEqual(top() + 0.5);
  });

  it('brings an item the arrow keys reach in below the stuck label', async () => {
    const { beta, item, scrollTo } = await opened();
    await scrollTo('Beta 5');
    await userEvent.hover(item('Beta 5'));
    const active = () =>
      document.querySelector<HTMLElement>(`[data-ui="${ui}"] [data-part="item"][data-current]`) ??
      (document.activeElement as HTMLElement);
    expect(active().textContent.trim()).toBe('Beta 5');

    for (const name of ['Beta 4', 'Beta 3', 'Beta 2', 'Beta 1']) {
      await userEvent.keyboard('{ArrowUp}');
      await frame();
      expect(active().textContent.trim()).toBe(name);
      expect(active().getBoundingClientRect().top).toBeGreaterThanOrEqual(
        beta.getBoundingClientRect().bottom - 0.5,
      );
    }
  });
});

describe('the group labels of a combobox under a query', () => {
  it('hides a group whose items the query rejected, label and all', async () => {
    render(families[1]!.tree());
    const input = document.querySelector<HTMLInputElement>('input')!;
    await userEvent.click(input);
    await userEvent.fill(input, 'Beta');
    for (let index = 0; index < 5; index += 1) await frame();
    const alpha = [...document.querySelectorAll<HTMLElement>('[data-part="group"]')].find((group) =>
      group.textContent.includes('Alpha'),
    );

    expect(alpha === undefined || !alpha.checkVisibility()).toBe(true);
  });
});
