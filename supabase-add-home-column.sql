-- Adiciona coluna show_on_home na tabela collections
ALTER TABLE collections ADD COLUMN IF NOT EXISTS show_on_home boolean DEFAULT false;
