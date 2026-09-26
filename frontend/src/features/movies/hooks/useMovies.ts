import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createMovie, fetchGenres, fetchMovie, fetchMovies } from '../api/moviesApi'

export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (page: number) => [...movieKeys.lists(), page] as const,
  detail: (movieId: string) => [...movieKeys.all, 'detail', movieId] as const,
}

export const genreKeys = {
  all: ['genres'] as const,
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

/** Os gêneros só mudam com uma nova carga dos CSVs: uma busca por visita basta. */
export function useGenres() {
  return useQuery({
    queryKey: genreKeys.all,
    queryFn: fetchGenres,
    staleTime: Infinity,
  })
}

export function useCreateMovie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMovie,
    // A resposta já é o detalhe do filme novo; as páginas do catálogo ganharam um filme.
    onSuccess: (movie) => {
      queryClient.setQueryData(movieKeys.detail(movie.sk_movie_id), movie)
      return queryClient.invalidateQueries({ queryKey: movieKeys.lists() })
    },
  })
}
