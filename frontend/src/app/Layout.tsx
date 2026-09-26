import { Link, Outlet, ScrollRestoration } from 'react-router'

import { useCatalogReturnState } from '../features/movies/hooks/useBackToCatalog'

import styles from './Layout.module.css'

const USING_MOCKS = import.meta.env.VITE_API_MOCKS === 'true'

export function Layout() {
  // Quem cadastra a partir do catálogo volta para a mesma página dele no fim do cadastro.
  const catalogReturn = useCatalogReturnState()

  return (
    <>
      <header className={styles.header}>
        <div className={styles.bar}>
          <Link to="/" className={styles.brand}>
            <span aria-hidden="true" className={styles.logo}>
              ★
            </span>
            RocketLab <span className={styles.brandSuffix}>filmes</span>
          </Link>
          <div className={styles.actions}>
            {USING_MOCKS && (
              <span
                className={styles.mockBadge}
                title="API simulada no navegador (MSW) com uma amostra dos CSVs. Recarregar a página desfaz as mudanças."
              >
                dados de exemplo
              </span>
            )}
            <Link to="/filmes/novo" state={catalogReturn} className={styles.addMovie}>
              <span aria-hidden="true">+</span>
              <span className={styles.addMovieText}>Adicionar filme</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <ScrollRestoration />
    </>
  )
}
