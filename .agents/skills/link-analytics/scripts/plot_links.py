#!/usr/bin/env python3
"""
plot_links.py — Link Shortener Analytics
=========================================
Queries the `links` table for rows created in the past 12 calendar months,
groups them by month, and renders a bar chart saved as `links_per_month.png`
in the current working directory.

Usage (from project root):
    python .agents/skills/link-analytics/scripts/plot_links.py
"""

import subprocess
import sys
import os

# ---------------------------------------------------------------------------
# 1. Ensure required packages are available
# ---------------------------------------------------------------------------

def _ensure(package: str, import_name: str | None = None) -> None:
    """Install *package* via pip if the import fails."""
    import_name = import_name or package
    try:
        __import__(import_name)
    except ImportError:
        print(f"[link-analytics] Installing {package} …")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", package, "--quiet"]
        )


_ensure("psycopg2-binary", "psycopg2")
_ensure("matplotlib")

# ---------------------------------------------------------------------------
# 2. Imports (after install guard)
# ---------------------------------------------------------------------------

import re
import datetime
from pathlib import Path

import psycopg2
import matplotlib
matplotlib.use("Agg")           # headless — no display needed
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

# ---------------------------------------------------------------------------
# 3. Resolve DATABASE_URL from .env / .env.local
# ---------------------------------------------------------------------------

def _load_env_file(path: Path) -> dict[str, str]:
    """Parse a .env file and return key/value pairs (no shell expansion)."""
    env: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        match = re.match(r'^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?(.*?)"?\s*$', line)
        if match:
            env[match.group(1)] = match.group(2)
    return env


def get_database_url() -> str:
    """Return DATABASE_URL from environment or .env / .env.local files."""
    if "DATABASE_URL" in os.environ:
        return os.environ["DATABASE_URL"]

    project_root = Path.cwd()
    for filename in (".env.local", ".env"):
        env_file = project_root / filename
        if env_file.exists():
            values = _load_env_file(env_file)
            if "DATABASE_URL" in values:
                print(f"[link-analytics] Loaded DATABASE_URL from {env_file.name}")
                return values["DATABASE_URL"]

    print(
        "[link-analytics] ERROR: DATABASE_URL not found.\n"
        "  Make sure .env or .env.local in the project root contains DATABASE_URL."
    )
    sys.exit(1)

# ---------------------------------------------------------------------------
# 4. Query: links created in the past 12 calendar months
# ---------------------------------------------------------------------------

def fetch_monthly_counts(database_url: str) -> list[tuple[datetime.date, int]]:
    """
    Return a list of (month_start_date, count) for the past 12 months,
    ordered oldest → newest.  Months with zero links are included.
    """
    today = datetime.date.today()
    # First day of the *current* month
    current_month_start = today.replace(day=1)
    # First day 12 months ago
    twelve_months_ago = (current_month_start - datetime.timedelta(days=1)).replace(day=1)
    twelve_months_ago = _subtract_months(current_month_start, 11)

    sql = """
        SELECT
            date_trunc('month', created_at AT TIME ZONE 'UTC')::date AS month,
            COUNT(*) AS total
        FROM links
        WHERE created_at >= %(since)s
          AND created_at <  %(until)s
        GROUP BY 1
        ORDER BY 1;
    """

    until = _add_months(current_month_start, 1)   # exclusive upper bound

    conn = psycopg2.connect(database_url)
    try:
        with conn.cursor() as cur:
            cur.execute(sql, {"since": twelve_months_ago, "until": until})
            rows: dict[datetime.date, int] = {row[0]: row[1] for row in cur.fetchall()}
    finally:
        conn.close()

    # Build complete 12-month series, filling missing months with 0
    result: list[tuple[datetime.date, int]] = []
    for i in range(12):
        month = _add_months(twelve_months_ago, i)
        result.append((month, rows.get(month, 0)))

    return result


def _add_months(date: datetime.date, months: int) -> datetime.date:
    month = date.month - 1 + months
    year = date.year + month // 12
    month = month % 12 + 1
    return date.replace(year=year, month=month, day=1)


def _subtract_months(date: datetime.date, months: int) -> datetime.date:
    return _add_months(date, -months)

# ---------------------------------------------------------------------------
# 5. Render bar chart
# ---------------------------------------------------------------------------

def render_chart(
    monthly_counts: list[tuple[datetime.date, int]],
    output_path: Path,
) -> None:
    labels = [d.strftime("%b %Y") for d, _ in monthly_counts]
    counts = [c for _, c in monthly_counts]

    fig, ax = plt.subplots(figsize=(14, 6))

    bars = ax.bar(labels, counts, color="#4F86F7", edgecolor="white", width=0.65)

    # Label each bar with its count
    for bar, count in zip(bars, counts):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + max(counts) * 0.01,
            str(count),
            ha="center",
            va="bottom",
            fontsize=9,
            color="#333333",
        )

    ax.set_xlabel("Month", fontsize=12, labelpad=8)
    ax.set_ylabel("Links Created", fontsize=12, labelpad=8)
    ax.set_title("Links Created — Past 12 Months", fontsize=15, fontweight="bold", pad=14)
    ax.yaxis.set_major_locator(mticker.MaxNLocator(integer=True))
    ax.set_ylim(0, max(counts) * 1.15 + 1)   # headroom for labels
    ax.spines[["top", "right"]].set_visible(False)
    ax.tick_params(axis="x", rotation=30)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close(fig)

    print(f"[link-analytics] Chart saved → {output_path.resolve()}")

# ---------------------------------------------------------------------------
# 6. Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    database_url = get_database_url()
    print("[link-analytics] Querying database …")
    monthly_counts = fetch_monthly_counts(database_url)

    total = sum(c for _, c in monthly_counts)
    print(f"[link-analytics] {total} links found across the past 12 months.")

    output_file = Path.cwd() / "links_per_month.png"
    render_chart(monthly_counts, output_file)
