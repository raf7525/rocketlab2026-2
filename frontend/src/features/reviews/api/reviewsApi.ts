import { api } from '../../../shared/lib/api'
import type { MovieReview, MovieReviewCreate, PopularReview } from '../types/review'

export const POPULAR_REVIEWS_LIMIT = 6

export function fetchMovieReviews(movieId: string): Promise<MovieReview[]> {
  return api.get(`/movies/${encodeURIComponent(movieId)}/reviews`)
}

export function createMovieReview(movieId: string, data: MovieReviewCreate): Promise<MovieReview> {
  return api.post(`/movies/${encodeURIComponent(movieId)}/reviews`, data)
}

/** As reviews mais curtidas, de qualquer filme. */
export function fetchPopularReviews(limit = POPULAR_REVIEWS_LIMIT): Promise<PopularReview[]> {
  return api.get(`/reviews/popular?limit=${limit}`)
}

export function likeReview(review: MovieReview): Promise<MovieReview> {
  return api.post(likesPath(review))
}

export function unlikeReview(review: MovieReview): Promise<MovieReview> {
  return api.delete(likesPath(review))
}

function likesPath(review: MovieReview): string {
  const movieId = encodeURIComponent(review.sk_movie_id)
  const reviewId = encodeURIComponent(review.sk_movie_review_id)
  return `/movies/${movieId}/reviews/${reviewId}/likes`
}
