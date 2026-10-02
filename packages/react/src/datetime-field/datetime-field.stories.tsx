import { plainDate, plainDateTime, plainTime } from '@slotted/core/date';
import type { PlainDate, PlainTime } from '@slotted/core/date';
import { PT_BR } from '@slotted/core/i18n/pt-BR';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarClock } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '../button';
import { Field, FieldDescription, FieldError, FieldLabel } from '../field';
import { SlottedProvider } from '../i18n';
import { Icon } from '../icon';
import { DateTimeField } from './datetime-field';
import { DateTimeFieldDefaultsProvider } from './datetime-field-defaults';
import { Grid, Measure, Scene } from './datetime-field-demo';
import { REACT_DATE_TIME_FIELD_DOCS, REACT_DATE_TIME_FIELD_TOKENS } from './datetime-field.docs';
import type { DateTimeFieldChangeRequest, DateTimeFieldHandle } from './datetime-field.types';

/** A consultation on a Thursday afternoon, and the clinic it belongs to. */
const CONSULTATION = plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20));
const EARLY = plainDateTime(plainDate(2026, 9, 10), plainTime(8, 30));
/** Stated rather than read from the clock, so every scene reads the same twice. */
const REFERENCE = plainDateTime(plainDate(2026, 9, 10), plainTime(14, 40));
const LAST_NIGHT_OF_THE_MONTH = plainDateTime(plainDate(2026, 9, 30), plainTime(23, 0));
const END_OF_JANUARY = plainDateTime(plainDate(2026, 1, 31), plainTime(15, 20));

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_DATE_TIME_FIELD_DOCS.dateTimeField.scenes, {
    playground: Playground,
    locale: Locale,
    'hour-cycle': HourCycle,
    granularity: Granularity,
    incomplete: Incomplete,
    relative: Relative,
    'rolls-day': RollsDay,
    sizes: Sizes,
    variants: Variants,
    range: Range,
    unavailable: Unavailable,
    narrow: Narrow,
    states: States,
    clear: Clear,
    adornments: Adornments,
    forms: Forms,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const meta = {
  title: 'Components/DateTimeField',
  component: DateTimeField,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'DateTime Field',
        description:
          'A date and a time typed as one value, one field at a time, in the order the reader’s own locale writes both halves — and, when the reader would rather say "two days from now", a duration resolved in view before it is accepted. It is not a date field beside a time field: one group, one value, and one run of typing that crosses from the year into the hour. The half that is still missing is said out loud, which no surveyed implementation can do.',
        framework: 'React',
        ...REACT_DATE_TIME_FIELD_DOCS.dateTimeField,
        tokens: REACT_DATE_TIME_FIELD_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof DateTimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    clearable: true,
    granularity: 'minute',
    locale: 'pt-BR',
    relative: true,
    size: 'md',
    variant: 'outline',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Field>
        <FieldLabel>Início da consulta</FieldLabel>
        <DateTimeField {...args} name="inicio" />
        <FieldDescription>A consulta começa nesta data e hora.</FieldDescription>
      </Field>
    </div>
  ),
};

