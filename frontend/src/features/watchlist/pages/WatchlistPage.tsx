import { useId } from 'react'
import { useSearchParams } from 'react-router'

import { Pagination } from '../../../shared/components/Pagination'
import { SectionHeading } from '../../../shared/components/SectionHeading'
import { pluralize } from '../../../shared/lib/format'
import { MovieGrid } from '../../movies/components/MovieGrid'
import { useBackToCatalog } from '../../movies/hooks/useBackToCatalog'
import { BookmarkIcon } from '../components/BookmarkIcon'
import { useWatchlist } from '../hooks/useWatchlist'
import styles from './WatchlistPage.module.css'

/** Os filmes guardados para assistir depois, do mais recente para o mais antigo. */
export function WatchlistPage() {
  const headingId = useId()
  const [searchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('pagina')) || 1)
  const watchlist = useWatchlist(page)
  const backToCatalog = useBackToCatalog()

  return (
    <div className={styles.page}>
      {/* Como no catálogo: o título da seção já diz onde se está. */}
      <h1 className="visually-hidden">Watchlist</h1>

      <button type="button" onClick={backToCatalog} className={styles.back}>
        <span aria-hidden="true">←</span> Voltar ao catálogo
      </button>

      <section aria-labelledby={headingId}>
        <SectionHeading
          id={headingId}
          aside={watchlist.data && pluralize(watchlist.data.total, 'filme', 'filmes')}
        >
          Watchlist
        </SectionHeading>

        {watchlist.isPending && <p className={styles.message}>Carregando a watchlist…</p>}

        {watchlist.isError && !watchlist.data && (
          <div role="alert" className={styles.message}>
            <p>Não foi possível carregar a watchlist.</p>
            <button type="button" onClick={() => watchlist.refetch()} className={styles.retry}>
              Tentar de novo
            </button>
          </div>
        )}

        {watchlist.data?.total === 0 && (
          <p className={styles.message}>
            Nenhum filme na watchlist ainda. Use o ícone{' '}
            <BookmarkIcon filled={false} className={styles.inlineIcon} /> nos filmes para guardar o
            que você quer assistir.
          </p>
        )}

        {watchlist.data && watchlist.data.items.length > 0 && (
          <>
            <MovieGrid movies={watchlist.data.items} busy={watchlist.isPlaceholderData} />
            <Pagination
              page={watchlist.data.page}
              pages={watchlist.data.pages}
              toPage={(target) => (target === 1 ? '/watchlist' : `/watchlist?pagina=${target}`)}
            />
          </>
        )}
      </section>
    </div>
  )
}
