import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  CalendarDays,
  ChartNoAxesColumn,
  FileText,
  Package,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';

import { Avatar } from '../avatar';
import { Button, ButtonLink } from '../button';
import { Grid, Scene } from '../field/field-demo';
import { Text } from '../typography';
import {
  TopNavigation,
  TopNavigationAccount,
  TopNavigationActions,
  TopNavigationBrand,
  TopNavigationContext,
  TopNavigationHome,
  TopNavigationName,
} from '../top-navigation';
import { NavigationMenu } from './navigation-menu';
import { NavigationMenuDefaultsProvider } from './navigation-menu-defaults';
import {
  NavigationMenuContent,
  NavigationMenuDescription,
  NavigationMenuFooter,
  NavigationMenuGroup,
  NavigationMenuGroupLabel,
  NavigationMenuIcon,
  NavigationMenuItem,
  NavigationMenuLabel,
  NavigationMenuLink,
  NavigationMenuLinks,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './navigation-menu-parts';
import { REACT_NAVIGATION_MENU_DOCS, REACT_NAVIGATION_MENU_TOKENS } from './navigation-menu.docs';
import type { NavigationMenuHandle, NavigationMenuProps } from './navigation-menu.types';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_NAVIGATION_MENU_DOCS.navigationMenu.scenes, {
    playground: Playground,
    anatomy: Anatomy,
    links: Links,
    rich: Rich,
    groups: Groups,
    footer: Footer,
    current: Current,
    vertical: Vertical,
    nested: Nested,
    states: States,
    size: Size,
    content: Content,
    controlled: Controlled,
    defaults: Defaults,
    composition: Composition,
    keyboard: Keyboard,
    accessibility: Accessibility,
  });

