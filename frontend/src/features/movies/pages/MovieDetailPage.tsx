import { useParams } from 'react-router'

import { PageMessage } from '../../../shared/components/PageMessage'
import { ApiError } from '../../../shared/lib/api'
import { formatDuration } from '../../../shared/lib/format'
import { tmdbImage } from '../../../shared/lib/images'
import { MovieReviews } from '../../reviews/components/MovieReviews'
import { ReviewForm } from '../../reviews/components/ReviewForm'
import { AverageRating } from '../components/AverageRating'
import { GenreList } from '../components/GenreList'
import { useMovie } from '../hooks/useMovies'
import styles from './MovieDetailPage.module.css'

export function MovieDetailPage() {
  const { movieId = '' } = useParams()
  const movie = useMovie(movieId)

  if (movie.isPending) {
    return <p className={styles.loading}>Carregando filme…</p>
  }

  if (movie.isError) {
    if (movie.error instanceof ApiError && movie.error.status === 404) {
      return <PageMessage title={movie.error.message} />
    }
    return (
      <PageMessage title="Não foi possível carregar o filme.">
        <button type="button" onClick={() => movie.refetch()} className={styles.retry}>
          Tentar de novo
        </button>
      </PageMessage>
    )
  }

  const data = movie.data
  return (
    <div className={styles.page}>
      {data.url_backdrop && (
        <div
          aria-hidden="true"
          className={styles.backdrop}
          style={{ backgroundImage: `url("${tmdbImage(data.url_backdrop, 'w1280')}")` }}
        />
      )}

      <div className={styles.content}>
        <aside className={styles.side}>
          <div className={styles.poster}>
            {data.url_poster && (
              <img src={tmdbImage(data.url_poster, 'w500')} alt={`Pôster de ${data.titulo}`} />
            )}
          </div>
          <div className={styles.rating}>
            <AverageRating summary={data} size="lg" showCount />
          </div>
        </aside>

        <div className={styles.main}>
          <header className={styles.header}>
            <h1 className={styles.title}>{data.titulo}</h1>
            <p className={styles.meta}>
              {data.ano_lancamento ? (
                <span className={styles.year}>{data.ano_lancamento}</span>
              ) : null}
              {/* Duração 0 no CSV significa "desconhecida" (acontece em ~10 mil filmes). */}
              {data.duracao_minutos ? <span>{formatDuration(data.duracao_minutos)}</span> : null}
              {data.status_filme && data.status_filme !== 'Lançado' && (
                <span className={styles.status}>{data.status_filme}</span>
              )}
            </p>
            <GenreList genres={data.generos} />
          </header>

          {data.sinopse && <p className={styles.synopsis}>{data.sinopse}</p>}

          <ReviewForm movieId={data.sk_movie_id} />
          <MovieReviews movieId={data.sk_movie_id} />
        </div>
      </div>
    </div>
  )
}
