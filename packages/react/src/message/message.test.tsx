import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/message/contract.json';
import { Avatar } from '../avatar';
import {
  Bubble,
  BubbleCaret,
  BubbleContent,
  BubbleMeta,
  BubbleQuote,
  BubbleReaction,
  BubbleReactions,
  BubbleRetry,
  BubbleTyping,
  Message,
  MessageActions,
  MessageActivity,
  MessageActivityStep,
  MessageAuthor,
  MessageAvatar,
  MessageBody,
  MessageDefaultsProvider,
  MessageFooter,
  MessageGroup,
  MessageHeader,
  MessageReceipt,
  MessageTime,
  MessageVersions,
} from './index';

const everything = () => (
  <MessageGroup data-testid="group">
    <Message data-testid="row" status="read" versionCount={3}>
      <MessageAvatar>
        <Avatar name="Marta Silva" />
      </MessageAvatar>
      <MessageBody>
        <MessageHeader>
          <MessageAuthor>Marta Silva</MessageAuthor>
          <MessageTime dateTime="2026-09-30T09:38">09:38</MessageTime>
        </MessageHeader>
        <MessageActivity>
          <MessageActivityStep status="complete">Li o registo</MessageActivityStep>
          <MessageActivityStep>A procurar a causa</MessageActivityStep>
        </MessageActivity>
        <Bubble data-testid="bubble" maxLines={3}>
          <BubbleContent>
            <BubbleQuote author="Tiago">A conta não existe.</BubbleQuote>
            Chega hoje à tarde.
            <BubbleCaret />
            <BubbleTyping />
            <BubbleMeta>
              <MessageTime dateTime="2026-09-30T09:41">09:41</MessageTime>
              <MessageReceipt />
            </BubbleMeta>
          </BubbleContent>
          <BubbleRetry />
          <BubbleReactions>
            <BubbleReaction count={2}>👍</BubbleReaction>
          </BubbleReactions>
        </Bubble>
        <MessageFooter>
          <MessageVersions />
          <MessageActions>
            <button type="button">Copiar</button>
          </MessageActions>
        </MessageFooter>
      </MessageBody>
    </Message>
  </MessageGroup>
);

