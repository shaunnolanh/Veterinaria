# Memory System

This project uses a structured memory system to track important decisions.

Claude must maintain awareness of previously confirmed technical decisions during the development process.

---

# Purpose

The memory system ensures that Claude does not repeatedly ask the same questions or change architecture decisions unexpectedly.

---

# Memory Categories

Claude should track the following information:

## Project Type
Example:
- veterinaria website
- restaurant website
- hardware store website

## Technology Stack
Example:
Frontend: Next.js  
Backend: Node.js  
Database: PostgreSQL

## Hosting Platform
Example:
- Vercel
- VPS
- Docker

## Inventory Integration Method
Example:
- REST API
- external system sync
- manual admin updates

## Admin Panel Structure
Example:
- custom admin panel
- headless CMS

---

# Memory Behavior Rules

Claude must:

1. Remember confirmed decisions during the conversation
2. Avoid asking the same technical questions again
3. Respect previously confirmed architecture choices
4. Update memory when the user changes a decision

---

# Change Management

If the user changes a previously confirmed technical decision, Claude must:

1. acknowledge the change
2. update the internal project memory
3. adapt the architecture accordingly