export const Locale: Story = {
  parameters: scenario('locale'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="pt-BR"
        note="Dia, mês, ano e depois a hora, com uma vírgula entre as duas metades — tudo vindo de um só Intl.DateTimeFormat, e nenhuma string de formato escrita à mão."
      >
        <DateTimeField aria-label="Início" defaultValue={CONSULTATION} locale="pt-BR" />
        <DateTimeField aria-label="Início vazio" locale="pt-BR" />
      </Scene>
      <Scene
        label="en-US"
        note="The month leads, and a sixth field appears: the day period, whose spoken value is AM or PM because 0 and 1 are not names."
      >
        <DateTimeField aria-label="Starts" defaultValue={CONSULTATION} locale="en-US" />
        <DateTimeField aria-label="Empty" locale="en-US" />
      </Scene>
      <Scene
        label="ja-JP"
        note="O ano vem primeiro e a fronteira entre as metades é só um espaço — por isso nada é desenhado ali e o intervalo da própria linha faz a separação."
      >
        <DateTimeField aria-label="開始" defaultValue={CONSULTATION} locale="ja-JP" />
        <DateTimeField aria-label="空" locale="ja-JP" />
      </Scene>
      <Scene
        label="fr-FR"
        note="Mesma ordem do pt-BR e fronteira diferente: um espaço em vez da vírgula. Duas famílias separadas nunca saberiam qual das duas o locale escreve."
      >
        <DateTimeField aria-label="Début" defaultValue={CONSULTATION} locale="fr-FR" />
        <DateTimeField aria-label="Vide" locale="fr-FR" />
      </Scene>
    </Grid>
  ),
};

export const HourCycle: Story = {
  parameters: scenario('hour-cycle'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Twelve, in en-US"
        note="h12: the hour runs 1 to 12 and midnight is written 12 AM. Step the hour past twelve and it wraps inside its own field rather than moving the day period."
      >
        <DateTimeField
          aria-label="Twelve"
          defaultValue={plainDateTime(plainDate(2026, 9, 10), plainTime(0, 30))}
          hourCycle={12}
          locale="en-US"
        />
      </Scene>
      <Scene
        label="Twelve, in ja-JP"
        note="h11: the same axis, and the hour runs 0 to 11 with 午前 written before it. A boolean would have put 12 there, which is wrong in a way nobody notices until a Japanese reader reports it."
      >
        <DateTimeField
          aria-label="Eleven"
          defaultValue={plainDateTime(plainDate(2026, 9, 10), plainTime(0, 30))}
          hourCycle={12}
          locale="ja-JP"
        />
      </Scene>
      <Scene
        label="Twenty-four"
        note="h23: no day period at all, and the hour runs 0 to 23. The field draws one fewer spin button, and the group’s name still says the whole value."
      >
        <DateTimeField
          aria-label="Twenty-four"
          defaultValue={plainDateTime(plainDate(2026, 9, 10), plainTime(0, 30))}
          hourCycle={24}
          locale="en-US"
        />
      </Scene>
      <Scene
        label="What the locale wants"
        note="Unset, each control asks Intl and gets what the reader’s own locale writes — which is the answer a form should ship with."
      >
        <DateTimeField aria-label="Locale pt" defaultValue={CONSULTATION} locale="pt-BR" />
        <DateTimeField aria-label="Locale en" defaultValue={CONSULTATION} locale="en-US" />
      </Scene>
    </Grid>
  ),
};

export const Granularity: Story = {
  parameters: scenario('granularity'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Three depths, and a whole date under each"
        note="Uma hora para um turno, um minuto para quase tudo, um segundo para um registo de auditoria. A metade da data nunca encolhe: um datetime sem dia é uma data, e essa família é date-field."
      >
        <DateTimeField
          aria-label="Turno"
          defaultValue={CONSULTATION}
          granularity="hour"
          locale="pt-BR"
        />
        <DateTimeField
          aria-label="Consulta"
          defaultValue={CONSULTATION}
          granularity="minute"
          locale="pt-BR"
        />
        <DateTimeField
          aria-label="Registo"
          defaultValue={plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20, 45))}
          granularity="second"
          locale="pt-BR"
        />
      </Scene>
    </Grid>
  ),
};

function IncompleteDemo() {
  const [request, setRequest] = useState<DateTimeFieldChangeRequest | null>(null);

  return (
    <>
      <DateTimeField
        aria-label="Início da consulta"
        locale="pt-BR"
        onValueChange={(_value, next) => setRequest(next)}
        referenceDateTime={REFERENCE}
      />
      <p className="slotted-demo-scene__note">
        {request === null
          ? 'Escreva só o dia e saia do campo: a moldura avisa e o valor continua nulo.'
          : `incomplete: ${String(request.incomplete)} · dia escrito: ${String(request.segments.day)}`}
      </p>
    </>
  );
}

