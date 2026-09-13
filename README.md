# 🌳 Family Historical Tree — Frontend (वंशावली वेब अनुप्रयोग)

A modern, responsive Next.js application powering the visual lineage explorer, collaborative role management, interactive genealogical trees, and multimedia archives for the **Family Historical Tree** platform.

Live Production URL: **[https://frontend-alpha-pink-93.vercel.app](https://frontend-alpha-pink-93.vercel.app)**

---

## ✨ Features

* **Interactive Lineage Tree Explorer**:
  * Powered by `@xyflow/react` (React Flow) for smooth zooming, panning, and generational node alignment.
  * Displays ancestors, spouses, descendants, living/deceased indicators, and portraits.
* **Public Lineage Gallery**:
  * Browse published public family trees, historical photos, and stories directly on the landing page without requiring an account.
* **Role-Based Access Control (RBAC)**:
  * Distinct badges and capabilities for `Owner`, `Admin`, `Editor`, and `Viewer`.
  * Collaborative request/approval system (`Pending Approval` ➔ `Approve as Editor` / `Approve as Viewer` / `Decline`).
* **Member Profiles & Lifespans**:
  * Detailed biographical records, birth/death dates, relationships, and photo galleries.
* **Photo & Media Archive**:
  * High-resolution photo gallery with person tagging, category filtering (Photos, Documents, Certificates), and lightbox previews.
* **Historical Stories & Oral Traditions**:
  * Narrative articles documenting family heritage with associated ancestors.
* **Chronological Milestones & Timeline**:
  * Visual timeline of historical events (migrations, cultural honors, births, accomplishments).
* **Modern Authentication**:
  * Protected dashboard routes with automatic redirects.
  * Password reveal/hide eye toggle on Login and Signup forms.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
* **Library**: [React 18](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Tree Visualization**: [@xyflow/react](https://reactflow.dev/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Data Fetching**: [@tanstack/react-query](https://tanstack.com/query)
* **State Management**: [Zustand](https://github.com/pmndrs/zustand)
* **Hosting**: [Vercel](https://vercel.com/)

---

## 📁 Project Structure

```text
frontend/
├── app/
│   ├── (auth)/             # Authentication routes (login, register)
│   ├── dashboard/          # Protected family management & lineage cards
│   ├── family/[familyId]/  # Deep family views
│   │   ├── tree/           # Interactive genealogical graph
│   │   ├── members/        # Lineage member profiles & details
│   │   ├── media/          # Photos, documents, & archives
│   │   ├── stories/        # Historical narratives
│   │   ├── events/         # Chronological milestones
│   │   └── settings/       # Collaborators, permissions & approvals
│   ├── layout.tsx          # Root layout & providers
│   └── page.tsx            # Landing page & Public Lineage Gallery
├── components/             # Reusable UI components & dialogs
├── hooks/                  # Custom React query and event hooks
├── lib/                    # API client and utility helpers
├── types/                  # TypeScript interfaces and schema types
├── next.config.mjs         # Next.js build & image domains config
└── package.json            # Dependencies & scripts
```

---

## ⚙️ Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) v18.17+ or v20+
* Running [Family History Backend API](https://github.com/Prakash617/family-history-backend)

### 2. Installation
```bash
git clone git@github.com:Prakash617/family-history-frontend.git
cd family-history-frontend
npm install
```

### 3. Environment Variables
Create a `.env.local` file:
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME="Family Historical Tree"
```

For production deployment on Vercel, set `NEXT_PUBLIC_API_URL` in the Vercel Dashboard Settings to your deployed backend URL.

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🚀 Deployment (Vercel)

This application is optimized for zero-config deployment on Vercel:
```bash
# Link and deploy with Vercel CLI:
vercel link
vercel deploy --prod
```

Or connect the repository directly in the [Vercel Dashboard](https://vercel.com/new).

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
