# BlogBase — Corporate Blog Platform

BlogBase is a full-stack blogging platform built with modern web technologies.
It includes a CMS dashboard, SEO engine, publishing workflow, and search system designed to simulate a real production-grade blogging infrastructure.

This project was developed as part of a technical internship assignment to demonstrate scalable architecture, secure publishing pipelines, and SEO-optimized content delivery.

---

# 🚀 Live Demo

Production Deployment
https://corporate-blog-platform.vercel.app

---

# ✨ Features

## Content Management System (CMS)

* Create, edit, and delete blog posts
* Draft and publish workflow
* Category-based organization
* Cover image support
* Rich text editor with formatting
* Author ownership validation (users can edit only their own posts)

---

## Public Blog System

* Blog homepage
* Article pages with SEO metadata
* Category-based filtering
* Author pages
* Reading time estimation
* Table of Contents generation
* Related posts recommendations
* Cover image rendering

---

## SEO Engine

* Dynamic page titles
* Meta descriptions
* Canonical URLs
* OpenGraph metadata
* Twitter Cards
* JSON-LD structured data
* Breadcrumb schema

---

## Search System

* PostgreSQL full-text search
* Debounced search input
* Server-side search results

---

## Publishing Pipeline

* Draft → Publish workflow
* Secure publishing endpoint
* Author validation before publishing
* Automatic `publishedAt` timestamp

---

## SEO Infrastructure

* Dynamic `sitemap.xml`
* `robots.txt`
* Draft posts excluded from indexing

---

## Performance & Monitoring

* Query performance logging
* Health check endpoint `/api/health`
* Server-side rendering with Next.js
* Lazy-loaded optimized images

---

## Security

* Authentication with NextAuth
* Google OAuth login
* Role-based access control
* API rate limiting
* Author ownership validation
* Draft protection from public access

---

# 🧠 Tech Stack

Frontend

* Next.js (App Router)
* React
* Tailwind CSS

Backend

* Node.js
* Next.js API Routes

Database

* PostgreSQL (Neon)

ORM

* Prisma

Authentication

* NextAuth
* Google OAuth

Media Storage

* Cloudinary

Deployment

* Vercel

---

# 📂 Project Structure

app
├ blog
│ ├ [slug]
│ └ page.tsx
├ dashboard
│ ├ posts
│ └ page.tsx
├ api
│ ├ posts
│ ├ search
│ └ health

components
lib
prisma

---

# ⚙️ Setup Instructions

Clone the repository

git clone https://github.com/Swagnik12/corporate-blog-platform

Install dependencies

npm install

Create `.env` file

DATABASE_URL=your_neon_database_url
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

Run development server

npm run dev

Open in browser

http://localhost:3000

---

# 📊 Core Pages

| Route                | Description         |
| -------------------- | ------------------- |
| /                    | Landing page        |
| /blog                | Blog homepage       |
| /blog/[slug]         | Article page        |
| /dashboard           | CMS dashboard       |
| /dashboard/posts     | Manage posts        |
| /dashboard/posts/new | Create post         |
| /api/health          | System health check |

---

# 📈 SEO Implementation

* Structured metadata
* Article schema
* Breadcrumb schema
* Canonical URLs
* Dynamic sitemap
* Robots configuration
* Clean slug-based URLs

---

# 🎯 Project Goals

This project demonstrates:

* Scalable blogging architecture
* SEO-first development
* Secure CMS workflow
* Server-side rendering
* Full-stack application development

---

# 📜 License

This project was built for educational and internship demonstration purposes.
