import { cx } from '../../../shared/lib/cx'
import type { MovieSummary } from '../../movies/types/movie'
import { useToggleWatchlist } from '../hooks/useWatchlist'
import { BookmarkIcon } from './BookmarkIcon'
import styles from './WatchlistButton.module.css'

type Props = {
  movie: Pick<MovieSummary, 'sk_movie_id' | 'titulo' | 'na_watchlist'>
  /**
   * `icon`: só o ícone, sobre o pôster dos cards (o nome leva o título, para distinguir os
   * vários botões do catálogo). `labeled`: ícone e texto, na página do filme.
   */
  variant: 'icon' | 'labeled'
  className?: string
}

/** Liga e desliga o filme na watchlist (`aria-pressed` diz se ele está salvo). */
export function WatchlistButton({ movie, variant, className }: Props) {
  const toggle = useToggleWatchlist()
  const saved = movie.na_watchlist

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={variant === 'icon' ? `Salvar ${movie.titulo} na watchlist` : undefined}
      title={saved ? 'Tirar da watchlist' : 'Salvar na watchlist'}
      onClick={() => toggle.mutate({ movieId: movie.sk_movie_id, save: !saved })}
      className={cx(styles.button, styles[variant], className)}
    >
      <BookmarkIcon filled={saved} className={styles.glyph} />
      {variant === 'labeled' && <span>Watchlist</span>}
    </button>
  )
}
