'use client'

export default function Ticker() {
  const items = [
    'Rare finds, beautifully worn',
    'One of one pieces',
    'Free shipping on orders over 500 EGP',
    'New arrivals every week',
  ]

  const repeated = [...items, ...items, ...items]

  return (
<div className="w-full overflow-hidden bg-sienna py-2 fixed top-[57px] left-0 right-0 z-40 md:static md:top-auto">      <div
        className="flex whitespace-nowrap"
        style={{
          animation: 'ticker 30s linear infinite',
        }}
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