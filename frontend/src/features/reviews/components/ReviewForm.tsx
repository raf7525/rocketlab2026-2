import { type FormEvent, useId, useRef, useState } from 'react'

import { SectionHeading } from '../../../shared/components/SectionHeading'
import { StarRatingInput } from '../../../shared/components/StarRatingInput'
import { useCreateReview } from '../hooks/useReviews'
import type { MovieReviewCreate } from '../types/review'
import styles from './ReviewForm.module.css'

/** Mesmos limites do `MovieReviewCreate` no backend. */
const MAX_NAME = 120
const MAX_TEXT = 4000

const FIELDS = ['nome', 'nota', 'comentario'] as const
type Field = (typeof FIELDS)[number]
type Errors = Partial<Record<Field, string>>

type Props = {
  movieId: string
  /** Chamado depois que a API aceita a avaliação. */
  onPublished?: () => void
  /** Se informado, mostra um botão para deixar a avaliação para depois. */
  onSkip?: () => void
}

export function ReviewForm({ movieId, onPublished, onSkip }: Props) {
  const id = useId()
  const createReview = useCreateReview(movieId)
  const [nome, setNome] = useState('')
  const [nota, setNota] = useState<number | null>(null)
  const [comentario, setComentario] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const formRef = useRef<HTMLFormElement>(null)

  function clearError(field: Field) {
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (createReview.isPending) return

    const result = parseReview({ nome, nota, comentario })
    if (!result.ok) {
      setErrors(result.errors)
      const firstInvalid = FIELDS.find((field) => result.errors[field])
      formRef.current
        ?.querySelector(`[data-field="${firstInvalid}"]`)
        ?.querySelector<HTMLElement>('input, textarea')
        ?.focus()
      return
    }

    setErrors({})
    createReview.mutate(result.data, {
      onSuccess: () => {
        setNome('')
        setNota(null)
        setComentario('')
        onPublished?.()
      },
    })
  }

  const headingId = `${id}-titulo`
  const errorId = (field: Field) => `${id}-${field}-erro`
  const describedBy = (field: Field, ...extra: string[]) =>
    [errors[field] && errorId(field), ...extra].filter(Boolean).join(' ') || undefined

  return (
    <section aria-labelledby={headingId}>
      <SectionHeading id={headingId}>Avaliar este filme</SectionHeading>

      <form
        ref={formRef}
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby={headingId}
        className={styles.form}
      >
        <div data-field="nome" className={styles.field}>
          <label htmlFor={`${id}-nome`} className={styles.label}>
            Seu nome
          </label>
          <input
            id={`${id}-nome`}
            value={nome}
            onChange={(event) => {
              setNome(event.target.value)
              clearError('nome')
            }}
            maxLength={MAX_NAME}
            autoComplete="name"
            aria-invalid={Boolean(errors.nome)}
            aria-describedby={describedBy('nome')}
            className={styles.input}
          />
          <FieldError id={errorId('nome')} message={errors.nome} />
        </div>

        <div data-field="nota" className={styles.field}>
          <StarRatingInput
            legend="Nota"
            value={nota}
            onChange={(value) => {
              setNota(value)
              clearError('nota')
            }}
            describedBy={describedBy('nota')}
          />
          <FieldError id={errorId('nota')} message={errors.nota} />
        </div>

        <div data-field="comentario" className={styles.field}>
          <label htmlFor={`${id}-resenha`} className={styles.label}>
            Resenha
          </label>
          <textarea
            id={`${id}-resenha`}
            value={comentario}
            onChange={(event) => {
              setComentario(event.target.value)
              clearError('comentario')
            }}
            rows={6}
            maxLength={MAX_TEXT}
            placeholder="O que você achou do filme?"
            aria-invalid={Boolean(errors.comentario)}
            aria-describedby={describedBy('comentario', `${id}-contador`)}
            className={styles.textarea}
          />
          <div className={styles.textFooter}>
            <FieldError id={errorId('comentario')} message={errors.comentario} />
            <span id={`${id}-contador`} className={styles.counter}>
              {comentario.length}/{MAX_TEXT}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" aria-disabled={createReview.isPending} className={styles.submit}>
            {createReview.isPending ? 'Publicando…' : 'Publicar avaliação'}
          </button>
          {onSkip && (
            <button type="button" onClick={onSkip} className={styles.skip}>
              Agora não
            </button>
          )}
          {/* A região de status existe desde o início para o leitor de tela anunciar a mudança. */}
          <p role="status" className={styles.success}>
            {createReview.isSuccess && 'Avaliação publicada!'}
          </p>
        </div>

        {createReview.isError && (
          <p role="alert" className={styles.error}>
            {createReview.error.message}
          </p>
        )}
      </form>
    </section>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className={styles.fieldError}>
      {message}
    </p>
  )
}

type Parsed = { ok: true; data: MovieReviewCreate } | { ok: false; errors: Errors }

/** As mesmas regras do backend: textos aparados e obrigatórios, nota escolhida. */
function parseReview(values: { nome: string; nota: number | null; comentario: string }): Parsed {
  const nome = values.nome.trim()
  const comentario = values.comentario.trim()
  const errors: Errors = {}
  if (!nome) errors.nome = 'Informe seu nome.'
  if (values.nota === null) errors.nota = 'Escolha uma nota.'
  if (!comentario) errors.comentario = 'Escreva a resenha.'

  if (values.nota === null || Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, data: { nome, nota: values.nota, comentario } }
}
