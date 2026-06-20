-- ============================================================
-- FIX: adiciona 'cancelado' ao enum payment_status
-- Execute no SQL Editor do Supabase antes do próximo deploy
-- ============================================================

ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'cancelado';
