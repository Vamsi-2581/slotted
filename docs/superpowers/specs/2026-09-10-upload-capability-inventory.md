# Upload capability inventory

Produced before the family was designed or coded, as
`.claude/skills/component/references/capability.md` requires. The family is new:
`specs/components/upload/` does not exist, and no `upload`, `dropzone` or
`file-input` source remains in `packages/`.

`docs/build-order.md` wave 7 carries one line for it — “`upload` — consolida
`file-upload`, `dropzone` e `file-input` (guia 17)” — so the scope is derived
from `docs/component-features.md` §14 _Upload_ and §17 _Consolidar_, as
`docs/build-briefing.md` directs. §6 records what this inventory adds to that
line.

A `file-upload` family shipped in wave 2 and was removed before this rebuild
reached the wave. Its design is `docs/superpowers/specs/2026-08-31-file-upload-design.md`
and its engine survives as `packages/core/src/files`. §5 puts the two side by
side and names which of its decisions this inventory reverses.

Sources were read on 10 September 2026.

---

## 1. Surveyed

Nine implementations, chosen so they disagree: the platform, an accessibility
library that answers only the two affordances and refuses the rest, two
renderings of one headless machine, three opinionated design systems that answer
the upload question three different ways — a manager, a capture region, a pair
of variants — an enterprise web component whose whole surface is the transfer,
and the specialist product that treats uploading as the product.

| Implementation                        | Calls it                                            | Read at                                                                  |
| ------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| HTML Standard / MDN                   | `<input type="file">`                               | <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file> |
| WAI-ARIA APG (pattern index)          | — no upload, dropzone or drag-and-drop pattern      | <https://www.w3.org/WAI/ARIA/apg/patterns/>                              |
| Ark UI v5.39.1                        | `FileUpload` (Zag `file-upload` machine)            | <https://ark-ui.com/docs/components/file-upload>                         |
| Chakra UI v3                          | `FileUpload` (the same machine, restyled)           | <https://chakra-ui.com/docs/components/file-upload>                      |
| React Aria Components                 | `DropZone` + `FileTrigger`, two components          | <https://react-spectrum.adobe.com/react-aria/DropZone.html>, <https://react-spectrum.adobe.com/react-aria/FileTrigger.html> |
| Ant Design v6.6.3                     | `Upload`, `Upload.Dragger`                          | <https://ant.design/components/upload>                                   |
| Mantine `@mantine/dropzone`           | `Dropzone`, `Dropzone.FullScreen` (over react-dropzone) | <https://mantine.dev/x/dropzone/>                                     |
| Carbon Design System                  | `FileUploader`, `FileUploaderDropContainer`         | <https://carbondesignsystem.com/components/file-uploader/usage/>         |
| Vaadin (latest)                       | `<vaadin-upload>`                                   | <https://vaadin.com/docs/latest/components/upload>                       |
| Uppy 5.x                              | `Dashboard` plus `@uppy/core` restrictions          | <https://uppy.io/docs/dashboard/>                                        |

Two facts about the set matter to the decisions below.

**There is no pattern to follow.** The APG index lists no upload, no dropzone
and no drag-and-drop pattern. The platform supplies the control, and everything
this family adds is its own responsibility to justify. `references/patterns.md`
is answered in the design document rather than by citing a pattern that does not
exist.

**The Angular ecosystem has no answer of its own.** Of the nine, the two that
reach Angular do so from outside it: Uppy ships `@uppy/angular` as a wrapper
around its own DOM, and Vaadin ships a web component. Nothing in the set is an
Angular-native upload control that belongs in a Reactive Form. §3 takes that as
a differentiator rather than as a licence to ship less.

---

## 2. Table stakes

Every capability two or more surveyed implementations ship.

