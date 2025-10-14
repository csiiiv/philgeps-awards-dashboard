#!/usr/bin/env python3
"""
Update README.md files recursively by prepending a small standardized header.
Skips files that already contain the marker '<!-- AUTO-GENERATED-README -->'.
Creates a backup of the original file with extension `.bak`.
"""
from pathlib import Path
from datetime import datetime

REPO_ROOT = Path(__file__).resolve().parents[1]
MARKER = "<!-- AUTO-GENERATED-README -->"
TODAY = datetime.utcnow().strftime('%Y-%m-%d')

header_template = (
    f"{MARKER}\n"
    "\n"
    "**This README has been auto-updated (metadata header).**\n"
    "\n"
    "- Path: `{relpath}`\n"
    "- Auto-updated: {date}\n"
    "\n"
    "See the top-level `README.md` and the `docs/` folder for full documentation.\n"
    "\n"
)


def update_readme(path: Path) -> bool:
    text = path.read_text(encoding='utf-8')
    if MARKER in text:
        return False
    rel = path.relative_to(REPO_ROOT)
    header = header_template.format(relpath=str(rel).replace('\\\\', '/'), date=TODAY)
    # Backup original
    bak = path.with_suffix(path.suffix + '.bak')
    bak.write_text(text, encoding='utf-8')
    path.write_text(header + text, encoding='utf-8')
    return True


def main():
    readmes = list(REPO_ROOT.rglob('README.md'))
    # Filter out possible virtualenvs, node_modules, .git
    excludes = ('node_modules', '.git', '__pycache__')
    candidates = [p for p in readmes if not any(part in excludes for part in p.parts)]

    modified = []
    for p in sorted(candidates):
        try:
            changed = update_readme(p)
            if changed:
                modified.append(p)
        except Exception as e:
            print(f"Failed to update {p}: {e}")

    print(f"Scanned {len(candidates)} README.md files.")
    print(f"Updated {len(modified)} files:")
    for m in modified:
        print(f" - {m.relative_to(REPO_ROOT)}")

    if not modified:
        print('No files changed (all already had marker).')


if __name__ == '__main__':
    main()
