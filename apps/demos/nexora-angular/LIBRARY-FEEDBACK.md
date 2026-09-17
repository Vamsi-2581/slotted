# Library feedback from Nexora

One entry per friction met while consuming `@slotted/angular` as a beta. Family, version, what it cost, what would have removed the cost. The library is not changed from here.

| Beta         | Family                                              | Friction                                                                                                              | Cost                                                             |
| ------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 0.1.0-beta.0 | app-shell, page-header, page, side-navigation       | four `provide*Defaults` calls to speak English                                                                        | `app.config.ts` grows one provider per family that speaks        |
| 0.1.0-beta.0 | avatar                                              | an empty `[slAvatarFallback]` element suppresses the initials computed from `name`, silently                                | one blank disc until the marker was removed; `name` alone is the contract |
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