describe('Message', () => {
  it('is selected in public by the family identifier and writes every contract part', () => {
    render(everything());
    const row = screen.getByTestId('row');
    expect(row).toHaveAttribute('data-ui', contract.ui);
    expect(row.tagName).toBe('ARTICLE');
    const parts = [...contract.members.message.parts, ...contract.members.bubble.parts].filter(
      (part) => part !== 'root' && part !== 'more',
    );
    for (const part of parts) {
      expect(document.querySelector(`[data-part="${part}"]`), part).not.toBeNull();
    }
    expect(screen.getByTestId('bubble')).toHaveAttribute('data-part', contract.rootPart.bubble);
  });

  it('names the article by its author', () => {
    render(everything());
    expect(screen.getByRole('article', { name: 'Marta Silva' })).toBe(screen.getByTestId('row'));
  });

  it('writes the delivery state as the shared state attributes', () => {
    const { rerender } = render(<Message data-testid="row" status="sending" />);
    const row = screen.getByTestId('row');
    expect(row).toHaveAttribute('aria-busy', 'true');
    expect(row).toHaveAttribute('data-loading', '');
    rerender(<Message data-testid="row" status="failed" />);
    expect(row).toHaveAttribute('data-invalid', '');
    expect(row).not.toHaveAttribute('aria-busy');
    rerender(<Message data-testid="row" status="read" />);
    expect(row).toHaveAttribute('data-read', '');
  });

  it('paints the reader’s own bubble in the accent’s fill unless the bubble says otherwise', () => {
    render(
      <>
        <Message align="end">
          <Bubble data-testid="own">
            <BubbleContent>a</BubbleContent>
          </Bubble>
          <Bubble data-testid="explicit" tone="success" variant="outline">
            <BubbleContent>b</BubbleContent>
          </Bubble>
        </Message>
        <Message layout="thread">
          <Bubble data-testid="thread">
            <BubbleContent>c</BubbleContent>
          </Bubble>
        </Message>
        <Bubble data-testid="alone">
          <BubbleContent>d</BubbleContent>
        </Bubble>
      </>,
    );
    expect(screen.getByTestId('own')).toHaveAttribute('data-variant', 'solid');
    expect(screen.getByTestId('own')).toHaveAttribute('data-tone', 'accent');
    expect(screen.getByTestId('explicit')).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByTestId('explicit')).toHaveAttribute('data-tone', 'success');
    expect(screen.getByTestId('thread')).toHaveAttribute('data-variant', 'plain');
    expect(screen.getByTestId('alone')).toHaveAttribute(
      'data-variant',
      contract.members.bubble.defaults.variant,
    );
  });

  it('draws the receipt as a mark with a hidden word inside a bubble, and as the word alone outside', () => {
    render(
      <Message status="delivered">
        <Bubble>
          <BubbleContent>
            ok
            <BubbleMeta>
              <MessageReceipt data-testid="inside" />
            </BubbleMeta>
          </BubbleContent>
        </Bubble>
        <MessageFooter>
          <MessageReceipt data-testid="outside" status="failed" />
        </MessageFooter>
      </Message>,
    );
    const inside = screen.getByTestId('inside');
    expect(inside.querySelector('svg')).not.toBeNull();
    expect(inside).toHaveTextContent(contract.messages.delivered);
    const outside = screen.getByTestId('outside');
    expect(outside.querySelector('svg')).toBeNull();
    expect(outside).toHaveTextContent(contract.messages.failed);
  });

  it('pages versions without wrapping, by pointer and by arrow, controlled and uncontrolled', () => {
    const onVersionChange = vi.fn();
    render(
      <Message onVersionChange={onVersionChange} versionCount={3}>
        <MessageVersions />
      </Message>,
    );
    const previous = screen.getByRole('button', { name: contract.messages.previousVersion });
    const next = screen.getByRole('button', { name: contract.messages.nextVersion });
    expect(previous).toBeDisabled();
    expect(screen.getByText('1 de 3')).toBeInTheDocument();
    fireEvent.click(next, { detail: 1 });
    expect(onVersionChange).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(screen.getByText('2 de 3')).toBeInTheDocument();
    fireEvent.keyDown(next, { key: 'ArrowRight' });
    expect(screen.getByText('3 de 3')).toBeInTheDocument();
    expect(next).toBeDisabled();
    expect(onVersionChange).toHaveBeenLastCalledWith(
      2,
      expect.objectContaining({ reason: 'keyboard' }),
    );
  });

  it('holds a controlled version until the consumer moves it', () => {
    function Controlled() {
      const [version, setVersion] = useState(0);
      return (
        <>
          <Message onVersionChange={(next) => setVersion(next)} version={version} versionCount={2}>
            <MessageVersions />
          </Message>
          <output data-testid="out">{version}</output>
        </>
      );
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole('button', { name: contract.messages.nextVersion }));
    expect(screen.getByTestId('out')).toHaveTextContent('1');
    expect(screen.getByText('2 de 2')).toBeInTheDocument();
  });

  it('draws no pager for a message with one version', () => {
    render(
      <Message>
        <MessageVersions data-testid="versions" />
      </Message>,
    );
    expect(screen.queryByTestId('versions')).toBeNull();
  });

  it('asks the row to send a failed message again, with the reason', () => {
    const onRetry = vi.fn();
    render(
      <Message onRetry={onRetry} status="failed">
        <Bubble>
          <BubbleContent>e a fatura</BubbleContent>
          <BubbleRetry />
        </Bubble>
      </Message>,
    );
    fireEvent.click(screen.getByRole('button', { name: contract.messages.retry }), { detail: 1 });
    expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({ reason: 'pointer' }));
  });

  it('toggles a reaction the reader gives, and keeps the count the consumer states', () => {
    const onPressedChange = vi.fn();
    render(
      <Bubble>
        <BubbleContent>ok</BubbleContent>
        <BubbleReactions>
          <BubbleReaction count={3} onPressedChange={onPressedChange}>
            👍
          </BubbleReaction>
        </BubbleReactions>
      </Bubble>,
    );
    const reaction = screen.getByRole('button', { pressed: false });
    fireEvent.click(reaction, { detail: 1 });
    expect(reaction).toHaveAttribute('aria-pressed', 'true');
    expect(reaction).toHaveAttribute('data-pressed', '');
    expect(onPressedChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(reaction).toHaveTextContent('3');
  });

  it('shows the more control only while a clamped text overflows, and keeps the text in the DOM', () => {
    const scroll = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(200);
    const client = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(60);
    render(
      <Bubble data-testid="bubble" maxLines={3}>
        <BubbleContent>um texto muito longo</BubbleContent>
      </Bubble>,
    );
    const more = screen.getByRole('button', { name: contract.messages.more });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(more);
    expect(screen.getByTestId('bubble')).toHaveAttribute('data-revealed', '');
    expect(screen.getByRole('button', { name: contract.messages.less })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('um texto muito longo')).toBeInTheDocument();
    scroll.mockRestore();
    client.mockRestore();
  });

  it('writes the activity steps with the shared states, the current one marked as the step', () => {
    render(
      <Message>
        <MessageActivity>
          <MessageActivityStep status="complete">a</MessageActivityStep>
          <MessageActivityStep data-testid="now">b</MessageActivityStep>
        </MessageActivity>
      </Message>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('a').parentElement).toHaveAttribute('data-complete', '');
    expect(screen.getByTestId('now')).toHaveAttribute('data-current', '');
    expect(screen.getByTestId('now')).toHaveAttribute('aria-current', 'step');
  });

  it('names the typing dots and the quote jump, and runs the consumer’s own handlers', () => {
    const onJump = vi.fn();
    render(
      <MessageDefaultsProvider messages={{ typing: 'Marta está a escrever' }}>
        <Bubble>
          <BubbleContent>
            <BubbleQuote author="Tiago" onJump={onJump}>
              citado
            </BubbleQuote>
            <BubbleTyping />
          </BubbleContent>
        </Bubble>
      </MessageDefaultsProvider>,
    );
    expect(screen.getByRole('img', { name: 'Marta está a escrever' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Tiago/ }));
    expect(onJump).toHaveBeenCalled();
  });

  it('lets an application set the words once', () => {
    render(
      <MessageDefaultsProvider
        actionsVisibility="always"
        layout="thread"
        messages={{ actions: 'Actions' }}
      >
        <Message data-testid="row">
          <MessageActions />
        </Message>
      </MessageDefaultsProvider>,
    );
    expect(screen.getByTestId('row')).toHaveAttribute('data-layout', 'thread');
    expect(screen.getByTestId('row')).toHaveAttribute('data-actions', 'always');
    expect(screen.getByRole('toolbar', { name: 'Actions' })).toBeInTheDocument();
  });

  it('keeps an explicit accessible name over the author', async () => {
    render(
      <Message aria-label="Mensagem de sistema">
        <MessageAuthor>Sistema</MessageAuthor>
      </Message>,
    );
    await act(async () => {});
    expect(screen.getByRole('article', { name: 'Mensagem de sistema' })).toBeInTheDocument();
  });
});
