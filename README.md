# 🌌 Learnova — Modern LMS Platform

Learnova is a **next-generation Learning Management System (LMS)** built with **TypeScript**, **Next.js 15**, and a fully modern vertical scaling architecture.  
It is engineered for **speed**, **security**, **scalability**, and **beautiful user experience** — enabling creators and learners to connect through structured, interactive courses.

🚀 **Live Preview:**  
👉 [Learnova](https://learnova-eight.vercel.app/)  
📦 **Source Code:**  
👉 [Learnova GitHub Repository](https://github.com/Mahadsid/learnova)

---

## ✨ Core Features

### 🎓 Complete LMS Functionality
- Role-based system — **Admins** manage courses, **Users** learn.
- Course creation, editing, lessons, modules & structure.
- Drag-and-drop course builder.
- Rich-text editor for lesson content.

### 📊 Modern Dashboards
- **Admin Dashboard:** Manage courses, media, pricing & analytics.
- **Customer Dashboard:** Track progress, continue learning, view purchased courses.

### 📺 Advanced Media Handling
- Custom video player with **Tigris S3 streaming**.
- Drag-and-drop upload component.
- Secure uploads via presigned URLs.

### 🔒 Secure & Production-Ready
- Protected by **Arcjet Security** (XSS, SQL injection, bot mitigation).
- Rate limiting to prevent abuse.
- Better-Auth (Email OTP + GitHub OAuth).

### 💰 Monetization & Payments
- Stripe integration for payments.
- Automated checkout, invoicing & subscription logic.

### 🧠 Clean Architecture
- Modular folder structure.
- DAL (Data Access Layer) implemented for maintainability.
- Prisma ORM for type-safe database access.

---

## 🧩 Tech Stack

| Layer | Tools & Technologies |
|-------|-----------------------|
| **Framework** | Next.js 15, TypeScript |
| **Styling** | Tailwind CSS, Shadcn UI |
| **Authentication** | Better-Auth (OTP + OAuth) |
| **Database** | Neon Postgres |
| **ORM** | Prisma |
| **Storage** | Tigris S3 |
| **Payments** | Stripe |
| **Security** | Arcjet |
| **Deployments** | Vercel |

---

## 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/yourusername/learnova.git
cd learnova


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
