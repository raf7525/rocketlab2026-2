import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StarRatingInput } from './StarRatingInput'

describe('StarRatingInput', () => {
  it('oferece notas de meia em meia estrela, de 0,5 a 5', () => {
    render(<StarRatingInput legend="Nota" value={null} onChange={() => {}} />)

    const options = within(screen.getByRole('group', { name: 'Nota' })).getAllByRole('radio')
    expect(options).toHaveLength(10)
    expect(options[0]).toHaveAccessibleName('0,5 estrela')
    expect(options[9]).toHaveAccessibleName('5 estrelas')
  })

  it('clicar numa meia estrela escolhe a nota de 0 a 10', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<StarRatingInput legend="Nota" value={null} onChange={onChange} />)

    await user.click(screen.getByRole('radio', { name: '4,5 estrelas' }))

    expect(onChange).toHaveBeenCalledWith(9)
  })

  it('ao passar o mouse, o valor acompanha a prévia das estrelas', async () => {
    const user = userEvent.setup()
    render(<StarRatingInput legend="Nota" value={4} onChange={() => {}} />)

    await user.hover(screen.getByRole('radio', { name: '4 estrelas' }))

    expect(screen.getByText('8/10')).toBeInTheDocument()
  })

  it('marca a nota atual e mostra o valor na escala de 0 a 10', () => {
    render(<StarRatingInput legend="Nota" value={7} onChange={() => {}} />)

    expect(screen.getByRole('radio', { name: '3,5 estrelas' })).toBeChecked()
    expect(screen.getByText('7/10')).toBeInTheDocument()
  })
})
