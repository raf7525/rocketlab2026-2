import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchMovie, fetchMovies } from '../api/moviesApi'

export const movieKeys = {
  all: ['movies'] as const,
  list: (page: number) => [...movieKeys.all, 'list', page] as const,
  detail: (movieId: string) => [...movieKeys.all, 'detail', movieId] as const,
}

/** Uma página do catálogo. Ao trocar de página, a anterior continua na tela até a nova chegar. */
export function useMovies(page: number) {
  return useQuery({
    queryKey: movieKeys.list(page),
    queryFn: () => fetchMovies(page),
    placeholderData: keepPreviousData,
  })
}

export function useMovie(movieId: string) {
  return useQuery({
    queryKey: movieKeys.detail(movieId),
    queryFn: () => fetchMovie(movieId),
  })
}
