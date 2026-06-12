import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { type ProductCategory } from '../data/products'
import { Filters, type SortOption } from '../components/shop/Filters'
import { ProductCard } from '../components/shop/ProductCard'
import { ProductQuickView } from '../components/shop/ProductQuickView'
import { usePublicProducts } from '../hooks/useProducts'
import type { Product } from '../data/products'

export default function Shop() {
  const { products } = usePublicProducts()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | ProductCategory>(
    (searchParams.get('categoria') as ProductCategory) ?? 'all'
  )
  const [sort, setSort] = useState<SortOption>('featured')
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  const filtered = useMemo(() => {
    let list = [...products]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.short.toLowerCase().includes(q) ||
          p.category.includes(q)
      )
    }

    if (category !== 'all') {
      list = list.filter((p) => p.category === category)
    }

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'featured':
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
    }

    return list
  }, [search, category, sort, products])

  return (
    <div className="min-h-[100dvh] bg-cream-50">
      <Helmet>
        <title>Loja — Crevally Black</title>
        <meta name="description" content={`Catálogo completo com ${products.length} peças Crevally Black. Camisetas, moletons, calças, shorts, bonés e mais. Streetwear premium do Brasil.`} />
      </Helmet>
      {/* Page header */}
      <div className="bg-ink-900 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="section-eyebrow mb-3">Loja</p>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light text-cream-50 tracking-tight">
            Catálogo <em className="text-coffee-400">completo</em>
          </h1>
          <p className="text-ink-400 mt-3 text-base max-w-[40ch]">
            {products.length} peças de streetwear para cada estilo
          </p>
        </div>
      </div>

      <Filters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <p className="text-lg font-display text-ink-700">Sem resultados</p>
            <p className="text-sm text-ink-500">
              Tente outro termo ou selecione outra categoria.
            </p>
            <button
              onClick={() => { setSearch(''); setCategory('all') }}
              className="text-sm text-coffee-600 hover:underline"
            >
              Ver todos os produtos
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-mono text-ink-500 mb-6">
              {filtered.length} peça{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                >
                  <ProductCard
                    product={product}
                    onQuickView={setQuickViewProduct}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
