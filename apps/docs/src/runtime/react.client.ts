import { createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { loadReactExample } from './react';

export async function mount(element: HTMLElement, id: string): Promise<void> {
  hydrateRoot(element, createElement(await loadReactExample(id)));
}
