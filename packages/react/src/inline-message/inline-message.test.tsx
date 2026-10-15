import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import contract from '../../../../specs/components/inline-message/contract.json';
import { InlineMessage, InlineMessageDefaultsProvider } from './index';

const parts = (element: HTMLElement) =>
  [...element.children].map((child) => child.getAttribute('data-part'));

describe('InlineMessage', () => {
  it('is selected in public by the family identifier and its parts', () => {
    render(
      <InlineMessage data-testid="message" tone="danger">
        Informe um CNPJ válido.
      </InlineMessage>,
    );

    const message = screen.getByTestId('message');
    expect(message.tagName).toBe('P');
    expect(message).toHaveAttribute('data-ui', 'inline-message');
    expect(message).toHaveAttribute('data-part', 'root');
    expect(parts(message)).toEqual(['prefix', 'icon', 'text']);
  });

  it('writes every axis a consumer may style on, and the contract’s defaults', () => {
    render(<InlineMessage data-testid="message">Entre 8 e 64 caracteres.</InlineMessage>);

    const message = screen.getByTestId('message');
    const { defaults } = contract.members.inlineMessage;
    expect(message).toHaveAttribute('data-tone', defaults.tone);
    expect(message).toHaveAttribute('data-size', defaults.size);
    expect(message).toHaveAttribute('data-live', defaults.live);
    expect(message).not.toHaveAttribute('data-loading');
    expect(message).not.toHaveAttribute('data-disabled');
    expect(message).not.toHaveAttribute('data-reserve');
  });

  /**
   * The capability none of the thirteen surveyed implementations ships. The
   * mark and the colour reach a reader who looks; the word is what reaches a
   * reader who listens, and it is first in the DOM so it is read first.
   */
  it('says the severity in words, before the message, for every tone that is one', () => {
    for (const [tone, word] of Object.entries(contract.tonePrefixes)) {
      const { unmount } = render(
        <InlineMessage data-testid="message" tone={tone as 'danger'}>
          Uma mensagem.
        </InlineMessage>,
      );

      const message = screen.getByTestId('message');
      const prefix = message.querySelector('[data-part="prefix"]');
      if (word === null) expect(prefix).toBeNull();
      else {
        expect(prefix).not.toBeNull();
        expect(prefix?.textContent).toBe(word);
        expect(message.firstElementChild).toBe(prefix);
      }
      unmount();
    }
  });

  it('lets one message replace the word, and the empty string remove it', () => {
    render(
      <>
        <InlineMessage data-testid="own" prefix="Erro:" tone="danger">
          Informe um CNPJ válido.
        </InlineMessage>
        <InlineMessage data-testid="none" prefix="" tone="danger">
          Erro: informe um CNPJ válido.
        </InlineMessage>
      </>,
    );

    expect(screen.getByTestId('own').querySelector('[data-part="prefix"]')?.textContent).toBe(
      'Erro:',
    );
    expect(screen.getByTestId('none').querySelector('[data-part="prefix"]')).toBeNull();
  });

  /**
   * The provider is where an application translates the four words once. A
   * partial table is merged over the inherited one, so replacing `danger`
   * alone does not silently drop `warning`.
   */
  it('takes the application’s own words, one at a time', () => {
    render(
      <InlineMessageDefaultsProvider prefixes={{ danger: 'Erro:' }} size="md" tone="danger">
        <InlineMessage data-testid="inherited">Informe um CNPJ válido.</InlineMessage>
        <InlineMessage data-testid="stated" tone="warning">
          A senha é fraca.
        </InlineMessage>
      </InlineMessageDefaultsProvider>,
    );

    const inherited = screen.getByTestId('inherited');
    expect(inherited).toHaveAttribute('data-tone', 'danger');
    expect(inherited).toHaveAttribute('data-size', 'md');
    expect(inherited.querySelector('[data-part="prefix"]')?.textContent).toBe('Erro:');
    expect(screen.getByTestId('stated').querySelector('[data-part="prefix"]')?.textContent).toBe(
      'Warning:',
    );
  });

  it('lets a message state an axis the provider already answered', () => {
    render(
      <InlineMessageDefaultsProvider tone="danger">
        <InlineMessage data-testid="message" tone="success">
          Nome disponível.
        </InlineMessage>
      </InlineMessageDefaultsProvider>,
    );

    expect(screen.getByTestId('message')).toHaveAttribute('data-tone', 'success');
  });

  /**
   * `alert` writes its live role on the text part, because MDN's `alert` role
   * reference restricts the role to text content and an alert has a dismiss
   * button beside its text. This family has no controls, so the role belongs on
   * the element that is the text.
   */
  it('carries the announcing role on the element that is the message', () => {
    render(
      <>
        <InlineMessage data-testid="off">Nada é anunciado.</InlineMessage>
        <InlineMessage data-testid="polite" live="polite">
          Salvo.
        </InlineMessage>
        <InlineMessage data-testid="assertive" live="assertive" tone="danger">
          Não foi possível salvar.
        </InlineMessage>
      </>,
    );

    expect(screen.getByTestId('off')).not.toHaveAttribute('role');
    expect(screen.getByTestId('polite')).toHaveAttribute('role', contract.liveRoles.polite);
    expect(screen.getByTestId('assertive')).toHaveAttribute('role', contract.liveRoles.assertive);
  });

  /**
   * The sentence is wrapped by the family so `[data-part='text']:empty` is an
   * exact question — which is what lets `reserve` hold a line open and draw
   * nothing in it.
   */
  it('wraps the message in the family’s own element, and leaves it empty when there is none', () => {
    render(
      <>
        <InlineMessage data-testid="full" reserve tone="danger">
          Faltam dois dígitos.
        </InlineMessage>
        <InlineMessage data-testid="empty" reserve tone="danger" />
      </>,
    );

    const full = screen.getByTestId('full');
    expect(full).toHaveAttribute('data-reserve', '');
    expect(full.querySelector('[data-part="text"]')?.textContent).toBe('Faltam dois dígitos.');
    expect(
      screen.getByTestId('empty').querySelector('[data-part="text"]')?.childNodes,
    ).toHaveLength(0);
  });

  it('turns the mark into a ring while the message waits, and mutes it when disabled', () => {
    render(
      <>
        <InlineMessage data-testid="waiting" loading>
          Verificando disponibilidade…
        </InlineMessage>
        <InlineMessage data-testid="off" disabled>
          Disponível no plano Enterprise.
        </InlineMessage>
      </>,
    );

    expect(screen.getByTestId('waiting')).toHaveAttribute(
      contract.stateAttributes.loading as 'data-loading',
      '',
    );
    expect(screen.getByTestId('off')).toHaveAttribute(
      contract.stateAttributes.disabled as 'data-disabled',
      '',
    );
  });

  /**
   * The identifier is what an `aria-describedby` or an `aria-errormessage`
   * points at, so the element always has one — and the consumer's own always
   * wins, because that is the value a form already knows.
   */
  it('always has an identifier, and never replaces the consumer’s', () => {
    render(
      <>
        <InlineMessage data-testid="generated">Uma mensagem.</InlineMessage>
        <InlineMessage data-testid="stated" id="cnpj-error">
          Outra.
        </InlineMessage>
      </>,
    );

    expect(screen.getByTestId('generated').id).not.toBe('');
    expect(screen.getByTestId('stated').id).toBe('cnpj-error');
  });

  it('draws no mark when asked, and the page’s own artwork when given one', () => {
    render(
      <>
        <InlineMessage data-testid="bare" hideIcon tone="danger">
          Sem marca.
        </InlineMessage>
        <InlineMessage data-testid="own" icon={<svg data-testid="shield" />} tone="accent">
          Com a arte da página.
        </InlineMessage>
      </>,
    );

    expect(screen.getByTestId('bare').querySelector('[data-part="icon"]')).toBeNull();
    expect(screen.getByTestId('own').querySelector('[data-part="icon"] svg')).not.toBeNull();
    expect(screen.getByTestId('own').querySelector('[data-glyph]')).toBeNull();
  });

  it('draws the glyph the contract maps each tone to, and none for help', () => {
    for (const [tone, glyph] of Object.entries(contract.toneGlyphs)) {
      const { unmount } = render(
        <InlineMessage data-testid="message" tone={tone as never}>
          Uma mensagem.
        </InlineMessage>,
      );
      const icon = screen.getByTestId('message').querySelector('[data-part="icon"]') as Element;
      const drawn = icon.querySelector('[data-ui="icon"] > svg[data-part="glyph"]');
      if (glyph === null) expect(icon.childElementCount, tone).toBe(0);
      else expect(drawn?.getAttribute('data-glyph'), tone).toBe(glyph);
      unmount();
    }
  });

  it('draws the dot for a bullet, nothing for no mark, and nothing while waiting', () => {
    render(
      <>
        <InlineMessage data-testid="dot" mark="dot" tone="danger">
          Um ponto.
        </InlineMessage>
        <InlineMessage data-testid="none" mark="none" tone="danger">
          Nada.
        </InlineMessage>
        <InlineMessage data-testid="waiting" loading tone="danger">
          A verificar.
        </InlineMessage>
      </>,
    );
    const icon = (id: string) =>
      screen.getByTestId(id).querySelector('[data-part="icon"]') as Element;

    expect(icon('dot').querySelector('svg[data-glyph]')).toHaveAttribute('data-glyph', 'dot');
    expect(icon('none').childElementCount).toBe(0);
    expect(icon('waiting').childElementCount).toBe(0);
  });

  it('passes native props through and renders into the element a page asks for', () => {
    render(
      <InlineMessage
        className="page-owned"
        data-testid="message"
        lang="de"
        render={(props) => <div {...props} />}
        tone="warning"
      >
        Die Zahlung schlug fehl.
      </InlineMessage>,
    );

    const message = screen.getByTestId('message');
    expect(message.tagName).toBe('DIV');
    expect(message).toHaveAttribute('lang', 'de');
    expect(message).toHaveClass('page-owned');
    expect(message).toHaveAttribute('data-ui', 'inline-message');
  });

  it('lets a consumer state a role of their own', () => {
    render(
      <InlineMessage data-testid="message" live="polite" role="note">
        Uma nota.
      </InlineMessage>,
    );

    expect(screen.getByTestId('message')).toHaveAttribute('role', 'note');
  });
});
