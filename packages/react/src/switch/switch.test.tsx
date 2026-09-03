import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/switch/contract.json';
import { Field, FieldError, FieldLabel } from '../field';
import { activationReason, Switch } from './switch';
import { SwitchDefaultsProvider } from './switch-defaults';

const control = () => screen.getByRole('switch');
const root = () => control().parentElement as HTMLElement;

describe('Switch', () => {
  it('is selected in public by the family identifier and its parts', () => {
    render(
      <Switch className="settings-row" description="Um aviso a cada pedido.">
        Alertas
      </Switch>,
    );

    expect(root().tagName).toBe('SPAN');
    expect(root()).toHaveAttribute('data-ui', 'switch');
    expect(root()).toHaveAttribute('data-part', 'root');
    expect(root()).toHaveClass('settings-row');
    expect(control()).toHaveAttribute('data-part', 'control');
    expect(root().querySelector('[data-part="track"]')).not.toBeNull();
    expect(root().querySelector('[data-part="thumb"]')).not.toBeNull();
    expect(root().querySelector('[data-part="label"]')).toHaveTextContent('Alertas');
    expect(root().querySelector('[data-part="description"]')).toHaveTextContent(
      'Um aviso a cada pedido.',
    );
  });

  /**
   * ARIA 1.2 declares the `switch` role Children Presentational, so the role
   * belongs on the void `input`: a root carrying it would fold the status word
   * beside the track into the control's own accessible name.
   */
  it('puts the role on the control and leaves the root out of the tree', () => {
    render(<Switch aria-label="Modo de manutenção" />);

    expect(control().tagName).toBe('INPUT');
    expect(control()).toHaveAttribute('type', 'checkbox');
    expect(contract.rootRole).toBeNull();
    expect(root()).not.toHaveAttribute('role');
    expect(control()).toHaveAccessibleName('Modo de manutenção');
  });

  /**
   * The APG's switch pattern states that a checkbox-based switch uses the HTML
   * `checked` attribute instead of `aria-checked`. Writing both is the state
   * said twice, and the two can disagree.
   */
  it('lets the element carry its own checked state', () => {
    render(<Switch defaultChecked />);

    expect(control()).not.toHaveAttribute('aria-checked');
    expect(control()).toBeChecked();
    expect(root()).toHaveAttribute('data-checked', '');
  });

  it('writes every axis a consumer may style on, and the contract’s defaults', () => {
    render(<Switch />);

    expect(root()).toHaveAttribute('data-size', contract.members.switch.defaults.size);
    expect(root()).toHaveAttribute('data-indicator', contract.members.switch.defaults.indicator);
    expect(root()).toHaveAttribute(
      'data-label-placement',
      contract.members.switch.defaults.labelPlacement,
    );
    expect(root()).not.toHaveAttribute('data-loading');
  });

  it('passes every native attribute to the element that owns it', () => {
    render(<Switch autoFocus form="settings" name="alerts" required value="yes" />);

    expect(control()).toHaveAttribute('name', 'alerts');
    expect(control()).toHaveAttribute('value', 'yes');
    expect(control()).toHaveAttribute('form', 'settings');
    expect(control()).toBeRequired();
  });

  it('moves its own state when nobody owns it, and says why', () => {
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange} />);

    fireEvent.click(control(), { detail: 1 });

    expect(control()).toBeChecked();
    expect(root()).toHaveAttribute('data-checked', '');
    expect(onCheckedChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ value: true, previous: false, reason: 'pointer' }),
    );
  });

  /**
   * Space on a checkbox arrives as a click with no detail. `element.click()`
   * arrives the same way and is not trusted, and calling that `keyboard` would
   * tell a consumer a person pressed a key nobody pressed.
   */
  it('separates a key press from a pointer press and from a script', () => {
    /* `isTrusted` is read-only and false for every event a test dispatches,
       so the rule is exercised where its two facts are readable. */
    expect(activationReason({ detail: 1, isTrusted: true })).toBe('pointer');
    expect(activationReason({ detail: 0, isTrusted: true })).toBe('keyboard');
    expect(activationReason({ detail: 0, isTrusted: false })).toBe('programmatic');

    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange} />);

    control().click();

    expect(onCheckedChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'programmatic' }),
    );
  });

  /**
   * The consumer owns the value, so the element must not move on its own and
   * snap back on the next render. The click's default is prevented instead.
   */
  it('never moves state the consumer owns', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onCheckedChange} />);

    fireEvent.click(control(), { detail: 1 });

    expect(root()).not.toHaveAttribute('data-checked');
    expect(onCheckedChange).toHaveBeenCalledOnce();
    await waitFor(() => expect(control()).not.toBeChecked());
  });

  it('takes the consumer’s next value', async () => {
    function Controlled() {
      const [on, setOn] = useState(false);
      return <Switch checked={on} onCheckedChange={(next) => setOn(next)} />;
    }
    render(<Controlled />);

    fireEvent.click(control(), { detail: 1 });

    expect(root()).toHaveAttribute('data-checked', '');
    await waitFor(() => expect(control()).toBeChecked());
  });

  it('commits nothing when the request is cancelled', async () => {
    render(<Switch onCheckedChange={(_next, request) => request.cancel()} />);

    fireEvent.click(control(), { detail: 1 });

    expect(root()).not.toHaveAttribute('data-checked');
    await waitFor(() => expect(control()).not.toBeChecked());
  });

  it('runs the consumer’s own handler, and lets it refuse the move', () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const onChange = vi.fn();
    render(<Switch onChange={onChange} onClick={onClick} />);

    fireEvent.click(control(), { detail: 1 });

    expect(onClick).toHaveBeenCalledOnce();
    expect(control()).not.toBeChecked();
  });

  /**
   * The native `readonly` attribute does nothing on a checkbox, so read-only
   * is implemented: announced, focusable, submitted, and refused.
   */
  it('implements read-only rather than declaring it unsupported', () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch defaultChecked onCheckedChange={onCheckedChange} readOnly>
        Chave de produção
      </Switch>,
    );

    fireEvent.click(control(), { detail: 1 });

    expect(control()).toHaveAttribute('aria-readonly', 'true');
    expect(control()).not.toBeDisabled();
    expect(control()).toBeChecked();
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-readonly', '');
  });

  it('refuses a second toggle while the first is in flight', () => {
    const onCheckedChange = vi.fn();
    render(<Switch loading onCheckedChange={onCheckedChange} />);

    fireEvent.click(control(), { detail: 1 });

    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(control()).toHaveAttribute('aria-busy', 'true');
    expect(root()).toHaveAttribute('data-loading', '');
  });

  /**
   * A save that returns quickly should say nothing at all, so the pending
   * label reaches the live region only once the wait is worth announcing.
   */
  it('stays silent before it announces that it is saving', async () => {
    vi.useFakeTimers();
    try {
      const { rerender } = render(<Switch loading loadingLabel="Salvando" />);
      const region = screen.getByRole('status');
      expect(region).toHaveTextContent('');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(region).toHaveTextContent('Salvando');

      rerender(<Switch loadingLabel="Salvando" />);
      expect(screen.getByRole('status')).toHaveTextContent('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('is disabled natively, and answers nothing when it is', () => {
    const onCheckedChange = vi.fn();
    render(<Switch disabled onCheckedChange={onCheckedChange} />);

    fireEvent.click(control(), { detail: 1 });

    expect(control()).toBeDisabled();
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-disabled', '');
  });

  /**
   * The mechanism the field-aware controls design fixed: unset means ask the
   * field, and `aria-required` never becomes the native attribute.
   */
  it('takes its identity and its state from the field around it', () => {
    render(
      <Field disabled invalid required>
        <FieldLabel>Cobrança automática</FieldLabel>
        <Switch />
        <FieldError>Escolha uma forma de cobrança.</FieldError>
      </Field>,
    );

    expect(control()).toBeDisabled();
    expect(control()).toHaveAttribute('aria-invalid', 'true');
    expect(control()).toHaveAttribute('aria-required', 'true');
    expect(control()).not.toHaveAttribute('required');
    expect(control()).toHaveAccessibleName('Cobrança automática');
    expect(control()).toHaveAccessibleDescription(/Escolha uma forma de cobrança\./);
    expect(root()).toHaveAttribute('data-disabled', '');
    expect(root()).toHaveAttribute('data-invalid', '');
  });

  it('lets what the consumer stated win over the field', () => {
    render(
      <Field disabled size="sm">
        <FieldLabel>Alertas</FieldLabel>
        <Switch disabled={false} size="lg" />
      </Field>,
    );

    expect(control()).not.toBeDisabled();
    expect(root()).toHaveAttribute('data-size', 'lg');
  });

  it('lets an application decide once what its switches look like', () => {
    render(
      <SwitchDefaultsProvider indicator="none" labelPlacement="start" size="sm">
        <Switch defaultChecked>Alertas</Switch>
      </SwitchDefaultsProvider>,
    );

    expect(root()).toHaveAttribute('data-size', 'sm');
    expect(root()).toHaveAttribute('data-indicator', 'none');
    expect(root()).toHaveAttribute('data-label-placement', 'start');
  });

  /**
   * The anatomy `checkbox` settled one item earlier in the same wave: the
   * label names the control through `for` and doubles its target, and the
   * description sits outside the label so it describes rather than names — and
   * so that clicking a paragraph of help text does not change a setting.
   */
  it('names itself with its own label, and describes itself beside it', () => {
    render(<Switch description="A fatura é debitada no dia 5.">Cobrança automática</Switch>);

    const label = root().querySelector('[data-part="label"]') as HTMLLabelElement;
    expect(label.htmlFor).toBe(control().id);
    expect(control()).toHaveAccessibleName('Cobrança automática');
    expect(control()).toHaveAccessibleDescription('A fatura é debitada no dia 5.');
    expect(label.querySelector('[data-part="description"]')).toBeNull();

    fireEvent.click(label, { detail: 1 });
    expect(control()).toBeChecked();
  });

  /**
   * A field writes `for` at its label whether or not the control draws one of
   * its own, so the control takes the field's identifier and that label is
   * never left pointing at nothing.
   */
  it('takes the field’s identifier, so the field’s label is never orphaned', () => {
    render(
      <Field>
        <FieldLabel>Cobrança automática</FieldLabel>
        <Switch />
      </Field>,
    );

    expect(control().id).toBe(screen.getByText('Cobrança automática').getAttribute('for'));
    expect(control()).toHaveAccessibleName('Cobrança automática');
  });

  it('restores what an uncontrolled switch started from when the form resets', async () => {
    render(
      <form>
        <Switch defaultChecked name="alerts" />
      </form>,
    );

    fireEvent.click(control(), { detail: 1 });
    expect(root()).not.toHaveAttribute('data-checked');

    ((control() as HTMLInputElement).form as HTMLFormElement).reset();

    await waitFor(() => expect(root()).toHaveAttribute('data-checked', ''));
    expect(control()).toBeChecked();
  });

  it('reaches the native element, and the imperative toggle the platform ships', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch ref={ref} />);

    expect(ref.current).toBe(control());
    ref.current?.focus();
    expect(control()).toHaveFocus();
  });

  it('renders the root into the element a consumer substitutes', () => {
    render(<Switch render={(props) => <li {...props} data-testid="row" />} />);

    const substituted = screen.getByTestId('row');
    expect(substituted.tagName).toBe('LI');
    expect(substituted).toHaveAttribute('data-ui', 'switch');
    expect(substituted.querySelector('[data-part="track"]')).not.toBeNull();
  });
});
