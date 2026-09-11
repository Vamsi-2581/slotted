import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import contract from '../../../../specs/components/section/contract.json';
import { HeadingLevel } from '../typography';
import { Section } from './section';
import { SectionDefaultsProvider } from './section-defaults';
import {
  SectionActions,
  SectionBody,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionHeading,
  SectionTitle,
} from './section-parts';
import type { SectionProps } from './section.types';

function Items({
  title = 'Itens do pedido',
  ...props
}: Partial<SectionProps> & { title?: string }) {
  return (
    <Section {...props}>
      <SectionHeader>
        <SectionTitle>
          <SectionEyebrow>36 itens</SectionEyebrow>
          <SectionHeading>{title}</SectionHeading>
          <SectionDescription>Conforme a cotação aceite.</SectionDescription>
        </SectionTitle>
        <SectionActions>
          <button type="button">Exportar</button>
        </SectionActions>
      </SectionHeader>
      <SectionBody>{props.children ?? <p>Pneu radial</p>}</SectionBody>
    </Section>
  );
}

const root = () => document.querySelector('[data-ui="section"]') as HTMLElement;

describe('Section', () => {
  it('renders the anatomy the contract declares', () => {
    render(<Items />);
    for (const part of contract.members.section.parts) {
      expect(document.querySelector(`[data-part="${part}"]`)).not.toBeNull();
    }
    expect(root().tagName).toBe('SECTION');
  });

  /** A section with a heading is a region named by it. */
  it('is a region named by its heading, and nothing without one', () => {
    render(<Items />);
    const heading = screen.getByRole('heading', { name: 'Itens do pedido' });
    expect(screen.getByRole('region', { name: 'Itens do pedido' })).toBe(root());
    expect(root().getAttribute('aria-labelledby')).toBe(heading.id);

    document.body.innerHTML = '';
    render(
      <Section>
        <SectionBody>sem título</SectionBody>
      </Section>,
    );
    expect(screen.queryByRole('region')).toBeNull();
    expect(root()).not.toHaveAttribute('aria-labelledby');
  });

  /** The outline: h2 by default, one deeper each time. */
  it('takes its rank from the outline and steps it for its body', () => {
    render(
      <HeadingLevel>
        <Items title="Frota">
          <Items title="Veículos pesados">
            <Items title="Cavalos mecânicos" />
          </Items>
        </Items>
      </HeadingLevel>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Frota');
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Veículos pesados');
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Cavalos mecânicos');
  });

  it('renders h1 with no outline around it, and the level the consumer states', () => {
    render(<Items level="4" />);
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
    expect(root()).toHaveAttribute('data-level', '4');
  });

  it('writes its axes and a stable id', () => {
    render(<Items divider ground="surface" id="itens" size="lg" sticky />);
    expect(root()).toHaveAttribute('id', 'itens');
    expect(root()).toHaveAttribute('data-size', 'lg');
    expect(root()).toHaveAttribute('data-ground', 'surface');
    expect(root()).toHaveAttribute('data-divider');
    expect(root()).toHaveAttribute('data-sticky');
    expect(root().getAttribute('aria-labelledby')).toBe('itens-heading');
  });

  it('takes its defaults from the provider, and its own props over them', () => {
    render(
      <SectionDefaultsProvider divider ground="surface" size="sm" sticky>
        <Items size="lg" />
      </SectionDefaultsProvider>,
    );
    expect(root()).toHaveAttribute('data-size', 'lg');
    expect(root()).toHaveAttribute('data-ground', 'surface');
    expect(root()).toHaveAttribute('data-divider');
    expect(root()).toHaveAttribute('data-sticky');
  });

  it('keeps the rank when the heading is rendered into another element', () => {
    render(
      <Section>
        <SectionHeader>
          <SectionTitle>
            <SectionHeading render={(props) => <div {...props} />}>Frota</SectionHeading>
          </SectionTitle>
        </SectionHeader>
      </Section>,
    );
    const heading = screen.getByRole('heading', { level: 1, name: 'Frota' });
    expect(heading.tagName).toBe('DIV');
    expect(root().getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('passes native props through', () => {
    render(<Items lang="pt-BR" data-testid="s" />);
    expect(screen.getByTestId('s')).toHaveAttribute('lang', 'pt-BR');
  });
});
