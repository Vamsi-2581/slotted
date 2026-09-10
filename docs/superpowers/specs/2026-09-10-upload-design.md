# Upload design

The decisions taken before any of the family was written, and what each one
costs. The candidates they were taken from are in
`docs/superpowers/specs/2026-09-10-upload-capability-inventory.md`; this
document does not repeat them.

The family is `upload`. It consolidates what
`docs/component-features.md` §17 lists as three — `dropzone`, `file-input` and
the upload manager — into one member with three shapes.

---

## 1. There is no pattern, so the platform is the pattern

`references/patterns.md` asks for the applicable WAI-ARIA Authoring Practices
pattern, transcribed item by item. The index at
<https://www.w3.org/WAI/ARIA/apg/patterns/> lists no upload, no dropzone and no
drag-and-drop pattern. That is recorded in the contract as `patternStatus`, and
the three official sources that do apply are cited instead.

| Source                                                                        | What it settles                                                                                                          |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `<input type="file">` — <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file> | The control, its keyboard, its accessible name through a `<label>`, form association and submission, `accept`, `multiple`, `capture`, `webkitdirectory`. |
| APG Button Pattern — <https://www.w3.org/WAI/ARIA/apg/patterns/button/>        | The per-item controls: `Enter` and `Space` activate, each has an accessible name, each is a real `<button type="button">`. |
| WCAG 2.2 SC 2.5.7 Dragging Movements — <https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html> | Every action reachable by dragging is reachable by a single pointer action that is not a drag. The trigger is that action, and it is inside the region. |
| WCAG 2.2 SC 4.1.3 Status Messages — <https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html>      | A file arriving, failing or finishing is a status change that does not take focus, so it is announced without moving focus. |

**What the platform supplies, and the family does not rewrite:** the picker
dialog; `Enter` and `Space` opening it from the focused input; the accessible
name from the enclosing `<label>`; `disabled` removing the control from the tab
order and from submission; `required` and `:invalid`; the `FileList`; form reset;
`accept` filtering the dialog; `capture` choosing a camera; `webkitdirectory`
choosing a folder.

**What is the family's own:** applying `accept` to a drop as well as to the
dialog; the drag depth counter; the drag verdict painted before the drop; the
selection's validation and its reasons; the list and its per-file controls; the
transfer queue; the announcements; and the rule that a pending transfer makes
the control invalid.

---

## 2. The trigger is the `<label>`, and the region is not

The wave-2 family made the whole drop region a `<label>` with the input inside
it. That is moved one element in: the **trigger** is the `<label>`, styled as a
button, and the clipped `<input type="file">` sits inside it.

Three things follow, and the third is why it moved.

The input's accessible name is the trigger's text — “Browse files” — rather than
every word in the region. The wave-2 document had to write a warning about this:
“Keep the region's visible text short. It is the input's accessible name, so a
paragraph of guidance inside the dropzone is a paragraph a screen reader reads
before the control is identified.” A warning that a reader of the code has to
obey is a defect with documentation on it. With the label around the trigger
alone, the guidance can be as long as the product needs, and it reaches the
input as `aria-describedby` on the `description` part, which is where a
description belongs.

Nothing focusable is nested inside anything focusable. A `<button>` inside a
`<label>` opens the picker twice — once from the button's own activation and
once from the label's — and a `<label>` inside a `<label>` is invalid. Making the
trigger the label removes both.

The region can then be a plain `div` that carries the drag handlers and, when
`clickToBrowse` is true, forwards a click to the trigger. The forward is skipped
when the click's target is inside the trigger, so the picker opens once.

**Kept from wave 2, and for its original reasons.** The input is clipped, never
`display: none` or `visibility: hidden`, so it stays in the tab order and in the
accessibility tree. It is not stretched transparently across the region, which
would take the drop away from the region and make the drag state unobservable.
The ring is drawn by the trigger through `:has(:focus-visible)`, because what is
focused is one clipped pixel. The four clip declarations are restated in this
family's stylesheet rather than reached for from `visually-hidden`, so no class
becomes a shared public surface.

