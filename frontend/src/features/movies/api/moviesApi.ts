import { api, type Page } from '../../../shared/lib/api'
import type { MovieDetail, MovieSummary } from '../types/movie'

export const CATALOG_PAGE_SIZE = 24

export function fetchMovies(page: number): Promise<Page<MovieSummary>> {
  return api.get(`/movies?page=${page}&page_size=${CATALOG_PAGE_SIZE}`)
}

export function fetchMovie(movieId: string): Promise<MovieDetail> {
  return api.get(`/movies/${encodeURIComponent(movieId)}`)
}
