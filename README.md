# 🦅 FindersKeepers - Community Lost & Found Protocol

**FindersKeepers** is a modern, community-driven platform designed to reunite people with their lost belongings through a **purely altruistic, non-monetary protocol**. This version focuses on mutual trust, respectful community interactions, and verified returns without financial transactions.

![Dashboard Preview](./public/dashboard-preview.png)

## ✨ Key Features

-   **🤝 Community-First Zones:** A "free zone" philosophy where returning items is based on goodwill and community respect.
-   **👤 Verified Profiles:** Users can upload real avatars and track their "Trust Value" within the community.
-   **💬 Secure Messaging:** Built-in chat for finders and owners to coordinate returns safely.
-   **📸 Photo Verification:** Integrated chat feature to share high-res verification photos of items.
-   **🔎 Proximity Matching:** AI-ready protocol for matching lost reports with found items based on geo-signals.
-   **🛡️ Safety Limits:** Strict reporting timeframes (5 months) to ensure data relevance and user safety.

## 🛠️ Tech Stack

-   **Framework:** [Next.js 14/15](https://nextjs.org/) (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS + Framer Motion (Glassmorphism UI)
-   **State Management:** Zustand (with Persist middleware)
-   **Backend:** [Supabase](https://supabase.com/) (Auth, Database, Storage)
-   **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites
-   Node.js 18+ installed.
-   A Supabase account/project.

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/finders-keepers.git
cd finders-keepers
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Supabase
Run the provided SQL script to initialize your database tables and security policies.
1.  Go to your Supabase Project -> **SQL Editor**.
2.  Copy the contents of `supabase_schema.sql` (located in the root of this project).
3.  Click **Run**.

*This creates `items` and `profiles` tables, sets up RLS policies, and triggers for new user creation.*

### 4. Run Locally
```bash
npm run dev
```
Visit `http://localhost:3000` to see the app in action.

## 📂 Project Structure

-   `src/app`: Next.js App Router pages (Dashboard, Admin, Profile, Login).
-   `src/components`: Reusable UI components (ItemCard, Sidebar, ReportForm).
-   `src/store`: Global state management via Zustand.
-   `src/lib`: Supabase client and TypeScript types.

## 🚢 Deployment

The project includes a `vercel.json` for optimized caching and security headers.
1.  Push to GitHub.
2.  Import project into **Vercel**.
3.  Add the Environment Variables (Supabase URL/Key) in the Vercel Dashboard.
4.  Deploy!

---
*Built with ❤️ by the FindersKeepers Team*
