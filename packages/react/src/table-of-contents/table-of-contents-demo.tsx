import type { ReactNode } from 'react';

import { Prose } from '../prose';
import { Section, SectionBody, SectionHeader, SectionHeading, SectionTitle } from '../section';
import { Stack } from '../stack';
import { Text } from '../typography';
import type { TableOfContentsItemData } from './table-of-contents.types';

/**
 * One product, three documents. The customer record is the screen an
 * operations platform opens a hundred times a day — sections with headings a
 * bar under the title jumps between. The returns policy is an article the
 * support team reads: prose, with headings the list is generated from. The
 * supplier contract is numbered clauses, which is what `numbered` exists for.
 */

export const CUSTOMER_ITEMS: TableOfContentsItemData[] = [
  { id: 'dados-gerais', label: 'Dados gerais' },
  {
    id: 'enderecos',
    label: 'Endereços',
    children: [
      { id: 'faturacao', label: 'Faturação' },
      { id: 'entrega', label: 'Entrega' },
    ],
  },
  { id: 'contactos', label: 'Contactos' },
  {
    id: 'condicoes',
    label: 'Condições comerciais',
    children: [
      { id: 'prazos', label: 'Prazos de pagamento' },
      { id: 'limite', label: 'Limite de crédito' },
    ],
  },
  { id: 'faturas', label: 'Faturas' },
  { id: 'suporte', label: 'Suporte' },
];

const CUSTOMER_TEXT: Record<string, string[]> = {
  'dados-gerais': [
    'Distribuidora Aurora Lda. · NIF 509 384 112 · cliente desde março de 2019. Segmento: retalho alimentar, 14 lojas no distrito do Porto.',
    'Gestor de conta: Rita Sequeira. Última encomenda em 12 de setembro de 2026, 38 linhas, entregue no prazo.',
  ],
  enderecos: [
    'Dois endereços ativos. A faturação e a entrega diferem desde a mudança de armazém em 2024.',
  ],
  faturacao: [
    'Rua do Almada 412, 3.º · 4050-032 Porto. Fatura eletrónica por SAF-T, enviada ao gabinete de contabilidade.',
  ],
  entrega: [
    'Armazém central, Zona Industrial da Maia, lote 27 · 4470-605 Maia. Receção de segunda a sexta, das 7h às 15h; cais 3 para paletes.',
  ],
  contactos: [
    'Compras: Joana Ferreira, +351 22 340 1200. Financeiro: Nuno Baptista, faturas@aurora-dist.pt. Receção do armazém: Carlos Pinto, ext. 214.',
  ],
  condicoes: ['Condições negociadas em janeiro de 2026, válidas até revisão anual.'],
  prazos: [
    'Pagamento a 45 dias após a data da fatura, por transferência. Desconto de 1,5 % por pagamento a 10 dias.',
  ],
  limite: [
    'Limite de crédito de 180 000,00 €. Exposição atual de 112 430,80 €. Três faturas por vencer, nenhuma em atraso.',
  ],
  faturas: [
    'FT 2026/4471 · 12/09/2026 · 38 412,60 € · por vencer. FT 2026/4302 · 28/08/2026 · 41 905,00 € · por vencer. FT 2026/4187 · 14/08/2026 · 32 113,20 € · por vencer.',
    'FT 2026/4020 · 31/07/2026 · 29 870,00 € · paga em 09/09/2026.',
  ],
  suporte: [
    'Dois pedidos abertos: reposição de 6 caixas danificadas na entrega de 12/09; pedido de segunda via da FT 2026/4187.',
  ],
};

function paragraphs(id: string): ReactNode {
  return (CUSTOMER_TEXT[id] ?? []).map((text) => (
    <Text key={text} size="sm">
      {text}
    </Text>
  ));
}

/** The customer record's sections, each with the id its link points at. */
export function CustomerSections({ sticky = false }: { sticky?: boolean }) {
  return (
    <Stack gap={8}>
      {CUSTOMER_ITEMS.map((item) => (
        <Section id={item.id} key={item.id} sticky={sticky}>
          <SectionHeader>
            <SectionTitle>
              <SectionHeading>{item.label}</SectionHeading>
            </SectionTitle>
          </SectionHeader>
          <SectionBody>
            <Stack gap={6}>{paragraphs(item.id)}</Stack>
            {item.children?.map((child) => (
              <Section id={child.id} key={child.id}>
                <SectionHeader>
                  <SectionTitle>
                    <SectionHeading>{child.label}</SectionHeading>
                  </SectionTitle>
                </SectionHeader>
                <SectionBody>{paragraphs(child.id)}</SectionBody>
              </Section>
            ))}
          </SectionBody>
        </Section>
      ))}
    </Stack>
  );
}

