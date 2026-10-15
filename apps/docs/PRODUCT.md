# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Engenheiros e times que avaliam adotar a biblioteca. Precisam ver qualidade, amplitude e o modelo multi-framework na primeira visita.
- Engenheiros que já usam a biblioteca. Consultam exemplos, API, teclado e tokens durante o trabalho diário.
- Os dois públicos têm o mesmo peso. A entrada apresenta a biblioteca; as páginas de componente servem a consulta.
- Público secundário (`docs/product/prd.md` §7.1): times de design system e de plataforma que criam temas para várias aplicações.

## Product Purpose

Site público da biblioteca Slotted: home de apresentação e documentação oficial no mesmo site. Conteúdo inteiramente em inglês, inclusive os exemplos. Sucesso: quem avalia entende o diferencial e a qualidade sem instalar nada, e quem já usa encontra exemplo, API e comportamento de uma família em uma página.

## Positioning

- Uma especificação por família (`specs/components/<family>/contract.json`) e uma folha de estilo por família, com bindings idiomáticos para React e Angular. Os dois renderizam o mesmo DOM (`data-ui`, partes, ARIA).
- Cada exemplo executa no framework selecionado pelo leitor.
- Foco declarado em aplicações de produto densas: dashboards, back-office, ferramentas internas, SaaS, sistemas centrados em tabelas, formulários e fluxos (`docs/product/prd.md` §2). Landing pages e marketing não são alvo da biblioteca.
- Temas como produto de primeira classe; densidade (`comfortable`, `compact`, `dense`) e esquemas (`light`, `dark`, `high-contrast`) como eixos do tema.

## Operating Context

- O leitor alterna entre framework (React, Angular), esquema e densidade, e espera a mesma página em cada combinação.
- O leitor copia código dos exemplos para a própria aplicação.
- Uma demo de produto real existe (`demos/nexora`, Angular) e consome a biblioteca como pacote.

## Capabilities and Constraints

- Stack: Astro 7 em `apps/docs`, saída estática; interface do site construída com `@slotted/react` e `@slotted/themes`.
- 121 famílias especificadas em `specs/components/`.
- Os pacotes ainda não estão publicados no npm. Comandos de instalação e links para playgrounds externos não podem prometer disponibilidade.
- React e Angular hoje; outros frameworks podem entrar depois.
- Indefinido: domínio, versionamento da documentação, data da primeira publicação.

## Brand Commitments

- "Slotted" é nome provisório. O site não fixa uma marca forte no nome: o nome aparece como texto, num só ponto do código, substituível.
- Referências de qualidade dadas pelo usuário: reui.io, mui.com, documentação do shadcn/ui.

## Evidence on Hand

- Contratos por família: `specs/components/*/contract.json`.
- Tokens por família: `packages/styles/src/<family>/<family>.tokens.json`.
- Demo Nexora: `demos/nexora/angular`.
- Ausentes e proibidos de inventar: depoimentos, empresas usuárias, números de downloads, estrelas, benchmarks, preços.

## Product Principles

1. Mostrar, não afirmar: cada afirmação sobre a biblioteca aponta para um exemplo executável.
2. Paridade visível: trocar de framework mantém o leitor na mesma página e no mesmo exemplo.
3. Densidade é cidadã: exemplos e a própria interface do site funcionam em `compact` e `dense`.
4. O site é consumidor da biblioteca: um defeito visto no site é tratado como defeito do pacote.

## Accessibility & Inclusion

A biblioteca declara acessibilidade por padrão (`docs/product/prd.md` O7). O site segue WCAG 2.2 AA e oferece o esquema `high-contrast`.