export const Incomplete: Story = {
  parameters: scenario('incomplete'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Falta a hora"
        note="O dia está escrito e a hora não. O valor é nulo — o que qualquer implementação reporta — e qual metade falta está no data-incomplete da moldura, que é o que nenhuma delas sabe dizer."
      >
        <DateTimeField
          aria-label="Só a data"
          data-incomplete="time"
          defaultValue={undefined}
          locale="pt-BR"
          referenceDateTime={REFERENCE}
        />
        <IncompleteDemo />
      </Scene>
      <Scene
        label="Vazio não é incompleto"
        note="Um campo em que ninguém escreveu nada não está por acabar, e uma moldura que avisasse aqui marcaria todos os campos de um formulário recém-aberto."
      >
        <DateTimeField aria-label="Vazio" locale="pt-BR" referenceDateTime={REFERENCE} />
      </Scene>
    </Grid>
  ),
};

export const Relative: Story = {
  parameters: scenario('relative'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A gramática"
        note="+40 são quarenta minutos, +40m o mesmo, 1h30 e 1:30 uma hora e meia, +2d dois dias, +1w uma semana, 0 e = agora. A âncora é sempre agora, nunca o valor que o campo já tem."
      >
        <DateTimeField aria-label="Duração" locale="pt-BR" referenceDateTime={REFERENCE} />
      </Scene>
      <Scene
        label="Resolvida à vista"
        note="O que a expressão resolve é desenhado ao lado antes de Enter aceitar seja o que for, e Escape devolve os segmentos exactamente como estavam. Nenhuma implementação pesquisada lê uma duração."
      >
        <DateTimeField
          aria-label="Pré-visualização"
          locale="pt-BR"
          messages={{ duration: 'Data e hora como duração a partir de agora' }}
          referenceDateTime={REFERENCE}
        />
      </Scene>
      <Scene
        label="Nunca é a única entrada"
        note="Todo o valor que a expressão escreve é alcançável escrevendo os segmentos e pelas setas. relative={false} tira o modo, e nada se perde além do atalho."
      >
        <DateTimeField
          aria-label="Sem expressão"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          relative={false}
        />
      </Scene>
      <Scene
        label="Colar também abre"
        note="Um texto colado é lido primeiro na forma do locale, depois em ISO 8601 e por fim como duração — portanto colar +2d faz o mesmo que escrevê-lo."
      >
        <DateTimeField aria-label="Colar" locale="pt-BR" referenceDateTime={REFERENCE} />
      </Scene>
    </Grid>
  ),
};

export const RollsDay: Story = {
  parameters: scenario('rolls-day'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Onde a bandeira do time-field é gasta"
        note="Escreva +2d ou +90m na última noite do mês. Lá, um PlainTime não tem dia e a família só pode levantar crossesMidnight; aqui o dia existe, a data muda e a pré-visualização escreve-a destacada da hora ao lado."
      >
        <DateTimeField
          aria-label="Fim do mês"
          locale="pt-BR"
          referenceDateTime={LAST_NIGHT_OF_THE_MONTH}
        />
        <DateTimeField aria-label="Meio da tarde" locale="pt-BR" referenceDateTime={REFERENCE} />
      </Scene>
    </Grid>
  ),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Três passos"
        note="A altura, o tipo e o glifo movem-se juntos. Um controlo dentro de um field toma o passo do field, portanto um formulário não acaba com um field pequeno a segurar um controlo médio na mesma linha."
      >
        <DateTimeField
          aria-label="Pequeno"
          clearable
          defaultValue={CONSULTATION}
          locale="pt-BR"
          size="sm"
        />
        <DateTimeField
          aria-label="Médio"
          clearable
          defaultValue={CONSULTATION}
          locale="pt-BR"
          size="md"
        />
        <DateTimeField
          aria-label="Grande"
          clearable
          defaultValue={CONSULTATION}
          locale="pt-BR"
          size="lg"
        />
      </Scene>
    </Grid>
  ),
};

