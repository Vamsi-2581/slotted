# Component harness

The harness renders the one authored family stylesheet against framework-free markup. It is faithful because React and Angular consume that same CSS; it is fast enough to support repeated visual correction.

## Commands

Build `tools/harness/out/<family>.html`:

```bash
node tools/harness/build.mjs <family>
```

If the default theme has not been built, run `pnpm --filter @slotted/theme-default build` once and rebuild the harness.

Capture one combination at twice the device scale. Every axis is named, and each defaults to the first value listed:

```bash
node tools/harness/shoot.mjs <family> \
  --scheme <light|dark|high-contrast> \
  --width <420|240|720> \
  --density <comfortable|compact|dense> \
  --dir <ltr|rtl> \
  --scene <name> \
  --out <directory>
```

The capture is the whole page, not the window: the shooter drives Chrome through the DevTools protocol and clips to the document's own height. A family with many scenes therefore produces one tall image, so `--scene` narrows it to a single scene when a detail needs to fill the view.

The shooter prints the PNG's absolute path, and the name states every axis. Its default output directory is `$TMPDIR` or `/tmp`. Always read the image; file existence and size do not distinguish the component from a browser error page.

## Fragment contract

Author `packages/styles/src/<family>/<family>.harness.html` as one or more scenes:

```html
<section data-scene="default">
  <!-- the family DOM for this scene -->
</section>
```

Scene names must be unique and stable. The builder emits every scene in `light`, `dark` and `high-contrast` at 240, 420, and 720 pixels. Density and direction are applied to the whole page from the query, not multiplied into cells. Open the generated HTML without a query to review the full matrix.

Every `data-part` in `specs/components/<family>/contract.json` must appear in at least one scene. Exercise every declared state, plus content lengths and combinations that can alter layout. Include a deep or long-content scene when the family can wrap, truncate, collapse, or overflow.

The fragment is a third place where the DOM is written, after React and Angular. It can drift. Re-read it whenever either framework's markup changes, then compare its `data-part` values, relationships, attributes, and states to both implementations and the contract.

## Visual loop

At minimum capture light at 420, dark at 420, light at 240, high contrast at 420, dense at 420, and RTL at 420. Also inspect 720 pixels whenever width affects composition. Read every capture at full size and compare it to the prior iteration.

Check alignment, spacing rhythm, optical balance, type, contrast, focus treatment, glyph geometry, long content, the narrow-width decision, whether density changes size without changing meaning, and whether the mirrored layout is the same component rather than a rearranged one. Correct the source, rebuild, and recapture every affected combination. Stop only when the picture and live interactions meet `rubric.md`.

A blank capture usually means the page's query filter and builder ID pattern disagree. An `ERR_FILE_NOT_FOUND` capture means the shooter did not give Chrome a valid `file:` URL. Resolve either problem before judging the component.
