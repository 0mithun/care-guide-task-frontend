# Secure Note-Taking Frontend

This is the user interface for the Secure Note-Taking and Public Posts web application. It is built using Next.js (App Router), TailwindCSS, React Icons, and NextAuth.js.

## Key Views
* **Welcome Screen (`/`):** Simple authentication portal for logging in or signing up. Public registration assigns the standard `user` role automatically.
* **Notes Dashboard (`/dashboard`):** Personal dashboard displaying only your private notes with full CRUD capabilities. It also supports search parameters to view notes belonging to a specific owner (for Admins).
* **Posts Feed (`/posts`):** Public feed of all user posts. Supports direct inline filtering by clicking any author's username.
* **Interests Board (`/interests`):** Scenario 1 aggregation board showing users grouped by their shared interests.
* **Admin Console (`/users`):** Directory listing where system Admins can add, update, delete, or promote users. Admins can click Notes/Posts actions next to any user row to view that user's specific archive.

## Setup Instructions

### 1. Prerequisites
Ensure the backend server is running (defaults to `http://localhost:5001`).

### 2. Environment Setup
Create a `.env.local` file in the frontend root:
```env
NEXTAUTH_SECRET=supersecretnextauthkey
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### 3. Install & Start
```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser.
