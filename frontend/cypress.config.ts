import { execFileSync } from 'node:child_process'

import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor'
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild'
import createBundler from '@bahmutov/cypress-esbuild-preprocessor'
import { defineConfig } from 'cypress'

/**
 * Testes ponta a ponta com Cucumber: cada história do desafio é um `.feature` em português em
 * `cypress/e2e/`, e os passos ficam em `cypress/support/step_definitions/`. Rode com
 * `npm run e2e`, que sobe a API e o front de teste e preenche as variáveis `E2E_*` abaixo.
 */
function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} não definida: rode os testes com "npm run e2e".`)
  return value
}

export default defineConfig({
  e2e: {
    baseUrl: process.env.E2E_BASE_URL,
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config)
      on('file:preprocessor', createBundler({ plugins: [createEsbuildPlugin(config)] }))
      on('task', {
        /** Volta o banco e a pasta de imagens aos dados fixos (`scripts/seed_e2e.py`). */
        resetDb() {
          execFileSync(
            required('E2E_PYTHON'),
            [
              '-m',
              'scripts.seed_e2e',
              '--database',
              required('E2E_DATABASE'),
              '--media-dir',
              required('E2E_MEDIA_DIR'),
            ],
            { cwd: required('E2E_BACKEND'), stdio: 'ignore' },
          )
          return null
        },
      })
      return config
    },
  },
})
