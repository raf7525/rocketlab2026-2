import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { makeMovieRow } from '../../../test/factories'
import { db, seedDb } from '../../../test/mocks/db'
import { server } from '../../../test/mocks/server'
import { renderApp } from '../../../test/utils'
import { CATALOG_PAGE_SIZE } from '../api/moviesApi'

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

function answerWatched(user: User, answer: 'Sim, já assisti' | 'Ainda não') {
  return user.click(screen.getByRole('radio', { name: answer }))
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

  it('cadastra o filme de quem ainda não assistiu e volta ao catálogo', async () => {
    seedDb({ genres: GENRES, movies: [makeMovieRow({ titulo: 'Blue Beetle' })] })
    const { user } = renderApp('/')

    await user.click(await screen.findByRole('link', { name: 'Adicionar filme' }))
    await fillRequiredFields(user)
    await user.type(screen.getByRole('textbox', { name: /Sinopse/ }), 'Um hacker descobre a verdade.')
    await answerWatched(user, 'Ainda não')
    await submit(user)

    const catalog = await screen.findByRole('region', { name: 'Catálogo' })
    expect(await within(catalog).findByText('2 filmes')).toBeInTheDocument()
    expect(within(catalog).getByRole('link', { name: 'Matrix' })).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: 'Avaliar este filme' })).not.toBeInTheDocument()
    expect(db.movies).toEqual([
      expect.objectContaining({ titulo: 'Blue Beetle' }),
      expect.objectContaining({
        titulo: 'Matrix',
        ano_lancamento: 1999,
        diretores: ['Lana Wachowski', 'Lilly Wachowski'],
        generos: ['Action', 'Science Fiction'],
        sinopse: 'Um hacker descobre a verdade.',
      }),
    ])
  })

  it('cadastra o filme de quem já assistiu e abre a avaliação dele', async () => {
    const { user } = setup()

    await fillRequiredFields(user)
    await answerWatched(user, 'Sim, já assisti')
    await submit(user)

    expect(await screen.findByRole('heading', { level: 1, name: 'Matrix' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Avaliar este filme' })).toBeInTheDocument()
    expect(db.movies).toEqual([expect.objectContaining({ titulo: 'Matrix' })])
  })

  it('cadastra o elenco, com os nomes separados por vírgula', async () => {
    const { user } = setup()

    await fillRequiredFields(user)
    await user.type(
      screen.getByRole('textbox', { name: /Elenco/ }),
      'Keanu Reeves, Carrie-Anne Moss, keanu reeves',
    )
    await answerWatched(user, 'Sim, já assisti')
    await submit(user)

    await screen.findByRole('form', { name: 'Avaliar este filme' })
    expect(db.movies).toEqual([
      expect.objectContaining({ titulo: 'Matrix', elenco: ['Carrie-Anne Moss', 'Keanu Reeves'] }),
    ])
  })

  it('o elenco é opcional', async () => {
    const { user } = setup()

    await fillRequiredFields(user)
    await answerWatched(user, 'Ainda não')
    await submit(user)

    await screen.findByRole('region', { name: 'Catálogo' })
    expect(db.movies).toEqual([expect.objectContaining({ titulo: 'Matrix', elenco: [] })])
  })

  it('depois de avaliar, volta para a página do catálogo de onde saiu', async () => {
    seedDb({
      genres: GENRES,
      movies: Array.from({ length: CATALOG_PAGE_SIZE + 1 }, () => makeMovieRow()),
    })
    const { user, router } = renderApp('/?pagina=2')

    await user.click(await screen.findByRole('link', { name: 'Adicionar filme' }))
    await fillRequiredFields(user)
    await answerWatched(user, 'Sim, já assisti')
    await submit(user)
    await screen.findByRole('form', { name: 'Avaliar este filme' })
    await user.type(screen.getByRole('textbox', { name: 'Seu nome' }), 'Rafael')
    await user.click(screen.getByRole('radio', { name: '4 estrelas' }))
    await user.type(screen.getByRole('textbox', { name: 'Resenha' }), 'Clássico.')
    await user.click(screen.getByRole('button', { name: 'Publicar avaliação' }))

    expect(await screen.findByRole('region', { name: 'Catálogo' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?pagina=2')
    const matrix = db.movies.find((movie) => movie.titulo === 'Matrix')
    expect(db.reviews).toEqual([
      expect.objectContaining({ sk_movie_id: matrix?.sk_movie_id, nome: 'Rafael', nota: 8 }),
    ])
  })

  it('pula a avaliação e volta ao catálogo', async () => {
    seedDb({ genres: GENRES })
    const { user } = renderApp('/')

    await user.click(await screen.findByRole('link', { name: 'Adicionar filme' }))
    await fillRequiredFields(user)
    await answerWatched(user, 'Sim, já assisti')
    await submit(user)
    await user.click(await screen.findByRole('button', { name: 'Agora não' }))

    expect(await screen.findByRole('region', { name: 'Catálogo' })).toBeInTheDocument()
    expect(db.movies).toHaveLength(1)
    expect(db.reviews).toHaveLength(0)
  })

  it('volta ao início do catálogo quando o cadastro não foi aberto por ele', async () => {
    const { user, router } = setup()

    await fillRequiredFields(user)
    await answerWatched(user, 'Ainda não')
    await submit(user)

    expect(await screen.findByRole('region', { name: 'Catálogo' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('não envia sem título, ano, direção, gênero e sem dizer se já assistiu', async () => {
    const { user } = setup()
    await screen.findByRole('checkbox', { name: 'Action' })

    await submit(user)

    expect(screen.getByText('Informe o título.')).toBeInTheDocument()
    expect(screen.getByText('Informe o ano de lançamento.')).toBeInTheDocument()
    expect(screen.getByText('Informe quem dirigiu o filme.')).toBeInTheDocument()
    expect(screen.getByText('Escolha pelo menos um gênero.')).toBeInTheDocument()
    expect(screen.getByText('Diga se você já assistiu ao filme.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Título' })).toHaveFocus()
    expect(db.movies).toHaveLength(0)
  })

  it('pede a resposta sobre ter assistido quando só ela falta', async () => {
    const { user } = setup()
    await fillRequiredFields(user)

    await submit(user)

    expect(screen.getByText('Diga se você já assistiu ao filme.')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Sim, já assisti' })).toHaveFocus()
    expect(db.movies).toHaveLength(0)
  })

  it('recusa um ano fora do intervalo aceito', async () => {
    const { user } = setup()
    await fillRequiredFields(user)
    await answerWatched(user, 'Ainda não')
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
    await answerWatched(user, 'Ainda não')
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
