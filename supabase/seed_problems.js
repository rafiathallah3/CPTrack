// seed_problems.js
// Run: node supabase/seed_problems.js
// This inserts the 5 CP problems into the Supabase 'problems' table.

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kjpflnjpqplopnjkebgo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcGZsbmpwcXBsb3BuamtlYmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MjE0NzIsImV4cCI6MjA4OTM5NzQ3Mn0.-cwW0yRTr85exKyfeO8bqu6VIlEFg0hBV83YwWzIzBQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const problems = [
  {
    title: 'Magical Apples',
    difficulty: 'Easy',
    tags: ['Implementation', 'Math'],
    description: `Alice has N baskets. The i-th basket contains A_i magical apples. Alice is very particular and wants every basket to contain a strictly even number of apples.

To achieve this, Alice can eat an apple from any basket. She wants to know the minimum number of apples she needs to eat in total so that all N baskets have an even number of apples.

**Input Format**
- The first line contains a single integer N (1 ≤ N ≤ 10^5) — the number of baskets.
- The second line contains N space-separated integers A_1, A_2, ..., A_N (1 ≤ A_i ≤ 10^9) — the number of apples in each basket.

**Output Format**
Print a single integer — the minimum number of apples Alice needs to eat.

**Sample Input**
3
4 5 7

**Sample Output**
2

**Explanation:** The first basket has 4 apples (even), so she doesn't eat any. The second has 5, she eats 1. The third has 7, she eats 1. Total eaten = 2.`,
    test_cases: [
      { input: "3\n4 5 7", expected_output: "2" },
      { input: "5\n1 3 5 7 9", expected_output: "5" }
    ]
  },
  {
    title: 'Palindrome Password',
    difficulty: 'Easy',
    tags: ['Strings', 'Greedy', 'Two Pointers'],
    description: `Bob has forgotten the password to his secret vault. He remembers that his password was a palindrome (reads the same forwards and backwards) consisting only of lowercase English letters.

He found a piece of paper with a string S written on it, where some letters have faded and are represented by the character "?". Help Bob reconstruct his password by replacing each "?" with a lowercase English letter such that the resulting string is a palindrome.

If there are multiple ways to form a palindrome, Bob wants the lexicographically smallest one (i.e., the one that comes first in alphabetical order). If it is impossible to form a palindrome, output "IMPOSSIBLE".

**Input Format**
- A single line containing the string S (1 ≤ |S| ≤ 10^5). The string consists of lowercase English letters and the character "?".

**Output Format**
Print the reconstructed lexicographically smallest palindrome, or "IMPOSSIBLE" if it cannot be formed.

**Sample Input 1**
a?c??a

**Sample Output 1**
aaccaa

**Sample Input 2**
a?c?b

**Sample Output 2**
IMPOSSIBLE`,
    test_cases: [
      { input: "a?c??a", expected_output: "aaccaa" },
      { input: "a?c?b", expected_output: "IMPOSSIBLE" }
    ]
  },
  {
    title: 'Monster Battle Simulation',
    difficulty: 'Medium',
    tags: ['Sorting', 'Greedy'],
    description: `You are a hero facing N monsters in a straight path. Each monster has a health value H_i.

You have a special sword and K magic potions.
- You can defeat a monster using your sword, which costs you stamina equal to the monster's health H_i.
- Alternatively, you can throw a magic potion at the monster. The potion defeats the monster instantly, costing you 0 stamina, regardless of the monster's health.

Since you only have K potions, you must choose wisely which monsters to use them on. What is the minimum stamina you need to spend to defeat all N monsters?

**Input Format**
- The first line contains two integers N and K (1 ≤ K ≤ N ≤ 2×10^5) — the number of monsters and the number of potions.
- The second line contains N space-separated integers H_1, H_2, ..., H_N (1 ≤ H_i ≤ 10^9) — the health values of the monsters.

**Output Format**
Print a single integer — the minimum stamina required to defeat all monsters. (Note: use a 64-bit integer type like long long in C++ as the answer may be large.)

**Sample Input**
5 2
10 30 50 20 40

**Sample Output**
60

**Explanation:** Use potions on the two highest-health monsters (50 and 40). Defeat the rest (10, 30, 20) with the sword. Total stamina = 10 + 30 + 20 = 60.`,
    test_cases: [
      { input: "5 2\n10 30 50 20 40", expected_output: "60" }
    ]
  },
  {
    title: 'Magical Grid Paths',
    difficulty: 'Medium',
    tags: ['Dynamic Programming', 'Grid'],
    description: `You are exploring an ancient temple represented as a grid of size N rows and M columns. You start at the top-left corner (1,1) and want to reach the treasure room at the bottom-right corner (N,M).

From any cell (r, c), you can only move Right to (r, c+1) or Down to (r+1, c).

However, some cells contain deadly traps. These cells are marked with "#", and you cannot step on them. Safe cells are marked with ".".

Find the total number of valid paths from (1,1) to (N,M). Since the answer can be very large, output it modulo 10^9 + 7.

**Input Format**
- The first line contains two integers N and M (1 ≤ N, M ≤ 1000).
- The next N lines each contain a string of M characters. "." means safe, "#" means a trap.
- It is guaranteed that (1,1) and (N,M) are safe cells.

**Output Format**
Print the number of valid paths modulo 10^9 + 7.

**Sample Input**
3 4
....
.#..
....

**Sample Output**
4

**Explanation:** There are exactly 4 ways to navigate to the bottom-right corner without stepping on the trap at (2,2).`,
    test_cases: [
      { input: "3 4\n....\n.#..\n....", expected_output: "4" }
    ]
  },
  {
    title: 'Archipelago Connectivity',
    difficulty: 'Hard',
    tags: ['Graph Theory', 'BFS', 'DFS', 'Connected Components'],
    description: `The Kingdom of Algorithms consists of an archipelago of N islands, numbered 1 to N. Currently, there are M bidirectional bridges connecting various islands.

The King wants to improve trade. For trade to flourish perfectly, it must be possible to travel between any pair of islands, possibly crossing multiple bridges.

Your task is to determine the minimum number of new bridges the King needs to construct so that all N islands are connected to each other.

**Input Format**
- The first line contains two integers N and M (1 ≤ N, M ≤ 10^5) — the number of islands and the number of existing bridges.
- The next M lines each contain two integers u and v (1 ≤ u, v ≤ N, u ≠ v), indicating an existing bridge between island u and island v.

**Output Format**
Print a single integer — the minimum number of new bridges required to fully connect the archipelago.

**Sample Input**
5 3
1 2
2 3
4 5

**Sample Output**
1

**Explanation:** There are two separate connected components: {1, 2, 3} and {4, 5}. Building exactly 1 bridge connects all islands.`,
    test_cases: [
      { input: "5 3\n1 2\n2 3\n4 5", expected_output: "1" }
    ]
  },
];

async function seedProblems() {
  console.log('🚀 Inserting competitive programming problems into the database...\n');

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

  console.log('\n✨ Done! Problems are now in the database.');
}

seedProblems();
