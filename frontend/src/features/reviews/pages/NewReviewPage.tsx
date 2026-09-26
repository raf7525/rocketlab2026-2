import { useParams } from 'react-router'

import { PageMessage } from '../../../shared/components/PageMessage'
import { ApiError } from '../../../shared/lib/api'
import { formatList } from '../../../shared/lib/format'
import { useBackToCatalog } from '../../movies/hooks/useBackToCatalog'
import { useMovie } from '../../movies/hooks/useMovies'
import { ReviewForm } from '../components/ReviewForm'
import styles from './NewReviewPage.module.css'

/** Avaliação logo depois do cadastro: publicar ou pular leva de volta ao catálogo. */
export function NewReviewPage() {
  const { movieId = '' } = useParams()
  const movie = useMovie(movieId)
  const backToCatalog = useBackToCatalog()

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
      <header className={styles.header}>
        <p className={styles.kicker}>Filme cadastrado</p>
        <h1 className={styles.title}>{data.titulo}</h1>
        <p className={styles.meta}>
          {data.ano_lancamento ? <span className={styles.year}>{data.ano_lancamento}</span> : null}
          {data.diretores.length > 0 && (
            <span>
              Dirigido por <span className={styles.directorNames}>{formatList(data.diretores)}</span>
            </span>
          )}
        </p>
      </header>

      <ReviewForm movieId={data.sk_movie_id} onPublished={backToCatalog} onSkip={backToCatalog} />
    </div>
  )
}