**Cost.** The region is not itself a control, so a reader tabbing through the
page lands on the trigger and not on the region. That is the correct target —
the region does nothing a pointer cannot do — but it means the region's own
`aria-describedby` guidance is heard when the trigger is reached, one element
after the eye has arrived at the box.

---

## 3. Three shapes, one member

`variant` is an axis, not three families.

| `variant`  | What is drawn                                                                            | Replaces          |
| ---------- | ---------------------------------------------------------------------------------------- | ----------------- |
| `dropzone` | The region, its label, its description and the trigger inside it. The default.           | `dropzone`        |
| `button`   | The trigger alone. Drop and paste are still accepted on it, because it is still a target. | the upload button |
| `field`    | A control-height row: the trigger at the inline start and the selection's summary beside it. | `file-input`      |

The list, the summary and every per-item control are the same parts in all
three. `docs/component-features.md` §17 asks for parts and recipes rather than
families, and the difference between the three is which parts are drawn and how
the region is shaped — not what the family knows.

---

## 4. The drag verdict is painted before the drop

`dragenter` and `dragleave` fire for every element the pointer crosses, so the
depth counter from wave 2 is kept: `dragenter` increments, `dragleave`
decrements, the state clears at nought, and `drop` resets it outright.
`dragover` is cancelled on every event, because its default action is to refuse
the drop.

What is new is the verdict. During the drag, `DataTransfer.items` exposes each
item's `kind` and `type` — not its name and not its size. That is enough to
answer three of the five rules the drop will be judged by, so the region paints
`drop-invalid` instead of `drop-target` when:

- any item's `kind` is not `file`;
- any item's `type` is non-empty and fails the `accept` list;
- `items.length` alone already exceeds `maxFiles`, or `multiple` is false and
  more than one item is being dragged.

**The rule for what cannot be known is that it is not judged.** A file's name is
unavailable during a drag, so an `accept` list of extensions alone can say
nothing; a file's size is unavailable, so `maxSize` can say nothing. In both
cases the region paints `drop-target` and the refusal happens after the drop,
with a message. Painting `drop-invalid` on a maybe would teach the reader that
the red edge means nothing.

`drop-invalid` is not in `specs/contract.schema.mjs`. `docs/component-features.md`
§2.5 already lists `dragging`, `drop-target` and `drop-invalid` as the
drag-and-drop set and the schema holds the first two, so the word is added to the
vocabulary — a shared-tool change, made first and in its own commit, as
`docs/build-briefing.md` requires.

---

## 5. The family transfers, and it never opens a connection

The wave-2 family refused to upload: “the library selects files; whoever uploads
them is the only party that knows how far along the upload is.” That was right
for a family with no adapter. `docs/component-features.md` §14 names an upload
adapter in the contract and a flow with `queued`, `uploading`, `paused`,
`success`, `error` and `canceled` in it; §17 puts the Upload Manager inside this
family. Without the transfer, the queue, the concurrency, the cancel and the
retry have no owner and every consumer writes them again.

What survives from the old argument is the boundary. **The family calls an
adapter and reports what the adapter says.** It holds no URL, no method, no
header and no credential.

```ts
interface UploadContext {
  /** Aborted when the reader cancels or the item is removed. */
  readonly signal: AbortSignal;
  /** Bytes moved so far, and the total when it is known. */
  progress(loaded: number, total?: number): void;
  /** Resolves at once unless the reader has paused. See §7. */
  whenResumed(): Promise<void>;
}

interface UploadAdapter {
  send(file: File, context: UploadContext): Promise<unknown>;
  /** Whether `send` awaits `whenResumed()`. Default false. */
  pausable?: boolean;
}
```

A bare `send` function is accepted and normalised to `{ send, pausable: false }`,
because the common adapter is one function.

What `send` resolves with is kept on the item as `response` and handed back on
every request, untyped. What it rejects with is kept as `error`. Neither is
inspected.

