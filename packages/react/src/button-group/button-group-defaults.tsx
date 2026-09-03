import { createContext, useContext } from 'react';

import type {
  ButtonGroupCollapse,
  ButtonGroupDefaults,
  ButtonGroupDefaultsProviderProps,
  ButtonGroupOrientation,
} from './button-group.types';

const ButtonGroupDefaultsContext = createContext<ButtonGroupDefaults>({});

/**
 * How a group is laid out here, before it states anything of its own. Every
 * axis is optional, so an application that standardises separation does not
 * also decide which of its groups are joined.
 */
export function useButtonGroupDefaults(): ButtonGroupDefaults {
  return useContext(ButtonGroupDefaultsContext);
}

/**
 * An application decides once how its action groups are spaced and shaped,
 * rather than repeating the same three props across a product. A group that
 * states an axis itself still wins: an explicit value is never overridden by
 * context.
 */
export function ButtonGroupDefaultsProvider({
  children,
  ...defaults
}: ButtonGroupDefaultsProviderProps) {
  const inherited = useButtonGroupDefaults();

  return (
    <ButtonGroupDefaultsContext.Provider
      value={{
        attached: defaults.attached ?? inherited.attached,
        collapse: defaults.collapse ?? inherited.collapse,
        gap: defaults.gap ?? inherited.gap,
      }}
    >
      {children}
    </ButtonGroupDefaultsContext.Provider>
  );
}

interface ButtonGroupShape {
  /** What the rule between two runs turns with. */
  orientation: ButtonGroupOrientation;
  /**
   * Whether the group's flow depends on how wide its container turns out to
   * be. A rule inside one cannot state an axis, because the axis is not known
   * until the page is laid out.
   */
  collapses: boolean;
}

const ButtonGroupShapeContext = createContext<ButtonGroupShape>({
  orientation: 'horizontal',
  collapses: false,
});

export const ButtonGroupShapeProvider = ButtonGroupShapeContext.Provider;

/**
 * What the separator has to know and cannot see: which way the group runs. A
 * rule written outside a group answers to the default, which is the same
 * answer the stylesheet gives it.
 */
export function useButtonGroupShape(): ButtonGroupShape {
  return useContext(ButtonGroupShapeContext);
}

export function collapsesWithContainer(collapse: ButtonGroupCollapse | undefined) {
  return collapse === 'stack';
}
