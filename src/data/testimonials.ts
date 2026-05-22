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
    name: 'Mariela Rodríguez',
    location: 'Caracas',
    text: 'Llevo 6 semanas con Regu Fine Maxx y he bajado 5 kilos. Lo que más me sorprende es que no siento ansiedad por comer. El servicio de Jennifer es increíble, siempre disponible.',
    product: 'Regu Fine Maxx',
    rating: 5,
    initials: 'MR',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 't2',
    name: 'Carmen Valera',
    location: 'Valencia',
    text: 'Empecé con los tés Regu Life y el resultado fue inmediato: menos hinchazón y más energía. Ahora soy distribuidora y mis clientas también están encantadas con los resultados.',
    product: 'Chá Regu Life',
    rating: 5,
    initials: 'CV',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: 't3',
    name: 'Luisa Fernández',
    location: 'Maracaibo',
    text: 'El Colágeno Verisol cambió completamente mi piel. A los 40 años pensé que era imposible recuperar la firmeza. Con GreenLife lo logré en menos de dos meses de uso constante.',
    product: 'Colágeno Verisol',
    rating: 5,
    initials: 'LF',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
  {
    id: 't4',
    name: 'Andreína Torres',
    location: 'Barquisimeto',
    text: 'El Detox de GreenLife es increíble. En la primera semana noté que mi digestión mejoró muchísimo. Me siento más liviana y con más energía para mis actividades diarias.',
    product: 'Green Energy Detox',
    rating: 5,
    initials: 'AT',
    image: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: 't5',
    name: 'Patricia Gómez',
    location: 'Maturín',
    text: 'Usé el Whey Protein después de mis entrenamientos y los resultados fueron visibles en pocas semanas. Mis músculos se recuperan más rápido y me siento con más fuerza.',
    product: 'Whey Protein',
    rating: 5,
    initials: 'PG',
    image: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
  {
    id: 't6',
    name: 'Gabriela Morales',
    location: 'Puerto Ordaz',
    text: 'Las Vitaminas C de GreenLife son de una calidad excepcional. Desde que las tomo, casi no me enfermo. 100% recomendadas para reforzar el sistema inmune, especialmente en temporada de lluvia.',
    product: 'Vitamina C 1000mg',
    rating: 5,
    initials: 'GM',
    image: 'https://randomuser.me/api/portraits/women/6.jpg',
  },
  {
    id: 't7',
    name: 'Alejandra Rivas',
    location: 'San Cristóbal',
    text: 'El Omega 3 Gold es lo mejor que he probado. Noto la diferencia en mi concentración y en mis articulaciones. Lo recomiendo a toda mi familia, es un producto que vale cada centavo.',
    product: 'Omega 3 Gold',
    rating: 5,
    initials: 'AR',
    image: 'https://randomuser.me/api/portraits/women/7.jpg',
  },
  {
    id: 't8',
    name: 'Valentina Suárez',
    location: 'Mérida',
    text: 'Llevo 3 meses tomando el Magnesio y duermo como nunca. Antes me despertaba varias veces en la noche. GreenLife transformó mi descanso y con ello toda mi calidad de vida.',
    product: 'Tri-Magnésio',
    rating: 5,
    initials: 'VS',
    image: 'https://randomuser.me/api/portraits/women/8.jpg',
  },
  {
    id: 't9',
    name: 'Daniela Peña',
    location: 'Caracas',
    text: 'Con Regu Fine perdí 7 kilos en 2 meses sin dejar de comer. Solo corregí mis hábitos y el suplemento hizo el resto. Jennifer siempre disponible para guiarme. ¡Resultado real garantizado!',
    product: 'Regu Fine',
    rating: 5,
    initials: 'DP',
    image: 'https://randomuser.me/api/portraits/women/9.jpg',
  },
]
