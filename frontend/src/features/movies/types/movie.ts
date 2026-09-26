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
  /** Nomes em ordem alfabética; vazio quando o CSV não traz o diretor. */
  diretores: string[]
  /** Atores e atrizes em ordem alfabética (o CSV não traz a ordem dos créditos). */
  elenco: string[]
}

/**
 * Busca e filtros do catálogo (`GET /movies?busca=&genero=&diretor=&ator=`), combinados entre si.
 * Título, direção e elenco aceitam parte do nome; o gênero precisa ser o nome inteiro.
 */
export type MovieFilters = {
  busca?: string
  genero?: string
  diretor?: string
  ator?: string
}

/**
 * Dados para cadastrar um filme (`MovieCreate`): `POST /movies` devolve o `MovieDetail`.
 * A edição (`PUT /movies/{id}`) usa os mesmos campos e substitui todos eles.
 */
export type MovieCreate = {
  titulo: string
  ano_lancamento: number
  diretores: string[]
  /** Nomes que precisam existir em `GET /genres`. */
  generos: string[]
  sinopse: string | null
  /** Atores e atrizes; opcional (pode ir vazio). Na edição, troca o elenco do filme. */
  elenco: string[]
}
