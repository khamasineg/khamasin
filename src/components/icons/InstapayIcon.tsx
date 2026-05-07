/**
 * InstaPay Egypt icon — clean SVG that matches the official brand language.
 * The real mark: blue gradient badge + white lightning bolt + "instapay" wordmark.
 */
export default function InstapayIcon({
  size = 20,
  showLabel = false,
  className = '',
}: {
  size?: number
  showLabel?: boolean
  className?: string
}) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
      aria-label="InstaPay"
    >
      {/* Badge */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ip-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0057B8" />
            <stop offset="100%" stopColor="#003D8F" />
          </linearGradient>
        </defs>
        {/* Rounded badge */}
        <rect width="32" height="32" rx="8" fill="url(#ip-grad)" />
        {/* Lightning bolt — the universal "instant" symbol */}
        <path
          d="M18.5 4L10 18h7l-3.5 10L26 14h-7.5L18.5 4z"
          fill="white"
          fillOpacity="0.95"
        />
      </svg>

      {showLabel && (
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'currentColor',
            fontWeight: 500,
          }}
        >
          InstaPay
        </span>
      )}
    </span>
  )
}
