/** Avaliação de um filme como a API devolve (`MovieReviewRead`), já com as curtidas. */
export type MovieReview = {
  sk_movie_review_id: string
  sk_movie_id: string
  nome: string
  nota: number
  comentario: string
  created_at: string
  estrelas: number
  curtidas: number
}

/** Dados para publicar uma avaliação (`MovieReviewCreate`). */
export type MovieReviewCreate = {
  nome: string
  nota: number
  comentario: string
}

/** O suficiente do filme para mostrar pôster, título e ano ao lado da review. */
export type ReviewedMovie = {
  sk_movie_id: string
  titulo: string
  ano_lancamento: number | null
  url_poster: string | null
}

/** Review da lista de populares: `GET /reviews/popular`. */
export type PopularReview = MovieReview & { filme: ReviewedMovie }