| Capability                                                     | Who ships it                                              | Verdict | Reason                                                                                                                                                                    |
| -------------------------------------------------------------- | --------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Picker opened from a control                                   | all nine                                                  | adopt   | `trigger`, which activates the hidden `input`. The platform's own control, not a reimplementation.                                                                        |
| Drop region                                                    | Ark, Chakra, React Aria, Ant (`Dragger`), Mantine, Carbon, Vaadin, Uppy | adopt   | `dropzone`. Eight of nine.                                                                                                                                                |
| The drop region has a non-pointer alternative                  | React Aria (`FileTrigger` inside `DropZone`), Ark, Chakra, Carbon (Space/Enter on the region) | adopt   | Drag and drop is pointer-only and cannot be made otherwise. The region contains the trigger; the trigger is the accessible path.                                          |
| `accept` applied to the drop, not only to the dialog           | Ark, Chakra, Mantine, Uppy, Vaadin                        | adopt   | `accept` filters the picker dialog and nothing else. `@slotted/core/files` already implements the three token forms; the family calls it on both affordances.               |
| `multiple`                                                     | all nine                                                  | adopt   | Native attribute, forwarded.                                                                                                                                              |
| Maximum file size                                              | Ark/Chakra `maxFileSize`, Mantine `maxSize`, Uppy `maxFileSize`, Vaadin `maxFileSize` | adopt   | `maxSize`, in bytes. Already in `partitionFiles`.                                                                                                                          |
| Minimum file size                                              | Ark/Chakra `minFileSize`, Uppy `minFileSize`              | adopt   | `minSize`. A zero-byte file is the common case it catches.                                                                                                                 |
| Maximum file count                                             | Ark `maxFiles`, Ant `maxCount`, Uppy `maxNumberOfFiles`, Vaadin `maxFiles`, Mantine `maxFiles` | adopt   | `maxFiles`. The extra files are reported with a reason, never truncated in silence.                                                                                        |
| Rejection reported per file with a reason code                 | Ark (`TOO_MANY_FILES`, `FILE_INVALID_TYPE`, `FILE_TOO_LARGE`, `FILE_EXISTS`), Mantine `onReject`, Vaadin `file-rejected`, Uppy `restriction-failed` | adopt   | The reason vocabulary is the family's; the message is the consumer's, because only they know whether a limit is a policy, a plan or a bug.                                  |
| Duplicate detection                                            | Ark `FILE_EXISTS`, Uppy (refuses a file already in the set) | adopt   | `duplicates: 'reject' \| 'allow' \| 'replace'`, identity from name, size and `lastModified`, overridable. **Reverses** the removed family's refusal — see §5.               |
| A validation hook the consumer writes                          | Ark `validate`, Ant `beforeUpload`, Uppy `onBeforeFileAdded` | adopt   | `validate(file) => reason \| null`. Three surveyed implementations, three names, one capability.                                                                            |
| Transforming the selection before it is accepted               | Ark/Chakra `transformFiles`, Ant `beforeUpload` returning a `File`, Uppy `onBeforeFileAdded` | adopt   | `transform(files) => files \| Promise<files>`. This is where compression, renaming and cropping attach without any of them entering this family.                            |
| A list of what was selected, with name and size                | all nine                                                  | adopt   | `list`, `item`, `name`, `size`.                                                                                                                                            |
| Size text localised                                            | Ark/Chakra (`locale` + `Intl`), Vaadin (`units.size` array of nine strings) | adopt   | `Intl.NumberFormat` with `style: 'unit'`. Vaadin's array is nine translated strings an application maintains; `Intl` is the same answer without the maintenance.            |
| Remove one file                                                | all nine                                                  | adopt   | `remove`. Cancels the run first when one is in flight, as Vaadin's Clear does.                                                                                              |
| Remove all                                                     | Ark `ClearTrigger`, Chakra, Uppy                          | adopt   | `clear`.                                                                                                                                                                    |
| Image thumbnail                                                | Ark `ItemPreviewImage`, Chakra, Ant `listType="picture"`/`previewFile`, Uppy thumbnail generator | adopt   | `preview`, from an object URL the family revokes — §14 requires the revocation by name and Ant leaves it to the consumer.                                                    |
| A mark by file kind when there is no thumbnail                 | Ark `ItemPreview type="…"`, Ant `iconRender`              | adopt   | The `preview` part falls back to a glyph chosen by media type.                                                                                                              |
| A grid of cards for an image set                               | Ant `listType="picture-card"`/`"picture-circle"`, Uppy Dashboard grid | adopt   | `layout: 'list' \| 'grid'`. The same items, arranged; not a second component.                                                                                               |
| Per-file progress                                              | Ant, Vaadin, Uppy, Carbon                                 | adopt   | `progress`, composing `progress-indicator` rather than drawing a second bar.                                                                                                |
| Total progress across the queue                                | Uppy, Vaadin (status line)                                | adapt   | `summary`. Derived from the files' own bytes, so it cannot disagree with the rows above it.                                                                                 |
| A status vocabulary per file                                   | Ant (`uploading`/`done`/`error`/`removed`), Vaadin (`connecting`/`processing`/`held`/`stalled`/error kinds), Uppy | adopt   | Seven states, listed in the design. §14 names the same flow.                                                                                                                |
| Cancelling a run in flight                                     | Vaadin (Clear aborts), Uppy, Ant (`onRemove` during upload) | adopt   | `cancel`, through an `AbortSignal` handed to the adapter. The platform's own cancellation, not a flag.                                                                       |
| Retrying after a failure                                       | Vaadin (retry button), Uppy (`retryUpload`, retry all)    | adopt   | `retry`, on the item and on the summary.                                                                                                                                    |
| Starting the transfer by hand instead of on selection          | Vaadin `noAuto` plus a per-file start control, Ant (manual upload demo) | adopt   | `autoUpload`, default `true`, and a `start` control when it is off.                                                                                                         |
| A built-in sender: url, method, headers, field name, credentials | Ant (`action`, `method`, `headers`, `name`, `data`, `withCredentials`), Vaadin (`target`, `method`, `headers`, `formDataName`), Uppy `XHRUpload` | adopt   | Shipped as `createXhrUpload()` in `@slotted/core/upload`, **not** as six props on the family. `XMLHttpRequest` rather than `fetch`, because `fetch` reports no upload progress. |
| A sender the consumer writes                                   | Ant `customRequest`, Uppy plugins, Vaadin (server handler) | adopt   | The `adapter` is the contract; the built-in sender is one implementation of it.                                                                                             |
| Directory selection                                            | Ark/Chakra `directory`, React Aria `acceptDirectory`, Ant `directory`, platform `webkitdirectory` | adopt   | `directory`, forwarded to the input. `webkitRelativePath` reaches the item unchanged.                                                                                        |
| Camera capture                                                 | Ark/Chakra `capture`, React Aria `defaultCamera`, platform `capture` | adopt   | Native attribute, forwarded. Nothing to implement.                                                                                                                          |
| Files pasted from the clipboard                                | React Aria `DropZone` (its own example says “drop or paste”), Chakra (pasting example), Ant (paste demo) | adopt   | `paste`, on the region while it holds focus. It is the keyboard's only route to a file that is not on disk.                                                                  |
| Refusing the document's own drop                               | Ark/Chakra `preventDocumentDrop`, default `true`          | adopt   | A file dropped beside the zone navigates the browser away from the application and loses the form. Default `true`, as both do.                                               |
| Whether clicking the region opens the picker                   | Ark `disableClick`, Mantine `activateOnClick`, Ant `openFileDialogOnClick` | adopt   | `clickToBrowse`. Three names, one switch.                                                                                                                                   |
| Drag feedback on the region                                    | Mantine (`data-accept`/`data-reject`/`data-idle`), Ark (`data-dragging`), React Aria (`data-drop-target`) | adopt   | `dragging`, `drop-target` and `drop-invalid`. The third is missing from `specs/contract.schema.mjs` and is added there first — see §4 and §6.                                 |
| `disabled`                                                     | all nine                                                  | adopt   | Disables the input, and the drag handlers check it too, since a drag is not routed through the input.                                                                        |
| `readOnly`                                                     | Ark, Chakra                                               | adopt   | A list that can be read and not changed. Distinct from `disabled` per `docs/component-features.md` §2.5.                                                                     |
| `invalid`, `required`, `name` — the control is a form field    | Ark, platform                                             | adopt   | The family sits in `field`, takes its `disabled`/`invalid`/`required`, and submits under `name`.                                                                             |
| The native input stays in the accessibility tree               | Ark `HiddenInput`, Chakra, platform                       | adopt   | Clipped, never `display: none`. The removed family established this and it is kept — see §5.                                                                                 |
| Every visible string replaceable                               | Vaadin (`i18n` object), Ark (`translations`)              | adopt   | On the defaults provider, so an application translates once, and per instance.                                                                                              |
| Resumable and chunked transfer                                 | Uppy (tus), Vaadin (server-side)                          | decline | §14 assigns it to the adapter by name. The adapter contract carries `signal`, `progress` and the pause handshake, which is everything a resumable sender needs from the UI.  |
| Image cropping and editing                                     | Uppy image editor, Ant (via `antd-img-crop`)              | decline | `transform` is the attachment point, and Ant's own answer is a separate package. An editor is a family, not a part of this one.                                              |
| Remote sources — Drive, Dropbox, a URL                         | Uppy Companion                                            | decline | Companion is a server. Nothing about it is expressible in a component contract.                                                                                             |
| Reordering the list by dragging                                | Ant (demo, with `dnd-kit`)                                | decline | The consumer owns `files`; reordering is `onFilesChange` with a reordered array. Ant's own demo reaches for a third-party library to do it.                                   |
| A per-item download and preview action                         | Ant (`onDownload`, `onPreview`, `showUploadList`)         | decline | The `actions` part takes the consumer's own buttons. Naming two of them privileges one arrangement, which is the argument `toast` wrote for its cancel slot.                  |

