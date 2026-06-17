import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShoppingBag, Check, ChevronDown, ChevronUp, Shirt, Droplets, Ruler } from 'lucide-react'
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
    q: 'Qual é o prazo de entrega?',
    a: 'Enviamos para todo o Brasil. O prazo varia de 3 a 10 dias úteis dependendo da sua região. Você recebe o código de rastreio por WhatsApp.',
  },
  {
    q: 'Como faço para trocar ou devolver?',
    a: 'Aceitamos troca ou devolução em até 7 dias após o recebimento, desde que a peça esteja sem uso e com etiqueta. Entre em contato pelo WhatsApp.',
  },
  {
    q: 'Qual tamanho devo pedir?',
    a: 'Nossas peças seguem o padrão brasileiro. Consulte a tabela de medidas na foto do produto ou pergunte pelo WhatsApp — respondemos na hora.',
  },
  {
    q: 'Como é feito o pagamento?',
    a: 'Aceitamos Pix, cartão de crédito/débito e transferência bancária. O pedido é confirmado pelo WhatsApp após o pagamento.',
  },
]

export default function Product() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { products, loading: productsLoading } = usePublicProducts()
  const product = id ? products.find((p) => p.id === id) : undefined
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [activeImg, setActiveImg] = useState<string | undefined>(undefined)
  const [added, setAdded] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [quickViewProduct, setQuickViewProduct] = useState<ProductType | null>(null)
  const { addItem } = useCart()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    if (product?.sizes?.[0]) setSelectedSize(product.sizes[0])
    if (product) setActiveImg(product.image)
  }, [product])

  if (productsLoading) {
    return (
      <div className="min-h-[100dvh] bg-cream-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-coffee-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[100dvh] bg-cream-50 flex flex-col items-center justify-center gap-4">
        <p className="font-display text-2xl text-ink-900">Produto não encontrado</p>
        <Link to="/loja" className="text-sm text-coffee-600 hover:underline">
          Ver catálogo
        </Link>
      </div>
    )
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  function handleAdd() {
    addItem({
      productId: product!.id,
      name: product!.name,
      image: product!.image,
      price: product!.price,
      quantity,
      selectedOption: selectedSize,
      category: product!.category,
      collection_name: product!.collection_name,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const appUrl = import.meta.env.VITE_APP_URL ?? 'https://crevallyblack.com.br'

  return (
    <div className="min-h-[100dvh] bg-cream-50">
      <Helmet>
        <title>{product.name} — Crevally Black</title>
        <meta name="description" content={product.description.slice(0, 155)} />
        <meta property="og:title" content={`${product.name} — Crevally Black`} />
        <meta property="og:description" content={product.short} />
        <meta property="og:image" content={`${appUrl}${product.image}`} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`${appUrl}/produto/${product.id}`} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors mb-10 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-3"
          >
            {/* Imagem principal */}
            <div className="rounded-3xl overflow-hidden bg-cream-200 flex items-center justify-center p-6" style={{ minHeight: '420px' }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg ?? product.image}
                  src={activeImg ?? product.image}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-contain max-h-[520px]"
                  loading="eager"
                />
              </AnimatePresence>
            </div>

            {/* Miniaturas */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(img)}
                    className={cn(
                      'flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all',
                      (activeImg ?? product.image) === img
                        ? 'border-ink-900 opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-80'
                    )}
                  >
                    <img src={img} alt={`${product.name} foto ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
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

            <p className="font-mono text-3xl font-medium text-coffee-600 tabular-nums">
              {formatPrice(product.price)}
            </p>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
                  <Ruler size={12} />Tamanho
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
                        selectedSize === size
                          ? 'border-ink-900 bg-ink-900 text-white'
                          : 'border-ink-900/15 text-ink-500 hover:border-ink-900/40 hover:text-ink-900'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-wider text-ink-500">Cores disponíveis</p>
                <p className="text-sm text-ink-700">{product.colors.join(' · ')}</p>
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
                    Adicionado ao carrinho
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} strokeWidth={1.5} />
                    Adicionar ao carrinho
                  </>
                )}
              </Button>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-ink-900/8 space-y-4">
              <p className="text-sm font-mono uppercase tracking-wider text-ink-500">Descrição</p>
              <p className="text-sm text-ink-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Composition */}
            {product.composition && (
              <div className="space-y-2">
                <p className="text-sm font-mono uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
                  <Shirt size={12} />Composição
                </p>
                <p className="text-sm text-ink-700 leading-relaxed">{product.composition}</p>
              </div>
            )}

            {/* Care */}
            {product.care && (
              <div className="space-y-2 pt-2 border-t border-ink-900/8">
                <p className="text-sm font-mono uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
                  <Droplets size={12} />Cuidados / Lavagem
                </p>
                <p className="text-sm text-ink-700 leading-relaxed">{product.care}</p>
              </div>
            )}

            {/* Model info */}
            {product.model_info && (
              <p className="text-xs text-ink-400 italic">{product.model_info}</p>
            )}
          </motion.div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="font-display text-2xl font-medium text-ink-900 mb-6">
            Perguntas frequentes
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
              Você também pode gostar
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
