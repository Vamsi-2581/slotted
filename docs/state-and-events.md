# State, events and identity

Repository law for every family that holds state a consumer can own, and for
the identifiers a consumer selects a family by. It is binding for every family
the rebuild has reached; the families listed in `specs/legacy-families.json`
predate it.

## Two modes, decided once

A family holds state in one of two modes.

- **Controlled.** The consumer owns the value and passes it in. The component
  never moves it; it asks, and waits for the consumer's next value.
- **Uncontrolled.** The component owns the value and reads an initial one once.
  A later change to that initial value does not silently become new state.

The mode is decided by whether the controlled value is present, and it does not
change for the life of the component. `@slotted/core/state` implements both, so
the two bindings cannot disagree about which one they are in.

Every mutable capability names its own model in the family contract:

```json
"stateModel": {
  "open": {
    "controlled": "open",
    "uncontrolled": "defaultOpen",
    "request": "onOpenChange",
    "reasons": ["pointer", "keyboard", "escape", "outsidePress"]
  }
}
```

`specs/contract.schema.mjs` rejects a mutable capability with no model, and a
model naming a capability the family does not hold.

## A change is a request, and it carries a reason

A component asks to move; it does not announce that it moved. The request
carries the new value, the value it replaces, the reason, and the originating
event, and it can be cancelled before anything commits.

The reason vocabulary is closed: `pointer`, `keyboard`, `clear`, `remove`,
`select`, `dismiss`, `escape`, `outsidePress`, `blur`, `submit`,
`programmatic`. A family declares the subset it can emit.

A boolean cannot say whether a menu closed because Escape was pressed or
because focus left the layer, and a consumer that has to guess writes the wrong
handler. Two different events for the same transition are the same failure
stated twice.

The originating event has no shared type: React and Angular do not agree on
one. It is opaque in the conceptual contract and typed in each binding.

A request for a value equal to the current one is not emitted. There is nothing
to decide and nothing to cancel.

## Bindings

| Concept            | React                         | Angular                                   |
| ------------------ | ----------------------------- | ----------------------------------------- |
| current value      | `value`                       | `[value]`                                 |
| requested change   | `onValueChange(value, event)` | `(valueChange)`                           |
| uncontrolled start | `defaultValue`                | initial input plus internal state         |
| forms              | native props                  | `ControlValueAccessor` for Reactive Forms |

The names belong to the bindings. The behaviour belongs to the contract, and
the contract is what the tests hold.

`ControlValueAccessor` is not part of the conceptual contract, and the Angular
binding still implements it wherever a control belongs in a form.

## Identity in the DOM

A family is selected in public by `data-ui`, whose value is the family name,
written on the root part. Its parts are selected by `data-part`. States appear
as the attributes `specs/contract.schema.mjs` declares — `data-disabled`,
`data-open`, and the rest of that vocabulary.

Class names and DOM structure are not contract. A stylesheet that keys on a
class leaves the consumer with no selector that is safe to rely on and one that
is not, and the two look identical from outside.

## Precedence between states

Two states that can be true at once resolve in the order `STATE_PRECEDENCE`
declares, strongest first: `disabled`, `loading`, `readonly`, `invalid`,
`checked`, `selected`, `pressed`, `current`, `active`, `hover`,
`focus-visible`, `default`.

A weaker state holds itself back for every stronger one. A disabled control
does not answer hover; a loading control does not answer press. The library
learned this from a defect — several controls painted a hover fill on a control
the browser had already disabled — and `packages/styles/src/states.test.mjs` is
what keeps the rule from being relearned the same way.
