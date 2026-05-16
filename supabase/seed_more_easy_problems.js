// seed_more_easy_problems.js
// Run: node supabase/seed_more_easy_problems.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kjpflnjpqplopnjkebgo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcGZsbmpwcXBsb3BuamtlYmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MjE0NzIsImV4cCI6MjA4OTM5NzQ3Mn0.-cwW0yRTr85exKyfeO8bqu6VIlEFg0hBV83YwWzIzBQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const problems = [
  {
    title: 'Digit Sum',
    difficulty: 'Easy',
    tags: ['Math', 'Implementation'],
    description: `Given a non-negative integer N, calculate the sum of its digits.

**Input Format**
- A single integer N (0 ≤ N ≤ 10^18).

**Output Format**
- Print the sum of the digits of N.

**Sample Input**
123

**Sample Output**
6

**Explanation:** 1 + 2 + 3 = 6.`,
    test_cases: [
      { input: "123", expected_output: "6" },
      { input: "1000", expected_output: "1" },
      { input: "999", expected_output: "27" }
    ]
  },
  {
    title: 'Vowel Count',
    difficulty: 'Easy',
    tags: ['Strings', 'Implementation'],
    description: `Given a string S consisting of lowercase English letters, count how many vowels (a, e, i, o, u) it contains.

**Input Format**
- A single string S (1 ≤ |S| ≤ 1000).

**Output Format**
- Print the number of vowels in S.

**Sample Input**
competitive

**Sample Output**
4

**Explanation:** The vowels are 'o', 'e', 'i', 'i'.`,
    test_cases: [
      { input: "competitive", expected_output: "4" },
      { input: "xyz", expected_output: "0" },
      { input: "aeiou", expected_output: "5" }
    ]
  },
  {
    title: 'Find the Missing Number',
    difficulty: 'Easy',
    tags: ['Math', 'Implementation'],
    description: `You are given N-1 unique integers in the range [1, N]. Exactly one number from the range is missing. Your task is to find that missing number.

**Input Format**
- The first line contains an integer N (2 ≤ N ≤ 10^5).
- The second line contains N-1 space-separated integers.

**Output Format**
- Print the missing number.

**Sample Input**
5
1 2 4 5

**Sample Output**
3

**Explanation:** The numbers are 1, 2, 4, 5. The missing number in the range [1, 5] is 3.`,
    test_cases: [
      { input: "5\n1 2 4 5", expected_output: "3" },
      { input: "2\n2", expected_output: "1" },
      { input: "10\n1 2 3 4 5 6 7 8 9", expected_output: "10" }
    ]
  },
  {
    title: 'Leap Year Checker',
    difficulty: 'Easy',
    tags: ['Math', 'Logic'],
    description: `A year is a leap year if it is divisible by 4, except for years that are divisible by 100 but not by 400. Given a year Y, determine if it is a leap year.

**Input Format**
- A single integer Y (1 ≤ Y ≤ 3000).

**Output Format**
- Print "YES" if it's a leap year, otherwise print "NO".

**Sample Input**
2024

**Sample Output**
YES

**Explanation:** 2024 is divisible by 4 and not by 100, so it is a leap year.`,
    test_cases: [
      { input: "2024", expected_output: "YES" },
      { input: "1900", expected_output: "NO" },
      { input: "2000", expected_output: "YES" }
    ]
  },
  {
    title: 'Reverse Words',
    difficulty: 'Easy',
    tags: ['Strings', 'Implementation'],
    description: `Given a string containing multiple words separated by spaces, reverse each individual word while maintaining their original order in the string.

**Input Format**
- A single line containing words separated by a single space.

**Output Format**
- Print the string with each word reversed.

**Sample Input**
hello world

**Sample Output**
olleh dlrow

**Explanation:** "hello" becomes "olleh" and "world" becomes "dlrow".`,
    test_cases: [
      { input: "hello world", expected_output: "olleh dlrow" },
      { input: "a b c", expected_output: "a b c" },
      { input: "programming is fun", expected_output: "gnimmargorp si nuf" }
    ]
  }
];

async function seedMoreProblems() {
  console.log('🚀 Inserting 5 more easy problems into the database...\n');

  const { data, error } = await supabase
    .from('problems')
    .insert(problems)
    .select();

  if (error) {
    console.error('❌ Error inserting problems:', error.message);
    console.error('Details:', error.details || error.hint || '');
    process.exit(1);
  }

  console.log(`✅ Successfully inserted ${data.length} problems:\n`);
  data.forEach((p, i) => {
    console.log(`  ${i + 1}. [${p.difficulty}] ${p.title} (id: ${p.id})`);
  });

  console.log('\n✨ Done! New problems are now in the database.');
}

seedMoreProblems();