export const Variants: Story = {
  parameters: scenario('variants'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Num formulário"
        note="outline toma o chão em que está; subtle afunda-se na página. Os dois são a mesma moldura que text-field desenha, para que um formulário com um nome e uma data mostre uma moldura duas vezes e não duas molduras."
      >
        <DateTimeField
          aria-label="Contorno"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          variant="outline"
        />
        <DateTimeField
          aria-label="Discreto"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          variant="subtle"
        />
      </Scene>
      <Scene
        label="Numa linha de tabela"
        note="plain não mostra nada até ser usado, que é o que uma tabela densa de consultas precisa: uma moldura por linha seria uma grelha de caixas."
        layout="stack"
      >
        <div className="slotted-demo-rows">
          <span>Ana Ribeiro</span>
          <DateTimeField
            aria-label="Consulta de Ana Ribeiro"
            defaultValue={CONSULTATION}
            locale="pt-BR"
            variant="plain"
          />
          <span>Bruno Sá</span>
          <DateTimeField
            aria-label="Consulta de Bruno Sá"
            defaultValue={EARLY}
            locale="pt-BR"
            variant="plain"
          />
        </div>
      </Scene>
    </Grid>
  ),
};

const CLINIC = {
  max: plainDateTime(plainDate(2026, 12, 20), plainTime(12, 0)),
  maxTime: plainTime(18, 0),
  min: plainDateTime(plainDate(2026, 9, 11), plainTime(14, 0)),
  minTime: plainTime(9, 0),
};

export const Range: Story = {
  parameters: scenario('range'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Dentro das duas cercas"
        note="11 de setembro às 14:00 é o primeiro horário que a agenda aceita, e 15 de setembro às 10:00 está dentro da janela que se repete todos os dias. Os dois pares valem ao mesmo tempo."
      >
        <DateTimeField
          aria-label="Dentro"
          defaultValue={plainDateTime(plainDate(2026, 9, 15), plainTime(10, 0))}
          locale="pt-BR"
          {...CLINIC}
        />
      </Scene>
      <Scene
        label="Fora da janela do dia"
        note="20:00 num dia dentro do intervalo é recusado por maxTime, mesmo estando muito antes de max. É esta combinação que a página de validação do MUI regista não conseguir entregar."
      >
        <DateTimeField
          aria-label="Fora da janela"
          defaultValue={plainDateTime(plainDate(2026, 9, 15), plainTime(20, 0))}
          locale="pt-BR"
          {...CLINIC}
        />
      </Scene>
      <Scene
        label="Antes do início do intervalo"
        note="10 de setembro às 15:20 está dentro da janela diária e antes de min — recusado pelo par do valor inteiro, e não pelo da janela."
      >
        <DateTimeField aria-label="Antes" defaultValue={CONSULTATION} locale="pt-BR" {...CLINIC} />
      </Scene>
      <Scene
        label="O primeiro dia é parcial"
        note="No próprio dia de min a janela começa em min e não em minTime — a regra que o MDN enuncia para a plataforma e que nenhum script pesquisado implementa."
      >
        <DateTimeField
          aria-label="Primeiro dia"
          defaultValue={plainDateTime(plainDate(2026, 9, 11), plainTime(10, 0))}
          locale="pt-BR"
          {...CLINIC}
        />
      </Scene>
    </Grid>
  ),
};

const isSunday = (date: PlainDate) =>
  new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() === 0;

