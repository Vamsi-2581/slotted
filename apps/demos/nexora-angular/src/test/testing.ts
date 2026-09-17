import { makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { NexoraApi } from '@slotted/demo-nexora-operations';
import {
  createBackendHandle,
  NEXORA_BACKEND,
  type BackendHandle,
} from '../app/core/backend/nexora-backend.provider';

let shared: BackendHandle | undefined;

/** One seeded backend per test file: the seed costs seconds and every test resets it instead. */
export function provideTestBackend(): EnvironmentProviders {
  shared ??= createBackendHandle({ scale: 'light', latency: 'none' }, false);
  return makeEnvironmentProviders([{ provide: NEXORA_BACKEND, useValue: shared }]);
}

export async function resetTestBackend(): Promise<NexoraApi> {
  const api = await TestBed.inject(NEXORA_BACKEND).ready();
  await api.demo.reset();
  await api.demo.setPersona('sofia-ramirez');
  try {
    localStorage.clear();
  } catch {
    /* jsdom without storage */
  }
  return api;
}

export async function signInAs(personaKey: string): Promise<void> {
  const api = await TestBed.inject(NEXORA_BACKEND).ready();
  await api.demo.setPersona(personaKey);
}