`@slotted/core/upload` ships one adapter, `createXhrUpload`, built on
`XMLHttpRequest` rather than `fetch`. `fetch` reports no upload progress: request
body streaming needs HTTP/2 and `duplex: 'half'` and is not available across the
browsers `PROJECT-PRD.md` §33 supports, so a `fetch` adapter can only draw an
indeterminate bar. Ant Design, Vaadin and Uppy all ship an `XMLHttpRequest`
sender for the same reason.

---

## 6. The queue is core, and it is a new entry point

`@slotted/core/upload` holds the selection rules, the queue machine, the
formatting and the one adapter. It is outside `packages/core/src/index.ts` for
the two reasons `@slotted/core/filter` is: both bindings must give byte-identical
answers, and a family that imports a button should not pull a transfer engine.

| Module          | Holds                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `selection`     | `validateSelection`, composing `partitionFiles` from `@slotted/core/files` and adding count, total size, minimum size and duplicate rules. |
| `identity`      | `fileKey(file)` — `name`, `size` and `lastModified`, joined. Replaceable per instance.                                 |
| `queue`         | `createUploadRunner` — concurrency, retry with backoff, cancel, pause, stall detection, and one `onChange` callback.   |
| `summary`       | `uploadSummary(files)` — counts by status, bytes moved, bytes total, percent, and the remaining-time estimate.         |
| `format`        | `formatBytes(bytes, locale)` and `formatDuration(seconds, locale)`, both `Intl`.                                       |
| `xhr`           | `createXhrUpload`.                                                                                                    |

Nothing in it touches the DOM or either framework.

**Byte text is `Intl`, not a table of words.** `Intl.NumberFormat` with
`style: 'unit'` and `unit: 'megabyte'` gives the localised, correctly pluralised
string. Vaadin's answer is an array of nine English strings the application
translates; Ark's is `locale` plus `Intl`, which is this one.

---

## 7. Pause exists only where it is honest

Of the nine surveyed implementations, one pauses: Uppy, because `tus` resumes.
A pause control drawn over a sender that cannot suspend is a control that lies.

So the handshake is the adapter's to accept. `whenResumed()` resolves at once
unless the reader has paused, and an adapter that can suspend awaits it between
chunks. `pausable: true` is the adapter saying it does. **The `pause` part is
rendered only when the running adapter declares `pausable`.**

A file that has not started is a different thing, and it needs no adapter's
consent: `autoUpload: false` leaves every accepted file in `ready`, and the
`start` control moves one into the queue. Vaadin's `noAuto` is the same
capability under a different name.

**Cost.** A consumer who writes a resumable adapter and forgets `pausable` gets
no pause control and no error. That is stated on both reference pages, next to
the adapter contract.

---

## 8. Nine statuses, and three ways to fail

`docs/component-features.md` §14 asks for `seleção, validação, queued,
uploading, paused, success, error, canceled`, with retry, cancel and remove as
distinct events. The item carries `data-status`:

| Status      | Means                                                                       |
| ----------- | --------------------------------------------------------------------------- |
| `rejected`  | Refused by validation. It never entered the queue and has no adapter run.   |
| `ready`     | Accepted, and waiting for the reader because `autoUpload` is off.           |
| `queued`    | Accepted, waiting for a slot in the concurrency limit.                      |
| `uploading` | The adapter's `send` is running.                                            |
| `paused`    | Running, and suspended at the reader's word.                                |
| `stalled`   | Running, and no progress for `stallAfter`. Still `uploading` underneath.    |
| `success`   | `send` resolved.                                                            |
| `error`     | `send` rejected, and the retries are spent.                                 |
| `canceled`  | The reader stopped it. The signal was aborted.                              |

The three failures are kept apart on purpose. Every surveyed implementation
paints one red row for all three, and the reader cannot tell whether to try
again, choose a different file, or do nothing. Here each carries its own reason,
its own message and its own control: a `rejected` file offers only `remove`, an
`error` offers `retry` and `remove`, a `canceled` offers `start` and `remove`.

`stalled` is a gap row: Vaadin has the word in its i18n object and nothing that
produces it. Here the runner marks it when no `progress` call arrives inside
`stallAfter`, and clears it on the next one.

