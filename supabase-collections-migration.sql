-- ============================================================
-- Migration: Coleções de produtos
-- Reversível — ver seção ROLLBACK no final
-- ============================================================

-- 1. Tabela collections
CREATE TABLE IF NOT EXISTS collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  image_url   text,
  sort_order  int  DEFAULT 0,
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- 2. FK em products → collections (nullable, SET NULL ao deletar)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS collection_id uuid
  REFERENCES collections(id) ON DELETE SET NULL;

-- 3. Índice para filtros por coleção
CREATE INDEX IF NOT EXISTS idx_products_collection_id ON products(collection_id);

-- 4. RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Loja (anon) só lê coleções ativas
CREATE POLICY "collections_public_read" ON collections
  FOR SELECT TO anon, authenticated
  USING (active = true);

-- Admin (authenticated) gerencia tudo
CREATE POLICY "collections_admin_all" ON collections
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- ROLLBACK (rode se precisar desfazer)
-- ============================================================
-- ALTER TABLE products DROP COLUMN IF EXISTS collection_id;
-- DROP TABLE IF EXISTS collections;
