import styles from './GenreList.module.css'

/** Gêneros como etiquetas coloridas, como no popover do AniList. */
export function GenreList({ genres }: { genres: string[] }) {
  if (genres.length === 0) return null

  return (
    <ul role="list" aria-label="Gêneros" className={styles.genres}>
      {genres.map((genre) => (
        <li key={genre} className={styles.genre}>
          {genre}
        </li>
      ))}
    </ul>
  )
}
