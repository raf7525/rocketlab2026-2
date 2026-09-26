import { useId, useRef, useState } from 'react'
import { Link } from 'react-router'

import { cx } from '../../../shared/lib/cx'
import { formatDuration, pluralize } from '../../../shared/lib/format'
import { tmdbImage } from '../../../shared/lib/images'
import { useCatalogReturnState } from '../hooks/useBackToCatalog'
import type { MovieSummary } from '../types/movie'
import { AverageRating } from './AverageRating'
import { GenreList } from './GenreList'
import styles from './MovieCard.module.css'

/** Largura do popover mais o espaço até o card (ver MovieCard.module.css). */
const POPOVER_SPACE = 296

/**
 * Card do catálogo: pôster com a nota logo abaixo (como no Rotten Tomatoes) e, ao passar o
 * mouse ou focar pelo teclado, um popover com ano, duração e gêneros (como no AniList).
 */
export function MovieCard({ movie }: { movie: MovieSummary }) {
  const id = useId()
  const cardRef = useRef<HTMLElement>(null)
  const [popoverSide, setPopoverSide] = useState<'right' | 'left' | null>(null)
  const catalogReturn = useCatalogReturnState()

  function openPopover() {
    const card = cardRef.current?.getBoundingClientRect()
    // Abre à direita, como no AniList, a não ser que falte espaço até a borda da tela.
    const fitsRight = !card || card.right + POPOVER_SPACE <= window.innerWidth
    setPopoverSide(fitsRight ? 'right' : 'left')
  }

  function closePopover() {
    setPopoverSide(null)
  }

  const details = [
    // Duração 0 no CSV significa "desconhecida".
    movie.duracao_minutos ? formatDuration(movie.duracao_minutos) : null,
    movie.qtd_avaliacoes_usuarios === 0
      ? 'Sem avaliações'
      : pluralize(movie.qtd_avaliacoes_usuarios, 'avaliação', 'avaliações'),
  ]

  return (
    <article
      ref={cardRef}
      className={styles.card}
      onMouseEnter={openPopover}
      onMouseLeave={closePopover}
      onFocus={openPopover}
      onBlur={closePopover}
    >
      <Link
        to={`/filmes/${movie.sk_movie_id}`}
        state={catalogReturn}
        className={styles.link}
        aria-labelledby={`${id}-titulo`}
        aria-describedby={`${id}-detalhes`}
      >
        <div className={styles.poster}>
          {movie.url_poster ? (
            <img src={tmdbImage(movie.url_poster, 'w342')} alt="" loading="lazy" />
          ) : (
            <span className={styles.noPoster}>{movie.titulo}</span>
          )}
        </div>
        <div className={styles.rating}>
          <AverageRating summary={movie} />
        </div>
        <h3 id={`${id}-titulo`} className={styles.title}>
          {movie.titulo}
        </h3>
      </Link>

      <div
        id={`${id}-detalhes`}
        role="tooltip"
        hidden={popoverSide === null}
        className={cx(styles.popover, popoverSide === 'left' ? styles.left : styles.right)}
      >
        <p className={styles.year}>{movie.ano_lancamento ?? 'Sem data'}</p>
        <p className={styles.details}>{details.filter(Boolean).join(' · ')}</p>
        <div className={styles.genres}>
          <GenreList genres={movie.generos} />
        </div>
      </div>
    </article>
  )
}
