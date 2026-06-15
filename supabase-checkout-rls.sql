-- ============================================================
-- POLÍTICAS RLS — CHECKOUT PÚBLICO
-- Execute este arquivo no Supabase SQL Editor
-- Permite que visitantes (anon) insiram pedidos via checkout
-- ============================================================

-- sales: público pode criar pedidos (mas NÃO ver/editar/deletar)
create policy "sales_public_insert"
  on sales for insert
  to anon
  with check (true);

-- sale_items: público pode inserir itens do pedido
create policy "sale_items_public_insert"
  on sale_items for insert
  to anon
  with check (true);

-- inventory_movements: público pode registrar saída de estoque via pedido
create policy "inv_mov_public_insert"
  on inventory_movements for insert
  to anon
  with check (type = 'saida');

-- transactions: público pode registrar receita pendente
create policy "transactions_public_insert"
  on transactions for insert
  to anon
  with check (type = 'receita');
