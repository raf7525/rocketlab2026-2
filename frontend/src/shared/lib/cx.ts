/** Junta classes CSS ignorando as falsas: cx(styles.card, open && styles.open). */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
