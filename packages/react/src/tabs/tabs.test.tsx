import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/tabs/contract.json';
import { Tabs } from './tabs';
import { TabsDefaultsProvider } from './tabs-defaults';
import { Tab, TabActions, TabList, TabPanel } from './tabs-parts';
import type { TabsProps } from './tabs.types';

const VALUES = ['a', 'b', 'c'];

function Basic({
  labels = ['Resumo', 'Itens', 'Nota'],
  ...props
}: Partial<TabsProps> & {
  labels?: string[];
}) {
  return (
    <Tabs defaultValue="a" {...props}>
      <TabList aria-label="Pedido">
        {labels.map((label, index) => (
          <Tab key={label} value={VALUES[index] as string}>
            {label}
          </Tab>
        ))}
      </TabList>
      <TabPanel value="a">painel a</TabPanel>
      <TabPanel value="b">painel b</TabPanel>
      <TabPanel value="c">painel c</TabPanel>
    </Tabs>
  );
}

const tabs = () => screen.getAllByRole('tab');
const tab = (index: number) => tabs()[index] as HTMLElement;
const panels = () => document.querySelectorAll('[data-part="panel"]');
const root = () => document.querySelector('[data-ui="tabs"]') as HTMLElement;
const press = (element: HTMLElement, key: string, init: Record<string, unknown> = {}) =>
  fireEvent.keyDown(element, { key, ...init });

