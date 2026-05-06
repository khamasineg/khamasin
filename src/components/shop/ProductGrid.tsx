import { Product } from '@/types'
import ProductCard from './ProductCard'

export default function ProductGrid({
  products,
  label = 'in the archive',
}: {
  products: Product[]
  label?: string
}) {
  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <p
        className="font-mono text-[0.5rem] uppercase tracking-[0.22em] mb-8 flex items-center gap-3"
        style={{ color: 'rgba(28,25,23,0.4)' }}
      >
        <span className="h-px w-6 bg-taupe-light inline-block" />
        {products.length} {products.length === 1 ? 'piece' : 'pieces'} {label}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t border-l border-taupe-light">
        {products.map((product) => (
          <div key={product.id} className="border-b border-r border-taupe-light">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
