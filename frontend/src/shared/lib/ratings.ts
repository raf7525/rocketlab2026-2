/**
 * Escala de notas, a mesma do backend (app/shared/ratings.py): de 0 a 10, e cada ponto vale
 * meia estrela (1 = ½ estrela, 10 = 5 estrelas).
 */

export const MAX_SCORE = 10
export const MAX_STARS = 5

/** Nota 0–10 → estrelas 0–5, arredondando para a meia estrela mais próxima (.5 sobe). */
export function scoreToStars(nota: number): number {
  return Math.floor(nota + 0.5) / 2
}

/** 4.5 → "4,5"; 4 → "4". */
export function formatStars(stars: number): string {
  return String(stars).replace('.', ',')
}

/** 4.5 → "4,5 estrelas"; 1.5 → "1,5 estrela" (em português, só a partir de 2 é plural). */
export function starsLabel(stars: number): string {
  return `${formatStars(stars)} ${stars > 0 && stars < 2 ? 'estrela' : 'estrelas'}`
}
