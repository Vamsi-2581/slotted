import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import contract from '../../../../specs/components/message-scroller/contract.json';

import {
  SlMessageScroller,
  SlMessageScrollerContent,
  SlMessageScrollerItem,
  SlMessageScrollerJump,
  SlMessageScrollerLoader,
  SlMessageScrollerSeparator,
  SlMessageScrollerUnread,
  SlMessageScrollerViewport,
} from './message-scroller';
import { provideMessageScrollerDefaults } from './message-scroller-defaults';

@Component({
  imports: [
    SlMessageScroller,
    SlMessageScrollerContent,
    SlMessageScrollerItem,
    SlMessageScrollerJump,
    SlMessageScrollerLoader,
    SlMessageScrollerSeparator,
    SlMessageScrollerUnread,
    SlMessageScrollerViewport,
  ],
  template: `
    <div slMessageScroller #chat="slMessageScroller" id="root" [busy]="busy()">
      <div slMessageScrollerViewport id="viewport">
        <div slMessageScrollerContent id="log">
          <div slMessageScrollerLoader></div>
          <div slMessageScrollerItem><div slMessageScrollerSeparator sticky>Hoje</div></div>
          <div slMessageScrollerItem><div slMessageScrollerUnread></div></div>
          @for (row of rows; track row) {
            <div slMessageScrollerItem [messageId]="row" [anchor]="row.endsWith('0')">
              {{ row }}
            </div>
          }
        </div>
      </div>
      <button slMessageScrollerJump id="jump"></button>
    </div>
  `,
})
class Chat {
  readonly busy = signal(false);
  readonly rows = ['m0', 'm1', 'm2'];
  readonly chat = viewChild.required<SlMessageScroller>('chat');
}

async function mount() {
  const fixture = TestBed.createComponent(Chat);
  fixture.detectChanges();
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

describe('slMessageScroller', () => {
  it('writes the family identifier and every contract part', async () => {
    const { root } = await mount();
    expect(root.querySelector('#root')?.getAttribute('data-ui')).toBe(contract.ui);
    for (const part of contract.members.messageScroller.parts) {
      if (part === 'root' || part === 'jump-count') continue;
      expect(root.querySelector(`[data-part="${part}"]`), part).not.toBeNull();
    }
  });

  it('is a labelled, focusable region around a log that holds arrivals back while busy', async () => {
    const { fixture, root } = await mount();
    const viewport = root.querySelector('#viewport') as HTMLElement;
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe(contract.messages.label);
    expect(viewport.getAttribute('tabindex')).toBe('0');
    const log = root.querySelector('#log') as HTMLElement;
    expect(log.getAttribute('role')).toBe('log');
    expect(log.getAttribute('aria-relevant')).toBe('additions');
    fixture.componentInstance.busy.set(true);
    fixture.detectChanges();
    expect(log.getAttribute('aria-busy')).toBe('true');
  });

  it('marks rows by id and anchor', async () => {
    const { root } = await mount();
    const first = root.querySelector('[data-message-id="m0"]') as HTMLElement;
    expect(first.getAttribute('data-anchor')).toBe('true');
    expect(root.querySelector('[data-message-id="m1"]')?.hasAttribute('data-anchor')).toBe(false);
  });

  it('keeps the jump control inert while there is nowhere to go', async () => {
    const { root } = await mount();
    const jump = root.querySelector('#jump') as HTMLButtonElement;
    expect(jump.getAttribute('data-active')).toBe('false');
    expect(jump.getAttribute('tabindex')).toBe('-1');
    expect(jump.hasAttribute('inert')).toBe(true);
    expect(jump.getAttribute('aria-label')).toBe(contract.messages.jumpToEnd);
  });

  it('exposes the commands on the instance', async () => {
    const { fixture, root } = await mount();
    const chat = fixture.componentInstance.chat();
    expect(chat.scrollToMessage('m1')).toBe(true);
    expect(chat.scrollToMessage('nowhere')).toBe(false);
    chat.focus();
    expect(document.activeElement).toBe(root.querySelector('#viewport'));
  });

  it('lets an application set its words once', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideMessageScrollerDefaults({ messages: { label: 'Conversa', unread: 'Por ler' } }),
      ],
    });
    const { root } = await mount();
    expect(root.querySelector('#viewport')?.getAttribute('aria-label')).toBe('Conversa');
    expect(root.querySelector('[data-part="unread"]')?.textContent?.trim()).toBe('Por ler');
  });
});
