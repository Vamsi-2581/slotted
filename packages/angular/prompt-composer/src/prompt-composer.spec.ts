import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SlField, SlFieldLabel } from '@slotted/angular/field';
import { describe, expect, it } from 'vitest';

import contract from '../../../../specs/components/prompt-composer/contract.json';
import { SlPromptComposer } from './prompt-composer';
import { providePromptComposerDefaults } from './prompt-composer-defaults';
import type { PromptComposerStatus } from './prompt-composer-defaults';
import { SlPromptComposerInput } from './prompt-composer-input';
import {
  SlPromptComposerAction,
  SlPromptComposerAttach,
  SlPromptComposerFooter,
  SlPromptComposerHeader,
  SlPromptComposerSubmit,
} from './prompt-composer-parts';

const COMPOSER = `
  <form slPromptComposer [status]="status()" [submitOn]="submitOn()" accept="image/*"
        (valueSubmit)="sent.push($event)" (stop)="stops.push($event)" (attach)="attached.push($event)">
    <div slPromptComposerHeader></div>
    <textarea slPromptComposerInput aria-label="Mensagem" (valueChange)="changes.push($event)"></textarea>
    <div slPromptComposerFooter>
      <button slPromptComposerAttach></button>
      <button slPromptComposerAction>Claude Opus</button>
      <button slPromptComposerSubmit></button>
    </div>
  </form>`;

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SlField,
    SlFieldLabel,
    SlPromptComposer,
    SlPromptComposerAction,
    SlPromptComposerAttach,
    SlPromptComposerFooter,
    SlPromptComposerHeader,
    SlPromptComposerInput,
    SlPromptComposerSubmit,
  ],
  template: COMPOSER,
})
class Host {
  readonly status = signal<PromptComposerStatus>('ready');
  readonly submitOn = signal<'enter' | 'mod-enter'>('enter');
  readonly control = new FormControl('');
  readonly sent: { value: string; reason: string; cancel: () => void }[] = [];
  readonly stops: { reason: string }[] = [];
  readonly attached: { files: File[]; reason: string; rejected: { name: string }[] }[] = [];
  readonly changes: { value: string; reason: string }[] = [];
}

function renderTemplate(template = COMPOSER, providers: unknown[] = []) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: providers as never[] });
  TestBed.overrideComponent(Host, { set: { template } });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture;
}

type Fixture = ReturnType<typeof renderTemplate>;
const query = (fixture: Fixture, selector: string) =>
  fixture.nativeElement.querySelector(selector) as HTMLElement;
const root = (fixture: Fixture) => query(fixture, '[data-ui="prompt-composer"]') as HTMLFormElement;
const input = (fixture: Fixture) => query(fixture, '[data-part="input"]') as HTMLTextAreaElement;
const send = (fixture: Fixture) => query(fixture, '[data-part="submit"]') as HTMLButtonElement;

function type(fixture: Fixture, value: string) {
  input(fixture).value = value;
  input(fixture).dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function enter(fixture: Fixture, init: KeyboardEventInit = {}) {
  input(fixture).dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, ...init }),
  );
  fixture.detectChanges();
}