export const Unavailable: Story = {
  parameters: scenario('unavailable'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Um domingo fechado"
        note="isDateUnavailable responde por um dia inteiro. É a pergunta que uma célula de calendário faz, e não se deriva de um predicado de datetime sem percorrer cada passo daquele dia."
      >
        <DateTimeField
          aria-label="Domingo"
          defaultValue={plainDateTime(plainDate(2026, 9, 13), plainTime(10, 0))}
          isDateUnavailable={isSunday}
          locale="pt-BR"
        />
      </Scene>
      <Scene
        label="Uma hora de almoço"
        note="isTimeUnavailable recebe também o dia, para que um sábado feche mais cedo do que uma terça. Dois predicados, porque são duas perguntas."
      >
        <DateTimeField
          aria-label="Almoço"
          defaultValue={plainDateTime(plainDate(2026, 9, 15), plainTime(12, 30))}
          isTimeUnavailable={(time: PlainTime) => time.hour === 12}
          locale="pt-BR"
        />
      </Scene>
    </Grid>
  ),
};

export const Narrow: Story = {
  parameters: scenario('narrow'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A linha quebra entre as metades"
        note="Sete campos não cabem numa coluna estreita em locale nenhum, e a linha quebra entre as duas caixas e nunca dentro de uma. Sem container query: a quebra vale em qualquer largura, portanto nenhum limiar tem de adivinhar onde o conteúdo deixa de caber."
      >
        <Measure>
          <DateTimeField
            aria-label="Estreito"
            defaultValue={plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20, 45))}
            granularity="second"
            locale="pt-BR"
          />
        </Measure>
      </Scene>
      <Scene
        label="A vírgula fica no fim da linha"
        note="A fronteira que o locale escreve é desenhada no fim da primeira metade, e não entre as duas — por isso uma quebra deixa-a onde uma vírgula numa frase ficaria."
      >
        <Measure>
          <DateTimeField aria-label="Narrow" defaultValue={CONSULTATION} locale="en-US" />
        </Measure>
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
        note="Só leitura continua focável e copiável e nunca se parece com desactivado: o valor ainda é real e ainda é submetido. Desactivado não responde a tecla nem a ponteiro e continua legível."
      >
        <DateTimeField
          aria-label="Só leitura"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          readOnly
        />
        <DateTimeField
          aria-label="Desactivado"
          clearable
          defaultValue={CONSULTATION}
          disabled
          locale="pt-BR"
        />
      </Scene>
      <Scene
        label="Obrigatório e inválido"
        note="Obrigatório chega ao grupo como aria-required. Inválido mantém o anel de foco e muda-lhe a cor, porque um controlo que reporta um erro não deve deixar de parecer errado quando o ponteiro passa por cima."
      >
        <DateTimeField
          aria-label="Obrigatório"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          required
        />
        <DateTimeField aria-label="Inválido" defaultValue={CONSULTATION} invalid locale="pt-BR" />
      </Scene>
      <Scene
        label="Incompleto é mais baixo do que inválido"
        note="Um tom de aviso, um degrau abaixo do perigo que o valor recusado recebe — porque nada do que o leitor escreveu está errado, apenas por acabar. E cede a inválido quando os dois são verdade."
      >
        <DateTimeField
          aria-label="Incompleto"
          data-incomplete="time"
          locale="pt-BR"
          referenceDateTime={REFERENCE}
        />
      </Scene>
      <Scene
        label="O dia que um mês curto não segurou"
        note="31 de janeiro a passar para fevereiro é 28, e a passar outra vez é 31 de março — o dia pedido sobrevive ao mês que não o comportou. Nenhuma implementação pesquisada faz isto."
      >
        <DateTimeField aria-label="Janeiro" defaultValue={END_OF_JANUARY} locale="pt-BR" />
      </Scene>
    </Grid>
  ),
};

