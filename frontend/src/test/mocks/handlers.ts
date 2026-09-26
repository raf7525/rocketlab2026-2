/**
 * Handlers do MSW que imitam a API do backend, seguindo as mesmas regras (validação, média
 * recalculada a partir das avaliações, 404 com "Filme não encontrado."). Ao mudar uma rota no
 * backend (`backend/app/<domínio>/router.py`), mude aqui também.
 */
import { delay, http, HttpResponse, type PathParams } from 'msw'

import {
  MOVIE_STATUSES,
  type MovieCreate,
  type MovieDetail,
  type MovieSummary,
  type RatingSummary,
} from '../../features/movies/types/movie'
import type { MovieReview, PopularReview } from '../../features/reviews/types/review'
import { scoreToStars } from '../../shared/lib/ratings'
import { db, type MovieRow, type ReviewRow } from './db'

const API = '/api/v1'

/** Mesmos limites de `app/posters/storage.py`. */
const POSTER_MAX_BYTES = 5 * 1024 * 1024
const POSTER_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export const handlers = [
  http.get(`${API}/movies`, async ({ request }) => {
    await delay()
    const params = new URL(request.url).searchParams
    const page = Math.max(1, Number(params.get('page') ?? 1))
    const pageSize = Math.max(1, Number(params.get('page_size') ?? 24))
    const start = (page - 1) * pageSize
    const movies = db.movies.filter(matchesFilters(params))
    return HttpResponse.json({
      items: movies.slice(start, start + pageSize).map(toMovieSummary),
      total: movies.length,
      page,
      page_size: pageSize,
      pages: Math.ceil(movies.length / pageSize),
    })
  }),

  http.post(`${API}/movies`, async ({ request }) => {
    await delay()
    const data = parseMovie(await request.json())
    if (!data) {
      return HttpResponse.json({ detail: [{ msg: 'Filme inválido.' }] }, { status: 422 })
    }
    const unknown = data.generos.filter((name) => !findGenre(name))
    if (unknown.length > 0) {
      const label = unknown.length === 1 ? 'Gênero desconhecido' : 'Gêneros desconhecidos'
      return HttpResponse.json({ detail: `${label}: ${unknown.join(', ')}.` }, { status: 422 })
    }
    const movie: MovieRow = {
      sk_movie_id: crypto.randomUUID(),
      titulo: data.titulo,
      data_lancamento: null,
      ano_lancamento: data.ano_lancamento,
      duracao_minutos: data.duracao_minutos ?? null,
      status_filme: data.status_filme ?? null,
      sinopse: data.sinopse,
      url_poster: data.url_poster ?? null,
      url_backdrop: null,
      generos: data.generos.map((name) => findGenre(name)!).sort(),
      diretores: [...data.diretores].sort(),
      elenco: [...(data.elenco ?? [])].sort(),
    }
    // Sem popularidade, o filme novo vai para o fim do catálogo, como no backend.
    db.movies.push(movie)
    return HttpResponse.json(toMovieDetail(movie), { status: 201 })
  }),

  http.get(`${API}/movies/:movieId`, async ({ params }) => {
    await delay()
    const movie = findMovie(params)
    return movie ? HttpResponse.json(toMovieDetail(movie)) : movieNotFound()
  }),

  http.put(`${API}/movies/:movieId`, async ({ params, request }) => {
    await delay()
    const movie = findMovie(params)
    if (!movie) return movieNotFound()
    const data = parseMovie(await request.json())
    if (!data) {
      return HttpResponse.json({ detail: [{ msg: 'Filme inválido.' }] }, { status: 422 })
    }
    const unknown = data.generos.filter((name) => !findGenre(name))
    if (unknown.length > 0) {
      const label = unknown.length === 1 ? 'Gênero desconhecido' : 'Gêneros desconhecidos'
      return HttpResponse.json({ detail: `${label}: ${unknown.join(', ')}.` }, { status: 422 })
    }
    // Como no backend: uma data de lançamento de outro ano sai; pôster, elenco etc. ficam.
    const releaseYear = movie.data_lancamento && Number(movie.data_lancamento.slice(0, 4))
    if (releaseYear && releaseYear !== data.ano_lancamento) movie.data_lancamento = null
    movie.titulo = data.titulo
    movie.ano_lancamento = data.ano_lancamento
    movie.sinopse = data.sinopse
    movie.generos = data.generos.map((name) => findGenre(name)!).sort()
    movie.diretores = [...data.diretores].sort()
    // Os opcionais que não vêm ficam como estão; vindo (mesmo nulos), são trocados.
    if (data.elenco) movie.elenco = [...data.elenco].sort()
    if (data.duracao_minutos !== undefined) movie.duracao_minutos = data.duracao_minutos
    if (data.status_filme !== undefined) movie.status_filme = data.status_filme
    if (data.url_poster !== undefined) {
      if (movie.url_poster !== data.url_poster) deletePoster(movie.url_poster)
      movie.url_poster = data.url_poster
    }
    return HttpResponse.json(toMovieDetail(movie))
  }),

  http.delete(`${API}/movies/:movieId`, async ({ params }) => {
    await delay()
    const movie = findMovie(params)
    if (!movie) return movieNotFound()
    db.movies = db.movies.filter((row) => row !== movie)
    deletePoster(movie.url_poster)
    db.reviews = db.reviews.filter((review) => review.sk_movie_id !== movie.sk_movie_id)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/posters`, async ({ request }) => {
    await delay()
    // O corpo é a própria imagem. O backend confere os primeiros bytes; aqui, o tipo informado
    // basta.
    const type = request.headers.get('Content-Type') ?? ''
    const extension = POSTER_EXTENSIONS[type]
    if (!extension) {
      return HttpResponse.json({ detail: 'Envie uma imagem JPG, PNG ou WebP.' }, { status: 422 })
    }
    const file = new Blob([await request.arrayBuffer()], { type })
    if (file.size > POSTER_MAX_BYTES) {
      return HttpResponse.json({ detail: 'A imagem pode ter até 5 MB.' }, { status: 422 })
    }
    const name = `${crypto.randomUUID().replaceAll('-', '')}${extension}`
    db.posters.set(name, file)
    return HttpResponse.json({ url: `${API}/posters/${name}` }, { status: 201 })
  }),

  // No `dev:mock`, o <img> do pôster enviado também passa pelo MSW.
  http.get(`${API}/posters/:name`, ({ params }) => {
    const file = db.posters.get(String(params.name))
    if (!file) return HttpResponse.json({ detail: 'Imagem não encontrada.' }, { status: 404 })
    return new HttpResponse(file, { headers: { 'Content-Type': file.type } })
  }),

  http.get(`${API}/genres`, async () => {
    await delay()
    return HttpResponse.json([...db.genres].sort())
  }),

  http.get(`${API}/movies/:movieId/reviews`, async ({ params }) => {
    await delay()
    const movie = findMovie(params)
    if (!movie) return movieNotFound()
    return HttpResponse.json(reviewsOf(movie.sk_movie_id).sort(newestFirst).map(toMovieReview))
  }),

  http.post(`${API}/movies/:movieId/reviews`, async ({ params, request }) => {
    await delay()
    const movie = findMovie(params)
    if (!movie) return movieNotFound()
    const data = parseReview(await request.json())
    if (!data) {
      return HttpResponse.json({ detail: [{ msg: 'Avaliação inválida.' }] }, { status: 422 })
    }
    const review: ReviewRow = {
      sk_movie_review_id: crypto.randomUUID(),
      sk_movie_id: movie.sk_movie_id,
      ...data,
      // O backend devolve UTC sem fuso, com microssegundos.
      created_at: new Date().toISOString().replace('Z', ''),
      curtidas: 0,
    }
    db.reviews.push(review)
    return HttpResponse.json(toMovieReview(review), { status: 201 })
  }),

  http.get(`${API}/movies/:movieId/reviews/summary`, async ({ params }) => {
    await delay()
    const movie = findMovie(params)
    return movie ? HttpResponse.json(ratingSummary(movie.sk_movie_id)) : movieNotFound()
  }),

  http.post(`${API}/movies/:movieId/reviews/:reviewId/likes`, async ({ params }) => {
    await delay()
    return changeLikes(params, +1)
  }),

  http.delete(`${API}/movies/:movieId/reviews/:reviewId/likes`, async ({ params }) => {
    await delay()
    return changeLikes(params, -1)
  }),

  http.get(`${API}/reviews/popular`, async ({ request }) => {
    await delay()
    const limit = Number(new URL(request.url).searchParams.get('limit') ?? 6)
    const popular = [...db.reviews]
      .sort((a, b) => b.curtidas - a.curtidas || newestFirst(a, b))
      .slice(0, limit)
    return HttpResponse.json(popular.map(toPopularReview))
  }),
]

/**
 * Mesmas regras do backend: título, direção e elenco por parte do texto, gênero pelo nome
 * inteiro, sem diferenciar maiúsculas; filtros em branco não filtram.
 */
function matchesFilters(params: URLSearchParams): (movie: MovieRow) => boolean {
  const value = (name: string) => params.get(name)?.trim().toLowerCase() || null
  const busca = value('busca')
  const genero = value('genero')
  const diretor = value('diretor')
  const ator = value('ator')
  // O status é comparado com a grafia exata, como no backend.
  const status = params.get('status') || null
  const someContains = (names: string[], part: string) =>
    names.some((name) => name.toLowerCase().includes(part))

  return (movie) =>
    (!busca || movie.titulo.toLowerCase().includes(busca)) &&
    (!genero || movie.generos.some((name) => name.toLowerCase() === genero)) &&
    (!status || movie.status_filme === status) &&
    (!diretor || someContains(movie.diretores, diretor)) &&
    (!ator || someContains(movie.elenco, ator))
}

function findMovie(params: PathParams): MovieRow | undefined {
  return db.movies.find((movie) => movie.sk_movie_id === params.movieId)
}

/** O nome do gênero como está no banco, sem diferenciar maiúsculas. */
function findGenre(name: string): string | undefined {
  return db.genres.find((genre) => genre.toLowerCase() === name.toLowerCase())
}

function reviewsOf(movieId: string): ReviewRow[] {
  return db.reviews.filter((review) => review.sk_movie_id === movieId)
}

function movieNotFound() {
  return HttpResponse.json({ detail: 'Filme não encontrado.' }, { status: 404 })
}

function newestFirst(a: ReviewRow, b: ReviewRow): number {
  return b.created_at.localeCompare(a.created_at)
}

/** Mesmas regras do `MovieReviewCreate`: textos aparados e obrigatórios, nota inteira de 0 a 10. */
function parseReview(body: unknown): Pick<ReviewRow, 'nome' | 'nota' | 'comentario'> | null {
  const { nome, nota, comentario } = (body ?? {}) as Record<string, unknown>
  if (typeof nome !== 'string' || typeof comentario !== 'string') return null
  if (typeof nota !== 'number' || !Number.isInteger(nota) || nota < 0 || nota > 10) return null
  const data = { nome: nome.trim(), nota, comentario: comentario.trim() }
  if (!data.nome || data.nome.length > 120) return null
  if (!data.comentario || data.comentario.length > 4000) return null
  return data
}

/**
 * Mesmas regras do `MovieCreate`: textos aparados, ano inteiro de 1888 a 2100, ao menos um
 * diretor e um gênero (repetidos contam uma vez), sinopse e elenco opcionais. O elenco fica
 * `undefined` quando não vem, para a edição saber que deve mantê-lo.
 */
type OptionalFields = 'elenco' | 'duracao_minutos' | 'status_filme' | 'url_poster'

function parseMovie(
  body: unknown,
): (Omit<MovieCreate, OptionalFields> & Partial<Pick<MovieCreate, OptionalFields>>) | null {
  const {
    titulo,
    ano_lancamento,
    diretores,
    generos,
    sinopse,
    elenco,
    duracao_minutos,
    status_filme,
    url_poster,
  } = (body ?? {}) as Record<string, unknown>
  if (typeof titulo !== 'string' || !titulo.trim() || titulo.trim().length > 500) return null
  if (typeof ano_lancamento !== 'number' || !Number.isInteger(ano_lancamento)) return null
  if (ano_lancamento < 1888 || ano_lancamento > 2100) return null
  if (sinopse != null && (typeof sinopse !== 'string' || sinopse.trim().length > 4000)) return null
  const directorNames = parseNames(diretores)
  const genreNames = parseNames(generos)
  if (!directorNames || !genreNames) return null
  const castNames = elenco === undefined ? undefined : parseNames(elenco, { allowEmpty: true })
  if (castNames === null) return null
  if (
    duracao_minutos != null &&
    (typeof duracao_minutos !== 'number' ||
      !Number.isInteger(duracao_minutos) ||
      duracao_minutos < 1 ||
      duracao_minutos > 20000)
  ) {
    return null
  }
  if (status_filme != null && !MOVIE_STATUSES.includes(status_filme as never)) return null
  if (url_poster != null && typeof url_poster !== 'string') return null
  return {
    titulo: titulo.trim(),
    ano_lancamento,
    diretores: directorNames,
    generos: genreNames,
    sinopse: sinopse?.trim() || null,
    elenco: castNames,
    duracao_minutos: duracao_minutos as MovieCreate['duracao_minutos'] | undefined,
    status_filme: status_filme as MovieCreate['status_filme'] | undefined,
    url_poster: url_poster as string | null | undefined,
  }
}

/** Lista com ao menos um nome (ou vazia, se permitido); cada um aparado, com até 255 caracteres. */
function parseNames(value: unknown, { allowEmpty = false } = {}): string[] | null {
  if (!Array.isArray(value) || (value.length === 0 && !allowEmpty)) return null
  const names = value.map((name) => (typeof name === 'string' ? name.trim() : ''))
  if (names.some((name) => !name || name.length > 255)) return null
  const unique = new Map<string, string>()
  for (const name of names) {
    if (!unique.has(name.toLowerCase())) unique.set(name.toLowerCase(), name)
  }
  return [...unique.values()]
}

/** Como no backend: apaga a imagem enviada que o filme deixou de usar. */
function deletePoster(url: string | null): void {
  const prefix = `${API}/posters/`
  if (url?.startsWith(prefix)) db.posters.delete(url.slice(prefix.length))
}

function changeLikes(params: PathParams, change: 1 | -1) {
  const review = db.reviews.find(
    (row) => row.sk_movie_review_id === params.reviewId && row.sk_movie_id === params.movieId,
  )
  if (!review) {
    return HttpResponse.json({ detail: 'Avaliação não encontrada.' }, { status: 404 })
  }
  review.curtidas = Math.max(0, review.curtidas + change)
  return HttpResponse.json(toMovieReview(review))
}

/** Como o backend: a média vem das avaliações individuais, arredondada em 2 casas. */
function ratingSummary(movieId: string): RatingSummary {
  const notas = reviewsOf(movieId).map((review) => review.nota)
  if (notas.length === 0) {
    return { qtd_avaliacoes_usuarios: 0, nota_media_usuarios: null, estrelas_media: null }
  }
  const media = Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 100) / 100
  return {
    qtd_avaliacoes_usuarios: notas.length,
    nota_media_usuarios: media,
    estrelas_media: scoreToStars(media),
  }
}

function toMovieSummary(movie: MovieRow): MovieSummary {
  return {
    sk_movie_id: movie.sk_movie_id,
    titulo: movie.titulo,
    ano_lancamento: movie.ano_lancamento,
    duracao_minutos: movie.duracao_minutos,
    url_poster: movie.url_poster,
    generos: movie.generos,
    ...ratingSummary(movie.sk_movie_id),
  }
}

function toMovieDetail(movie: MovieRow): MovieDetail {
  return {
    ...toMovieSummary(movie),
    data_lancamento: movie.data_lancamento,
    status_filme: movie.status_filme,
    sinopse: movie.sinopse,
    url_backdrop: movie.url_backdrop,
    diretores: movie.diretores,
    elenco: movie.elenco,
  }
}

function toMovieReview(review: ReviewRow): MovieReview {
  return { ...review, estrelas: scoreToStars(review.nota) }
}

function toPopularReview(review: ReviewRow): PopularReview {
  const movie = db.movies.find((row) => row.sk_movie_id === review.sk_movie_id)
  if (!movie) throw new Error(`Review ${review.sk_movie_review_id} sem filme no banco em memória.`)
  return {
    ...toMovieReview(review),
    filme: {
      sk_movie_id: movie.sk_movie_id,
      titulo: movie.titulo,
      ano_lancamento: movie.ano_lancamento,
      url_poster: movie.url_poster,
    },
  }
}
