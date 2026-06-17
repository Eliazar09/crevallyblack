import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { CartDrawer } from './components/cart/CartDrawer'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { ScrollToTop } from './components/ScrollToTop'
import { AdminLayout } from './components/admin/layout/AdminLayout'
import { RequireAuth } from './components/admin/layout/RequireAuth'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Kits from './pages/Kits'
import About from './pages/About'
import Contact from './pages/Contact'
import Colecao from './pages/Colecao'
import PedidoConfirmado from './pages/PedidoConfirmado'
import NotFound from './pages/NotFound'
import Login from './pages/admin/Login'

// Páginas admin — carregamento lazy
const Dashboard    = lazy(() => import('./pages/admin/Dashboard'))
const Produtos     = lazy(() => import('./pages/admin/Productos'))
const ProdutoForm  = lazy(() => import('./pages/admin/ProductoForm'))
const Colecoes     = lazy(() => import('./pages/admin/Colecoes'))
const Vendas       = lazy(() => import('./pages/admin/Ventas'))
const VendaNova    = lazy(() => import('./pages/admin/VentaNueva'))
const Clientes     = lazy(() => import('./pages/admin/Clientes'))
const Estoque      = lazy(() => import('./pages/admin/Inventario'))
const Financas     = lazy(() => import('./pages/admin/Finanzas'))
const Agenda       = lazy(() => import('./pages/admin/Agenda'))

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

function AppLayout() {
  const location = useLocation()
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <ScrollToTop />
      <ScrollProgress />
      <div className="grain-overlay" aria-hidden="true" />
      <Navbar />
      <main className="flex-1">
        <PageTransition>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/loja" element={<Shop />} />
            <Route path="/produto/:id" element={<Product />} />
            <Route path="/colecao/:slug" element={<Colecao />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/kits" element={<Kits />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/pedido-confirmado" element={<PedidoConfirmado />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

const AdminSuspense = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-6 h-6 rounded-full border-2 border-coffee-600 border-t-transparent animate-spin" />
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login admin — público */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin — protegido */}
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={
              <Suspense fallback={<AdminSuspense />}><Dashboard /></Suspense>
            } />
            <Route path="/admin/produtos" element={
              <Suspense fallback={<AdminSuspense />}><Produtos /></Suspense>
            } />
            <Route path="/admin/produtos/novo" element={
              <Suspense fallback={<AdminSuspense />}><ProdutoForm /></Suspense>
            } />
            <Route path="/admin/produtos/:id" element={
              <Suspense fallback={<AdminSuspense />}><ProdutoForm /></Suspense>
            } />
            <Route path="/admin/colecoes" element={
              <Suspense fallback={<AdminSuspense />}><Colecoes /></Suspense>
            } />
            <Route path="/admin/vendas" element={
              <Suspense fallback={<AdminSuspense />}><Vendas /></Suspense>
            } />
            <Route path="/admin/vendas/nova" element={
              <Suspense fallback={<AdminSuspense />}><VendaNova /></Suspense>
            } />
            <Route path="/admin/clientes" element={
              <Suspense fallback={<AdminSuspense />}><Clientes /></Suspense>
            } />
            <Route path="/admin/estoque" element={
              <Suspense fallback={<AdminSuspense />}><Estoque /></Suspense>
            } />
            <Route path="/admin/financas" element={
              <Suspense fallback={<AdminSuspense />}><Financas /></Suspense>
            } />
            <Route path="/admin/agenda" element={
              <Suspense fallback={<AdminSuspense />}><Agenda /></Suspense>
            } />
          </Route>
        </Route>

        {/* Site público */}
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
