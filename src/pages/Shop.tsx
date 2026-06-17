import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, X, ChevronDown } from 'lucide-react'
import { type ProductCategory } from '../data/products'
import { CategoriesNav } from '../components/shop/CategoriesNav'
import { CollectionsGrid } from '../components/shop/CollectionsGrid'
import { ProductCard } from '../components/shop/ProductCard'
import { ProductQuickView } from '../components/shop/ProductQuickView'
import { usePublicProducts } from '../hooks/useProducts'
import type { Product } from '../data/products'

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured',   label: 'Destaques' },
  { value: 'price-asc',  label: 'Preço ↑' },
  { value: 'price-desc', label: 'Preço ↓' },
  { value: 'name',       label: 'Nome A–Z' },
]

export default function Shop() {
  const { products } = usePublicProducts()
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch]             = useState('')
  const [sort, setSort]                 = useState<SortOption>('featured')
  const [category, setCategory]         = useState<'all' | ProductCategory>(
    (searchParams.get('categoria') as ProductCategory) ?? 'all'
  )
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  function handleCategoryChange(v: 'all' | ProductCategory) {
    setCategory(v)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      v === 'all' ? next.delete('categoria') : next.set('categoria', v)
      return next
    }, { replace: true })
  }

  function clearAll() {
    setSearch('')
    handleCategoryChange('all')
  }

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
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break
      case 'price-desc': list.sort((a, b) => b.price - a.price); break
      case 'name':       list.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'featured':   list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break
    }

    return list
  }, [search, category, sort, products])

  const hasActiveFilter = category !== 'all' || !!search

  return (
    <div className="min-h-[100dvh] bg-cream-50">
      <Helmet>
        <title>Loja — Crevally Black</title>
        <meta
          name="description"
          content={`Catálogo completo com ${products.length} peças Crevally Black. Camisetas, moletons, calças, shorts, bonés e mais. Streetwear premium do Brasil.`}
        />
      </Helmet>

      {/* ── Page header ─────────────────────────────────────────── */}
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

      {/* ── Categories nav (circular icons) ─────────────────────── */}
      <CategoriesNav active={category} onChange={handleCategoryChange} />

      {/* ── Collections grid (navega para /colecao/:slug) ───────── */}
      <CollectionsGrid />

      {/* ── Search + Sort bar ────────────────────────────────────── */}
      <div className="bg-white border-b border-ink-900/8 py-3 sticky top-0 z-20 shadow-sm shadow-ink-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
              strokeWidth={1.5}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-ink-900/10 bg-gray-50 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-coffee-400/50 focus:bg-white transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative flex-shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-ink-900/10 bg-gray-50 text-sm text-ink-900 focus:outline-none focus:border-coffee-400/50 focus:bg-white cursor-pointer transition-colors"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          </div>

          {/* Clear all */}
          {hasActiveFilter && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearAll}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-coffee-700 bg-coffee-50 border border-coffee-200 hover:bg-coffee-100 transition-colors"
            >
              <X size={11} />
              Limpar
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Product grid ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-1">
              <Search size={20} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-base font-display text-ink-700 tracking-wide">SEM RESULTADOS</p>
            <p className="text-sm text-ink-500 max-w-[30ch]">
              Tente outro termo ou selecione outra categoria.
            </p>
            <button
              onClick={clearAll}
              className="mt-1 text-sm text-coffee-600 hover:text-coffee-700 font-medium transition-colors"
            >
              Ver todos os produtos →
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-mono text-ink-500 mb-6">
              {filtered.length} peça{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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
