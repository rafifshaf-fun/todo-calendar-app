-- Fix "RLS Policy Always True" — revoke PostgREST access since app uses Prisma direct DB
-- Run this in Supabase SQL Editor

-- 1. Drop the permissive policies that triggered the warning
DROP POLICY IF EXISTS "Allow all" ON "User";
DROP POLICY IF EXISTS "Allow all" ON "Task";

-- 2. Revoke PostgREST access from public schema tables
-- Our app uses Prisma (direct PostgreSQL), NOT Supabase's REST API
-- This is the proper fix: no API access = no RLS policy needed
REVOKE ALL ON "User" FROM anon, authenticated;
REVOKE ALL ON "Task" FROM anon, authenticated;

-- 3. Verify RLS is still enabled (Supabase requires this)
-- Already done: ALTER TABLE ... ENABLE ROW LEVEL SECURITY
