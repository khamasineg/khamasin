/**
 * InstaPay icon — uses the official instapay logo image from /public/images.
 * Falls back to a clean SVG badge if the image fails to load.
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
      {/* Official InstaPay logo image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/instapay-logo.png"
        alt="InstaPay"
        width={size}
        height={size}
        style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
        onError={(e) => {
          // Fallback SVG if image missing
          const target = e.currentTarget
          target.style.display = 'none'
          const svg = target.nextElementSibling as HTMLElement | null
          if (svg) svg.style.display = 'block'
        }}
      />
      {/* Fallback SVG (hidden by default) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ display: 'none', flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="ip-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0057B8" />
            <stop offset="100%" stopColor="#003D8F" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#ip-grad)" />
        <path d="M18.5 4L10 18h7l-3.5 10L26 14h-7.5L18.5 4z" fill="white" fillOpacity="0.95" />
      </svg>

      {showLabel && (
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'currentColor',
          }}
        >
          InstaPay
        </span>
      )}
    </span>
  )
}
