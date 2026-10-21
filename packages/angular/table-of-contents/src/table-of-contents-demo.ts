import { Component } from '@angular/core';
import { SlProse } from '@slotted/angular/prose';
import {
  SlSection,
  SlSectionBody,
  SlSectionHeader,
  SlSectionHeading,
  SlSectionTitle,
} from '@slotted/angular/section';
import { SlStack } from '@slotted/angular/stack';
import { SlHeading, SlText } from '@slotted/angular/typography';

import type { TableOfContentsItemData } from './table-of-contents-defaults';

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

const SECTION_PARTS = [
  SlSection,
  SlSectionBody,
  SlSectionHeader,
  SlSectionHeading,
  SlSectionTitle,
  SlStack,
  SlText,
];

/**
 * The customer record's sections, written out with static ids the way a
 * hand-written page gives them: `slSection` reads its id as a host attribute.
 */
@Component({
  selector: 'sl-toc-customer-demo',
  standalone: true,
  imports: SECTION_PARTS,
  template: `
    <div slStack [gap]="8">
      <section slSection id="dados-gerais">
        <div slSectionHeader>
          <div slSectionTitle><h2 slSectionHeading>Dados gerais</h2></div>
        </div>
        <div slSectionBody>
          <div slStack [gap]="6">
            <p slText size="sm">
              Distribuidora Aurora Lda. · NIF 509 384 112 · cliente desde março de 2019. Segmento:
              retalho alimentar, 14 lojas no distrito do Porto.
            </p>
            <p slText size="sm">
              Gestor de conta: Rita Sequeira. Última encomenda em 12 de setembro de 2026, 38 linhas,
              entregue no prazo.
            </p>
          </div>
        </div>
      </section>
      <section slSection id="enderecos">
        <div slSectionHeader>
          <div slSectionTitle><h2 slSectionHeading>Endereços</h2></div>
        </div>
        <div slSectionBody>
          <div slStack [gap]="6">
            <p slText size="sm">
              Dois endereços ativos. A faturação e a entrega diferem desde a mudança de armazém em
              2024.
            </p>
          </div>
          <section slSection id="faturacao">
            <div slSectionHeader>
              <div slSectionTitle><h3 slSectionHeading>Faturação</h3></div>
            </div>
            <div slSectionBody>
              <p slText size="sm">
                Rua do Almada 412, 3.º · 4050-032 Porto. Fatura eletrónica por SAF-T, enviada ao
                gabinete de contabilidade.
              </p>
            </div>
          </section>
          <section slSection id="entrega">
            <div slSectionHeader>
              <div slSectionTitle><h3 slSectionHeading>Entrega</h3></div>
            </div>
            <div slSectionBody>
              <p slText size="sm">
                Armazém central, Zona Industrial da Maia, lote 27 · 4470-605 Maia. Receção de
                segunda a sexta, das 7h às 15h; cais 3 para paletes.
              </p>
            </div>
          </section>
        </div>
      </section>
      <section slSection id="contactos">
        <div slSectionHeader>
          <div slSectionTitle><h2 slSectionHeading>Contactos</h2></div>
        </div>
        <div slSectionBody>
          <div slStack [gap]="6">
            <p slText size="sm">
              Compras: Joana Ferreira, +351 22 340 1200. Financeiro: Nuno Baptista,
              faturas&#64;aurora-dist.pt. Receção do armazém: Carlos Pinto, ext. 214.
            </p>
          </div>
        </div>
      </section>
      <section slSection id="condicoes">
        <div slSectionHeader>
          <div slSectionTitle><h2 slSectionHeading>Condições comerciais</h2></div>
        </div>
        <div slSectionBody>
          <div slStack [gap]="6">
            <p slText size="sm">
              Condições negociadas em janeiro de 2026, válidas até revisão anual.
            </p>
          </div>
          <section slSection id="prazos">
            <div slSectionHeader>
              <div slSectionTitle><h3 slSectionHeading>Prazos de pagamento</h3></div>
            </div>
            <div slSectionBody>
              <p slText size="sm">
                Pagamento a 45 dias após a data da fatura, por transferência. Desconto de 1,5 % por
                pagamento a 10 dias.
              </p>
            </div>
          </section>
          <section slSection id="limite">
            <div slSectionHeader>
              <div slSectionTitle><h3 slSectionHeading>Limite de crédito</h3></div>
            </div>
            <div slSectionBody>
              <p slText size="sm">
                Limite de crédito de 180 000,00 €. Exposição atual de 112 430,80 €. Três faturas por
                vencer, nenhuma em atraso.
              </p>
            </div>
          </section>
        </div>
      </section>
      <section slSection id="faturas">
        <div slSectionHeader>
          <div slSectionTitle><h2 slSectionHeading>Faturas</h2></div>
        </div>
        <div slSectionBody>
          <div slStack [gap]="6">
            <p slText size="sm">
              FT 2026/4471 · 12/09/2026 · 38 412,60 € · por vencer. FT 2026/4302 · 28/08/2026 · 41
              905,00 € · por vencer. FT 2026/4187 · 14/08/2026 · 32 113,20 € · por vencer.
            </p>
            <p slText size="sm">FT 2026/4020 · 31/07/2026 · 29 870,00 € · paga em 09/09/2026.</p>
          </div>
        </div>
      </section>
      <section slSection id="suporte">
        <div slSectionHeader>
          <div slSectionTitle><h2 slSectionHeading>Suporte</h2></div>
        </div>
        <div slSectionBody>
          <div slStack [gap]="6">
            <p slText size="sm">
              Dois pedidos abertos: reposição de 6 caixas danificadas na entrega de 12/09; pedido de
              segunda via da FT 2026/4187.
            </p>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class SlTocCustomerDemo {}

/** The same sections with sticky headers, for the page whose bar sits in the header. */
@Component({
  selector: 'sl-toc-customer-sticky-demo',
  standalone: true,
  imports: SECTION_PARTS,
  template: `
    <div slStack [gap]="8">
      <section slSection id="dados-gerais" sticky>
        <div slSectionHeader>
          <div slSectionTitle><h2 slSectionHeading>Dados gerais</h2></div>
        </div>
        <div slSectionBody>
          <div slStack [gap]="6">
            <p slText size="sm">
              Distribuidora Aurora Lda. · NIF 509 384 112 · cliente desde março de 2019. Segmento:
              retalho alimentar, 14 lojas no distrito do Porto.
            </p>
            <p slText size="sm">
              Gestor de conta: Rita Sequeira. Última encomenda em 12 de setembro de 2026, 38 linhas,
              entregue no prazo.
            </p>
          </div>
        </div>
      </section>
      <section slSection id="enderecos" sticky>
        <div slSectionHeader>
          <div slSectionTitle><h2 slSectionHeading>Endereços</h2></div>
        </div>
        <div slSectionBody>
          <div slStack [gap]="6">
            <p slText size="sm">
              Dois endereços ativos. A faturação e a entrega diferem desde a mudança de armazém em
              2024.
            </p>
          </div>
          <section slSection id="faturacao">
            <div slSectionHeader>
              <div slSectionTitle><h3 slSectionHeading>Faturação</h3></div>
            </div>
            <div slSectionBody>
              <p slText size="sm">
                Rua do Almada 412, 3.º · 4050-032 Porto. Fatura eletrónica por SAF-T, enviada ao
                gabinete de contabilidade.
              </p>
            </div>
          </section>
          <section slSection id="entrega">
            <div slSectionHeader>
              <div slSectionTitle><h3 slSectionHeading>Entrega</h3></div>
            </div>
            <div slSectionBody>
              <p slText size="sm">
                Armazém central, Zona Industrial da Maia, lote 27 · 4470-605 Maia. Receção de
                segunda a sexta, das 7h às 15h; cais 3 para paletes.
              </p>
            </div>
          </section>
        </div>
      </section>
      <section slSection id="contactos" sticky>
        <div slSectionHeader>
          <div slSectionTitle><h2 slSectionHeading>Contactos</h2></div>
        </div>
        <div slSectionBody>
          <div slStack [gap]="6">
            <p slText size="sm">
              Compras: Joana Ferreira, +351 22 340 1200. Financeiro: Nuno Baptista,
              faturas&#64;aurora-dist.pt. Receção do armazém: Carlos Pinto, ext. 214.
            </p>
          </div>
        </div>
      </section>
      <section slSection id="condicoes" sticky>
        <div slSectionHeader>
          <div slSectionTitle><h2 slSectionHeading>Condições comerciais</h2></div>
        </div>
        <div slSectionBody>
          <div slStack [gap]="6">
            <p slText size="sm">
              Condições negociadas em janeiro de 2026, válidas até revisão anual.
            </p>
          </div>
          <section slSection id="prazos">
            <div slSectionHeader>
              <div slSectionTitle><h3 slSectionHeading>Prazos de pagamento</h3></div>
            </div>
            <div slSectionBody>
              <p slText size="sm">
                Pagamento a 45 dias após a data da fatura, por transferência. Desconto de 1,5 % por
                pagamento a 10 dias.
              </p>
            </div>
          </section>
          <section slSection id="limite">
            <div slSectionHeader>
              <div slSectionTitle><h3 slSectionHeading>Limite de crédito</h3></div>
            </div>
            <div slSectionBody>
              <p slText size="sm">
                Limite de crédito de 180 000,00 €. Exposição atual de 112 430,80 €. Três faturas por
                vencer, nenhuma em atraso.
              </p>
            </div>
          </section>
        </div>
      </section>
      <section slSection id="faturas" sticky>
        <div slSectionHeader>
          <div slSectionTitle><h2 slSectionHeading>Faturas</h2></div>
        </div>
        <div slSectionBody>
          <div slStack [gap]="6">
            <p slText size="sm">
              FT 2026/4471 · 12/09/2026 · 38 412,60 € · por vencer. FT 2026/4302 · 28/08/2026 · 41
              905,00 € · por vencer. FT 2026/4187 · 14/08/2026 · 32 113,20 € · por vencer.
            </p>
            <p slText size="sm">FT 2026/4020 · 31/07/2026 · 29 870,00 € · paga em 09/09/2026.</p>
          </div>
        </div>
      </section>
      <section slSection id="suporte" sticky>
        <div slSectionHeader>
          <div slSectionTitle><h2 slSectionHeading>Suporte</h2></div>
        </div>
        <div slSectionBody>
          <div slStack [gap]="6">
            <p slText size="sm">
              Dois pedidos abertos: reposição de 6 caixas danificadas na entrega de 12/09; pedido de
              segunda via da FT 2026/4187.
            </p>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class SlTocCustomerStickyDemo {}

/** The returns policy, as prose whose headings the list is read from. */
@Component({
  selector: 'sl-toc-policy-demo',
  standalone: true,
  imports: [SlProse],
  template: `
    <div slProse>
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
    </div>
  `,
})
export class SlTocPolicyDemo {}

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
@Component({
  selector: 'sl-toc-contract-demo',
  standalone: true,
  imports: [SlHeading, SlStack, SlText],
  template: `
    <div slStack [gap]="8">
      @for (clause of items; track clause.id; let i = $index) {
        <section [id]="clause.id">
          <div slStack [gap]="5">
            <h2 slHeading size="lg">{{ i + 1 }}. {{ clause.label }}</h2>
            <p slText size="sm">{{ text(clause.id) }}</p>
            @for (sub of clause.children ?? []; track sub.id; let j = $index) {
              <section [id]="sub.id">
                <div slStack [gap]="4">
                  <h3 slHeading size="md">{{ i + 1 }}.{{ j + 1 }}. {{ sub.label }}</h3>
                  <p slText size="sm">{{ text(sub.id) }}</p>
                </div>
              </section>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class SlTocContractDemo {
  readonly items = CONTRACT_ITEMS;
  text(id: string): string {
    return CONTRACT_TEXT[id] ?? '';
  }
}
