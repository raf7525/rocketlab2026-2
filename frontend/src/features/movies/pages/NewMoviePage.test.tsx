import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { makeMovieRow } from '../../../test/factories'
import { db, seedDb } from '../../../test/mocks/db'
import { server } from '../../../test/mocks/server'
import { renderApp } from '../../../test/utils'

const GENRES = ['Action', 'Drama', 'Science Fiction']

function setup() {
  seedDb({ genres: GENRES })
  return renderApp('/filmes/novo')
}

type User = ReturnType<typeof setup>['user']

async function fillRequiredFields(user: User) {
  await user.type(screen.getByRole('textbox', { name: 'Título' }), 'Matrix')
  await user.type(screen.getByRole('textbox', { name: 'Ano de lançamento' }), '1999')
  await user.type(
    screen.getByRole('textbox', { name: 'Direção' }),
    'Lana Wachowski, Lilly Wachowski',
  )
  await user.click(await screen.findByRole('checkbox', { name: 'Action' }))
  await user.click(screen.getByRole('checkbox', { name: 'Science Fiction' }))
}

function submit(user: User) {
  return user.click(screen.getByRole('button', { name: 'Cadastrar filme' }))
}

describe('NewMoviePage', () => {
  it('oferece os gêneros do catálogo para escolher', async () => {
    setup()

    const genres = await screen.findByRole('group', { name: 'Gêneros' })

    expect(await within(genres).findAllByRole('checkbox')).toHaveLength(3)
    expect(within(genres).getByRole('checkbox', { name: 'Drama' })).not.toBeChecked()
  })

  it('cadastra o filme e abre a página dele', async () => {
    const { user } = setup()

    await fillRequiredFields(user)
    await user.type(screen.getByRole('textbox', { name: /Sinopse/ }), 'Um hacker descobre a verdade.')
    await submit(user)

    expect(await screen.findByRole('heading', { level: 1, name: 'Matrix' })).toBeInTheDocument()
    expect(screen.getByText('Lana Wachowski e Lilly Wachowski')).toBeInTheDocument()
    expect(screen.getByText('1999')).toBeInTheDocument()
    expect(screen.getByText('Science Fiction')).toBeInTheDocument()
    expect(screen.getByText('Um hacker descobre a verdade.')).toBeInTheDocument()
    expect(db.movies).toEqual([
      expect.objectContaining({
        titulo: 'Matrix',
        ano_lancamento: 1999,
        diretores: ['Lana Wachowski', 'Lilly Wachowski'],
        generos: ['Action', 'Science Fiction'],
        sinopse: 'Um hacker descobre a verdade.',
      }),
    ])
  })

  it('o filme cadastrado aparece no catálogo', async () => {
    seedDb({ genres: GENRES, movies: [makeMovieRow({ titulo: 'Blue Beetle' })] })
    const { user } = renderApp('/')

    await user.click(await screen.findByRole('link', { name: 'Adicionar filme' }))
    await fillRequiredFields(user)
    await submit(user)
    await screen.findByRole('heading', { level: 1, name: 'Matrix' })
    await user.click(screen.getByRole('link', { name: /RocketLab/ }))

    const catalog = await screen.findByRole('region', { name: 'Catálogo' })
    expect(await within(catalog).findByRole('link', { name: 'Matrix' })).toBeInTheDocument()
    expect(within(catalog).getByText('2 filmes')).toBeInTheDocument()
  })

  it('não envia sem título, ano, direção e gênero', async () => {
    const { user } = setup()
    await screen.findByRole('checkbox', { name: 'Action' })

    await submit(user)

    expect(screen.getByText('Informe o título.')).toBeInTheDocument()
    expect(screen.getByText('Informe o ano de lançamento.')).toBeInTheDocument()
    expect(screen.getByText('Informe quem dirigiu o filme.')).toBeInTheDocument()
    expect(screen.getByText('Escolha pelo menos um gênero.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Título' })).toHaveFocus()
    expect(db.movies).toHaveLength(0)
  })

  it('recusa um ano fora do intervalo aceito', async () => {
    const { user } = setup()
    await fillRequiredFields(user)
    const year = screen.getByRole('textbox', { name: 'Ano de lançamento' })

    await user.clear(year)
    await user.type(year, '1700')
    await submit(user)

    expect(screen.getByText('O ano precisa estar entre 1888 e 2100.')).toBeInTheDocument()
    expect(year).toHaveFocus()
    expect(db.movies).toHaveLength(0)
  })

  it('mostra o erro da API sem perder o que foi preenchido', async () => {
    server.use(
      http.post('/api/v1/movies', () =>
        HttpResponse.json({ detail: 'Gênero desconhecido: Action.' }, { status: 422 }),
      ),
    )
    const { user } = setup()

    await fillRequiredFields(user)
    await submit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('Gênero desconhecido: Action.')
    expect(screen.getByRole('textbox', { name: 'Título' })).toHaveValue('Matrix')
  })

  it('avisa quando não consegue carregar os gêneros e permite tentar de novo', async () => {
    server.use(
      http.get('/api/v1/genres', () => HttpResponse.json({}, { status: 500 }), { once: true }),
    )
    const { user } = setup()

    expect(await screen.findByText('Não foi possível carregar os gêneros.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('checkbox', { name: 'Drama' })).toBeInTheDocument()
  })
})