const meta = {
  title: 'Components/NavigationMenu',
  component: NavigationMenu,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'NavigationMenu',
        description:
          'The sections of a site or an application in a row or a column, each a button that shows a panel of links on one shared surface that moves between them.',
        framework: 'React',
        ...REACT_NAVIGATION_MENU_DOCS.navigationMenu,
        tokens: REACT_NAVIGATION_MENU_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

type Glyph = ComponentType<{ size?: number | string; 'aria-hidden'?: boolean }>;

/**
 * A box with room under the row for the panel, which is laid over the page
 * and takes no room of its own. The box clips, as a region of an application
 * does, and the surface measures itself against it.
 */
function Room({ children, size = 'tall' }: { children: ReactNode; size?: 'tall' | 'screen' }) {
  return (
    <div className="slotted-demo-viewport" data-place="top" data-size={size}>
      {children}
    </div>
  );
}

/** A destination with a mark, a title and a description, as Aurora's catalogue writes one. */
function RichLink({
  current,
  description,
  disabled,
  href,
  icon: Icon,
  label,
}: {
  current?: boolean;
  description: string;
  disabled?: boolean;
  href: string;
  icon?: Glyph;
  label: string;
}) {
  return (
    <li>
      <NavigationMenuLink current={current} disabled={disabled} href={href}>
        {Icon === undefined ? null : (
          <NavigationMenuIcon>
            <Icon aria-hidden size={16} />
          </NavigationMenuIcon>
        )}
        <NavigationMenuLabel>{label}</NavigationMenuLabel>
        <NavigationMenuDescription>{description}</NavigationMenuDescription>
      </NavigationMenuLink>
    </li>
  );
}

function Plain({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <NavigationMenuLink href={href}>{label}</NavigationMenuLink>
    </li>
  );
}

function ProductsPanel({ footer = true }: { footer?: boolean }) {
  return (
    <NavigationMenuContent columns={2}>
      <NavigationMenuLinks>
        <RichLink
          description="Entradas, saídas e inventário por local."
          href="#armazem"
          icon={Warehouse}
          label="Armazém"
        />
        <RichLink
          current
          description="Rotas, consumo e manutenção dos veículos."
          href="#frota"
          icon={Truck}
          label="Frota"
        />
        <RichLink
          description="Faturas, notas de crédito e reconciliação."
          href="#faturacao"
          icon={FileText}
          label="Faturação"
        />
        <RichLink
          description="Janelas de carga e entregas marcadas."
          href="#agenda"
          icon={CalendarDays}
          label="Agenda"
        />
        <RichLink
          description="Contas, contactos e condições comerciais."
          href="#clientes"
          icon={Users}
          label="Clientes"
        />
        <RichLink
          description="Disponível no plano Empresa."
          disabled
          href="#relatorios"
          icon={ChartNoAxesColumn}
          label="Relatórios"
        />
      </NavigationMenuLinks>
      {footer ? (
        <NavigationMenuFooter>
          <Text size="xs" tone="muted">
            Novo: previsão de procura por armazém.
          </Text>
          <ButtonLink href="#produtos" size="sm">
            Ver todos
          </ButtonLink>
        </NavigationMenuFooter>
      ) : null}
    </NavigationMenuContent>
  );
}

function SolutionsPanel() {
  return (
    <NavigationMenuContent columns={3}>
      <NavigationMenuGroup>
        <NavigationMenuGroupLabel>Por setor</NavigationMenuGroupLabel>
        <NavigationMenuLinks>
          <Plain href="#retalho" label="Retalho" />
          <Plain href="#industria" label="Indústria" />
          <Plain href="#saude" label="Saúde" />
        </NavigationMenuLinks>
      </NavigationMenuGroup>
      <NavigationMenuGroup>
        <NavigationMenuGroupLabel>Por dimensão</NavigationMenuGroupLabel>
        <NavigationMenuLinks>
          <Plain href="#pme" label="Pequenas empresas" />
          <Plain href="#media" label="Média dimensão" />
          <Plain href="#grandes" label="Grandes contas" />
        </NavigationMenuLinks>
      </NavigationMenuGroup>
      <NavigationMenuGroup>
        <NavigationMenuGroupLabel>Por equipa</NavigationMenuGroupLabel>
        <NavigationMenuLinks>
          <Plain href="#operacoes" label="Operações" />
          <Plain href="#financas" label="Finanças" />
          <Plain href="#comercial" label="Comercial" />
        </NavigationMenuLinks>
      </NavigationMenuGroup>
    </NavigationMenuContent>
  );
}

function CompanyPanel() {
  return (
    <NavigationMenuContent>
      <NavigationMenuLinks>
        <Plain href="#sobre" label="Sobre nós" />
        <Plain href="#carreiras" label="Carreiras" />
        <Plain href="#imprensa" label="Imprensa" />
        <Plain href="#contactos" label="Contactos" />
      </NavigationMenuLinks>
    </NavigationMenuContent>
  );
}

/** Aurora Logística's site header: three sections and a direct link. */
function Aurora(props: Partial<NavigationMenuProps>) {
  return (
    <NavigationMenu aria-label="Principal" {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="produtos">
          <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
          <ProductsPanel />
        </NavigationMenuItem>
        <NavigationMenuItem value="solucoes">
          <NavigationMenuTrigger>Soluções</NavigationMenuTrigger>
          <SolutionsPanel />
        </NavigationMenuItem>
        <NavigationMenuItem value="documentacao">
          <NavigationMenuLink href="#documentacao">Documentação</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="empresa">
          <NavigationMenuTrigger>Empresa</NavigationMenuTrigger>
          <CompanyPanel />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export const Playground: Story = {
  args: {
    arrow: false,
    closeDelay: 300,
    closeOnSelect: true,
    openDelay: 200,
    orientation: 'horizontal',
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <Room size="screen">
      <Aurora {...args} defaultValue="produtos" />
    </Room>
  ),
};

/** A part drawn as its own name. */
function Part({ name }: { name: string }) {
  return (
    <Text render={(props) => <code {...props} />} size="xs" tone="muted">
      {name}
    </Text>
  );
}

export const Anatomy: Story = {
  parameters: scenario('anatomy'),
  render: () => (
    <Room>
      <NavigationMenu arrow aria-label="Anatomia" defaultValue="section">
        <NavigationMenuList>
          <NavigationMenuItem value="section">
            <NavigationMenuTrigger>trigger</NavigationMenuTrigger>
            <NavigationMenuContent columns={2}>
              <NavigationMenuGroup>
                <NavigationMenuGroupLabel>group-label</NavigationMenuGroupLabel>
                <NavigationMenuLinks>
                  <RichLink
                    description="description"
                    href="#a"
                    icon={Package}
                    label="link › icon · label"
                  />
                </NavigationMenuLinks>
              </NavigationMenuGroup>
              <NavigationMenuGroup>
                <NavigationMenuGroupLabel>links</NavigationMenuGroupLabel>
                <NavigationMenuLinks>
                  <Plain href="#b" label="link" />
                  <Plain href="#c" label="link" />
                </NavigationMenuLinks>
              </NavigationMenuGroup>
              <NavigationMenuFooter>
                <Part name="footer" />
                <Part name="viewport ▸ arrow" />
              </NavigationMenuFooter>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="link">
            <NavigationMenuLink href="#link">link</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Room>
  ),
};

export const Links: Story = {
  parameters: scenario('links'),
  render: () => (
    <Room>
      <Aurora defaultValue="empresa" />
    </Room>
  ),
};

export const Rich: Story = {
  parameters: scenario('rich'),
  render: () => (
    <Room>
      <NavigationMenu aria-label="Produtos" defaultValue="produtos">
        <NavigationMenuList>
          <NavigationMenuItem value="produtos">
            <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
            <ProductsPanel footer={false} />
          </NavigationMenuItem>
          <NavigationMenuItem value="precos">
            <NavigationMenuLink href="#precos">Preços</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Room>
  ),
};

export const Groups: Story = {
  parameters: scenario('groups'),
  render: () => (
    <Room>
      <Aurora defaultValue="solucoes" />
    </Room>
  ),
};

export const Footer: Story = {
  parameters: scenario('footer'),
  render: () => (
    <Room>
      <Aurora defaultValue="produtos" />
    </Room>
  ),
};

export const Current: Story = {
  parameters: scenario('current'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Every section closed"
        note="Frota is the page: Produtos takes the accent ink on its trigger, so the reader sees which section they are in before opening anything."
      >
        <Room>
          <Aurora />
        </Room>
      </Scene>
      <Scene
        label="The section open"
        note="Inside the panel the current link stands on the accent ground, with the accent edge in high-contrast."
      >
        <Room>
          <Aurora defaultValue="produtos" />
        </Room>
      </Scene>
    </Grid>
  ),
};

function Column({ defaultValue }: { defaultValue?: string }) {
  return (
    <NavigationMenu arrow aria-label="Ajuda" defaultValue={defaultValue} orientation="vertical">
      <NavigationMenuList>
        <NavigationMenuItem value="inicio">
          <NavigationMenuLink href="#inicio">Início</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="ajuda">
          <NavigationMenuTrigger>Ajuda</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLinks>
              <Plain href="#guias" label="Guias" />
              <Plain href="#api" label="Referência da API" />
              <Plain href="#estado" label="Estado do serviço" />
            </NavigationMenuLinks>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="conta">
          <NavigationMenuTrigger>Conta</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLinks>
              <Plain href="#perfil" label="Perfil" />
              <Plain href="#faturas" label="Faturas" />
            </NavigationMenuLinks>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export const Vertical: Story = {
  parameters: scenario('vertical'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Beside the column"
        note="The panel opens at the column’s end, level with Ajuda, with the arrow on the trigger’s middle."
      >
        <Room>
          <Column defaultValue="ajuda" />
        </Room>
      </Scene>
      <Scene
        label="On a phone"
        note="At 375 pixels the column has no room at its end: the panel drops under the trigger and the chevron turns down."
      >
        <div className="slotted-demo-room" data-room="phone">
          <Room>
            <Column defaultValue="ajuda" />
          </Room>
        </div>
      </Scene>
    </Grid>
  ),
};

export const Nested: Story = {
  parameters: scenario('nested'),
  render: () => (
    <Room>
      <NavigationMenu aria-label="Catálogo" defaultValue="catalogo">
        <NavigationMenuList>
          <NavigationMenuItem value="catalogo">
            <NavigationMenuTrigger>Catálogo</NavigationMenuTrigger>
            <NavigationMenuContent columns={3}>
              <NavigationMenu defaultValue="ferramentas">
                <NavigationMenuList>
                  <NavigationMenuItem value="ferramentas">
                    <NavigationMenuTrigger>Ferramentas</NavigationMenuTrigger>
                    <NavigationMenuContent columns={2}>
                      <NavigationMenuLinks>
                        <Plain href="#manuais" label="Manuais" />
                        <Plain href="#eletricas" label="Elétricas" />
                        <Plain href="#medicao" label="Medição" />
                        <Plain href="#corte" label="Corte" />
                      </NavigationMenuLinks>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem value="embalagem">
                    <NavigationMenuTrigger>Embalagem</NavigationMenuTrigger>
                    <NavigationMenuContent columns={2}>
                      <NavigationMenuLinks>
                        <Plain href="#caixas" label="Caixas" />
                        <Plain href="#paletes" label="Paletes" />
                      </NavigationMenuLinks>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem value="seguranca">
                    <NavigationMenuTrigger>Segurança</NavigationMenuTrigger>
                    <NavigationMenuContent columns={2}>
                      <NavigationMenuLinks>
                        <Plain href="#epi" label="Proteção individual" />
                      </NavigationMenuLinks>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="marcas">
            <NavigationMenuLink href="#marcas">Marcas</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Room>
  ),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => (
    <Room>
      <NavigationMenu aria-label="Estados">
        <NavigationMenuList>
          <NavigationMenuItem value="produtos">
            <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLinks>
                <li>
                  <NavigationMenuLink current href="#frota">
                    Frota
                  </NavigationMenuLink>
                </li>
              </NavigationMenuLinks>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="precos">
            <NavigationMenuLink current href="#precos">
              Preços
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem disabled value="parceiros">
            <NavigationMenuTrigger>Parceiros</NavigationMenuTrigger>
            <NavigationMenuContent />
          </NavigationMenuItem>
          <NavigationMenuItem value="blogue">
            <NavigationMenuLink disabled href="#blogue">
              Blogue
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Room>
  ),
};

export const Size: Story = {
  parameters: scenario('size'),
  render: () => (
    <Grid columns={3}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Scene
          key={size}
          label={size}
          note={`size="${size}" on the control scale: the trigger and the link stand at the height of a ${size} field.`}
        >
          <Room>
            <NavigationMenu aria-label={`Tamanho ${size}`} size={size}>
              <NavigationMenuList>
                <NavigationMenuItem value="empresa">
                  <NavigationMenuTrigger>Empresa</NavigationMenuTrigger>
                  <CompanyPanel />
                </NavigationMenuItem>
                <NavigationMenuItem value="precos">
                  <NavigationMenuLink href="#precos">Preços</NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </Room>
        </Scene>
      ))}
    </Grid>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Room>
      <NavigationMenu aria-label="Conteúdo extremo" defaultValue="longo">
        <NavigationMenuList>
          <NavigationMenuItem value="longo">
            <NavigationMenuTrigger>Gestão de armazéns e distribuição</NavigationMenuTrigger>
            <NavigationMenuContent columns={2}>
              <NavigationMenuLinks>
                <RichLink
                  description="Calcula transferências entre armazéns a partir da procura prevista, dos prazos de entrega dos fornecedores e do stock de segurança definido por artigo e por local."
                  href="#reabastecimento"
                  icon={Warehouse}
                  label="Planeamento de reabastecimento entre armazéns regionais"
                />
                <RichLink
                  description="Um link rico sem ícone começa o título na margem."
                  href="#sem-marca"
                  label="Sem marca"
                />
                <RichLink
                  description="Uma cadeia sem quebra."
                  href="#referencia"
                  icon={FileText}
                  label="Referência_de_artigo_sem_espaços_ABCDEFGHIJ"
                />
              </NavigationMenuLinks>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Room>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  return (
    <Room>
      <Aurora
        onValueChange={(next, request) => {
          setLog((entries) => [`${next ?? 'null'} · ${request.reason}`, ...entries].slice(0, 3));
          setValue(next);
        }}
        value={value}
      />
      <Text render={(props) => <output {...props} />} size="xs" tone="muted">
        {log.length === 0 ? 'Abra uma secção.' : log.join(' — ')}
      </Text>
    </Room>
  );
}

export const Controlled: Story = {
  parameters: scenario('controlled'),
  render: () => <ControlledDemo />,
};

export const Defaults: Story = {
  parameters: scenario('defaults'),
  render: () => (
    <Room>
      <NavigationMenuDefaultsProvider arrow openDelay={50} size="sm">
        <Aurora />
      </NavigationMenuDefaultsProvider>
    </Room>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <div className="slotted-demo-room" data-room="desktop">
      <Room>
        <TopNavigation>
          <TopNavigationBrand>
            <TopNavigationHome href="#inicio">
              <TopNavigationName>Aurora Logística</TopNavigationName>
            </TopNavigationHome>
          </TopNavigationBrand>
          <TopNavigationContext>
            <Aurora />
          </TopNavigationContext>
          <TopNavigationActions>
            <TopNavigationAccount aria-label="Conta de Ana Barros">
              <Avatar size="xs" tone="accent" variant="soft">
                AB
              </Avatar>
            </TopNavigationAccount>
          </TopNavigationActions>
        </TopNavigation>
      </Room>
    </div>
  ),
};

function KeyboardDemo() {
  const menu = useRef<NavigationMenuHandle>(null);
  return (
    <Room>
      <Aurora ref={menu} />
      <Button onClick={() => menu.current?.focus('produtos')} size="sm" variant="outline">
        Focar Produtos
      </Button>
    </Room>
  );
}

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => <KeyboardDemo />,
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <Room>
      <Aurora />
    </Room>
  ),
};
