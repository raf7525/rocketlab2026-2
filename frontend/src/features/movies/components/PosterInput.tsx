import { type ChangeEvent, useEffect, useId, useState } from 'react'

import { tmdbImage } from '../../../shared/lib/images'
import type { PosterChange } from '../types/movie'
import styles from './MovieForm.module.css'

/** Mesmos limites do `POST /posters` no backend. */
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

type Props = {
  /** Pôster atual do filme (na edição); `null` no cadastro ou quando o filme não tem imagem. */
  currentUrl: string | null
  value: PosterChange
  onChange: (value: PosterChange) => void
}

/**
 * Escolha do pôster com prévia. O arquivo só é enviado ao salvar o formulário; aqui ele é
 * conferido (tipo e tamanho) para a pessoa saber na hora se a imagem serve.
 */
export function PosterInput({ currentUrl, value, onChange }: Props) {
  const id = useId()
  const [error, setError] = useState<string | null>(null)
  // Endereço `blob:` do arquivo escolhido, criado junto com a escolha e liberado quando sai.
  const [local, setLocal] = useState<{ file: File; url: string } | null>(null)
  useEffect(() => (local ? () => URL.revokeObjectURL(local.url) : undefined), [local])

  const previewUrl =
    value instanceof File
      ? local?.file === value
        ? local.url
        : null
      : value === undefined && currentUrl
        ? tmdbImage(currentUrl, 'w342')
        : null

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Limpa o campo para que escolher o mesmo arquivo de novo também dispare a mudança.
    event.target.value = ''
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      setError('Escolha uma imagem JPG, PNG ou WebP.')
    } else if (file.size > MAX_BYTES) {
      setError('A imagem pode ter até 5 MB.')
    } else {
      setError(null)
      setLocal({ file, url: URL.createObjectURL(file) })
      onChange(file)
    }
  }

  return (
    <div data-field="poster" className={styles.field}>
      <span id={`${id}-rotulo`} className={styles.label}>
        Pôster <span className={styles.optional}>(opcional)</span>
      </span>
      <div className={styles.posterRow}>
        <div className={styles.posterPreview}>
          {previewUrl ? (
            <img src={previewUrl} alt="Prévia do pôster" />
          ) : (
            <span className={styles.posterEmpty}>Sem imagem</span>
          )}
        </div>
        <div className={styles.posterActions}>
          <label className={styles.posterButton}>
            <input
              type="file"
              accept={ACCEPTED.join(',')}
              onChange={handleFile}
              aria-labelledby={`${id}-rotulo ${id}-acao`}
              aria-describedby={`${id}-dica${error ? ` ${id}-erro` : ''}`}
              className="visually-hidden"
            />
            <span id={`${id}-acao`}>{previewUrl ? 'Trocar imagem' : 'Escolher imagem'}</span>
          </label>
          {previewUrl && (
            <button
              type="button"
              onClick={() => {
                setError(null)
                setLocal(null)
                // No cadastro, tirar o arquivo é o mesmo que não ter imagem.
                onChange(currentUrl ? null : undefined)
              }}
              className={styles.cancelButton}
            >
              Remover imagem
            </button>
          )}
          <p id={`${id}-dica`} className={styles.hint}>
            JPG, PNG ou WebP, até 5 MB.
          </p>
          {error && (
            <p id={`${id}-erro`} className={styles.fieldError}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
