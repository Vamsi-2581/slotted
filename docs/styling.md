# Styling and the cascade

Every rule the library ships lives inside the `slotted` cascade layer. Nothing
is written outside it, and no rule uses `!important`.

## The one line an application writes

`slotted` is the only top-level layer. Its sublayers are an implementation
detail. An application that keeps its own CSS in layers declares the order
once, before importing anything:

```css
@layer slotted, app;
```

With Tailwind CSS v4, name Tailwind's layers in the same statement:

```css
@layer slotted, theme, base, components, utilities;
```

Unlayered CSS beats every layer, so an application that writes no layers of
its own needs no declaration: its rules already win.

A layer takes its position from the first mention of its name. The statement
therefore has to come before the first stylesheet that mentions `slotted`,
which is why it belongs at the top of the application's own entry CSS.

## The order the library publishes

```css
@layer slotted.reset, slotted.tokens, slotted.theme, slotted.components, slotted.theme-rules;
```

| Sublayer      | Written by        | Content                                    |
| ------------- | ----------------- | ------------------------------------------ |
| `reset`       | —                 | reserved, empty                            |
| `tokens`      | —                 | reserved, empty                            |
| `theme`       | `@slotted/themes` | token values per theme, scheme and density |
| `components`  | `@slotted/styles` | every family stylesheet                    |
| `theme-rules` | a theme           | the theme's own CSS rules, scoped to it    |

`reset` and `tokens` carry no rule today. They are declared because a name
inserted later would reorder what already shipped.

The statement opens every distributed stylesheet — `@slotted/theme/styles.css`,
`@slotted/themes/default.css` and `@slotted/react/styles.css` — so a
single import establishes the internal order. Restating it is inert: the order
is fixed at the first mention.

The library publishes no override layer. A layer named by the library is a
layer whose position the library controls and can change; application rules
belong in application layers.

## Overriding a rule

Reach for a token first. A family reads its values from the theme, so setting
a token on a scope changes every family under it:

```css
.dense-panel {
  --slotted-space-4: 0.375rem;
}
```

When a declaration has to be replaced rather than retuned, write it in an
application layer or unlayered. Specificity is compared only inside a layer,
so a single class defeats any library selector:

```css
@layer app {
  .checkout [data-ui='button'] {
    border-radius: 0;
  }
}
```

To drop a library declaration and fall back to what the browser or an earlier
layer defines, use `revert-layer`:

```css
@layer app {
  .slotted-card {
    box-shadow: revert-layer;
  }
}
```

## Themes

A theme is a module, not a value file. `defineTheme` (`@slotted/theme`) takes
seeds, a recipe, token values, component tokens, fonts and CSS rules;
`extendTheme` builds one theme on another. `slotted-build-theme` compiles a
theme module to CSS at build time; `applyTheme` compiles and applies one at
runtime.

Extending the shipped theme for one new accent:

```js
import { extendTheme } from '@slotted/theme';
import defaultTheme from '@slotted/themes/default';

export default extendTheme(defaultTheme, { seeds: { accent: '#e11d48' } }, { name: 'rose' });
```

Every heading and title reads `--slotted-font-family-heading`, so a theme gives
headings their own face by declaring that one token
(`docs/token-foundation.md` › Font family).

A theme stylesheet declares the seeds on the element that names the theme
(`data-slotted-theme`), and derives every colour token where a theme and a
scheme are named. A seed set inline on that element recolours every token
derived from it, with no build:

```js
document
  .querySelector('[data-slotted-theme]')
  .style.setProperty('--slotted-seed-accent', '#e11d48');
```

A seed set on an ancestor of that element is redeclared by the theme. On any
element inside it, a seed recolours the subtree when the element also carries
`data-slotted-seeds`, which derives every colour again from the seeds that
element sees:

```html
<section data-slotted-seeds style="--slotted-seed-accent: #e11d48">…</section>
```

`ThemeScope` (`@slotted/react/theme`) and the `slThemeScope` directive
(`@slotted/angular/theme`) write the same attributes on one element: `theme`,
`scheme` and `density` become `data-slotted-theme`, `data-slotted-scheme` and
`data-slotted-density`, and `seeds` becomes the seed custom properties plus
`data-slotted-seeds`. An overlay opened inside the element carries all of them
to the end of the body.

```tsx
<ThemeScope scheme="dark" seeds={{ accent: '#e11d48' }}>
  …
</ThemeScope>
```

```html
<section slThemeScope scheme="dark" [seeds]="{ accent: '#e11d48' }">…</section>
```

`scheme="system"` resolves to `light`, and to `dark` while
`prefers-color-scheme: dark` matches.

A theme rule is CSS passed in `rules`, as a string or the URL of a `.css` file
the build reads:

```js
export default extendTheme(
  defaultTheme,
  { rules: [new URL('./rules.css', import.meta.url)] },
  {
    name: 'rose',
  },
);
```

```css
/* rules.css */
[data-ui='button'][data-variant='solid'] {
  border-radius: var(--slotted-radius-none);
}
```

A theme rule lives in `slotted.theme-rules` and may select only `data-ui`,
`data-part` and the public attributes, reading only tokens. An application
rule stays outside `slotted`, in its own layer or unlayered.

## Angular

Angular components inline their stylesheet and render it with
`ViewEncapsulation.None`, so the CSS is injected into the document when a
component first renders — after the application's own stylesheets. The layer
order still holds, because `@slotted/themes/default.css` is a required
import and carries the statement.
