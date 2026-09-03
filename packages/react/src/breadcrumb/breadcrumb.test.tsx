import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/breadcrumb/contract.json';
import { Breadcrumb } from './breadcrumb';
import { BreadcrumbDefaultsProvider } from './breadcrumb-defaults';
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  collapsedRange,
} from './breadcrumb-parts';
import type { BreadcrumbProps } from './breadcrumb.types';

const LEVELS = ['Workspace', 'Northwind', 'Accounts', 'Billing', 'Invoices'];

function Trail({ levels = LEVELS, ...props }: Partial<BreadcrumbProps> & { levels?: string[] }) {
  return (
    <Breadcrumb {...props}>
      <BreadcrumbList>
        {levels.map((level) => (
          <BreadcrumbItem key={level}>
            <BreadcrumbLink href={`#${level}`}>{level}</BreadcrumbLink>
          </BreadcrumbItem>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>INV-0041</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

const trail = () => screen.getByRole('navigation');
const ellipsis = () => screen.queryByRole('button');
const crumbs = () => screen.getAllByRole('listitem');

describe('Breadcrumb', () => {
  it('is selected in public by the family identifier and its parts', () => {
    render(<Trail className="page-trail" maxItems={0} />);

    expect(trail().tagName).toBe('NAV');
    expect(trail()).toHaveAttribute('data-ui', 'breadcrumb');
    expect(trail()).toHaveAttribute('data-part', 'root');
    expect(trail()).toHaveClass('page-trail');
    expect(screen.getByRole('list')).toHaveAttribute('data-part', 'list');
    expect(crumbs()[0]).toHaveAttribute('data-part', 'item');
    expect(screen.getByText('Workspace')).toHaveAttribute('data-part', 'link');
  });

  /** The landmark is only findable if it is named, and a page may hold several. */
  it('names the landmark, and takes the consumer name over its own', () => {
    const { rerender } = render(<Trail maxItems={0} />);
    expect(trail()).toHaveAttribute('aria-label', 'Breadcrumb');

    rerender(<Trail label="Fatura" maxItems={0} />);
    expect(trail()).toHaveAttribute('aria-label', 'Fatura');
  });

  /**
   * The APG's own two attributes, and neither of them invented: the landmark's
   * name, and `aria-current="page"` on the element standing for this page.
   */
  it('marks the current page as text rather than as a link', () => {
    render(<Trail maxItems={0} />);

    const page = screen.getByText('INV-0041');
    expect(page.tagName).toBe('SPAN');
    expect(page).toHaveAttribute('aria-current', 'page');
    expect(page).toHaveAttribute('data-part', 'page');
    expect(contract.currentSource).toBe('aria-current');
  });

  it('draws a separator after every crumb but the last', () => {
    render(<Trail levels={['A', 'B']} maxItems={0} />);

    const separators = trail().querySelectorAll('[data-part="separator"]');
    expect(separators).toHaveLength(2);
    for (const separator of separators) expect(separator).toHaveAttribute('aria-hidden', 'true');
    expect(crumbs().at(-1)?.querySelector('[data-part="separator"]')).toBeNull();
  });

  it('replaces the separator content without replacing the element', () => {
    render(<Trail levels={['A']} maxItems={0} separator="›" />);

    const separator = trail().querySelector('[data-part="separator"]');
    expect(separator).toHaveTextContent('›');
  });

  describe('collapse', () => {
    /** Always the same shape, so `maxItems` means one thing at every depth. */
    it('keeps the same number of crumbs whatever it folds', () => {
      expect(collapsedRange(3, 1, 2)).toBeUndefined();
      expect(collapsedRange(4, 1, 2)).toEqual({ start: 1, end: 2 });
      expect(collapsedRange(5, 1, 2)).toEqual({ start: 1, end: 3 });
      expect(collapsedRange(9, 2, 3)).toEqual({ start: 2, end: 6 });
    });

    /**
     * The hidden crumbs leave the accessibility tree with the page, which is
     * the cost of collapsing in place: `getAllByRole` cannot see them, and the
     * button that hides them names the count for exactly that reason.
     */
    it('hides the middle and says how many it hides', () => {
      render(<Trail maxItems={4} />);

      expect(ellipsis()).toHaveAccessibleName('Show 3 hidden levels');
      expect(ellipsis()).toHaveAttribute('aria-expanded', 'false');
      expect(trail().querySelectorAll('[data-part="item"][hidden]')).toHaveLength(3);
      expect(crumbs().filter((crumb) => crumb.hasAttribute('hidden'))).toHaveLength(0);
    });

    it('says level rather than levels when it hides one', () => {
      render(<Trail levels={['A', 'B', 'C']} maxItems={3} />);
      expect(ellipsis()).toHaveAccessibleName('Show 1 hidden level');
    });

    it('leaves a short trail alone, and folds none at all when told to', () => {
      const { rerender } = render(<Trail levels={['A', 'B']} maxItems={8} />);
      expect(ellipsis()).toBeNull();

      rerender(<Trail maxItems={0} />);
      expect(ellipsis()).toBeNull();
    });

    /** The ellipsis stops existing, so focus has to be given somewhere. */
    it('reveals the trail and moves focus to the first crumb it revealed', () => {
      render(<Trail maxItems={4} />);
      const button = ellipsis() as HTMLElement;
      button.focus();
      fireEvent.click(button);

      expect(ellipsis()).toBeNull();
      expect(crumbs().some((crumb) => crumb.hasAttribute('hidden'))).toBe(false);
      expect(document.activeElement).toHaveTextContent('Northwind');
    });

    it('carries the reason a press and a key differ by', () => {
      const onExpandedChange = vi.fn();
      render(<Trail maxItems={4} onExpandedChange={onExpandedChange} />);

      fireEvent.keyDown(ellipsis() as HTMLElement, { key: 'Enter' });
      expect(onExpandedChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({ reason: 'keyboard', previous: false }),
      );
    });

    it('never moves state the consumer owns', () => {
      const onExpandedChange = vi.fn();
      render(<Trail expanded={false} maxItems={4} onExpandedChange={onExpandedChange} />);

      fireEvent.click(ellipsis() as HTMLElement);

      expect(onExpandedChange).toHaveBeenCalledOnce();
      expect(ellipsis()).not.toBeNull();
    });

    it('follows the consumer once they accept the request', () => {
      function Controlled() {
        const [expanded, setExpanded] = useState(false);
        return <Trail expanded={expanded} maxItems={4} onExpandedChange={setExpanded} />;
      }
      render(<Controlled />);

      fireEvent.click(ellipsis() as HTMLElement);
      expect(ellipsis()).toBeNull();
    });

    it('commits nothing when the request is cancelled', () => {
      render(<Trail maxItems={4} onExpandedChange={(_, request) => request.cancel()} />);

      fireEvent.click(ellipsis() as HTMLElement);
      expect(ellipsis()).not.toBeNull();
    });

    it('starts expanded when the consumer says so', () => {
      render(<Trail defaultExpanded maxItems={4} />);
      expect(ellipsis()).toBeNull();
    });

    it('writes the state a consumer may style', () => {
      render(<Trail defaultExpanded maxItems={4} />);
      expect(trail()).toHaveAttribute('data-expanded', '');
    });
  });

  describe('composition', () => {
    it('substitutes the rendered element of every part', () => {
      render(
        <Breadcrumb maxItems={0} render={(props) => <div {...props} role="navigation" />}>
          <BreadcrumbList render={(props) => <ul {...props} />}>
            <BreadcrumbItem>
              <BreadcrumbLink render={(props) => <a {...props} data-router="" />} href="#a">
                A
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      expect(trail().tagName).toBe('DIV');
      expect(screen.getByRole('list').tagName).toBe('UL');
      expect(screen.getByText('A')).toHaveAttribute('data-router', '');
    });

    it('takes the application defaults, and yields to an explicit prop', () => {
      const { rerender } = render(
        <BreadcrumbDefaultsProvider label="Trilha" separator="·">
          <Trail levels={['A']} maxItems={0} />
        </BreadcrumbDefaultsProvider>,
      );
      expect(trail()).toHaveAttribute('aria-label', 'Trilha');
      expect(trail().querySelector('[data-part="separator"]')).toHaveTextContent('·');

      rerender(
        <BreadcrumbDefaultsProvider label="Trilha" separator="·">
          <Trail label="Fatura" levels={['A']} maxItems={0} />
        </BreadcrumbDefaultsProvider>,
      );
      expect(trail()).toHaveAttribute('aria-label', 'Fatura');
    });

    it('passes every native attribute to the element that owns it', () => {
      render(
        <Breadcrumb data-testid="trail" id="trail" maxItems={0}>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#a" hrefLang="pt-BR" rel="prev">
                A
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      expect(trail()).toHaveAttribute('id', 'trail');
      expect(screen.getByText('A')).toHaveAttribute('rel', 'prev');
      expect(screen.getByText('A')).toHaveAttribute('hreflang', 'pt-BR');
    });

    it('refuses to render a part outside the trail it belongs to', () => {
      const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(() => render(<BreadcrumbList />)).toThrow(/inside a Breadcrumb/);
      quiet.mockRestore();
    });
  });
});
