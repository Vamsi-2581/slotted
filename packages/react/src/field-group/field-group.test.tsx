import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import contract from '../../../../specs/components/field-group/contract.json';
import { Field, FieldControl, FieldLabel } from '../field';
import {
  FieldGroup,
  FieldGroupContent,
  FieldGroupDescription,
  FieldGroupError,
  FieldGroupLegend,
} from './index';

describe('FieldGroup', () => {
  it('is selected in public by the family identifier and its parts', () => {
    render(
      <FieldGroup data-testid="group">
        <FieldGroupLegend>Endereço de cobrança</FieldGroupLegend>
        <FieldGroupContent data-testid="content" />
      </FieldGroup>,
    );

    const group = screen.getByTestId('group');
    expect(group.tagName).toBe('FIELDSET');
    expect(group).toHaveAttribute('data-ui', 'field-group');
    expect(group).toHaveAttribute('data-part', 'root');
    expect(screen.getByText('Endereço de cobrança')).toHaveAttribute('data-part', 'legend');
    expect(screen.getByTestId('content')).toHaveAttribute('data-part', 'content');
  });

  it('writes every axis a consumer may style on, and the contract’s defaults', () => {
    render(<FieldGroup data-testid="group" />);

    const group = screen.getByTestId('group');
    const { defaults } = contract.members.fieldGroup;
    expect(group).toHaveAttribute('data-size', defaults.size);
    expect(group).toHaveAttribute('data-orientation', defaults.orientation);
    expect(group).toHaveAttribute('data-required-mark', defaults.requiredMark);
    for (const state of ['data-disabled', 'data-invalid', 'data-required', 'data-readonly']) {
      expect(group).not.toHaveAttribute(state);
    }
  });

  /**
   * The `group` role and the accessible name arrive from the platform, which is
   * the technique the APG's naming practice calls for under its Rule 3. No ARIA
   * is written for either.
   */
  it('takes its role and its name from the platform', () => {
    render(
      <FieldGroup>
        <FieldGroupLegend>Nacionalidade</FieldGroupLegend>
      </FieldGroup>,
    );

    expect(screen.getByRole('group', { name: 'Nacionalidade' })).toBeInTheDocument();
  });

  /**
   * GOV.UK's error-message-with-legend example puts the hint and the error ids
   * on the `fieldset` itself, so a reader entering any control in the group
   * hears both once from the element that names them.
   */
  it('describes the whole set from the element that names it', () => {
    render(
      <FieldGroup data-testid="group" id="nationality">
        <FieldGroupLegend>Nacionalidade</FieldGroupLegend>
        <FieldGroupDescription>Marque todas as que se aplicam.</FieldGroupDescription>
        <FieldGroupError>Escolha ao menos uma.</FieldGroupError>
      </FieldGroup>,
    );

    expect(screen.getByTestId('group')).toHaveAttribute(
      'aria-describedby',
      'nationality-description nationality-error',
    );
    expect(screen.getByText('Marque todas as que se aplicam.').closest('p')).toHaveAttribute(
      'id',
      'nationality-description',
    );
  });

  it('merges the group’s description after a value the consumer wrote', () => {
    render(
      <FieldGroup aria-describedby="tour-step" data-testid="group" id="nationality">
        <FieldGroupDescription>Marque todas as que se aplicam.</FieldGroupDescription>
      </FieldGroup>,
    );

    expect(screen.getByTestId('group')).toHaveAttribute(
      'aria-describedby',
      'tour-step nationality-description',
    );
  });

  /**
   * The platform disables the controls. The family writes `data-disabled` and
   * provides `disabled` to its fields as well, because a label is not a control
   * and nothing in the fieldset's own attribute reaches it.
   */
  it('disables its controls through the platform and its labels through the field', () => {
    render(
      <FieldGroup data-testid="group" disabled>
        <FieldGroupContent>
          <Field data-testid="field">
            <FieldControl data-testid="control" />
          </Field>
        </FieldGroupContent>
      </FieldGroup>,
    );

    expect(screen.getByTestId('group')).toBeDisabled();
    expect(screen.getByTestId('group')).toHaveAttribute('data-disabled');
    expect(screen.getByTestId('field')).toHaveAttribute('data-disabled');
    expect(screen.getByTestId('control')).toBeDisabled();
  });

  /**
   * A compact section is one attribute rather than one per field, and a field
   * that states its own still wins. Among the surveyed implementations only
   * Angular Material has application-wide defaults, and only for Angular.
   */
  it('provides for the fields inside it, and yields to a field that states its own', () => {
    render(
      <FieldGroup labelPlacement="side" size="sm">
        <FieldGroupContent>
          <Field data-testid="inherited" />
          <Field data-testid="own" size="lg" />
        </FieldGroupContent>
      </FieldGroup>,
    );

    expect(screen.getByTestId('inherited')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('inherited')).toHaveAttribute('data-label-placement', 'side');
    expect(screen.getByTestId('own')).toHaveAttribute('data-size', 'lg');
  });

  /**
   * `required` is a fact about one value and a section cannot know it, so the
   * group draws the marker on its own legend and provides nothing to the
   * fields.
   */
  it('marks its own name as necessary without marking every field in it', () => {
    render(
      <FieldGroup required>
        <FieldGroupLegend>Nacionalidade</FieldGroupLegend>
        <FieldGroupContent>
          <Field data-testid="field">
            <FieldLabel>Brasileira</FieldLabel>
          </Field>
        </FieldGroupContent>
      </FieldGroup>,
    );

    expect(screen.getByText('*')).toHaveAttribute('data-part', 'mark');
    expect(screen.getByTestId('field')).not.toHaveAttribute('data-required');
  });

  it('says the set’s necessity in words when the application asks for words', () => {
    render(
      <FieldGroup necessityWords={{ required: '(obrigatório)' }} required requiredMark="text">
        <FieldGroupLegend>Nacionalidade</FieldGroupLegend>
      </FieldGroup>,
    );

    expect(screen.getByText('(obrigatório)')).not.toHaveAttribute('aria-hidden');
  });

  it('speaks through the message family in the two tones the contract names', () => {
    render(
      <FieldGroup id="nationality">
        <FieldGroupDescription data-testid="description">Marque todas.</FieldGroupDescription>
        <FieldGroupError data-testid="error">Escolha ao menos uma.</FieldGroupError>
      </FieldGroup>,
    );

    expect(screen.getByTestId('description')).toHaveAttribute('data-ui', contract.messageFamily);
    expect(screen.getByTestId('description')).toHaveAttribute(
      'data-tone',
      contract.messageTones.description,
    );
    expect(screen.getByTestId('error')).toHaveAttribute('data-tone', contract.messageTones.error);
  });

  it('renders every part into another element on request', () => {
    render(
      <FieldGroup data-testid="group">
        <FieldGroupLegend render={(props) => <legend {...props} data-testid="legend" />}>
          <h2>Qual é a sua nacionalidade?</h2>
        </FieldGroupLegend>
        <FieldGroupContent render={(props) => <ul {...props} data-testid="content" />} />
      </FieldGroup>,
    );

    expect(screen.getByTestId('content').tagName).toBe('UL');
    expect(screen.getByTestId('legend').querySelector('h2')).toBeInTheDocument();
  });
});
