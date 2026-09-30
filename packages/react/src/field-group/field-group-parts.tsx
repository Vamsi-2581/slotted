import { useEffect } from 'react';

import { FIELD_NECESSITY_WORDS, necessityMark } from '../field';
import { InlineMessage } from '../inline-message';
import { useFieldGroup } from './field-group';
import type {
  FieldGroupContentProps,
  FieldGroupContentRootProps,
  FieldGroupLegendProps,
  FieldGroupLegendRootProps,
  FieldGroupMessageProps,
} from './field-group.types';

function useRegisterMessage(slot: 'description' | 'error', present: boolean) {
  const group = useFieldGroup();
  const register = group?.registerMessage;

  useEffect(() => {
    if (register === undefined) return;
    register(slot, present);
    return () => register(slot, false);
  }, [present, register, slot]);
}

const hasContent = (children: unknown) =>
  children !== undefined && children !== null && children !== false && children !== '';

/**
 * The name of the set, and whether the set has to be answered.
 *
 * It holds whatever the page puts in it. On a page asking one question GOV.UK
 * recommends the legend contain the page's own heading, so a reader hears the
 * question once rather than twice; the family removes the heading's block break
 * and its margins and leaves its type alone, because a page heading is a page's
 * decision rather than a control's.
 */
export function FieldGroupLegend({
  children,
  id,
  ref,
  render,
  ...nativeProps
}: FieldGroupLegendProps) {
  const group = useFieldGroup();
  const mark = necessityMark(
    group?.necessity ?? 'mark',
    group?.required === true,
    group?.necessityWords ?? FIELD_NECESSITY_WORDS,
  );

  const rootProps: FieldGroupLegendRootProps = {
    ...nativeProps,
    children: (
      <>
        {children}
        {mark === null ? null : (
          <span {...(mark.hidden ? { 'aria-hidden': true } : {})} data-part="mark">
            {mark.text}
          </span>
        )}
      </>
    ),
    'data-part': 'legend',
    id: id ?? group?.ids.legend,
  };

  return render === undefined ? <legend {...rootProps} ref={ref} /> : render(rootProps);
}

/**
 * The box that lays the fields out.
 *
 * It exists because a `legend` inside a grid or flex container is laid out by
 * rules of its own in every engine: the fieldset stays a block, and this is the
 * element `orientation` arranges.
 */
export function FieldGroupContent({ ref, render, ...nativeProps }: FieldGroupContentProps) {
  const rootProps: FieldGroupContentRootProps = { ...nativeProps, 'data-part': 'content' };
  return render === undefined ? <div {...rootProps} ref={ref} /> : render(rootProps);
}

/** Help about the whole set, joining the fieldset's own `aria-describedby`. */
export function FieldGroupDescription({ children, mark, tone, ...rest }: FieldGroupMessageProps) {
  const group = useFieldGroup();
  useRegisterMessage('description', hasContent(children));

  return (
    <InlineMessage
      {...rest}
      id={group?.ids.description}
      mark={mark ?? 'none'}
      size={group?.messageSize}
      tone={tone ?? 'secondary'}
    >
      {children}
    </InlineMessage>
  );
}

/**
 * What is wrong with the set — the case a single field cannot state, because
 * "choose at least one" is a fact about the group rather than about any control
 * in it. GOV.UK's error-message-with-legend example is the same arrangement.
 */
export function FieldGroupError({ children, mark, tone, ...rest }: FieldGroupMessageProps) {
  const group = useFieldGroup();
  useRegisterMessage('error', hasContent(children));

  return (
    <InlineMessage
      {...rest}
      id={group?.ids.error}
      mark={mark ?? 'none'}
      size={group?.messageSize}
      tone={tone ?? 'danger'}
    >
      {children}
    </InlineMessage>
  );
}
