import { type DataTable, Given, Then, When } from '@badeball/cypress-cucumber-preprocessor'

import { catalog, column, expectTitles } from '../helpers'

Given('que estou no catálogo', () => {
  cy.visit('/')
  catalog().should('exist')
})

Then('estou no catálogo', () => {
  cy.location('pathname').should('eq', '/')
  catalog().should('exist')
})

When('abro o filme {string}', (titulo: string) => {
  catalog().findByRole('link', { name: titulo }).click()
  cy.findByRole('heading', { level: 1, name: titulo }).should('exist')
})

When('abro o filme {string} pela busca', (titulo: string) => {
  cy.findByRole('searchbox', { name: 'Buscar pelo título' }).clear().type(`${titulo}{enter}`)
  catalog().findByRole('link', { name: titulo }).click()
  cy.findByRole('heading', { level: 1, name: titulo }).should('exist')
})

When('recarrego a página', () => {
  cy.reload()
})

When('vou para a próxima página', () => {
  catalog().findByRole('link', { name: 'Próxima página' }).click()
})

Then('vejo a mensagem {string}', (mensagem: string) => {
  cy.contains(mensagem).should('be.visible')
})

Then('o catálogo informa {string}', (texto: string) => {
  catalog().contains(texto).should('be.visible')
})

Then('o catálogo mostra só os filmes:', (table: DataTable) => {
  expectTitles(catalog, column(table.raw()))
})

Then('a página tem {int} filmes, começando por {string}', (total: number, titulo: string) => {
  catalog()
    .find('ul h3')
    .should(($titles) => {
      expect($titles).to.have.length(total)
      expect($titles.first().text()).to.equal(titulo)
    })
})

Then('a página tem {int} filmes, terminando em {string}', (total: number, titulo: string) => {
  catalog()
    .find('ul h3')
    .should(($titles) => {
      expect($titles).to.have.length(total)
      expect($titles.last().text()).to.equal(titulo)
    })
})
