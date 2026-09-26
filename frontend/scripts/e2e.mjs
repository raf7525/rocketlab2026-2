/**
 * Testes ponta a ponta: sobe uma API e um front só para os testes, com um banco SQLite
 * temporário, roda o Cypress e desliga tudo no fim.
 *
 *   npm run e2e        roda os cenários sem abrir janela
 *   npm run e2e:open   abre a interface do Cypress
 *
 * As portas (8001 e 5175) não são as do `npm run dev` nem as do uvicorn de sempre, então dá para
 * rodar os testes com a aplicação aberta. O banco de verdade (`backend/rocketlab.db`) não é usado.
 */
import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const FRONTEND = resolve(import.meta.dirname, '..')
const BACKEND = resolve(FRONTEND, '../backend')
const PYTHON = join(
  BACKEND,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
)
const BIN = join(FRONTEND, 'node_modules', '.bin')
const API_URL = 'http://localhost:8001'
const WEB_URL = 'http://localhost:5175'

const mode = process.argv[2] === 'open' ? 'open' : 'run'
const dir = mkdtempSync(join(tmpdir(), 'rocketlab-e2e-'))
const database = join(dir, 'e2e.db')
const mediaDir = join(dir, 'media')

// O VS Code liga ELECTRON_RUN_AS_NODE nos terminais dele; com ela, o Electron do Cypress age como
// Node e não abre o navegador ("bad option: --no-sandbox").
const { ELECTRON_RUN_AS_NODE: _, ...baseEnv } = process.env
const env = {
  ...baseEnv,
  // Para a API de teste.
  DATABASE_URL: `sqlite+aiosqlite:///${database}`,
  MEDIA_DIR: mediaDir,
  ENVIRONMENT: 'test',
  // Para o Vite de teste.
  API_PROXY_TARGET: API_URL,
  // Para o Cypress (cypress.config.ts): onde está o front e como recriar o banco.
  E2E_BASE_URL: WEB_URL,
  E2E_PYTHON: PYTHON,
  E2E_BACKEND: BACKEND,
  E2E_DATABASE: database,
  E2E_MEDIA_DIR: mediaDir,
}

const servers = []
let exitCode = 1
try {
  // Cria o banco (migrações e dados fixos); o Cypress o recria antes de cada cenário.
  run(PYTHON, ['-m', 'scripts.seed_e2e', '--database', database, '--media-dir', mediaDir], BACKEND)
  servers.push(start(PYTHON, ['-m', 'uvicorn', 'app.main:app', '--port', '8001'], BACKEND))
  servers.push(start(join(BIN, 'vite'), ['--port', '5175', '--strictPort'], FRONTEND))
  await Promise.all([waitFor(`${API_URL}/health`), waitFor(WEB_URL)])
  exitCode = spawnSync(join(BIN, 'cypress'), [mode], { cwd: FRONTEND, env, stdio: 'inherit' })
    .status
} catch (error) {
  console.error(`\n[e2e] ${error.message}`)
} finally {
  servers.forEach((server) => server.kill())
  rmSync(dir, { recursive: true, force: true })
}
process.exit(exitCode ?? 1)

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`falhou: ${command} ${args.join(' ')}`)
}

/** Servidor em segundo plano; a saída só aparece se algo der errado. */
function start(command, args, cwd) {
  const server = spawn(command, args, { cwd, env, stdio: ['ignore', 'ignore', 'pipe'] })
  let errors = ''
  server.stderr.on('data', (chunk) => (errors += chunk))
  server.on('exit', (code) => {
    if (code) console.error(`\n[e2e] ${command} saiu com código ${code}:\n${errors}`)
  })
  return server
}

async function waitFor(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // Ainda subindo.
    }
    await new Promise((done) => setTimeout(done, 300))
  }
  throw new Error(`${url} não respondeu em ${timeoutMs / 1000} s`)
}
