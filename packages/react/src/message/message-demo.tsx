import { splitWords } from '@slotted/core/text-stream';
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { Avatar } from '../avatar';
import { IconButton } from '../button';
import { Glyph, Icon } from '../icon';
import {
  Bubble,
  BubbleContent,
  BubbleMeta,
  Message,
  MessageActions,
  MessageAvatar,
  MessageBody,
  MessageReceipt,
  MessageTime,
} from './index';
import type { MessageProps, MessageStatus } from './index';

/**
 * One product for every page: a payments support desk, where Marta Silva from
 * the operations team and the reader resolve a payout returned by the bank.
 */
export const MARTA = 'Marta Silva';
export const ASSISTANT = 'Assistente';

export const LONG_ANSWER =
  'O checkout abrandou às 21:40 porque o pool de ligações chegou ao teto e cada pedido novo ficou na fila atrás de um que já corria. O worker de pagamentos tinha repetido um lote de 1200 webhooks depois de um timeout do processador, e cada repetição abriu uma ligação própria. Subimos o pool para 60 e limitámos o worker a 8 entregas simultâneas; o p95 voltou a menos de 400 ms quatro minutos depois.';

export const DRAFTS = [
  'A 4.2 passa a faturação para o novo serviço de impostos, por isso as encomendas da UE levam a linha de IVA no PDF, no recibo e na exportação CSV.',
  'O destaque da 4.2 é o IVA europeu: calculado por encomenda e não por conta, e visível onde quer que apareça um valor.',
  'Na 4.2, as encomendas da UE passam a mostrar o IVA; o portal guarda os filtros e um pagamento falhado só fica em atraso depois de duas tentativas.',
];

/** Rows of a conversation take the whole width of the column they stand in. */
export function Stack({ children }: { children: ReactNode }) {
  return (
    <div className="slotted-demo-stack" data-stretch="">
      {children}
    </div>
  );
}

/** Marta's side: the secondary tint, her avatar at the foot. */
export function Theirs({
  avatar = true,
  children,
  time,
  ...props
}: Omit<MessageProps, 'children'> & { avatar?: boolean; children: ReactNode; time?: string }) {
  return (
    <Message aria-label={MARTA} {...props}>
      {avatar ? (
        <MessageAvatar>
          <Avatar name={MARTA} size="sm" />
        </MessageAvatar>
      ) : null}
      <MessageBody>
        <Bubble>
          <BubbleContent>
            {children}
            {time === undefined ? null : (
              <BubbleMeta>
                <MessageTime dateTime={`2026-09-30T${time}`}>{time}</MessageTime>
              </BubbleMeta>
            )}
          </BubbleContent>
        </Bubble>
      </MessageBody>
    </Message>
  );
}

/** The reader's own side: the accent's fill, the hour and the receipt inside. */
export function Mine({
  children,
  status = 'read',
  time = '09:41',
  ...props
}: Omit<MessageProps, 'children' | 'status'> & {
  children: ReactNode;
  status?: Exclude<MessageStatus, 'streaming'>;
  time?: string;
}) {
  return (
    <Message align="end" aria-label="Tu" status={status} {...props}>
      <MessageBody>
        <Bubble>
          <BubbleContent>
            {children}
            <BubbleMeta>
              {status === 'sending' ? null : (
                <MessageTime dateTime={`2026-09-30T${time}`}>{time}</MessageTime>
              )}
              <MessageReceipt />
            </BubbleMeta>
          </BubbleContent>
        </Bubble>
      </MessageBody>
    </Message>
  );
}

/** The actions an assistant's reply carries. */
export function ReplyActions() {
  return (
    <MessageActions>
      <IconButton aria-label="Copiar" size="sm" variant="ghost">
        <Icon>
          <Glyph name="copy" />
        </Icon>
      </IconButton>
      <IconButton aria-label="Gerar de novo" size="sm" variant="ghost">
        <Icon>
          <Glyph name="rotate-ccw" />
        </Icon>
      </IconButton>
    </MessageActions>
  );
}

export const STREAM =
  'O serviço de impostos começou a repetir cada confirmação às 14:05, duas vezes a 400 ms cada, por isso o p95 de POST /api/checkout/confirm passou de 240 ms para 3,1 s.\n\nA base de dados nunca foi o gargalo: as ligações ficaram abaixo de 40 % durante todo o incidente. Desliguei as repetições no cliente do serviço e o p95 voltou a 260 ms em dois minutos.';

/**
 * A transport as a model serves one: mostly a word every few tens of
 * milliseconds, now and then a pause and a burst of several words at once.
 * The pattern is fixed, so every replay arrives the same way.
 */
const BURSTS = [1, 1, 2, 1, 1, 3, 1, 7, 1, 2, 1, 1, 1, 12, 2, 1, 1, 4, 1, 1, 2, 9];
const PAUSES = [45, 30, 60, 35, 40, 50, 30, 240, 40, 35, 55, 30, 45, 380, 40, 30, 50, 120];

/** The text of `STREAM` received so far, arriving in bursts, and a way to start again. */
export function useSimulatedStream(text: string = STREAM) {
  const [received, setReceived] = useState(0);
  const [run, setRun] = useState(0);
  const words = splitWords(text);
  useEffect(() => {
    setReceived(0);
    let index = 0;
    let tick = 0;
    let timer = 0;
    const next = () => {
      index = Math.min(words.length, index + (BURSTS[tick % BURSTS.length] ?? 1));
      setReceived(index);
      if (index < words.length) {
        timer = window.setTimeout(next, PAUSES[tick % PAUSES.length] ?? 40);
        tick += 1;
      }
    };
    timer = window.setTimeout(next, 400);
    return () => window.clearTimeout(timer);
    // The words are derived from `text`; a new run restarts the same text.
  }, [text, run]);
  const replay = useCallback(() => setRun((value) => value + 1), []);
  return { text: words.slice(0, received).join(''), done: received >= words.length, replay };
}
