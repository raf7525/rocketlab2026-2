import { Before } from '@badeball/cypress-cucumber-preprocessor'

// Cada cenário começa dos mesmos dados fixos (backend/scripts/seed_e2e.py): nenhum depende do
// que outro cadastrou, editou ou apagou.
Before(() => {
  cy.task('resetDb')
})
