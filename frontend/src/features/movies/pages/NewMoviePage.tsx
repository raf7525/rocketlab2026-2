import { useId } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { MovieForm } from '../components/MovieForm'
import { useBackToCatalog } from '../hooks/useBackToCatalog'
import { useCreateMovie } from '../hooks/useMovies'
import styles from './NewMoviePage.module.css'

/**
 * Cadastro de filme. Quem já assistiu segue para a avaliação do filme novo; quem ainda não
 * assistiu volta ao catálogo.
 */
export function NewMoviePage() {
  const headingId = useId()
  const location = useLocation()
  const navigate = useNavigate()
  const backToCatalog = useBackToCatalog()
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
        onSubmit={(data, { assistido }) =>
          createMovie.mutate(data, {
            onSuccess: (movie) => {
              if (!assistido) return backToCatalog()
              // O replace tira o formulário do histórico, e o state leva adiante o caminho de volta.
              navigate(`/filmes/${movie.sk_movie_id}/avaliar`, {
                replace: true,
                state: location.state,
              })
            },
          })
        }
      />
    </div>
  )
}
