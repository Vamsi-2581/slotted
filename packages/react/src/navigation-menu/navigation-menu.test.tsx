import { PT_BR } from '@slotted/core/i18n/pt-BR';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/navigation-menu/contract.json';
import { SlottedProvider } from '../i18n';
import { NavigationMenu } from './navigation-menu';
import { NavigationMenuDefaultsProvider } from './navigation-menu-defaults';
import {
  NavigationMenuContent,
  NavigationMenuDescription,
  NavigationMenuFooter,
  NavigationMenuGroup,
  NavigationMenuGroupLabel,
  NavigationMenuIcon,
  NavigationMenuItem,
  NavigationMenuLabel,
  NavigationMenuLink,
  NavigationMenuLinks,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './navigation-menu-parts';
import type { NavigationMenuProps } from './navigation-menu.types';

function Menu(props: Partial<NavigationMenuProps>) {
  return (
    <NavigationMenu aria-label="Principal" {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="produtos">
          <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
          <NavigationMenuContent columns={2}>
            <NavigationMenuLinks>
              <li>
                <NavigationMenuLink href="#armazem">
                  <NavigationMenuIcon>
                    <svg />
                  </NavigationMenuIcon>
                  <NavigationMenuLabel>Armazém</NavigationMenuLabel>
                  <NavigationMenuDescription>Entradas e saídas.</NavigationMenuDescription>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink current href="#frota">
                  Frota
                </NavigationMenuLink>
              </li>
            </NavigationMenuLinks>
            <NavigationMenuFooter>
              <a href="#todos">Ver todos</a>
            </NavigationMenuFooter>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="documentacao">
          <NavigationMenuLink href="#documentacao">Documentação</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="empresa">
          <NavigationMenuTrigger>Empresa</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuGroup>
              <NavigationMenuGroupLabel>Sobre</NavigationMenuGroupLabel>
              <NavigationMenuLinks>
                <li>
                  <NavigationMenuLink href="#sobre">Sobre nós</NavigationMenuLink>
                </li>
              </NavigationMenuLinks>
            </NavigationMenuGroup>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem disabled value="parceiros">
          <NavigationMenuTrigger>Parceiros</NavigationMenuTrigger>
          <NavigationMenuContent />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const trigger = (name: string) => screen.getByRole('button', { name });

afterEach(() => vi.useRealTimers());

describe('NavigationMenu', () => {
  it('renders every part the contract declares, with the identity a consumer selects by', () => {
    const { container } = render(<Menu arrow defaultValue="produtos" />);
    const root = container.querySelector('[data-ui="navigation-menu"]');
    expect(root?.tagName).toBe('NAV');
    for (const part of contract.members.navigationMenu.parts) {
      if (part === 'root') continue;
      expect(container.querySelector(`[data-part="${part}"]`), part).not.toBeNull();
    }
  });

  it('is a disclosure: a button with aria-expanded and aria-controls, a panel after it, no menu role', () => {
    const { container } = render(<Menu />);
    const button = trigger('Produtos');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
    expect(panel).toHaveAttribute('hidden');
    expect(button.nextElementSibling).toBe(panel);
    expect(container.querySelector('[role^="menu"]')).toBeNull();
  });

  it('names its landmark from the catalog, in the language in force', () => {
    render(
      <SlottedProvider locale="pt-BR" catalogs={{ 'pt-BR': PT_BR }}>
        <NavigationMenu>
          <NavigationMenuList />
        </NavigationMenu>
      </SlottedProvider>,
    );
    expect(screen.getByRole('navigation', { name: 'Navegação' })).toBeInTheDocument();
  });

  it('opens and closes a section by click, asking with the reason pointer', () => {
    const onValueChange = vi.fn();
    render(<Menu onValueChange={onValueChange} />);
    fireEvent.click(trigger('Produtos'), { detail: 1 });
    expect(trigger('Produtos')).toHaveAttribute('aria-expanded', 'true');
    expect(onValueChange).toHaveBeenLastCalledWith(
      'produtos',
      expect.objectContaining({ reason: 'pointer' }),
    );
    fireEvent.click(trigger('Produtos'), { detail: 1 });
    expect(onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: 'pointer' }),
    );
  });

  it('tells a key from a pointer by the click a key synthesises', () => {
    const onValueChange = vi.fn();
    render(<Menu onValueChange={onValueChange} />);
    fireEvent.click(trigger('Empresa'), { detail: 0 });
    expect(onValueChange).toHaveBeenLastCalledWith(
      'empresa',
      expect.objectContaining({ reason: 'keyboard' }),
    );
  });

  it('leaves a controlled value to the consumer', () => {
    const onValueChange = vi.fn();
    render(<Menu onValueChange={onValueChange} value={null} />);
    fireEvent.click(trigger('Produtos'), { detail: 1 });
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(trigger('Produtos')).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the section when the request is cancelled', () => {
    render(<Menu onValueChange={(_, request) => request.cancel()} />);
    fireEvent.click(trigger('Produtos'), { detail: 1 });
    expect(trigger('Produtos')).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens by hover after the delay, switches without it, and never on touch', () => {
    vi.useFakeTimers();
    render(<Menu />);
    fireEvent.pointerEnter(trigger('Produtos'), { pointerType: 'touch' });
    act(() => vi.advanceTimersByTime(500));
    expect(trigger('Produtos')).toHaveAttribute('aria-expanded', 'false');

    fireEvent.pointerEnter(trigger('Produtos'), { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(199));
    expect(trigger('Produtos')).toHaveAttribute('aria-expanded', 'false');
    act(() => vi.advanceTimersByTime(1));
    expect(trigger('Produtos')).toHaveAttribute('aria-expanded', 'true');

    fireEvent.pointerEnter(trigger('Empresa'), { pointerType: 'mouse' });
    expect(trigger('Empresa')).toHaveAttribute('aria-expanded', 'true');
  });

  it('reads the hover delay an application set once', () => {
    vi.useFakeTimers();
    render(
      <NavigationMenuDefaultsProvider openDelay={50}>
        <Menu />
      </NavigationMenuDefaultsProvider>,
    );
    fireEvent.pointerEnter(trigger('Produtos'), { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(50));
    expect(trigger('Produtos')).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on Escape and returns focus to the trigger', () => {
    const onValueChange = vi.fn();
    render(<Menu defaultValue="produtos" onValueChange={onValueChange} />);
    const link = screen.getByRole('link', { name: /Armazém/ });
    link.focus();
    fireEvent.keyDown(link, { key: 'Escape' });
    expect(onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: 'escape' }),
    );
    expect(trigger('Produtos')).toHaveFocus();
  });

  it('closes with the reason blur when focus leaves the root', () => {
    const onValueChange = vi.fn();
    render(
      <>
        <Menu defaultValue="produtos" onValueChange={onValueChange} />
        <button type="button">Fora</button>
      </>,
    );
    const link = screen.getByRole('link', { name: /Armazém/ });
    fireEvent.blur(link, { relatedTarget: screen.getByRole('button', { name: 'Fora' }) });
    expect(onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: 'blur' }),
    );
  });

  it('closes when a panel link is followed, unless the link says otherwise', () => {
    const onValueChange = vi.fn();
    render(<Menu defaultValue="produtos" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('link', { name: 'Frota' }));
    expect(onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: 'select' }),
    );
  });

  it('walks the row with the arrows and enters an open panel with ArrowDown', () => {
    render(<Menu defaultValue="produtos" />);
    trigger('Produtos').focus();
    fireEvent.keyDown(trigger('Produtos'), { key: 'ArrowRight' });
    expect(screen.getByRole('link', { name: 'Documentação' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('link', { name: 'Documentação' }), { key: 'ArrowLeft' });
    expect(trigger('Produtos')).toHaveFocus();
    fireEvent.keyDown(trigger('Produtos'), { key: 'ArrowDown' });
    expect(screen.getByRole('link', { name: /Armazém/ })).toHaveFocus();
  });

  it('marks the current link and the section that holds it', () => {
    render(<Menu />);
    expect(screen.getByRole('link', { name: 'Frota', hidden: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(trigger('Produtos')).toHaveAttribute('data-current');
    expect(trigger('Empresa')).not.toHaveAttribute('data-current');
  });

  it('refuses a disabled section and a disabled link', () => {
    const onClick = vi.fn();
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="a">
            <NavigationMenuLink disabled href="#a" onClick={onClick}>
              A
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const link = screen.getByRole('link', { name: 'A' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('data-disabled');
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps a disabled section closed', () => {
    render(<Menu />);
    expect(trigger('Parceiros')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Parceiros' }).closest('li')).toHaveAttribute(
      'data-disabled',
    );
  });

  it('names a group by its label', () => {
    render(<Menu defaultValue="empresa" />);
    expect(screen.getByRole('group', { name: 'Sobre' })).toBeInTheDocument();
  });

  it('composes the consumer handler and lets it cancel the family part', () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="a">
            <NavigationMenuTrigger onClick={onClick}>A</NavigationMenuTrigger>
            <NavigationMenuContent />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    fireEvent.click(trigger('A'), { detail: 1 });
    expect(onClick).toHaveBeenCalledOnce();
    expect(trigger('A')).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders a second level as a div inside the panel, and a link there closes every level', () => {
    function Outer() {
      const [value, setValue] = useState<string | null>('catalogo');
      return (
        <NavigationMenu onValueChange={setValue} value={value}>
          <NavigationMenuList>
            <NavigationMenuItem value="catalogo">
              <NavigationMenuTrigger>Catálogo</NavigationMenuTrigger>
              <NavigationMenuContent columns={3}>
                <NavigationMenu defaultValue="ferramentas">
                  <NavigationMenuList>
                    <NavigationMenuItem value="ferramentas">
                      <NavigationMenuTrigger>Ferramentas</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <NavigationMenuLinks>
                          <li>
                            <NavigationMenuLink href="#manuais">Manuais</NavigationMenuLink>
                          </li>
                        </NavigationMenuLinks>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );
    }
    const { container } = render(<Outer />);
    const nested = container.querySelector('[data-nested]');
    expect(nested?.tagName).toBe('DIV');
    expect(nested).toHaveAttribute('data-orientation', 'vertical');
    expect(nested?.querySelector(':scope > [data-part="viewport"]')).toBeNull();
    expect(screen.getAllByRole('navigation')).toHaveLength(1);
    fireEvent.click(screen.getByRole('link', { name: 'Manuais' }));
    expect(trigger('Catálogo')).toHaveAttribute('aria-expanded', 'false');
  });

  it('exposes open, close and focus on its handle', () => {
    const ref = { current: null as null | import('./navigation-menu.types').NavigationMenuHandle };
    render(<Menu ref={ref} />);
    act(() => ref.current?.open('empresa'));
    expect(trigger('Empresa')).toHaveAttribute('aria-expanded', 'true');
    act(() => ref.current?.close());
    expect(trigger('Empresa')).toHaveAttribute('aria-expanded', 'false');
    act(() => ref.current?.focus('empresa'));
    expect(trigger('Empresa')).toHaveFocus();
  });
});
