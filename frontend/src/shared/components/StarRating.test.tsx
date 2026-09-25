import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StarRating } from './StarRating'

describe('StarRating', () => {
  it('desenha as estrelas cheias e a meia estrela, como no Letterboxd', () => {
    render(<StarRating stars={3.5} />)

    expect(screen.getByRole('img', { name: '3,5 de 5 estrelas' })).toHaveTextContent('★★★½')
  })

  it('aceita um rótulo próprio para leitores de tela', () => {
    render(<StarRating stars={3.5} label="Nota média 3,6 de 5" />)

    expect(screen.getByRole('img', { name: 'Nota média 3,6 de 5' })).toBeInTheDocument()
  })
})
