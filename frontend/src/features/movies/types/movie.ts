/** Os únicos valores de `status_filme` que aparecem nos CSVs (e que a API aceita). */
export const MOVIE_STATUSES = ['Lançado', 'Pós-Produção', 'Em Produção', 'Planejado'] as const
export type MovieStatus = (typeof MOVIE_STATUSES)[number]

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
  /** Se o filme está guardado na watchlist. */
  na_watchlist: boolean
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
  status?: string
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
  /** Em minutos, de 1 a 20000; `null` quando desconhecida. */
  duracao_minutos: number | null
  status_filme: MovieStatus | null
  /**
   * Endereço devolvido por `POST /posters` (ou um link de imagem). Na edição, ausente mantém o
   * pôster atual e `null` o remove.
   */
  url_poster?: string | null
}

/**
 * O que fazer com o pôster ao salvar: um arquivo novo é enviado antes do filme, `null` remove a
 * imagem e `undefined` mantém a atual.
 */
export type PosterChange = File | null | undefined
