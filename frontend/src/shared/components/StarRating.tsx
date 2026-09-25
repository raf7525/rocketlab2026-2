import { cx } from '../lib/cx'
import { formatStars, MAX_STARS } from '../lib/ratings'
import styles from './StarRating.module.css'

type Props = {
  stars: number
  /** Texto lido por leitores de tela; o padrão é "3,5 de 5 estrelas". */
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

/** Estrelas cheias seguidas de "½", como no Letterboxd. */
export function StarRating({ stars, label, size = 'md' }: Props) {
  const full = Math.floor(stars)
  const half = stars - full >= 0.5

  return (
    <span
      role="img"
      aria-label={label ?? `${formatStars(stars)} de ${MAX_STARS} estrelas`}
      className={cx(styles.stars, styles[size])}
    >
      {'★'.repeat(full)}
      {half && '½'}
    </span>
  )
}
