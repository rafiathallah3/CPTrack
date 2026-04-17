export type UserRole = 'user' | 'experienced' | 'coach' | 'admin';
export type SubmissionStatus = 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error' | 'compilation_error';

export interface User {
  id: string; // UUID references auth.users
  username: string;
  rating: number;
  role: UserRole;
  reviews_array: string[];
  created_at: string;
}

export interface BlogPost {
  id: string; // UUID
  author_id: string; // UUID references users
  title: string;
  content: string;
  created_at: string;
}

export interface ForumThread {
  id: string; // UUID
  author_id: string; // UUID references users
  title: string;
  created_at: string;
}

export interface ForumPost {
  id: string; // UUID
  thread_id: string; // UUID references forum_threads
  author_id: string; // UUID references users
  content: string;
  created_at: string;
}

export interface Contest {
  id: string; // UUID
  name: string;
  start_time: string;
  end_time: string;
  created_by: string | null; // UUID references users
  created_at: string;
}

export interface Problem {
  id: string; // UUID
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  test_cases: { input: string; expected_output: string }[];
  hidden_test_cases: { input: string; expected_output: string }[];
  created_at: string;
}

export interface Submission {
  id: string; // UUID
  user_id: string; // UUID references users
  problem_id: string; // UUID references problems
  code: string;
  programming_language: string;
  status: SubmissionStatus;
  created_at: string;
}

export interface SubmissionVote {
  id: string; // UUID
  submission_id: string; // UUID references submissions
  user_id: string; // UUID references users
  vote_type: 'like' | 'dislike';
  created_at: string;
}
