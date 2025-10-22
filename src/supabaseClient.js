import { createClient } from '@supabase/supabase-js'

// 从环境变量中获取 Supabase 的 URL 和 anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建并导出 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)