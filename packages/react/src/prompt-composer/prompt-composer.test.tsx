import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/prompt-composer/contract.json';
import { Field, FieldLabel } from '../field';
import {
  PromptComposer,
  PromptComposerAction,
  PromptComposerAttach,
  PromptComposerFooter,
  PromptComposerHeader,
  PromptComposerInput,
  PromptComposerSubmit,
} from './prompt-composer';
import { PromptComposerDefaultsProvider } from './prompt-composer-defaults';
import type { PromptComposerProps } from './prompt-composer.types';

function Composer(props: PromptComposerProps) {
  return (
    <PromptComposer data-testid="root" {...props}>
      <PromptComposerHeader data-testid="header" />
      <PromptComposerInput aria-label="Mensagem" />
      <PromptComposerFooter>
        <PromptComposerAttach />
        <PromptComposerAction>Claude Opus</PromptComposerAction>
        <PromptComposerSubmit />
      </PromptComposerFooter>
    </PromptComposer>
  );
}

const input = () => screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Mensagem' });
const root = () => screen.getByTestId('root');
const part = (name: string) => root().querySelector<HTMLElement>(`[data-part="${name}"]`)!;

function file(name: string, type: string, size = 10) {
  return new File(['x'.repeat(size)], name, { type });
}

describe('PromptComposer', () => {
  it('is a form holding every part the contract declares', () => {
    render(<Composer />);
    expect(root().tagName).toBe('FORM');
    expect(root()).toHaveAttribute('data-ui', 'prompt-composer');
    expect(root()).toHaveAttribute('data-variant', 'raised');
    expect(root()).toHaveAttribute('data-status', 'ready');
    for (const name of contract.members.promptComposer.parts) {
      expect(root().matches(`[data-part="${name}"]`) || part(name) !== null).toBe(true);
    }
  });

  it('asks before the value moves, with the reason keyboard', () => {
    const onValueChange = vi.fn();
    render(<Composer onValueChange={onValueChange} />);
    fireEvent.change(input(), { target: { value: 'Olá' } });
    expect(onValueChange.mock.calls[0]![0]).toBe('Olá');
    expect(onValueChange.mock.calls[0]![1].reason).toBe('keyboard');
    expect(input().value).toBe('Olá');
  });

  it('sends on Enter, then clears an uncontrolled value with the reason submit', () => {
    const onValueSubmit = vi.fn();
    const onValueChange = vi.fn();
    render(<Composer onValueChange={onValueChange} onValueSubmit={onValueSubmit} />);
    fireEvent.change(input(), { target: { value: 'Qual é o prazo?' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onValueSubmit).toHaveBeenCalledOnce();
    expect(onValueSubmit.mock.calls[0]![0]).toBe('Qual é o prazo?');
    expect(onValueSubmit.mock.calls[0]![1].reason).toBe('keyboard');
    expect(onValueChange.mock.calls.at(-1)![1].reason).toBe('submit');
    expect(input().value).toBe('');
  });

  it('keeps the value when the send is refused', () => {
    render(<Composer onValueSubmit={(_, request) => request.cancel()} />);
    fireEvent.change(input(), { target: { value: 'Rascunho' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(input().value).toBe('Rascunho');
  });

  it('breaks a line on Shift+Enter and never sends while an input method composes', () => {
    const onValueSubmit = vi.fn();
    render(<Composer onValueSubmit={onValueSubmit} />);
    fireEvent.change(input(), { target: { value: 'あ' } });
    fireEvent.keyDown(input(), { key: 'Enter', shiftKey: true });
    fireEvent.keyDown(input(), { key: 'Enter', keyCode: 229 });
    fireEvent.keyDown(input(), { key: 'Enter', isComposing: true });
    expect(onValueSubmit).not.toHaveBeenCalled();
  });

  it('sends only on Mod+Enter when submitOn is mod-enter', () => {
    const onValueSubmit = vi.fn();
    render(<Composer onValueSubmit={onValueSubmit} submitOn="mod-enter" />);
    fireEvent.change(input(), { target: { value: 'Texto' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onValueSubmit).not.toHaveBeenCalled();
    fireEvent.keyDown(input(), { key: 'Enter', ctrlKey: true });
    expect(onValueSubmit).toHaveBeenCalledOnce();
  });

  it('sends from the button with the reason pointer, and not while the value is empty', () => {
    const onValueSubmit = vi.fn();
    render(<Composer onValueSubmit={onValueSubmit} />);
    const send = screen.getByRole('button', { name: 'Send' });
    expect(send).toBeDisabled();
    fireEvent.change(input(), { target: { value: '   ' } });
    expect(send).toBeDisabled();
    fireEvent.change(input(), { target: { value: 'Agora' } });
    expect(send).toBeEnabled();
    fireEvent.click(send, { detail: 1 });
    expect(onValueSubmit.mock.calls[0]![1].reason).toBe('pointer');
  });

  it('lets an application with attachments ready send an empty message', () => {
    render(<Composer canSubmit />);
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled();
  });

  it('turns the send into a busy ring, a stop and a retry by status', () => {
    const onStop = vi.fn();
    const onValueSubmit = vi.fn();
    const { rerender } = render(
      <Composer defaultValue="Oi" onValueSubmit={onValueSubmit} status="submitted" />,
    );
    expect(root()).toHaveAttribute('data-loading');
    expect(part('submit')).toHaveAttribute('aria-disabled', 'true');
    expect(part('submit').querySelector('[data-ui="spinner"]')).not.toBeNull();
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onValueSubmit).not.toHaveBeenCalled();

    rerender(<Composer defaultValue="Oi" onStop={onStop} status="streaming" />);
    const stop = screen.getByRole('button', { name: 'Stop' });
    expect(stop.querySelector('svg[data-glyph="stop"]')).not.toBeNull();
    fireEvent.click(stop, { detail: 1 });
    expect(onStop).toHaveBeenCalledWith(expect.objectContaining({ reason: 'pointer' }));

    rerender(<Composer defaultValue="Oi" status="error" />);
    expect(
      screen.getByRole('button', { name: 'Retry' }).querySelector('svg[data-glyph="rotate-ccw"]'),
    ).not.toBeNull();
    expect(root()).not.toHaveAttribute('data-loading');
  });

  it('hands over pasted files after the selection rules, and keeps the text', () => {
    const onAttach = vi.fn();
    render(<Composer accept="image/*" onAttach={onAttach} />);
    const png = file('print.png', 'image/png');
    const pdf = file('contrato.pdf', 'application/pdf');
    fireEvent.paste(input(), {
      clipboardData: { files: [png, pdf], getData: () => '' },
    });
    expect(onAttach).toHaveBeenCalledOnce();
    expect(onAttach.mock.calls[0]![0]).toEqual([png]);
    expect(onAttach.mock.calls[0]![1].reason).toBe('paste');
    expect(
      onAttach.mock.calls[0]![1].rejected.map((entry: { name: string }) => entry.name),
    ).toEqual(['contrato.pdf']);
  });

  it('marks the frame as a drop target while files are held over it, and takes the drop', () => {
    const onAttach = vi.fn();
    render(<Composer onAttach={onAttach} />);
    const dataTransfer = { types: ['Files'], files: [file('a.txt', 'text/plain')] };
    fireEvent.dragOver(root(), { dataTransfer });
    expect(root()).toHaveAttribute('data-drop-target');
    fireEvent.drop(root(), { dataTransfer });
    expect(root()).not.toHaveAttribute('data-drop-target');
    expect(onAttach.mock.calls[0]![1].reason).toBe('drop');
  });

  it('opens the file chooser from the paperclip and hands over the choice', () => {
    const onAttach = vi.fn();
    render(<Composer multiple={false} onAttach={onAttach} />);
    const picker = root().querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(picker.multiple).toBe(false);
    const click = vi.spyOn(picker, 'click');
    fireEvent.click(screen.getByRole('button', { name: 'Attach files' }));
    expect(click).toHaveBeenCalledOnce();
    fireEvent.change(picker, { target: { files: [file('a.txt', 'text/plain')] } });
    expect(onAttach.mock.calls[0]![1].reason).toBe('pointer');
  });

  it('takes its identity and its state from the field around it', () => {
    render(
      <Field disabled>
        <FieldLabel>Mensagem</FieldLabel>
        <Composer />
      </Field>,
    );
    expect(input()).toBeDisabled();
    expect(root()).toHaveAttribute('data-disabled');
    expect(screen.getByRole('button', { name: 'Attach files' })).toBeDisabled();
  });

  it('lets a controlled consumer own the value, and clears it only when asked', () => {
    function Controlled() {
      const [value, setValue] = useState('');
      return <Composer onValueChange={setValue} value={value} />;
    }
    render(<Controlled />);
    fireEvent.change(input(), { target: { value: 'Oi' } });
    expect(input().value).toBe('Oi');
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(input().value).toBe('');
  });

  it('lets an application name the buttons once', () => {
    render(
      <PromptComposerDefaultsProvider attachLabel="Anexar" sendLabel="Enviar" variant="outline">
        <Composer />
      </PromptComposerDefaultsProvider>,
    );
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anexar' })).toBeInTheDocument();
    expect(root()).toHaveAttribute('data-variant', 'outline');
  });

  it('runs the consumer’s own key handler before its own', () => {
    const onKeyDown = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const onValueSubmit = vi.fn();
    render(
      <PromptComposer defaultValue="Oi" onValueSubmit={onValueSubmit}>
        <PromptComposerInput aria-label="Mensagem" onKeyDown={onKeyDown} />
      </PromptComposer>,
    );
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onValueSubmit).not.toHaveBeenCalled();
  });

  it('names the send by its words when it is given some', () => {
    render(
      <PromptComposer defaultValue="Comentário">
        <PromptComposerInput aria-label="Mensagem" />
        <PromptComposerFooter>
          <PromptComposerSubmit>Comentar</PromptComposerSubmit>
        </PromptComposerFooter>
      </PromptComposer>,
    );
    expect(screen.getByRole('button', { name: 'Comentar' })).not.toHaveAttribute('aria-label');
  });
});
