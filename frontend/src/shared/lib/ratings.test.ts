import { describe, expect, it } from 'vitest'

import { formatStars, scoreToStars, starsLabel } from './ratings'

describe('scoreToStars (mesma regra do backend)', () => {
  it.each([
    [10, 5],
    [9, 4.5],
    [9.8, 5],
    [2.4, 1],
    [2.5, 1.5],
    [7.25, 3.5],
    [0, 0],
  ])('nota %d → %d estrelas', (nota, stars) => {
    expect(scoreToStars(nota)).toBe(stars)
  })
})

describe('formatStars', () => {
  it('usa vírgula só quando tem meia estrela', () => {
    expect(formatStars(4.5)).toBe('4,5')
    expect(formatStars(4)).toBe('4')
  })
})

describe('starsLabel', () => {
  it.each([
    [5, '5 estrelas'],
    [4.5, '4,5 estrelas'],
    [1.5, '1,5 estrela'],
    [1, '1 estrela'],
    [0.5, '0,5 estrela'],
    [0, '0 estrelas'],
  ])('%d → %s', (stars, label) => {
    expect(starsLabel(stars)).toBe(label)
  })
})
