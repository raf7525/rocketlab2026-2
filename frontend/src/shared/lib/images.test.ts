import { describe, expect, it } from 'vitest'

import { tmdbImage } from './images'

describe('tmdbImage', () => {
  it('troca o tamanho da imagem do TMDB', () => {
    expect(tmdbImage('https://image.tmdb.org/t/p/w500/abc.jpg', 'w185')).toBe(
      'https://image.tmdb.org/t/p/w185/abc.jpg',
    )
  })

  it('deixa outras URLs como estão', () => {
    expect(tmdbImage('https://exemplo.com/w500/abc.jpg', 'w185')).toBe(
      'https://exemplo.com/w500/abc.jpg',
    )
  })
})
