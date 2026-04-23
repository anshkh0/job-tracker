import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vuwgzspgqqkcwhalaviu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1d2d6c3BncXFrY3doYWxhdml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzU4MjYsImV4cCI6MjA5MjU1MTgyNn0.mq5f8MPvwsrU96sxZ16-yHnT4U9K1VGRK1bG55B0TjI'

export const supabase = createClient(supabaseUrl, supabaseKey)