**Automatic retry is off by default, and the capability still ships.** `retries`
defaults to `0`. An upload is a `POST`, and a `POST` that succeeded on the server
and failed on the response is duplicated by a retry — a second invoice, a second
attachment. A library may not choose that for an application. `retries` with a
bounded backoff is one option away for an adapter the consumer knows is
idempotent, and the manual `retry` control is always present.

---

## 9. What the value is

The mutable capability is `files`, and its value is `UploadFile[]`:

```ts
interface UploadFile {
  readonly key: string;
  /** Absent for an entry restored from a server, which has a name and no bytes. */
  readonly file?: File;
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly status: UploadStatus;
  readonly loaded: number;
  readonly total: number | undefined;
  readonly attempts: number;
  readonly reason?: UploadRejectionReason;
  readonly error?: unknown;
  readonly response?: unknown;
}
```

Ant Design's `fileList` and Vaadin's `files` are the same shape, and for the same
reason: a list a server can restore has entries that are not `File`s. Ark's value
is `File[]` because Ark does not transfer.

`filesOf(value)` returns the `File[]` for a consumer who wants only the bytes.

**A multiple upload appends; a single upload replaces.** Dropping a second file
on a multi-file region adds it; picking a second file for a single-file control
corrects the first. That is wave 2's rule and it is kept.

**Duplicates are detected, which reverses wave 2.** “Whether two files are the
same file… differs by application” was true, and the answer to it is a policy the
application picks rather than no policy at all: `duplicates` is `reject`,
`allow` or `replace`, identity comes from `fileKey`, and `fileKey` is
replaceable. Ark reports `FILE_EXISTS` and Uppy refuses the second; leaving it
out meant every consumer wrote the comparison.

---

## 10. The rule nobody asked for: a pending transfer makes the control invalid

None of the nine answers what happens when the form is submitted while files are
still moving. The result is a record saved with an attachment that never
arrived, and it is invisible until someone opens the record.

`pendingBlocksSubmit` defaults to `true`. While any file is `ready`, `queued`,
`uploading`, `paused` or `stalled`, the control is invalid:

- React writes `setCustomValidity(pendingMessage)` on the clipped input, so the
  native submit is refused and the browser shows its own bubble on the control
  the reader can see;
- Angular does the same and additionally reports `{ uploadPending: true }` from
  `Validator`, so a Reactive Form's own `invalid` agrees with the DOM.

`minFiles` and `required` use the same route: `valueMissing` is the platform's
when `required` and the list is empty, and a custom validity otherwise.

**Cost.** A product that deliberately submits a form and finishes the transfer
afterwards has to set `pendingBlocksSubmit: false`. Making it opt-out rather than
opt-in is the choice that fails loudly, which is what
`docs/build-briefing.md` asks for when two answers are defensible.

---

## 11. What is announced, and what is not

Through `@slotted/core/live-announcer`, politely, never moving focus — WCAG 2.2
SC 4.1.3.

Announced: files accepted (“4 files added”), each rejection with its reason, each
`error`, each `canceled`, and the queue finishing (“3 of 4 files uploaded, 1
failed”).

Not announced: progress. A bar that speaks every event says nothing. The number
is on the row, in a `progress-indicator` that carries `role="progressbar"` and
its own `aria-valuenow`, so a reader inspecting the row hears the value on
demand.

The list is not a live region. The announcer already says what changed, and a
second one would read every row again.

---

## 12. Composition, not redrawing

`progress-indicator` draws the per-file bar and the summary bar. `field` supplies
the label, the description, the error slot and the `disabled`/`invalid`/`required`
this control defers to. `button` is what the consumer puts in the `actions` part.
Neither the stylesheet nor either binding draws a second bar or a second field
shell.

---

## 13. Long, hostile and translated content

A file name is content the family did not choose.

**Truncation is in the middle, and the extension survives.** `name` renders the
stem in a shrinking span with `text-overflow: ellipsis` and the extension in a
span that does not shrink, so `quarterly-report-consolidated-final-v7.pdf`
becomes `quarterly-report-conso….pdf` rather than `quarterly-report-conso…`. CSS
cannot truncate in the middle; the split is made in the binding, at the last dot,
and a name with no dot is one span.

