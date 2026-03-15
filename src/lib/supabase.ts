import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트 (브라우저/서버 공용, anon key)
 * 환경변수 없으면 null 반환 → JSON fallback 사용
 */
export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createClient(url, anonKey);
}

/**
 * Supabase Admin 클라이언트 (서버 전용, service role key)
 * 환경변수 없으면 null 반환
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey);
}

/**
 * Supabase 사용 가능 여부
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
