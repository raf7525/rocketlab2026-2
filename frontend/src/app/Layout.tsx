import { Link, Outlet, ScrollRestoration } from 'react-router'

import styles from './Layout.module.css'

const USING_MOCKS = import.meta.env.VITE_API_MOCKS === 'true'

export function Layout() {
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
          {USING_MOCKS && (
            <span
              className={styles.mockBadge}
              title="API simulada no navegador (MSW) com uma amostra dos CSVs. Recarregar a página desfaz as mudanças."
            >
              dados de exemplo
            </span>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <ScrollRestoration />
    </>
  )
}
