import type { ReactNode } from 'react'
import { Link } from 'react-router'

import styles from './PageMessage.module.css'

/** Página inteira de aviso (endereço inexistente, filme não encontrado…). */
export function PageMessage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={styles.message}>
      <h1 className={styles.title}>{title}</h1>
      {children}
      <Link to="/" className={styles.back}>
        Voltar ao catálogo
      </Link>
    </div>
  )
}
