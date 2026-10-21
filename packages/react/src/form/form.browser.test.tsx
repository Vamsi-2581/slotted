import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Field, FieldLabel } from '../field';
import { TextField } from '../text-field';
import { Form } from './form';

/**
 * A form written from the minimal example — fields as direct children of the
 * form — rendered its fields touching: the root is a block and drew no
 * distance between them.
 */
describe('fields written directly inside a form', () => {
  it('stand apart by a step of the space scale', () => {
    render(
      <Form>
        <Field>
          <FieldLabel>A</FieldLabel>
          <TextField name="a" />
        </Field>
        <Field>
          <FieldLabel>B</FieldLabel>
          <TextField name="b" />
        </Field>
      </Form>,
    );
    const [first, second] = [...document.querySelectorAll('[data-ui="field"]')] as HTMLElement[];

    expect(
      second!.getBoundingClientRect().top - first!.getBoundingClientRect().bottom,
    ).toBeGreaterThan(0);
  });
});
