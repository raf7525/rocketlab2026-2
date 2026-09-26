import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { makeMovieRow, makeReviewRow } from '../../../test/factories'
import { db, seedDb } from '../../../test/mocks/db'
import { server } from '../../../test/mocks/server'
import { renderApp } from '../../../test/utils'

const GENRES = ['Action', 'Drama', 'Science Fiction']

const movie = makeMovieRow({
  sk_movie_id: 'blue-beetle',
  duracao_minutos: 128,
  status_filme: 'Lançado',
  url_poster: 'https://image.tmdb.org/t/p/w500/blue-beetle.jpg',
  titulo: 'Blue Beetle',
  ano_lancamento: 2023,
  generos: ['Action', 'Science Fiction'],
  diretores: ['Angel Manuel Soto'],
  elenco: ['Xolo Maridueña'],
  sinopse: 'Jaime Reyes ganha uma armadura alienígena.',
})

type User = ReturnType<typeof renderApp>['user']

async function openEditing(user: User) {
  await user.click(await screen.findByRole('button', { name: 'Edição' }))
  return screen.getByRole('form', { name: 'Editar filme' })
}

describe('Edição do filme', () => {
  it('troca o formulário de avaliação pelo do filme, já preenchido', async () => {
    seedDb({ genres: GENRES, movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')

    const form = await openEditing(user)

    expect(screen.getByRole('button', { name: 'Edição' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('form', { name: 'Avaliar este filme' })).not.toBeInTheDocument()
    expect(within(form).getByRole('textbox', { name: 'Título' })).toHaveValue('Blue Beetle')
    expect(within(form).getByRole('textbox', { name: 'Ano de lançamento' })).toHaveValue('2023')
    expect(within(form).getByRole('textbox', { name: 'Direção' })).toHaveValue('Angel Manuel Soto')
    expect(within(form).getByRole('textbox', { name: /Elenco/ })).toHaveValue('Xolo Maridueña')
    expect(within(form).getByRole('textbox', { name: /Sinopse/ })).toHaveValue(
      'Jaime Reyes ganha uma armadura alienígena.',
    )
    expect(await within(form).findByRole('checkbox', { name: 'Action' })).toBeChecked()
    expect(within(form).getByRole('checkbox', { name: 'Drama' })).not.toBeChecked()
    // A pergunta "já assistiu?" é só do cadastro.
    expect(within(form).queryByRole('radio')).not.toBeInTheDocument()
  })

  it('salva o resumo novo e volta a mostrar o filme', async () => {
    seedDb({ genres: GENRES, movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')
    const form = await openEditing(user)
    const synopsis = within(form).getByRole('textbox', { name: /Sinopse/ })
    await within(form).findByRole('checkbox', { name: 'Action' })

    await user.clear(synopsis)
    await user.type(synopsis, 'Um jovem se une a um escaravelho alienígena.')
    await user.click(within(form).getByRole('button', { name: 'Salvar alterações' }))

    // A página já tem a região de status do formulário de avaliação.
    expect(await screen.findByText('Alterações salvas.')).toHaveAttribute('role', 'status')
    expect(screen.getByText('Um jovem se une a um escaravelho alienígena.')).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: 'Editar filme' })).not.toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Avaliar este filme' })).toBeInTheDocument()
    expect(db.movies).toEqual([
      expect.objectContaining({
        titulo: 'Blue Beetle',
        sinopse: 'Um jovem se une a um escaravelho alienígena.',
        elenco: ['Xolo Maridueña'],
      }),
    ])
  })

  it('salva título, ano, direção e gêneros', async () => {
    seedDb({ genres: GENRES, movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')
    const form = await openEditing(user)
    const title = within(form).getByRole('textbox', { name: 'Título' })
    const director = within(form).getByRole('textbox', { name: 'Direção' })

    await user.clear(title)
    await user.type(title, 'Besouro Azul')
    await user.clear(director)
    await user.type(director, 'Ángel Manuel Soto')
    await user.click(await within(form).findByRole('checkbox', { name: 'Drama' }))
    await user.click(within(form).getByRole('button', { name: 'Salvar alterações' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Besouro Azul' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ángel Manuel Soto' })).toBeInTheDocument()
    expect(db.movies[0]).toEqual(
      expect.objectContaining({
        titulo: 'Besouro Azul',
        diretores: ['Ángel Manuel Soto'],
        generos: ['Action', 'Drama', 'Science Fiction'],
      }),
    )
  })

  it('troca o elenco', async () => {
    seedDb({ genres: GENRES, movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')
    const form = await openEditing(user)
    const cast = within(form).getByRole('textbox', { name: /Elenco/ })
    await within(form).findByRole('checkbox', { name: 'Action' })

    await user.clear(cast)
    await user.type(cast, 'Xolo Maridueña, Bruna Marquezine')
    await user.click(within(form).getByRole('button', { name: 'Salvar alterações' }))

    await screen.findByText('Alterações salvas.')
    const castSection = screen.getByRole('region', { name: 'Elenco' })
    expect(within(castSection).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Bruna Marquezine',
      'Xolo Maridueña',
    ])
    expect(db.movies[0].elenco).toEqual(['Bruna Marquezine', 'Xolo Maridueña'])
  })

  it('edita duração e status, e mantém o pôster que não foi mexido', async () => {
    seedDb({ genres: GENRES, movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')
    const form = await openEditing(user)
    const duration = within(form).getByRole('textbox', { name: /Duração/ })
    await within(form).findByRole('checkbox', { name: 'Action' })

    expect(duration).toHaveValue('128')
    expect(within(form).getByRole('img', { name: 'Prévia do pôster' })).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w342/blue-beetle.jpg',
    )
    await user.clear(duration)
    await user.type(duration, '127')
    await user.selectOptions(within(form).getByRole('combobox', { name: 'Status' }), 'Planejado')
    await user.click(within(form).getByRole('button', { name: 'Salvar alterações' }))

    await screen.findByText('Alterações salvas.')
    expect(screen.getByText('Planejado')).toBeInTheDocument()
    expect(db.movies[0]).toEqual(
      expect.objectContaining({
        duracao_minutos: 127,
        status_filme: 'Planejado',
        url_poster: 'https://image.tmdb.org/t/p/w500/blue-beetle.jpg',
      }),
    )
  })

  it('troca o pôster por uma imagem enviada', async () => {
    seedDb({ genres: GENRES, movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')
    const form = await openEditing(user)
    await within(form).findByRole('checkbox', { name: 'Action' })

    await user.upload(
      within(form).getByLabelText(/Pôster/),
      new File(['png'], 'novo.png', { type: 'image/png' }),
    )
    await user.click(within(form).getByRole('button', { name: 'Salvar alterações' }))

    await screen.findByText('Alterações salvas.')
    expect(db.movies[0].url_poster).toMatch(/^\/api\/v1\/posters\/.+\.png$/)
    expect(screen.getByRole('img', { name: 'Pôster de Blue Beetle' })).toHaveAttribute(
      'src',
      db.movies[0].url_poster,
    )
  })

  it('remove o pôster', async () => {
    seedDb({ genres: GENRES, movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')
    const form = await openEditing(user)
    await within(form).findByRole('checkbox', { name: 'Action' })

    await user.click(within(form).getByRole('button', { name: 'Remover imagem' }))
    expect(within(form).queryByRole('img', { name: 'Prévia do pôster' })).not.toBeInTheDocument()
    await user.click(within(form).getByRole('button', { name: 'Salvar alterações' }))

    await screen.findByText('Alterações salvas.')
    expect(db.movies[0].url_poster).toBeNull()
  })

  it('cancelar descarta as mudanças', async () => {
    seedDb({ genres: GENRES, movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')
    const form = await openEditing(user)

    await user.type(within(form).getByRole('textbox', { name: 'Título' }), ' 2')
    await user.click(within(form).getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Blue Beetle' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Avaliar este filme' })).toBeInTheDocument()
    expect(db.movies[0].titulo).toBe('Blue Beetle')
  })

  it('não salva sem os campos obrigatórios', async () => {
    seedDb({ genres: GENRES, movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')
    const form = await openEditing(user)

    await user.clear(within(form).getByRole('textbox', { name: 'Título' }))
    await user.click(within(form).getByRole('button', { name: 'Salvar alterações' }))

    expect(within(form).getByText('Informe o título.')).toBeInTheDocument()
    expect(db.movies[0].titulo).toBe('Blue Beetle')
  })

  it('mostra o erro da API sem sair da edição', async () => {
    server.use(
      http.put('/api/v1/movies/:movieId', () =>
        HttpResponse.json({ detail: 'Gênero desconhecido: Action.' }, { status: 422 }),
      ),
    )
    seedDb({ genres: GENRES, movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')
    const form = await openEditing(user)
    await within(form).findByRole('checkbox', { name: 'Action' })

    await user.click(within(form).getByRole('button', { name: 'Salvar alterações' }))

    expect(await within(form).findByRole('alert')).toHaveTextContent('Gênero desconhecido: Action.')
    expect(screen.getByRole('form', { name: 'Editar filme' })).toBeInTheDocument()
  })

  it('remove o filme depois de confirmar e volta ao catálogo', async () => {
    seedDb({
      genres: GENRES,
      movies: [movie, makeMovieRow({ titulo: 'Gran Turismo' })],
      reviews: [makeReviewRow({ sk_movie_id: 'blue-beetle' })],
    })
    const { user, router } = renderApp('/?pagina=1')
    const catalogBefore = await screen.findByRole('region', { name: 'Catálogo' })
    await user.click(await within(catalogBefore).findByRole('link', { name: 'Blue Beetle' }))
    await openEditing(user)

    await user.click(screen.getByRole('button', { name: 'Remover filme' }))
    expect(screen.getByText(/Remover “Blue Beetle”\?/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sim, remover' }))

    const catalog = await screen.findByRole('region', { name: 'Catálogo' })
    expect(await within(catalog).findByText('1 filme')).toBeInTheDocument()
    expect(within(catalog).queryByRole('link', { name: 'Blue Beetle' })).not.toBeInTheDocument()
    expect(router.state.location.search).toBe('?pagina=1')
    expect(db.movies.map((row) => row.titulo)).toEqual(['Gran Turismo'])
    expect(db.reviews).toHaveLength(0)
  })

  it('desistir de remover mantém o filme', async () => {
    seedDb({ genres: GENRES, movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')
    await openEditing(user)

    await user.click(screen.getByRole('button', { name: 'Remover filme' }))
    await user.click(screen.getByRole('button', { name: 'Não remover' }))

    expect(screen.getByRole('button', { name: 'Remover filme' })).toBeInTheDocument()
    expect(db.movies).toHaveLength(1)
  })

  it('clicar de novo em Edição fecha a edição', async () => {
    seedDb({ genres: GENRES, movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')
    await openEditing(user)

    await user.click(screen.getByRole('button', { name: 'Edição' }))

    expect(screen.getByRole('button', { name: 'Edição' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('form', { name: 'Avaliar este filme' })).toBeInTheDocument()
  })
})
