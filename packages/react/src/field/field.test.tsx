import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import contract from '../../../../specs/components/field/contract.json';
import {
  Field,
  FieldControl,
  FieldCounter,
  FieldDefaultsProvider,
  FieldDescription,
  FieldError,
  FieldLabel,
} from './index';

describe('Field', () => {
  it('is selected in public by the family identifier and its parts', () => {
    render(
      <Field data-testid="field">
        <FieldLabel>E-mail</FieldLabel>
        <FieldControl data-testid="control" />
        <FieldCounter data-testid="counter">0/64</FieldCounter>
        <FieldDescription>Usaremos para a cobrança.</FieldDescription>
      </Field>,
    );

    const field = screen.getByTestId('field');
    expect(field.tagName).toBe('DIV');
    expect(field).toHaveAttribute('data-ui', 'field');
    expect(field).toHaveAttribute('data-part', 'root');
    expect(screen.getByText('E-mail')).toHaveAttribute('data-part', 'label');
    expect(screen.getByTestId('control')).toHaveAttribute('data-part', 'control');
    expect(screen.getByTestId('counter')).toHaveAttribute('data-part', 'counter');
  });

  it('writes every axis a consumer may style on, and the contract’s defaults', () => {
    render(
      <Field data-testid="field">
        <FieldControl />
      </Field>,
    );

    const field = screen.getByTestId('field');
    const { defaults } = contract.members.field;
    expect(field).toHaveAttribute('data-size', defaults.size);
    expect(field).toHaveAttribute('data-label-placement', defaults.labelPlacement);
    expect(field).toHaveAttribute('data-required-mark', defaults.requiredMark);
    for (const state of ['data-disabled', 'data-invalid', 'data-required', 'data-readonly']) {
      expect(field).not.toHaveAttribute(state);
    }
  });

  /**
   * Derivation rather than registration: `label[for]` resolves to the
   * identifier the control will use with no ordering dependency between
   * siblings and nothing to coordinate during hydration.
   */
  it('derives every identifier from one base, in the order the contract names', () => {
    render(
      <Field data-testid="field" id="cnpj">
        <FieldLabel>CNPJ</FieldLabel>
        <FieldControl data-testid="control" />
        <FieldDescription>Somente números.</FieldDescription>
        <FieldError>Faltam dois dígitos.</FieldError>
      </Field>,
    );

    const control = screen.getByTestId('control');
    expect(control).toHaveAttribute('id', 'cnpj-control');
    expect(screen.getByText('CNPJ')).toHaveAttribute('for', 'cnpj-control');
    expect(control).toHaveAttribute('aria-describedby', 'cnpj-description cnpj-error');
  });

  /**
   * The reading order is fixed rather than read from the DOM. A page that
   * writes the error above the description still hears the help first, because
   * two known slots have one correct order.
   */
  it('reads the help before the error whatever order the page wrote them in', () => {
    render(
      <Field id="cnpj">
        <FieldError>Faltam dois dígitos.</FieldError>
        <FieldControl data-testid="control" />
        <FieldDescription>Somente números.</FieldDescription>
      </Field>,
    );

    expect(screen.getByTestId('control')).toHaveAttribute(
      'aria-describedby',
      'cnpj-description cnpj-error',
    );
  });

  it('names only the messages that have something to say', () => {
    render(
      <Field id="cnpj">
        <FieldControl data-testid="control" />
        <FieldDescription>Somente números.</FieldDescription>
        <FieldError>{undefined}</FieldError>
      </Field>,
    );

    expect(screen.getByTestId('control')).toHaveAttribute('aria-describedby', 'cnpj-description');
  });

  it('merges the field’s description after a value the consumer wrote', () => {
    render(
      <Field id="cnpj">
        <FieldControl aria-describedby="tour-step" data-testid="control" />
        <FieldDescription>Somente números.</FieldDescription>
      </Field>,
    );

    expect(screen.getByTestId('control')).toHaveAttribute(
      'aria-describedby',
      'tour-step cnpj-description',
    );
  });

  /**
   * `aria-required`, never the native `required`: the native attribute engages
   * browser constraint validation and changes submit behaviour, which the
   * library must not impose as a side effect of describing a field. `disabled`
   * and `readonly` are native, because that is what those two words mean.
   */
  it('describes the control without taking over its submission', () => {
    render(
      <Field disabled invalid readOnly required>
        <FieldControl data-testid="control" />
      </Field>,
    );

    const control = screen.getByTestId('control');
    expect(control).toHaveAttribute('aria-required', 'true');
    expect(control).not.toHaveAttribute('required');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toBeDisabled();
    expect(control).toHaveAttribute('readonly');
  });

  it('never overwrites a value the consumer stated on the control', () => {
    render(
      <Field disabled invalid>
        <FieldControl aria-invalid={false} data-testid="control" disabled={false} id="mine" />
      </Field>,
    );

    const control = screen.getByTestId('control');
    expect(control).toHaveAttribute('id', 'mine');
    expect(control).toHaveAttribute('aria-invalid', 'false');
    expect(control).not.toBeDisabled();
  });

  /**
   * The glyph is hidden and the words are not. `aria-required` on the control
   * already carries the semantics, and a reader working a form of twenty
   * required fields does not need to hear "asterisk" twenty times; `(optional)`
   * is information rather than decoration.
   */
  it('says necessity as a mark, as words, or not at all', () => {
    const { rerender } = render(
      <Field data-testid="field" required>
        <FieldLabel>CNPJ</FieldLabel>
      </Field>,
    );
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('*')).toHaveAttribute('data-part', 'mark');

    rerender(
      <Field data-testid="field" required requiredMark="text">
        <FieldLabel>CNPJ</FieldLabel>
      </Field>,
    );
    expect(screen.getByText('(required)')).not.toHaveAttribute('aria-hidden');

    rerender(
      <Field data-testid="field" requiredMark="text">
        <FieldLabel>Inscrição estadual</FieldLabel>
      </Field>,
    );
    expect(screen.getByText('(optional)')).toBeInTheDocument();

    rerender(
      <Field data-testid="field" required requiredMark="none">
        <FieldLabel>CNPJ</FieldLabel>
      </Field>,
    );
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('lets an application translate the two necessity words once', () => {
    render(
      <FieldDefaultsProvider necessityWords={{ optional: '(opcional)' }} requiredMark="text">
        <Field>
          <FieldLabel>Inscrição estadual</FieldLabel>
        </Field>
      </FieldDefaultsProvider>,
    );

    expect(screen.getByText('(opcional)')).toBeInTheDocument();
  });

  it('lets an application set the family’s appearance once, and a field override it', () => {
    render(
      <FieldDefaultsProvider labelPlacement="side" size="sm">
        <Field data-testid="inherited" />
        <Field data-testid="own" size="lg" />
      </FieldDefaultsProvider>,
    );

    expect(screen.getByTestId('inherited')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('inherited')).toHaveAttribute('data-label-placement', 'side');
    expect(screen.getByTestId('own')).toHaveAttribute('data-size', 'lg');
  });

  /**
   * The description and the error are `inline-message` roots, which is what
   * `docs/build-order.md` states as the reason that family was built in wave
   * 2: a field error arrives with the clipped severity word an application
   * translates once, and the field draws none of it.
   */
  it('speaks through the message family in the two tones the contract names', () => {
    render(
      <Field data-testid="field" id="cnpj">
        <FieldDescription data-testid="description">Somente números.</FieldDescription>
        <FieldError data-testid="error">Faltam dois dígitos.</FieldError>
      </Field>,
    );

    const description = screen.getByTestId('description');
    const error = screen.getByTestId('error');
    expect(description).toHaveAttribute('data-ui', contract.messageFamily);
    expect(description).toHaveAttribute('data-tone', contract.messageTones.description);
    expect(description).toHaveAttribute('id', 'cnpj-description');
    expect(error).toHaveAttribute('data-tone', contract.messageTones.error);
    expect(error).toHaveAttribute('id', 'cnpj-error');
    expect(error.querySelector('[data-part="prefix"]')?.textContent).toBe('Error:');
  });

  /**
   * A warning that does not block submission is the same part in another tone.
   * Fluent spends a `validationState` axis on that distinction and Carbon a
   * second component.
   */
  it('lets the error speak in a tone that is not an error', () => {
    render(
      <Field>
        <FieldError data-testid="error" live="polite" tone="warning">
          A senha é válida, mas fácil de adivinhar.
        </FieldError>
      </Field>,
    );

    const error = screen.getByTestId('error');
    expect(error).toHaveAttribute('data-tone', 'warning');
    expect(error).toHaveAttribute('role', 'status');
  });

  it('hands its messages the field’s own step and its disabled state', () => {
    render(
      <Field data-testid="field" disabled size="lg">
        <FieldDescription data-testid="description">Somente números.</FieldDescription>
      </Field>,
    );

    const description = screen.getByTestId('description');
    expect(description).toHaveAttribute('data-size', 'md');
    expect(description).toHaveAttribute('data-disabled');
  });

  /**
   * A count can pass its maximum while validation has not yet run, so the
   * counter carries its own `data-invalid` rather than reading the field's.
   */
  it('lets the counter go over its limit before the field is in error', () => {
    render(
      <Field data-testid="field">
        <FieldCounter data-testid="counter" invalid>
          148/140
        </FieldCounter>
      </Field>,
    );

    expect(screen.getByTestId('counter')).toHaveAttribute('data-invalid');
    expect(screen.getByTestId('field')).not.toHaveAttribute('data-invalid');
  });

  it('renders every part into another element on request', () => {
    render(
      <Field data-testid="field" render={(props) => <section {...props} />}>
        <FieldLabel render={(props) => <span {...props} />}>E-mail</FieldLabel>
        <FieldControl render={(props) => <textarea {...props} data-testid="control" />} />
        <FieldCounter render={(props) => <output {...props} data-testid="counter" />}>
          0/64
        </FieldCounter>
      </Field>,
    );

    expect(screen.getByTestId('field').tagName).toBe('SECTION');
    expect(screen.getByTestId('control').tagName).toBe('TEXTAREA');
    expect(screen.getByTestId('counter').tagName).toBe('OUTPUT');
  });

  it('passes native attributes and events through to the element that owns them', () => {
    render(
      <Field data-testid="field">
        <FieldControl
          autoComplete="email"
          data-testid="control"
          inputMode="email"
          maxLength={64}
          name="email"
          placeholder="voce@empresa.com.br"
          type="email"
        />
      </Field>,
    );

    const control = screen.getByTestId('control');
    expect(control).toHaveAttribute('type', 'email');
    expect(control).toHaveAttribute('name', 'email');
    expect(control).toHaveAttribute('autocomplete', 'email');
    expect(control).toHaveAttribute('maxlength', '64');
    expect(control).toHaveAttribute('inputmode', 'email');
  });
});
