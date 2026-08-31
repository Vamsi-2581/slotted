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
@layer slotted.reset, slotted.tokens, slotted.theme, slotted.components;
```

| Sublayer     | Written by               | Content                                    |
| ------------ | ------------------------ | ------------------------------------------ |
| `reset`      | —                        | reserved, empty                            |
| `tokens`     | —                        | reserved, empty                            |
| `theme`      | `@slotted/theme-default` | token values per theme, scheme and density |
| `components` | `@slotted/styles`        | every family stylesheet                    |

`reset` and `tokens` carry no rule today. They are declared because a name
inserted later would reorder what already shipped.

The statement opens every distributed stylesheet — `@slotted/tokens/styles.css`,
`@slotted/theme-default/styles.css` and `@slotted/react/styles.css` — so a
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
  .checkout .slotted-button {
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

## Angular

Angular components inline their stylesheet and render it with
`ViewEncapsulation.None`, so the CSS is injected into the document when a
component first renders — after the application's own stylesheets. The layer
order still holds, because `@slotted/theme-default/styles.css` is a required
import and carries the statement.
