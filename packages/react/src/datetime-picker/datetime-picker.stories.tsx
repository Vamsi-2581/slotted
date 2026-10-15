import { plainDate, plainDateTime, plainTime } from '@slotted/core/date';
import type { PlainDate, PlainTime } from '@slotted/core/date';
import { PT_BR } from '@slotted/core/i18n/pt-BR';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

import { Button } from '../button';
import { Field, FieldDescription, FieldError, FieldLabel } from '../field';
import { SlottedProvider } from '../i18n';
import { DateTimePicker } from './datetime-picker';
import { DateTimePickerDefaultsProvider } from './datetime-picker-defaults';
import { Grid, Measure, Scene } from './datetime-picker-demo';
import { REACT_DATETIME_PICKER_DOCS, REACT_DATETIME_PICKER_TOKENS } from './datetime-picker.docs';
import type { DateTimePickerHandle } from './datetime-picker.types';

/** A consultation on a Thursday afternoon, and the clinic it belongs to. */
const CONSULTATION = plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20));
/** Stated rather than read from the clock, so every scene reads the same twice. */
const REFERENCE = plainDateTime(plainDate(2026, 9, 10), plainTime(14, 40));

const CLINIC = {
  max: plainDateTime(plainDate(2026, 12, 20), plainTime(12, 0)),
  maxTime: plainTime(18, 0),
  min: plainDateTime(plainDate(2026, 9, 11), plainTime(14, 0)),
  minTime: plainTime(9, 0),
};