describe('Tabs', () => {
  it('renders the pattern roles and wires each tab to its panel', () => {
    render(<Basic />);

    expect(screen.getByRole('tablist')).toHaveAccessibleName('Pedido');
    expect(tab(0)).toHaveAttribute('aria-selected', 'true');
    expect(tab(1)).toHaveAttribute('aria-selected', 'false');
    expect(tab(0)).toHaveAttribute('aria-controls', screen.getByRole('tabpanel').id);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tab(0).id);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '0');
  });

  /**
   * A strip over one region the value filters — a feed, a table — has no
   * panel per tab; every tab names that region, and the family's own id
   * stays out of the DOM.
   */
  it('lets a tab name a region the family does not render', () => {
    render(
      <>
        <Tabs defaultValue="a">
          <TabList aria-label="Vistas">
            <Tab controls="feed" value="a">
              Todas
            </Tab>
            <Tab controls="feed" value="b">
              Não lidas
            </Tab>
          </TabList>
        </Tabs>
        <div id="feed" role="feed" />
      </>,
    );

    expect(tab(0)).toHaveAttribute('aria-controls', 'feed');
    expect(tab(1)).toHaveAttribute('aria-controls', 'feed');
  });

  it('declares every part the contract names', () => {
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="Pedido">
          <Tab dismissLabel="Fechar" dismissible value="a">
            A
          </Tab>
        </TabList>
        <TabActions>ação</TabActions>
        <TabPanel value="a">a</TabPanel>
      </Tabs>,
    );

    const drawn = new Set(
      [...root().querySelectorAll('[data-part]')].map((node) => node.getAttribute('data-part')),
    );
    drawn.add(root().getAttribute('data-part'));

    for (const part of contract.members.tabs.parts) {
      /* The paging controls exist only while the list overflows, which needs a
         layout engine; the harness fragment is where they are photographed. */
      if (part === 'scroll') continue;
      expect(drawn).toContain(part);
    }
  });

  /** `mount="active"` is the default: only the selected panel exists. */
  it('builds one panel at a time by default', () => {
    render(<Basic />);

    expect(panels()).toHaveLength(1);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('painel a');
  });

  it('keeps every panel once it has been seen, under lazy', () => {
    render(<Basic mount="lazy" />);

    fireEvent.click(tab(1), { detail: 1 });

    expect(panels()).toHaveLength(2);
    expect(panels()[0]).toHaveAttribute('hidden');
    expect(panels()[1]).not.toHaveAttribute('hidden');
  });

  it('builds every panel up front, under eager', () => {
    render(<Basic mount="eager" />);

    expect(panels()).toHaveLength(3);
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });

  /**
   * "When focus moves into the tab list, places focus on the active tab
   * element." One stop for the whole list, and it is the selected tab.
   */
  it('holds one tab stop, on the selected tab', () => {
    render(<Basic defaultValue="b" />);

    expect(tab(0)).toHaveAttribute('tabindex', '-1');
    expect(tab(1)).toHaveAttribute('tabindex', '0');
    expect(tab(2)).toHaveAttribute('tabindex', '-1');
  });

  it('moves and selects with the arrows, and wraps at both ends', () => {
    render(<Basic />);

    tab(0).focus();
    press(tab(0), 'ArrowRight');
    expect(tab(1)).toHaveFocus();
    expect(tab(1)).toHaveAttribute('aria-selected', 'true');

    press(tab(1), 'ArrowLeft');
    press(tab(0), 'ArrowLeft');
    expect(tab(2)).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('painel c');
  });

  /**
   * "If the tab list is horizontal, it does not listen for Down Arrow or Up
   * Arrow so those keys can provide their normal browser scrolling functions."
   */
  it('leaves the cross axis to the page in a horizontal list', () => {
    render(<Basic />);

    tab(0).focus();
    press(tab(0), 'ArrowDown');

    expect(tab(0)).toHaveFocus();
    expect(tab(0)).toHaveAttribute('aria-selected', 'true');
  });

  it('answers the cross axis instead when the list is vertical', () => {
    render(<Basic orientation="vertical" />);

    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    tab(0).focus();
    press(tab(0), 'ArrowDown');

    expect(tab(1)).toHaveFocus();
  });

  it('reaches both ends with Home and End', () => {
    render(<Basic defaultValue="b" />);

    tab(1).focus();
    press(tab(1), 'End');
    expect(tab(2)).toHaveFocus();

    press(tab(2), 'Home');
    expect(tab(0)).toHaveFocus();
  });

  /**
   * "Space or Enter: Activates the tab if it was not activated automatically on
   * focus." Manual activation moves focus and leaves the panel alone.
   */
  it('separates focus from selection under manual activation', () => {
    render(<Basic activation="manual" />);

    tab(0).focus();
    press(tab(0), 'ArrowRight');
    expect(tab(1)).toHaveFocus();
    expect(tab(1)).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('painel a');

    /* `Enter` on a button is a click with no detail, which is what the browser
       synthesises and what the family reads the reason from. */
    fireEvent.click(tab(1), { detail: 0 });
    expect(tab(1)).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('painel b');
  });

  it('says why the value moved, and which device asked', () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);

    fireEvent.click(tab(1), { detail: 1 });
    expect(onValueChange.mock.calls[0]?.[0]).toBe('b');
    expect(onValueChange.mock.calls[0]?.[1].reason).toBe('pointer');
    expect(onValueChange.mock.calls[0]?.[1].previous).toBe('a');

    fireEvent.click(tab(2), { detail: 0 });
    expect(onValueChange.mock.calls[1]?.[1].reason).toBe('keyboard');
  });

  /** No surveyed tabs implementation can refuse a change before it commits. */
  it('lets the consumer refuse the change before anything moves', () => {
    render(<Basic onValueChange={(_value, request) => request.cancel()} />);

    fireEvent.click(tab(1), { detail: 1 });

    expect(tab(0)).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('painel a');
  });

  it('waits for the consumer while the value is theirs', () => {
    function Controlled() {
      const [value, setValue] = useState('a');
      return (
        <>
          <Basic onValueChange={setValue} value={value} />
          <p>value: {value}</p>
        </>
      );
    }
    render(<Controlled />);

    fireEvent.click(tab(2), { detail: 1 });

    expect(screen.getByText('value: c')).toBeInTheDocument();
    expect(tab(2)).toHaveAttribute('aria-selected', 'true');
  });

  it('never moves a value the consumer owns on its own', () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} value="a" />);

    fireEvent.click(tab(1), { detail: 1 });

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(tab(0)).toHaveAttribute('aria-selected', 'true');
  });

  it('skips a disabled tab with the arrows and refuses its click', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="a" onValueChange={onValueChange}>
        <TabList aria-label="Pedido">
          <Tab value="a">A</Tab>
          <Tab disabled value="b">
            B
          </Tab>
          <Tab value="c">C</Tab>
        </TabList>
        <TabPanel value="a">a</TabPanel>
      </Tabs>,
    );

    tab(0).focus();
    press(tab(0), 'ArrowRight');
    expect(tab(2)).toHaveFocus();

    fireEvent.click(tab(1), { detail: 1 });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0]).toBe('c');
  });

  it('reaches every tab with the native attribute when the family is out of action', () => {
    render(<Basic disabled />);

    for (const item of tabs()) expect(item).toBeDisabled();
    expect(root()).toHaveAttribute('data-disabled', '');
  });

  /** The APG's own focus rule for `Delete`, applied to the value as well. */
  it('dismisses with Delete and leaves the selection to the neighbour', () => {
    const onTabDismiss = vi.fn();
    const onValueChange = vi.fn();

    render(
      <Tabs defaultValue="a" onTabDismiss={onTabDismiss} onValueChange={onValueChange}>
        <TabList aria-label="Consultas">
          <Tab dismissLabel="Fechar A" dismissible value="a">
            A
          </Tab>
          <Tab dismissLabel="Fechar B" dismissible value="b">
            B
          </Tab>
        </TabList>
        <TabPanel value="a">a</TabPanel>
      </Tabs>,
    );

    expect(tab(0)).toHaveAttribute('aria-keyshortcuts', 'Delete');
    tab(0).focus();
    press(tab(0), 'Delete');

    expect(onTabDismiss.mock.calls[0]?.[0]).toBe('a');
    expect(onTabDismiss.mock.calls[0]?.[1].reason).toBe('keyboard');
    expect(onValueChange.mock.calls[0]?.[0]).toBe('b');
    expect(onValueChange.mock.calls[0]?.[1].reason).toBe('remove');
  });

  /** The tab before it, when the dismissed one was last. */
  it('falls back to the preceding tab when the last one is dismissed', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="b" onValueChange={onValueChange}>
        <TabList aria-label="Consultas">
          <Tab dismissLabel="Fechar A" dismissible value="a">
            A
          </Tab>
          <Tab dismissLabel="Fechar B" dismissible value="b">
            B
          </Tab>
        </TabList>
        <TabPanel value="b">b</TabPanel>
      </Tabs>,
    );

    tab(1).focus();
    press(tab(1), 'Delete');

    expect(onValueChange.mock.calls[0]?.[0]).toBe('a');
  });

  it('does not repeat a dismissal while the key is held', () => {
    const onTabDismiss = vi.fn();
    render(
      <Tabs defaultValue="a" onTabDismiss={onTabDismiss}>
        <TabList aria-label="Consultas">
          <Tab dismissLabel="Fechar A" dismissible value="a">
            A
          </Tab>
        </TabList>
        <TabPanel value="a">a</TabPanel>
      </Tabs>,
    );

    tab(0).focus();
    press(tab(0), 'Delete', { repeat: true });

    expect(onTabDismiss).not.toHaveBeenCalled();
  });

  it('dismisses from the control without selecting the tab it closes', () => {
    const onTabDismiss = vi.fn();
    const onValueChange = vi.fn();

    render(
      <Tabs defaultValue="a" onTabDismiss={onTabDismiss} onValueChange={onValueChange}>
        <TabList aria-label="Consultas">
          <Tab dismissLabel="Fechar A" dismissible value="a">
            A
          </Tab>
          <Tab dismissLabel="Fechar B" dismissible value="b">
            B
          </Tab>
        </TabList>
        <TabPanel value="a">a</TabPanel>
      </Tabs>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fechar B' }), { detail: 1 });

    expect(onTabDismiss.mock.calls[0]?.[0]).toBe('b');
    expect(onTabDismiss.mock.calls[0]?.[1].reason).toBe('pointer');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps the dismiss control out of the arrow ring and inside the tree', () => {
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="Consultas">
          <Tab dismissLabel="Fechar A" dismissible value="a">
            A
          </Tab>
        </TabList>
        <TabPanel value="a">a</TabPanel>
      </Tabs>,
    );

    const dismiss = screen.getByRole('button', { name: 'Fechar A' });
    expect(dismiss).toHaveAttribute('tabindex', '-1');
    expect(dismiss).not.toHaveAttribute('aria-hidden');
  });

  it('lets a dismissal be refused', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs
        defaultValue="a"
        onTabDismiss={(_value, request) => request.cancel()}
        onValueChange={onValueChange}
      >
        <TabList aria-label="Consultas">
          <Tab dismissLabel="Fechar A" dismissible value="a">
            A
          </Tab>
          <Tab dismissLabel="Fechar B" dismissible value="b">
            B
          </Tab>
        </TabList>
        <TabPanel value="a">a</TabPanel>
      </Tabs>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fechar A' }), { detail: 1 });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  /**
   * A modifier click on a link is the reader asking the browser for a new
   * window, and swallowing it is what turns a real destination into a
   * decoration.
   */
  it('makes a tab a link, and leaves a modifier click to the browser', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="a" onValueChange={onValueChange}>
        <TabList aria-label="Pedido">
          <Tab href="/resumo" value="a">
            A
          </Tab>
          <Tab href="/itens" value="b">
            B
          </Tab>
        </TabList>
        <TabPanel value="a">a</TabPanel>
      </Tabs>,
    );

    expect(tab(1)).toHaveAttribute('href', '/itens');

    fireEvent.click(tab(1), { detail: 1, metaKey: true });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.click(tab(1), { detail: 1 });
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('records which way the selection travelled', () => {
    render(<Basic defaultValue="b" />);

    expect(root()).toHaveAttribute('data-activation-direction', 'none');
    fireEvent.click(tab(2), { detail: 1 });
    expect(root()).toHaveAttribute('data-activation-direction', 'forward');
    fireEvent.click(tab(0), { detail: 1 });
    expect(root()).toHaveAttribute('data-activation-direction', 'backward');
  });

  it('composes with a consumer handler rather than replacing it', () => {
    const onClick = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="a" onValueChange={onValueChange}>
        <TabList aria-label="Pedido">
          <Tab value="a">A</Tab>
          <Tab onClick={onClick} value="b">
            B
          </Tab>
        </TabList>
        <TabPanel value="a">a</TabPanel>
      </Tabs>,
    );

    fireEvent.click(tab(1), { detail: 1 });

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('lets a consumer handler refuse the selection with preventDefault', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="a" onValueChange={onValueChange}>
        <TabList aria-label="Pedido">
          <Tab value="a">A</Tab>
          <Tab onClick={(event) => event.preventDefault()} value="b">
            B
          </Tab>
        </TabList>
        <TabPanel value="a">a</TabPanel>
      </Tabs>,
    );

    fireEvent.click(tab(1), { detail: 1 });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('takes the defaults an application sets once', () => {
    render(
      <TabsDefaultsProvider size="sm" variant="contained">
        <Basic />
      </TabsDefaultsProvider>,
    );

    expect(root()).toHaveAttribute('data-size', 'sm');
    expect(root()).toHaveAttribute('data-variant', 'contained');
  });

  it('lets the family state its own axis over the provider', () => {
    render(
      <TabsDefaultsProvider size="sm">
        <Basic size="lg" />
      </TabsDefaultsProvider>,
    );

    expect(root()).toHaveAttribute('data-size', 'lg');
  });

  it('substitutes the element of every part it exposes', () => {
    render(
      <Tabs defaultValue="a" render={(props) => <section {...props} />}>
        <TabList aria-label="Pedido" render={(props) => <nav {...props} />}>
          <Tab render={(props) => <span {...props} />} value="a">
            A
          </Tab>
        </TabList>
        <TabPanel render={(props) => <article {...props} />} value="a">
          a
        </TabPanel>
        <TabActions render={(props) => <aside {...props} />}>ação</TabActions>
      </Tabs>,
    );

    expect(document.querySelector('section[data-ui="tabs"]')).toBeInTheDocument();
    expect(document.querySelector('nav[data-part="list"]')).toBeInTheDocument();
    expect(document.querySelector('span[data-part="item"]')).toBeInTheDocument();
    expect(document.querySelector('article[data-part="panel"]')).toBeInTheDocument();
    expect(document.querySelector('aside[data-part="actions"]')).toBeInTheDocument();
  });

  it('refuses a tab outside a family rather than rendering a dead control', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Tab value="a">A</Tab>)).toThrow(/inside Tabs/);

    quiet.mockRestore();
  });

  /** Two values that differ only in a character an identifier refuses. */
  it('never wires two tabs to one panel', () => {
    render(
      <Tabs defaultValue="a b" mount="eager">
        <TabList aria-label="Pedido">
          <Tab value="a b">A</Tab>
          <Tab value="a_b">B</Tab>
        </TabList>
        <TabPanel value="a b">primeiro</TabPanel>
        <TabPanel value="a_b">segundo</TabPanel>
      </Tabs>,
    );

    expect(tab(0).getAttribute('aria-controls')).not.toBe(tab(1).getAttribute('aria-controls'));
    expect(screen.getByText('primeiro')).toBeInTheDocument();
  });
});
