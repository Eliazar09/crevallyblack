import { Helmet } from 'react-helmet-async'
import { lazy, Suspense } from 'react'
import { Hero } from '../components/home/Hero'
import { Categories } from '../components/home/Categories'
import { Featured } from '../components/home/Featured'
import { HowItWorks } from '../components/home/HowItWorks'
import { Testimonials } from '../components/home/Testimonials'
import { InstagramGrid } from '../components/home/InstagramGrid'
import { FAQ } from '../components/home/FAQ'
import { CTASection } from '../components/home/CTASection'
import { HomeCollections } from '../components/home/HomeCollections'

const CarouselSection = lazy(() => import('../components/home/CarouselSection'))

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Crevally Black — Streetwear Premium do Brasil</title>
        <meta name="description" content="Crevally Black — Moda streetwear premium feita no Brasil. Camisetas, moletons, calças, conjuntos e acessórios com identidade única. Qualidade e estilo para quem manda no jogo." />
      </Helmet>
      <Hero />
      <Suspense fallback={<div className="h-96 bg-cream-50" />}>
        <CarouselSection />
      </Suspense>
      <Categories />
      <Featured />
      <HomeCollections />
      <HowItWorks />
      <Testimonials />
      <InstagramGrid />
      <FAQ />
      <CTASection />
    </>
  )
}
