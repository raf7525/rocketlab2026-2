import { api, type Page } from '../../../shared/lib/api'
import { CATALOG_PAGE_SIZE } from '../../movies/api/moviesApi'
import type { MovieSummary } from '../../movies/types/movie'

/** Filmes guardados, do mais recente para o mais antigo. */
export function fetchWatchlist(page: number): Promise<Page<MovieSummary>> {
  return api.get(`/watchlist?page=${page}&page_size=${CATALOG_PAGE_SIZE}`)
}

export function addToWatchlist(movieId: string): Promise<void> {
  return api.put(`/watchlist/${encodeURIComponent(movieId)}`)
}

export function removeFromWatchlist(movieId: string): Promise<void> {
  return api.delete(`/watchlist/${encodeURIComponent(movieId)}`)
}