describe('SlPromptComposer', () => {
  it('is the consumer’s form holding every part the contract declares', () => {
    const fixture = renderTemplate();
    expect(root(fixture).tagName).toBe('FORM');
    expect(root(fixture).getAttribute('data-variant')).toBe('raised');
    expect(root(fixture).getAttribute('data-status')).toBe('ready');
    for (const part of contract.members.promptComposer.parts) {
      const found =
        root(fixture).getAttribute('data-part') === part ||
        root(fixture).querySelector(`[data-part="${part}"]`) !== null;
      expect(found, part).toBe(true);
    }
  });

  it('sends on Enter and clears the value with the reason submit', () => {
    const fixture = renderTemplate();
    type(fixture, 'Qual é o prazo?');
    enter(fixture);
    const host = fixture.componentInstance;
    expect(host.sent).toHaveLength(1);
    expect(host.sent[0]!.value).toBe('Qual é o prazo?');
    expect(host.sent[0]!.reason).toBe('keyboard');
    expect(host.changes.at(-1)!.reason).toBe('submit');
    expect(input(fixture).value).toBe('');
  });

  it('keeps the value when the send is refused', () => {
    const fixture = renderTemplate(
      COMPOSER.replace('(valueSubmit)="sent.push($event)"', '(valueSubmit)="$event.cancel()"'),
    );
    type(fixture, 'Rascunho');
    enter(fixture);
    expect(input(fixture).value).toBe('Rascunho');
  });

  it('breaks a line on Shift+Enter, waits for an input method, and honours mod-enter', () => {
    const fixture = renderTemplate();
    type(fixture, 'あ');
    enter(fixture, { shiftKey: true });
    enter(fixture, { isComposing: true });
    expect(fixture.componentInstance.sent).toHaveLength(0);

    fixture.componentInstance.submitOn.set('mod-enter');
    fixture.detectChanges();
    enter(fixture);
    expect(fixture.componentInstance.sent).toHaveLength(0);
    enter(fixture, { ctrlKey: true });
    expect(fixture.componentInstance.sent).toHaveLength(1);
  });

  it('disables the send while the value is empty and sends from it with the reason pointer', () => {
    const fixture = renderTemplate();
    expect(send(fixture).disabled).toBe(true);
    expect(send(fixture).getAttribute('aria-label')).toBe('Send');
    type(fixture, 'Agora');
    expect(send(fixture).disabled).toBe(false);
    send(fixture).dispatchEvent(new MouseEvent('click', { detail: 1, bubbles: true }));
    expect(fixture.componentInstance.sent[0]!.reason).toBe('pointer');
  });

  it('turns the send into a busy ring, a stop and a retry by status', () => {
    const fixture = renderTemplate();
    type(fixture, 'Oi');
    fixture.componentInstance.status.set('submitted');
    fixture.detectChanges();
    expect(root(fixture).hasAttribute('data-loading')).toBe(true);
    expect(send(fixture).getAttribute('aria-disabled')).toBe('true');
    enter(fixture);
    expect(fixture.componentInstance.sent).toHaveLength(0);

    fixture.componentInstance.status.set('streaming');
    fixture.detectChanges();
    expect(send(fixture).getAttribute('aria-label')).toBe('Stop');
    expect(send(fixture).querySelector('svg[data-glyph="stop"]')).not.toBeNull();
    send(fixture).dispatchEvent(new MouseEvent('click', { detail: 1, bubbles: true }));
    expect(fixture.componentInstance.stops[0]!.reason).toBe('pointer');

    fixture.componentInstance.status.set('error');
    fixture.detectChanges();
    expect(send(fixture).getAttribute('aria-label')).toBe('Retry');
    expect(send(fixture).querySelector('svg[data-glyph="rotate-ccw"]')).not.toBeNull();
  });

  it('hands over dropped files after the selection rules', () => {
    const fixture = renderTemplate();
    const png = new File(['x'], 'print.png', { type: 'image/png' });
    const pdf = new File(['x'], 'contrato.pdf', { type: 'application/pdf' });
    const over = new Event('dragover', { cancelable: true }) as DragEvent;
    Object.defineProperty(over, 'dataTransfer', { value: { types: ['Files'], files: [] } });
    root(fixture).dispatchEvent(over);
    fixture.detectChanges();
    expect(root(fixture).hasAttribute('data-drop-target')).toBe(true);

    const drop = new Event('drop', { cancelable: true }) as DragEvent;
    Object.defineProperty(drop, 'dataTransfer', { value: { types: ['Files'], files: [png, pdf] } });
    root(fixture).dispatchEvent(drop);
    fixture.detectChanges();
    expect(root(fixture).hasAttribute('data-drop-target')).toBe(false);
    const [event] = fixture.componentInstance.attached;
    expect(event!.reason).toBe('drop');
    expect(event!.files).toEqual([png]);
    expect(event!.rejected.map((entry) => entry.name)).toEqual(['contrato.pdf']);
  });

  it('belongs in a reactive form', () => {
    const fixture = renderTemplate(
      COMPOSER.replace('aria-label="Mensagem"', 'aria-label="Mensagem" [formControl]="control"'),
    );
    fixture.componentInstance.control.setValue('Do formulário');
    fixture.detectChanges();
    expect(input(fixture).value).toBe('Do formulário');
    type(fixture, 'Editado');
    expect(fixture.componentInstance.control.value).toBe('Editado');
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input(fixture).disabled).toBe(true);
    expect(root(fixture).hasAttribute('data-disabled')).toBe(true);
  });

  it('lets an application name the buttons once', () => {
    const fixture = renderTemplate(COMPOSER, [
      providePromptComposerDefaults({ sendLabel: 'Enviar', variant: 'outline' }),
    ]);
    expect(send(fixture).getAttribute('aria-label')).toBe('Enviar');
    expect(root(fixture).getAttribute('data-variant')).toBe('outline');
  });

  it('keeps the action’s part beside its own attributes', () => {
    const fixture = renderTemplate();
    const action = query(fixture, '[data-part="action"]');
    expect(action.getAttribute('type')).toBe('button');
    expect(action.textContent?.trim()).toBe('Claude Opus');
  });
});
