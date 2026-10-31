#!/usr/bin/env python3
"""
Bossdent / Next.js Project Blueprint Generator v3.0
Read-only scanner that creates a timestamped, multi-file project context pack.

Run:
  py blueprint_generator.py
  py blueprint_generator.py --root "C:\\path\\to\\project"
  py blueprint_generator.py --root . --output "../blueprints"
  py blueprint_generator.py --no-prompt

No third-party packages required. Does not modify project files.
"""
from __future__ import annotations
import argparse, csv, hashlib, json, os, re, subprocess, sys
from collections import Counter
from datetime import datetime
from pathlib import Path

VERSION = "3.0.0"
EXCLUDED_DIRS = {
    ".git", ".next", "node_modules", ".turbo", ".vercel", ".cache",
    "coverage", "dist", "build", "out", "__pycache__", ".pytest_cache",
    ".mypy_cache", ".ruff_cache", "venv", ".venv", "vendor",
    "playwright-report", "test-results", ".idea",
}
BINARY_EXTS = {
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".ico",
    ".woff", ".woff2", ".ttf", ".otf", ".eot", ".mp4", ".webm",
    ".mov", ".mp3", ".wav", ".pdf", ".zip", ".rar", ".7z",
    ".glb", ".gltf", ".obj", ".fbx",
}
TEXT_EXTS = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts",
    ".css", ".scss", ".sass", ".less", ".html", ".htm", ".json",
    ".jsonc", ".yaml", ".yml", ".toml", ".md", ".mdx", ".txt",
    ".sql", ".prisma", ".graphql", ".gql", ".php", ".py", ".sh",
    ".bat", ".ps1", ".xml", ".svg",
}
SECRET_PATTERNS = [
    (re.compile(r"(?i)(mongodb(?:\+srv)?://)[^\s\"']+"), r"\1[REDACTED_DATABASE_URI]"),
    (re.compile(r"(?i)(https?://)[^\s:@/]+:[^\s@/]+@"), r"\1[REDACTED_CREDENTIALS]@"),
    (re.compile(r"(?i)((?:api[_-]?key|secret|password|passwd|token|access[_-]?key|private[_-]?key)\s*[=:]\s*)[\"']?[^\s\"',;}]+"), r"\1[REDACTED]"),
    (re.compile(r"\b(sk_live_|sk_test_|rk_live_|rk_test_)[A-Za-z0-9_-]+"), r"\1[REDACTED]"),
    (re.compile(r"\bAIza[0-9A-Za-z_-]{25,}\b"), "[REDACTED_GOOGLE_API_KEY]"),
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----"), "[REDACTED_PRIVATE_KEY]"),
]
IMPORT_RE = re.compile(r"""(?:import\s+(?:type\s+)?(?:[^;]*?\s+from\s+)?|export\s+[^;]*?\s+from\s+|require\s*\()\s*["']([^"']+)["']""")
TODO_RE = re.compile(r"\b(TODO|FIXME|XXX|HACK|BUG)\b[:\s-]*(.*)", re.I)
METHOD_RE = re.compile(r"\bexport\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b")
FONT_RE = re.compile(r"(?i)(?:font-family\s*:\s*|font-\[)([^;}\]]+)")
COLOR_RE = re.compile(r"(?i)(#[0-9a-f]{3,8}\b|\brgb\([^)]+\)|\bhsl\([^)]+\))")
ENV_RE = re.compile(r"^\s*([A-Z][A-Z0-9_]{2,})\s*=", re.M)

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def size_text(n: int) -> str:
    x = float(n)
    for unit in ("B", "KB", "MB", "GB"):
        if x < 1024 or unit == "GB":
            return f"{x:.1f} {unit}"
        x /= 1024
    return str(n)

def redact(text: str) -> str:
    for pattern, replacement in SECRET_PATTERNS:
        text = pattern.sub(replacement, text)
    text = re.sub(
        r"(?im)^([A-Z][A-Z0-9_]*(?:SECRET|PASSWORD|TOKEN|KEY|URI|URL)[A-Z0-9_]*\s*=).+$",
        r"\1[REDACTED]", text
    )
    return text

def read_text(path: Path):
    try:
        raw = path.read_bytes()
        if b"\x00" in raw[:4096]:
            return None, "binary"
        return raw.decode("utf-8-sig"), None
    except UnicodeDecodeError:
        try:
            return path.read_text(encoding="latin-1"), None
        except Exception as exc:
            return None, str(exc)
    except Exception as exc:
        return None, str(exc)

