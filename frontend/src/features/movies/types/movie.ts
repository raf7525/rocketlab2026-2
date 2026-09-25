/** Quantidade e média das avaliações do filme (o resumo guardado em `dim_reviews`). */
export type RatingSummary = {
  qtd_avaliacoes_usuarios: number
  nota_media_usuarios: number | null
  estrelas_media: number | null
}

/** Filme como aparece no catálogo: `GET /movies`. */
export type MovieSummary = RatingSummary & {
  sk_movie_id: string
  titulo: string
  ano_lancamento: number | null
  duracao_minutos: number | null
  url_poster: string | null
  generos: string[]
}

/** Filme com os dados da página de detalhe: `GET /movies/{sk_movie_id}`. */
export type MovieDetail = MovieSummary & {
  data_lancamento: string | null
  status_filme: string | null
  sinopse: string | null
  url_backdrop: string | null
}
