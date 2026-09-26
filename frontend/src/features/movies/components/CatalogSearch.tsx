import { type ChangeEvent, type FormEvent, useId, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { useGenres } from '../hooks/useMovies'
import { catalogUrl, hasFilters } from '../lib/catalogSearch'
import { MOVIE_STATUSES, type MovieFilters } from '../types/movie'
import styles from './CatalogSearch.module.css'

/** Mesmo limite da busca no backend (`MovieFilters`). */
const MAX_SEARCH = 200

type Values = Record<keyof Required<MovieFilters>, string>

function toValues(filters: MovieFilters): Values {
  return {
    busca: filters.busca ?? '',
    genero: filters.genero ?? '',
    diretor: filters.diretor ?? '',
    ator: filters.ator ?? '',
    status: filters.status ?? '',
  }
}

/**
 * Barra de busca pelo título e filtros de gênero, direção e elenco. A busca fica no endereço
 * (`/?busca=…`): o formulário só monta o endereço novo e o catálogo lê dele.
 */
export function CatalogSearch({ filters }: { filters: MovieFilters }) {
  const id = useId()
  const navigate = useNavigate()
  const genres = useGenres()
  const [values, setValues] = useState(() => toValues(filters))
  // Quando o endereço muda por fora (link, voltar do navegador, "Limpar busca"), os campos
  // acompanham. O formulário não é recriado, então o campo em uso não perde o foco.
  const url = catalogUrl(filters)
  const [shownUrl, setShownUrl] = useState(url)
  if (url !== shownUrl) {
    setShownUrl(url)
    setValues(toValues(filters))
  }

  // Busca nova começa da primeira página.
  const search = (next: Values) => navigate(catalogUrl(next))

  const change =
    (field: keyof Values) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((current) => ({ ...current, [field]: event.target.value }))

  /** Gênero e status valem na hora, junto com o que já estiver digitado nos outros campos. */
  const choose = (field: 'genero' | 'status') => (event: ChangeEvent<HTMLSelectElement>) => {
    const next = { ...values, [field]: event.target.value }
    setValues(next)
    search(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    search(values)
  }

  return (
    <form role="search" aria-label="Buscar filmes" onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.searchRow}>
        <label htmlFor={`${id}-busca`} className="visually-hidden">
          Buscar pelo título
        </label>
        <div className={styles.searchField}>
          <SearchIcon />
          <input
            id={`${id}-busca`}
            name="busca"
            type="search"
            value={values.busca}
            onChange={change('busca')}
            maxLength={MAX_SEARCH}
            placeholder="Buscar filmes pelo título"
            autoComplete="off"
            className={styles.searchInput}
          />
        </div>
        <button type="submit" className={styles.submit}>
          Buscar
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.field}>
          <label htmlFor={`${id}-genero`} className={styles.label}>
            Gênero
          </label>
          <select
            id={`${id}-genero`}
            name="genero"
            value={values.genero}
            onChange={choose('genero')}
            className={styles.select}
          >
            <option value="">Todos os gêneros</option>
            {/* Um gênero vindo do endereço continua escolhido enquanto a lista carrega. */}
            {values.genero && !genres.data?.includes(values.genero) && (
              <option value={values.genero}>{values.genero}</option>
            )}
            {genres.data?.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor={`${id}-diretor`} className={styles.label}>
            Direção
          </label>
          <input
            id={`${id}-diretor`}
            name="diretor"
            value={values.diretor}
            onChange={change('diretor')}
            maxLength={MAX_SEARCH}
            placeholder="Ex.: Nolan"
            autoComplete="off"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`${id}-ator`} className={styles.label}>
            Ator ou atriz
          </label>
          <input
            id={`${id}-ator`}
            name="ator"
            value={values.ator}
            onChange={change('ator')}
            maxLength={MAX_SEARCH}
            placeholder="Ex.: Keanu Reeves"
            autoComplete="off"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`${id}-status`} className={styles.label}>
            Status
          </label>
          <select
            id={`${id}-status`}
            name="status"
            value={values.status}
            onChange={choose('status')}
            className={styles.select}
          >
            <option value="">Todos os status</option>
            {MOVIE_STATUSES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {hasFilters(filters) && (
          <Link to="/" className={styles.clear}>
            Limpar busca
          </Link>
        )}
      </div>
    </form>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.icon}>
      <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M13 13l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
