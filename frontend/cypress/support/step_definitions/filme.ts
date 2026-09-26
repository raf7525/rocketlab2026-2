import { type DataTable, Then, When } from '@badeball/cypress-cucumber-preprocessor'

import { column, startingWith } from '../helpers'

// Formulário do filme (cadastro e edição) e página do filme.

When('abro o cadastro de filme', () => {
  cy.findByRole('link', { name: 'Adicionar filme' }).click()
  cy.findByRole('heading', { level: 1, name: 'Adicionar filme' }).should('exist')
})

When('preencho o formulário do filme:', (table: DataTable) => {
  for (const [campo, valor] of table.raw()) {
    cy.findByRole('textbox', { name: startingWith(campo) })
      .clear()
      .type(valor)
  }
})

When('escolho o gênero {string}', (genero: string) => {
  cy.findByRole('checkbox', { name: genero }).check({ force: true })
})

When('escolho o status {string}', (status: string) => {
  cy.findByRole('combobox', { name: 'Status' }).select(status)
})

When('escolho a imagem {string} como pôster', (arquivo: string) => {
  cy.findByLabelText(startingWith('Pôster')).selectFile(`cypress/fixtures/${arquivo}`, {
    force: true,
  })
  cy.findByRole('img', { name: 'Prévia do pôster' }).should('be.visible')
})

When('respondo que ainda não assisti ao filme', () => {
  cy.findByRole('radio', { name: 'Ainda não' }).check({ force: true })
})

When('cadastro o filme', () => {
  cy.findByRole('button', { name: 'Cadastrar filme' }).click()
})

When('abro a edição do filme', () => {
  cy.findByRole('button', { name: 'Edição' }).click()
  cy.findByRole('form', { name: 'Editar filme' }).should('exist')
})

When('troco a sinopse por {string}', (sinopse: string) => {
  cy.findByRole('textbox', { name: startingWith('Sinopse') })
    .clear()
    .type(sinopse)
})

When('salvo as alterações', () => {
  cy.findByRole('button', { name: 'Salvar alterações' }).click()
  // Só segue quando a API confirmou.
  cy.contains('Alterações salvas.').should('be.visible')
})

When('removo o filme, confirmando a remoção', () => {
  cy.findByRole('button', { name: 'Remover filme' }).click()
  cy.findByRole('button', { name: 'Sim, remover' }).click()
})

Then('a página do filme mostra:', (table: DataTable) => {
  for (const texto of column(table.raw())) {
    cy.get('main').findAllByText(texto).should('have.length.at.least', 1)
  }
})

Then('o elenco do filme é:', (table: DataTable) => {
  cy.findByRole('region', { name: 'Elenco' })
    .findAllByRole('listitem')
    .should(($items) => {
      expect([...$items].map((item) => item.textContent)).to.deep.equal(column(table.raw()))
    })
})

Then('o pôster do filme aparece', () => {
  // A imagem enviada precisa chegar ao navegador, não só o endereço dela.
  cy.findByRole('img', { name: startingWith('Pôster de') }).should(($img) => {
    expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0)
  })
})
