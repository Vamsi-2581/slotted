# Component harness

The harness renders the one authored family stylesheet against framework-free markup. It is faithful because React and Angular consume that same CSS; it is fast enough to support repeated visual correction.

## Commands

Run the family checker:

```bash
node tools/harness/check.mjs <family>
```

Build `tools/harness/out/<family>.html`:

```bash
node tools/harness/build.mjs <family>
```

If the default theme has not been built, run `pnpm --filter @slotted/theme-default build` once and rebuild the harness.

Capture one scheme and container width at twice the device scale:

```bash
node tools/harness/shoot.mjs <family> <light|dark> <240|420|720>
```

The shooter prints the PNG's absolute path. Its default output directory is `$TMPDIR` or `/tmp`. Always read the image; file existence and size do not distinguish the component from a browser error page.

## Fragment contract

Author `packages/styles/src/<family>/<family>.harness.html` as one or more scenes:

```html
<section data-scene="default">
  <!-- the family DOM for this scene -->
</section>
```

Scene names must be unique and stable. The builder emits every scene in `light` and `dark` at 240, 420, and 720 pixels. Open the generated HTML without a query to review the full matrix.

Every `data-part` in `specs/components/<family>/contract.json` must appear in at least one scene. Exercise every declared state, plus content lengths and combinations that can alter layout. Include a deep or long-content scene when the family can wrap, truncate, collapse, or overflow.

The fragment is a third place where the DOM is written, after React and Angular. It can drift. Re-read it whenever either framework's markup changes, then compare its `data-part` values, relationships, attributes, and states to both implementations and the contract.

## Visual loop

At minimum capture `light 420`, `dark 420`, and `light 240`. Also inspect 720 pixels whenever width affects composition. Read every capture at full size and compare it to the prior iteration.

Check alignment, spacing rhythm, optical balance, type, contrast, focus treatment, glyph geometry, long content, and the narrow-width decision. Correct the source, rebuild, and recapture every affected combination. Stop only when the picture and live interactions meet `rubric.md`.

A blank capture usually means the page's query filter and builder ID pattern disagree. An `ERR_FILE_NOT_FOUND` capture means the shooter did not give Chrome a valid `file:` URL. Resolve either problem before judging the component.
