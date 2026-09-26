import { useLocation, useNavigate } from 'react-router'

/** Estado de navegação de quem saiu do catálogo para cadastrar ou avaliar um filme. */
export type CatalogReturnState = { fromCatalog: true }

export function isFromCatalog(state: unknown): state is CatalogReturnState {
  return typeof state === 'object' && state !== null && 'fromCatalog' in state
}

/** O `state` dos links que saem do catálogo: só marca a volta quando se está nele. */
export function useCatalogReturnState(): CatalogReturnState | undefined {
  const location = useLocation()
  return location.pathname === '/' ? { fromCatalog: true } : undefined
}

/**
 * Volta ao catálogo. Se a pessoa saiu dele, volta no histórico: a mesma página e a mesma
 * rolagem de antes. Se não (link direto, veio de outra tela), abre o início do catálogo.
 */
export function useBackToCatalog() {
  const location = useLocation()
  const navigate = useNavigate()

  return () => {
    if (isFromCatalog(location.state)) navigate(-1)
    else navigate('/', { replace: true })
  }
}
