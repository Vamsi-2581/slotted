import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

import { loadReactExample } from './react';

export async function render(id: string): Promise<string> {
  return renderToString(createElement(await loadReactExample(id)));
}
