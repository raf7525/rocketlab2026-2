import styles from './Avatar.module.css'

const COLORS = ['#e8a33d', '#40bcf4', '#00c030', '#ff8000', '#b58df1', '#f47ca0', '#5fd4c4']

/** Círculo com as iniciais, já que as avaliações não têm foto. Decorativo: o nome vem ao lado. */
export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')

  return (
    <span aria-hidden="true" className={styles.avatar} style={{ backgroundColor: colorFor(name) }}>
      {initials}
    </span>
  )
}

/** A mesma pessoa sempre recebe a mesma cor. */
function colorFor(name: string): string {
  let hash = 0
  for (const char of name) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0
  return COLORS[hash % COLORS.length]
}
