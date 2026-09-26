import type { MovieSummary } from '../types/movie'
import styles from './MovieGrid.module.css'
import { MovieCard } from './MovieCard'

/** Grade de cards de filme (catálogo, watchlist). Enquanto a próxima página carrega, esmaece. */
export function MovieGrid({ movies, busy = false }: { movies: MovieSummary[]; busy?: boolean }) {
  return (
    <ul role="list" aria-busy={busy} className={styles.grid}>
      {movies.map((movie) => (
        <li key={movie.sk_movie_id}>
          <MovieCard movie={movie} />
        </li>
      ))}
    </ul>
  )
}
