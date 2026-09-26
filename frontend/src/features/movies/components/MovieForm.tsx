import { type FormEvent, useId, useRef, useState } from 'react'
import { Link } from 'react-router'

import { cx } from '../../../shared/lib/cx'
import { useGenres } from '../hooks/useMovies'
import type { MovieCreate } from '../types/movie'
import styles from './MovieForm.module.css'

/** Mesmos limites do `MovieCreate` no backend. */
const MAX_TITLE = 500
const MAX_NAME = 255
const MAX_SYNOPSIS = 4000
const MIN_YEAR = 1888
const MAX_YEAR = 2100

/** Campos que podem ter erro, na ordem da tela (o primeiro inválido recebe o foco). */
const FIELDS = ['titulo', 'ano_lancamento', 'diretores', 'generos', 'assistido'] as const
type Field = (typeof FIELDS)[number]
type Errors = Partial<Record<Field, string>>

const SUBMIT_LABELS = {
  create: { idle: 'Cadastrar filme', pending: 'Cadastrando…' },
  edit: { idle: 'Salvar alterações', pending: 'Salvando…' },
}

/** O que a pessoa respondeu além dos dados do filme (não vai para a API). */
export type MovieFormExtras = {
  /** Se já assistiu ao filme, ela segue para a avaliação depois do cadastro. */
  assistido: boolean
}

type Props = {
  /** Id do título da página ou da seção, que dá nome ao formulário. */
  labelledBy: string
  /** Enquanto o envio anterior não termina, o botão não envia de novo. */
  pending: boolean
  /** Erro devolvido pela API no último envio. */
  error: Error | null
} & (
  | {
      /** Cadastro: formulário vazio, com a pergunta se a pessoa já assistiu ao filme. */
      mode: 'create'
      onSubmit: (data: MovieCreate, extras: MovieFormExtras) => void
    }
  | {
      /** Edição: começa com os dados atuais do filme; "Cancelar" chama `onCancel`. */
      mode: 'edit'
      /** Filmes do CSV podem não ter ano; o campo começa vazio e precisa ser preenchido. */
      initial: Omit<MovieCreate, 'ano_lancamento'> & { ano_lancamento: number | null }
      onSubmit: (data: MovieCreate) => void
      onCancel: () => void
    }
)

/**
 * Título, ano, direção, gêneros (da lista do catálogo) e sinopse de um filme. No cadastro,
 * também pergunta se a pessoa já assistiu a ele.
 */
export function MovieForm(props: Props) {
  const { labelledBy, pending, error } = props
  const initial = props.mode === 'edit' ? props.initial : null
  const askWatched = props.mode === 'create'
  const id = useId()
  const [titulo, setTitulo] = useState(initial?.titulo ?? '')
  const [ano, setAno] = useState(initial?.ano_lancamento?.toString() ?? '')
  const [diretores, setDiretores] = useState(initial?.diretores.join(', ') ?? '')
  const [generos, setGeneros] = useState<string[]>(initial?.generos ?? [])
  const [sinopse, setSinopse] = useState(initial?.sinopse ?? '')
  const [assistido, setAssistido] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const formRef = useRef<HTMLFormElement>(null)

  function clearError(field: Field) {
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function toggleGenre(genre: string, checked: boolean) {
    setGeneros((current) =>
      checked ? [...current, genre] : current.filter((selected) => selected !== genre),
    )
    clearError('generos')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const result = parseMovie({ titulo, ano, diretores, generos, sinopse }, askWatched, assistido)
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
    if (props.mode === 'create') props.onSubmit(result.data, { assistido: assistido === true })
    else props.onSubmit(result.data)
  }

  const errorId = (field: Field) => `${id}-${field}-erro`
  const describedBy = (field: Field, ...extra: string[]) =>
    [errors[field] && errorId(field), ...extra].filter(Boolean).join(' ') || undefined

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby={labelledBy}
      className={styles.form}
    >
      <div data-field="titulo" className={styles.field}>
        <label htmlFor={`${id}-titulo`} className={styles.label}>
          Título
        </label>
        <input
          id={`${id}-titulo`}
          value={titulo}
          onChange={(event) => {
            setTitulo(event.target.value)
            clearError('titulo')
          }}
          maxLength={MAX_TITLE}
          autoComplete="off"
          aria-invalid={Boolean(errors.titulo)}
          aria-describedby={describedBy('titulo')}
          className={styles.input}
        />
        <FieldError id={errorId('titulo')} message={errors.titulo} />
      </div>

      <div className={styles.row}>
        <div data-field="ano_lancamento" className={cx(styles.field, styles.year)}>
          <label htmlFor={`${id}-ano`} className={styles.label}>
            Ano de lançamento
          </label>
          <input
            id={`${id}-ano`}
            value={ano}
            onChange={(event) => {
              setAno(event.target.value)
              clearError('ano_lancamento')
            }}
            inputMode="numeric"
            maxLength={4}
            autoComplete="off"
            aria-invalid={Boolean(errors.ano_lancamento)}
            aria-describedby={describedBy('ano_lancamento')}
            className={styles.input}
          />
          <FieldError id={errorId('ano_lancamento')} message={errors.ano_lancamento} />
        </div>

        <div data-field="diretores" className={styles.field}>
          <label htmlFor={`${id}-direcao`} className={styles.label}>
            Direção
          </label>
          <input
            id={`${id}-direcao`}
            value={diretores}
            onChange={(event) => {
              setDiretores(event.target.value)
              clearError('diretores')
            }}
            autoComplete="off"
            aria-invalid={Boolean(errors.diretores)}
            aria-describedby={describedBy('diretores', `${id}-direcao-dica`)}
            className={styles.input}
          />
          <p id={`${id}-direcao-dica`} className={styles.hint}>
            Mais de um nome? Separe com vírgulas.
          </p>
          <FieldError id={errorId('diretores')} message={errors.diretores} />
        </div>
      </div>

      <fieldset
        data-field="generos"
        aria-describedby={describedBy('generos')}
        className={styles.fieldset}
      >
        <legend className={styles.label}>Gêneros</legend>
        <GenreOptions selected={generos} onToggle={toggleGenre} />
        <FieldError id={errorId('generos')} message={errors.generos} />
      </fieldset>

      <div data-field="sinopse" className={styles.field}>
        <label htmlFor={`${id}-sinopse`} className={styles.label}>
          Sinopse <span className={styles.optional}>(opcional)</span>
        </label>
        <textarea
          id={`${id}-sinopse`}
          value={sinopse}
          onChange={(event) => setSinopse(event.target.value)}
          rows={5}
          maxLength={MAX_SYNOPSIS}
          aria-describedby={`${id}-contador`}
          className={styles.textarea}
        />
        <span id={`${id}-contador`} className={styles.counter}>
          {sinopse.length}/{MAX_SYNOPSIS}
        </span>
      </div>

      {askWatched && (
        <fieldset
          data-field="assistido"
          aria-describedby={describedBy('assistido')}
          className={styles.fieldset}
        >
          <legend className={styles.label}>Você já assistiu a este filme?</legend>
          <div className={styles.options}>
            {WATCHED_OPTIONS.map((option) => (
              <label key={option.label} className={styles.option}>
                <input
                  type="radio"
                  name={`${id}-assistido`}
                  checked={assistido === option.value}
                  onChange={() => {
                    setAssistido(option.value)
                    clearError('assistido')
                  }}
                  className="visually-hidden"
                />
                {option.label}
              </label>
            ))}
          </div>
          <FieldError id={errorId('assistido')} message={errors.assistido} />
        </fieldset>
      )}

      <div className={styles.actions}>
        <button type="submit" aria-disabled={pending} className={styles.submit}>
          {pending ? SUBMIT_LABELS[props.mode].pending : SUBMIT_LABELS[props.mode].idle}
        </button>
        {props.mode === 'create' ? (
          <Link to="/" className={styles.cancel}>
            Cancelar
          </Link>
        ) : (
          <button type="button" onClick={props.onCancel} className={styles.cancelButton}>
            Cancelar
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className={styles.error}>
          {error.message}
        </p>
      )}
    </form>
  )
}

