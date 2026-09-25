export type TmdbSize = 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original'

const TMDB_IMAGE = /^(https:\/\/image\.tmdb\.org\/t\/p\/)[^/]+\//

/**
 * As URLs do CSV apontam para o TMDB num tamanho fixo (w500 no pôster, w1280 no fundo).
 * Pedir o tamanho que a tela realmente usa deixa o catálogo bem mais leve.
 */
export function tmdbImage(url: string, size: TmdbSize): string {
  return url.replace(TMDB_IMAGE, `$1${size}/`)
}
