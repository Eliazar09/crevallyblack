import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutGrid, ArrowRight } from 'lucide-react'
import { getActiveCollections, type DbCollection } from '../../lib/queries/collections'

// ── Collection Card ───────────────────────────────────────────────

interface CollectionCardProps {
  collection: DbCollection | null
  onClick: () => void
}

function CollectionCard({ collection, onClick }: CollectionCardProps) {
  const isVerTudo = !collection

  return (
    <motion.button
      onClick={onClick}
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
      className="relative flex-shrink-0 w-28 sm:w-36 rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-coffee-400 group"
      style={{ aspectRatio: '3/4' }}
    >
      {/* Background */}
      {isVerTudo ? (
        <div className="absolute inset-0 bg-ink-900" />
      ) : collection.image_url ? (
        <>
          <motion.img
            src={collection.image_url}
            alt={collection.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            variants={{ hover: { scale: 1.1 } }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-ink-700 to-ink-900" />
      )}

      {/* Hover arrow */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        variants={{ hover: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.2 }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-coffee-500 flex items-center justify-center"
      >
        <ArrowRight size={10} strokeWidth={2.5} className="text-white" />
      </motion.div>

      {/* Content */}
      {isVerTudo ? (
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-2 text-cream-50">
          <LayoutGrid size={16} strokeWidth={1.5} className="opacity-70" />
          <span className="font-display text-[11px] sm:text-xs tracking-widest leading-tight">
            VER TUDO
          </span>
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 z-10">
          <p className="font-display text-[11px] sm:text-xs text-white tracking-wide text-center leading-tight line-clamp-2">
            {collection.name}
          </p>
        </div>
      )}
    </motion.button>
  )
}

// ── CollectionsGrid ───────────────────────────────────────────────

export function CollectionsGrid() {
  const [collections, setCollections] = useState<DbCollection[]>([])
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getActiveCollections()
      .then((data) => { setCollections(data); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  if (!loaded || collections.length === 0) return null

  return (
    <section className="bg-cream-50 border-b border-ink-900/6 py-5 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <p className="section-eyebrow mb-3">Coleções</p>

        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none pb-0.5 snap-x snap-mandatory">
          <CollectionCard
            collection={null}
            onClick={() => navigate('/loja')}
          />
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              onClick={() => navigate(`/colecao/${col.slug}`)}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
