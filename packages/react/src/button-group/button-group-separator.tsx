import { useButtonGroupShape } from './button-group-defaults';
import type {
  ButtonGroupSeparatorProps,
  ButtonGroupSeparatorRootProps,
} from './button-group.types';

/**
 * A hairline between two runs of actions. In a separated group it stands in
 * the gap, inset a step at each end. Inside a joined bar it takes no room at
 * all: the bar is one shape, and a rule is not licence to cut it — what the
 * rule marks is painted in the column the shared edge already occupies, one
 * step stronger than the seams around it, so the boundary reads without the
 * bar coming apart. A filled run keeps its seam, which is the darkest step of
 * its own tone and the strongest line that bar has.
 *
 * Its axis is the group's, mirrored: a rule across a row is vertical. It is
 * derived rather than accepted, because a rule that could disagree with the
 * group it divides is a rule that eventually does.
 *
 * A group that collapses with its container states no axis at all. Which way
 * it runs is decided by the width the page turns out to have, and an attribute
 * that is right above a breakpoint and wrong below it is worse than the one
 * ARIA already defaults to.
 */
export function ButtonGroupSeparator({
  decorative = false,
  render,
  ...nativeProps
}: ButtonGroupSeparatorProps) {
  const { collapses, orientation } = useButtonGroupShape();

  const rootProps: ButtonGroupSeparatorRootProps = {
    ...(decorative
      ? { 'aria-hidden': true, role: 'none' }
      : {
          role: 'separator',
          ...(collapses
            ? {}
            : { 'aria-orientation': orientation === 'vertical' ? 'horizontal' : 'vertical' }),
        }),
    ...nativeProps,
    'data-part': 'separator',
  };

  return render === undefined ? <div {...rootProps} /> : render(rootProps);
}