const WATCHED_OPTIONS = [
  { value: true, label: 'Sim, já assisti' },
  { value: false, label: 'Ainda não' },
] as const

/** Os gêneros do catálogo como etiquetas que ligam e desligam (checkboxes por baixo). */
function GenreOptions({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (genre: string, checked: boolean) => void
}) {
  const genres = useGenres()

  if (genres.isPending) {
    return <p className={styles.hint}>Carregando gêneros…</p>
  }

  if (genres.isError) {
    return (
      <div className={styles.loadError}>
        <p>Não foi possível carregar os gêneros.</p>
        <button type="button" onClick={() => genres.refetch()} className={styles.retry}>
          Tentar de novo
        </button>
      </div>
    )
  }

  return (
    <ul role="list" className={styles.genres}>
      {genres.data.map((genre) => (
        <li key={genre}>
          <label className={styles.genre}>
            <input
              type="checkbox"
              checked={selected.includes(genre)}
              onChange={(event) => onToggle(genre, event.target.checked)}
              className="visually-hidden"
            />
            {genre}
          </label>
        </li>
      ))}
    </ul>
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

type Values = {
  titulo: string
  ano: string
  diretores: string
  generos: string[]
  sinopse: string
}
type Parsed = { ok: true; data: MovieCreate } | { ok: false; errors: Errors }

/** As mesmas regras do backend: textos aparados, ano no intervalo, direção e gênero obrigatórios. */
function parseMovie(values: Values, askWatched: boolean, assistido: boolean | null): Parsed {
  const titulo = values.titulo.trim()
  const ano = values.ano.trim()
  const year = Number(ano)
  const diretores = values.diretores
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
  const errors: Errors = {}

  if (!titulo) errors.titulo = 'Informe o título.'
  if (!ano) errors.ano_lancamento = 'Informe o ano de lançamento.'
  else if (!/^\d+$/.test(ano) || year < MIN_YEAR || year > MAX_YEAR) {
    errors.ano_lancamento = `O ano precisa estar entre ${MIN_YEAR} e ${MAX_YEAR}.`
  }
  if (diretores.length === 0) errors.diretores = 'Informe quem dirigiu o filme.'
  else if (diretores.some((name) => name.length > MAX_NAME)) {
    errors.diretores = `Cada nome pode ter até ${MAX_NAME} caracteres.`
  }
  if (values.generos.length === 0) errors.generos = 'Escolha pelo menos um gênero.'
  if (askWatched && assistido === null) errors.assistido = 'Diga se você já assistiu ao filme.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    data: {
      titulo,
      ano_lancamento: year,
      diretores,
      generos: values.generos,
      sinopse: values.sinopse.trim() || null,
    },
  }
}
