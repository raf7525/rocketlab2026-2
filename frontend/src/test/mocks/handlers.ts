/**
 * Handlers do MSW que imitam a API do backend, seguindo as mesmas regras (validação, média
 * recalculada a partir das avaliações, 404 com "Filme não encontrado."). Ao mudar uma rota no
 * backend (`backend/app/<domínio>/router.py`), mude aqui também.
 */
import { delay, http, HttpResponse, type PathParams } from 'msw'

import type { MovieDetail, MovieSummary, RatingSummary } from '../../features/movies/types/movie'
import type { MovieReview, PopularReview } from '../../features/reviews/types/review'
import { scoreToStars } from '../../shared/lib/ratings'
import { db, type MovieRow, type ReviewRow } from './db'

const API = '/api/v1'

export const handlers = [
  http.get(`${API}/movies`, async ({ request }) => {
    await delay()
    const params = new URL(request.url).searchParams
    const page = Math.max(1, Number(params.get('page') ?? 1))
    const pageSize = Math.max(1, Number(params.get('page_size') ?? 24))
    const start = (page - 1) * pageSize
    return HttpResponse.json({
      items: db.movies.slice(start, start + pageSize).map(toMovieSummary),
      total: db.movies.length,
      page,
      page_size: pageSize,
      pages: Math.ceil(db.movies.length / pageSize),
    })
  }),

  http.get(`${API}/movies/:movieId`, async ({ params }) => {
    await delay()
    const movie = findMovie(params)
    return movie ? HttpResponse.json(toMovieDetail(movie)) : movieNotFound()
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

function findMovie(params: PathParams): MovieRow | undefined {
  return db.movies.find((movie) => movie.sk_movie_id === params.movieId)
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
