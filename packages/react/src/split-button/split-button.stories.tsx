import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Save } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Button } from '../button';
import { Grid, Measure, Scene } from '../field/field-demo';
import { MenuContent, MenuItem, MenuRadioItem, MenuSeparator } from '../menu';
import type { MenuHandle } from '../menu';
import { TextField } from '../text-field';
import { Text } from '../typography';
import { SplitButton } from './split-button';
import { SplitButtonDefaultsProvider } from './split-button-defaults';
import {
  SplitButtonChoices,
  SplitButtonMenu,
  SplitButtonMenuTrigger,
  SplitButtonPrimary,
} from './split-button-parts';
import { REACT_SPLIT_BUTTON_DOCS, REACT_SPLIT_BUTTON_TOKENS } from './split-button.docs';
import type { SplitButtonProps } from './split-button.types';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_SPLIT_BUTTON_DOCS.splitButton.scenes, {
    playground: Playground,
    variants: Variants,
    sizes: Sizes,
    remember: Remember,
    loading: Loading,
    states: States,
    width: Width,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  });

const meta = {
  title: 'Components/SplitButton',
  component: SplitButton,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Split Button',
        description:
          'An action and the menu of its alternatives, joined into one shape. Two of button’s controls over menu, each with its own tab stop; the choice in the menu becomes the action only under remember, because a silent update changes what the next click does.',
        framework: 'React',
        ...REACT_SPLIT_BUTTON_DOCS.splitButton,
        tokens: REACT_SPLIT_BUTTON_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The save button most of the page is about: one action, two alternatives. */
function SaveButton({
  label = 'Salvar',
  menuLabel = 'Mais opções de salvar',
  start,
  ...props
}: Partial<SplitButtonProps> & { label?: string; menuLabel?: string; start?: ReactNode }) {
  return (
    <SplitButton {...props}>
      <SplitButtonPrimary {...(start === undefined ? {} : { start })}>{label}</SplitButtonPrimary>
      <SplitButtonMenu>
        <SplitButtonMenuTrigger aria-label={menuLabel} />
        <MenuContent>
          <MenuItem>Salvar como rascunho</MenuItem>
          <MenuItem>Salvar e fechar</MenuItem>
          <MenuSeparator />
          <MenuItem>Salvar como modelo…</MenuItem>
        </MenuContent>
      </SplitButtonMenu>
    </SplitButton>
  );
}

export const Playground: Story = {
  args: {
    disabled: false,
    fullWidth: false,
    loading: false,
    remember: false,
    size: 'md',
    tone: 'accent',
    variant: 'solid',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="stack">
      <SaveButton {...args} />
    </div>
  ),
};

export const Variants: Story = {
  parameters: scenario('variants'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="solid, every tone"
        note="Two filled halves are one rectangle until the seam divides them: the tone’s darkest step on the trigger’s leading edge, which is what Primer, Material and Ant reach for. Hover either half and only its fill moves."
        layout="row"
      >
        <SaveButton />
        <SaveButton label="Exportar" menuLabel="Mais opções de exportação" tone="secondary" />
        <SaveButton label="Aprovar" menuLabel="Mais opções de aprovação" tone="success" />
        <SaveButton label="Suspender" menuLabel="Mais opções de suspensão" tone="warning" />
        <SaveButton label="Excluir" menuLabel="Mais opções de exclusão" tone="danger" />
      </Scene>
      <Scene
        label="outline and ghost"
        note="An outlined pair shares the neutral edge, one line in the shared column; a ghost pair has no edge at all and the trigger reads as part of the action by proximity alone. Both keep the two corners on the ends and none between."
        layout="row"
      >
        <SaveButton variant="outline" />
        <SaveButton
          label="Exportar"
          menuLabel="Mais opções de exportação"
          tone="secondary"
          variant="outline"
        />
        <SaveButton variant="ghost" />
        <SaveButton
          label="Exportar"
          menuLabel="Mais opções de exportação"
          tone="secondary"
          variant="ghost"
        />
      </Scene>
    </Grid>
  ),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="sm, md and lg beside a field of the same step"
        note="The bar is as tall as the field next to it at every step, and the trigger is square from the same height. Switch the density in the toolbar: both move together, and the trigger never shrinks below its own target."
        layout="row"
      >
        <SaveButton size="sm" />
        <Measure>
          <TextField aria-label="Título da fatura" placeholder="Título da fatura" />
        </Measure>
        <SaveButton variant="outline" />
        <SaveButton size="lg" />
      </Scene>
    </Grid>
  ),
};

