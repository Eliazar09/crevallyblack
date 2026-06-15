-- ============================================================
-- CREVALLY BLACK — Schema Supabase
-- ============================================================
-- Como usar:
--   1. Abra seu projeto no supabase.com
--   2. Vá em SQL Editor → New Query
--   3. Cole TODO este conteúdo e clique em Run
-- ============================================================


-- ============================================================
-- EXTENSÕES
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- busca de texto (LIKE rápido)


-- ============================================================
-- ENUMS
-- ============================================================

create type product_category as enum (
  'camisetas',
  'moletons',
  'calcas',
  'shorts',
  'bones',
  'conjuntos',
  'acessorios'
);

create type product_status as enum (
  'ativo',
  'inativo',
  'rascunho'
);

create type client_type as enum (
  'cliente',
  'distribuidor',
  'mayorista'
);

create type payment_method as enum (
  'pix',
  'cartao_credito',
  'cartao_debito',
  'dinheiro',
  'transferencia',
  'boleto',
  'outro'
);

create type payment_status as enum (
  'pago',
  'pendente',
  'parcial'
);

create type transaction_type as enum (
  'receita',
  'despesa'
);

create type inventory_movement_type as enum (
  'entrada',
  'saida',
  'ajuste'
);


-- ============================================================
-- FUNÇÃO AUXILIAR: atualiza updated_at automaticamente
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- TABELA: products
-- ============================================================

create table if not exists products (
  id               uuid         primary key default uuid_generate_v4(),
  name             text         not null,
  short            text         not null default '',
  description      text         not null default '',
  composition      text         not null default '',
  care             text         not null default '',
  model_info       text         not null default '',
  image            text         not null default '',
  images           text[]       not null default '{}',
  options          jsonb,                              -- [{label, value, price?}]
  price            numeric(10,2) not null default 0,
  cost_price       numeric(10,2),
  category         product_category not null default 'camisetas',
  sku              text,
  featured         boolean      not null default false,
  status           product_status not null default 'ativo',
  stock_quantity   integer      not null default 0,
  min_stock        integer      not null default 5,
  sizes            text[]       not null default '{}',
  colors           text[]       not null default '{}',
  created_at       timestamptz  not null default now(),
  updated_at       timestamptz  not null default now()
);

create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

create index if not exists idx_products_status    on products (status);
create index if not exists idx_products_category  on products (category);
create index if not exists idx_products_featured  on products (featured);
create index if not exists idx_products_name_trgm on products using gin (name gin_trgm_ops);


-- ============================================================
-- TABELA: clients
-- ============================================================

