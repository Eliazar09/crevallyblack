import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingBag, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { getProductsByCategory } from '../data/products'
import { usePublicProducts } from '../hooks/useProducts'
import { CategoryBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ProductCard } from '../components/shop/ProductCard'
import { ProductQuickView } from '../components/shop/ProductQuickView'
import { formatPrice } from '../lib/currency'
import { useCart } from '../hooks/useCart'
import type { Product as ProductType } from '../data/products'
import { cn } from '../lib/cn'

const faqItems = [
  {
    q: '¿Cuándo veo resultados?',
    a: 'Los resultados varían por persona. La mayoría reporta cambios notables entre 2 y 4 semanas de uso constante.',
  },
  {
    q: '¿Tiene efectos secundarios?',
    a: 'Nuestros productos son 100% naturales y seguros. Si tienes condiciones médicas previas, consulta con tu médico.',
  },
  {
    q: '¿Hacen envíos a todo Venezuela?',
    a: 'Sí, enviamos a todo el territorio venezolano. El tiempo de entrega varía según la ciudad.',
  },
  {
    q: '¿Cómo se realiza el pago?',
    a: 'Aceptamos efectivo en dólares, transferencias y pago móvil. Confirma los detalles por WhatsApp.',
  },
]

export default function Product() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { products, loading: productsLoading } = usePublicProducts()
  const product = id ? products.find((p) => p.id === id) : undefined
  const [quantity, setQuantity] = useState(1)
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    product?.options?.[0]?.value
  )
  const [added, setAdded] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [quickViewProduct, setQuickViewProduct] = useState<ProductType | null>(null)
  const { addItem } = useCart()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    if (product?.options?.[0]?.value) {
      setSelectedOption(product.options[0].value)
    }
  }, [product])

  if (productsLoading) {
    return (
      <div className="min-h-[100dvh] bg-cream-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-forest-800 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[100dvh] bg-cream-50 flex flex-col items-center justify-center gap-4">
        <p className="font-display text-2xl text-ink-900">Producto no encontrado</p>
        <Link to="/tienda" className="text-sm text-forest-800 hover:underline">
          Ver catálogo
        </Link>
      </div>
    )
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const activeOption = product.options?.find((o) => o.value === selectedOption)
  const price = activeOption?.price ?? product.price

  function handleAdd() {
    addItem({
      productId: product!.id,
      name: product!.name,
      image: product!.image,
      price,
      quantity,
      selectedOption: activeOption?.label,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const appUrl = import.meta.env.VITE_APP_URL ?? 'https://greenlife.com.ve'

  return (
    <div className="min-h-[100dvh] bg-cream-50">
      <Helmet>
        <title>{product.name} — GreenLife</title>
        <meta name="description" content={product.description.slice(0, 155)} />
        <meta property="og:title" content={`${product.name} — GreenLife`} />
        <meta property="og:description" content={product.short} />
        <meta property="og:image" content={`${appUrl}${product.image}`} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`${appUrl}/producto/${product.id}`} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors mb-10 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Volver
        </button>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl overflow-hidden bg-cream-200 flex items-center justify-center p-6"
          style={{ minHeight: '420px' }}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain max-h-[520px]"
              loading="eager"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <div className="space-y-3">
              <CategoryBadge category={product.category} light />
              <h1 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] font-medium text-ink-900 tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-base text-ink-500 leading-relaxed">
                {product.short}
              </p>
            </div>

            <p className="font-mono text-3xl font-medium text-forest-800 tabular-nums">
              {formatPrice(price)}
              {product.options && (
                <span className="text-sm font-sans font-normal text-ink-500 ml-2">
                  {activeOption?.label}
                </span>
              )}
            </p>

            {/* Options */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider text-ink-500">Sabor / Tamaño</p>
                <div className="flex flex-wrap gap-2">
                  {product.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedOption(opt.value)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                        selectedOption === opt.value
                          ? 'border-forest-800 bg-forest-800/8 text-forest-800'
                          : 'border-ink-900/10 text-ink-500 hover:border-forest-800/30 hover:text-ink-900'
                      )}
                    >
                      {opt.label}
                      {opt.price && (
                        <span className="ml-2 font-mono text-xs">${opt.price}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 border border-ink-900/15 rounded-full px-1 py-1 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-ink-900/6 hover:bg-ink-900/12 text-ink-900 font-semibold text-lg leading-none transition-colors"
                >
                  −
                </button>
                <span className="font-mono text-sm min-w-[2.5ch] text-center text-ink-900 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-ink-900/6 hover:bg-ink-900/12 text-ink-900 font-semibold text-lg leading-none transition-colors"
                >
                  +
                </button>
              </div>

              <Button
                onClick={handleAdd}
                size="lg"
                variant={added ? 'ghost' : 'primary'}
                className="flex-1 justify-center"
              >
                {added ? (
                  <>
                    <Check size={16} />
                    Añadido al carrito
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} strokeWidth={1.5} />
                    Añadir al carrito
                  </>
                )}
              </Button>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-ink-900/8 space-y-4">
              <p className="text-sm font-mono uppercase tracking-wider text-ink-500">Descripción</p>
              <p className="text-sm text-ink-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <p className="text-sm font-mono uppercase tracking-wider text-ink-500">Beneficios</p>
              <ul className="space-y-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <Check size={14} strokeWidth={2.5} className="text-forest-800 mt-0.5 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* How to use */}
            <div className="space-y-2 pt-2 border-t border-ink-900/8">
              <p className="text-sm font-mono uppercase tracking-wider text-ink-500">Modo de uso</p>
              <p className="text-sm text-ink-700 leading-relaxed">{product.howToUse}</p>
            </div>
          </motion.div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="font-display text-2xl font-medium text-ink-900 mb-6">
            Preguntas frecuentes
          </h2>
          <div className="divide-y divide-ink-900/8">
            {faqItems.map((item, i) => (
              <div key={i} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left"
                >
                  <span className="text-sm font-semibold text-ink-900">{item.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={16} className="text-ink-500 flex-shrink-0" strokeWidth={1.5} />
                  ) : (
                    <ChevronDown size={16} className="text-ink-500 flex-shrink-0" strokeWidth={1.5} />
                  )}
                </button>
                {openFaq === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 text-sm text-ink-500 leading-relaxed"
                  >
                    {item.a}
                  </motion.p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-medium text-ink-900 mb-8">
              También te puede interesar
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
