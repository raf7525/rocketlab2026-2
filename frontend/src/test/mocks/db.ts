/**
 * Banco em memória que o MSW usa no lugar do backend, nos testes e no `npm run dev:mock`.
 * Guarda as linhas como nas tabelas; os handlers montam as respostas da API a partir delas.
 */

/**
 * Linha de `dim_movies` já com os nomes dos gêneros (via `bridge_movie_genre`) e dos diretores
 * (via `bridge_movie_person` e `dim_people`).
 */
export type MovieRow = {
  sk_movie_id: string
  titulo: string
  data_lancamento: string | null
  ano_lancamento: number | null
  duracao_minutos: number | null
  status_filme: string | null
  sinopse: string | null
  url_poster: string | null
  url_backdrop: string | null
  generos: string[]
  diretores: string[]
}

/** Linha de `movie_reviews`. */
export type ReviewRow = {
  sk_movie_review_id: string
  sk_movie_id: string
  nome: string
  nota: number
  comentario: string
  created_at: string
  curtidas: number
}

type Db = {
  movies: MovieRow[]
  reviews: ReviewRow[]
  /** Os nomes em `dim_genres`: os únicos gêneros que um filme cadastrado pode ter. */
  genres: string[]
}

export const db: Db = { movies: [], reviews: [], genres: [] }

/** Troca todo o conteúdo do banco; sem argumentos, deixa-o vazio. */
export function seedDb({ movies = [], reviews = [], genres = [] }: Partial<Db> = {}): void {
  db.movies = structuredClone(movies)
  db.reviews = structuredClone(reviews)
  db.genres = [...genres]
}
