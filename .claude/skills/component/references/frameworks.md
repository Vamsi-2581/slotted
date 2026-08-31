# Framework requirements

Share the family contract, authored stylesheet, semantics, and behavioural intent. Do not force React and Angular through one implementation or make their public APIs artificially identical.

## React

- Use function components.
- Use `useId` for identifiers that must be unique and stable across hydration.
- Use context for state shared by a compound family.
- Use a `render` prop where the consumer must substitute the rendered element.
- Pass native props, events, `aria-*`, and `data-*` attributes through to the element that owns them.
- Respect `exactOptionalPropertyTypes`; absence and explicit `undefined` are not interchangeable by accident.
- Make shared state `undefined` by default so an unset value can defer to a provider or native default.
- Preserve ref access to the relevant native element when the existing family pattern exposes it.

## Angular

- Use standalone components and directives.
- Use `input()`, `model()`, and `output()` signals for public values and events.
- Use `computed` for derived state.
- Put host attributes, classes, styles, roles, and listeners in `host` metadata rather than `@HostBinding` or `@HostListener`.
- Use `ViewEncapsulation.None` with the one authored family stylesheet.
- Add `exportAs` when a template needs the component or directive instance.
- Prefer `inject()` over constructor parameters.
- Import another Slotted entry point only through `@slotted/angular/<name>`; never reach into its source or private path.
- Preserve native attributes and events on the element that owns them, including forms behaviour where applicable.

## Both

The consumer's explicit value always wins over context, inference, a provider, or derived state. Prefer the platform before ARIA or proprietary behaviour. Keep internal DOM private unless the contract explicitly exposes a part. Validate equivalent concepts and outcomes, not implementation parity.
