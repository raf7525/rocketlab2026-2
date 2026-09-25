import { describe, expect, it } from 'vitest'

import { formatCount, formatDecimal, formatDuration, pluralize } from './format'

describe('formatDuration', () => {
  it.each([
    [102, '1h 42min'],
    [128, '2h 8min'],
    [120, '2h'],
    [45, '45min'],
  ])('%i minutos → %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected)
  })
})

describe('formatCount', () => {
  it('separa os milhares com ponto', () => {
    expect(formatCount(32564)).toBe('32.564')
    expect(formatCount(7)).toBe('7')
  })
})

describe('formatDecimal', () => {
  it('mostra uma casa decimal com vírgula', () => {
    expect(formatDecimal(3.625)).toBe('3,6')
    expect(formatDecimal(4)).toBe('4,0')
  })
})

describe('pluralize', () => {
  it('usa o singular só para 1', () => {
    expect(pluralize(1, 'curtida', 'curtidas')).toBe('1 curtida')
    expect(pluralize(0, 'curtida', 'curtidas')).toBe('0 curtidas')
    expect(pluralize(1500, 'curtida', 'curtidas')).toBe('1.500 curtidas')
  })
})