def git(root: Path, *args: str) -> str:
    try:
        p = subprocess.run(
            ["git", "-C", str(root), *args],
            capture_output=True, text=True, timeout=8, check=False
        )
        return (p.stdout or p.stderr).strip()
    except Exception as exc:
        return f"Unavailable: {exc}"

def secret_file(name: str) -> bool:
    n = name.lower()
    if n in {".env", ".env.local", ".env.production", ".env.development"}:
        return True
    if n.startswith(".env.") and not n.endswith((".example", ".sample", ".template")):
        return True
    return any(x in n for x in (".pem", ".p12", ".pfx", ".key"))

def rel(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()

def scan(root: Path, include_uploads: bool, max_mb: int):
    files, skipped = [], []
    for current, dirs, names in os.walk(root):
        dirs[:] = sorted(
            d for d in dirs
            if d not in EXCLUDED_DIRS
            and (include_uploads or d.lower() not in {"uploads", "user-uploads"})
        )
        for name in sorted(names):
            p = Path(current) / name
            rp = rel(p, root)
            if name in {"Thumbs.db", ".DS_Store", "desktop.ini"}:
                skipped.append((rp, "OS metadata"))
                continue
            if secret_file(name):
                skipped.append((rp, "secret file intentionally excluded"))
                continue
            try:
                st = p.stat()
            except OSError as exc:
                skipped.append((rp, f"stat error: {exc}"))
                continue
            if st.st_size > max_mb * 1024 * 1024:
                skipped.append((rp, f"over size limit: {size_text(st.st_size)}"))
                continue
            files.append((p, st.st_size))
    return files, skipped

def category(path: Path) -> str:
    s, n = path.as_posix().lower(), path.name.lower()
    if n in {"package.json", "tsconfig.json"} or "config" in n:
        return "configuration"
    if any(x in s for x in ("/app/api/", "/pages/api/", "/api/")):
        return "API route"
    if "/models/" in s or "/schemas/" in s or n.endswith(".prisma"):
        return "data model/schema"
    if "/components/" in s or "/ui/" in s:
        return "component"
    if any(x in s for x in ("/context/", "/providers/", "/store/", "/stores/")):
        return "state/context"
    if any(x in s for x in ("/services/", "/actions/")):
        return "service/action"
    if "/hooks/" in s:
        return "hook"
    if any(x in s for x in ("/public/", "/assets/")) or path.suffix.lower() in BINARY_EXTS:
        return "asset"
    if path.suffix.lower() in {".css", ".scss", ".sass", ".less"}:
        return "styling"
    if path.suffix.lower() in {".md", ".mdx"}:
        return "documentation"
    return "source/other"

def analyze(text: str):
    imports = sorted(set(IMPORT_RE.findall(text)))
    methods = sorted(set(METHOD_RE.findall(text)))
    todos = []
    for no, line in enumerate(text.splitlines(), 1):
        m = TODO_RE.search(line)
        if m:
            todos.append({"line": no, "kind": m.group(1).upper(), "text": m.group(2).strip()[:240]})
    exports = sorted(set(re.findall(
        r"\bexport\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+([\w$]+)", text
    )))
    return {
        "imports": imports, "methods": methods, "todos": todos,
        "fonts": sorted(set(x.strip().strip("'\"") for x in FONT_RE.findall(text)))[:60],
        "colors": sorted(set(COLOR_RE.findall(text)))[:120],
        "env": sorted(set(ENV_RE.findall(text))),
        "exports": exports,
        "lines": len(text.splitlines()),
    }

def split_lines(text: str, limit: int):
    chunks, buf, count = [], [], 0
    for line in text.splitlines(keepends=True):
        if buf and count + len(line) > limit:
            chunks.append("".join(buf))
            buf, count = [], 0
        buf.append(line)
        count += len(line)
    if buf:
        chunks.append("".join(buf))
    return chunks or [""]

def write_md(path: Path, title: str, body: str):
    path.write_text(f"# {title}\n\n{body.rstrip()}\n", encoding="utf-8")

def ask(label: str, default: str = "") -> str:
    prompt = f"{label} [{default}]: " if default else f"{label}: "
    try:
        value = input(prompt).strip()
        return value or default
    except (EOFError, KeyboardInterrupt):
        return default

def ask_block(label: str) -> str:
    print(f"\n{label}\nPaste/type content; finish with a line containing END.")
    lines = []
    try:
        while True:
            line = input()
            if line.strip() == "END":
                break
            lines.append(line)
    except (EOFError, KeyboardInterrupt):
        pass
    return "\n".join(lines).strip()

def main():
    parser = argparse.ArgumentParser(description="Create a full read-only project blueprint pack.")
    parser.add_argument("--root", default=".", help="Project directory; defaults to current directory")
    parser.add_argument("--output", default="", help="Output parent directory; defaults outside project")
    parser.add_argument("--no-prompt", action="store_true", help="Skip context questions")
    parser.add_argument("--include-uploads", action="store_true", help="Include text files under uploads folders")
    parser.add_argument("--max-file-mb", type=int, default=8, help="Skip files larger than this; default 8 MB")
    parser.add_argument("--chunk-kb", type=int, default=160, help="Approximate source-part size; default 160 KB")
    parser.add_argument("--include-lockfiles", action="store_true", help="Include package lockfiles in source")
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    if not root.is_dir():
        sys.exit(f"ERROR: project folder not found: {root}")
    stamp = datetime.now().astimezone().strftime("%Y%m%d-%H%M%S")
    slug = re.sub(r"[^A-Za-z0-9._-]+", "-", root.name).strip("-") or "project"
    parent = Path(args.output).expanduser().resolve() if args.output else root.parent / f"{slug}-blueprints"
    out = parent / f"BLUEPRINT_{slug}_{stamp}"
    out.mkdir(parents=True, exist_ok=False)

    print("\nBOSSDENT PROJECT BLUEPRINT GENERATOR v" + VERSION)
    print("Scanning (read-only):", root)
    print("Output:", out)

    context = {
        "company": "Bossdent Global India Pvt Ltd",
        "reference_ui": "https://www.vividdental.ca/",
        "goal": "Match the Vivid Dental reference UI as closely as possible while preserving the existing dental ecommerce functionality and data.",
        "current_state": "", "completed": "", "recent_changes": "",
        "decisions": "", "constraints": "", "bugs": "", "next_task": "",
        "screenshots": "Screenshots should be attached separately; the generator cannot inspect browser screenshots automatically.",
    }
    if not args.no_prompt:
        print("\n--- Project context questionnaire ---")
        context["company"] = ask("Company / brand", context["company"])
        context["reference_ui"] = ask("Visual reference URL", context["reference_ui"])
        context["goal"] = ask("Main objective", context["goal"])
        context["current_state"] = ask_block("What currently works, and what is incomplete?")
        context["completed"] = ask_block("What work has already been completed?")
        context["recent_changes"] = ask_block("What changed since the previous blueprint?")
        context["decisions"] = ask_block("Important decisions/preferences that must be preserved?")
        context["constraints"] = ask_block("What must not be changed? (DB, APIs, routes, packages, business logic...)")
        context["bugs"] = ask_block("Known bugs/errors; include exact messages if available.")
        context["next_task"] = ask_block("What should ChatGPT/developer do first with this blueprint?")

    files, skipped = scan(root, args.include_uploads, args.max_file_mb)
    package = {}
    pkg, _ = read_text(root / "package.json") if (root / "package.json").exists() else (None, None)
    if pkg:
        try:
            package = json.loads(pkg)
        except Exception:
            pass
    names = {p.name for p, _ in files}
    project_name = package.get("name") or root.name
    framework = "Next.js" if "next" in package.get("dependencies", {}) or any(n.startswith("next.config.") for n in names) else "Not confidently detected"
    manager = "pnpm" if "pnpm-lock.yaml" in names else "yarn" if "yarn.lock" in names else "npm" if "package-lock.json" in names else "bun" if "bun.lock" in names or "bun.lockb" in names else "unknown"

    inventory, source_index, assets, source_chunks = [], [], [], []
    route_files, api_files, model_files, style_files = [], [], [], []
    all_todos, env_names = [], set()
    font_counts, color_counts = Counter(), Counter()
    included = 0
    for path, size in files:
        rp = rel(path, root)
        cat = category(path)
        content, err = read_text(path)
        if content is None:
            try:
                h = digest(path.read_bytes())
            except Exception:
                h = ""
            inventory.append([rp, cat, path.suffix.lower(), size, 0, h, "binary/unreadable; inventoried only"])
            assets.append((rp, path.suffix.lower(), size, h, "binary/unreadable"))
            continue

        if path.name.lower() in {"package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"} and not args.include_lockfiles:
            h = digest(content.encode("utf-8", errors="replace"))
            inventory.append([rp, "dependency lockfile", path.suffix.lower(), size, len(content.splitlines()), h, "summarized; excluded from source"])
            continue

        safe = redact(content)
        h = digest(content.encode("utf-8", errors="replace"))
        info = analyze(safe)
        included += 1
        env_names.update(info["env"])
        font_counts.update(info["fonts"])
        color_counts.update(info["colors"])
        for item in info["todos"]:
            all_todos.append({"file": rp, **item})
        if rp.startswith(("app/", "pages/", "src/app/", "src/pages/")) and path.suffix.lower() in {".ts", ".tsx", ".js", ".jsx"}:
            route_files.append(rp)
        if cat == "API route":
            api_files.append((rp, info["methods"]))
        if cat == "data model/schema":
            model_files.append(rp)
        if cat == "styling":
            style_files.append(rp)
        if cat == "asset":
            assets.append((rp, path.suffix.lower(), size, h, "text-based asset"))
        inventory.append([rp, cat, path.suffix.lower(), size, info["lines"], h, "included"])
        source_index.append([rp, cat, size, info["lines"], h, ", ".join(info["exports"][:25])])
        for chunk_no, chunk in enumerate(split_lines(safe, args.chunk_kb * 1024), 1):
            source_chunks.append(
                f"\n---\n\n## `{rp}` — chunk {chunk_no}\n\n"
                f"- Type: {cat} | Size: {size_text(size)} | SHA-256: `{h}`\n\n"
                f"```text\n{chunk.rstrip()}\n```\n"
            )

    # Empty directories
    empty_dirs = []
    for current, dirs, names_here in os.walk(root):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        if not dirs and not names_here:
            empty_dirs.append(rel(Path(current), root) or ".")

    with (out / "02_FILE_INVENTORY.csv").open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f); w.writerow(["path", "category", "extension", "bytes", "lines", "sha256", "handling"]); w.writerows(inventory)
    with (out / "03_SOURCE_INDEX.csv").open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f); w.writerow(["path", "category", "bytes", "lines", "sha256", "detected_exports"]); w.writerows(source_index)

    overview = f"""
## Project identity
- Company: **{context['company']}**
- Project directory: `{root}`
- Detected project name: `{project_name}`
- Version: `{package.get('version', 'not declared')}`
- Framework: {framework}
- Package manager: {manager}
- Generated: {stamp}
- Generator version: {VERSION}

## Objective and reference
- Reference: {context['reference_ui']}
- Objective: {context['goal']}

## Project context supplied by the user
### Current state
{context['current_state'] or 'Not supplied.'}
### Completed work
{context['completed'] or 'Not supplied.'}
### Recent changes
{context['recent_changes'] or 'Not supplied.'}
### Decisions to preserve
{context['decisions'] or 'Not supplied.'}
### Constraints
{context['constraints'] or 'Not supplied.'}
### Bugs and errors
{context['bugs'] or 'Not supplied.'}
### Next task
{context['next_task'] or 'Not supplied.'}

## Scan totals
- Files discovered: {len(files)}
- Text/source files included: {included}
- Binary assets inventoried: {len(assets)}
- Skipped files: {len(skipped)}
- Empty directories: {len(empty_dirs)}
- TODO/FIXME markers: {len(all_todos)}
- Environment variable names detected: {len(env_names)}
"""
    write_md(out / "01_PROJECT_OVERVIEW.md", "Project Overview", overview)

    package_summary = {
        "name": project_name, "version": package.get("version"),
        "description": package.get("description"), "scripts": package.get("scripts", {}),
        "dependencies": package.get("dependencies", {}),
        "devDependencies": package.get("devDependencies", {}),
        "framework": framework, "package_manager": manager,
    }
    (out / "04_PACKAGE_INTELLIGENCE.json").write_text(json.dumps(package_summary, indent=2), encoding="utf-8")

    api_text = "\n".join(f"- `{p}` — {', '.join(m) if m else 'HTTP methods not statically detected'}" for p, m in sorted(api_files)) or "- None detected."
    model_text = "\n".join(f"- `{p}`" for p in sorted(model_files)) or "- None detected."
    route_text = "\n".join(f"- `{p}`" for p in sorted(route_files)) or "- No conventional Next.js route files detected."
    git_branch, git_commit = git(root, "branch", "--show-current"), git(root, "rev-parse", "--short", "HEAD")
    git_status, git_log, git_remote = git(root, "status", "--short"), git(root, "log", "-5", "--oneline"), git(root, "remote", "-v")
    architecture = f"""
## App routes and pages (static file discovery)
{route_text}

## API endpoints and detected HTTP methods
{api_text}

## Data models / schemas
{model_text}

## Git snapshot
- Branch: `{git_branch or 'unavailable'}`
- Commit: `{git_commit or 'unavailable'}`
- Working tree:
```text
{git_status or '(clean or unavailable)'}
```
- Recent commits:
```text
{git_log or '(unavailable)'}
```
- Remotes:
```text
{git_remote or '(unavailable)'}
```

## Important
These are static detections, not proof of runtime behavior. Verify route handlers,
middleware, authentication, authorization, data relationships and integration behavior
from source and runtime before changing them.
"""
    write_md(out / "05_ARCHITECTURE_ROUTES_DATABASE.md", "Architecture, Routes and Database", architecture)

    font_text = "\n".join(f"- `{k}` — {v} occurrence(s)" for k, v in font_counts.most_common(100)) or "- None detected."
    color_text = "\n".join(f"- `{k}` — {v} occurrence(s)" for k, v in color_counts.most_common(150)) or "- None detected."
    asset_text = "\n".join(f"- `{p}` — {ext}, {size_text(sz)}, hash `{h[:16]}` ({note})" for p, ext, sz, h, note in assets) or "- None detected."
    design = f"""
## Styling files
{chr(10).join('- `' + p + '`' for p in sorted(style_files)) or '- None detected.'}

## Font declarations (static scan)
{font_text}

## Color declarations (static scan)
{color_text}

## Asset inventory
{asset_text}

## Visual redesign inspection checklist
- Desktop header: announcement bar, logo lockup, nav spacing, active/hover states, CTA.
- Mobile header: menu, search, account/cart, sticky behavior and breakpoints.
- Exact fonts: actual font files/imports, weights, sizes, line-height and letter spacing.
- Exact colors: page, surfaces, text, muted text, borders, buttons and hover states.
- Homepage width, vertical rhythm, image crops, section backgrounds and responsive behavior.
- Product cards, category listing, product details, cart, checkout, account and admin.
- Loading, empty, error, keyboard-focus and accessibility states.
- Compare current/reference screenshots at the same viewport dimensions.

A URL alone may not expose exact CSS/font values. Do not claim pixel-perfect matching
without reference screenshots or measured styles. Preserve commerce functionality.
"""
    write_md(out / "06_DESIGN_SYSTEM_AND_ASSETS.md", "Design System and Assets", design)

    env_text = "\n".join(f"- `{x}` — name detected; value deliberately not collected." for x in sorted(env_names)) or "- None detected."
    todo_text = "\n".join(f"- `{x['file']}:{x['line']}` **{x['kind']}** — {x['text']}" for x in all_todos) or "- None detected."
    security = f"""
## Environment variable names
{env_text}

## Secret handling
- `.env` and common private-key files are excluded.
- Secret-looking values in included source are redacted.
- Actual credentials are neither required nor collected.
- Do not paste production secrets into ChatGPT.

## TODO / FIXME / BUG markers
{todo_text}

## API files
{api_text}

## Model/schema files
{model_text}

## What static scanning cannot establish
Live database records, indexes, actual production environment values, payment/shipping
provider approval, external service configuration, real user permissions, and runtime
health. Supply sanitized logs or schema exports separately when these are needed.
"""
    write_md(out / "07_API_ENV_SECURITY_TODOS.md", "API, Environment, Security and TODOs", security)

    # Source parts: split all included source without imposing a file-count limit.
    part_limit = max(32, args.chunk_kb) * 1024
    parts, buf, buf_len = [], [], 0
    for item in source_chunks:
        if buf and buf_len + len(item) > part_limit:
            parts.append("".join(buf)); buf, buf_len = [], 0
        buf.append(item); buf_len += len(item)
    if buf:
        parts.append("".join(buf))
    part_names = []
    for i, part in enumerate(parts, 1):
        name = f"08_SOURCE_PART_{i:03d}.md"
        (out / name).write_text("# Complete Source Snapshot\n" + part, encoding="utf-8")
        part_names.append(name)

    skipped_text = "\n".join(f"- `{p}` — {why}" for p, why in skipped) or "- None."
    empty_text = "\n".join(f"- `{p}`" for p in sorted(empty_dirs)) or "- None."
    source_text = "\n".join(f"- `{p}`" for p in part_names) or "- None."
    omissions = f"""
## Excluded or skipped files
{skipped_text}

## Empty directories
{empty_text}

## Source part files
{source_text}

## Snapshot boundaries
- Dependencies, build output, caches, Git internals and generated folders are excluded.
- Binary assets are inventoried, not embedded.
- Files above --max-file-mb are listed as skipped.
- Lockfiles are summarized unless --include-lockfiles is used.
- This is not a live database export, runtime test, or browser screenshot capture.
"""
    write_md(out / "09_OMISSIONS_AND_SOURCE_PARTS.md", "Omissions and Source Parts", omissions)

    readme = f"""
This folder is a complete, read-only project context pack.

## Upload order
1. `01_PROJECT_OVERVIEW.md`
2. `05_ARCHITECTURE_ROUTES_DATABASE.md`
3. `06_DESIGN_SYSTEM_AND_ASSETS.md`
4. `07_API_ENV_SECURITY_TODOS.md`
5. `04_PACKAGE_INTELLIGENCE.json`
6. `02_FILE_INVENTORY.csv` and `03_SOURCE_INDEX.csv`
7. `09_OMISSIONS_AND_SOURCE_PARTS.md`
8. Every `08_SOURCE_PART_*.md` in numerical order
9. `manifest.json`

## Instructions to ChatGPT / developer
Read the overview and every source part before proposing changes. Treat the snapshot as
the current implementation. Preserve working behavior, routes, APIs, database contracts,
authentication and integrations unless the task explicitly requires a change. Do not
invent filenames, props, models, CSS tokens or environment variable values. Identify
missing evidence and ask for it rather than guessing. Provide exact file-by-file changes,
then review imports, TypeScript, responsive behavior, accessibility and build implications.

For visual matching, attach current and reference screenshots at matching viewport sizes.
The generator cannot inspect a live website or browser session; it inventories source
fonts, colors and assets to guide the comparison.

## Snapshot
- Project: `{project_name}`
- Company: `{context['company']}`
- Reference: {context['reference_ui']}
- Generated: {stamp}
- Discovered files: {len(files)}
- Included source files: {included}
- Source parts: {len(part_names)}

The generator does not modify project files, run migrations, run builds/tests, query a
database, or make network requests. Review the omissions report before relying on it.
"""
    write_md(out / "00_README_FIRST.md", "Read This First", readme)

    manifest = {
        "generator": {"name": "Bossdent Project Blueprint Generator", "version": VERSION},
        "generated_at": datetime.now().astimezone().isoformat(),
        "project_root": str(root), "output_directory": str(out),
        "project": {"name": project_name, "version": package.get("version"), "framework": framework, "package_manager": manager},
        "user_context": context,
        "counts": {
            "discovered_files": len(files), "included_source_files": included,
            "inventory_rows": len(inventory), "skipped_files": len(skipped),
            "source_parts": len(part_names), "todos": len(all_todos),
            "environment_names": len(env_names), "assets": len(assets),
        },
        "git": {"branch": git_branch, "commit": git_commit, "status": git_status, "recent_commits": git_log},
        "safety": {"read_only": True, "secret_files_excluded": True, "redaction_enabled": True,
                   "binary_assets_embedded": False, "database_exported": False, "network_used": False},
        "artifacts": sorted(p.name for p in out.iterdir()),
    }
    manifest_path = out / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    manifest["artifact_sha256"] = {
        p.name: digest(p.read_bytes()) for p in sorted(out.iterdir())
        if p.is_file() and p.name != "manifest.json"
    }
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

    print("\n=== BLUEPRINT GENERATED ===")
    print("Folder:", out)
    print("Discovered files:", len(files))
    print("Included source files:", included)
    print("Source parts:", len(part_names))
    print("Skipped files:", len(skipped))
    print("\nStart with 00_README_FIRST.md. Upload every file in this folder for a full handoff.")
    print("Your project files were not modified.")

if __name__ == "__main__":
    main()
