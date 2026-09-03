# Field messages — three corrections

A localised correction to what a message under a field looks like, asked for
after reading `field` and `field-group` on their reference pages. It changes one
decision each in three earlier records and one rule in the workbench, and it adds
one input to `inline-message`:

- the reset that keeps the reference page's prose out of a demonstration, added
  to `packages/storybook-workbench/src/workbench.css` when `alert` needed it;
- the danger glyph, decided in `2026-09-02-inline-message-design.md` section 4,
  `2026-09-02-alert-family-design.md` section 5 and
  `2026-09-02-status-indicator-design.md` section 5;
- the mark a field's messages draw at all, which is the `mark` axis added here.

---

## 1. What was reported

Three defects in one sentence: the message was set in large type, it was drawn in
the page's ink rather than in red, and its mark was a crossed circle that reads
as harsh beside a form. Then, on reading the correction: no mark of that kind at
all under a field — a dot, aligned.

## 2. The type and the ink were the workbench's

The first two defects are one defect and it was never in the family.
`inline-message` declares 12 pixels and `--slotted-tone-danger-text` inside
`@layer slotted.components`, and the harness — which loads the theme and nothing
else — has always drawn both. The reference page loads the workbench as well,
and the workbench held this rule:

```css
.slotted-workbench-preview p,
.slotted-workbench-preview li {
  color: inherit;
  font-size: inherit;
  line-height: inherit;
}
```

`inline-message` is a `p`, so the error was one of the paragraphs that rule
reached. `inherit` does not restore the family's own declaration: it hands the
element the value of its parent, which inside a demonstration is the workbench's
16-pixel body ink. The error therefore came out at the page's type in the page's
colour — white on the dark scheme — with its mark the only part of it still red,
because the mark is painted from `currentcolor` through a mask and the mask
survived. Measured on the field reference page before the correction:
`font-size: 16px`, `color: rgb(23, 26, 33)`.

The reset now returns the layer instead of the parent:

```css
.slotted-workbench-preview :is([data-ui], [data-ui] *),
.slotted-reference-page :is([data-ui], [data-ui] *) {
  color: revert-layer;
  font-family: revert-layer;
  font-size: revert-layer;
  font-weight: revert-layer;
  line-height: revert-layer;
}
```

`revert-layer` rolls each property back to the previous cascade layer. An
unlayered declaration reverting lands on `slotted.components`, which is the
family's own declaration; a property no layer declares falls through to the
inherited value, so nothing the family leaves open is frozen by the reset.

Two decisions inside it:

- **It is addressed to library elements.** `[data-ui]` and its descendants are
  what a family renders; a demonstration's own caption in the same stage is not,
  and keeps the page's voice. The rule it replaces reached every `p` and `li` in
  the preview, which is why it had to speak in `inherit` at all.
- **Two attribute selectors, deliberately.** `.slotted-reference-page p` carries
  one class and one type, and the reset has to outrank it in the same origin.
  `:is([data-ui], [data-ui] *)` contributes an attribute selector to a class
  selector, which is one specificity step above.

Measured after: `font-size: 12px`, `color: rgb(91, 107, 127)` for the help tone
and the danger ink for the error.

## 3. The severity glyph is a circle with an exclamation

`--slotted-icon-circle-x` was the wrong choice and the three families that share
the severity map made it together. In the icon set it comes from, a crossed
circle is the mark for cancel, remove and close — `alert` draws its own dismiss
control as an `x` two centimetres from it — and none of the surveyed
implementations uses it for validation. Material, Fluent and Carbon all draw an
error as a circle carrying an exclamation.

`--slotted-icon-circle-alert` is added to the primitive glyph tokens and the
`danger` tone of `inline-message`, `alert` and `status-indicator` maps to it, so
a status light and an alert about the same thing still draw the same silhouette.
`--slotted-icon-circle-x` stays in the token contract: it is the mark for the
action it was named for.

The geometry is the set's: a ring of radius 9 at stroke 1.8, and the stem and dot
placed so the gap above the stem and the gap below the dot are both 5 units —
the same balance `--slotted-icon-circle-info` has upside down.

