import { ApplicationInitStatus, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestBackend, resetTestBackend } from '../../../test/testing';
import { PreferencesStore } from './preferences.store';
import { SessionStore } from './session.store';

describe('PreferencesStore', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTestBackend()] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await resetTestBackend();
    await TestBed.inject(SessionStore).load();
  });

  it('writes the scheme and density onto html and persists per user', async () => {
    const prefs = TestBed.inject(PreferencesStore);
    const html = TestBed.inject(DOCUMENT).documentElement;
    prefs.update({ scheme: 'dark', density: 'compact' });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    TestBed.flushEffects();
    expect(html.getAttribute('data-slotted-scheme')).toBe('dark');
    expect(html.getAttribute('data-slotted-density')).toBe('compact');
    const userId = TestBed.inject(SessionStore).user()!.id;
    expect((JSON.parse(localStorage.getItem(`nexora:preferences:${userId}`) ?? '{}') as { scheme: string }).scheme).toBe('dark');
  });

  /**
   * The canvas is not written onto `html`: it is an input of one shell, so the
   * store only has to keep it and give it back.
   */
  it('keeps the shell canvas per user, inset until the reader says otherwise', () => {
    const prefs = TestBed.inject(PreferencesStore);
    expect(prefs.preferences().canvas).toBe('inset');

    prefs.update({ canvas: 'flush' });

    expect(prefs.preferences().canvas).toBe('flush');
    const userId = TestBed.inject(SessionStore).user()!.id;
    const stored = JSON.parse(localStorage.getItem(`nexora:preferences:${userId}`) ?? '{}') as {
      canvas: string;
    };
    expect(stored.canvas).toBe('flush');
  });
});
