import type { MovieFilters } from '../types/movie'

/** Parâmetros do endereço do catálogo, na ordem em que aparecem (`/?busca=…&pagina=2`). */
const FILTER_PARAMS: readonly (keyof MovieFilters)[] = ['busca', 'genero', 'diretor', 'ator']

/** Busca e filtros guardados no endereço do catálogo; os vazios ficam de fora. */
export function readFilters(params: URLSearchParams): MovieFilters {
  const filters: MovieFilters = {}
  for (const name of FILTER_PARAMS) {
    const value = params.get(name)?.trim()
    if (value) filters[name] = value
  }
  return filters
}

export function hasFilters(filters: MovieFilters): boolean {
  return FILTER_PARAMS.some((name) => filters[name])
}

/** Endereço do catálogo com esses filtros; a primeira página não aparece no endereço. */
export function catalogUrl(filters: MovieFilters = {}, page = 1): string {
  const params = new URLSearchParams()
  for (const name of FILTER_PARAMS) {
    const value = filters[name]?.trim()
    if (value) params.set(name, value)
  }
  if (page > 1) params.set('pagina', String(page))
  const query = params.toString()
  return query ? `/?${query}` : '/'
}
