# 🦅 FindersKeepers - Lost & Found Marketplace

**FindersKeepers** is a modern, community-driven platform designed to reunite people with their lost belongings. It features specific date validation, "free zone" photo verification rules for found items, and a trustworthy reward system with a built-in platform commission.

![Dashboard Preview](./public/dashboard-preview.png) *(Note: Add a screenshot here)*

## ✨ Key Features

-   **🔎 Smart Browsing:** Filter lost/found items by category (Electronics, Pets, etc.).
-   **🛡️ Trust & Safety:**
    -   Mandatory photo uploads for "Found" items.
    -   Strict 5-month limit on reporting timeframe.
-   **💰 Reward System:** integrated calculation for finder's reward + 10% platform commission.
-   **👤 User Profile:** Track your community trust score and reported/found stats.
-   **🗺️ Geo-Intelligence:** (Mocked) Proximity-based item mapping.
-   **🔐 Role-Based Access:** Dual User/Admin dashboard views.

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
