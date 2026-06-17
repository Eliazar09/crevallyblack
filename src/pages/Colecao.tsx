import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { getCollectionBySlug, type DbCollection } from '../lib/queries/collections'
import { getActiveProductsByCollection } from '../lib/queries/products'
import { dbProductToPublic } from '../lib/mappers'
import { ProductCard } from '../components/shop/ProductCard'
import { ProductQuickView } from '../components/shop/ProductQuickView'
import type { Product } from '../data/products'

export default function Colecao() {
  const { slug } = useParams<{ slug: string }>()
  const [collection, setCollection] = useState<DbCollection | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    Promise.all([
      getCollectionBySlug(slug),
      getActiveProductsByCollection(slug),
    ])
      .then(([col, prods]) => {
        setCollection(col)
        setProducts(prods.map(dbProductToPublic))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-[100dvh] bg-cream-50 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-coffee-600 border-t-transparent animate-spin" />
    </div>
  )

  if (notFound || !collection) return (
    <div className="min-h-[100dvh] bg-cream-50 flex flex-col items-center justify-center gap-4 px-6">
      <p className="font-display text-3xl text-ink-900">Coleção não encontrada</p>
      <Link to="/loja" className="text-coffee-600 hover:text-coffee-500 font-medium text-sm flex items-center gap-1.5">
        <ArrowLeft size={14} />Voltar para a loja
      </Link>
    </div>
  )

  return (
    <>
      <Helmet>
        <title>{collection.name} — Crevally Black</title>
        {collection.description && <meta name="description" content={collection.description} />}
      </Helmet>

      <div className="min-h-[100dvh] bg-cream-50">
        {/* Header */}
        <section className="bg-ink-900 text-cream-50 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <Link to="/loja"
              className="inline-flex items-center gap-1.5 text-sm text-cream-50/60 hover:text-cream-50 transition-colors mb-6">
              <ArrowLeft size={14} />Loja
            </Link>
            <p className="text-xs font-mono uppercase tracking-widest text-coffee-400 mb-2">Coleção</p>
            <h1 className="font-display text-4xl sm:text-5xl tracking-wide mb-3">{collection.name}</h1>
            {collection.description && (
              <p className="text-cream-50/60 text-base max-w-xl">{collection.description}</p>
            )}
            <p className="text-xs text-cream-50/40 mt-4">{products.length} produto{products.length !== 1 ? 's' : ''}</p>
          </div>
        </section>

        {/* Products */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {products.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-gray-400 text-sm">Nenhum produto nesta coleção ainda.</p>
              <Link to="/loja" className="text-coffee-600 hover:text-coffee-500 text-sm font-medium">
                Ver todos os produtos
              </Link>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            >
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                >
                  <ProductCard product={product} onQuickView={setQuickViewProduct} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>

      <ProductQuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  )
}
