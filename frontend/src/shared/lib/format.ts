const integer = new Intl.NumberFormat('pt-BR')
const oneDecimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const conjunction = new Intl.ListFormat('pt-BR', { type: 'conjunction' })

/** 102 → "1h 42min"; 120 → "2h"; 45 → "45min". */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}min`
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`
}

/** 32564 → "32.564". */
export function formatCount(value: number): string {
  return integer.format(value)
}

/** 3.625 → "3,6". */
export function formatDecimal(value: number): string {
  return oneDecimal.format(value)
}

/** ["Jeff Rowe", "Kyler Spears", "Peter Sohn"] → "Jeff Rowe, Kyler Spears e Peter Sohn". */
export function formatList(items: string[]): string {
  return conjunction.format(items)
}

/** (1, "curtida", "curtidas") → "1 curtida"; (1500, …) → "1.500 curtidas". */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${formatCount(count)} ${count === 1 ? singular : plural}`
}
