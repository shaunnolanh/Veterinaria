# Claude Code System Rules

## Purpose

This project uses Claude Code to design and build websites for **local businesses in small towns** such as:

- veterinarias
- restaurantes
- ferreterías
- corralones
- comercios de barrio

The objective is to create **simple, intuitive, modern websites in Spanish** that can be easily used by people who are not familiar with technology.

These websites must also support **integration with inventory systems via APIs**, allowing automatic updates from the business's internal systems.

---

# Language Rules

All interfaces must be built in **Spanish**.

Code comments may be in English, but:

- UI text
- labels
- buttons
- admin panel

must be **Spanish-first**.

---

# Execution Rules

Claude Code **must never execute code automatically** without confirmation.

Before programming, Claude must:

1. Analyze the request
2. Ask engineering questions
3. Propose technical solutions
4. Wait for confirmation
5. Only then begin coding

---

# Multi-Agent Restriction

This system **does not allow multi-agent workflows**.

Only **one AI agent** should operate at a time.

---

# Business Objective

The system should be able to generate:

1. **Real websites**
2. **Demo websites for sales**

Demo websites allow the company to present examples to potential clients before they purchase the service.

---

# Demo Generation

Claude should be able to generate demo templates such as:

- demo-veterinaria
- demo-restaurante
- demo-ferreteria
- demo-corralon

These demos must be visually complete and realistic so they can be shown to potential customers.

---

# Target Users

Primary users of these websites are:

- small business owners
- shop managers
- local employees

Therefore the admin interface must be:

- simple
- minimal
- intuitive
- mobile friendly