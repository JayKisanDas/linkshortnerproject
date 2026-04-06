---
name: link-analytics
description: >
  Generates a bar chart PNG showing the number of links created per month over
  the past 12 months for this link shortener project. Use this skill whenever
  the user asks to visualize link creation trends, plot link stats, see monthly
  link counts, generate a links-per-month chart, or analyze how many links were
  created recently. Even if the user phrases it as "chart", "graph", "plot",
  "analytics", or "how many links were created", this skill should trigger.
---

# Link Analytics — Monthly Bar Chart

This skill produces a `links_per_month.png` bar chart by:

1. Reading `DATABASE_URL` from the project's `.env` (or `.env.local`) file.
2. Querying the `links` table for rows where `created_at` falls within the
   past 12 calendar months.
3. Grouping results by month and counting rows.
4. Rendering a bar chart with matplotlib and saving it as a PNG.

## How to run the skill

Execute the bundled script from the project root:

```bash
python .agents/skills/link-analytics/scripts/plot_links.py
```

The script:

- Automatically resolves the `.env` / `.env.local` file relative to the
  current working directory (project root).
- Installs `psycopg2-binary` and `matplotlib` via pip if they are not already
  present.
- Writes `links_per_month.png` to the current working directory.

## Expected output

A PNG bar chart where:

- The **x-axis** lists the past 12 months in chronological order
  (e.g., `Apr 2025 … Mar 2026`).
- The **y-axis** shows the total number of links created in that month.
- Each bar is labelled with its count above it for quick reading.

## Environment variable resolution order

1. `.env.local` (Next.js local overrides — preferred)
2. `.env`

If neither file contains `DATABASE_URL`, the script exits with a clear error
message rather than silently failing.

## Dependencies

| Package           | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `psycopg2-binary` | PostgreSQL driver (no build tools required) |
| `matplotlib`      | Bar chart rendering                         |

Both are installed automatically by the script if missing.