create table if not exists clients (
  id         uuid        primary key default uuid_generate_v4(),
  name       text        not null,
  phone      text,
  email      text,
  cedula     text,
  city       text,
  type       client_type not null default 'cliente',
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_clients_updated_at
  before update on clients
  for each row execute function set_updated_at();

create index if not exists idx_clients_name_trgm on clients using gin (name gin_trgm_ops);
create index if not exists idx_clients_phone     on clients (phone);


-- ============================================================
-- TABELA: sales
-- ============================================================

create table if not exists sales (
  id             uuid           primary key default uuid_generate_v4(),
  client_id      uuid           references clients (id) on delete set null,
  client_name    text           not null,
  subtotal       numeric(10,2)  not null default 0,
  discount       numeric(10,2)  not null default 0,
  total          numeric(10,2)  not null default 0,
  payment_method payment_method not null default 'pix',
  payment_status payment_status not null default 'pendente',
  notes          text,
  created_at     timestamptz    not null default now()
);

create index if not exists idx_sales_client_id  on sales (client_id);
create index if not exists idx_sales_created_at on sales (created_at desc);
create index if not exists idx_sales_status     on sales (payment_status);


-- ============================================================
-- TABELA: sale_items
-- ============================================================

create table if not exists sale_items (
  id           uuid          primary key default uuid_generate_v4(),
  sale_id      uuid          not null references sales (id) on delete cascade,
  product_id   uuid          references products (id) on delete set null,
  product_name text          not null,
  quantity     integer       not null default 1,
  unit_price   numeric(10,2) not null,
  subtotal     numeric(10,2) not null,
  created_at   timestamptz   not null default now()
);

create index if not exists idx_sale_items_sale_id    on sale_items (sale_id);
create index if not exists idx_sale_items_product_id on sale_items (product_id);


-- ============================================================
-- TABELA: inventory_movements
-- ============================================================

create table if not exists inventory_movements (
  id              uuid                   primary key default uuid_generate_v4(),
  product_id      uuid                   not null references products (id) on delete cascade,
  type            inventory_movement_type not null,
  quantity        integer                not null,   -- negativo = saída
  reason          text,
  related_sale_id uuid                   references sales (id) on delete set null,
  created_at      timestamptz            not null default now()
);

create index if not exists idx_inv_mov_product_id on inventory_movements (product_id);
create index if not exists idx_inv_mov_created_at on inventory_movements (created_at desc);


-- ============================================================
-- TABELA: transactions  (financeiro)
-- ============================================================

create table if not exists transactions (
  id              uuid             primary key default uuid_generate_v4(),
  type            transaction_type not null,
  category        text             not null,
  amount          numeric(10,2)    not null,
  description     text,
  related_sale_id uuid             references sales (id) on delete set null,
  date            date             not null default current_date,
  created_at      timestamptz      not null default now()
);

create index if not exists idx_transactions_type on transactions (type);
create index if not exists idx_transactions_date on transactions (date desc);


-- ============================================================
-- VIEW: v_low_stock  (produtos abaixo do estoque mínimo)
-- ============================================================

create or replace view v_low_stock as
select
  id,
  name,
  stock_quantity,
  min_stock,
  category::text
from products
where stock_quantity <= min_stock
  and status = 'ativo'
order by stock_quantity asc;


-- ============================================================
-- VIEW: v_monthly_finance  (receita x despesa por mês)
-- ============================================================

create or replace view v_monthly_finance as
select
  to_char(date, 'YYYY-MM')                                              as month,
  sum(case when type = 'receita' then amount else 0    end)             as receitas,
  sum(case when type = 'despesa' then amount else 0    end)             as despesas,
  sum(case when type = 'receita' then amount else -amount end)          as lucro
from transactions
group by to_char(date, 'YYYY-MM')
order by month asc;


-- ============================================================
-- FUNÇÕES UTILITÁRIAS
-- ============================================================

-- Diminui estoque sem ir negativo
create or replace function decrement_stock(p_product_id uuid, p_qty integer)
returns void
language plpgsql security definer as $$
begin
  update products
  set stock_quantity = greatest(0, stock_quantity - p_qty)
  where id = p_product_id;
end;
$$;

-- Aumenta estoque
create or replace function increment_stock(p_product_id uuid, p_qty integer)
returns void
language plpgsql security definer as $$
begin
  update products
  set stock_quantity = stock_quantity + p_qty
  where id = p_product_id;
end;
$$;

-- Resumo financeiro do mês atual
create or replace function get_month_summary()
returns table (receitas numeric, despesas numeric, lucro numeric)
language sql security definer as $$
  select
    coalesce(sum(case when type = 'receita' then amount end), 0),
    coalesce(sum(case when type = 'despesa' then amount end), 0),
    coalesce(sum(case when type = 'receita' then amount else -amount end), 0)
  from transactions
  where date >= date_trunc('month', current_date)::date;
$$;

-- Total de vendas de um produto específico
create or replace function product_total_sold(p_product_id uuid)
returns integer
language sql security definer as $$
  select coalesce(sum(quantity), 0)::integer
  from sale_items
  where product_id = p_product_id;
$$;


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table products            enable row level security;
alter table clients             enable row level security;
alter table sales               enable row level security;
alter table sale_items          enable row level security;
alter table inventory_movements enable row level security;
alter table transactions        enable row level security;

-- ── products ──────────────────────────────────────────────
-- Visitantes: podem ver apenas produtos ativos
create policy "products_public_read"
  on products for select
  using (status = 'ativo');

-- Admin autenticado: acesso total (inclui inativos/rascunhos)
create policy "products_admin_all"
  on products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── clients ───────────────────────────────────────────────
create policy "clients_admin_all"
  on clients for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── sales ─────────────────────────────────────────────────
-- Admin: acesso total
create policy "sales_admin_all"
  on sales for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Visitante: só pode criar pedidos (sem ver dados de outros)
create policy "sales_public_insert"
  on sales for insert
  to anon
  with check (true);

-- ── sale_items ────────────────────────────────────────────
create policy "sale_items_admin_all"
  on sale_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "sale_items_public_insert"
  on sale_items for insert
  to anon
  with check (true);

-- ── inventory_movements ───────────────────────────────────
create policy "inv_mov_admin_all"
  on inventory_movements for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Visitante só pode registrar saída (pedido)
create policy "inv_mov_public_insert"
  on inventory_movements for insert
  to anon
  with check (type = 'saida');

-- ── transactions ──────────────────────────────────────────
create policy "transactions_admin_all"
  on transactions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Visitante só pode registrar receita pendente
create policy "transactions_public_insert"
  on transactions for insert
  to anon
  with check (type = 'receita');


-- ============================================================
-- STORAGE: bucket product-photos
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-photos',
  'product-photos',
  true,
  5242880,   -- 5 MB por arquivo
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Leitura pública das fotos
create policy "photos_public_read"
  on storage.objects for select
  using (bucket_id = 'product-photos');

-- Somente admin pode fazer upload
create policy "photos_admin_upload"
  on storage.objects for insert
  with check (bucket_id = 'product-photos' and auth.role() = 'authenticated');

-- Somente admin pode atualizar
create policy "photos_admin_update"
  on storage.objects for update
  using (bucket_id = 'product-photos' and auth.role() = 'authenticated');

-- Somente admin pode deletar
create policy "photos_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'product-photos' and auth.role() = 'authenticated');


-- ============================================================
-- SEED: 5 produtos iniciais
-- (remova este bloco se não quiser dados de exemplo)
-- ============================================================

insert into products
  (name, short, description, composition, care, model_info,
   image, price, cost_price, category, sku,
   featured, status, stock_quantity, min_stock, sizes, colors)
values
(
  'Camiseta Básica Preta',
  'Camiseta premium 100% algodão',
  'Camiseta essencial da Crevally Black. Corte regular, caimento perfeito e tecido de alto gramado que não perde a forma.',
  '100% Algodão 30.1 penteado — 180g/m²',
  'Lavar ao avesso em água fria. Não usar alvejante. Secar à sombra.',
  'Modelo veste M. Altura 1,78m. Peso 75kg.',
  '', 89.90, 28.00, 'camisetas', 'CB-BAS-001',
  true, 'ativo', 50, 10,
  array['PP','P','M','G','GG','XGG'],
  array['Preto','Branco','Cinza']
),
(
  'Camiseta Gorila CB',
  'Estampa exclusiva frente e costas',
  'A mais icônica da Crevally Black. Estampa exclusiva do gorila com coroa, símbolo da marca. Algodão pesado com caimento premium.',
  '100% Algodão 30.1 penteado — 240g/m²',
  'Lavar ao avesso em água fria. Não torcer. Secar à sombra.',
  'Modelo veste M. Altura 1,78m. Peso 75kg.',
  '', 129.90, 42.00, 'camisetas', 'CB-GOR-001',
  true, 'ativo', 30, 8,
  array['P','M','G','GG'],
  array['Preto']
),
(
  'Moletom Canguru Premium',
  'Moletom oversized fleece interno',
  'Moletom com capuz, bolso canguru e ribana dupla. Fleece interno macio, perfeito para o inverno ou ar-condicionado.',
  '80% Algodão / 20% Poliéster — Fleece 320g/m²',
  'Lavar ao avesso em ciclo delicado. Secar estendido. Não usar secadora em alta temperatura.',
  'Modelo veste M. Altura 1,78m. Peso 75kg.',
  '', 249.90, 85.00, 'moletons', 'CB-MOL-001',
  true, 'ativo', 25, 5,
  array['P','M','G','GG'],
  array['Preto','Chumbo']
),
(
  'Calça Cargo Streetwear',
  'Calça cargo com bolsos laterais',
  'Calça cargo com múltiplos bolsos funcionais, elástico na cintura e barra ajustável. Tecido resistente para o dia a dia.',
  '65% Poliéster / 35% Algodão — Sarja',
  'Lavar em água fria. Não usar alvejante. Secar à sombra.',
  'Modelo veste M/40. Altura 1,78m. Peso 75kg.',
  '', 189.90, 65.00, 'calcas', 'CB-CAL-001',
  false, 'ativo', 20, 5,
  array['36','38','40','42','44'],
  array['Preto','Verde Militar','Bege']
),
(
  'Boné Dad Hat Bordado',
  'Boné dad hat logo bordado',
  'Boné estilo dad hat com logo Crevally Black bordado na frente. Aba curva, fecho ajustável. Tamanho único.',
  '100% Algodão',
  'Lavar à mão com água fria. Secar ao ar livre.',
  'Tamanho único ajustável.',
  '', 69.90, 22.00, 'bones', 'CB-BON-001',
  false, 'ativo', 40, 10,
  array['Único'],
  array['Preto','Branco']
);


-- ============================================================
-- FIM DO SCHEMA
-- Próximo passo: criar o usuário admin em
--   Supabase → Authentication → Users → Add user
--   Email: seu@email.com  /  Senha: escolha uma senha forte
-- ============================================================