export const Clear: Story = {
  parameters: scenario('clear'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Um botão, as duas metades"
        note="Não há controlo que limpe um lado só: meia metade não é um valor que esta família segure. O foco volta ao primeiro segmento, para que o leitor recomece sem procurar o rato."
      >
        <DateTimeField
          aria-label="Com valor"
          clearable
          defaultValue={CONSULTATION}
          locale="pt-BR"
          messages={{ clear: 'Limpar' }}
        />
      </Scene>
      <Scene
        label="Só quando há o que limpar"
        note="O botão só aparece com algo escrito e com o controlo editável, para que a moldura não guarde um espaço que nunca é usado."
      >
        <DateTimeField aria-label="Vazio" clearable locale="pt-BR" />
        <DateTimeField
          aria-label="Só leitura"
          clearable
          defaultValue={CONSULTATION}
          locale="pt-BR"
          readOnly
        />
      </Scene>
    </Grid>
  ),
};

export const Adornments: Story = {
  parameters: scenario('adornments'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Uma marca e um fuso"
        note="Os dois slots têm nome de direcção de leitura e não de lado, portanto a mesma marcação põe a marca antes do valor nas duas direcções. Qualquer ícone dentro deles é dimensionado pela escala de glifos do controlo."
      >
        <DateTimeField
          aria-label="Com marca"
          defaultValue={CONSULTATION}
          end={<span>UTC−3</span>}
          locale="pt-BR"
          start={
            <Icon>
              <CalendarClock aria-hidden />
            </Icon>
          }
        />
      </Scene>
      <Scene
        label="Onde o picker põe o gatilho"
        note="O slot do fim é exactamente onde datetime-picker põe o seu botão, que é como o picker compõe esta família sem redesenhar nada dela."
      >
        <DateTimeField
          aria-label="Com acção"
          clearable
          defaultValue={CONSULTATION}
          end={
            <Button size="sm" variant="ghost">
              Agora
            </Button>
          }
          locale="pt-BR"
        />
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
        note="O valor chega a um post de formulário como YYYY-MM-DDTHH:mm:ss, que é o formato do próprio input[type=datetime-local] — sem adaptador e sem ninguém a ler o controlo."
      >
        <Field>
          <FieldLabel>Início da consulta</FieldLabel>
          <DateTimeField defaultValue={CONSULTATION} locale="pt-BR" name="inicio" required />
          <FieldDescription>Horário de atendimento: das 9h às 18h.</FieldDescription>
        </Field>
      </Scene>
      <Scene
        label="Com erro"
        note="O field à volta fornece o rótulo, a descrição e o erro, e o controlo toma daí o tamanho, o estado desactivado e a validade — a não ser que declare os seus."
      >
        <Field invalid>
          <FieldLabel>Início da consulta</FieldLabel>
          <DateTimeField
            defaultValue={plainDateTime(plainDate(2026, 9, 15), plainTime(20, 0))}
            locale="pt-BR"
            name="inicio"
            {...CLINIC}
          />
          <FieldError>Escolha um horário dentro do expediente.</FieldError>
        </Field>
      </Scene>
    </Grid>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Um período do dia longo"
        note="es-MX escreve a. m. e p. m., e a caixa é dimensionada pelo mais largo dos dois nomes que o locale usa — não por dois caracteres, que cortariam o primeiro."
      >
        <DateTimeField
          aria-label="Español"
          defaultValue={CONSULTATION}
          hourCycle={12}
          locale="es-MX"
        />
      </Scene>
      <Scene
        label="Direita para a esquerda"
        note="Cada metade é o seu próprio trecho bidireccional, por isso os dígitos leem-se da esquerda para a direita dentro de uma página espelhada. A alternativa foi uma captura que lia 30:14 — uma hora que ninguém escreveu."
      >
        <DateTimeField aria-label="العربية" defaultValue={CONSULTATION} locale="ar-EG" />
      </Scene>
      <Scene
        label="Sete campos e um sistema de numeração próprio"
        note="Os dígitos que o locale escreve são lidos de volta pelo mesmo analisador que os escreveu, em qualquer granularidade."
        layout="block"
      >
        <DateTimeField
          aria-label="日本語"
          defaultValue={plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20, 45))}
          granularity="second"
          locale="ja-JP"
        />
      </Scene>
    </Grid>
  ),
};

