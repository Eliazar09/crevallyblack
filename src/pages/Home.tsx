import { Helmet } from 'react-helmet-async'
import { Hero } from '../components/home/Hero'
import { Categories } from '../components/home/Categories'
import { Featured } from '../components/home/Featured'
import { HowItWorks } from '../components/home/HowItWorks'
import { Testimonials } from '../components/home/Testimonials'
import { InstagramGrid } from '../components/home/InstagramGrid'
import { FAQ } from '../components/home/FAQ'
import { CTASection } from '../components/home/CTASection'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>GreenLife Caracas — Suplementos Naturales en Venezuela</title>
        <meta name="description" content="GreenLife Caracas — Suplementos naturales premium en Venezuela. Emagrecedores, detox, vitaminas, colágeno, whey y más. +5000 clientes satisfechos. Envíos a Caracas y toda Venezuela." />
      </Helmet>
      <Hero />
<Categories />
      <Featured />
      <HowItWorks />
      <Testimonials />
      <InstagramGrid />
      <FAQ />
      <CTASection />
    </>
  )
}
