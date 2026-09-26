import { When } from '@badeball/cypress-cucumber-preprocessor'

// Barra de busca e filtros do catálogo. Os campos de texto valem ao apertar Enter; as listas
// (gênero, status) valem assim que uma opção é escolhida.

When('busco por {string}', (texto: string) => {
  cy.findByRole('searchbox', { name: 'Buscar pelo título' }).clear().type(`${texto}{enter}`)
  cy.location('search').should('contain', 'busca=')
})

When('filtro pelo gênero {string}', (genero: string) => {
  cy.findByRole('combobox', { name: 'Gênero' }).select(genero)
  cy.location('search').should('contain', 'genero=')
})

When('filtro pelo status {string}', (status: string) => {
  cy.findByRole('combobox', { name: 'Status' }).select(status)
  cy.location('search').should('contain', 'status=')
})

When('filtro pelo diretor {string}', (diretor: string) => {
  cy.findByRole('textbox', { name: 'Direção' }).clear().type(`${diretor}{enter}`)
  cy.location('search').should('contain', 'diretor=')
})

When('filtro pelo ator {string}', (ator: string) => {
  cy.findByRole('textbox', { name: 'Ator ou atriz' }).clear().type(`${ator}{enter}`)
  cy.location('search').should('contain', 'ator=')
})