---

## 3. Differentiators

What the best surveyed implementation offers that the others do not, and what
this library can offer because of what it already owns.

| Differentiator                                  | Against the field                                                                                                                                                                    |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Three schemes, three densities, RTL, on every part | No surveyed implementation answers a high-contrast scheme or a density axis. The item row, its meta, its bar and its actions all read at `dense` and mirror under `dir="rtl"`.        |
| The item row answers its own inline size        | A drop region is put in a sidebar, a dialog and a full page in the same application. Every surveyed implementation reflows on the viewport or not at all; this one declares `container-type: inline-size` and folds the meta under the name at its own narrow width. |
| An Angular-native control that belongs in a form | `ControlValueAccessor` over `File[]`, plus `Validator` for the count and the in-flight rule. Nothing in the surveyed set offers this; Uppy and Vaadin reach Angular from outside it.  |
| Three failures kept apart                       | `rejected` (never entered the queue), `error` (the run failed) and `canceled` (the reader stopped it) are one red row in every surveyed implementation. Each gets its own state, its own reason and its own control here. |
| Remaining time from observed throughput         | Vaadin alone shows a remaining time, and it is a string the server composes. This one is computed from the bytes the adapter reports and formatted with `Intl`, so it works against any adapter and in any locale. |
| A queue with a concurrency limit                | Uppy alone limits parallel transfers. Ant and Vaadin start every file at once, which is how twelve files on a slow uplink all stall together.                                          |
| Bounded automatic retry                         | Uppy's retry is the reader pressing a button, and its `retryDelays` belong to one plugin. Here `retries` is on the queue: a transient failure is retried with backoff before the reader is told anything. |
| Pause and resume that are honest                | Uppy pauses because tus resumes. A pause control that appears over a sender which cannot honour it is a lie; the adapter declares `pausable`, and the control exists only when it does. |
| Minimum count, and a maximum total size         | `minFiles` is what makes `required` mean something on a multi-file control, and Uppy alone ships `maxTotalFileSize`. Both are one line in the same validation pass.                     |
| Defaults set once, in both bindings             | Ant's global config marks nearly every Upload prop as unavailable to it. Here a provider (React) and an injection token (Angular) carry the labels, the limits and the adapter for the whole application. |

