import type { ReactNode } from 'react'

import styles from './SectionHeading.module.css'

type Props = {
  /** Id do título, para a seção usar em `aria-labelledby`. */
  id: string
  children: ReactNode
  /** Informação curta à direita (ex.: "30 filmes"). */
  aside?: ReactNode
}

/** Título de seção em caixa alta com uma linha embaixo, como "POPULAR REVIEWS" no Letterboxd. */
export function SectionHeading({ id, children, aside }: Props) {
  return (
    <div className={styles.heading}>
      <h2 id={id} className={styles.title}>
        {children}
      </h2>
      {aside && <span className={styles.aside}>{aside}</span>}
    </div>
  )
}
