import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { SessionStore } from '../session/session.store';
import { NotificationsStore } from './notifications.store';

describe('NotificationsStore', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend()] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
    await TestBed.inject(SessionStore).load();
  });

  it('counts unread and updates after markRead', async () => {
    const store = TestBed.inject(NotificationsStore);
    await store.refreshCount();
    const before = store.unread();
    expect(before).toBeGreaterThan(0);
    await store.loadPage();
    const unread = store.items().find((n) => n.readAt === undefined)!;
    await store.markRead(unread.id);
    expect(store.unread()).toBe(before - 1);
  });
});
