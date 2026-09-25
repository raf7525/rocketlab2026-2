import { Link, type To } from 'react-router'

import styles from './Pagination.module.css'

type Props = {
  page: number
  pages: number
  /** Endereço de cada página, para que ela possa ser aberta direto ou em outra aba. */
  toPage: (page: number) => To
}

export function Pagination({ page, pages, toPage }: Props) {
  if (pages <= 1) return null

  return (
    <nav aria-label="Paginação" className={styles.pagination}>
      {page > 1 ? (
        <Link to={toPage(page - 1)} aria-label="Página anterior" className={styles.step}>
          ← Anterior
        </Link>
      ) : (
        <span aria-hidden="true" className={styles.stepDisabled}>
          ← Anterior
        </span>
      )}
      <span className={styles.current}>
        Página {page} de {pages}
      </span>
      {page < pages ? (
        <Link to={toPage(page + 1)} aria-label="Próxima página" className={styles.step}>
          Próxima →
        </Link>
      ) : (
        <span aria-hidden="true" className={styles.stepDisabled}>
          Próxima →
        </span>
      )}
    </nav>
  )
}
