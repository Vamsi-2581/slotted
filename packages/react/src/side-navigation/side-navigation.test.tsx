import { PT_BR } from '@slotted/core/i18n/pt-BR';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/side-navigation/contract.json';
import { AppShell, AppShellNav, AppShellNavBody } from '../app-shell';
import { SlottedProvider } from '../i18n';
import { SideNavigation } from './side-navigation';
import { SideNavigationDefaultsProvider } from './side-navigation-defaults';
import {
  SideNavigationActions,
  SideNavigationCount,
  SideNavigationDescription,
  SideNavigationDivider,
  SideNavigationEnd,
  SideNavigationGroup,
  SideNavigationIcon,
  SideNavigationItem,
  SideNavigationLabel,
  SideNavigationLink,
  SideNavigationList,
  SideNavigationSection,
  SideNavigationSectionLabel,
  SideNavigationSkeleton,
  SideNavigationTrigger,
} from './side-navigation-parts';
import type { SideNavigationProps } from './side-navigation.types';

function Column(props: Partial<SideNavigationProps>) {
  return (
    <SideNavigation {...props}>
      <SideNavigationSection>
        <SideNavigationSectionLabel>Operações</SideNavigationSectionLabel>
        <SideNavigationList>
          <SideNavigationItem value="painel">
            <SideNavigationLink href="#painel">
              <SideNavigationIcon>
                <svg aria-hidden="true" />
              </SideNavigationIcon>
              <SideNavigationLabel>Painel</SideNavigationLabel>
            </SideNavigationLink>
          </SideNavigationItem>
          <SideNavigationItem value="cargas">
            <SideNavigationLink href="#cargas">
              <SideNavigationLabel>Cargas</SideNavigationLabel>
              <SideNavigationCount>12</SideNavigationCount>
            </SideNavigationLink>
          </SideNavigationItem>
          <SideNavigationItem value="entregas">
            <SideNavigationTrigger>
              <SideNavigationLabel>Entregas</SideNavigationLabel>
              <SideNavigationEnd>38</SideNavigationEnd>
            </SideNavigationTrigger>
            <SideNavigationGroup>
              <SideNavigationItem value="hoje">
                <SideNavigationLink href="#hoje">
                  <SideNavigationLabel>Hoje</SideNavigationLabel>
                </SideNavigationLink>
              </SideNavigationItem>
              <SideNavigationItem value="atrasadas">
                <SideNavigationLink href="#atrasadas">
                  <SideNavigationLabel>Atrasadas</SideNavigationLabel>
                  <SideNavigationDescription>3 fora do prazo</SideNavigationDescription>
                </SideNavigationLink>
              </SideNavigationItem>
            </SideNavigationGroup>
          </SideNavigationItem>
          <SideNavigationItem value="config">
            <SideNavigationTrigger>
              <SideNavigationLabel>Configurações</SideNavigationLabel>
            </SideNavigationTrigger>
            <SideNavigationGroup>
              <SideNavigationItem value="org">
                <SideNavigationLink href="#org">
                  <SideNavigationLabel>Organização</SideNavigationLabel>
                </SideNavigationLink>
              </SideNavigationItem>
            </SideNavigationGroup>
          </SideNavigationItem>
          <SideNavigationDivider />
          <SideNavigationItem disabled value="faturacao">
            <SideNavigationLink href="#faturacao">
              <SideNavigationLabel>Faturação</SideNavigationLabel>
            </SideNavigationLink>
            <SideNavigationActions>
              <button type="button">Pedir</button>
            </SideNavigationActions>
          </SideNavigationItem>
          <SideNavigationSkeleton />
        </SideNavigationList>
      </SideNavigationSection>
    </SideNavigation>
  );
}

const root = () => document.querySelector('[data-ui="side-navigation"]') as HTMLElement;
const item = (value: string) =>
  document.querySelector(`[data-part="item"][data-value="${value}"]`) as HTMLElement;
const link = (value: string) => item(value).querySelector('[data-part="link"]') as HTMLElement;
const trigger = (value: string) =>
  item(value).querySelector(':scope > [data-part="trigger"]') as HTMLElement;

