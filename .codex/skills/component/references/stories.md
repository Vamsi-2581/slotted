# The reference page

A family's two reference pages are the only place a consumer meets it. The
harness proves the picture; the pages prove the API. A page that shows a
component working and never shows how it is written documents a screenshot.

This file is binding for every family not listed in
`specs/legacy-reference-pages.json`. That list only shrinks: a family leaves it
when both of its pages answer this contract, and nothing may join it.
`specs/reference-pages.test.mjs` is the ratchet, and
`referencePageErrors` — from `@slotted/storybook-workbench/testing`, called in
each family's stories spec — is the check.

## What the page must contain

In this order, because it is the order a reader needs it in.

1. **Import.** The exact import statement. An Angular page also names the
   `selector` the directive attaches to and its `exportAs`. A reader who
   cannot copy the import cannot start.
2. **Anatomy.** One row per part the contract declares: the `data-part`, the
   element it renders, whether it is always present, and what it is for. The
   contract already names the parts; this is where the page says what they are.
3. **Demonstrations.** One per scenario the contract declares — not two, not
   the two that happened to be wired up. Each one carries a title, a caption
   saying what to look at, and the code that produced it.
4. **Inputs, or Props.** Every axis and every value input, with its type, its
   default and one line of meaning. Every default the contract declares is
   required to appear, and the shared checker enforces it.
5. **Outputs, or Events.** Name, payload, and the moment it is emitted. A
   family whose contract declares a `stateModel` and shows no event table is
   refused.
6. **Composition and escape hatches.** The provider that sets defaults once,
   the `render` prop or the directive on the consumer's own element, the ref or
   `exportAs`, the native attributes that pass through, and the handlers that
   compose rather than replace.
7. **Accessibility.** At least three sentences, each naming a decision rather
   than a virtue: what the platform supplies, what the family adds, what a
   reader hears.
8. **Public tokens**, then **Code** — the anatomy as it reaches the DOM, and
   the stylesheet an application would write to retune the family.

## Demonstrations

The scenario list in the contract is the floor. A family with three axes, four
states and a composition story does not have three demonstrations.

Every demonstration is worth its place or it is not on the page:

- **It answers a question a reader actually has.** "What does `variant` do" is
  a question; "here are all the values in a row" is a swatch. Show each value
  in the context that value exists for — a neutral link in a table row, an
  inverse link on a solid surface — and the axis explains itself.
- **It carries a caption that says what to look at**, not what it is called.
  Forty characters is the floor the checker enforces, and the floor is not the
  target. "Hover darkens the text and fills the underline; press goes one step
  further" is a caption. "The states" is a label.
- **It shows its own source.** The curated snippet beside the canvas is the
  usage, not the demo scaffolding: the two or three lines a consumer would
  actually write. Snippets are formatted by Prettier and checked, so they are
  code a reader can paste.
- **It is exercised at the narrow width and in every scheme** before it is
  called finished. The toolbar switches scheme, density and direction, and a
  demonstration that only holds at 1400 pixels in light is half a
  demonstration.

Include, at minimum, one demonstration for each of: every axis, every state the
contract declares, the family in a real context rather than in isolation,
content the family did not choose (long, translated, right-to-left, unbroken),
composition with the families it is meant to sit beside, and the keyboard.

## Spacing, and why stories may not style themselves

Every demonstration is laid out with the workbench primitives. A story that
reaches for an inline style is reaching past one, and
`specs/reference-pages.test.mjs` refuses it.

| Primitive                                                                             | What it is for                                                                                             |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `.slotted-demo-grid` with `data-columns="1\|2\|3"`                                    | The row of scenes. Scenes share a subgrid, so stages start on the same line however long the captions are. |
| `.slotted-demo-scene` with `__header`, `__label`, `__note`                            | One scene: its name and its caption.                                                                       |
| `.slotted-demo-stage` with `data-layout="row\|stack\|prose"` and `data-align="start"` | The ground the examples stand on. **It owns the gap**: nothing placed on it can touch anything else.       |
| `.slotted-demo-surface` with `data-surface="inverse\|raised\|sunken"`                 | A painted context, from foundation tokens, so it answers the scheme switch.                                |
| `.slotted-demo-rows`                                                                  | A dense two-column table context, for a family whose real home is a row.                                   |
| `.slotted-demo-measure`                                                               | A narrow column, for showing what happens at 360 pixels and below.                                         |
| `.slotted-demo-stack`, `.slotted-demo-row`                                            | A column or a wrapping row of examples inside a stage.                                                     |
| `--slotted-demo-gap`                                                                  | The one distance a story may retune, and it is a custom property rather than a style attribute.            |

If a demonstration needs a ground the primitives do not have, add the primitive
to `workbench.css` with a test, in its own commit, and use it. That is the same
rule the briefing states for every other shared tool.

## Before the gate

If a Storybook server is already running, validate in that live scenario first.
Use React on port 6006 or Angular on port 6007. Do not start Storybook here.
If neither is running, validate with the harness or the available rendered artifacts.
Not the story files — the pages. The reference pages are Storybook docs
entries: `.../iframe.html?viewMode=docs&id=components-<family>--reference`
renders one on its own, which is what a screenshot can be taken of.

Look for, and fix:

- a demonstration whose canvas is mostly empty;
- two examples with no distance between them;
- a caption that says the title again;
- a table clipped at the right edge;
- a scene whose stage starts lower than the one beside it;
- an API table that omits an input the story uses;
- a code drawer whose snippet no longer matches the demonstration above it.

Hand the page URLs to the reviewer at the gate, and say which widths and
schemes were read.
