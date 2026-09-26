/** Regiões e listas que os passos consultam, pelo nome acessível (como nos testes do Vitest). */

export const catalog = () => cy.findByRole('region', { name: 'Catálogo' })
export const watchlist = () => cy.findByRole('region', { name: 'Watchlist' })

/** Os títulos dos cards de uma região, na ordem da tela; espera até baterem com `expected`. */
export function expectTitles(
  region: () => Cypress.Chainable<JQuery<HTMLElement>>,
  expected: string[],
) {
  region()
    .find('ul h3')
    .should(($titles) => {
      expect([...$titles].map((title) => title.textContent)).to.deep.equal(expected)
    })
}

/** Rótulo que começa com o texto (ex.: "Duração" casa com "Duração (min) (opcional)"). */
export function startingWith(text: string): RegExp {
  return new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
}

/** Uma coluna de uma tabela do Gherkin como lista. */
export function column(rows: string[][]): string[] {
  return rows.map(([value]) => value)
}