---

## 4. Gaps

What no surveyed implementation handles well and a real product still hits.

| Gap                                                                    | What this family does                                                                                                                                                                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The form is submitted while files are still in flight                  | Nobody in the set answers it, and the result is a record saved with an attachment that never arrived. The control reports itself invalid while a run is pending — `Validator` in Angular, `setCustomValidity` on the hidden input in React — so the native submit is refused and the message is the consumer's. |
| The reader learns a file is refused only after letting go              | `DataTransfer.items` exposes `kind` and `type` during `dragover`, which is enough to judge the accept list and the count before the drop. Mantine is the only one that reads it. The region paints `drop-invalid` while the drag is still overhead. |
| A dropped folder in a zone that does not accept directories            | `DataTransferItem.webkitGetAsEntry()` reports it. The surveyed implementations either ignore the drop or add a zero-byte entry with the folder's name. This one refuses it with the `directory` reason.                    |
| Four hundred files from a directory selection                          | Ark's own documentation answers this by telling the reader to raise `maxFiles`. Four hundred rows is not a list a person reads: past a threshold the list shows the first rows and a disclosure carrying the rest, and the summary carries the count. |
| A transfer that stops without failing                                  | Vaadin has a `stalled` string and nothing that produces it. Here the queue marks a run stalled when no progress arrives inside a window, and says so on the row rather than leaving a bar at 43%.                          |
| A file name that is one unbroken token, or right-to-left, or bidirectional | Truncation in the middle, so the extension survives; `dir="auto"` on the name; the whole string stays in the DOM and reachable, per the repository's standing rule that truncation never removes content.                    |
| Object URLs outlive the preview                                        | §14 requires the revocation by name. Ant leaves it to the consumer and Uppy owns a plugin for it. Here the URL is created by the family and revoked when the item leaves or the family unmounts.                            |
| The reader closing the tab mid-transfer                                | Nothing in the set mentions it. The family does not install a `beforeunload` handler — that is an application policy and a global side effect — but it publishes the pending count so the application can.                    |

