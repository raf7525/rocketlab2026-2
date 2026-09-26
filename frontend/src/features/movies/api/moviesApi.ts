import { api, type Page } from '../../../shared/lib/api'
import type { MovieCreate, MovieDetail, MovieFilters, MovieSummary } from '../types/movie'

export const CATALOG_PAGE_SIZE = 24

export function fetchMovies(page: number, filters: MovieFilters = {}): Promise<Page<MovieSummary>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(CATALOG_PAGE_SIZE) })
  for (const [name, value] of Object.entries(filters)) {
    if (value) params.set(name, value)
  }
  return api.get(`/movies?${params}`)
}

export function fetchMovie(movieId: string): Promise<MovieDetail> {
  return api.get(`/movies/${encodeURIComponent(movieId)}`)
}

export function createMovie(data: MovieCreate): Promise<MovieDetail> {
  return api.post('/movies', data)
}

/** Troca título, ano, direção, gêneros e sinopse; o resto do filme continua igual. */
export function updateMovie(movieId: string, data: MovieCreate): Promise<MovieDetail> {
  return api.put(`/movies/${encodeURIComponent(movieId)}`, data)
}

/** Remove o filme junto com as avaliações dele. */
export function deleteMovie(movieId: string): Promise<void> {
  return api.delete(`/movies/${encodeURIComponent(movieId)}`)
}

/** Os gêneros que um filme pode ter, em ordem alfabética. */
export function fetchGenres(): Promise<string[]> {
  return api.get('/genres')
}
