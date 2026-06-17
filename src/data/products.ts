export type ProductCategory =
  | 'camisetas'
  | 'moletons'
  | 'calcas'
  | 'shorts'
  | 'bones'
  | 'conjuntos'
  | 'acessorios'

export interface ProductOption {
  label: string
  value: string
  price?: number
}

export interface Product {
  id: string
  name: string
  short: string
  description: string
  composition: string
  care: string
  model_info: string
  image: string
  images?: string[]
  price: number
  category: ProductCategory
  featured?: boolean
  sizes: string[]
  colors: string[]
  options?: ProductOption[]
  collection_id?: string | null
  collection_name?: string | null
  collection_slug?: string | null
}

export const products: Product[] = [
  {
    id: 'cb1',
    name: 'Camiseta Gorila Oversized',
    short: 'Estampa exclusiva em algodão pesado',
    description:
      'A camiseta mais icônica da Crevally Black. Corte oversized com estampa do gorila rugindo em silk de alta qualidade. Algodão penteado 300g que mantém o caimento e durabilidade lavagem após lavagem.',
    composition: '100% Algodão Penteado 300g',
    care: 'Lavar a frio, não usar alvejante, não usar secadora',
    model_info: 'Modelo 1,80m veste M. Comprimento: 73cm, Largura: 62cm',
    image: '/images/products/product-cb1.jpg',
    price: 89.90,
    category: 'camisetas',
    featured: true,
    sizes: ['P', 'M', 'G', 'GG', 'XGG'],
    colors: ['Preto', 'Branco'],
  },
  {
    id: 'cb2',
    name: 'Moletom Crevally Black Pesado',
    short: 'Moletão premium com capuz e bolso canguru',
    description:
      'Moletom de alto peso (500g) com bordado em relevo no peito. Tecido interno flanelado para máximo conforto em dias frios. Caimento largo e estruturado.',
    composition: '80% Algodão / 20% Poliéster Flanelado 500g',
    care: 'Lavar a frio ao avesso, secar à sombra',
    model_info: 'Modelo 1,82m veste M. Comprimento: 68cm, Largura: 66cm',
    image: '/images/products/product-cb2.jpg',
    price: 199.90,
    category: 'moletons',
    featured: true,
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Chumbo'],
  },
  {
    id: 'cb3',
    name: 'Calça Cargo Crevally',
    short: 'Cargo tática com 6 bolsos e elástico',
    description:
      'Calça cargo com 6 bolsos funcionais, elástico na cintura e na barra, ajuste por cadarço. Tecido ripstop resistente e leve, ideal para o dia a dia urbano.',
    composition: '65% Poliéster / 35% Algodão Ripstop',
    care: 'Lavar a frio, não usar alvejante',
    model_info: 'Modelo 1,80m veste M. Comprimento total: 100cm',
    image: '/images/products/product-cb3.jpg',
    price: 179.90,
    category: 'calcas',
    featured: true,
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Verde Oliva', 'Chumbo'],
  },
]
