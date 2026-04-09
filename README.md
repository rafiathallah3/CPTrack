# 🚀 CPTrack

**CPTrack** is a modern Competitive Programming platform built for students to sharpen their coding skills, participate in contests, and track their progress in real-time. This project was developed as a university implementation for software development and programming practice.

---

## ✨ Key Features

- 💻 **Interactive IDE**: A professional-grade coding environment using the **Monaco Editor** (the engine behind VS Code).
- ⚙️ **Multi-Language Support**: Write and execute code in various languages (C++, Java, Python, Node.js) powered by the **Piston API**.
- 📊 **Real-time Progress**: Track your submissions, success rates, and skill level directly from your personal dashboard.
- 🏆 **Contests & Community**: Join scheduled contests and engage with other student coders.
- 🔐 **Secure Auth**: Seamless login and profile management via **Supabase**.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Supabase](https://supabase.com/)
- **Code Execution**: [Piston API](https://github.com/engineer-man/piston)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Components**: [React Resizable Panels](https://github.com/bvaughn/react-resizable-panels)

---

## 🚀 Getting Started

To run this project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/cptrack.git
   cd cptrack
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the App**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## University Project

This application is part of a university software project aimed at providing a robust tool for competitive programming preparation. It focuses on modular architecture, clean code, and user-centric design.