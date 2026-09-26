import {
  keepPreviousData,
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type { Page } from '../../../shared/lib/api'
import { movieKeys } from '../../movies/hooks/useMovies'
import type { MovieDetail, MovieSummary } from '../../movies/types/movie'
import { addToWatchlist, fetchWatchlist, removeFromWatchlist } from '../api/watchlistApi'

export const watchlistKeys = {
  all: ['watchlist'] as const,
  page: (page: number) => [...watchlistKeys.all, page] as const,
}

export function useWatchlist(page: number) {
  return useQuery({
    queryKey: watchlistKeys.page(page),
    queryFn: () => fetchWatchlist(page),
    placeholderData: keepPreviousData,
  })
}

type Toggle = { movieId: string; save: boolean }

/**
 * Guarda ou tira um filme da watchlist. O ícone muda na hora em todo lugar em que o filme
 * aparece (catálogo, detalhe, watchlist); se a API falhar, tudo volta a como estava.
 */
export function useToggleWatchlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ movieId, save }: Toggle) =>
      save ? addToWatchlist(movieId) : removeFromWatchlist(movieId),
    onMutate: async ({ movieId, save }: Toggle) => {
      const keys = [movieKeys.all, watchlistKeys.all]
      await Promise.all(keys.map((queryKey) => queryClient.cancelQueries({ queryKey })))
      const snapshot = keys.flatMap((queryKey) => queryClient.getQueriesData({ queryKey }))
      markSaved(queryClient, movieId, save)
      return { snapshot }
    },
    onError: (_error, _toggle, context) => {
      context?.snapshot.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data))
    },
    // A lista da watchlist ganha ou perde o filme; o resto já está certo.
    onSettled: () => queryClient.invalidateQueries({ queryKey: watchlistKeys.all }),
  })
}

function markSaved(queryClient: QueryClient, movieId: string, saved: boolean) {
  const mark = <T extends MovieSummary>(movie: T): T =>
    movie.sk_movie_id === movieId ? { ...movie, na_watchlist: saved } : movie
  const markPage = (page: Page<MovieSummary> | undefined) =>
    page && { ...page, items: page.items.map(mark) }

  queryClient.setQueriesData<Page<MovieSummary>>({ queryKey: movieKeys.lists() }, markPage)
  queryClient.setQueriesData<Page<MovieSummary>>({ queryKey: watchlistKeys.all }, markPage)
  queryClient.setQueryData<MovieDetail>(movieKeys.detail(movieId), (movie) => movie && mark(movie))
}