---

## 5. Against what was removed

The wave-2 `file-upload` family selected files and refused to transfer them.
Four of its decisions are kept and three are reversed. The reversals are
contract breaks against a family no longer in the tree, so nothing has to
migrate; they are recorded because `docs/component-features.md` §18 asks for the
reasoning, and because each was argued in writing before.

**Kept.** The `<input type="file">` is the control and the region is its
`<label>`, so the accessible name needs no generated id. The input is clipped,
never `display: none`. The region draws the ring for the input inside it. The
drag depth is counted rather than trusting `dragleave`, so the highlight does
not flicker when the pointer crosses a child.

**Reversed — the family now transfers.** “The component never uploads, so
progress is not its number” was right for a family that had no adapter. §14
names an upload adapter in the contract and a flow with `uploading`, `paused`,
`success`, `error` and `canceled` in it, and §17 puts the Upload Manager inside
this family. Without the transfer, the queue, the concurrency, the retry and the
cancel have no owner, and every consumer writes them again. What is preserved
from the old argument is the boundary: the family never opens a connection
itself. It calls an adapter and reports what the adapter says.

**Reversed — duplicates are detected.** “Nothing is de-duplicated… the answer
differs by application” left every consumer to write the comparison. Two
surveyed implementations ship it, and the disagreement it named is answered by
making the policy an axis and the identity replaceable, rather than by having no
policy.

**Reversed — the item is not only a row.** The old item took no `progress` so
that the consumer could compose a bar. The bar is now the family's, composed
from `progress-indicator`, because the number comes from the family's own
adapter call. The `actions` part keeps the composition the old argument wanted.

---

## 6. What this adds to the scope paragraph

`docs/build-order.md` carries one line for `upload`. This inventory adds, and
the line is rewritten to carry, what the line does not name:

- the transfer itself — adapter, queue, concurrency, bounded retry, cancel,
  pause where the adapter honours it, and auto or manual start;
- `@slotted/core/upload` as a new entry point outside the barrel, holding the
  queue machine, the size and duration formatting and `createXhrUpload()`, for
  the two reasons `@slotted/core/filter` is outside it: both bindings must agree
  exactly, and a family that imports a button should not pull a transfer engine;
- `drop-invalid` into the state vocabulary of `specs/contract.schema.mjs`.
  `docs/component-features.md` §2.5 already lists `dragging`, `drop-target` and
  `drop-invalid` as the drag-and-drop set, and the schema holds the first two.
  It is a shared-tool change, made first and in its own commit, as
  `docs/build-briefing.md` requires;
- the three shapes the consolidation names — a drop region, a bare trigger, and
  a field-shaped control — as one axis rather than three families;
- the form rule: a pending transfer makes the control invalid.

Nothing here is a second family. `filter-bar`, `data-grid` and the editor
families are untouched.