/** The returns policy, as prose whose headings the list is read from. */
export function PolicyArticle() {
  return (
    <Prose>
      <h1>Política de devoluções e reembolsos</h1>
      <p>
        Esta política aplica-se a toda a mercadoria vendida pela Nexora a clientes empresariais e
        substitui a versão de 2024. Os prazos contam-se a partir da data de receção registada no
        comprovativo de entrega.
      </p>
      <h2>Âmbito de aplicação</h2>
      <p>
        Cobre produtos de catálogo, encomendas por medida e amostras faturadas. Não cobre serviços
        de instalação, que têm condições próprias no contrato de prestação.
      </p>
      <h2>Prazos de devolução</h2>
      <p>
        O prazo geral é de 30 dias após a receção. Produtos com validade, cadeia de frio ou
        embalagem selada têm prazos mais curtos, descritos abaixo.
      </p>
      <h3>Perecíveis</h3>
      <p>
        Mercadoria refrigerada ou congelada só é aceite se a reclamação for aberta no próprio dia da
        entrega e a temperatura registada no cais estiver fora do intervalo contratado.
      </p>
      <h3>Embalagem selada</h3>
      <p>
        Uma embalagem aberta perde o direito a devolução por desistência, mas não por defeito. A
        avaliação do defeito é feita em armazém no prazo de cinco dias úteis.
      </p>
      <h2>Estado da mercadoria</h2>
      <p>
        A mercadoria devolvida tem de chegar com a etiqueta de origem e o lote legível. Caixas
        reembaladas pelo cliente são aceites quando o lote é rastreável.
      </p>
      <h2>Reembolsos</h2>
      <p>
        O reembolso é emitido por nota de crédito contra a fatura original e compensado na próxima
        fatura, ou pago por transferência a pedido do cliente no prazo de 15 dias.
      </p>
      <h3>Custos de recolha</h3>
      <p>
        A recolha é gratuita quando a devolução resulta de erro de expedição ou defeito. Nas
        devoluções por desistência o custo da recolha é deduzido ao reembolso.
      </p>
      <h2>Exceções</h2>
      <p>
        Produtos descontinuados, personalizados com a marca do cliente ou adquiridos em campanha de
        saldos não são devolvíveis por desistência.
      </p>
    </Prose>
  );
}

export const CONTRACT_ITEMS: TableOfContentsItemData[] = [
  { id: 'objeto', label: 'Objeto do contrato' },
  {
    id: 'fornecimento',
    label: 'Fornecimento',
    children: [
      { id: 'encomendas', label: 'Encomendas' },
      { id: 'entregas', label: 'Entregas e prazos' },
      { id: 'devolucoes', label: 'Devoluções' },
    ],
  },
  {
    id: 'precos',
    label: 'Preços e pagamento',
    children: [
      { id: 'revisao', label: 'Revisão de preços' },
      { id: 'faturacao-contrato', label: 'Faturação' },
    ],
  },
  { id: 'vigencia', label: 'Vigência e rescisão' },
  { id: 'foro', label: 'Foro competente' },
];

const CONTRACT_TEXT: Record<string, string> = {
  objeto:
    'O presente contrato regula o fornecimento continuado de embalagens de cartão canelado pela Cartonagem do Vouga S.A. à Nexora, nas quantidades e especificações do anexo I.',
  fornecimento:
    'O fornecedor obriga-se a manter em stock, a todo o tempo, o equivalente a quatro semanas de consumo médio.',
  encomendas:
    'As encomendas são emitidas por ordem de compra eletrónica e consideram-se aceites se não forem recusadas em 24 horas.',
  entregas:
    'O prazo de entrega é de cinco dias úteis. Um atraso superior a três dias úteis dá lugar a penalização de 0,5 % por dia sobre o valor da linha.',
  devolucoes:
    'Mercadoria não conforme é devolvida a expensas do fornecedor, que a substitui no prazo de dez dias úteis.',
  precos: 'Os preços do anexo II são fixos por doze meses a contar da assinatura.',
  revisao:
    'Findo o período inicial, os preços podem ser revistos anualmente pela variação do índice de preços do papel publicado pela CEPI.',
  'faturacao-contrato':
    'A faturação é mensal, com vencimento a 60 dias. Faturas sem número de ordem de compra são devolvidas.',
  vigencia:
    'O contrato vigora por 24 meses e renova-se por períodos iguais salvo denúncia com 90 dias de antecedência.',
  foro: 'Para todas as questões emergentes deste contrato é competente o foro da comarca de Aveiro, com renúncia a qualquer outro.',
};

/** The supplier contract, clause by clause, numbered by the list. */
export function ContractClauses() {
  return (
    <Stack gap={8}>
      {CONTRACT_ITEMS.map((clause, index) => (
        <Section id={clause.id} key={clause.id}>
          <SectionHeader>
            <SectionTitle>
              <SectionHeading>
                {index + 1}. {clause.label}
              </SectionHeading>
            </SectionTitle>
          </SectionHeader>
          <SectionBody>
            <Text size="sm">{CONTRACT_TEXT[clause.id]}</Text>
            {clause.children?.map((sub, subIndex) => (
              <Section id={sub.id} key={sub.id}>
                <SectionHeader>
                  <SectionTitle>
                    <SectionHeading>
                      {index + 1}.{subIndex + 1}. {sub.label}
                    </SectionHeading>
                  </SectionTitle>
                </SectionHeader>
                <SectionBody>
                  <Text size="sm">{CONTRACT_TEXT[sub.id]}</Text>
                </SectionBody>
              </Section>
            ))}
          </SectionBody>
        </Section>
      ))}
    </Stack>
  );
}

/** A column beside a document: the list in the region, the document in the body. */
export function Workspace({
  aside,
  children,
  size = 'screen',
}: {
  aside: ReactNode;
  children: ReactNode;
  size?: 'screen' | 'tall';
}) {
  return (
    <div className="slotted-demo-viewport" data-size={size}>
      <div className="slotted-demo-workspace">
        <div className="slotted-demo-workspace__region">{aside}</div>
        <div className="slotted-demo-workspace__body">{children}</div>
      </div>
    </div>
  );
}
