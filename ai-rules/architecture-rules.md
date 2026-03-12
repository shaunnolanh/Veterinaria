# Architecture Guidelines

Claude Code should prefer modern, simple, maintainable stacks.

---

# Recommended Frontend

Preferred stack:

Next.js  
React  
Tailwind CSS

Benefits:

- fast performance
- good SEO
- easy to customize
- scalable

---

# Recommended Backend

Preferred options:

Option A:
Node.js + Express

Option B:
Supabase

Option C:
Firebase

---

# Database

Preferred database:

PostgreSQL

---

# API Structure

Websites should include APIs for inventory updates.

Example endpoints:

/api/products  
/api/update-stock  
/api/inventory-sync  

These endpoints allow integration with local inventory systems.

---

# Inventory Integration

The website should be able to:

- receive inventory updates
- update product stock automatically
- sync product data

---

# Deployment

Preferred hosting platforms:

- Vercel
- VPS
- Docker container environments