**Nothing leaves the DOM.** The whole name is present and selectable, which is
the repository's standing rule that truncation never removes content.

`dir="auto"` on the name, so an Arabic file name in a left-to-right page reads in
its own direction. The row's own layout is logical throughout, so it mirrors with
the document.

**Four hundred files** is what a directory selection produces, and Ark's own
documentation answers it by telling the reader to raise `maxFiles`. The list is a
scroll region: `maxRows` — default `6` — sets its block size in rows, `0` removes
the limit, and the summary carries the count. No disclosure, no second state
model, and the platform's own scrolling.

---

## 14. Object URLs are the family's to revoke

`preview: 'auto'` creates an object URL for an `image/*` file and revokes it when
the item leaves the list or the family unmounts. §14 requires the revocation by
name; Ant leaves it to the consumer and Uppy owns a plugin for it. `preview:
'none'` draws the kind mark instead, which is also the fallback for every
non-image.

---

## 15. The document's own drop

`preventDocumentDrop` defaults to `true`, as it does in Ark and Chakra. A file
dropped beside the region navigates the browser to that file and loses the form.
One document-level listener, reference-counted like the live announcer's region,
cancels `dragover` and `drop` outside any upload region.

The same listener knows something a consumer wants and cannot easily get: whether
a drag carrying files is over the document at all. It is published, so an
application that wants Mantine's full-screen zone can draw its own. The family
does not draw one: a layer over the whole viewport is the application shell's
decision, not a control's.

---

## 16. React integration

Every line of `references/frameworks.md`, answered.

