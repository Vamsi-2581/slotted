## Slotted UI (@slotted/react)

Before writing or changing UI, read `{{docsDir}}/index.md`, then the file of each family you use. These files match the installed version: prefer them over prior knowledge of the library.

- Import components from `@slotted/react` or the family subpath that each file's Import section shows.
- Load `@slotted/react/styles.css` and `@slotted/themes/default.css` once, at the application entry.
- Set `data-slotted-theme="default"` on `<html>`. `data-slotted-scheme` (`light`, `dark`, `high-contrast`) and `data-slotted-density` (`comfortable`, `compact`, `dense`) apply to any element and its descendants.
- Change a family's appearance through its props (`size`, `variant`, `tone` where it has them), not with CSS that targets its parts.
- Application CSS uses `var(--slotted-*)` tokens for color, spacing and radius, inside a layer declared after the library's: `@layer slotted, app;`.
- To render a family as another element, such as a router link or a trigger, pass `render`.
- In CSS and tests, select a family by `[data-ui="<family>"]` and its parts by `[data-part="<part>"]`.
