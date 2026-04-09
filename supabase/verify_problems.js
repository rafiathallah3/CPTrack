// verify_problems.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kjpflnjpqplopnjkebgo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcGZsbmpwcXBsb3BuamtlYmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MjE0NzIsImV4cCI6MjA4OTM5NzQ3Mn0.-cwW0yRTr85exKyfeO8bqu6VIlEFg0hBV83YwWzIzBQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verify() {
  const { data, error } = await supabase.from('problems').select('id, title, difficulty');
  if (error) {
    console.error('Error fetching problems:', error);
    return;
  }
  console.log('Current problems in database:');
  console.table(data);
}

verify();
