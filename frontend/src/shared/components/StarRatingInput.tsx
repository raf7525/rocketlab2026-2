import { useId, useState } from 'react'

import { cx } from '../lib/cx'
import { MAX_SCORE, starsLabel } from '../lib/ratings'
import styles from './StarRatingInput.module.css'

type Props = {
  legend: string
  /** Nota de 1 a 10, ou `null` enquanto nada foi escolhido. */
  value: number | null
  onChange: (nota: number) => void
  /** Id da mensagem de erro, quando houver. */
  describedBy?: string
}

const SCORES = Array.from({ length: MAX_SCORE }, (_, i) => i + 1)

/**
 * Cinco estrelas divididas ao meio: cada metade é um radio, então o valor vai de 1 (½ estrela)
 * a 10 (5 estrelas), a escala do backend. As setas do teclado também trocam a nota.
 */
export function StarRatingInput({ legend, value, onChange, describedBy }: Props) {
  const name = useId()
  const [hovered, setHovered] = useState<number | null>(null)
  // Com o mouse sobre as estrelas, estrelas e número mostram a prévia; fora delas, a nota escolhida.
  const shown = hovered ?? value

  return (
    <fieldset className={styles.fieldset} aria-describedby={describedBy}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.row}>
        <div className={styles.stars} onMouseLeave={() => setHovered(null)}>
          {SCORES.map((score) => (
            <label
              key={score}
              className={cx(
                styles.half,
                score % 2 === 1 ? styles.left : styles.right,
                shown !== null && score <= shown && styles.filled,
              )}
              onMouseEnter={() => setHovered(score)}
            >
              <input
                type="radio"
                name={name}
                value={score}
                checked={value === score}
                onChange={() => onChange(score)}
                className="visually-hidden"
              />
              <span aria-hidden="true" className={styles.glyph}>
                ★
              </span>
              <span className="visually-hidden">{starsLabel(score / 2)}</span>
            </label>
          ))}
        </div>
        <span className={styles.value}>{shown === null ? '–' : `${shown}/${MAX_SCORE}`}</span>
      </div>
    </fieldset>
  )
}
