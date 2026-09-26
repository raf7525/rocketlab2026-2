/** O ícone de salvar do Instagram: contorno quando vazio, preenchido quando o filme está salvo. */
export function BookmarkIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path
        d="M20 21 12 13.44 4 21V3h16z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
