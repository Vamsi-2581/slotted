import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/toolbar/contract.json';
import { Toolbar } from './toolbar';
import { ToolbarDefaultsProvider } from './toolbar-defaults';
import { ToolbarGroup, ToolbarSeparator, ToolbarSpacer } from './toolbar-parts';

const bar = () => screen.getByRole('toolbar');
const controls = () => screen.getAllByRole('button');
const control = (index: number) => controls()[index] as HTMLElement;
const press = (element: HTMLElement, key: string) => fireEvent.keyDown(element, { key });

function Bar(props: Record<string, unknown>) {
  return (
    <Toolbar aria-label="Formatação" {...props}>
      <button type="button">Negrito</button>
      <button type="button">Itálico</button>
      <ToolbarSeparator />
      <button type="button">Link</button>
    </Toolbar>
  );
}

describe('Toolbar', () => {
  it('renders the role, the label and every part the contract names', () => {
    render(
      <Toolbar aria-label="Seleção">
        <ToolbarGroup aria-label="Alinhamento">
          <button type="button">Início</button>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarSpacer />
        <button type="button">Excluir</button>
      </Toolbar>,
    );

    expect(bar()).toHaveAccessibleName('Seleção');
    const drawn = new Set(
      [...bar().querySelectorAll('[data-part]')].map((node) => node.getAttribute('data-part')),
    );
    drawn.add(bar().getAttribute('data-part'));
    for (const part of contract.members.toolbar.parts) expect(drawn).toContain(part);
    expect(screen.getByRole('group')).toHaveAccessibleName('Alinhamento');
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  /** One stop for the whole bar, however many controls it holds. */
  it('holds one tab stop', () => {
    render(<Bar />);

    expect(control(0)).toHaveAttribute('tabindex', '0');
    expect(control(1)).toHaveAttribute('tabindex', '-1');
    expect(control(2)).toHaveAttribute('tabindex', '-1');
  });

  it('moves along the bar with the arrows and wraps at both ends', () => {
    render(<Bar />);

    control(0).focus();
    press(control(0), 'ArrowRight');
    expect(control(1)).toHaveFocus();

    press(control(1), 'ArrowRight');
    expect(control(2)).toHaveFocus();

    press(control(2), 'ArrowRight');
    expect(control(0)).toHaveFocus();
  });

  /** "Up Arrow and Down Arrow can duplicate Left Arrow and Right Arrow." */
  it('duplicates the cross-axis pair, which the pattern permits', () => {
    render(<Bar />);

    control(0).focus();
    press(control(0), 'ArrowDown');

    expect(control(1)).toHaveFocus();
  });

  it('reaches both ends with Home and End', () => {
    render(<Bar />);

    control(0).focus();
    press(control(0), 'End');
    expect(control(2)).toHaveFocus();

    press(control(2), 'Home');
    expect(control(0)).toHaveFocus();
  });

  it('turns the arrows and announces the axis when the bar is vertical', () => {
    render(<Bar orientation="vertical" />);

    expect(bar()).toHaveAttribute('aria-orientation', 'vertical');
    control(0).focus();
    press(control(0), 'ArrowDown');
    expect(control(1)).toHaveFocus();
  });

  it('clamps at the ends when looping is off', () => {
    render(<Bar loop={false} />);

    control(0).focus();
    press(control(0), 'ArrowLeft');

    expect(control(0)).toHaveFocus();
  });

  /**
   * The APG allows a focusable disabled control "in circumstances where
   * discoverability of a function is crucial", which is what `button`'s
   * `focusableWhenDisabled` renders; a natively disabled one cannot be focused
   * at all, so the platform decides and the bar follows.
   */
  it('keeps an aria-disabled control in the ring and skips a native one', () => {
    render(
      <Toolbar aria-label="Formatação">
        <button type="button">Negrito</button>
        <button aria-disabled="true" type="button">
          Código
        </button>
        <button disabled type="button">
          Link
        </button>
        <button type="button">Citação</button>
      </Toolbar>,
    );

    control(0).focus();
    press(control(0), 'ArrowRight');
    expect(control(1)).toHaveFocus();

    press(control(1), 'ArrowRight');
    expect(control(3)).toHaveFocus();
  });

  /**
   * The APG asks an author to avoid a control that needs the navigation pair;
   * the bar enforces it instead, so the caret keeps its keys and focus leaves
   * on the cross axis.
   */
  it('leaves the flow arrows to an item that operates with them', () => {
    render(
      <Toolbar aria-label="Filtro">
        <button type="button">Todos</button>
        <input aria-label="Buscar" type="search" />
      </Toolbar>,
    );

    const field = screen.getByRole('searchbox');
    field.focus();
    press(field, 'ArrowLeft');
    expect(field).toHaveFocus();

    press(field, 'ArrowUp');
    expect(control(0)).toHaveFocus();
  });

  it('lets a consumer state which keys an item keeps', () => {
    render(
      <Toolbar aria-label="Filtro">
        <button data-toolbar-keys="inline" type="button">
          Todos
        </button>
        <button type="button">Abertos</button>
      </Toolbar>,
    );

    control(0).focus();
    press(control(0), 'ArrowRight');
    expect(control(0)).toHaveFocus();

    press(control(0), 'ArrowDown');
    expect(control(1)).toHaveFocus();
  });

  /**
   * A fieldset is the platform's own answer, and it takes the ring with it: a
   * natively disabled control cannot be focused, so the arrows have nowhere to
   * go. jsdom lets a script focus a disabled control, which a browser does not,
   * so what is asserted here is the two facts a browser derives it from.
   */
  it('is left out of action by the element that can actually do it', () => {
    render(
      <fieldset disabled>
        <Bar />
      </fieldset>,
    );

    for (const item of controls()) expect(item).toBeDisabled();

    control(0).focus();
    press(control(0), 'ArrowRight');
    expect(control(1)).not.toHaveFocus();
  });

  it('finds a control that arrives after the bar was built', () => {
    const { rerender } = render(<Bar />);

    rerender(
      <Toolbar aria-label="Formatação">
        <button type="button">Negrito</button>
        <button type="button">Itálico</button>
        <ToolbarSeparator />
        <button type="button">Link</button>
        <button type="button">Citação</button>
      </Toolbar>,
    );

    control(0).focus();
    press(control(0), 'End');
    expect(control(3)).toHaveFocus();
  });

  it('takes the defaults an application sets once, and lets a bar win over them', () => {
    render(
      <ToolbarDefaultsProvider size="sm" variant="outline">
        <Bar />
        <Toolbar aria-label="Outra" size="lg">
          <button type="button">Um</button>
        </Toolbar>
      </ToolbarDefaultsProvider>,
    );

    const [first, second] = screen.getAllByRole('toolbar');
    expect(first).toHaveAttribute('data-size', 'sm');
    expect(first).toHaveAttribute('data-variant', 'outline');
    expect(second).toHaveAttribute('data-size', 'lg');
  });

  it('substitutes the element of every part it exposes', () => {
    render(
      <Toolbar aria-label="Seleção" render={(props) => <nav {...props} />}>
        <ToolbarGroup render={(props) => <section {...props} />}>
          <button type="button">Um</button>
        </ToolbarGroup>
        <ToolbarSeparator render={(props) => <hr {...props} />} />
        <ToolbarSpacer render={(props) => <span {...props} />} />
      </Toolbar>,
    );

    expect(document.querySelector('nav[data-ui="toolbar"]')).toBeInTheDocument();
    expect(document.querySelector('section[data-part="group"]')).toBeInTheDocument();
    expect(document.querySelector('hr[data-part="separator"]')).toBeInTheDocument();
    expect(document.querySelector('span[data-part="spacer"]')).toBeInTheDocument();
  });

  it('keeps the consumer own listener on the control it belongs to', () => {
    const onClick = vi.fn();
    render(
      <Toolbar aria-label="Formatação">
        <button onClick={onClick} type="button">
          Negrito
        </button>
      </Toolbar>,
    );

    fireEvent.click(control(0), { detail: 1 });

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
