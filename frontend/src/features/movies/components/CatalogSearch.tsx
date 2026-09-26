import { type FormEvent, useId, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { useGenres } from '../hooks/useMovies'
import { catalogUrl, hasFilters } from '../lib/catalogSearch'
import { MOVIE_STATUSES, type MovieFilters } from '../types/movie'
import styles from './CatalogSearch.module.css'

/** Mesmo limite da busca no backend (`MovieFilters`). */
const MAX_SEARCH = 200

/**
 * Barra de busca pelo título e filtros de gênero, direção e elenco. A busca fica no endereço
 * (`/?busca=…`): o formulário só monta o endereço novo e o catálogo lê dele.
 */
export function CatalogSearch({ filters }: { filters: MovieFilters }) {
  const id = useId()
  const navigate = useNavigate()
  const genres = useGenres()
  // Controlado: os gêneros chegam depois do primeiro render, e o escolhido precisa aparecer.
  const [genero, setGenero] = useState(filters.genero ?? '')
  const [status, setStatus] = useState(filters.status ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const text = (name: string) => String(data.get(name) ?? '')
    // Busca nova começa da primeira página.
    navigate(
      catalogUrl({
        busca: text('busca'),
        genero: text('genero'),
        diretor: text('diretor'),
        ator: text('ator'),
        status: text('status'),
      }),
    )
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
            defaultValue={filters.busca}
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
            value={genero}
            onChange={(event) => {
              setGenero(event.target.value)
              // O gênero vale na hora, junto com o que já estiver digitado nos outros campos.
              event.target.form?.requestSubmit()
            }}
            className={styles.select}
          >
            <option value="">Todos os gêneros</option>
            {/* Um gênero vindo do endereço continua escolhido enquanto a lista carrega. */}
            {genero && !genres.data?.includes(genero) && <option value={genero}>{genero}</option>}
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
            defaultValue={filters.diretor}
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
            defaultValue={filters.ator}
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
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              event.target.form?.requestSubmit()
            }}
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