function HandleDemo() {
  const handle = useRef<DateTimeFieldHandle | null>(null);

  return (
    <>
      <DateTimeField
        aria-label="Com handle"
        clearable
        defaultValue={CONSULTATION}
        locale="pt-BR"
        ref={handle}
      />
      <div className="slotted-demo-row">
        <Button onClick={() => handle.current?.focus()} size="sm" variant="outline">
          Focar
        </Button>
        <Button onClick={() => handle.current?.clear()} size="sm" variant="outline">
          Limpar
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
        note="O provider fixa o relógio e o fuso para tudo o que está por baixo, e o SlottedProvider a língua e cada rótulo. Um controlo que declare qualquer um deles continua a ganhar — é a segunda linha aqui."
      >
        <SlottedProvider catalogs={{ 'pt-BR': PT_BR }} locale="pt-BR">
          <DateTimeFieldDefaultsProvider hourCycle={24} timeZone="America/Sao_Paulo">
            <DateTimeField aria-label="Do provider" clearable defaultValue={CONSULTATION} />
            <DateTimeField
              aria-label="Com locale próprio"
              defaultValue={CONSULTATION}
              locale="en-US"
            />
          </DateTimeFieldDefaultsProvider>
        </SlottedProvider>
      </Scene>
      <Scene
        label="As acções que não se declaram"
        note="focus() põe o leitor no primeiro segmento e clear() esvazia as duas metades com a razão clear na solicitação. Nada mais: uma escotilha de escape é para o que não cabe numa prop."
      >
        <HandleDemo />
      </Scene>
      <Scene
        label="Substituir o elemento"
        note="render troca o elemento que a moldura desenha e recebe a ref de volta — uma moldura substituída tem de devolver o seu elemento, porque focus() chega aos segmentos através dele."
      >
        <DateTimeField
          aria-label="Como section"
          defaultValue={CONSULTATION}
          locale="pt-BR"
          render={(props) => <section {...props} />}
        />
      </Scene>
    </Grid>
  ),
};

function KeyboardDemo() {
  const [pressed, setPressed] = useState<string[]>([]);

  return (
    <>
      <DateTimeField
        aria-label="Teclado"
        defaultValue={CONSULTATION}
        locale="pt-BR"
        onKeyDown={(event) => setPressed((keys) => [event.key, ...keys].slice(0, 6))}
      />
      <p className="slotted-demo-scene__note">
        {pressed.length === 0
          ? 'Escreva no campo: cada tecla passa primeiro pelo seu próprio handler.'
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
        label="As setas atravessam a fronteira"
        note="Da direita do ano para a hora, e de volta — uma linha e não duas. Dois campos aninhados parariam os dois na fronteira, que é a terceira razão pela qual esta família desenha uma linha só."
      >
        <DateTimeField aria-label="Setas" defaultValue={CONSULTATION} locale="pt-BR" />
      </Scene>
      <Scene
        label="Os passos de página"
        note="PageUp move o ano 10, o mês 5, o dia 5, a hora 3, o minuto 15 e o segundo 15 — cada metade pagina como a sua própria família já pagina. Home e End levam o campo ao seu mínimo e ao seu máximo."
      >
        <DateTimeField
          aria-label="Páginas"
          defaultValue={plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20, 45))}
          granularity="second"
          locale="pt-BR"
        />
      </Scene>
      <Scene
        label="O handler do consumidor corre primeiro"
        note="A família compõe com o handler em vez de o substituir, e uma tecla em que ela age é parada — não só defaultada — porque um div com role=spinbutton é invisível a qualquer guarda de atalho."
      >
        <KeyboardDemo />
      </Scene>
    </Grid>
  ),
};