const STRATEGIES: Record<string, string> = {
  merge: 'Criar um commit de merge',
  squash: 'Squash e merge',
  rebase: 'Rebase e merge',
};

function MergeButton() {
  const [strategy, setStrategy] = useState('squash');
  const [last, setLast] = useState<string>('nenhuma');
  return (
    <div className="slotted-demo-stack">
      <SplitButton onValueChange={setStrategy} remember value={strategy}>
        <SplitButtonPrimary onClick={() => setLast(STRATEGIES[strategy] ?? strategy)}>
          {STRATEGIES[strategy]}
        </SplitButtonPrimary>
        <SplitButtonMenu>
          <SplitButtonMenuTrigger aria-label="Mais estratégias de merge" />
          <MenuContent>
            <SplitButtonChoices>
              <MenuRadioItem value="merge">Criar um commit de merge</MenuRadioItem>
              <MenuRadioItem value="squash">Squash e merge</MenuRadioItem>
              <MenuRadioItem value="rebase">Rebase e merge</MenuRadioItem>
            </SplitButtonChoices>
          </MenuContent>
        </SplitButtonMenu>
      </SplitButton>
      <Text tone="muted">Última ação executada: {last}</Text>
    </div>
  );
}

export const Remember: Story = {
  parameters: scenario('remember'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="remember: the merge button"
        note="The alternatives are radio items bound to the family’s value; the page holds it and renders the action from it. Choose Rebase, then press the action: what ran is what the label said, and the menu shows it checked."
        layout="stack"
      >
        <MergeButton />
      </Scene>
      <Scene
        label="Without remember: alternatives are actions"
        note="The same shape with plain items. Choosing one runs it and changes nothing about the action, which is the default because a silent update would change what the next click does."
        layout="stack"
      >
        <SaveButton />
      </Scene>
    </Grid>
  ),
};

function SavingButton() {
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1600);
  };
  return (
    <SplitButton loading={saving}>
      <SplitButtonPrimary onClick={save}>Salvar</SplitButtonPrimary>
      <SplitButtonMenu>
        <SplitButtonMenuTrigger aria-label="Mais opções de salvar" />
        <MenuContent>
          <MenuItem>Salvar como rascunho</MenuItem>
          <MenuItem>Salvar e fechar</MenuItem>
        </MenuContent>
      </SplitButtonMenu>
    </SplitButton>
  );
}

export const Loading: Story = {
  parameters: scenario('loading'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Press Salvar"
        note="For a second and a half the primary shows its indicator with the width held, and the trigger waits with it: painted in the tone, focusable, aria-disabled, refusing the click and the arrows. Tab to it meanwhile and hear why."
        layout="stack"
      >
        <SavingButton />
      </Scene>
      <Scene
        label="The same, held"
        note="loading on the root, in solid and in outline, photographed at rest so the two halves can be compared: one control that is busy, not one half working beside one half broken."
        layout="row"
      >
        <SaveButton loading />
        <SaveButton
          label="Exportar"
          menuLabel="Mais opções de exportação"
          loading
          tone="secondary"
          variant="outline"
        />
      </Scene>
    </Grid>
  ),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="disabled on the root"
        note="Both halves take the native attribute and button’s disabled paint; between two solid halves the seam takes the disabled border, so the bar reads as one unavailable control rather than a grey one with a coloured line through it."
        layout="row"
      >
        <SaveButton disabled />
        <SaveButton disabled variant="outline" />
        <SaveButton disabled variant="ghost" />
      </Scene>
      <Scene
        label="One half out"
        note="disabled on the primary alone leaves the menu an action — a request that cannot be merged still has Close without merging — and disabled on the trigger alone leaves the action."
        layout="row"
      >
        <SplitButton>
          <SplitButtonPrimary disabled>Mesclar</SplitButtonPrimary>
          <SplitButtonMenu>
            <SplitButtonMenuTrigger aria-label="Mais opções de merge" />
            <MenuContent>
              <MenuItem>Fechar sem mesclar</MenuItem>
            </MenuContent>
          </SplitButtonMenu>
        </SplitButton>
        <SplitButton tone="secondary" variant="outline">
          <SplitButtonPrimary>Exportar</SplitButtonPrimary>
          <SplitButtonMenu>
            <SplitButtonMenuTrigger aria-label="Mais opções de exportação" disabled />
            <MenuContent>
              <MenuItem>Exportar como CSV</MenuItem>
            </MenuContent>
          </SplitButtonMenu>
        </SplitButton>
      </Scene>
    </Grid>
  ),
};

