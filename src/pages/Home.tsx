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
        <title>GreenLife — Bienestar Natural desde Venezuela</title>
        <meta name="description" content="GreenLife — Suplementos naturales premium. Emagrecedores, detox, vitaminas, colágeno, whey y más. +5000 clientes satisfechos. Envíos a toda Venezuela." />
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
