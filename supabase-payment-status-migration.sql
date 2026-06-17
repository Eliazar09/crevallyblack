-- ============================================================
-- MIGRAÇÃO: adiciona 'cancelado' ao enum payment_status
-- Execute no Supabase SQL Editor
-- ============================================================

ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'cancelado';
