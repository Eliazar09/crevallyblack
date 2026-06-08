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
import Kits from './pages/Kits'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Login from './pages/admin/Login'

// Admin pages — lazy loaded
const Dashboard    = lazy(() => import('./pages/admin/Dashboard'))
const Productos    = lazy(() => import('./pages/admin/Productos'))
const ProductoForm = lazy(() => import('./pages/admin/ProductoForm'))
const Ventas       = lazy(() => import('./pages/admin/Ventas'))
const VentaNueva   = lazy(() => import('./pages/admin/VentaNueva'))
const Clientes     = lazy(() => import('./pages/admin/Clientes'))
const Inventario   = lazy(() => import('./pages/admin/Inventario'))
const Finanzas     = lazy(() => import('./pages/admin/Finanzas'))
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
            <Route path="/tienda" element={<Shop />} />
            <Route path="/producto/:id" element={<Product />} />
            <Route path="/kits" element={<Kits />} />
            <Route path="/acerca" element={<About />} />
            <Route path="/contacto" element={<Contact />} />
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
    <div className="w-6 h-6 rounded-full border-2 border-forest-700 border-t-transparent animate-spin" />
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin login — público */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin — protegido */}
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={
              <Suspense fallback={<AdminSuspense />}><Dashboard /></Suspense>
            } />
            <Route path="/admin/productos" element={
              <Suspense fallback={<AdminSuspense />}><Productos /></Suspense>
            } />
            <Route path="/admin/productos/nuevo" element={
              <Suspense fallback={<AdminSuspense />}><ProductoForm /></Suspense>
            } />
            <Route path="/admin/productos/:id" element={
              <Suspense fallback={<AdminSuspense />}><ProductoForm /></Suspense>
            } />
            <Route path="/admin/ventas" element={
              <Suspense fallback={<AdminSuspense />}><Ventas /></Suspense>
            } />
            <Route path="/admin/ventas/nueva" element={
              <Suspense fallback={<AdminSuspense />}><VentaNueva /></Suspense>
            } />
            <Route path="/admin/clientes" element={
              <Suspense fallback={<AdminSuspense />}><Clientes /></Suspense>
            } />
            <Route path="/admin/inventario" element={
              <Suspense fallback={<AdminSuspense />}><Inventario /></Suspense>
            } />
            <Route path="/admin/finanzas" element={
              <Suspense fallback={<AdminSuspense />}><Finanzas /></Suspense>
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