describe('SideNavigation', () => {
  it('renders every part the contract declares, and the flyout only in the rail', () => {
    render(<Column defaultExpanded={['entregas']} />);
    for (const part of contract.members.sideNavigation.parts) {
      if (part === 'flyout') continue;
      expect(document.querySelector(`[data-part="${part}"]`), part).not.toBeNull();
    }
    expect(root().tagName).toBe('NAV');
    expect(root()).toHaveAttribute('aria-label', 'Navigation');
    expect(root()).toHaveAttribute('data-mode', 'auto');
    expect(root()).toHaveAttribute('data-truncate', 'end');
  });

  it('speaks the language in force, and lays its own messages over it', () => {
    const { rerender } = render(
      <SlottedProvider locale="pt-BR" catalogs={{ 'pt-BR': PT_BR }}>
        <Column />
      </SlottedProvider>,
    );
    expect(root()).toHaveAttribute('aria-label', 'Navegação');

    rerender(
      <SlottedProvider locale="pt-BR" catalogs={{ 'pt-BR': PT_BR }}>
        <Column messages={{ navigation: 'Menu' }} />
      </SlottedProvider>,
    );
    expect(root()).toHaveAttribute('aria-label', 'Menu');
  });

  /** The shell's nav region is already the navigation landmark. */
  it('is a div inside app-shell and a nav on its own, unless told otherwise', () => {
    const { unmount } = render(
      <AppShell navMode="inline">
        <AppShellNav>
          <AppShellNavBody>
            <Column />
          </AppShellNavBody>
        </AppShellNav>
      </AppShell>,
    );
    expect(root().tagName).toBe('DIV');
    expect(root()).not.toHaveAttribute('aria-label');
    unmount();

    render(<Column landmark={false} />);
    expect(root().tagName).toBe('DIV');
  });

  /**
   * The anatomy names the root only while it is the landmark. A name written
   * on the div inside the shell would repeat the nav region's own on an
   * element that is not a landmark, which `SlSideNavigation` never writes.
   */
  it('drops a written name when the root is not the landmark', () => {
    const { unmount } = render(
      <AppShell navMode="inline">
        <AppShellNav>
          <AppShellNavBody>
            <Column aria-label="Main navigation" />
          </AppShellNavBody>
        </AppShellNav>
      </AppShell>,
    );
    expect(root().tagName).toBe('DIV');
    expect(root()).not.toHaveAttribute('aria-label');
    unmount();

    render(<Column aria-label="Main navigation" landmark={false} />);
    expect(root()).not.toHaveAttribute('aria-label');
  });

  it('wires each trigger to its group, and names the group by the row', () => {
    render(<Column />);
    const group = item('entregas').querySelector('[data-part="group"]') as HTMLElement;
    expect(trigger('entregas')).toHaveAttribute('aria-expanded', 'false');
    expect(trigger('entregas').getAttribute('aria-controls')).toBe(group.id);
    const label = trigger('entregas').querySelector('[data-part="label"]') as HTMLElement;
    expect(group.getAttribute('aria-labelledby')).toBe(label.id);
    expect(trigger('entregas').querySelector('[data-part="indicator"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    const box = trigger('entregas').querySelector('[data-part="indicator"] > [data-ui="icon"]');
    expect(box).toHaveAttribute('data-directional');
    expect(box?.querySelector('svg[data-glyph="chevron-right"]')).not.toBeNull();
  });

  it('opens and closes a group with the reason the device gave', () => {
    const onExpandedChange = vi.fn();
    render(<Column onExpandedChange={onExpandedChange} />);
    fireEvent.click(trigger('entregas'), { detail: 1 });
    expect(item('entregas')).toHaveAttribute('data-expanded');
    expect(onExpandedChange).toHaveBeenLastCalledWith(
      ['entregas'],
      expect.objectContaining({ reason: 'pointer' }),
    );
    fireEvent.click(trigger('entregas'), { detail: 0 });
    expect(item('entregas')).not.toHaveAttribute('data-expanded');
    expect(onExpandedChange).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ reason: 'keyboard' }),
    );
  });

  it('closes a sibling with the reason select under multiple=false', () => {
    const onExpandedChange = vi.fn();
    render(
      <Column
        defaultExpanded={['entregas']}
        multiple={false}
        onExpandedChange={onExpandedChange}
      />,
    );
    fireEvent.click(trigger('config'), { detail: 1 });
    expect(onExpandedChange).toHaveBeenLastCalledWith(
      ['config'],
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(item('entregas')).not.toHaveAttribute('data-expanded');
    expect(item('config')).toHaveAttribute('data-expanded');
  });

  it('keeps a controlled set where the consumer put it', () => {
    const onExpandedChange = vi.fn();
    render(<Column expanded={['config']} onExpandedChange={onExpandedChange} />);
    fireEvent.click(trigger('entregas'), { detail: 1 });
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(item('entregas')).not.toHaveAttribute('data-expanded');
    expect(item('config')).toHaveAttribute('data-expanded');
  });

  it('marks the current destination on the link and asks value to move on a press', () => {
    const onValueChange = vi.fn();
    render(<Column defaultValue="painel" onValueChange={onValueChange} />);
    expect(link('painel')).toHaveAttribute('aria-current', 'page');
    expect(link('painel')).toHaveAttribute('data-current');
    expect(item('painel')).toHaveAttribute('data-current');
    fireEvent.click(link('cargas'), { detail: 1 });
    expect(onValueChange).toHaveBeenCalledWith(
      'cargas',
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(link('cargas')).toHaveAttribute('aria-current', 'page');
    expect(link('painel')).not.toHaveAttribute('aria-current');
  });

  /** A router's own link says where the reader is, and it wins. */
  it('lets a link state current itself, over the root value', () => {
    render(
      <SideNavigation defaultValue="a">
        <SideNavigationList>
          <SideNavigationItem value="a">
            <SideNavigationLink current={false} href="#a">
              <SideNavigationLabel>A</SideNavigationLabel>
            </SideNavigationLink>
          </SideNavigationItem>
          <SideNavigationItem value="b">
            <SideNavigationLink current href="#b">
              <SideNavigationLabel>B</SideNavigationLabel>
            </SideNavigationLink>
          </SideNavigationItem>
        </SideNavigationList>
      </SideNavigation>,
    );
    expect(link('a')).not.toHaveAttribute('aria-current');
    expect(link('b')).toHaveAttribute('aria-current', 'page');
  });

  it('marks the parent of the current destination only while its group is closed', () => {
    render(<Column defaultValue="hoje" autoExpand={false} />);
    expect(item('entregas')).toHaveAttribute('data-current');
    fireEvent.click(trigger('entregas'), { detail: 1 });
    expect(item('entregas')).not.toHaveAttribute('data-current');
    expect(link('hoje')).toHaveAttribute('aria-current', 'page');
  });

  it('opens the ancestors of the current destination with the reason select', () => {
    const onExpandedChange = vi.fn();
    function App() {
      const [value, setValue] = useState<string | null>('painel');
      return (
        <>
          <button onClick={() => setValue('org')} type="button">
            ir
          </button>
          <Column onExpandedChange={onExpandedChange} value={value} onValueChange={setValue} />
        </>
      );
    }
    render(<App />);
    expect(item('config')).not.toHaveAttribute('data-expanded');
    fireEvent.click(screen.getByText('ir'));
    expect(onExpandedChange).toHaveBeenCalledWith(
      ['config'],
      expect.objectContaining({ reason: 'select' }),
    );
  });

  it('refuses a disabled link and keeps its destination in the DOM', () => {
    const onValueChange = vi.fn();
    render(<Column onValueChange={onValueChange} />);
    expect(link('faturacao')).toHaveAttribute('aria-disabled', 'true');
    expect(link('faturacao')).toHaveAttribute('href', '#faturacao');
    expect(item('faturacao')).toHaveAttribute('data-disabled');
    fireEvent.click(link('faturacao'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  /** The APG hybrid row: a destination and its own disclosure button beside it. */
  it('names a trigger beside a link by the row label', () => {
    render(
      <SideNavigation>
        <SideNavigationList>
          <SideNavigationItem value="rel">
            <SideNavigationLink href="#rel">
              <SideNavigationLabel>Relatórios</SideNavigationLabel>
            </SideNavigationLink>
            <SideNavigationTrigger />
            <SideNavigationGroup>
              <SideNavigationItem value="mensal">
                <SideNavigationLink href="#mensal">
                  <SideNavigationLabel>Mensal</SideNavigationLabel>
                </SideNavigationLink>
              </SideNavigationItem>
            </SideNavigationGroup>
          </SideNavigationItem>
        </SideNavigationList>
      </SideNavigation>,
    );
    const label = link('rel').querySelector('[data-part="label"]') as HTMLElement;
    expect(trigger('rel').getAttribute('aria-labelledby')).toBe(label.id);
    expect(screen.getByRole('button', { name: 'Relatórios' })).toBe(trigger('rel'));
  });

  /** A command in the column is a button with the same row, and never current. */
  it('renders a link without href as a button', () => {
    render(
      <SideNavigation defaultValue="novo">
        <SideNavigationList>
          <SideNavigationItem value="novo">
            <SideNavigationLink>
              <SideNavigationLabel>Nova carga</SideNavigationLabel>
            </SideNavigationLink>
          </SideNavigationItem>
        </SideNavigationList>
      </SideNavigation>,
    );
    expect(link('novo').tagName).toBe('BUTTON');
    expect(link('novo')).not.toHaveAttribute('aria-current');
  });

  it('walks the visible rows with the arrow keys, Home and End', () => {
    render(<Column defaultExpanded={['entregas']} />);
    link('painel').focus();
    fireEvent.keyDown(link('painel'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(link('cargas'));
    fireEvent.keyDown(link('cargas'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(trigger('entregas'));
    fireEvent.keyDown(trigger('entregas'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(link('hoje'));
    fireEvent.keyDown(link('hoje'), { key: 'End' });
    expect(document.activeElement).toBe(link('faturacao'));
    fireEvent.keyDown(link('faturacao'), { key: 'Home' });
    expect(document.activeElement).toBe(link('painel'));
    fireEvent.keyDown(link('painel'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(link('painel'));
  });

  it('skips the rows of a closed group', () => {
    render(<Column />);
    trigger('entregas').focus();
    fireEvent.keyDown(trigger('entregas'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(trigger('config'));
  });

  it('closes the group holding focus on Escape and lands on its trigger', () => {
    const onExpandedChange = vi.fn();
    render(<Column defaultExpanded={['entregas']} onExpandedChange={onExpandedChange} />);
    link('hoje').focus();
    fireEvent.keyDown(link('hoje'), { key: 'Escape' });
    expect(onExpandedChange).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ reason: 'escape' }),
    );
    expect(document.activeElement).toBe(trigger('entregas'));
  });

  it('is a rail under mode=compact, where a trigger opens the flyout', () => {
    const onFlyoutChange = vi.fn();
    render(<Column mode="compact" onFlyoutChange={onFlyoutChange} />);
    expect(root()).toHaveAttribute('data-compact');
    fireEvent.click(trigger('entregas'), { detail: 1 });
    expect(onFlyoutChange).toHaveBeenLastCalledWith(
      'entregas',
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(item('entregas')).toHaveAttribute('data-open');
    expect(item('entregas')).not.toHaveAttribute('data-expanded');
    const layer = document.querySelector('[data-ui="side-navigation"][data-part="flyout"]');
    expect(layer).not.toBeNull();
    expect(layer?.querySelector('[data-part="group"]')).not.toBeNull();
    fireEvent.click(layer?.querySelector('[data-part="link"]') as HTMLElement, { detail: 1 });
    expect(onFlyoutChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: 'select' }),
    );
  });

  it('reads its defaults from the provider, and a prop still wins', () => {
    render(
      <SideNavigationDefaultsProvider guides={false} size="sm" truncate="none">
        <Column size="lg" />
      </SideNavigationDefaultsProvider>,
    );
    expect(root()).toHaveAttribute('data-size', 'lg');
    expect(root()).toHaveAttribute('data-truncate', 'none');
    expect(root()).not.toHaveAttribute('data-guides');
  });

  it('composes the consumer handler and lets preventDefault refuse', () => {
    const onValueChange = vi.fn();
    render(
      <SideNavigation onValueChange={onValueChange}>
        <SideNavigationList>
          <SideNavigationItem value="a">
            <SideNavigationLink href="#a" onClick={(event) => event.preventDefault()}>
              <SideNavigationLabel>A</SideNavigationLabel>
            </SideNavigationLink>
          </SideNavigationItem>
        </SideNavigationList>
      </SideNavigation>,
    );
    fireEvent.click(link('a'));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

/**
 * An application that routes in state, not in the URL, draws its destinations
 * as buttons through `render`. The root props are typed for any element, so
 * the row can be one without a cast, and it is still a destination.
 */
describe('SideNavigationLink rendered as a button', () => {
  it('compiles, selects, and marks the current destination', () => {
    function Routed() {
      const [page, setPage] = useState('orders');
      return (
        <SideNavigation value={page} onValueChange={(next) => next !== null && setPage(next)}>
          <SideNavigationList>
            <SideNavigationItem value="orders">
              <SideNavigationLink render={(props) => <button {...props} type="button" />}>
                <SideNavigationLabel>Orders</SideNavigationLabel>
              </SideNavigationLink>
            </SideNavigationItem>
            <SideNavigationItem value="invoices">
              <SideNavigationLink render={(props) => <button {...props} type="button" />}>
                <SideNavigationLabel>Invoices</SideNavigationLabel>
              </SideNavigationLink>
            </SideNavigationItem>
          </SideNavigationList>
        </SideNavigation>
      );
    }
    render(<Routed />);

    fireEvent.click(screen.getByRole('button', { name: 'Invoices' }));

    expect(screen.getByRole('button', { name: 'Invoices' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Orders' })).not.toHaveAttribute('aria-current');
  });
});
