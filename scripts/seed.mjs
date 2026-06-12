/**
 * Script de seed: insere produtos de exemplo no Supabase via service role key.
 * Uso: node scripts/seed.mjs
 * Requer: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(dir, '..', '.env')
const envLines = readFileSync(envPath, 'utf8').split('\n')
const env = {}
for (const line of envLines) {
  const [k, ...v] = line.split('=')
  if (k && v.length) env[k.trim()] = v.join('=').trim()
}

const url = env['NEXT_PUBLIC_SUPABASE_URL'] || env['VITE_SUPABASE_URL']
const key = env['SUPABASE_SERVICE_ROLE_KEY']

if (!url || !key) {
  console.error('Faltam VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const supabase = createClient(url, key)

const products = [
  {
    id: 'p1',
    name: 'Camiseta Básica Preta',
    short: 'Camiseta oversized em algodão penteado 200g/m²',
    description: 'O clássico que nunca sai de moda. Corte oversized levemente drop, algodão penteado 200g/m² pré-lavado. Estampa serigrafada à base de tinta plastisol com acabamento fosco. Ideal para qualquer composição.',
    composition: '100% algodão penteado 200g/m²',
    care: 'Lavar ao avesso em água fria. Não usar alvejante. Secar à sombra.',
    model_info: 'Modelo veste tamanho M. Altura 1,82m. Peso 78kg.',
    sizes: ['PP', 'P', 'M', 'G', 'GG', 'XGG'],
    colors: ['Preto', 'Branco', 'Chumbo'],
    image: '/images/products/camiseta-basica-preta.jpg',
    price: 89.90,
    category: 'camisetas',
    featured: true,
  },
  {
    id: 'p2',
    name: 'Camiseta Estampada Logo',
    short: 'Camiseta com estampa frontal exclusiva Crevally Black',
    description: 'Camiseta com estampa frontal exclusiva da Crevally Black. Tecido cotton 30.1 penteado, corte regular com caimento moderno. Estampa em silk serigráfico com tinta premium de alta durabilidade.',
    composition: 'Cotton 30.1 penteado 180g/m²',
    care: 'Lavar ao avesso em água fria. Não torcer. Secar estendida.',
    model_info: 'Modelo veste tamanho M. Altura 1,78m. Peso 74kg.',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Off-white'],
    image: '/images/products/camiseta-logo.jpg',
    price: 99.90,
    category: 'camisetas',
    featured: true,
  },
  {
    id: 'p3',
    name: 'Moletom Canguru Premium',
    short: 'Moletom com capuz e bolso canguru em fleece 380g/m²',
    description: 'Moletom com capuz em fleece 380g/m² com interior felpudo. Corte largo para máximo conforto. Punhos e barra com ribana dupla para durabilidade. Bolso canguru reforçado. Cadarço chato no capuz.',
    composition: '80% algodão / 20% poliéster 380g/m²',
    care: 'Lavar ao avesso em ciclo delicado. Não usar secadora em temperatura alta. Secar estendido.',
    model_info: 'Modelo veste tamanho M. Altura 1,82m. Peso 78kg.',
    sizes: ['P', 'M', 'G', 'GG', 'XGG'],
    colors: ['Preto', 'Grafite', 'Creme'],
    image: '/images/products/moletom-canguru.jpg',
    price: 189.90,
    category: 'moletons',
    featured: true,
  },
  {
    id: 'p4',
    name: 'Calça Cargo Streetwear',
    short: 'Calça cargo com bolsos laterais e cadarço na barra',
    description: 'Calça cargo em sarja de algodão com bolsos laterais utilitários com zíper. Corte reto levemente largo. Barra com cadarço ajustável. Elástico no cós com cordão interno. Acabamento premium.',
    composition: '98% algodão / 2% elastano sarja 280g/m²',
    care: 'Lavar em água fria. Não usar alvejante. Passar com ferro morno se necessário.',
    model_info: 'Modelo veste tamanho 40. Altura 1,82m. Peso 78kg.',
    sizes: ['36', '38', '40', '42', '44', '46'],
    colors: ['Preto', 'Verde militar', 'Bege'],
    image: '/images/products/calca-cargo.jpg',
    price: 219.90,
    category: 'calcas',
    featured: false,
  },
  {
    id: 'p5',
    name: 'Boné Dad Hat Bordado',
    short: 'Boné dad hat com bordado frontal e fivela metálica',
    description: 'Boné dad hat em twill de algodão com bordado frontal da logo Crevally. Fivela metálica dourada ajustável. Viseira pré-curvada. Tamanho único com ajuste traseiro.',
    composition: '100% algodão twill',
    care: 'Lavar à mão com sabão neutro. Não torcer. Secar modelado.',
    model_info: 'Tamanho único com ajuste traseiro. Circunferência 54–60cm.',
    sizes: ['Único'],
    colors: ['Preto/Dourado', 'Off-white/Preto', 'Verde militar'],
    image: '/images/products/bone-dad-hat.jpg',
    price: 69.90,
    category: 'bones',
    featured: false,
  },
]

console.log(`Inserindo ${products.length} produtos...`)

const rows = products.map((p) => ({
  name: p.name,
  short: p.short,
  description: p.description,
  composition: p.composition,
  care: p.care,
  model_info: p.model_info,
  sizes: p.sizes,
  colors: p.colors,
  image: p.image,
  images: [],
  price: p.price,
  cost_price: 0,
  category: p.category,
  sku: p.id,
  featured: p.featured ?? false,
  status: 'ativo',
  stock_quantity: 50,
  min_stock: 5,
}))

// Limpa antes de inserir
const { error: delErr } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
if (delErr) console.warn('Aviso ao limpar:', delErr.message)

const { error } = await supabase.from('products').insert(rows)
if (error) {
  console.error('Erro:', error.message)
  process.exit(1)
}
console.log('✅ Seed concluído com sucesso!')
