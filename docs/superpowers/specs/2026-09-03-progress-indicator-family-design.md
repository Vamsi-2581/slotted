# Progress Indicator family design

Construction of `progress-indicator` against schema 5 and the token
foundation. Wave 2, mode `consolidar`, guide section 9. The family absorbs the
three deleted entries `spinner`, `progress-bar` and `loading-bar`, and adds a
fourth recipe the three never had: the loader.

One family, one `data-ui`, one stylesheet, one contract member, three
components — the shape `skeleton` established when it shipped `Skeleton`,
`SkeletonText` and `SkeletonRegion` under one member.

## Capability inventory

### Surveyed

Twelve implementations plus the platform, read on 3 September 2026. Sources
chosen to disagree: four ship a headless bar with no label and no circle, three
ship a circle and no bar, two ship segments or steps nobody else has, and one
ships a shape-morphing loader that replaces the spinner outright.

| Source | Reference | What it calls the family |
| ------ | --------- | ------------------------ |
| Material Design 3 (Android) | <https://github.com/material-components/material-components-android/blob/master/docs/components/ProgressIndicator.md> | `LinearProgressIndicator`, `CircularProgressIndicator`; `trackThickness` (4dp), `trackCornerRadius` (50%), `indicatorTrackGapSize` (4dp), `trackStopIndicatorSize` (4dp), `trackStopIndicatorPadding`, `trackInnerCornerRadius`, `indeterminateAnimationType` `disjoint\|contiguous`, `indicatorDirectionLinear`, `showAnimationBehavior`, `hideAnimationBehavior`, `showDelay` (0), `minHideDelay` (0), `wavelength`, `waveAmplitude`, `waveSpeed`, `indicatorSize` (44dp, 52dp wavy) |
| Material Design 3 loading indicator | <https://github.com/material-components/material-components-android/blob/master/docs/components/LoadingIndicator.md> | `LoadingIndicator`; "morphs the shape in a sequence", optional fully rounded container; `indicatorSize` 38dp, `containerWidth`/`containerHeight` 48dp, `containerColor` transparent, `showDelay`, `minHideDelay`; documented as "recommended as a replacement for indeterminate circular progress indicators" for waits under five seconds, and required to hold 3:1 between indicator and container |
| Material Web | <https://github.com/material-components/material-web/blob/main/docs/components/progress.md> | `md-linear-progress`, `md-circular-progress`; `value` (0), `max` (1), `indeterminate`, `fourColor`, `buffer` |
| Radix Primitives | <https://www.radix-ui.com/primitives/docs/components/progress> | `Progress.Root` / `Progress.Indicator`; `value: number \| null`, `max`, `getValueLabel`, `asChild`; `data-state="complete\|indeterminate\|loading"`, `data-value`, `data-max`. No circle, no label, no timing |
| Base UI | <https://base-ui.com/react/components/progress> | `Progress.Root` / `Label` / `Track` / `Indicator` / `Value`; `value: number \| null` (null is indeterminate), `min` (0), `max` (100), `format: Intl.NumberFormatOptions`, `locale`, `getAriaValueText(formattedValue, value)`, `aria-valuetext`; `data-complete`, `data-indeterminate`, `data-progressing`. No circle |
| React Aria / RAC | <https://react-spectrum.adobe.com/react-aria/ProgressBar.html> | `ProgressBar` with a `Label` child; `value`, `minValue`, `maxValue`, `valueLabel`, `formatOptions`, `isIndeterminate`; anatomy names label, track, fill and value label |
| React Spectrum | <https://react-spectrum.adobe.com/react-spectrum/ProgressCircle.html> | `ProgressCircle`; `value`, `minValue`, `maxValue`, `isIndeterminate`, `size` `S\|M\|L`, `staticColor` `white\|black`, `variant` |
| MUI | <https://mui.com/material-ui/react-progress/> | `LinearProgress` (`variant` `determinate\|indeterminate\|buffer\|query`, `value`, `valueBuffer`, `color`), `CircularProgress` (`variant`, `size`, `thickness`, `disableShrink`) |
| Ant Design | <https://ant.design/components/progress> | `Progress`; `type` `line\|circle\|dashboard`, `percent`, `success.percent`, `format(percent, successPercent)`, `showInfo` (true), `status` `success\|exception\|normal\|active`, `strokeColor` (gradient allowed), `railColor`, `strokeLinecap` `round\|butt\|square`, `steps` `{count, gap}`, `size`, `gapDegree`, `gapPlacement`, `percentPosition` |
| Carbon | <https://carbondesignsystem.com/components/progress-bar/usage/> | `ProgressBar`; label (required, may be visually hidden), optional helper text carrying "a percentage, fraction, ratio, or numeric value", track, bar indicator, status icon; statuses active / finished / error, where error "spans full width, turns red, and remains visible"; `size`, `type` `inline\|indented` |
| Fluent UI v9 | <https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-progress/library/src/components/ProgressBar/ProgressBar.types.ts> | `ProgressBar`; slots `root` (the track) and `bar`; `shape` `rounded\|square`, `value` (undefined is indeterminate), `max` (1), `thickness` `medium\|large`, `color` `brand\|success\|warning\|error`, `indeterminateMotion` slot where `null` disables the animation |
| Primer | <https://primer.style/components/progress-bar> | `ProgressBar`; `progress`, `barSize` `small\|large\|default`, `inline`, `animated`, `bg`, and **segments** — several `ProgressBar.Item` bars inside one track |
| Polaris | <https://shopify.dev/docs/api/app-home/polaris-web-components/feedback/progress-bar> | `ProgressBar`; `progress`, `size`, `tone`, `animated` |
| The platform | <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress>, <https://w3c.github.io/aria/#progressbar> | `<progress value max>`; `role="progressbar"` with `aria-valuenow`, `aria-valuemin` (0), `aria-valuemax` (100), `aria-valuetext`, and a required accessible name |
| Slotted's own three deleted families | `docs/BUILD-LOG.md` entries **Spinner**, **ProgressBar** and **core/measure, LoadingBar** — 31 August 2026 | `spinner` (`size`, `decorative`, a rendered visually-hidden label, reduced motion *slowed* the ring), `progress-bar` (`measurement`, `indeterminate`, root *is* the track, clamped value, `console.warn` for a missing name, indeterminate travel by `inset-inline-start`), `loading-bar` (`placement`, `value` defaulting to null, transparent track) |

