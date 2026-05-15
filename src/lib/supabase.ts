import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for public use (honors RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for backend API routes (bypasses RLS to act as admin)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
