import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://xjrhebmomygxcafbvlye.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcmhlYm1vbXlneGNhZmJ2bHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA5NzkxNTUsImV4cCI6MjAyNjU1NTE1NX0.SmMkxD8GudmadPL5Lt83JwskZhszbDa4q6_WpbFUgdQ')

export default supabase