| Question                                                     | Answer                                                                                                                                                                     |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, request carrying a reason?  | Yes. `files` / `defaultFiles` / `onFilesChange(files, request)`, through `createControllable`. Reasons: `select`, `pointer`, `keyboard`, `remove`, `clear`, `programmatic`. |
| Application-wide defaults?                                   | Yes. `UploadDefaultsProvider` and `useUploadDefaults`, holding the labels, the limits, the adapter, `concurrency`, `retries` and `describeRejection`.                       |
| Substitute the rendered element of each public part?         | Yes. `render` on `Upload`, and on `UploadItem` for a consumer who draws their own row. The `input` is fixed: it is the control, and substituting it removes the family.     |
| Consumer's handler still runs?                               | Yes. `onDrop`, `onDragEnter`, `onDragLeave`, `onDragOver`, `onPaste`, `onChange` and `onClick` are called before the family acts, and the family composes rather than replaces. |
| Native element and the imperative action?                    | Yes. `ref` reaches the root `div`; `UploadHandle` exposes `browse()`, `upload()`, `retryAll()`, `cancelAll()` and `clear()` — the five a consumer cannot express declaratively. |
| Server render without a hydration mismatch?                  | Yes. `useId` for the ids; no layout read during render; no object URL created during render — previews are created in an effect, which is the only place a browser API exists. |
| Every state a consumer may style in the DOM?                 | Yes. `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, `data-loading`, `data-complete`, `data-dragging`, `data-drop-target`, `data-drop-invalid`, plus `data-status` on each item. |
| Part props typed as the native element's, extended?          | Yes. `ComponentPropsWithRef<'div'>`, `<'label'>`, `<'input'>`, `<'ul'>`, `<'li'>`, `<'button'>` for the parts that render each.                                             |

## 17. Angular integration

| Question                                            | Answer                                                                                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form?                   | Yes. `files` as `model<UploadFile[]>()`, and `filesChange` as an `output<ChangeRequest<UploadFile[]>>` carrying the reason, the previous value and `cancel()`.           |
| Reactive Forms and template forms?                  | Yes. `ControlValueAccessor` on `SlUpload`, plus `Validator` for `required`, `minFiles`, `maxFiles` and the pending rule. `writeValue` accepts `UploadFile[]` or `File[]` and normalises. |
| Application-wide defaults?                          | Yes. `SLOTTED_UPLOAD_DEFAULTS` and `provideUploadDefaults()`, holding what the React provider holds.                                                                     |
| Template reach the instance?                        | Yes. `exportAs: 'slUpload'`, and `slUploadItem` for a row.                                                                                                              |
| Substitute projected content, kept lazy?            | Yes. Named `ng-content` slots for the label, the description and the region's own content; `NgTemplateOutlet` with `slUploadItemDef` for the row, which must re-render per file. |
| Zoneless and `OnPush`?                              | Yes. Signals throughout; the runner's `onChange` writes one signal; no `markForCheck`.                                                                                  |
| Every subscription and listener torn down?          | Yes. `DestroyRef` revokes the object URLs, aborts every in-flight run, and releases the document drop guard's reference.                                                 |
| Static attribute survives the host bindings?        | Yes. `HostAttributeToken` for `id`, `name`, `accept`, `multiple`, `aria-describedby` and `aria-label` before the bindings compute.                                       |
| Entry point stays a single class?                   | Yes. `@slotted/angular/upload`, importing `@slotted/angular/progress-indicator` through its own entry point.                                                             |

**The asymmetry, recorded rather than levelled.** Angular gets `Validator` and
DI-provided defaults; React gets `render` and a ref handle. Neither is imitated
in the other.

---

## 18. Axes and their defaults

| Axis                  | Values                                | Default     |
| --------------------- | ------------------------------------- | ----------- |
| `variant`             | `dropzone`, `button`, `field`         | `dropzone`  |
| `layout`              | `list`, `grid`                        | `list`      |
| `size`                | `sm`, `md`, `lg`                      | `md`        |
| `preview`             | `auto`, `none`                        | `auto`      |
| `duplicates`          | `reject`, `allow`, `replace`          | `reject`    |
| `clickToBrowse`       | `true`, `false`                       | `true`      |
| `allowDrop`           | `true`, `false`                       | `true`      |
| `allowPaste`          | `true`, `false`                       | `true`      |
| `preventDocumentDrop` | `true`, `false`                       | `true`      |
| `autoUpload`          | `true`, `false`                       | `true`      |
| `pendingBlocksSubmit` | `true`, `false`                       | `true`      |

Values, rather than axes: `accept`, `multiple`, `directory`, `capture`,
`maxFiles`, `minFiles`, `maxSize`, `minSize`, `maxTotalSize`, `maxRows` (`6`),
`concurrency` (`3`), `retries` (`0`), `retryDelay` (`1000`), `stallAfter`
(`10000`), `adapter`, `validate`, `transform`, `fileKey`, `locale`.

Resolution order for every one of them: the consumer's own prop, then the
provider, then the default above.

---

## 19. Anatomy

Twenty-two parts. `root`, `label`, `description`, `dropzone`, `trigger`,
`input`, `summary`, `clear`, `list`, `item`, `preview`, `name`, `extension`,
`meta`, `status`, `progress`, `actions`, `start`, `pause`, `retry`, `cancel`,
`remove`, `message`.

`extension` exists because the middle truncation in §13 needs a span that does
not shrink. `status` is the word for the row's state and `meta` is its size, so a
consumer can restyle one without the other.

---

## 20. What was decided against

| Rejected                                   | Instead                                                                                                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| A `full-screen` drop layer                 | The document drop guard publishes the drag; the application shell draws whatever it wants. §15.                     |
| A `download` and a `preview` action        | The `actions` part takes the consumer's own buttons. Naming two privileges one arrangement — `toast`'s argument.    |
| Reordering the list by dragging            | The consumer owns `files`; a reorder is `onFilesChange` with a reordered array. Ant's own demo imports `dnd-kit`.    |
| Cropping and image editing                 | `transform` is the attachment point. An editor is a family.                                                        |
| Chunked and resumable transfer             | The adapter's, by name in §14. `signal`, `progress` and `whenResumed` are everything it needs from the control.     |
| Remote sources — Drive, Dropbox, a URL     | Uppy's Companion is a server. Nothing about it is expressible in a component contract.                             |
| `beforeunload` while files are in flight   | A global side effect and an application policy. The pending count is published so the application can install one. |
