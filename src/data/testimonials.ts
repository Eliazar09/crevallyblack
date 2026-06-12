export interface Testimonial {
  id: string
  name: string
  location: string
  text: string
  product: string
  rating: number
  initials: string
  image: string
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Lucas Oliveira',
    location: 'São Paulo',
    text: 'A camiseta oversized chegou em 3 dias e o acabamento é impecável. Algodão muito pesado, não deforma mesmo depois de várias lavagens. Já comprei mais duas.',
    product: 'Camiseta Gorila Oversized',
    rating: 5,
    initials: 'LO',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: 't2',
    name: 'Matheus Costa',
    location: 'Rio de Janeiro',
    text: 'O moletom da Crevally é diferente de tudo que já comprei. Parece roupa de grife mesmo sendo acessível. O bordado em relevo ficou perfeito, qualidade absurda.',
    product: 'Moletom Crevally Black Pesado',
    rating: 5,
    initials: 'MC',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: 't3',
    name: 'Rafael Souza',
    location: 'Belo Horizonte',
    text: 'Comprei a calça cargo e me surpreendi com a qualidade do tecido. Super resistente e confortável. Os bolsos são funcionais de verdade, não é só enfeite.',
    product: 'Calça Cargo Crevally',
    rating: 5,
    initials: 'RS',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: 't4',
    name: 'Felipe Lima',
    location: 'Curitiba',
    text: 'Marca top demais. O atendimento via WhatsApp é rápido, o produto chegou bem embalado e o caimento é exatamente como nas fotos. Recomendo 100%.',
    product: 'Camiseta Gorila Oversized',
    rating: 5,
    initials: 'FL',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
  {
    id: 't5',
    name: 'Gabriel Nunes',
    location: 'Porto Alegre',
    text: 'Virei revendedor Crevally e os meus clientes adoraram. As peças vendem rápido porque a qualidade fala por si só. Melhor decisão que tomei.',
    product: 'Conjunto Crevally',
    rating: 5,
    initials: 'GN',
    image: 'https://randomuser.me/api/portraits/men/5.jpg',
  },
  {
    id: 't6',
    name: 'Thiago Martins',
    location: 'Brasília',
    text: 'Recebi o pedido antes do prazo e a embalagem estava incrível. A camiseta tem um caimento diferenciado, bem pesada e com estampa muito bem feita. Voltarei sempre.',
    product: 'Camiseta Gorila Oversized',
    rating: 5,
    initials: 'TM',
    image: 'https://randomuser.me/api/portraits/men/6.jpg',
  },
]
