# @slotted/react

React components for Slotted, a UI library for product web applications.

This package is a `0.x` beta. Its public API changes between beta releases without deprecation.

## Install

```sh
npm install @slotted/react @slotted/core @slotted/theme @slotted/themes
```

`react` `>=19.2.0 <20` is a peer dependency.

## Use

Load the component stylesheet and one theme once, then import each component from its subpath:

```tsx
import '@slotted/themes/default.css';
import '@slotted/react/styles.css';
import { Button } from '@slotted/react/button';

export function Actions() {
  return <Button>Save</Button>;
}
```

Every rule the library ships lives in the `slotted` cascade layer. An application that keeps its own CSS in layers declares `@layer slotted, app;` before the first import ([styling](https://github.com/andrelopes-code/slotted/blob/main/docs/styling.md)).

## Language

Components write English when no provider is present. `SlottedProvider` sets the locale and the catalogs of its subtree:

```tsx
import { SlottedProvider } from '@slotted/react/i18n';
import { PT_BR } from '@slotted/core/i18n/pt-BR';

<SlottedProvider locale="pt-BR" catalogs={{ 'pt-BR': PT_BR }}>
  {children}
</SlottedProvider>;
```

## Agents

`dist/docs/AGENTS.snippet.md` is the section an application adds to the instructions its coding agent reads: `AGENTS.md`, or `CLAUDE.md` for Claude Code, directly or through `@AGENTS.md`. It points the agent at the family pages, the guidelines and the skills of the installed version.

## License

MIT