export const Width: Story = {
  parameters: scenario('width'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="fullWidth"
        note="The action takes the whole line and the trigger stays square at the end of it — the shape an action row on a phone needs, with the menu still one tap wide."
        layout="block"
      >
        <SplitButton fullWidth>
          <SplitButtonPrimary>Fazer pedido</SplitButtonPrimary>
          <SplitButtonMenu>
            <SplitButtonMenuTrigger aria-label="Mais opções de pedido" />
            <MenuContent>
              <MenuItem>Agendar entrega</MenuItem>
              <MenuItem>Salvar para depois</MenuItem>
            </MenuContent>
          </SplitButtonMenu>
        </SplitButton>
      </Scene>
      <Scene
        label="A narrow room"
        note="In a column narrower than its words the action wraps inside its own control and the trigger keeps its square, so the bar never pushes past the container the page gave it."
        layout="block"
      >
        <Measure>
          <SaveButton
            label="Speichern und Benachrichtigung senden"
            menuLabel="Weitere Speicheroptionen"
            variant="outline"
          />
        </Measure>
      </Scene>
    </Grid>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Button’s own slots on the action"
        note="start is Button’s start slot and reaches the primary unchanged, mark aligned to the label’s text. Nothing of Button was re-declared to get it there."
        layout="row"
      >
        <SaveButton start={<Save size={16} />} />
      </Scene>
      <Scene
        label="Reading direction"
        note="Switch the direction in the toolbar: the trigger moves to the other end of the action, the corners follow, and the chevron stays a chevron-down — nothing in the family names left or right."
        layout="row"
      >
        <SaveButton />
        <SaveButton
          label="Exportar"
          menuLabel="Mais opções de exportação"
          tone="secondary"
          variant="outline"
        />
      </Scene>
    </Grid>
  ),
};

function HandleDemo() {
  const menu = useRef<MenuHandle>(null);
  return (
    <div className="slotted-demo-row">
      <SplitButtonDefaultsProvider size="sm" variant="outline">
        <SplitButton render={(props) => <section {...props} />}>
          <SplitButtonPrimary render={(props) => <button {...props} data-track="save" />}>
            Salvar
          </SplitButtonPrimary>
          <SplitButtonMenu ref={menu}>
            <SplitButtonMenuTrigger aria-label="Mais opções de salvar" />
            <MenuContent>
              <MenuItem>Salvar como rascunho</MenuItem>
              <MenuItem>Salvar e fechar</MenuItem>
            </MenuContent>
          </SplitButtonMenu>
        </SplitButton>
      </SplitButtonDefaultsProvider>
      <Button onClick={() => menu.current?.open()} size="sm" tone="secondary" variant="ghost">
        Abrir pelo handle
      </Button>
    </div>
  );
}

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="A provider, substituted elements, and menu’s handle"
        note="The provider paints the split button small and outlined; render puts the root on a section and the action on a button carrying an analytics attribute, part names kept; the second button opens the menu through menu’s own handle."
        layout="stack"
      >
        <HandleDemo />
      </Scene>
    </Grid>
  ),
};

function ReasonLog() {
  const [seen, setSeen] = useState('nenhuma ainda');
  return (
    <div className="slotted-demo-stack">
      <SplitButton>
        <SplitButtonPrimary onClick={() => setSeen('a ação correu')}>Salvar</SplitButtonPrimary>
        <SplitButtonMenu
          onOpenChange={(open, request) =>
            setSeen(`${open ? 'abriu' : 'fechou'}: ${request.reason}`)
          }
        >
          <SplitButtonMenuTrigger aria-label="Mais opções de salvar" />
          <MenuContent>
            <MenuItem>Salvar como rascunho</MenuItem>
            <MenuItem>Salvar e fechar</MenuItem>
          </MenuContent>
        </SplitButtonMenu>
      </SplitButton>
      <Text tone="muted">Último evento: {seen}</Text>
    </div>
  );
}

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Two stops, and the menu button’s keys"
        note="Tab reaches Salvar, then the trigger. On the trigger Space and Enter open on the first item, ArrowDown on the first, ArrowUp on the last; Escape closes and comes back. On Salvar the arrows do nothing, and the line below says what the family saw."
        layout="stack"
      >
        <ReasonLog />
      </Scene>
    </Grid>
  ),
};
