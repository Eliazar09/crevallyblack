-- ============================================================
-- CORREÇÃO RLS — Remove permissões anon desnecessárias
-- Execute no Supabase SQL Editor
-- ============================================================

-- inventory_movements e transactions agora SÓ são inseridos
-- pelo webhook (service_role key) após pagamento confirmado.
-- Remover permissão anon elimina risco de injeção de dados falsos.

DROP POLICY IF EXISTS "inv_mov_public_insert"    ON inventory_movements;
DROP POLICY IF EXISTS "transactions_public_insert" ON transactions;

-- Garante que RLS está habilitado nessas tabelas
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions        ENABLE ROW LEVEL SECURITY;

-- Sales e sale_items: anon pode INSERT (necessário para o checkout)
-- mas NÃO pode SELECT/UPDATE/DELETE pedidos de outros usuários
ALTER TABLE sales      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Garante que a política de insert em sales existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='sales' AND policyname='sales_public_insert'
  ) THEN
    CREATE POLICY "sales_public_insert" ON sales FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='sale_items' AND policyname='sale_items_public_insert'
  ) THEN
    CREATE POLICY "sale_items_public_insert" ON sale_items FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- Colunas de rastreio de envio (caso ainda não existam)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS shipping_status TEXT NOT NULL DEFAULT 'aguardando';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tracking_code   TEXT;

ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_shipping_status_check;
ALTER TABLE sales ADD CONSTRAINT sales_shipping_status_check
  CHECK (shipping_status IN ('aguardando', 'enviado', 'entregue'));

-- Enum cancelado
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'cancelado';
