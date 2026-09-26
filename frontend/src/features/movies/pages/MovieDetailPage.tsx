import { useId, useState } from 'react'
import { Link, useParams } from 'react-router'

import { PageMessage } from '../../../shared/components/PageMessage'
import { SectionHeading } from '../../../shared/components/SectionHeading'
import { ApiError } from '../../../shared/lib/api'
import { formatDuration, formatListParts } from '../../../shared/lib/format'
import { tmdbImage } from '../../../shared/lib/images'
import { MovieReviews } from '../../reviews/components/MovieReviews'
import { ReviewForm } from '../../reviews/components/ReviewForm'
import { AverageRating } from '../components/AverageRating'
import { GenreList } from '../components/GenreList'
import { MovieEditor } from '../components/MovieEditor'
import { useBackToCatalog } from '../hooks/useBackToCatalog'
import { useMovie } from '../hooks/useMovies'
import { catalogUrl } from '../lib/catalogSearch'
import styles from './MovieDetailPage.module.css'

export function MovieDetailPage() {
  const { movieId = '' } = useParams()
  const movie = useMovie(movieId)
  const backToCatalog = useBackToCatalog()
  // Guardam o id: ao abrir outro filme, a página não continua em edição nem com o aviso antigo.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const editing = editingId === movieId

  function toggleEditing() {
    setEditingId(editing ? null : movieId)
    setSavedId(null)
  }

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
        <button type="button" onClick={backToCatalog} className={styles.back}>
          <span aria-hidden="true">←</span> Voltar ao catálogo
        </button>
        {/* Na edição, o formulário do filme toma o lugar do de avaliação. */}
        <button
          type="button"
          aria-pressed={editing}
          onClick={toggleEditing}
          className={styles.editToggle}
        >
          <span aria-hidden="true">✎</span> Edição
        </button>

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
            {data.diretores.length > 0 && (
              <p className={styles.directors}>
                Dirigido por{' '}
                <span className={styles.directorNames}>
                  {formatListParts(data.diretores).map((part, index) =>
                    part.type === 'element' ? (
                      <Link key={index} to={catalogUrl({ diretor: part.value })}>
                        {part.value}
                      </Link>
                    ) : (
                      part.value
                    ),
                  )}
                </span>
              </p>
            )}
            <GenreList genres={data.generos} />
          </header>

          {data.sinopse && <p className={styles.synopsis}>{data.sinopse}</p>}

          {data.elenco.length > 0 && <Cast names={data.elenco} />}

          {/* Depois de avaliar, a pessoa volta para onde estava no catálogo. */}
          <p role="status" className={styles.saved}>
            {savedId === movieId && 'Alterações salvas.'}
          </p>

          {editing ? (
            <MovieEditor
              movie={data}
              onSaved={() => {
                setEditingId(null)
                setSavedId(movieId)
              }}
              onCancel={() => setEditingId(null)}
              onDeleted={backToCatalog}
            />
          ) : (
            <ReviewForm movieId={data.sk_movie_id} onPublished={backToCatalog} />
          )}
          <MovieReviews movieId={data.sk_movie_id} />
        </div>
      </div>
    </div>
  )
}

/** Elenco como as etiquetas do Letterboxd; cada nome abre o catálogo com os filmes da pessoa. */
function Cast({ names }: { names: string[] }) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId}>
      <SectionHeading id={headingId}>Elenco</SectionHeading>
      <ul role="list" className={styles.cast}>
        {names.map((name) => (
          <li key={name}>
            <Link to={catalogUrl({ ator: name })} className={styles.castMember}>
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
