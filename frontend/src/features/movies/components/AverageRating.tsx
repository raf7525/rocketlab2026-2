import { StarRating } from '../../../shared/components/StarRating'
import { cx } from '../../../shared/lib/cx'
import { formatDecimal, pluralize } from '../../../shared/lib/format'
import type { RatingSummary } from '../types/movie'
import styles from './AverageRating.module.css'

type Props = {
  summary: RatingSummary
  size?: 'sm' | 'lg'
  /** Mostra também a quantidade de avaliações. */
  showCount?: boolean
}

/** Média do filme em estrelas e em número (na escala de 5, como as estrelas). */
export function AverageRating({ summary, size = 'sm', showCount = false }: Props) {
  const { nota_media_usuarios: media, estrelas_media: stars } = summary

  if (media === null || stars === null) {
    return <p className={cx(styles.rating, styles[size], styles.unrated)}>Sem avaliações</p>
  }

  const average = formatDecimal(media / 2)
  return (
    <p className={cx(styles.rating, styles[size])}>
      <StarRating stars={stars} size={size} label={`Nota média ${average} de 5`} />
      <span aria-hidden="true" className={styles.average}>
        {average}
      </span>
      {showCount && (
        <span className={styles.count}>
          {pluralize(summary.qtd_avaliacoes_usuarios, 'avaliação', 'avaliações')}
        </span>
      )}
    </p>
  )
}
