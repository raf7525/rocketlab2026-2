import { useId } from 'react'
import { useNavigate } from 'react-router'

import { MovieForm } from '../components/MovieForm'
import { useCreateMovie } from '../hooks/useMovies'
import styles from './NewMoviePage.module.css'

/** Cadastro de filme; depois de salvo, abre a página do filme novo. */
export function NewMoviePage() {
  const headingId = useId()
  const navigate = useNavigate()
  const createMovie = useCreateMovie()

  return (
    <div className={styles.page}>
      <h1 id={headingId} className={styles.title}>
        Adicionar filme
      </h1>
      <MovieForm
        labelledBy={headingId}
        pending={createMovie.isPending}
        error={createMovie.error}
        onSubmit={(data) =>
          createMovie.mutate(data, {
            // Voltar depois do cadastro leva para onde eu estava, não para o formulário vazio.
            onSuccess: (movie) => navigate(`/filmes/${movie.sk_movie_id}`, { replace: true }),
          })
        }
      />
    </div>
  )
}