There is no WAI-ARIA Authoring Practices pattern for a progress indicator. The
pattern index at <https://www.w3.org/WAI/ARIA/apg/patterns/> lists Accordion
through Window Splitter and contains no entry; the string `patterns/progress`
does not occur on the page. The Meter pattern is the closest neighbour and
rules itself out in writing: "The meter should not be used to indicate
progress, such as loading or percent completion of a task. To communicate
progress, use the `progressbar` role instead"
(<https://www.w3.org/WAI/ARIA/apg/patterns/meter/>). The applicable official
guidance is therefore the ARIA 1.3 `progressbar` role
(<https://w3c.github.io/aria/#progressbar>), the `<progress>` element, and WCAG
2.2 1.4.11 Non-text Contrast, 2.2.2 Pause Stop Hide, 2.3.3 Animation from
Interactions and 4.1.3 Status Messages. The itemized comparison is in
**Accessibility** below.

### Table stakes

Capabilities two or more surveyed implementations ship.

| Capability | Who ships it | Verdict | Reason |
| ---------- | ------------ | ------- | ------ |
| Determinate value with a range | all thirteen | adopt | `value`, `min` (0), `max` (100). `@slotted/core/measure` already clamps and converts, and it was written because this family's predecessor wrote the arithmetic inline |
| Indeterminate by absence of a value | Radix, Base UI, Fluent, MUI, Material, Spectrum, React Aria | adopt | `value` defaults to `null`, so an indicator nobody gave a number to is a wait rather than a claim of nought per cent — the decision `loading-bar` recorded |
| A linear recipe | all thirteen | adopt | `ProgressBar` |
| A circular recipe | Material, MUI, Ant, Spectrum, Material Web | adopt | `ProgressCircle`. Its indeterminate form is what every surveyed library calls a spinner, and it is the third recipe the scope paragraph asks for |
| A rendered label that is the accessible name | Carbon, Base UI, React Aria, Ant (`format`), Spectrum | adopt | `label` part, referenced by `aria-labelledby`. A rendered string is what a translation pass finds; an `aria-label` is not content — the decision `spinner` recorded |
| A visually hidden label | Carbon (`hideLabel`), Slotted's own `spinner` | adopt | `hideLabel`, which clips the label with `visually-hidden.css` and keeps it as the name |
| Rendered value text | Ant (`showInfo`, default on), Carbon (helper text), Base UI (`Value`), React Aria (`valueLabel`) | adopt | `value` part, off by default. M3 renders no number at all, and a wait does not need one to be understood; the number is available to a reader through `aria-valuetext` either way |
| Value text a consumer formats | Base UI (`format`, `locale`, `getAriaValueText`), Spectrum and React Aria (`formatOptions`), Radix (`getValueLabel`), Ant (`format`) | adopt | `format: Intl.NumberFormatOptions` plus `locale`, and `valueText` for a string the family cannot compute ("3 of 7 files") |
| Size steps | Material, Ant, Carbon, Primer, Polaris, Spectrum, Fluent (`thickness`) | adapt | one `size` axis, `sm\|md\|lg`, expressed in the geometry each shape has: the bar's thickness, the circle's diameter, the loader's box. Two words for one idea is what Fluent's `thickness` beside everyone else's `size` costs |
| Semantic colour | Fluent (`color`), Ant (`status`), Carbon (statuses), Polaris (`tone`) | adopt | `tone`, the library's five |
| Rounded versus square ends | Fluent (`shape`), Ant (`strokeLinecap`) | adapt | fully rounded, from `--slotted-radius-full`, and square only where the geometry demands it — `placement="page"`, where a bar pinned to the viewport edge has no corner to round |
| A delay before the indicator appears | Material (`showDelay`), Slotted's own `button` (`loadingDelay`), Ant (`spin.delay` on the sibling family) | adopt | `delay`, through `@slotted/core/loading`, which `skeleton` already drives from both bindings |
| A minimum time on screen | Material (`minHideDelay`), Slotted's own `skeleton` (`minDuration`) | adopt | `minDuration`, same machine. The pair is what stops a fast load from flashing and a slow one from blinking out |
| An application-wide default | Ant (`ConfigProvider`), MUI (theme), Slotted's own `button`, `card` and `skeleton` | adopt | `ProgressIndicatorDefaultsProvider` and `provideProgressIndicatorDefaults` |
| Substituting the rendered element | Radix (`asChild`), Base UI (`render`), MUI (`component`) | adopt | `render` in React; in Angular every member is a directive on the consumer's own element, so nothing is needed |
| A completion state a consumer can style | Radix (`data-state="complete"`), Base UI (`data-complete`) | adopt | `complete` joins the state vocabulary, written as `data-complete`. CSS cannot compare a value to a maximum, so a consumer who wants the finished bar to read differently has no other way to ask |
| An indeterminate state a consumer can style | Radix, Base UI, Slotted's own `progress-bar` | adopt | `data-indeterminate`, already in the state vocabulary and already meaning "a value that exists and cannot be given" |
| Buffer, or secondary progress | MUI (`buffer`, `valueBuffer`), Material Web (`buffer`), Ant (`success.percent`) | adopt | `buffer`. A video that has downloaded further than it has played, and an upload that has been received further than it has been processed, are the same picture, and no composition of two bars gives it — the second bar would need to be inside the first one's track |
| Segments, or steps | Primer (`ProgressBar.Item`), Ant (`steps`) | decline | `progressBar` draws one quantity. A row of segments is a row of bars, and the family that arranges a row of things is `inline`: `<Inline gap="1">{parts.map((p) => <ProgressBar key={p.id} hideLabel label={p.name} tone={p.tone} value={p.value} />)}</Inline>`. Ant's `steps` is the same list with a gap, and `stepper` (wave 4) owns a sequence of named steps |
| Multi-colour indeterminate | Material Web (`fourColor`), Material (`indeterminateAnimationType` with a colour list) | decline | the four colours are Google's brand sequence, and this library refuses an arbitrary colour in the contract (`PROJECT-PRD.md` 2.4). `tone` names the five colours the theme owns, and a `tone` that cycled would be a colour animation carrying no information |
| Reversed indeterminate travel | MUI (`query`), Material (`indicatorDirectionLinear`) | decline | the indeterminate bar travels the way the document reads, and the direction is `dir`, not a prop. MUI's `query` exists to say "we are still deciding what to fetch", which is a different message and not a different animation |
| A dashboard, or gauge, arc | Ant (`type="dashboard"`, `gapDegree`, `gapPlacement`) | defer to `gauge` | a gauge is a reading of a level rather than a report of a task, which is the distinction the Meter pattern draws. `docs/component-features.md` 13 already names **Gauge / Bullet** as its own `[Specialized]` family |
| An error or finished status with an icon | Carbon (status icon), Ant (`status`) | decline | `tone="danger"` paints the bar, and the icon and the sentence beside it belong to `inline-message`, which section 9 of the guide names as the piece a field or a section consumes for exactly this: "ajuda, erro, warning, success ou progresso". A bar that grew its own icon and its own message would be a second `inline-message` inside a progress indicator |
| Page-level bar pinned to the viewport | Slotted's own `loading-bar`, and every router progress bar in the field | adopt | `placement="page"`. It is the only real difference `loading-bar` had, and `placement` joined the vocabulary for it |
| Disabling the animation | Fluent (`indeterminateMotion: null`), Primer (`animated`) | adopt | not a prop: `prefers-reduced-motion` stops every loop, and the theme collapses every transition. A prop that switched motion off per instance would let an application ship the thing the query exists to prevent |
| A spoken announcement while the task runs | nobody ships one; the guide asks for it in §9 — "determinado anuncia progresso com moderação" | defer to `inline-message` | `progressbar` carries **Children Presentational: True** in ARIA 1.3, so every element inside the one holding the role is pruned: a `role="status"` child of a progress indicator is a live region no reader ever hears. `inline-message` is the family §9 names for "ajuda, erro, warning, success ou progresso", with an announcement policy of its own, and there the sighted reader sees the same sentence the screen reader speaks. The reference page ships the composition |

### Differentiators

| What | Where it comes from | What this family does |
| ---- | ------------------- | --------------------- |
| The shape-morphing loader | M3 Expressive `LoadingIndicator`, which Google recommends *instead of* an indeterminate circular indicator for waits under five seconds. No headless library and no other design system surveyed ships anything like it | `Loader`, the third component. A rounded shape morphs through a sequence while it rotates, in pure CSS: `clip-path: polygon()` with a fixed vertex count, so the browser interpolates between petal counts rather than cutting between images. Optionally inside M3's fully rounded container, at M3's own 38:48 ratio |
| The wavy active indicator | M3 Expressive `waveAmplitude` / `wavelength` / `waveSpeed`, shipped on Android and in Compose and nowhere else surveyed | `wave` on the bar and on the circle. Both travel and both ramp. The bar's indicator is masked by a repeating sine stroke, one period every ten thicknesses at three quarters of one in amplitude — M3's 40dp against its 4dp track. It ends in a round cap placed by `sin()` from the same phase the mask travels on, which is how a stylesheet with no path to measure puts the cap where `PathMeasure.getPosTan` puts M3's. The circle's indicator is a wound sine fitted as one cubic per half-crest against the exact tangents, `pathLength` normalised to 100, drawn half again as wide as its step: M3 takes the same decision at 52dp against 44dp |
| The indicator–track gap and the stop indicator | M3 2024, and no other surveyed implementation | the trailing track is a `::before` that starts one gap past the indicator, so the indicator and the remaining track are two fully rounded bars with air between them; the stop dot is an `::after` at the inline end. Both are logical, so both mirror |
| Three colour schemes and three densities | this library | the track is a computed tint of the indicator's own tone against the surface, which is the one formula that separates in `light`, in `dark` and in `high-contrast` — where every tone `surface` role *is* the page's own white. The label and the value read the control type scale, so a bar in a dense table shrinks its words and keeps its bar |
| One timing machine both bindings share | `@slotted/core/loading`, written for `skeleton` | `delay` and `minDuration` on all three components, driven from React's clock and Angular's signals through the same pure function, so the two bindings cannot disagree about when an indicator appears |
| A wait that is announced in the words a reader can also see | Carbon, Ant, Fluent, MUI, Radix and Base UI all leave a reader with `aria-valuenow` and nothing else, and none of them notices that the role prunes its own subtree | the graphic and the sentence are two families, composed. The reference page's accessibility demonstration wires `inline-message` beside the bar and `aria-busy` on the region, which is what ARIA 1.3 asks for in as many words — and one sentence then serves both readers instead of a hidden one serving half of them |

### Gaps

| What a real product hits | What no surveyed implementation does | What this family does |
| ------------------------ | ------------------------------------ | --------------------- |
| A wait shorter than the eye can read | Material ships `showDelay` and `minHideDelay` on Android and neither reaches the web; every web implementation surveyed paints on the first frame | `delay` and `minDuration`, defaulting to zero because the family cannot know an application's latency, and recommended as a pair on the provider |
| A value outside its own range | Ant clamps silently, Radix and Base UI pass it through to `aria-valuenow` | clamped, and the clamped value is what the paint *and* the announcement read, so the picture and the reader cannot disagree. Progress is usually computed from numbers an application does not fully control |
| A range whose maximum is zero | division by zero, or `NaN` in the style attribute | `percentOf` answers nought per cent for an empty range: a bar measured against nothing has made no progress |
| An indicator with no accessible name | Ant, Primer, Polaris and MUI all render a nameless graphic | a development warning naming the component, never a throw: a nameless progress bar still reports visually, and taking a screen down mid-upload is worse than the defect. `button` and `icon-button` throw because an unnamed icon button is unusable; this one is not |
| A reader who asked the operating system for stillness | Slotted's own `spinner` slowed its ring, which is what the token foundation now forbids; MUI, Ant, Carbon and Fluent animate regardless | every loop stops. The cost is real and is paid in the open: a stopped indeterminate indicator is a static graphic, so the family requires a name, warns when an indeterminate indicator has none, and the reference page recommends a *visible* label for the loader |
| A long or translated label in a narrow column | Carbon truncates, Ant does not wrap at all | the label wraps and the value never does; the value's column is `auto` and the label's is `1fr`, so the number stays whole and the words break. Nothing leaves the DOM |
| A page-level bar over a scrolled page | every router bar in the field hard-codes a `z-index` | `placement="page"` reads `--slotted-z-index-sticky`, so an application's own stacking contract still decides |

## Members, anatomy and elements

One contract member, `progressIndicator`, three components.

| Component | React | Angular | Root element | Shape written |
| --------- | ----- | ------- | ------------ | ------------- |
| Linear | `<ProgressBar>` | `[slProgressBar]` | `div` | `data-shape="linear"` |
| Circular | `<ProgressCircle>` | `[slProgressCircle]` | `div` | `data-shape="circular"` |
| Loader | `<Loader>` | `[slLoader]` | `div` | `data-shape="morph"` |

`data-shape` is written by the component and is not a prop: a consumer chooses
the component, and a shape prop would be a fourth way to say the same thing.
It is in the DOM because the one stylesheet has to tell three geometries apart,
which is what `button` does with the same attribute for `iconButton`.

| Part | Element | Present | Purpose |
| ---- | ------- | ------- | ------- |
| `root` | `div` | always | Carries `data-ui`, `role="progressbar"`, the range, the name and the states. It is the box a consumer positions |
| `label` | `span` | when `label` is set | The rendered name, referenced by `aria-labelledby`. Clipped by `visually-hidden` when `hideLabel` |
| `value` | `span` | when `showValue` and the indicator is determinate | The formatted number. Tabular figures, so a counting bar does not jitter |
| `track` | `div` (linear, morph), `circle`/`path` (circular) | always | The ground the indicator is drawn on: painted for the bar, painted for a determinate circle, and painted for the loader only when `contained` |
| `indicator` | `div` (linear, morph), `circle`/`path` (circular) | always | The quantity: the filled bar, the arc, or the morphing shape |

The buffer, the trailing track segment and the stop indicator are
pseudo-elements of `track`, not parts. Each is one rectangle with no name worth
giving and nothing a consumer would replace; a part is a promise, and three
more promises for three decorations is three too many.

`progressbar` carries **Children Presentational: True** in ARIA 1.3
(<https://w3c.github.io/aria/#progressbar>, read 3 September 2026), so the
label and the value inside the root are pruned from the accessibility tree.
They reach a reader through `aria-labelledby` and `aria-valuetext`, both of
which the family writes; a name computed from an `aria-labelledby` reference is
unaffected, which is what lets the rendered label be the name.

This is the anatomy Base UI and React Aria both ship — Base UI's
`Progress.Root` "provides the task completion status to screen readers" and
holds `Label`, `Track` and `Value` inside it — and it is deliberately not
MDN's example, which puts the label outside the role.

The cost of the choice is written down twice. Content a consumer puts inside a
progress indicator is silent, and the reference page says so. And a live region
inside the root would be silent too, which is the fact that turned `live` from
a capability of this family into a deferral to `inline-message`: the family
that owns a sentence a reader hears is the family that renders the sentence a
reader sees.

The gain is that `aria-*`, `id` and every native attribute land on the element
both bindings naturally give the consumer — Angular's host *is* the root — so a
consumer's own `aria-label` is never written onto an element they cannot see.

## Axes, inputs and defaults

| Input | Type | Default | Applies to | Meaning |
| ----- | ---- | ------- | ---------- | ------- |
| `value` | `number \| null` | `null` | bar, circle | The quantity. `null` is indeterminate |
| `min` | `number` | `0` | bar, circle | The bottom of the range |
| `max` | `number` | `100` | bar, circle | The top of the range |
| `buffer` | `number \| null` | `null` | bar | A second, further quantity: received but not yet processed |
| `size` | `sm \| md \| lg` | `md` | all three | The bar's thickness, the circle's diameter, the loader's box |
| `tone` | `accent \| secondary \| success \| warning \| danger` | `accent` | all three | The five the theme owns |
| `label` | `string` | — | all three | The rendered accessible name |
| `hideLabel` | `boolean` | `false` | all three | Clips the label and keeps it as the name. Implied by `placement="page"` |
| `showValue` | `boolean` | `false` | bar, circle | Whether the formatted number is rendered |
| `valueText` | `string` | — | bar, circle | A string the family cannot compute, for `aria-valuetext` and the `value` part |
| `format` | `Intl.NumberFormatOptions` | — | bar, circle | How the number is written. Absent, the ratio is written as a percentage |
| `locale` | `string` | — | bar, circle | BCP 47. Absent, the runtime's own |
| `wave` | `boolean` | `false` | bar, circle | M3's wavy active indicator |
| `contained` | `boolean` | `false` | loader | M3's fully rounded container behind the shape |
| `placement` | `inline \| page` | `inline` | bar | `page` pins the bar to the top edge of the viewport |
| `loading` | `boolean` | `true` | all three | Whether the wait is still on. `false` withdraws the indicator, honouring `minDuration` |
| `delay` | `number` | `0` | all three | Milliseconds the wait must last before anything is painted |
| `minDuration` | `number` | `0` | all three | Milliseconds an indicator that did appear is held |

One output, on all three: React `onWithdraw`, Angular `(withdraw)`. It fires
when the indicator actually leaves the page, which is later than `loading`
turning false whenever `minDuration` is still holding it. It is the moment an
application unmounts the card the indicator was in.

## State

The family holds no state a consumer can own, and therefore declares no
`stateModel`. A progress indicator never moves its own value: it is handed a
number and it draws it. The two states in the DOM are both derived:
`data-indeterminate` when there is no value, and `data-complete` when the
clamped value has reached the maximum.

`measurement` is the capability, and it is the word this family's predecessor
put in the vocabulary. It is listed in `MUTABLE_CAPABILITIES`, which is a
defect in the shared schema rather than a fact about progress: a measured
quantity is stated by the consumer and read by the family, where a value the
user moves is `value` — the word `slider` and every field use. Fixed first, in
its own commit, as the briefing requires.

`complete` is added to the state vocabulary in the same commit. CSS cannot
compare a value to a maximum, so without it a consumer who wants the finished
bar to read differently has no selector to write. Radix and Base UI both ship
it.

| State | Attribute | When | What it paints |
| ----- | --------- | ---- | -------------- |
| `default` | — | a determinate indicator between its bounds | the indicator at the value |
| `indeterminate` | `data-indeterminate` | no value | the travelling bar, the breathing arc, the morphing shape; `aria-valuenow` omitted |
| `complete` | `data-complete` | clamped value equals `max` | the full indicator, no gap and no stop dot — there is nothing left to separate |

There is no `disabled`, no `hover`, no `active` and no `focus-visible`. The
family is not a control: it answers no pointer, takes no focus and has nothing
to disable. A consumer who makes the root a link through `render` gets the
platform's own focus ring, and this family paints none of its own — the one
place it differs from `status-indicator`, which paints a ring because its root
is routinely a link in a table row.

## Geometry

### Linear

```
root  ── grid: [label 1fr] [value auto]
                [track   1 / -1]
track ── position: relative; radius full; the painted ground
  ::before  the trailing track, from one gap past the indicator to the end
  ::after   the stop indicator, a dot of one thickness at the inline end
  buffer    a second ::before-like segment — see below
indicator ── inline-size: percentage of the track; radius full
```

Thickness is the whole geometry: the gap between the indicator and the trailing
track is one thickness, and the stop indicator is one thickness across. M3
specifies 4dp for all three at the 4dp track, and making them one number is the
proportional form of the same decision — at `sm` a 4dp gap in a 2dp bar would
be wider than the bar is tall.

| Step | Thickness | Token |
| ---- | --------- | ----- |
| `sm` | 2px | `--slotted-space-1` |
| `md` | 4px | `--slotted-space-2` |
| `lg` | 8px | `--slotted-space-4` |

The buffer is a third segment on the track, painted between the indicator and
the trailing track in a lighter step of the tone. It is drawn by the `track`
element's own background rather than by a second pseudo-element, because the
track has two pseudo-elements already and a background gradient stopped at a
percentage is exactly one declaration.

### Circular

An `<svg>` with `viewBox="0 0 48 48"` and two concentric shapes at `r="20"`,
each carrying `pathLength="100"` so the dash arithmetic is the percentage
itself. `stroke-width: 6` in user units is one eighth of the diameter at every
size, which is the ratio `button` derived for its own loading ring — so the
ring in a button and this family's circle are the same object, and Button can
stop drawing its own.

- indicator: `stroke-dasharray: var(--_percent) 100`
- track: `stroke-dasharray: calc(100 - var(--_percent) - 2 * var(--_gap)) 100`
  with a dash offset of `calc(-1 * (var(--_percent) + var(--_gap)))`, which is
  M3's indicator–track gap in a circle
- both: `stroke-linecap: round`, and the indicator's opacity is
  `clamp(0, calc(var(--_percent) * 1000), 1)` so a round cap does not paint a
  dot at nought per cent

The track is painted only when the indicator is determinate. M3's own circular
track colour is `@android:color/transparent`, and the reason is sound: an
indeterminate arc has no remainder to show. A determinate one does, and without
it the reader cannot see how far there is to go.

| Step | Diameter | Token |
| ---- | -------- | ----- |
| `sm` | 30 / 26 / 24px | `--slotted-control-height-sm` |
| `md` | 34 / 28 / 26px | `--slotted-control-height-md` |
| `lg` | 38 / 32 / 30px | `--slotted-control-height-lg` |

The control height scale, not a scale of this family's own. A circle beside a
button is the same height as the button at every density, `xs` at the tightest
density is still `--slotted-target-min`, and the component layer of the token
contract stays as `avatar` left it. `--slotted-progress-indicator-size` is the
unstepped escape hatch `icon`, `avatar` and `skeleton` all established, and it
is what Button will set to put this circle in an icon slot.

### Loader

```
root      ── inline-flex: [indicator] [label]
track     ── the container: the size box, fully rounded, painted when contained
indicator ── the morphing shape, clip-path animated, rotating
```

The shape is a `clip-path: polygon()` of 32 vertices sampled from
`r(θ) = 1 + a·cos(kθ)`, and the keyframes vary `a` and `k`: a circle, a
four-petal clover, a five-petal flower, a trefoil, an oval and back. Every
keyframe has the same vertex count, which is what lets the browser interpolate
the shape rather than jumping between two of them.

The rotation is **two parcels summed**, and that is the mechanism rather than a
detail. `LoadingIndicatorAnimatorDelegate.java` decomposes it as
`CONSTANT_ROTATION_PER_SHAPE_DEGREES = 50` advanced by a linear clock plus
`EXTRA_ROTATION_PER_SHAPE_DEGREES = 90` driven by the *same* `SpringAnimation`
that drives the morph, added together. Ninety of every hundred and forty degrees
therefore lurch with the shape; the fifty exists so the object never freezes
between forms. A single constant turn is the *old* circular indicator's
behaviour, and it is what the loading indicator was introduced to replace.

CSS has no way to add two animations of one property without
`animation-composition`, so the sum is expressed geometrically: the container
carries the linear parcel and the shape inside it carries the sprung one, and
nested rotations multiply. The container is a circle with a flat fill, so
turning it is invisible — it is turning its child.

At `contained` the shape is 79 per cent of the container — M3's own 38:48 —
rounded to an even number of pixels. The rounding is the rule rather than a
tidy-up: a grid centres a box by splitting the remainder in half, so an odd
remainder puts the shape half a pixel off centre and the browser rasterises
that half to one side. Every control height this family reads is even at every
density, so an even shape leaves an even remainder. The container is the tone's
computed track tint and the shape is the tone's solid, which holds the 3:1 the
loading indicator documentation requires between the two.

## Motion

| Transition | Duration | Easing | Why |
| ---------- | -------- | ------ | --- |
| determinate value change | `--slotted-duration-medium` | `--slotted-easing-standard` | the eye follows a bar filling; a bar that jumped would report a different number without showing the change |
| indicator appearing | none | — | it appears because `delay` elapsed, which is already a deliberate wait; a fade on top of it would delay it twice |
| indeterminate linear travel | `--slotted-duration-loop-slow` | `--slotted-easing-standard` | M3's disjoint indicator: a short bar crosses the track and restarts |
| indeterminate circular | `--slotted-duration-loop` rotation, `--slotted-duration-loop-slow` arc | `--slotted-easing-standard` | the arc grows and shrinks while the ring turns, which is M3's own description of the indeterminate circle |
| loader morph | `2 × --slotted-duration-loop-slow` | `--slotted-easing-emphasized` | 3.2 seconds over five shapes is 640 milliseconds each, which is M3's own `DURATION_PER_SHAPE_IN_MS = 650` to within the scale's resolution. `emphasized` is slow at both ends so each shape is held, and its `1.3` is the spring: the outline carries a little past each target and settles |
| loader rotation, sprung parcel | `2 × --slotted-duration-loop-slow` | `--slotted-easing-emphasized` | 90° a shape, on the morph's own boundaries and the morph's own curve. In M3 this parcel and the morph are literally one `SpringAnimation`, so the object throws itself around as it changes form |
| loader rotation, linear parcel | `2 × --slotted-duration-loop-slow` | `linear` | 50° a shape, 250° a cycle, on the container. It is the minority parcel and exists so the object never freezes between forms |
| wave travel | `--slotted-duration-loop-fast` | `linear` | M3's own answer — `PHASE_ANIMATION_DURATION_MS = 1000` with a null interpolator. A crest that accelerated would read as a wobble rather than as a wave moving past |
| wave amplitude | the value's own transition | inherited | `FULL_AMPLITUDE_PROGRESS_MIN = 0.1` and `MAX = 0.9`: full amplitude only between a tenth and nine tenths, flat outside. It rides `--slotted-progress-indicator-percent` rather than M3's separate 500 ms animator, so the flatten takes exactly as long as the fill that causes it |

Every loop stops under `prefers-reduced-motion: reduce`, and the three loop
durations are the ones the theme does not collapse, because shortening an
endless animation is not an answer to it. The determinate transition needs no
rule of its own: `--slotted-duration-medium` is one of the four the theme
collapses to a millisecond.

## Accessibility

Sourced from the ARIA 1.3 `progressbar` role
(<https://w3c.github.io/aria/#progressbar>), read 3 September 2026. There is no
APG pattern; the Meter pattern's own note directs a progress indicator to this
role.

| Requirement, quoted or paraphrased from the role definition | Answer |
| ----------------------------------------------------------- | ------ |
| The element has `role="progressbar"` | on `root`, all three components |
| "Authors MAY set `aria-valuemin` and `aria-valuemax`"; missing values default to 0 and 100 | both written whenever they differ from the defaults, and both written always for a determinate indicator, so the announcement never depends on a default |
| "The author SHOULD supply a value for `aria-valuenow` unless the value is indeterminate, in which case the author SHOULD omit the attribute" | `aria-valuenow` is the clamped value, and is absent whenever `data-indeterminate` is present |
| "Authors SHOULD update this value when the visual progress indicator is updated" | the attribute and the painted percentage are computed from one call to `percentOf`, so they cannot disagree |
| `aria-valuetext` where a percentage would not be user friendly | written from `valueText`, or from `format`, whenever either is set |
| An accessible name is required | `aria-labelledby` to the rendered `label`; a consumer's own `aria-label` or `aria-labelledby` wins; a development warning names the component when there is none |
| "It is not possible for the user to alter the value of a `progressbar` because it is always read-only" | no state model, no request, no keyboard. The family declares no mutable capability |
| "If the `progressbar` is describing the loading progress of a particular region of a page, authors SHOULD both use `aria-describedby` to reference the progressbar status, and set the `aria-busy` attribute to `true` on the region" | documented on the reference page as the two attributes a consumer writes on their own region, with the id the indicator already carries. The family does not ship a region member: `skeleton` owns the busy region, and two families answering "which region is waiting" would be two answers to one question |
| Children presentational | the label and the value are decoration for a reader, and reach them through the name and the value text instead. Written down as a cost, above |
| WCAG 1.4.11 Non-text Contrast | the indicator is the meaningful graphic and is a tone `solid` role, which the theme's contrast test holds against every surface. The track is a tint of it and is not load-bearing: the reader is told the number |
| WCAG 2.2.2 Pause, Stop, Hide | every loop stops under `prefers-reduced-motion`. No loop is longer than five seconds' worth of information, and none blinks |
| WCAG 4.1.3 Status Messages | the role and `aria-valuenow` make the status programmatically determinable without focus. A reader who is waiting rather than inspecting is served by the `inline-message` beside the bar, because the element holding this role cannot hold a live region of its own |

## Framework integration

### React

| Question | Answer |
| -------- | ------ |
| Does a mutable value ship a controlled and uncontrolled pair, plus the request carrying a reason? | no — and the absence is the contract. A progress indicator cannot decide it has progressed, so there is nothing to request and no mode to choose between. The one thing the family *does* move is whether it is painted, and that is not a value a consumer owns: they own `loading`, and `onWithdraw` reports the moment the timing machine finished with it |
| Can an application set this family's defaults once? | `ProgressIndicatorDefaultsProvider` and `useProgressIndicatorDefaults`, holding `size`, `tone`, `delay`, `minDuration`, `locale` and `label` |
| Can a consumer substitute the rendered element of each public part? | `render` on all three components, receiving every data attribute, the ARIA, and the percentage custom property. The inner parts are fixed: an `svg` `circle` is not substitutable for anything, and the bar's indicator is a rectangle with no semantics to keep |
| Does the consumer's own handler still run when the family handles the same event? | the family handles no DOM event. `onWithdraw` is its own output and replaces nothing |
| Can a consumer reach the native element, and the imperative action it cannot express declaratively? | `ref` to the root on all three. There is no imperative action: `focus()` is meaningless on a read-only graphic, and `start()`/`done()` would be `loading` written twice |
| Does it render on the server without a hydration mismatch? | `useId` for the label's id and the announcement's, no layout read during render, and the first answer of the timing machine is computed *during* render rather than in an effect — the finding `skeleton` recorded, because an effect paints one frame of the wrong state |
| Does every state a consumer may style appear in the DOM? | `data-indeterminate`, `data-complete`, plus `data-shape`, `data-size`, `data-tone`, `data-placement`, `data-wave`, `data-contained` and the percentage as a custom property |
| Is each part's props type the native element's, extended? | `ComponentPropsWithRef<'div'>` for the three roots |

### Angular

| Question | Answer |
| -------- | ------ |
| Does a two-way value use the signal form the ecosystem expects? | no `model()`: nothing here is two-way. `input()` throughout and one `output()` for `withdraw` |
| Does a control that belongs in a form work with Reactive Forms? | no — a progress indicator is not a form control. It has no value a form submits, no validity and no user input. `ControlValueAccessor` on a read-only graphic would put a nameless entry in every form group |
| Can an application set this family's defaults once? | `PROGRESS_INDICATOR_DEFAULTS` and `provideProgressIndicatorDefaults()` |
| Can a template reach the instance? | `exportAs: 'slProgressBar'`, `'slProgressCircle'`, `'slLoader'` |
| Can a consumer substitute projected content, and keep it lazy? | the label is an input rather than a slot, because it is the accessible name and a name is a string. Content projection is available on the loader's root for the case M3 itself shows — a loader beside a sentence — and nothing needs re-rendering, so no `NgTemplateOutlet` |
| Is it correct with zoneless change detection and `OnPush`? | signals throughout, `computed` for every derived value, and the timing machine driven by one `effect` with `untracked`, which is the shape `skeleton` proved |
| Is every subscription and listener torn down? | one `setTimeout` at most, cleared in `DestroyRef.onDestroy` |
| Does a static attribute the consumer wrote survive the host bindings? | `aria-label`, `aria-labelledby` and `id` are read once through `HostAttributeToken` and kept, so a consumer's own name is never overwritten by the family's |
| Does an entry point that others depend on stay a single class? | `@slotted/angular/progress-indicator`, one entry point, three exported classes plus the defaults provider |

## Contract break

There is no public API to break: the three families this one absorbs were
deleted from `specs/components/` before this work started. The moves a
consumer of the old three makes:

| Was | Is |
| --- | -- |
| `<Spinner size="md" />` | `<ProgressCircle label="Loading…" size="md" />`, or `<Loader label="Loading…" />` for a wait under five seconds |
| `<ProgressBar value={40} max={100} />` | `<ProgressBar label="…" max={100} value={40} />` — the label is now required for the name and the root is no longer the track |
| `<LoadingBar />` | `<ProgressBar label="Loading page" placement="page" />` |
| `[slSpinner]` | `[slProgressCircle]` or `[slLoader]` |
| `[slProgressBar]` | `[slProgressBar]`, same selector, new parts |
| `[slLoadingBar]` | `[slProgressBar]` with `placement="page"` |

Two shared vocabularies move with it, both in their own commit and both raised
at the gate: `measurement` stops being mutable, and `complete` becomes a state.

## Where this still differs from M3

Named rather than claimed away, because three of them are visible.

| M3 | Here | Why |
| -- | ---- | --- |
| `adjustedWavelength = trackLength / cycleCount` — the wavelength is stretched so a whole number of cycles fits the track, and the crests always meet its ends | a fixed wavelength of ten thicknesses | CSS cannot read an element's own width into a length calculation. A container query could quantise it in steps, which is a worse answer than a wavelength that is simply constant |
| the determinate value is a `SpringAnimation`, `DAMPING_RATIO_NO_BOUNCY` at `STIFFNESS_VERY_LOW` | `--slotted-duration-medium` with `--slotted-easing-standard` | a spring has no CSS expression. The motion scale holds four curves and none of them is a spring; adding one is a token-contract change rather than a family decision |
| the amplitude ramp is a 500 ms animator with `motionEasingStandard` turning the wave on and `motionEasingEmphasizedAccelerate` turning it off | the ramp rides the value's own transition, symmetric in both directions | tying it to the value means the flatten takes exactly as long as the fill that causes it, and there are not two timers to keep in step. The asymmetry is lost |
| the wavy **circular** indicator ramps its amplitude and animates its phase | both, by the same rules the bar follows | the ramp morphs `d` between the wound sine and the same fitting at amplitude nought — one command list, so the two interpolate — scrubbed by a paused keyframe with a negative delay. The phase is a rotation of one crest, which for `R + A·sin(Nθ)` is exactly a travelling wave, with the dash shifted back by the same 12.5 of 100 path units so the arc stays where the value put it |

## Deliberately not shipped

- **A region member.** `skeleton` owns `aria-busy` on a waiting region. The
  reference page shows the two attributes ARIA asks for instead.
- **A live region of its own.** The role prunes its own subtree;
  `inline-message` owns the sentence.
- **Segments and steps.** A row of bars is `inline` and a sequence of named
  steps is `stepper`.
- **A gauge.** `docs/component-features.md` 13 names Gauge / Bullet as its own
  family, and the Meter pattern draws the line: a level is not a task.
- **An icon and a message.** `inline-message` is the piece section 9 names for
  exactly that, and `field` already consumes it.
- **An imperative façade.** `start()`, `increment()` and `done()` are the
  NProgress shape, and they are `loading` and `value` spelled twice.
