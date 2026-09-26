import type { MovieSummary } from '../features/movies/types/movie'
import type { MovieRow, ReviewRow } from './mocks/db'

let sequence = 0

function next(): number {
  sequence += 1
  return sequence
}

export function makeMovieRow(overrides: Partial<MovieRow> = {}): MovieRow {
  const n = next()
  return {
    sk_movie_id: `filme-${n}`,
    titulo: `Filme ${n}`,
    data_lancamento: '2023-08-18',
    ano_lancamento: 2023,
    duracao_minutos: 128,
    status_filme: 'Lançado',
    sinopse: 'Um adolescente encontra uma relíquia alienígena.',
    url_poster: `https://image.tmdb.org/t/p/w500/poster-${n}.jpg`,
    url_backdrop: `https://image.tmdb.org/t/p/w1280/fundo-${n}.jpg`,
    generos: ['Action'],
    diretores: ['Angel Manuel Soto'],
    elenco: ['Xolo Maridueña'],
    ...overrides,
  }
}

export function makeReviewRow(overrides: Partial<ReviewRow> = {}): ReviewRow {
  const n = next()
  return {
    sk_movie_review_id: `review-${n}`,
    sk_movie_id: 'filme-sem-id',
    nome: `Pessoa ${n}`,
    nota: 8,
    comentario: 'Ótimo entretenimento, não decepciona.',
    created_at: `2026-09-${String((n % 28) + 1).padStart(2, '0')}T12:00:00.000000`,
    curtidas: 0,
    ...overrides,
  }
}

export function makeMovieSummary(overrides: Partial<MovieSummary> = {}): MovieSummary {
  const n = next()
  return {
    sk_movie_id: `filme-${n}`,
    titulo: `Filme ${n}`,
    ano_lancamento: 2023,
    duracao_minutos: 128,
    na_watchlist: false,
    url_poster: `https://image.tmdb.org/t/p/w500/poster-${n}.jpg`,
    generos: ['Action'],
    qtd_avaliacoes_usuarios: 0,
    nota_media_usuarios: null,
    estrelas_media: null,
    ...overrides,
  }
}
