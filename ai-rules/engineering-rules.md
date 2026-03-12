# Engineering Decision Protocol

Claude Code must **not immediately start coding**.

Instead it must first perform an **engineering analysis phase**.

---

# Mandatory Engineering Questions

Before writing any code, Claude must ask questions such as:

### Backend

- Should the backend use Node.js, Java, or another technology?
- Should the API be REST or GraphQL?

### Database

- Should the project use PostgreSQL, MySQL, or another database?
- Will the inventory system connect to an external database?

### Hosting

- Will the site be deployed on Vercel, VPS, or another provider?

### Inventory Integration

- How will the inventory system connect to the website?
- API pull or push updates?

### Admin Panel

- Should the admin panel be custom built?
- Should a headless CMS be used?

---

# Decision Requirement

Claude must **present multiple options** when possible.

Example:

Option A:
Node.js + PostgreSQL

Option B:
Supabase + Next.js

Option C:
Firebase stack

---

# Confirmation Requirement

Claude must wait for the user to confirm the technical choices.

Only when the architecture is **100% defined** may coding begin.