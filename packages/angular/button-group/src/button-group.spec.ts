import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SlButton, provideButtonDefaults } from '@slotted/angular/button';
import type { ButtonTone } from '@slotted/angular/button';
import { describe, expect, it } from 'vitest';

import { SlButtonGroup } from './button-group';
import { SlButtonGroupSeparator } from './button-group-separator';
import { provideButtonGroupDefaults } from './button-group-defaults';
import type { ButtonGroupGap } from './button-group-defaults';

@Component({
  imports: [SlButtonGroup, SlButtonGroupSeparator, SlButton],
  template: `
    <div slButtonGroup id="plain">actions</div>
    <div
      slButtonGroup
      id="decided"
      [gap]="gap()"
      align="stretch"
      justify="end"
      orientation="vertical"
      collapse="stack"
      attached
      fullWidth
    >
      actions
    </div>
    <div slButtonGroup id="toolbar" role="toolbar">actions</div>
    <nav slButtonGroup id="landmark" role="" aria-label="Pages">actions</nav>
    <div slButtonGroup id="painted" [tone]="tone()" size="sm" variant="outline">
      <button slButton id="painted-button">Delete</button>
      <button slButton id="painted-own" tone="accent">Publish</button>
    </div>
    <div slButtonGroup id="row"><div slButtonGroupSeparator id="row-rule"></div></div>
    <div slButtonGroup id="column" orientation="vertical">
      <div slButtonGroupSeparator id="column-rule"></div>
    </div>
    <div slButtonGroup id="collapsing" collapse="stack">
      <div slButtonGroupSeparator id="collapsing-rule"></div>
    </div>
    <div slButtonGroup id="cosmetic">
      <div slButtonGroupSeparator id="cosmetic-rule" decorative></div>
    </div>
  `,
})
class ButtonGroupHost {
  readonly gap = signal<ButtonGroupGap | undefined>(undefined);
  readonly tone = signal<ButtonTone | undefined>('danger');
}

