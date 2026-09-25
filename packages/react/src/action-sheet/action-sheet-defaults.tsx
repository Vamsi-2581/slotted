import { createContext, useContext } from 'react';

import type { ActionSheetDefaults, ActionSheetDefaultsProviderProps } from './action-sheet.types';

const FALLBACK: ActionSheetDefaults = {
  back: 'close',
  cancelLabel: 'Cancel',
  closeOnSelect: true,
  escape: 'close',
  modal: true,
  mount: 'active',
  outsidePress: 'close',
};

const ActionSheetDefaultsContext = createContext<ActionSheetDefaults>(FALLBACK);

/** What an action sheet does here, before it states anything of its own. */
export function useActionSheetDefaults(): ActionSheetDefaults {
  return useContext(ActionSheetDefaultsContext);
}

/**
 * An application decides once how its sheets behave and what the cancel says,
 * rather than on every sheet. A sheet that states any of them itself still
 * wins, because an explicit consumer value always does.
 */
export function ActionSheetDefaultsProvider({
  children,
  ...defaults
}: ActionSheetDefaultsProviderProps) {
  const inherited = useActionSheetDefaults();

  return (
    <ActionSheetDefaultsContext.Provider
      value={{
        back: defaults.back ?? inherited.back,
        cancelLabel: defaults.cancelLabel ?? inherited.cancelLabel,
        closeOnSelect: defaults.closeOnSelect ?? inherited.closeOnSelect,
        escape: defaults.escape ?? inherited.escape,
        modal: defaults.modal ?? inherited.modal,
        mount: defaults.mount ?? inherited.mount,
        outsidePress: defaults.outsidePress ?? inherited.outsidePress,
      }}
    >
      {children}
    </ActionSheetDefaultsContext.Provider>
  );
}
