import { createClient } from "@supabase/supabase-js";

// 🔹 Ortam değişkenleri (Vite ile uyumlu)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🔹 Eğer .env dosyası yoksa fallback olarak doğrudan adres gir
// Bu değerleri kendi Supabase projenin Project Settings → API kısmından al
const SUPABASE_URL = supabaseUrl || "https://tvsfhhxxligbqrcqtprq.supabase.co";
const SUPABASE_ANON_KEY =
  supabaseAnonKey ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c2ZoaHh4bGlnYnFyY3F0cHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDAyNzIsImV4cCI6MjA3Njg3NjI3Mn0.aqFyNNKD9EW-2v_jsdY8eYkjz_es3ZFSzkAGZjb2AaE";

// 🔹 Supabase client oluştur
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
