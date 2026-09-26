import { api, type Page } from '../../../shared/lib/api'
import type { MovieCreate, MovieDetail, MovieSummary } from '../types/movie'

export const CATALOG_PAGE_SIZE = 24

export function fetchMovies(page: number): Promise<Page<MovieSummary>> {
  return api.get(`/movies?page=${page}&page_size=${CATALOG_PAGE_SIZE}`)
}

export function fetchMovie(movieId: string): Promise<MovieDetail> {
  return api.get(`/movies/${encodeURIComponent(movieId)}`)
}

export function createMovie(data: MovieCreate): Promise<MovieDetail> {
  return api.post('/movies', data)
}

/** Os gêneros que um filme pode ter, em ordem alfabética. */
export function fetchGenres(): Promise<string[]> {
  return api.get('/genres')
}
