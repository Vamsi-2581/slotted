# The ReUI dossier

Path: `docs/history/designs/AAAA-MM-DD-<family>-reui-dossier.md`, written in
Portuguese like the other documents in that directory, with one line added
under `## Dossiês ReUI` in `docs/history/designs/README.md` (the section is
created by the first dossier).

The dossier has the nine sections below, in this order. A section with no
content carries the sentence that says what was checked and found empty.

## 0. Cabeçalho

Family, mode (`survey`, `polish` or `build`), date, and the git HEAD read.

## 1. Seleção

The first line states the coverage, then the `llms-full.txt` search terms used
and the count found for each.

| Cobertura | Condição                                                              | Seleção mínima                                                                                                                                                                                                        |
| --------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `direta`  | ReUI ships the family as a primitive or as `c-*` examples             | The primitive's source and docs when it exists, three free examples, two Pro blocks with the family in product context                                                                                                |
| `análogo` | ReUI draws the family's parts or interactions inside other components | One item per Slotted part or interaction with a counterpart, up to six items                                                                                                                                          |
| `nenhuma` | No item shares a part or an interaction with the family               | None. The Slotted siblings that share the family's parts (control height, row, focus ring, motion) are captured with `--family <sibling>` and fill the `ReUI` column of sections 3–5, headed with the sibling's name. |

One row per ReUI item captured.

| Item | Tipo | Rota | Parte ou interação Slotted que informa | Capturas |
| ---- | ---- | ---- | -------------------------------------- | -------- |

## 2. Anatomia

| `data-slot` ReUI | Parte Slotted | Estado |
| ---------------- | ------------- | ------ |

In `análogo`, a row pairs parts with the same role and interaction only.

`Estado` is `igual`, `em falta no Slotted`, or `só no Slotted`.

## 3. Medidas

One row per measured property of each part, at comfortable density and light
scheme. The header records the page width of each side. A property that does
not change with the page width is compared across unequal widths; one that
changes is compared with the ReUI item captured again at `--width 720`.

| Parte | Propriedade | ReUI | Slotted hoje | Alvo | Veredicto |
| ----- | ----------- | ---- | ------------ | ---- | --------- |

`ReUI` and `Slotted hoje` are computed values copied from the specimen JSON.
`Alvo` is a token, or a literal with the token-foundation section that allows
it. `Veredicto` is `adotar`, `adaptar`, `superar`, `recusar` or `outra família`,
followed by one clause naming the evidence; `outra família` names the composed
family that owns the value.

The minimum property set: height, inline padding, gap, font size, weight, line
height, letter spacing, radius, border width, icon size, and the rect at 1× of
every compared part.

## 4. Coreografia de estados

One row per part and state: hover, active, focus-visible, disabled, and every
state the contract declares.

| Parte | Estado | Delta ReUI | Delta Slotted hoje | Alvo |
| ----- | ------ | ---------- | ------------------ | ---- |

A delta is the list of properties that change, with both values, copied from
`states[].deltas` of the specimen.

## 5. Movimento

Enter, exit and state transitions: property list, duration, easing, keyframes,
and the reduced-motion behaviour, for ReUI and for the Slotted target.

## 6. Capacidades

What the ReUI items show the family doing that the Slotted family does not do.

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| ---------- | -------------------- | ------------- | ---------------- | ------------------------------- | --------- | ------------------------- |

`Forma` is the consumer-facing API: props, parts, events, state ownership.
`Forma no Slotted` follows `/component` (`references/frameworks.md`), not the
ReUI shape. `Em que a forma Slotted é melhor` names one concrete respect —
composition, native API, accessibility, state ownership, framework idiom — or
states that the two shapes coincide.

`Veredicto` is `adotar`, `adaptar`, `recusar` or `adiar para <família>`, the
Portuguese of `adopt`, `adapt`, `decline` and `defer to <family>` in
`.claude/skills/component/references/capability.md`, with its rules for a
complete `recusar`.

In `build` mode these rows enter the `/component` step 3 inventory, with ReUI
as one row of **Surveyed**.

## 7. Superar

The result of every row of `.claude/skills/component/references/rubric.md` ›
Craft bar, for both sides, with
the number that decides it.

| Critério | ReUI | Slotted hoje | Alvo | Fonte |
| -------- | ---- | ------------ | ---- | ----- |

## 8. Delta

The ordered change list. One row per change.

| #   | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| --- | -------- | ------- | ---------------------------- | ------------------- |

A state the harness page does not render gets a row that adds its scene,
placed before the row that changes the state.

A row that edits `specs/components/<family>/contract.json` is marked
`contrato`; its presence moves a `polish` run to `build`. A row that edits a
composed family's files is marked `outra família`.
