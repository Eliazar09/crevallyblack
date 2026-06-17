import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { getHomeCollections, type DbCollection } from '../../lib/queries/collections'

export function HomeCollections() {
  const [collections, setCollections] = useState<DbCollection[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getHomeCollections()
      .then((data) => { setCollections(data); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  if (!loaded || collections.length === 0) return null

  return (
    <section className="bg-ink-900 py-16 sm:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-eyebrow mb-3">Exclusivo</p>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-cream-50 tracking-wide leading-none">
              Nossas <em className="text-coffee-400">coleções</em>
            </h2>
          </div>
          <Link
            to="/loja"
            className="hidden sm:flex items-center gap-2 text-sm text-ink-400 hover:text-cream-50 transition-colors font-medium"
          >
            Ver loja completa <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        <div className={`grid gap-4 sm:gap-6 ${
          collections.length === 1
            ? 'grid-cols-1 max-w-lg'
            : collections.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {collections.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Link
                to={`/colecao/${col.slug}`}
                className="group block relative rounded-2xl overflow-hidden aspect-[4/3] bg-ink-800"
              >
                {/* Image */}
                {col.image_url ? (
                  <img
                    src={col.image_url}
                    alt={col.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-ink-700 to-ink-900" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <p className="section-eyebrow text-coffee-400 mb-2">Coleção</p>
                  <h3 className="font-display text-2xl sm:text-3xl text-cream-50 tracking-wide leading-tight mb-2">
                    {col.name}
                  </h3>
                  {col.description && (
                    <p className="text-cream-50/65 text-sm leading-relaxed mb-4 line-clamp-2 max-w-[42ch]">
                      {col.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-coffee-400 group-hover:text-coffee-300 transition-colors">
                    Ver coleção
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/loja"
            className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-cream-50 transition-colors font-medium"
          >
            Ver loja completa <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  )
}