function mount(providers: unknown[] = []) {
  TestBed.configureTestingModule({ providers: providers as never[] });
  const fixture = TestBed.createComponent(ButtonGroupHost);
  fixture.detectChanges();
  return {
    fixture,
    element: (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement,
  };
}

describe('SlButtonGroup', () => {
  it('carries the identifier a consumer selects the family by', () => {
    const { element } = mount();

    expect(element('plain').getAttribute('data-ui')).toBe('button-group');
    expect(element('plain').getAttribute('data-part')).toBe('root');
  });

  /**
   * A group of buttons is several tab stops. The arrow-key model belongs to
   * `toolbar`, so the role that promises it is never written by accident.
   */
  it('is a group, and says so', () => {
    expect(mount().element('plain').getAttribute('role')).toBe('group');
  });

  it('lets a static role the consumer wrote survive the host binding', () => {
    expect(mount().element('toolbar').getAttribute('role')).toBe('toolbar');
  });

  it('gives up the role to an element whose own semantics are the point', () => {
    const landmark = mount().element('landmark');

    expect(landmark.tagName).toBe('NAV');
    expect(landmark.hasAttribute('role')).toBe(false);
  });

  it('writes no axis the consumer did not decide, because the base rule holds the defaults', () => {
    const { element } = mount();

    for (const axis of ['gap', 'align', 'justify', 'orientation', 'collapse', 'attached']) {
      expect(element('plain').hasAttribute(`data-${axis}`)).toBe(false);
    }
    expect(element('plain').hasAttribute('data-full-width')).toBe(false);
  });

  it('states each axis the consumer decided', () => {
    const { element, fixture } = mount();
    fixture.componentInstance.gap.set(2);
    fixture.detectChanges();

    const group = element('decided');
    expect(group.getAttribute('data-align')).toBe('stretch');
    expect(group.getAttribute('data-attached')).toBe('');
    expect(group.getAttribute('data-collapse')).toBe('stack');
    expect(group.getAttribute('data-full-width')).toBe('');
    expect(group.getAttribute('data-gap')).toBe('2');
    expect(group.getAttribute('data-justify')).toBe('end');
    expect(group.getAttribute('data-orientation')).toBe('vertical');
  });

  it('treats no separation as a decision, not as an absent one', () => {
    const { element, fixture } = mount();
    fixture.componentInstance.gap.set(0);
    fixture.detectChanges();

    expect(element('decided').getAttribute('data-gap')).toBe('0');
  });

  it('keeps every button in the tab sequence, because a group is not a toolbar', () => {
    const { element } = mount();

    expect(element('painted-button').hasAttribute('tabindex')).toBe(false);
    expect(element('painted-own').hasAttribute('tabindex')).toBe(false);
  });
});

describe('SlButtonGroup paint', () => {
  it('paints the buttons under it', () => {
    const { element } = mount();
    const button = element('painted-button');

    expect(button.getAttribute('data-tone')).toBe('danger');
    expect(button.getAttribute('data-variant')).toBe('outline');
    expect(button.getAttribute('data-size')).toBe('sm');
  });

  it('loses to a button that states the axis itself', () => {
    expect(mount().element('painted-own').getAttribute('data-tone')).toBe('accent');
  });

  /**
   * The paint travels through getters rather than a snapshot, so a button's
   * own `computed` tracks the group's signals. A copy taken when the first
   * button was created would never move again.
   */
  it('follows the group when the group changes its mind', () => {
    const { element, fixture } = mount();
    fixture.componentInstance.tone.set('success');
    fixture.detectChanges();

    expect(element('painted-button').getAttribute('data-tone')).toBe('success');
  });

  it('overrules the application-wide button defaults it sits inside', () => {
    const { element } = mount([provideButtonDefaults({ tone: 'secondary' })]);

    expect(element('painted-button').getAttribute('data-tone')).toBe('danger');
  });

  it('inherits the axes it does not state from the providers above it', () => {
    const { element } = mount([provideButtonDefaults({ tone: 'secondary' })]);

    expect(element('painted-own').getAttribute('data-tone')).toBe('accent');
    expect(element('plain').hasAttribute('data-tone')).toBe(false);
  });
});

describe('provideButtonGroupDefaults', () => {
  it('decides once how the groups under it are spaced and shaped', () => {
    const { element } = mount([
      provideButtonGroupDefaults({ attached: true, collapse: 'stack', gap: 6 }),
    ]);

    const group = element('plain');
    expect(group.getAttribute('data-attached')).toBe('');
    expect(group.getAttribute('data-collapse')).toBe('stack');
    expect(group.getAttribute('data-gap')).toBe('6');
  });

  it('loses to a group that states the axis itself', () => {
    const { element, fixture } = mount([provideButtonGroupDefaults({ gap: 6 })]);
    fixture.componentInstance.gap.set(2);
    fixture.detectChanges();

    expect(element('decided').getAttribute('data-gap')).toBe('2');
  });
});

describe('SlButtonGroupSeparator', () => {
  it('is a part of the group and not a family of its own', () => {
    const { element } = mount();

    expect(element('row-rule').getAttribute('data-part')).toBe('separator');
    expect(element('row-rule').hasAttribute('data-ui')).toBe(false);
  });

  it('turns across the group it divides', () => {
    const { element } = mount();

    expect(element('row-rule').getAttribute('aria-orientation')).toBe('vertical');
    expect(element('column-rule').getAttribute('aria-orientation')).toBe('horizontal');
  });

  /**
   * Which way a collapsing group runs is decided by the width the page turns
   * out to have. An attribute that is right above the breakpoint and wrong
   * below it is worse than the one ARIA already defaults to.
   */
  it('states no axis inside a group whose axis the container decides', () => {
    const { element } = mount();

    expect(element('collapsing-rule').getAttribute('role')).toBe('separator');
    expect(element('collapsing-rule').hasAttribute('aria-orientation')).toBe(false);
  });

  it('leaves the accessibility tree when the boundary is only cosmetic', () => {
    const { element } = mount();

    expect(element('cosmetic-rule').getAttribute('role')).toBe('none');
    expect(element('cosmetic-rule').getAttribute('aria-hidden')).toBe('true');
    expect(element('cosmetic-rule').hasAttribute('aria-orientation')).toBe(false);
  });
});
