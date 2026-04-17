// seed_hidden_testcases.js
// Run: node supabase/seed_hidden_testcases.js
// This updates the 5 CP problems with hidden test cases.
// Run AFTER running the migration (migrate_hidden_testcases.sql).

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kjpflnjpqplopnjkebgo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcGZsbmpwcXBsb3BuamtlYmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MjE0NzIsImV4cCI6MjA4OTM5NzQ3Mn0.-cwW0yRTr85exKyfeO8bqu6VIlEFg0hBV83YwWzIzBQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Map of problem title → hidden test cases
const hiddenTestCases = {
  'Magical Apples': [
    { input: "1\n2", expected_output: "0" },
    { input: "4\n1 2 3 4", expected_output: "2" },
    { input: "6\n10 11 12 13 14 15", expected_output: "3" },
    { input: "1\n1000000000", expected_output: "0" },
    { input: "3\n999999999 999999999 999999999", expected_output: "3" },
  ],
  'Palindrome Password': [
    { input: "?", expected_output: "a" },
    { input: "??", expected_output: "aa" },
    { input: "ab??ba", expected_output: "abccba" },
    { input: "abc", expected_output: "IMPOSSIBLE" },
    { input: "?b?", expected_output: "aba" },
  ],
  'Monster Battle Simulation': [
    { input: "3 1\n5 10 3", expected_output: "8" },
    { input: "4 4\n100 200 300 400", expected_output: "0" },
    { input: "1 1\n1000000000", expected_output: "0" },
    { input: "6 2\n1 2 3 4 5 6", expected_output: "10" },
    { input: "5 0\n10 20 30 40 50", expected_output: "150" },
  ],
  'Magical Grid Paths': [
    { input: "2 2\n..\n..", expected_output: "2" },
    { input: "1 5\n.....", expected_output: "1" },
    { input: "3 3\n...\n.#.\n...", expected_output: "2" },
    { input: "2 2\n.#\n..", expected_output: "1" },
  ],
  'Archipelago Connectivity': [
    { input: "1 0", expected_output: "0" },
    { input: "3 0", expected_output: "2" },
    { input: "4 6\n1 2\n2 3\n3 4\n4 1\n1 3\n2 4", expected_output: "0" },
    { input: "6 3\n1 2\n3 4\n5 6", expected_output: "2" },
    { input: "10 4\n1 2\n2 3\n4 5\n6 7", expected_output: "5" },
  ],
};

async function seedHiddenTestCases() {
  console.log('🔒 Seeding hidden test cases for existing problems...\n');

  for (const [title, cases] of Object.entries(hiddenTestCases)) {
    const { data, error } = await supabase
      .from('problems')
      .update({ hidden_test_cases: cases })
      .eq('title', title)
      .select('id, title');

    if (error) {
      console.error(`❌ Failed to update "${title}":`, error.message);
    } else if (data && data.length > 0) {
      console.log(`  ✅ ${title}: ${cases.length} hidden test cases added (id: ${data[0].id})`);
    } else {
      console.warn(`  ⚠️ "${title}" not found in database — skipped.`);
    }
  }

  console.log('\n✨ Done! Hidden test cases are now in the database.');
}

seedHiddenTestCases();
