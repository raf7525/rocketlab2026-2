import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { movieKeys } from '../../movies/hooks/useMovies'
import { createMovieReview, fetchMovieReviews, fetchPopularReviews } from '../api/reviewsApi'
import type { MovieReviewCreate } from '../types/review'

export const reviewKeys = {
  all: ['reviews'] as const,
  movie: (movieId: string) => [...reviewKeys.all, 'movie', movieId] as const,
  popular: () => [...reviewKeys.all, 'popular'] as const,
}

export function useMovieReviews(movieId: string) {
  return useQuery({
    queryKey: reviewKeys.movie(movieId),
    queryFn: () => fetchMovieReviews(movieId),
  })
}

export function usePopularReviews() {
  return useQuery({
    queryKey: reviewKeys.popular(),
    queryFn: () => fetchPopularReviews(),
  })
}

export function useCreateReview(movieId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MovieReviewCreate) => createMovieReview(movieId, data),
    // A nova avaliação muda a lista e a média do filme, tanto no detalhe quanto no catálogo.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: reviewKeys.all }),
        queryClient.invalidateQueries({ queryKey: movieKeys.all }),
      ]),
  })
}
