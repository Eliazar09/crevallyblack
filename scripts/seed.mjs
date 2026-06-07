/**
 * Script de seed: insere os 28 produtos em Supabase via service role key.
 * Uso: node scripts/seed.mjs
 * Requer: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load env
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
  console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const supabase = createClient(url, key)

const products = [
  { id:'p1',  name:'Regu Fine 30 Caps', short:'Potente emagrecedor con control del apetito', description:'Regu Fine 30 Caps es un inhibidor del apetito de alta eficacia. Proporciona mayor sensación de saciedad, ayudando a controlar el peso corporal de forma natural y sostenida.', benefits:['Inhibe el apetito de forma natural','Proporciona mayor saciedad','Apoya el control del peso corporal','Formulación 100% natural'], how_to_use:'Tomar 1 cápsula 30 minutos antes de las comidas principales, con abundante agua.', image:'/images/products/product-p1.jpg', price:80, category:'adelgazamiento', featured:true },
  { id:'p2',  name:'Regu Fine Maxx 30 Caps', short:'Control del apetito y acelerador metabólico', description:'Regu Fine Maxx actúa en el control del apetito, acelera el metabolismo, reduce la sensación de hinchazón y contribuye al adelgazamiento progresivo y saludable.', benefits:['Controla el apetito eficazmente','Acelera el metabolismo','Reduce la sensación de hinchazón','Contribuye al adelgazamiento'], how_to_use:'Tomar 1 cápsula al día, preferiblemente con el desayuno.', image:'/images/products/product-p2.jpg', price:80, category:'adelgazamiento', featured:true },
  { id:'p3',  name:'Sculp Thermo 30 Caps', short:'Termoénico con control glucémico', description:'Sculp Thermo ayuda a combatir la diabetes reduciendo el nivel de azúcar en la sangre, mejora la salud intestinal y favorece el adelgazamiento mediante acción termogénica avanzada.', benefits:['Reduce el nivel de azúcar en sangre','Mejora la salud intestinal','Favorece el adelgazamiento','Acción termogénica comprobada'], how_to_use:'Tomar 1 cápsula antes del entrenamiento o con el desayuno.', image:'/images/products/product-p3.jpg', price:80, category:'adelgazamiento', featured:true },
  { id:'p4',  name:'Regu Fine Xtreme 60 Cáps', short:'Rendimiento físico y mental intensificado', description:'Mejora el rendimiento físico y mental, reduce la fatiga, incrementa la capacidad cognitiva, mejora la síntesis de glucógeno y acelera la recuperación muscular post-entrenamiento.', benefits:['Mejora rendimiento físico y mental','Reduce la fatiga muscular','Incrementa la capacidad cognitiva','Acelera la recuperación muscular'], how_to_use:'Tomar 2 cápsulas 30 minutos antes del entrenamiento.', image:'/images/products/product-p4.jpg', price:30, category:'fitness' },
  { id:'p5',  name:'Green Energy Detox 60 Caps', short:'Desintoxicante natural de alto impacto', description:'Desintoxicante natural que limpia el organismo de toxinas acumuladas y ayuda a equilibrar cuerpos sobrecargados, restaurando la energía y el bienestar general.', benefits:['Desintoxicación profunda y natural','Limpia el organismo de toxinas','Equilibra el sistema digestivo','Restaura la energía vital'], how_to_use:'Tomar 2 cápsulas al día con abundante agua.', image:'/images/products/product-p5.jpg', price:35, category:'detox', featured:true },
  { id:'p6',  name:'Abacate + Vitamina E 30 Caps', short:'Bienestar integral desde adentro', description:'Formulación que combina el aguacate con vitamina E para favorecer una barriga plana, corazón saludable, control de la diabetes, inmunidad fortalecida y salud ocular mejorada.', benefits:['Favorece la reducción abdominal','Apoya la salud cardiovascular','Fortalece el sistema inmune','Mejora la salud ocular'], how_to_use:'Tomar 1 cápsula al día con el almuerzo.', image:'/images/products/product-p6.jpg', price:20, category:'vitaminas' },
  { id:'p7',  name:'Chá Regu Life Paquete 120g', short:'Infusión natural para el bienestar', description:'Infusión natural formulada para el bienestar general. Ideal para la depuración orgánica y el equilibrio corporal, con ingredientes botánicos seleccionados.', benefits:['Depuración orgánica natural','Equilibrio corporal','Bienestar digestivo','Ingredientes botánicos puros'], how_to_use:'Preparar una infusión con 1 cucharada por taza de agua caliente. Beber 2-3 veces al día.', image:'/images/products/product-p7.jpg', price:20, category:'detox' },
  { id:'p8',  name:'Chá Regu Life Frutas Rojas 30 Sobres', short:'Diurético natural con frutas rojas', description:'Posee propiedades diuréticas que ayudan a eliminar microorganismos del cuerpo, favoreciendo la limpieza interna con el delicioso sabor de frutas rojas selectas.', benefits:['Propiedades diuréticas naturales','Elimina microorganismos','Favorece la limpieza interna','Sabor natural de frutas rojas'], how_to_use:'Disolver 1 sobre en 300ml de agua fría o caliente. Consumir 1-2 veces al día.', image:'/images/products/product-p8.jpg', price:25, category:'detox' },
  { id:'p9',  name:'Chá Regu Life Piña 30 Sobres', short:'Purificante con propiedades diuréticas', description:'Ayuda al organismo a eliminar toxinas gracias a sus hojas con propiedades diuréticas y purificantes, con el refrescante sabor tropical de la piña natural.', benefits:['Elimina toxinas del organismo','Propiedades diuréticas comprobadas','Acción purificante natural','Sabor tropical de piña'], how_to_use:'Disolver 1 sobre en 300ml de agua. Consumir con el estómago vacío por la mañana.', image:'/images/products/product-p9.jpg', price:25, category:'detox' },
  { id:'p10', name:'Chá Regu Fine Detox 30 Sobres', short:'Seis ingredientes naturales en acción detox', description:'Combinación poderosa de seis ingredientes naturales que promueven la acción detox, aceleran el metabolismo y fortalecen la inmunidad, con resultados visibles desde la primera semana.', benefits:['Seis ingredientes naturales sinérgicos','Promueve la acción detox profunda','Acelera el metabolismo','Fortalece el sistema inmunológico'], how_to_use:'Disolver 1 sobre en agua caliente. Tomar en ayunas o entre comidas.', image:'/images/products/product-p10.jpg', price:25, category:'detox' },
  { id:'p12', name:'Colágeno Verisol con Ácido Hialurónico', short:'Hidratación y elasticidad de la piel', description:'Combina péptidos bioactivos de colágeno Verisol con Ácido Hialurónico Haplex, mejorando la hidratación profunda y la elasticidad de la piel desde adentro hacia afuera.', benefits:['Péptidos bioactivos Verisol','Mejora hidratación profunda','Aumenta la elasticidad de la piel','Ácido Hialurónico Haplex'], how_to_use:'Tomar 1 cápsula al día en ayunas con agua o jugo natural.', image:'/images/products/product-p12.jpg', price:45, category:'belleza', featured:true },
  { id:'p13', name:'Iso Life Isotónico Manzana Verde (15)', short:'Rehidratación y rendimiento deportivo', description:'Suplemento hidroelectrolítico ideal para entrenamientos y competiciones. Repone los minerales perdidos por el sudor y mejora el rendimiento con sabor a manzana verde.', benefits:['Rehidratación rápida y efectiva','Repone minerales perdidos','Mejora el rendimiento deportivo','Ideal para entrenamientos intensos'], how_to_use:'Disolver 1 sobre en 500ml de agua fría. Consumir durante el entrenamiento.', image:'/images/products/product-p13.jpg', price:25, category:'fitness' },
  { id:'p14', name:'Creatina 200g', short:'Fuerza, masa muscular y recuperación', description:'Mejora el rendimiento físico y muscular, ayuda en la recuperación post entrenamiento y potencia la síntesis de ATP para más energía durante los entrenamientos intensos.', benefits:['Mejora el rendimiento muscular','Potencia la síntesis de ATP','Acelera la recuperación','Aumenta la fuerza máxima'], how_to_use:'Tomar 5g mezclados en agua o jugo, antes o después del entrenamiento.', image:'/images/products/product-p14.jpg', price:40, category:'fitness' },
  { id:'p15', name:'Omega 3 Gold 60 Cáps', short:'EPA y DHA para corazón, cerebro y articulaciones', description:'Omega 3 Gold con 33% EPA y 22% DHA en cápsulas de alta concentración. Ayuda a mantener niveles saludables de triglicéridos, apoya la salud cardiovascular, mejora la función cognitiva y contribuye al bienestar articular.', benefits:['33% EPA de alta pureza','22% DHA concentrado','Niveles saludables de triglicéridos','Salud cardiovascular, cerebral y articular'], how_to_use:'Tomar 2 cápsulas al día con el almuerzo o cena.', image:'/images/products/product-p15.jpg', price:30, category:'vitaminas' },
  { id:'p16', name:'Whey Protein 5W 200g', short:'Proteína premium con creatina integrada', description:'El consumo de proteína de suero ayuda al mantenimiento y desarrollo muscular. Con creatina añadida mejora la recuperación y maximiza los resultados del entrenamiento.', benefits:['Desarrollo y mantenimiento muscular','Creatina añadida para mayor potencia','Alta concentración de proteína','Rápida absorción post-entreno'], how_to_use:'Mezclar 1 medida (33g) en 200ml de agua o leche. Consumir post-entrenamiento.', image:'/images/products/product-p16.jpg', price:50, category:'fitness', featured:true, options:[{label:'Chocolate',value:'chocolate'},{label:'Vainilla',value:'vainilla'},{label:'Fresa',value:'fresa'}] },
  { id:'p17', name:'Tri-Magnésio + ZMA con Colágeno 60 Caps', short:'Función muscular y recuperación articular', description:'Formulación exclusiva desarrollada para mejorar la función muscular, promover la recuperación post entrenamiento y apoyar la salud articular con ZMA y colágeno.', benefits:['Triple magnesio premium','ZMA para recuperación nocturna','Apoya la salud articular','Colágeno para tejido conectivo'], how_to_use:'Tomar 2 cápsulas antes de dormir con agua.', image:'/images/products/product-p17.jpg', price:30, category:'fitness' },
  { id:'p18', name:'Cúrcuma 30 Caps', short:'Antiinflamatorio natural con vitaminas', description:'Cúrcuma con vitamina C, glutamina y vitamina D desarrollada con alta tecnología, actúa en diversas vías metabólicas importantes para la salud y bienestar general.', benefits:['Potente antiinflamatorio natural','Vitamina C y D integradas','Glutamina para el intestino','Alta biodisponibilidad'], how_to_use:'Tomar 1 cápsula al día con las comidas.', image:'/images/products/product-p18.jpg', price:25, category:'vitaminas' },
  { id:'p19', name:'Complejo B 30 Caps', short:'Energía y sistema nervioso en equilibrio', description:'Las vitaminas del complejo B son esenciales para el metabolismo energético, ayudando en la conversión de los alimentos en energía y al equilibrio del sistema nervioso.', benefits:['Metabolismo energético optimizado','Convierte alimentos en energía','Apoya el sistema nervioso','Complejo B completo'], how_to_use:'Tomar 1 cápsula al día con el desayuno.', image:'/images/products/product-p19.jpg', price:25, category:'vitaminas' },
  { id:'p20', name:'Iso Life Gel Carbo Açaí con Guaraná 10 Sachês', short:'Energía estable e hidratación eficaz', description:'Mezcla perfecta de vitaminas C y E, electrolitos y carbohidratos para energía estable, hidratación eficaz y mejora en la resistencia muscular durante el ejercicio.', benefits:['Energía estable y sostenida','Hidratación eficaz con electrolitos','Mejora la resistencia muscular','Vitaminas C y E antioxidantes'], how_to_use:'Consumir 1 sachet durante el entrenamiento, directamente o mezclado con agua.', image:'/images/products/product-p20.jpg', price:25, category:'fitness' },
  { id:'p21', name:'Resveratrol 30 Caps', short:'Antioxidante natural de uvas y frutas rojas', description:'Suplemento alimenticio que combina los poderosos beneficios del resveratrol, un antioxidante natural presente en uvas, frutas rojas y plantas con múltiples estudios científicos.', benefits:['Potente antioxidante natural','Origen en uvas y frutas rojas','Apoya la salud cardiovascular','Propiedades antiaging'], how_to_use:'Tomar 1 cápsula al día con el almuerzo.', image:'/images/products/product-p21.jpg', price:25, category:'vitaminas' },
  { id:'p22', name:'Gel Redutor de Medidas 240g', short:'Gel reductor de uso tópico intensivo', description:'Gel reductor con Nicotinato de Metila, Centella Asiática, Castaña de la India, Cafeína y Té Verde para reducción de medidas y mejora de la apariencia de la piel.', benefits:['Nicotinato de Metila activador','Centella Asiática reparadora','Cafeína y Té Verde reductores','Castaña de la India tonificante'], how_to_use:'Aplicar con masaje circular en las zonas deseadas, 2 veces al día.', image:'/images/products/product-p22.jpg', price:45, category:'belleza' },
  { id:'p23', name:'Queen Care Cabello y Uñas 30 Caps', short:'La belleza comienza desde adentro', description:'La belleza comienza desde adentro. Queen Care contribuye al cuidado del cabello y al fortalecimiento de las uñas con nutrientes específicos y de alta biodisponibilidad.', benefits:['Fortalece el cabello desde la raíz','Endurece y nutre las uñas','Nutrientes de alta biodisponibilidad','Resultados visibles en 30 días'], how_to_use:'Tomar 1 cápsula al día con el desayuno o almuerzo.', image:'/images/products/product-p23.jpg', price:20, category:'belleza' },
  { id:'p24', name:'Melatonina con Triptofano', short:'Sueño reparador para el bienestar total', description:'El sueño es un proceso reparador fundamental para la salud de la piel, los músculos, el sistema inmunológico y el sistema nervioso. Melatonina + Triptofano para un descanso profundo.', benefits:['Induce el sueño natural','Sueño reparador y profundo','Apoya la salud de la piel','Fortalece el sistema inmune nocturno'], how_to_use:'Tomar 30 minutos antes de dormir con agua.', image:'/images/products/product-p24.jpg', price:20, category:'descanso', options:[{label:'30 cápsulas',value:'30caps',price:20},{label:'60 cápsulas',value:'60caps',price:25}] },
  { id:'p26', name:'Chá Regu Night 30 Sobres', short:'Relajación profunda y sueño restaurador', description:'Desarrollado para ayudar a combatir la ansiedad, el estrés, los dolores de cabeza, las migrañas y mejorar la inmunidad con una fórmula herbal de acción nocturna.', benefits:['Combate la ansiedad y el estrés','Alivia dolores de cabeza y migrañas','Mejora la calidad del sueño','Fortalece la inmunidad nocturna'], how_to_use:'Disolver 1 sobre en agua caliente. Tomar 30-45 minutos antes de dormir.', image:'/images/products/product-p26.jpg', price:25, category:'descanso' },
  { id:'p27', name:'Feros 60 Caps', short:'Salud masculina y vitalidad integral', description:'Para la salud del hombre, actuando en la regulación de los niveles de testosterona, el aumento de la libido sexual y la fuerza muscular de forma natural.', benefits:['Regula los niveles de testosterona','Aumenta la libido naturalmente','Mejora la fuerza muscular','Vitalidad masculina integral'], how_to_use:'Tomar 2 cápsulas al día, una con el desayuno y otra con el almuerzo.', image:'/images/products/product-p27.jpg', price:30, category:'masculino', featured:true },
  { id:'p30', name:'Mega Picolinato de Cromo 30 Cáps', short:'Cápsulas Soft Gel de alta concentración', description:'¡Uno de los únicos del mercado en cápsulas Soft Gel! Cada cápsula contiene 500mg y utiliza aceite de linaza como vehículo para máxima absorción del picolinato de cromo.', benefits:['Cápsulas Soft Gel exclusivas','Alta concentración 500mg','Aceite de linaza como vehículo','Máxima biodisponibilidad'], how_to_use:'Tomar 1 cápsula al día con el almuerzo.', image:'/images/products/product-p30.jpg', price:20, category:'adelgazamiento' },
  { id:'p31', name:'Omega 3 Gold 30 Cáps', short:'EPA y DHA para triglicéridos saludables', description:'Omega 3 Gold con 33% EPA y 22% DHA. Ayuda a mantener niveles saludables de triglicéridos y apoya la salud cardiovascular, cerebral y articular.', benefits:['33% EPA de alta pureza','22% DHA concentrado','Niveles saludables de triglicéridos','Salud cardiovascular y cerebral'], how_to_use:'Tomar 1 cápsula al día con el almuerzo o cena.', image:'/images/products/product-p31.jpg', price:20, category:'vitaminas' },
  { id:'p32', name:'Nutry Focus 60 Cáps', short:'Concentración y rendimiento mental', description:'Suplemento que elevará tu rendimiento mental. Aporta energía inmediata y mejora la concentración y el enfoque mental para mayor productividad y claridad cognitiva.', benefits:['Energía mental inmediata','Mejora la concentración','Potencia el enfoque cognitivo','Mayor productividad y claridad'], how_to_use:'Tomar 2 cápsulas al día con el desayuno.', image:'/images/products/product-p32.jpg', price:25, category:'vitaminas' },
]

console.log(`Inserindo ${products.length} produtos...`)

const rows = products.map((p) => ({
  id: p.id,
  name: p.name,
  short: p.short,
  description: p.description,
  benefits: p.benefits,
  how_to_use: p.how_to_use,
  image: p.image,
  images: [],
  options: p.options ?? null,
  price: p.price,
  cost_price: null,
  category: p.category,
  sku: null,
  featured: p.featured ?? false,
  status: 'activo',
  stock_quantity: 50,
  min_stock: 5,
}))

const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' })
if (error) {
  console.error('Erro:', error.message)
  process.exit(1)
}
console.log('✅ Seed concluído com sucesso!')
