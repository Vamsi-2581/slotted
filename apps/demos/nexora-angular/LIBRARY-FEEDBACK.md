# Library feedback from Nexora

One entry per friction met while consuming `@slotted/angular` as a beta. Family, version, what it cost, what would have removed the cost. The library is not changed from here.

| Beta         | Family                                              | Friction                                                                                                              | Cost                                                             |
| ------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 0.1.0-beta.0 | app-shell, page-header, page, side-navigation       | four `provide*Defaults` calls to speak English                                                                        | `app.config.ts` grows one provider per family that speaks        |
| 0.1.0-beta.0 | avatar                                              | an empty `[slAvatarFallback]` element suppresses the initials computed from `name`, silently                                | one blank disc until the marker was removed; `name` alone is the contract |
| 0.1.0-beta.0 | top-navigation                                      | the bar must be the banner's direct child: a wrapping component element breaks the banner's flex row                    | `:host { display: contents }` on the app's banner component                |
| 0.1.0-beta.0 | top-navigation                                      | `[slTopNavigationCount]` is positioned only inside `notifications`; an extra action (approvals, tasks) needs `badge-anchor` | two visual styles of count side by side                                    |
| 0.1.0-beta.0 | top-navigation                                      | `aria-label` on `notifications`/`account` is read once as a static attribute; a dynamic count cannot enter the name       | the count stays visual only on those two controls                          |
| 0.1.0-beta.0 | list-item                                           | `SlListItem` is a component, so a row component cannot host it (`NG2015`); a reusable row has to sit on `[slListItemContent]` and leave `[slListItemActions]` to each consumer | the actions markup is written twice (popover and page)                      |
| 0.1.0-beta.0 | popover                                             | `--slotted-popover-measure` is a cap on an intrinsic width; a list in a popover renders 17rem wide and `list-item` wraps its actions below 22rem | the app sizes the content itself and retunes `--slotted-popover-measure-lg` |
| 0.1.0-beta.0 | command-palette                                     | an item with `href` is an anchor the family clicks natively on Enter — a full page load in a router app; `CommandPaletteItem` has no router hook | the app keeps its own `route` field and navigates in `select`               |
| 0.1.0-beta.0 | command-palette                                     | the item template context is typed on the base `CommandPaletteItem`, not on the consumer's item type                          | an `asRow()` cast in the template                                           |
| 0.1.0-beta.0 | toast                                               | `ToastContent.actions` takes a `TemplateRef`, not a handler; a "Retry" on a failed mutation has no cheap form                | the 503 toast tells, and cannot offer to retry                              |
| 0.1.0-beta.0 | app-shell                                           | overlay mode closes the column on navigation through the same `navOpen` model an application persists as a preference       | the app persists `navOpen` only above 1024px                               |
| 0.1.0-beta.0 | app-shell, side-navigation                          | the rail hides the column's labels but not the consumer's own nav header/footer content                                      | two CSS rules keyed on `[data-nav-mode='inline']:not([data-open])`         |
| 0.1.0-beta.0 | grid                                                | `columns` and `gap` are numeric unions without a string transform: `columns="3"` is a type error, `[columns]="3"` works | one bracket per attribute; other families accept strings         |

## Backend

One entry per gap met in `@slotted/demo-nexora-operations` while building the Shell. The backend is not changed from here.

| Area          | Gap                                                                                   | Cost                                                                             |
| ------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| persistence   | in-memory only; a reload re-seeds                                                     | persona, scenario and preferences kept by the client in `localStorage`           |
| notifications | no `route`                                                                            | route derived from `entityType`/`entityId` in `NotificationsStore.routeFor`      |
| session       | no sign-out                                                                           | client-side `unauthenticated` state                                              |
| startup       | synchronous seed (`light` ≈ 2.6 s, `demo` ≈ 11 s on the main thread)                  | backend created after first paint; skeleton until then                          |
| serve         | TypeScript source through `exports`; Vite's optimizer cannot resolve extensionless imports | `serve.options.prebundle.exclude` in `angular.json`                         |
