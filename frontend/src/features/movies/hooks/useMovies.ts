import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createMovie,
  deleteMovie,
  fetchGenres,
  fetchMovie,
  fetchMovies,
  updateMovie,
  uploadPoster,
} from '../api/moviesApi'
import type { MovieCreate, MovieFilters, PosterChange } from '../types/movie'

/** Dados do formulário mais o que fazer com o pôster. */
export type MovieSave = { data: MovieCreate; poster: PosterChange }

/** Envia o pôster novo (se houver) e devolve os dados do filme com o `url_poster` certo. */
async function withPoster({ data, poster }: MovieSave): Promise<MovieCreate> {
  if (poster instanceof File) return { ...data, url_poster: (await uploadPoster(poster)).url }
  if (poster === null) return { ...data, url_poster: null }
  return data
}

export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (page: number, filters: MovieFilters) => [...movieKeys.lists(), page, filters] as const,
  detail: (movieId: string) => [...movieKeys.all, 'detail', movieId] as const,
}

export const genreKeys = {
  all: ['genres'] as const,
}

/**
 * Uma página do catálogo, com a busca e os filtros aplicados. Ao trocar de página ou de busca, o
 * resultado anterior continua na tela até o novo chegar.
 */
export function useMovies(page: number, filters: MovieFilters = {}) {
  return useQuery({
    queryKey: movieKeys.list(page, filters),
    queryFn: () => fetchMovies(page, filters),
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
    // A imagem vai antes: se ela for recusada, o filme ainda não foi cadastrado.
    mutationFn: async (save: MovieSave) => createMovie(await withPoster(save)),
    // A resposta já é o detalhe do filme novo; as páginas do catálogo ganharam um filme.
    onSuccess: (movie) => {
      queryClient.setQueryData(movieKeys.detail(movie.sk_movie_id), movie)
      return queryClient.invalidateQueries({ queryKey: movieKeys.lists() })
    },
  })
}

export function useUpdateMovie(movieId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (save: MovieSave) => updateMovie(movieId, await withPoster(save)),
    // O detalhe já vem na resposta; título e gêneros também aparecem no catálogo e nas reviews,
    // que são atualizados em segundo plano (salvar não espera por eles).
    onSuccess: (movie) => {
      queryClient.setQueryData(movieKeys.detail(movieId), movie)
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: movieKeys.lists() }),
        // `reviewKeys.all`: importar de reviews criaria um ciclo entre os dois módulos.
        queryClient.invalidateQueries({ queryKey: ['reviews'] }),
      ])
    },
  })
}

export function useDeleteMovie(movieId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteMovie(movieId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: movieKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ['reviews'] }),
        // Sem buscar de novo agora: a página ainda aberta mostraria "Filme não encontrado".
        queryClient.invalidateQueries({
          queryKey: movieKeys.detail(movieId),
          refetchType: 'none',
        }),
      ]),
  })
}