const isSaturday = (date: PlainDate) =>
  new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() === 6;

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_DATETIME_PICKER_DOCS.dateTimePicker.scenes, {
    playground: Playground,
    panel: Panel,
    'open-to': OpenTo,
    completeness: Completeness,
    seconds: Seconds,
    step: Step,
    'range-bounds': RangeBounds,
    'day-window': DayWindow,
    unavailable: Unavailable,
    now: Now,
    relative: Relative,
    presets: Presets,
    sizes: Sizes,
    variants: Variants,
    placement: Placement,
    states: States,
    forms: Forms,
    narrow: Narrow,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const meta = {
  title: 'Components/DateTimePicker',
  component: DateTimePicker,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'DateTime Picker',
        description:
          'The only family in the library that holds two surfaces at once: a month and a list of times, inside one dialog, over a field that still types every segment. The decision it owes is which of the two focus opens on — and what happens to the other when the reader finishes the first. The answer is the value’s own completeness: the press that leaves it half written carries focus to the missing half, and the press that finishes it closes the panel. No confirmation button, and none declined by accident.',
        framework: 'React',
        ...REACT_DATETIME_PICKER_DOCS.dateTimePicker,
        tokens: REACT_DATETIME_PICKER_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Every open panel needs room under it, and the stage is what gives it. This
 * one holds a month and a column of times, so it is a screen rather than the
 * tall box a single listbox needs.
 */
const Stage = ({ children }: { children: ReactNode }) => (
  <div className="slotted-demo-viewport" data-size="screen">
    {children}
  </div>
);

export const Playground: Story = {
  args: {
    clearable: true,
    closeOnSelect: 'auto',
    granularity: 'minute',
    locale: 'pt-BR',
    openTo: 'date',
    placement: 'bottom-start',
    size: 'md',
    step: 900,
    variant: 'outline',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Field>
        <FieldLabel>Início da consulta</FieldLabel>
        <DateTimePicker {...args} name="inicio" referenceDateTime={REFERENCE} />
        <FieldDescription>Escolha no painel ou escreva no campo.</FieldDescription>
      </Field>
    </div>
  ),
};

export const Panel: Story = {
  parameters: scenario('panel'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Um diálogo, duas superfícies"
        note="Uma grelha que o calendar desenha e uma listbox que esta família desenha, lado a lado dentro do mesmo role=dialog. As duas estão no DOM em qualquer largura: um tablist que existe num contentor estreito e não num largo conta duas histórias diferentes do mesmo componente à tecnologia assistiva."
      >
        <Stage>
          <DateTimePicker
            aria-label="Início"
            defaultOpen
            defaultValue={CONSULTATION}
            locale="pt-BR"
            referenceDateTime={REFERENCE}
            step={1800}
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const OpenTo: Story = {
  parameters: scenario('open-to'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="O foco abre na data"
        note="O predefinido, e a ordem em que o próprio valor se lê. O leitor chega ao dia do valor, com a roving focus do calendar já no sítio."
      >
        <Stage>
          <DateTimePicker
            aria-label="Abre na data"
            defaultOpen
            defaultValue={CONSULTATION}
            locale="pt-BR"
            openTo="date"
            referenceDateTime={REFERENCE}
          />
        </Stage>
      </Scene>
      <Scene
        label="O foco abre na hora"
        note="Para uma agenda cujo dia já está decidido. openTo decide o foco e não o desenho: as duas superfícies continuam presentes, porque mover um mês inteiro por causa de uma definição faria a mesma família parecer duas."
      >
        <Stage>
          <DateTimePicker
            aria-label="Abre na hora"
            defaultOpen
            defaultValue={CONSULTATION}
            locale="pt-BR"
            openTo="time"
            referenceDateTime={REFERENCE}
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const Completeness: Story = {
  parameters: scenario('completeness'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Metade escrita: o foco vai à que falta"
        note="Um dia escolhido sobre um campo vazio deixa o valor por acabar, e o painel fica — com o foco já na lista. A banda no topo diz o que o leitor tem até agora, e desenha a metade que falta como --:--."
      >
        <Stage>
          <DateTimePicker
            aria-label="Por acabar"
            closeOnSelect="auto"
            defaultOpen
            locale="pt-BR"
            referenceDateTime={REFERENCE}
          />
        </Stage>
      </Scene>
      <Scene
        label="Valor inteiro: o painel fecha"
        note="A prensa que completa o valor fecha o painel e devolve o foco ao gatilho, cujo nome acessível carrega o que foi escolhido. É a razão pela qual esta família não precisa do needConfirm do Ant nem do Set do Kendo."
      >
        <Stage>
          <DateTimePicker
            aria-label="Fecha ao completar"
            closeOnSelect="auto"
            defaultOpen
            defaultValue={CONSULTATION}
            locale="pt-BR"
            referenceDateTime={REFERENCE}
          />
        </Stage>
      </Scene>
      <Scene
        label="always"
        note="Qualquer prensa que mude o valor fecha o painel, mesmo quando ele já estava inteiro. Para um fluxo onde trocar de dia é uma decisão e não uma exploração."
      >
        <DateTimePicker
          aria-label="Sempre"
          closeOnSelect="always"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          referenceDateTime={REFERENCE}
        />
      </Scene>
      <Scene
        label="never"
        note="O painel só fecha por Escape, por uma prensa fora dele ou pelo gatilho. Para um painel embebido num formulário que confirma noutro sítio — o slot do rodapé existe para isso."
      >
        <DateTimePicker
          aria-label="Nunca"
          closeOnSelect="never"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          referenceDateTime={REFERENCE}
        />
      </Scene>
    </Grid>
  ),
};

export const Seconds: Story = {
  parameters: scenario('seconds'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Meio minuto dentro de uma janela"
        note="O campo escreve cada segundo e a lista oferece um passo de 30 segundos — onze linhas dentro de uma janela limitada, e não as 86 400 que um dia inteiro seria. A guarda é sobre o comprimento da lista, maxOptions, e nunca sobre o tamanho do passo."
      >
        <Stage>
          <DateTimePicker
            aria-label="Segundos"
            defaultOpen
            defaultValue={plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20, 30))}
            granularity="second"
            locale="pt-BR"
            maxTime={plainTime(15, 25)}
            minTime={plainTime(15, 20)}
            referenceDateTime={REFERENCE}
            step={30}
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const Step: Story = {
  parameters: scenario('step'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Contado a partir do limite inferior"
        note="min às 09:07 com um passo de quinze minutos oferece 09:07, 09:22, 09:37 — a regra da própria plataforma para input[type=time], que nenhum painel pesquisado enuncia. Abra e leia as três primeiras linhas."
      >
        <Stage>
          <DateTimePicker
            aria-label="Base"
            defaultOpen
            locale="pt-BR"
            max={plainDateTime(plainDate(2026, 9, 12), plainTime(11, 0))}
            min={plainDateTime(plainDate(2026, 9, 10), plainTime(9, 7))}
            referenceDateTime={REFERENCE}
            step={900}
          />
        </Stage>
      </Scene>
      <Scene
        label="Horários que nenhum passo descreve"
        note="09:00, 09:20, 11:40, 13:45, 16:00. options enuncia-os na ordem do consumidor, e o campo ao lado continua a aceitar qualquer hora entre duas linhas."
      >
        <Stage>
          <DateTimePicker
            aria-label="Horários da clínica"
            defaultOpen
            defaultValue={plainDateTime(plainDate(2026, 9, 10), plainTime(11, 40))}
            locale="pt-BR"
            options={[
              plainTime(9, 0),
              plainTime(9, 20),
              plainTime(11, 40),
              plainTime(13, 45),
              plainTime(16, 0),
            ]}
            referenceDateTime={REFERENCE}
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const RangeBounds: Story = {
  parameters: scenario('range-bounds'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="O primeiro dia é parcial"
        note="No próprio dia de min a lista começa em min e não em minTime: 11 de setembro abre às 14:00 e não às 09:00. Os dois pares valem ao mesmo tempo, e é esta combinação que a página de validação do MUI regista não conseguir entregar."
      >
        <Stage>
          <DateTimePicker
            aria-label="Primeiro dia"
            defaultOpen
            defaultValue={plainDateTime(plainDate(2026, 9, 11), plainTime(14, 0))}
            locale="pt-BR"
            referenceDateTime={REFERENCE}
            step={3600}
            {...CLINIC}
          />
        </Stage>
      </Scene>
      <Scene
        label="Um dia do meio corre a janela inteira"
        note="15 de setembro vai das 09:00 às 18:00 — a janela que se repete todos os dias dentro do intervalo. O dia de max corre até 12:00 e para aí, e nenhum dos dois limites precisa de ser reescrito por dia."
      >
        <Stage>
          <DateTimePicker
            aria-label="Dia do meio"
            defaultOpen
            defaultValue={plainDateTime(plainDate(2026, 9, 15), plainTime(10, 0))}
            locale="pt-BR"
            referenceDateTime={REFERENCE}
            step={3600}
            {...CLINIC}
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const DayWindow: Story = {
  parameters: scenario('day-window'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="O sábado fecha às 13:00"
        note="A lista responde ao dia onde o leitor está, e não ao dia já escolhido. Ande com as setas pelo mês e a coluna recalcula-se debaixo do cursor. O disabledTime(date) do Ant só é chamado para uma data já confirmada, e não consegue dizer isto."
      >
        <Stage>
          <DateTimePicker
            aria-label="Sábado"
            defaultOpen
            defaultValue={plainDateTime(plainDate(2026, 9, 12), plainTime(10, 0))}
            isTimeUnavailable={(time: PlainTime, date: PlainDate) =>
              isSaturday(date) && time.hour >= 13
            }
            locale="pt-BR"
            referenceDateTime={REFERENCE}
            step={3600}
          />
        </Stage>
      </Scene>
      <Scene
        label="Um dia sem hora nenhuma"
        note="Uma frase em vez de uma caixa vazia. O MUI não desenha nada aqui e o Ant desenha uma coluna vazia, e as duas coisas leem-se como um componente partido."
      >
        <Stage>
          <DateTimePicker
            aria-label="Dia fechado"
            defaultOpen
            defaultValue={plainDateTime(plainDate(2026, 9, 12), plainTime(10, 0))}
            isTimeUnavailable={(_time: PlainTime, date: PlainDate) => isSaturday(date)}
            locale="pt-BR"
            messages={{ empty: 'Não há horário disponível neste dia.' }}
            referenceDateTime={REFERENCE}
            step={3600}
            unavailableOptions="hide"
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const Unavailable: Story = {
  parameters: scenario('unavailable'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Desactivar: o predefinido"
        note="A hora de almoço continua na lista, recusada e legível. Uma lista que apaga linhas em silêncio é uma lista cujo passo o leitor não consegue inferir."
      >
        <Stage>
          <DateTimePicker
            aria-label="Almoço desactivado"
            defaultOpen
            defaultValue={CONSULTATION}
            isTimeUnavailable={(time: PlainTime) => time.hour === 12}
            locale="pt-BR"
            referenceDateTime={REFERENCE}
            step={1800}
            unavailableOptions="disable"
          />
        </Stage>
      </Scene>
      <Scene
        label="Esconder: a escolha do consumidor"
        note="Para uma agenda com dezenas de linhas recusadas, onde o ruído custa mais do que o passo. Um dia inteiro sem horas continua a receber a frase e não uma coluna vazia."
      >
        <Stage>
          <DateTimePicker
            aria-label="Almoço escondido"
            defaultOpen
            defaultValue={CONSULTATION}
            isTimeUnavailable={(time: PlainTime) => time.hour === 12}
            locale="pt-BR"
            referenceDateTime={REFERENCE}
            step={1800}
            unavailableOptions="hide"
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const Now: Story = {
  parameters: scenario('now'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Uma prensa, as duas metades"
        note="Agora escreve a data e a hora de uma vez, e é o caso zero da própria expressão relativa do campo — desenhado como um controlo rotulado, para o leitor que nunca descobre que + abre uma. Carrega o relógio, que é a segunda das duas marcas da família."
      >
        <Stage>
          <DateTimePicker
            aria-label="Agora"
            defaultOpen
            locale="pt-BR"
            messages={{ now: 'Agora' }}
            referenceDateTime={REFERENCE}
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const Relative: Story = {
  parameters: scenario('relative'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Escrever com o painel aberto"
        note="Alt+Seta para baixo abre o painel e deixa o foco no campo, portanto cada tecla que os segmentos tinham continua a funcionar — inclusive +, que abre a expressão de duração. Escape é encenado: abandona primeiro a expressão, e o painel fica."
      >
        <Stage>
          <DateTimePicker
            aria-label="Expressão"
            defaultOpen
            locale="pt-BR"
            referenceDateTime={REFERENCE}
            relative
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const Presets: Story = {
  parameters: scenario('presets'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Os atalhos do consumidor"
        note="Ficam na banda de topo, ao lado de Agora, e quebram dentro da largura do painel em vez de a esticarem: a banda desenha-se à largura do painel e não contribui nada para ela. Esta família não traz uma lista própria — «amanhã às nove» é um relógio de negócio, e adivinhá-lo seria adivinhar uma indústria."
      >
        <Stage>
          <DateTimePicker
            aria-label="Com atalhos"
            defaultOpen
            locale="pt-BR"
            presets={
              <>
                <Button size="sm" variant="ghost">
                  Amanhã 09:00
                </Button>
                <Button size="sm" variant="ghost">
                  Segunda 14:00
                </Button>
              </>
            }
            referenceDateTime={REFERENCE}
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Os três degraus do controlo"
        note="Tipo, altura e recheio interno, e a caixa do gatilho segue cada um. Um picker dentro de um field toma o degrau do field."
      >
        <DateTimePicker aria-label="sm" defaultValue={CONSULTATION} locale="pt-BR" size="sm" />
        <DateTimePicker aria-label="md" defaultValue={CONSULTATION} locale="pt-BR" size="md" />
        <DateTimePicker aria-label="lg" defaultValue={CONSULTATION} locale="pt-BR" size="lg" />
      </Scene>
      <Scene
        label="O painel segue o degrau"
        note="As linhas da lista e o tecto da coluna descem juntos, para que um painel denso não fique com onze linhas de altura de uma e o mesmo número de linhas visíveis."
      >
        <Stage>
          <DateTimePicker
            aria-label="Painel pequeno"
            defaultOpen
            defaultValue={CONSULTATION}
            locale="pt-BR"
            referenceDateTime={REFERENCE}
            size="sm"
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const Variants: Story = {
  parameters: scenario('variants'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="outline e subtle"
        note="A moldura é a do campo, portanto um formulário com um nome e um datetime mostra a mesma moldura duas vezes. subtle troca a borda por uma superfície."
      >
        <DateTimePicker
          aria-label="outline"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          variant="outline"
        />
        <DateTimePicker
          aria-label="subtle"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          variant="subtle"
        />
      </Scene>
      <Scene
        label="plain"
        note="Nada até ser usado, que é o que uma tabela densa de marcações precisa. O foco e o hover continuam a desenhar-se, porque um controlo invisível que não responde não é um controlo."
      >
        <DateTimePicker
          aria-label="plain"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          variant="plain"
        />
      </Scene>
    </Grid>
  ),
};

export const Placement: Story = {
  parameters: scenario('placement'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Por baixo, alinhado ao início"
        note="O predefinido. A camada chega pelo eixo em que abre e nunca pelo eixo inline, e data-placement diz o que o posicionador resolveu."
      >
        <Stage>
          <DateTimePicker
            aria-label="Em baixo"
            defaultOpen
            defaultValue={CONSULTATION}
            locale="pt-BR"
            placement="bottom-start"
            referenceDateTime={REFERENCE}
          />
        </Stage>
      </Scene>
      <Scene
        label="Uma preferência que o posicionador vira"
        note="Aqui o controlo pede top-start e não tem espaço nenhum por cima dentro desta caixa, portanto a camada resolve-se por baixo e data-placement diz bottom-start. A preferência é um pedido e não uma garantia, e é o mesmo que acontece a um controlo no topo de uma página."
      >
        <Stage>
          <DateTimePicker
            aria-label="Em cima"
            defaultOpen
            defaultValue={CONSULTATION}
            locale="pt-BR"
            placement="top-start"
            referenceDateTime={REFERENCE}
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Só leitura e desactivado"
        note="Só leitura continua focável e copiável e nunca se parece com desactivado; o gatilho fica, e não abre. Desactivado não responde a tecla nem a ponteiro, e o gatilho é um button desactivado."
      >
        <DateTimePicker
          aria-label="Só leitura"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          readOnly
        />
        <DateTimePicker
          aria-label="Desactivado"
          clearable
          defaultValue={CONSULTATION}
          disabled
          locale="pt-BR"
        />
      </Scene>
      <Scene
        label="Obrigatório e inválido"
        note="Obrigatório chega ao grupo do campo como aria-required. Inválido mantém o anel de foco e muda-lhe a cor — e continua inválido quando o valor cai fora de qualquer um dos dois pares de limites, diga o consumidor o que disser."
      >
        <DateTimePicker
          aria-label="Obrigatório"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          required
        />
        <DateTimePicker aria-label="Inválido" defaultValue={CONSULTATION} invalid locale="pt-BR" />
      </Scene>
      <Scene
        label="Escolhido, corrente e apontado"
        note="Na lista, a linha escolhida ganha ao realce, o realce ganha ao ponteiro, e cada regra mais fraca é guardada por especificidade e não por ordem de escrita. A hora corrente do dia leva uma marca discreta que não compete com nenhuma das outras duas."
        span="full"
      >
        <Stage>
          <DateTimePicker
            aria-label="Estados da lista"
            defaultOpen
            defaultValue={CONSULTATION}
            locale="pt-BR"
            openTo="time"
            referenceDateTime={REFERENCE}
            step={1800}
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

export const Forms: Story = {
  parameters: scenario('forms'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Uma linha de formulário a sério"
        note="O valor chega a um post de formulário como YYYY-MM-DDTHH:mm:ss, pelo input escondido do próprio campo — sem adaptador e sem ninguém a ler o controlo."
      >
        <Field>
          <FieldLabel>Início da consulta</FieldLabel>
          <DateTimePicker
            defaultValue={CONSULTATION}
            locale="pt-BR"
            name="inicio"
            referenceDateTime={REFERENCE}
            required
          />
          <FieldDescription>Horário de atendimento: das 9h às 18h.</FieldDescription>
        </Field>
      </Scene>
      <Scene
        label="Com erro"
        note="O field à volta fornece o rótulo, a descrição e o erro, e o controlo toma daí o tamanho, o estado desactivado e a validade — a não ser que declare os seus."
      >
        <Field invalid>
          <FieldLabel>Início da consulta</FieldLabel>
          <DateTimePicker
            defaultValue={plainDateTime(plainDate(2026, 9, 15), plainTime(20, 0))}
            locale="pt-BR"
            name="inicio"
            referenceDateTime={REFERENCE}
            {...CLINIC}
          />
          <FieldError>Escolha um horário dentro do expediente.</FieldError>
        </Field>
      </Scene>
    </Grid>
  ),
};

export const Narrow: Story = {
  parameters: scenario('narrow'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="O controlo debaixo de 320 pixels"
        note="A linha de sete campos quebra entre as duas metades e nunca dentro de uma, e o gatilho fica onde estava: no fim do campo, do lado da leitura."
      >
        <Measure>
          <DateTimePicker aria-label="Estreito" defaultValue={CONSULTATION} locale="pt-BR" />
        </Measure>
      </Scene>
      <Scene
        label="O painel numa coluna"
        note="As duas superfícies quebram na ordem do próprio valor, sem nada escondido e sem interruptor nenhum desenhado. A coluna das horas ocupa a linha inteira onde cai, para que se leia como uma secção e não como uma tira — uma só regra de flex responde às duas arrumações."
      >
        <div className="slotted-demo-viewport" data-size="screen">
          <Measure>
            <DateTimePicker
              aria-label="Painel estreito"
              defaultOpen
              defaultValue={CONSULTATION}
              locale="pt-BR"
              referenceDateTime={REFERENCE}
            />
          </Measure>
        </div>
      </Scene>
    </Grid>
  ),
};

function HandleDemo() {
  const handle = useRef<DateTimePickerHandle | null>(null);

  return (
    <>
      <DateTimePicker
        aria-label="Com handle"
        clearable
        defaultValue={CONSULTATION}
        locale="pt-BR"
        ref={handle}
        referenceDateTime={REFERENCE}
      />
      <div className="slotted-demo-row">
        <Button onClick={() => handle.current?.focus()} size="sm" variant="outline">
          Focar
        </Button>
        <Button onClick={() => handle.current?.open()} size="sm" variant="outline">
          Abrir
        </Button>
        <Button onClick={() => handle.current?.close()} size="sm" variant="outline">
          Fechar
        </Button>
      </div>
    </>
  );
}

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Uma decisão, uma vez"
        note="O provider fixa o relógio, o passo e a colocação para tudo o que está por baixo, e o SlottedProvider a língua e cada rótulo. Um controlo que declare qualquer um deles continua a ganhar — é a segunda linha aqui."
      >
        <SlottedProvider catalogs={{ 'pt-BR': PT_BR }} locale="pt-BR">
          <DateTimePickerDefaultsProvider step={1800}>
            <DateTimePicker aria-label="Do provider" defaultValue={CONSULTATION} />
            <DateTimePicker aria-label="Com passo próprio" defaultValue={CONSULTATION} step={900} />
          </DateTimePickerDefaultsProvider>
        </SlottedProvider>
      </Scene>
      <Scene
        label="Uma linha desenhada pelo consumidor"
        note="renderOption desenha o que está dentro da linha; a linha continua a ser da família — o papel, os estados, o teclado e o alvo de toque. Aqui, quantas vagas restam ao lado da hora."
      >
        <Stage>
          <DateTimePicker
            aria-label="Linha própria"
            defaultOpen
            defaultValue={CONSULTATION}
            locale="pt-BR"
            openTo="time"
            referenceDateTime={REFERENCE}
            renderOption={({ label, time }) => (
              <>
                <span>{label}</span>
                <span>{time.hour % 3} vagas</span>
              </>
            )}
            step={1800}
          />
        </Stage>
      </Scene>
      <Scene
        label="As acções que não se declaram"
        note="focus() põe o leitor no primeiro segmento do campo, e open() e close() movem o painel sem uma prensa. Nada mais: uma escotilha de escape é para o que não cabe numa prop."
      >
        <HandleDemo />
      </Scene>
      <Scene
        label="Um rodapé do consumidor"
        note="A família não precisa de nenhum — a completude do valor fecha o painel — e o slot está cá para um fluxo que queira mesmo uma confirmação deliberada."
      >
        <Stage>
          <DateTimePicker
            aria-label="Com rodapé"
            closeOnSelect="never"
            defaultOpen
            defaultValue={CONSULTATION}
            footer={
              <Button size="sm" variant="solid">
                Confirmar
              </Button>
            }
            locale="pt-BR"
            referenceDateTime={REFERENCE}
          />
        </Stage>
      </Scene>
    </Grid>
  ),
};

function KeyboardDemo() {
  const [pressed, setPressed] = useState<string[]>([]);

  return (
    <>
      <DateTimePicker
        aria-label="Teclado"
        defaultValue={CONSULTATION}
        locale="pt-BR"
        onKeyDown={(event) => setPressed((keys) => [event.key, ...keys].slice(0, 6))}
        referenceDateTime={REFERENCE}
      />
      <p className="slotted-demo-scene__note">
        {pressed.length === 0
          ? 'Escreva no campo ou abra o painel: cada tecla passa primeiro pelo seu próprio handler.'
          : pressed.join(' · ')}
      </p>
    </>
  );
}

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Duas paragens de Tab, e não quarenta e três"
        note="Só um elemento da grelha está na sequência de Tab, como o padrão de grelha exige, e a listbox é uma paragem pela mesma razão. Com o painel aberto, Tab fica contido dentro da camada."
      >
        <Stage>
          <DateTimePicker
            aria-label="Tab"
            defaultOpen
            defaultValue={CONSULTATION}
            locale="pt-BR"
            referenceDateTime={REFERENCE}
          />
        </Stage>
      </Scene>
      <Scene
        label="O handler do consumidor corre primeiro"
        note="A família compõe com o handler em vez de o substituir, no controlo, no gatilho e na lista. Alt+Seta para baixo abre o painel a partir de um segmento; do gatilho, Seta para baixo abre-o e leva o foco à superfície que openTo nomeia."
      >
        <KeyboardDemo />
      </Scene>
    </Grid>
  ),
};
