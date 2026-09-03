import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Button, ButtonDefaultsProvider } from '../button';
import { ButtonGroup, ButtonGroupDefaultsProvider, ButtonGroupSeparator } from './index';

describe('ButtonGroup', () => {
  it('carries the identifier a consumer selects the family by', () => {
    render(<ButtonGroup data-testid="group">actions</ButtonGroup>);

    const group = screen.getByTestId('group');
    expect(group.tagName).toBe('DIV');
    expect(group).toHaveAttribute('data-ui', 'button-group');
    expect(group).toHaveAttribute('data-part', 'root');
  });

  /**
   * A group of buttons is several tab stops. The arrow-key model belongs to
   * `toolbar`, so the role that promises it is never written by accident.
   */
  it('is a group, and says so', () => {
    render(<ButtonGroup data-testid="group">actions</ButtonGroup>);

    expect(screen.getByTestId('group')).toHaveAttribute('role', 'group');
  });

  it('lets the consumer state a role of their own', () => {
    render(
      <ButtonGroup data-testid="group" role="toolbar">
        actions
      </ButtonGroup>,
    );

    expect(screen.getByTestId('group')).toHaveAttribute('role', 'toolbar');
  });

  it('names itself with the attributes the element already accepts', () => {
    render(<ButtonGroup aria-label="Record actions">actions</ButtonGroup>);

    expect(screen.getByRole('group', { name: 'Record actions' })).toBeInTheDocument();
  });

  it('writes no axis the consumer did not decide, because the base rule holds the defaults', () => {
    render(<ButtonGroup data-testid="group">actions</ButtonGroup>);

    const group = screen.getByTestId('group');
    for (const axis of ['gap', 'align', 'justify', 'orientation', 'collapse', 'attached']) {
      expect(group).not.toHaveAttribute(`data-${axis}`);
    }
    expect(group).not.toHaveAttribute('data-full-width');
  });

  it('states each axis the consumer decided', () => {
    render(
      <ButtonGroup
        align="stretch"
        attached
        collapse="stack"
        data-testid="group"
        fullWidth
        gap={2}
        justify="end"
        orientation="vertical"
      >
        actions
      </ButtonGroup>,
    );

    const group = screen.getByTestId('group');
    expect(group).toHaveAttribute('data-align', 'stretch');
    expect(group).toHaveAttribute('data-attached', '');
    expect(group).toHaveAttribute('data-collapse', 'stack');
    expect(group).toHaveAttribute('data-full-width', '');
    expect(group).toHaveAttribute('data-gap', '2');
    expect(group).toHaveAttribute('data-justify', 'end');
    expect(group).toHaveAttribute('data-orientation', 'vertical');
  });

  it('treats no separation as a decision, not as an absent one', () => {
    render(
      <ButtonGroup data-testid="group" gap={0}>
        actions
      </ButtonGroup>,
    );

    expect(screen.getByTestId('group')).toHaveAttribute('data-gap', '0');
  });

  it('renders another element when a div is the wrong claim', () => {
    render(
      <ButtonGroup aria-label="Actions" data-testid="group" render={(props) => <nav {...props} />}>
        actions
      </ButtonGroup>,
    );

    expect(screen.getByTestId('group').tagName).toBe('NAV');
  });

  /**
   * A substituted element keeps the group role, because a group of actions is
   * what the family is whatever tag carries it. An element whose own semantics
   * are the point says so by asking for no role at all: an explicit value
   * wins, and `undefined` is a value the consumer can state.
   */
  it('gives up the role to an element whose own semantics are the point', () => {
    render(
      <ButtonGroup aria-label="Pagination" render={(props) => <nav {...props} />} role={undefined}>
        actions
      </ButtonGroup>,
    );

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('hands the consumer the element it rendered', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ButtonGroup ref={ref}>actions</ButtonGroup>);

    expect(ref.current).toHaveAttribute('data-ui', 'button-group');
  });

  it('keeps every button in the tab sequence, because a group is not a toolbar', () => {
    render(
      <ButtonGroup>
        <Button>Day</Button>
        <Button>Week</Button>
      </ButtonGroup>,
    );

    for (const button of screen.getAllByRole('button')) {
      expect(button).not.toHaveAttribute('tabindex');
    }
  });
});

