import { useId } from 'react'
import { Link, useSearchParams } from 'react-router'

import { Pagination } from '../../../shared/components/Pagination'
import { SectionHeading } from '../../../shared/components/SectionHeading'
import { pluralize } from '../../../shared/lib/format'
import { PopularReviews } from '../../reviews/components/PopularReviews'
import { CATALOG_PAGE_SIZE } from '../api/moviesApi'
import { CatalogSearch } from '../components/CatalogSearch'
import { MovieCard } from '../components/MovieCard'
import { useMovies } from '../hooks/useMovies'
import { catalogUrl, hasFilters, readFilters } from '../lib/catalogSearch'
import styles from './CatalogPage.module.css'

export function CatalogPage() {
  const headingId = useId()
  const [searchParams] = useSearchParams()
  const page = parsePage(searchParams.get('pagina'))
  const filters = readFilters(searchParams)
  const searching = hasFilters(filters)
  const movies = useMovies(page, filters)

  return (
    <div className={styles.page}>
      <h1 className="visually-hidden">Filmes</h1>

      <div className={styles.catalog}>
        {/* A key recria o formulário quando a busca muda por fora (link, voltar, limpar). */}
        <CatalogSearch key={catalogUrl(filters)} filters={filters} />

        <section aria-labelledby={headingId}>
          <SectionHeading
            id={headingId}
            aside={movies.data && pluralize(movies.data.total, 'filme', 'filmes')}
          >
            Catálogo
          </SectionHeading>

          {movies.isPending && <CatalogSkeleton />}

          {movies.isError && !movies.data && (
            <div role="alert" className={styles.message}>
              <p>Não foi possível carregar o catálogo.</p>
              <button type="button" onClick={() => movies.refetch()} className={styles.retry}>
                Tentar de novo
              </button>
            </div>
          )}

          {movies.data?.total === 0 && (
            <p className={styles.message}>
              {searching ? 'Nenhum filme encontrado.' : 'Nenhum filme no catálogo ainda.'}
            </p>
          )}

          {movies.data && movies.data.total > 0 && movies.data.items.length === 0 && (
            <p className={styles.message}>
              Esta página não existe.{' '}
              <Link to={catalogUrl(filters)}>Ir para a primeira página</Link>
            </p>
          )}

          {movies.data && movies.data.items.length > 0 && (
            <>
              <ul role="list" aria-busy={movies.isPlaceholderData} className={styles.grid}>
                {movies.data.items.map((movie) => (
                  <li key={movie.sk_movie_id}>
                    <MovieCard movie={movie} />
                  </li>
                ))}
              </ul>
              <Pagination
                page={movies.data.page}
                pages={movies.data.pages}
                toPage={(target) => catalogUrl(filters, target)}
              />
            </>
          )}
        </section>
      </div>

      {/* Durante uma busca, só os resultados interessam. */}
      {!searching && <PopularReviews />}
    </div>
  )
}

/** "?pagina=2" → 2; valores ausentes ou inválidos voltam para a primeira página. */
function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 ? page : 1
}

function CatalogSkeleton() {
  return (
    <>
      <p className="visually-hidden">Carregando filmes…</p>
      <ul aria-hidden="true" className={styles.grid}>
        {Array.from({ length: CATALOG_PAGE_SIZE }, (_, index) => (
          <li key={index}>
            <div className={styles.skeletonPoster} />
            <div className={styles.skeletonLine} />
          </li>
        ))}
      </ul>
    </>
  )
}
