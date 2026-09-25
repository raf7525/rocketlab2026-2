import { notifyManager, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

import { likeReview, unlikeReview } from '../api/reviewsApi'
import type { MovieReview } from '../types/review'
import { reviewKeys } from './useReviews'

/*
 * A contagem de curtidas fica no backend. Como não há login, é o navegador que lembra quais
 * reviews já curtimos, para o botão saber se está marcado e se o clique curte ou descurte.
 */
const STORAGE_KEY = 'rocketlab:reviews-curtidas'
const listeners = new Set<() => void>()
/** Usado só quando o localStorage não está disponível (ex.: bloqueado pelo navegador). */
let inMemory: string[] = []

function readLiked(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return inMemory
  }
}

function writeLiked(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    inMemory = ids
  }
  listeners.forEach((notify) => notify())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useReviewLike(review: MovieReview) {
  const queryClient = useQueryClient()
  const reviewId = review.sk_movie_review_id
  const liked = useSyncExternalStore(subscribe, () => readLiked().includes(reviewId))

  const mutation = useMutation({
    mutationFn: (unlike: boolean) => (unlike ? unlikeReview(review) : likeReview(review)),
    onSuccess: (updated, unlike) => {
      const others = readLiked().filter((id) => id !== reviewId)
      // O React Query avisa os componentes num tick seguinte; agendar a troca do botão no mesmo
      // lote evita um quadro com o coração marcado e a contagem antiga.
      notifyManager.batch(() => {
        // Atualiza a contagem em todas as listas onde a review aparece, sem reordenar a tela.
        queryClient.setQueriesData<MovieReview[]>({ queryKey: reviewKeys.all }, (reviews) =>
          reviews?.map((item) =>
            item.sk_movie_review_id === reviewId ? { ...item, curtidas: updated.curtidas } : item,
          ),
        )
        notifyManager.schedule(() => writeLiked(unlike ? others : [...others, reviewId]))
      })
    },
  })

  function toggle() {
    if (!mutation.isPending) mutation.mutate(liked)
  }

  return { liked, toggle, isPending: mutation.isPending }
}
