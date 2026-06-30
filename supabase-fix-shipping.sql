-- Adiciona colunas de rastreio de envio na tabela sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS shipping_status TEXT NOT NULL DEFAULT 'aguardando';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tracking_code TEXT;

-- Garante que só valores válidos são aceitos
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_shipping_status_check;
ALTER TABLE sales ADD CONSTRAINT sales_shipping_status_check
  CHECK (shipping_status IN ('aguardando', 'enviado', 'entregue'));

-- Enum cancelado (caso ainda não tenha sido adicionado)
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'cancelado';