describe('ButtonGroup paint', () => {
  it('paints the buttons under it', () => {
    render(
      <ButtonGroup size="sm" tone="danger" variant="outline">
        <Button>Delete</Button>
      </ButtonGroup>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-tone', 'danger');
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  /**
   * How a group is laid out and how its buttons are painted are two questions,
   * and only the second one belongs to `button` — so the group travels through
   * that family's own defaults, and the rule an explicit prop always wins is
   * the rule `button` already implements.
   */
  it('loses to a button that states the axis itself', () => {
    render(
      <ButtonGroup tone="danger">
        <Button tone="accent">Publish</Button>
      </ButtonGroup>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('data-tone', 'accent');
  });

  it('leaves each button its own default for an axis the group did not state', () => {
    render(
      <ButtonGroup size="sm">
        <Button>Publish</Button>
      </ButtonGroup>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveAttribute('data-tone', 'accent');
    expect(button).toHaveAttribute('data-variant', 'solid');
  });

  it('overrules the application-wide button defaults it sits inside', () => {
    render(
      <ButtonDefaultsProvider tone="secondary">
        <ButtonGroup tone="success">
          <Button>Approve</Button>
        </ButtonGroup>
      </ButtonDefaultsProvider>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('data-tone', 'success');
  });

  it('inherits the axes it does not state from the provider above it', () => {
    render(
      <ButtonDefaultsProvider size="lg">
        <ButtonGroup tone="success">
          <Button>Approve</Button>
        </ButtonGroup>
      </ButtonDefaultsProvider>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg');
  });
});

describe('ButtonGroupDefaultsProvider', () => {
  it('decides once how the groups under it are spaced and shaped', () => {
    render(
      <ButtonGroupDefaultsProvider attached collapse="stack" gap={6}>
        <ButtonGroup data-testid="group">actions</ButtonGroup>
      </ButtonGroupDefaultsProvider>,
    );

    const group = screen.getByTestId('group');
    expect(group).toHaveAttribute('data-attached', '');
    expect(group).toHaveAttribute('data-collapse', 'stack');
    expect(group).toHaveAttribute('data-gap', '6');
  });

  it('loses to a group that states the axis itself', () => {
    render(
      <ButtonGroupDefaultsProvider gap={6}>
        <ButtonGroup data-testid="group" gap={2}>
          actions
        </ButtonGroup>
      </ButtonGroupDefaultsProvider>,
    );

    expect(screen.getByTestId('group')).toHaveAttribute('data-gap', '2');
  });

  it('nests, so a region can restate one axis without restating the rest', () => {
    render(
      <ButtonGroupDefaultsProvider attached gap={6}>
        <ButtonGroupDefaultsProvider gap={2}>
          <ButtonGroup data-testid="group">actions</ButtonGroup>
        </ButtonGroupDefaultsProvider>
      </ButtonGroupDefaultsProvider>,
    );

    const group = screen.getByTestId('group');
    expect(group).toHaveAttribute('data-attached', '');
    expect(group).toHaveAttribute('data-gap', '2');
  });
});

describe('ButtonGroupSeparator', () => {
  it('is a part of the group and not a family of its own', () => {
    render(
      <ButtonGroup>
        <ButtonGroupSeparator data-testid="rule" />
      </ButtonGroup>,
    );

    const rule = screen.getByTestId('rule');
    expect(rule).toHaveAttribute('data-part', 'separator');
    expect(rule).not.toHaveAttribute('data-ui');
  });

  it('turns across the group it divides', () => {
    render(
      <>
        <ButtonGroup>
          <ButtonGroupSeparator data-testid="across-a-row" />
        </ButtonGroup>
        <ButtonGroup orientation="vertical">
          <ButtonGroupSeparator data-testid="across-a-column" />
        </ButtonGroup>
      </>,
    );

    expect(screen.getByTestId('across-a-row')).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByTestId('across-a-column')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  /**
   * Which way a collapsing group runs is decided by the width the page turns
   * out to have. An attribute that is right above the breakpoint and wrong
   * below it is worse than the one ARIA already defaults to.
   */
  it('states no axis inside a group whose axis the container decides', () => {
    render(
      <ButtonGroup collapse="stack">
        <ButtonGroupSeparator data-testid="rule" />
      </ButtonGroup>,
    );

    const rule = screen.getByTestId('rule');
    expect(rule).toHaveAttribute('role', 'separator');
    expect(rule).not.toHaveAttribute('aria-orientation');
  });

  it('leaves the accessibility tree when the boundary is only cosmetic', () => {
    render(
      <ButtonGroup>
        <ButtonGroupSeparator data-testid="rule" decorative />
      </ButtonGroup>,
    );

    const rule = screen.getByTestId('rule');
    expect(rule).toHaveAttribute('role', 'none');
    expect(rule).toHaveAttribute('aria-hidden', 'true');
    expect(rule).not.toHaveAttribute('aria-orientation');
  });

  it('renders another element when a div is the wrong claim', () => {
    render(
      <ButtonGroup>
        <ButtonGroupSeparator render={(props) => <hr {...props} />} />
      </ButtonGroup>,
    );

    expect(screen.getByRole('separator')).toHaveAttribute('data-part', 'separator');
  });
});
