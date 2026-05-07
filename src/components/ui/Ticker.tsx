export default function Ticker() {
  const items = [
    'Rare finds, beautifully worn',
    'One of one pieces',
    'Free shipping on orders over 500 EGP',
    'New arrivals every week',
  ]

  const repeated = [...items, ...items, ...items]

  return (
    <div className="relative w-full overflow-hidden bg-sienna h-8 md:h-auto md:py-2">
      <div
        className="flex h-full items-center whitespace-nowrap"
        style={{ animation: 'ticker 30s linear infinite' }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="mx-8 font-mono text-xs uppercase tracking-widest text-ivory flex-shrink-0"
          >
            {item}
            <span className="mx-8 text-taupe-light">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}