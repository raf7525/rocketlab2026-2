import { type DataTable, Then, When } from '@badeball/cypress-cucumber-preprocessor'

import { catalog } from '../helpers'

When(
  'publico a avaliação de {string} com {int} estrelas e a resenha {string}',
  (nome: string, estrelas: number, resenha: string) => {
    cy.findByRole('textbox', { name: 'Seu nome' }).type(nome)
    cy.findByRole('radio', { name: `${estrelas} estrelas` }).check({ force: true })
    cy.findByRole('textbox', { name: 'Resenha' }).type(resenha)
    cy.findByRole('button', { name: 'Publicar avaliação' }).click()
  },
)

Then('as avaliações do filme são:', (table: DataTable) => {
  cy.findByRole('region', { name: 'Avaliações' })
    .find('article')
    .should('have.length', table.raw().length)
  for (const [nome, estrelas, resenha] of table.raw()) {
    cy.findByRole('region', { name: 'Avaliações' })
      .contains('article', nome)
      .within(() => {
        cy.findByRole('img', { name: estrelas }).should('exist')
        cy.contains(resenha).should('be.visible')
      })
  }
})

Then('o card de {string} mostra a nota média {string}', (titulo: string, media: string) => {
  catalog()
    .findByRole('link', { name: titulo })
    .closest('article')
    .findByRole('img', { name: `Nota média ${media} de 5` })
    .should('exist')
})

Then(
  'a página do filme mostra a nota média {string} com {string}',
  (media: string, quantidade: string) => {
    cy.get('main').findByRole('img', { name: `Nota média ${media} de 5` }).should('exist')
    cy.get('main').contains(quantidade).should('be.visible')
  },
)
