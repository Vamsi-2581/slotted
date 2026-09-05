import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import contract from '../../../../specs/components/field/contract.json';
import { SlField } from './field';
import { provideFieldDefaults } from './field-defaults';
import { SlFieldDescription, SlFieldError } from './field-messages';
import { SlFieldControl, SlFieldLabel } from './field-parts';
import { SlFieldCounter } from './field-counter';

@Component({
  standalone: true,
  imports: [
    SlField,
    SlFieldLabel,
    SlFieldControl,
    SlFieldCounter,
    SlFieldDescription,
    SlFieldError,
  ],
  template: `<div slField></div>`,
})
class Host {}

function renderTemplate(template: string, providers: unknown[] = []) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: providers as never[] });
  TestBed.overrideComponent(Host, { set: { template } });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture;
}

const root = (fixture: ReturnType<typeof renderTemplate>, selector = '[data-ui="field"]') =>
  fixture.nativeElement.querySelector(selector) as HTMLElement;

describe('SlField', () => {
  it('is selected in public by the family identifier and its parts', () => {
    const fixture = renderTemplate(
      `<div slField>
         <label slFieldLabel>E-mail</label>
         <input slFieldControl />
         <span slFieldCounter>0/64</span>
         <span slFieldDescription>Usaremos para a cobrança.</span>
       </div>`,
    );

    const field = root(fixture);
    expect(field.tagName).toBe('DIV');
    expect(field.getAttribute('data-part')).toBe('root');
    expect(field.querySelector('[data-part="label"]')?.tagName).toBe('LABEL');
    expect(field.querySelector('[data-part="control"]')?.tagName).toBe('INPUT');
    expect(field.querySelector('[data-part="counter"]')?.tagName).toBe('SPAN');
  });

  it('writes every axis a consumer may style on, and the contract’s defaults', () => {
    const fixture = renderTemplate(`<div slField><input slFieldControl /></div>`);
    const field = root(fixture);
    const { defaults } = contract.members.field;

    expect(field.getAttribute('data-size')).toBe(defaults.size);
    expect(field.getAttribute('data-label-placement')).toBe(defaults.labelPlacement);
    expect(field.getAttribute('data-required-mark')).toBe(defaults.requiredMark);
    for (const state of ['data-disabled', 'data-invalid', 'data-required', 'data-readonly']) {
      expect(field.hasAttribute(state)).toBe(false);
    }
  });

  /**
   * Derivation rather than registration: `label[for]` resolves to the
   * identifier the control will use with no ordering dependency between
   * siblings and nothing to coordinate during hydration.
   */
  it('derives every identifier from one base, in the order the contract names', () => {
    const fixture = renderTemplate(
      `<div slField id="cnpj">
         <label slFieldLabel>CNPJ</label>
         <input slFieldControl />
         <span slFieldDescription>Somente números.</span>
         <span slFieldError>Faltam dois dígitos.</span>
       </div>`,
    );

    const control = root(fixture).querySelector('input') as HTMLInputElement;
    expect(control.getAttribute('id')).toBe('cnpj-control');
    expect(root(fixture).querySelector('label')?.getAttribute('for')).toBe('cnpj-control');
    expect(control.getAttribute('aria-describedby')).toBe('cnpj-description cnpj-error');
  });

  it('names only the messages the page actually wrote', () => {
    const fixture = renderTemplate(
      `<div slField id="cnpj">
         <input slFieldControl />
         <span slFieldDescription>Somente números.</span>
       </div>`,
    );

    expect(root(fixture).querySelector('input')?.getAttribute('aria-describedby')).toBe(
      'cnpj-description',
    );
  });

  it('merges the field’s description after a value the consumer wrote', () => {
    const fixture = renderTemplate(
      `<div slField id="cnpj">
         <input slFieldControl aria-describedby="tour-step" />
         <span slFieldDescription>Somente números.</span>
       </div>`,
    );

    expect(root(fixture).querySelector('input')?.getAttribute('aria-describedby')).toBe(
      'tour-step cnpj-description',
    );
  });

  /**
   * `aria-required`, never the native `required`: the native attribute engages
   * browser constraint validation and changes submit behaviour, which the
   * library must not impose as a side effect of describing a field.
   */
  it('describes the control without taking over its submission', () => {
    const fixture = renderTemplate(
      `<div slField disabled invalid required readOnly><input slFieldControl /></div>`,
    );

    const control = root(fixture).querySelector('input') as HTMLInputElement;
    expect(control.getAttribute('aria-required')).toBe('true');
    expect(control.hasAttribute('required')).toBe(false);
    expect(control.getAttribute('aria-invalid')).toBe('true');
    expect(control.hasAttribute('disabled')).toBe(true);
    expect(control.hasAttribute('readonly')).toBe(true);
  });

  /**
   * A host binding wins over a static attribute in Angular, so each written
   * value is read before the binding is computed rather than after — the
   * asymmetry with React, where a consumer's prop simply spreads over the
   * family's.
   */
  it('never overwrites a value the consumer wrote on the control', () => {
    const fixture = renderTemplate(
      `<div slField disabled invalid>
         <input slFieldControl id="mine" aria-invalid="false" />
       </div>`,
    );

    const control = root(fixture).querySelector('input') as HTMLInputElement;
    expect(control.getAttribute('id')).toBe('mine');
    expect(control.getAttribute('aria-invalid')).toBe('false');
  });

  it('says necessity as a mark, as words, or not at all', () => {
    const fixture = renderTemplate(
      `<div slField id="a" required><label slFieldLabel>CNPJ</label></div>
       <div slField id="b" required requiredMark="text"><label slFieldLabel>CNPJ</label></div>
       <div slField id="c" requiredMark="text"><label slFieldLabel>IE</label></div>
       <div slField id="d" required requiredMark="none"><label slFieldLabel>CNPJ</label></div>`,
    );

    const markOf = (id: string) =>
      fixture.nativeElement.querySelector(`#${id} [data-part="mark"]`) as HTMLElement | null;

    expect(markOf('a')?.textContent).toBe('*');
    expect(markOf('a')?.getAttribute('aria-hidden')).toBe('true');
    expect(markOf('b')?.textContent).toBe('(required)');
    expect(markOf('b')?.hasAttribute('aria-hidden')).toBe(false);
    expect(markOf('c')?.textContent).toBe('(optional)');
    expect(markOf('d')).toBeNull();
  });

  it('lets an application translate the two necessity words once', () => {
    const fixture = renderTemplate(
      `<div slField requiredMark="text"><label slFieldLabel>IE</label></div>`,
      [provideFieldDefaults({ necessityWords: { optional: '(opcional)' } })],
    );

    expect(
      (fixture.nativeElement.querySelector('[data-part="mark"]') as HTMLElement).textContent,
    ).toBe('(opcional)');
  });

  it('lets an application set the family’s appearance once, and a field override it', () => {
    const fixture = renderTemplate(
      `<div slField id="inherited"></div><div slField id="own" size="lg"></div>`,
      [provideFieldDefaults({ labelPlacement: 'side', size: 'sm' })],
    );

    const inherited = root(fixture, '#inherited');
    expect(inherited.getAttribute('data-size')).toBe('sm');
    expect(inherited.getAttribute('data-label-placement')).toBe('side');
    expect(root(fixture, '#own').getAttribute('data-size')).toBe('lg');
  });

  /**
   * The description and the error are `inline-message` roots, which is what
   * `docs/build-order.md` states as the reason that family was built in wave
   * 2: a field error arrives with the clipped severity word an application
   * translates once, and the field draws none of it.
   */
  it('speaks through the message family in the two tones the contract names', () => {
    const fixture = renderTemplate(
      `<div slField id="cnpj">
         <span slFieldDescription>Somente números.</span>
         <span slFieldError>Faltam dois dígitos.</span>
       </div>`,
    );

    const description = root(fixture, '#cnpj-description');
    const error = root(fixture, '#cnpj-error');
    expect(description.getAttribute('data-ui')).toBe(contract.messageFamily);
    expect(description.getAttribute('data-tone')).toBe(contract.messageTones.description);
    expect(error.getAttribute('data-tone')).toBe(contract.messageTones.error);
    expect(error.querySelector('[data-part="prefix"]')?.textContent).toBe('Error:');
  });

  it('lets the error speak in a tone that is not an error', () => {
    const fixture = renderTemplate(
      `<div slField id="pw">
         <span slFieldError tone="warning" live="polite">Fácil de adivinhar.</span>
       </div>`,
    );

    const error = root(fixture, '#pw-error');
    expect(error.getAttribute('data-tone')).toBe('warning');
    expect(error.getAttribute('role')).toBe('status');
  });

  it('hands its messages the field’s own step and its disabled state', () => {
    const fixture = renderTemplate(
      `<div slField id="cnpj" size="lg" disabled>
         <span slFieldDescription>Somente números.</span>
       </div>`,
    );

    const description = root(fixture, '#cnpj-description');
    expect(description.getAttribute('data-size')).toBe('md');
    expect(description.hasAttribute('data-disabled')).toBe(true);
  });

  it('lets the counter go over its limit before the field is in error', () => {
    const fixture = renderTemplate(
      `<div slField id="bio"><span slFieldCounter invalid>148/140</span></div>`,
    );

    expect(root(fixture, '#bio [data-part="counter"]').hasAttribute('data-invalid')).toBe(true);
    expect(root(fixture, '#bio').hasAttribute('data-invalid')).toBe(false);
  });

  /**
   * The reach an Angular template has and a React one answers with a hook:
   * `exportAs` hands the instance back, so a page can point its own element at
   * the identifier the field derived.
   */
  it('hands its identifiers back to the template', () => {
    const fixture = renderTemplate(
      `<div slField #field="slField" id="cnpj"></div>
       <a [attr.href]="'#' + field.ids().control">Ir para o campo</a>`,
    );

    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('#cnpj-control');
  });

  it('passes native attributes through to the element that owns them', () => {
    const fixture = renderTemplate(
      `<div slField>
         <input slFieldControl type="email" name="email" autocomplete="email" maxlength="64" />
       </div>`,
    );

    const control = root(fixture).querySelector('input') as HTMLInputElement;
    expect(control.getAttribute('type')).toBe('email');
    expect(control.getAttribute('name')).toBe('email');
    expect(control.getAttribute('autocomplete')).toBe('email');
    expect(control.getAttribute('maxlength')).toBe('64');
  });

  /**
   * The property server and client rendering rely on. Two applications in one
   * server process must not produce colliding sequences, which is why the
   * factory is application-scoped rather than a module-level counter.
   */
  it('mints the same sequence for two independently created applications', () => {
    const first = renderTemplate(`<div slField><input slFieldControl /></div>`);
    const second = renderTemplate(`<div slField><input slFieldControl /></div>`);

    expect(first.nativeElement.querySelector('input').id).toBe(
      second.nativeElement.querySelector('input').id,
    );
  });
});
