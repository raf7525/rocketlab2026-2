import { useEffect, useId, useRef, useState } from 'react'

import { SectionHeading } from '../../../shared/components/SectionHeading'
import { pluralize } from '../../../shared/lib/format'
import { useDeleteMovie, useUpdateMovie } from '../hooks/useMovies'
import type { MovieDetail } from '../types/movie'
import { MovieForm } from './MovieForm'
import styles from './MovieEditor.module.css'

type Props = {
  movie: MovieDetail
  /** Depois de salvar: a página volta a mostrar o filme. */
  onSaved: () => void
  onCancel: () => void
  /** Depois de remover: a página do filme não existe mais. */
  onDeleted: () => void
}

/** Edição do filme (título, ano, direção, gêneros e sinopse) e remoção com confirmação. */
export function MovieEditor({ movie, onSaved, onCancel, onDeleted }: Props) {
  const headingId = useId()
  const updateMovie = useUpdateMovie(movie.sk_movie_id)

  return (
    <section aria-labelledby={headingId} className={styles.editor}>
      <SectionHeading id={headingId}>Editar filme</SectionHeading>
      <MovieForm
        mode="edit"
        labelledBy={headingId}
        initial={{
          titulo: movie.titulo,
          ano_lancamento: movie.ano_lancamento,
          diretores: movie.diretores,
          generos: movie.generos,
          sinopse: movie.sinopse,
          elenco: movie.elenco,
        }}
        pending={updateMovie.isPending}
        error={updateMovie.error}
        onSubmit={(data) => updateMovie.mutate(data, { onSuccess: onSaved })}
        onCancel={onCancel}
      />
      <DeleteMovie movie={movie} onDeleted={onDeleted} />
    </section>
  )
}

function DeleteMovie({ movie, onDeleted }: { movie: MovieDetail; onDeleted: () => void }) {
  const deleteMovie = useDeleteMovie(movie.sk_movie_id)
  const [confirming, setConfirming] = useState(false)
  const keepRef = useRef<HTMLButtonElement>(null)
  const removeRef = useRef<HTMLButtonElement>(null)
  const reviews = movie.qtd_avaliacoes_usuarios
  const consequence =
    reviews === 0
      ? 'O filme ainda não tem avaliações.'
      : `${pluralize(reviews, 'avaliação', 'avaliações')} também ${
          reviews === 1 ? 'será apagada' : 'serão apagadas'
        }.`

  // O foco segue a pergunta (na opção segura) e volta ao botão quando a pessoa desiste.
  useEffect(() => {
    if (confirming) keepRef.current?.focus()
  }, [confirming])

  function cancel() {
    setConfirming(false)
    requestAnimationFrame(() => removeRef.current?.focus())
  }

  if (!confirming) {
    return (
      <div className={styles.danger}>
        <p className={styles.dangerText}>
          Remover o filme apaga também as avaliações dele. Não dá para desfazer.
        </p>
        <button
          ref={removeRef}
          type="button"
          onClick={() => setConfirming(true)}
          className={styles.remove}
        >
          Remover filme
        </button>
      </div>
    )
  }

  return (
    <div className={styles.danger}>
      <p className={styles.dangerText}>
        <strong className={styles.question}>Remover “{movie.titulo}”?</strong>{' '}
        {consequence}
      </p>
      <div className={styles.confirmActions}>
        <button
          type="button"
          aria-disabled={deleteMovie.isPending}
          onClick={() => {
            if (!deleteMovie.isPending) deleteMovie.mutate(undefined, { onSuccess: onDeleted })
          }}
          className={styles.confirm}
        >
          {deleteMovie.isPending ? 'Removendo…' : 'Sim, remover'}
        </button>
        <button ref={keepRef} type="button" onClick={cancel} className={styles.keep}>
          Não remover
        </button>
      </div>
      {deleteMovie.isError && (
        <p role="alert" className={styles.error}>
          {deleteMovie.error.message}
        </p>
      )}
    </div>
  )
}