| Tone      | Glyph before                    | Glyph after                   |
| --------- | ------------------------------- | ----------------------------- |
| `accent`  | `--slotted-icon-circle-info`    | unchanged                     |
| `success` | `--slotted-icon-circle-check`   | unchanged                     |
| `warning` | `--slotted-icon-triangle-alert` | unchanged                     |
| `danger`  | `--slotted-icon-circle-x`       | `--slotted-icon-circle-alert` |

## 4. A field's messages draw a bullet, not a severity

The glyph above is the right mark for a message that stands on its own — an
alert, a status light, one message about one action. It is the wrong mark for a
column of them, which is what a form is: four fields with a description and an
error each draw eight marks of four shapes, and the shapes say nothing that the
tone's ink and the clipped severity word have not already said. The reader is
reading sentences, not identifying a severity by its outline.

`inline-message` therefore gains one axis:

| Value   | What is drawn                                                          |
| ------- | ---------------------------------------------------------------------- |
| `glyph` | The tone's own silhouette. The default, and what a standalone message keeps. |
| `dot`   | One neutral bullet in the tone's ink, the same shape for every tone.   |

`field` and `field-group` state `dot` for their description and their error, and
`mark='glyph'` on either part asks for the silhouette back. Three consequences,
and all three are the point:

- **The help tone gains a mark.** `secondary` draws no silhouette, so a
  description used to start at the message's left edge while the error beside it
  started 20 pixels in. With the dot they start on one edge and only the ink
  changes between them.
- **The severity is carried by colour and by the clipped word.** WCAG 2.2 1.4.1
  is satisfied by the word, not by the shape: `Error:` is read before the
  sentence whatever the mark is, and that is the mechanism the family was built
  for. The dot is not a severity signal and does not pretend to be one.
- **The bullet starts at the message's own left edge.** The disc is a third of
  the glyph scale — 4.67 pixels under 12-pixel type, 5.33 under 13 — so it steps
  with the size step and the density. The box is the disc's own width and the
  mask twice that, because `--slotted-icon-dot` draws a circle half the width of
  its viewBox.

Measured alignment, which is what the correction asked for: the mark box is
`1lh` tall with the mask centred, so at 12 pixels over a 1.5 line box the disc's
centre lands 9.0 pixels from the top of the line box, and Inter's x-height centre
lands at 9.03. The bullet sits on the middle of the lowercase text without a
number saying how, at every size and every density.

The cost, recorded: `loading` restates `inline-size` so the ring stays round in a
column sized for a dot, and the sentence moves by the difference while the
message is waiting. It applies to a message that both draws a bullet and waits.

## 5. What a consumer has to do

Nothing. No part, prop, event or attribute is removed or renamed, and no token
is removed. `mark` defaults to `glyph`, so every message outside a field looks as
it did; a field's own messages change from a silhouette to a bullet, and
`mark='glyph'` restores them one at a time. An application that had overridden
`--slotted-inline-message-icon` keeps its own mark, and one that reads
`--slotted-icon-circle-x` for a control of its own keeps the token.

## 6. Evidence

- `/tmp/field-states-light-comfortable-ltr-240.png`,
  `/tmp/field-states-light-comfortable-ltr-240-zoom300.png` — the bullets at the
  step a drawer gives them, and at 300% for the vertical alignment.
- `/tmp/field-group-states-light-comfortable-ltr-420.png` — a group's messages
  and the fields' on one column.
- `/tmp/field-content-light-comfortable-rtl-420.png` — the bullet mirrored.
- `/tmp/field-states-high-contrast-comfortable-ltr-420.png` — both tones under
  the high-contrast scheme.
- `/tmp/inline-message-marks-light-comfortable-ltr-420.png` — the `marks` scene
  the family's harness gained.
- `/tmp/alert-light-comfortable-ltr-420.png` — the severity glyph beside the
  dismiss control that used to repeat it.
- `packages/storybook-workbench/src/workbench.styles.test.mjs` — the reset is
  asserted by property, and `inherit` is asserted absent.
- `packages/styles/src/inline-message/inline-message.styles.test.mjs` — the
  bullet's geometry, and the ring that stays round beside it.
