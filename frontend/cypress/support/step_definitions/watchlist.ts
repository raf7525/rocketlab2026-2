import { type DataTable, Then, When } from '@badeball/cypress-cucumber-preprocessor'

import { catalog, column, expectTitles, watchlist } from '../helpers'

// O ícone muda na hora; os passos esperam a API responder antes de seguir.

When('salvo o filme {string} na watchlist', (titulo: string) => {
  cy.intercept('PUT', '/api/v1/watchlist/*').as('salvar')
  catalog()
    .findByRole('button', { name: `Salvar ${titulo} na watchlist` })
    .click()
    .should('have.attr', 'aria-pressed', 'true')
  cy.wait('@salvar')
})

When('abro a watchlist', () => {
  cy.findByRole('link', { name: 'Watchlist' }).click()
  watchlist().should('exist')
})

When('tiro o filme {string} da watchlist', (titulo: string) => {
  cy.intercept('DELETE', '/api/v1/watchlist/*').as('tirar')
  watchlist()
    .findByRole('button', { name: `Salvar ${titulo} na watchlist` })
    .click()
  cy.wait('@tirar')
})

Then('a watchlist mostra só os filmes:', (table: DataTable) => {
  expectTitles(watchlist, column(table.raw()))
})
