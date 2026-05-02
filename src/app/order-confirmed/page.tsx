import Link from 'next/link'

export default function OrderConfirmedPage() {
  return (
    <main className="min-h-screen bg-parchment flex flex-col items-center justify-center px-6 text-center">
      
      {/* Icon */}
      <div className="w-16 h-16 border border-taupe-light flex items-center justify-center mb-8">
        <span className="font-mono text-xl text-sienna">✦</span>
      </div>

      {/* Heading */}
      <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-3">
        Order received
      </p>
      <h1 className="font-display text-5xl md:text-7xl tracking-wider text-ink uppercase mb-6">
        Thank You
      </h1>

      {/* Message */}
      <p className="font-serif text-base italic text-taupe max-w-md leading-relaxed mb-12">
        Your order has been received. Check your email for confirmation details. 
        We will be in touch shortly to arrange everything.
      </p>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-12 w-full max-w-xs">
        <span className="h-px flex-1 bg-taupe-light" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-taupe">FYNDE</span>
        <span className="h-px flex-1 bg-taupe-light" />
      </div>

      {/* CTA */}
      <Link
        href="/shop"
        className="font-mono text-xs uppercase tracking-widest text-ink border border-ink px-8 py-4 hover:bg-ink hover:text-ivory transition-colors min-h-[44px] flex items-center"
      >
        Continue Shopping
      </Link>

    </main>
  )
}