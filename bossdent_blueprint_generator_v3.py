#!/usr/bin/env python3
"""Bossdent Auto Blueprint Generator v6.
Fresh, read-only repository scan; comprehensive single Markdown snapshot.
Only interactive prompt: output location (Enter accepts default).
"""
from __future__ import annotations
import argparse, hashlib, json, os, re, subprocess, sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

VERSION = "6.0.0"
EXCLUDED_DIRS = {
    ".git", ".next", "node_modules", ".turbo", ".vercel", ".cache", "coverage",
    "dist", "build", "out", "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache",
    "venv", ".venv", "vendor", "playwright-report", "test-results", ".idea", ".vscode-server",
    "tmp", "temp", "blueprints", ".db", "mongodb-data", "mongo-data", "database-data",
    "data/db", "mongodata", "runtime-db", "logs",
}
IGNORED_FILES = {"thumbs.db", ".ds_store", "desktop.ini", "tsconfig.tsbuildinfo", "*.log"}
BINARY_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".eot", ".mp4", ".webm", ".mov", ".mp3", ".wav", ".pdf", ".zip", ".rar", ".7z", ".glb", ".gltf", ".obj", ".fbx", ".exe", ".dll", ".bin", ".sqlite", ".db", ".wt"}
LOCKFILES = {"package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"}
SECRET_PATTERNS = [
    (re.compile(r"(?i)(mongodb(?:\+srv)?://)[^\s\"']+"), r"\1[REDACTED_DATABASE_URI]"),
    (re.compile(r"(?i)(https?://)[^\s:@/]+:[^\s@/]+@"), r"\1[REDACTED_CREDENTIALS]@"),
    (re.compile(r"(?i)((?:api[_-]?key|secret|password|passwd|token|access[_-]?key|private[_-]?key|client[_-]?secret)\s*[=:]\s*)[\"']?[^\s\"',;}]+"), r"\1[REDACTED]"),
    (re.compile(r"\b(sk_live_|sk_test_|rk_live_|rk_test_)[A-Za-z0-9_-]+"), r"\1[REDACTED]"),
    (re.compile(r"\bAIza[0-9A-Za-z_-]{25,}\b"), "[REDACTED_GOOGLE_API_KEY]"),
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----"), "[REDACTED_PRIVATE_KEY]"),
    (re.compile(r"\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b"), "[REDACTED_JWT]"),
]
IMPORT_RE = re.compile(r"(?:import\s+(?:type\s+)?(?:[^;]*?\s+from\s+)?|export\s+[^;]*?\s+from\s+|require\s*\(|import\s*\()\s*[\"']([^\"']+)[\"']")
TODO_RE = re.compile(r"\b(TODO|FIXME|XXX|HACK|BUG)\b[:\s-]*(.*)", re.I)
METHOD_RE = re.compile(r"\bexport\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b")
COLOR_RE = re.compile(r"(?i)(#[0-9a-f]{3,8}\b|\brgb\([^)]+\)|\bhsl\([^)]+\))")
FONT_RE = re.compile(r"(?i)(?:font-family\s*:\s*|font-\[)([^;}\]]+)")
ENV_RE = re.compile(r"(?:process\.env\.([A-Z][A-Z0-9_]+)|import\.meta\.env\.([A-Z][A-Z0-9_]+))")


def sha(data: bytes) -> str: return hashlib.sha256(data).hexdigest()
def rel(path: Path, root: Path) -> str: return path.relative_to(root).as_posix()
def size_fmt(n: int) -> str:
    x=float(n)
    for unit in ("B","KB","MB","GB"):
        if x<1024 or unit=="GB": return f"{x:.1f} {unit}"
        x/=1024
    return str(n)
def redact(text: str) -> str:
    for pat,repl in SECRET_PATTERNS: text=pat.sub(repl,text)
    text=re.sub(r"(?im)^([A-Z][A-Z0-9_]*(?:SECRET|PASSWORD|TOKEN|KEY|URI)[A-Z0-9_]*\s*=).+$",r"\1[REDACTED]",text)
    return text
def secret_file(name: str) -> bool:
    n=name.lower()
    if n in {".env", ".env.local", ".env.production", ".env.development", ".env.test"}: return True
    if n.startswith(".env.") and not n.endswith((".example", ".sample", ".template")): return True
    return n.endswith((".pem", ".p12", ".pfx", ".key", ".keystore"))
def read_text(path: Path):
    try:
        raw=path.read_bytes()
        if b"\x00" in raw[:4096]: return None,"binary"
        return raw.decode("utf-8-sig"),None
    except UnicodeDecodeError:
        try: return path.read_text(encoding="latin-1"),None
        except Exception as e: return None,str(e)
    except Exception as e: return None,str(e)
def git(root: Path,*args: str) -> str:
    try:
        p=subprocess.run(["git","-C",str(root),*args],capture_output=True,text=True,timeout=12)
        return (p.stdout or p.stderr).strip() or "(none)"
    except Exception as e: return f"Unavailable: {e}"
def scan(root: Path,max_mb: int,include_uploads: bool):
    found=[]; skipped=[]
    for cur,dirs,names in os.walk(root):
        dirs[:]=sorted(d for d in dirs if d not in EXCLUDED_DIRS and (include_uploads or d.lower() not in {"uploads","user-uploads","media-uploads"}))
        for name in sorted(names):
            p=Path(cur)/name; rp=rel(p,root)
            if name.lower() in {"thumbs.db",".ds_store","desktop.ini","tsconfig.tsbuildinfo"}:
                skipped.append((rp,"generated/OS metadata")); continue
            if secret_file(name): skipped.append((rp,"secret file excluded")); continue
            try: st=p.stat()
            except OSError as e: skipped.append((rp,f"stat error: {e}")); continue
            if st.st_size>max_mb*1024*1024: skipped.append((rp,f"over size limit ({size_fmt(st.st_size)})")); continue
            found.append((p,st.st_size))
    return found,skipped
def category(path: Path):
    s,n=path.as_posix().lower(),path.name.lower()
    if n in {"package.json","tsconfig.json"} or "config" in n: return "configuration"
    if any(x in s for x in ("/app/api/","/pages/api/","/api/")): return "API route"
    if "/models/" in s or "/schemas/" in s or n.endswith((".prisma",".sql")): return "model/schema/database"
    if "/components/" in s or "/ui/" in s: return "component"
    if any(x in s for x in ("/context/","/providers/","/store/","/stores/")): return "state/context"
    if any(x in s for x in ("/services/","/actions/")): return "service/action"
    if "/hooks/" in s: return "hook"
    if any(x in s for x in ("/public/","/assets/")) or path.suffix.lower() in BINARY_EXTS: return "asset"
    if path.suffix.lower() in {".css",".scss",".sass",".less"}: return "styling"
    if path.suffix.lower() in {".md",".mdx"}: return "documentation"
    if ".test." in n or ".spec." in n: return "test"
    return "source/other"
def analyze(text: str):
    todos=[]
    for i,line in enumerate(text.splitlines(),1):
        m=TODO_RE.search(line)
        if m: todos.append((i,m.group(1).upper(),m.group(2).strip()[:240]))
    imports=sorted(set(IMPORT_RE.findall(text)))
    exports=sorted(set(re.findall(r"\bexport\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+([\w$]+)",text)))
    env=set(a or b for a,b in ENV_RE.findall(text))
    return {"imports":imports,"exports":exports,"methods":sorted(set(METHOD_RE.findall(text))),"todos":todos,"fonts":sorted(set(x.strip().strip("'\"") for x in FONT_RE.findall(text))),"colors":sorted(set(COLOR_RE.findall(text))),"env":env,"lines":len(text.splitlines())}
def ask_output(default: Path) -> Path:
    try:
        raw=input(f"\nBlueprint save location [Enter = {default}]: ").strip()
        return Path(raw).expanduser().resolve() if raw else default
    except (EOFError,KeyboardInterrupt): return default
def latest_manifest(parent: Path):
    candidates=sorted(parent.glob("BLUEPRINT_*/manifest.json"),key=lambda p:p.stat().st_mtime,reverse=True)
    for p in candidates:
        try:
            data=json.loads(p.read_text(encoding="utf-8"))
            if isinstance(data.get("file_hashes"),dict): return data,p.parent
        except Exception: continue
    return None,None
def route_label(path: str):
    p=Path(path).as_posix()
    for prefix in ("src/app/","app/","src/pages/","pages/"):
        if p.startswith(prefix):
            q=p[len(prefix):]
            q=re.sub(r"/route\.(ts|js)$"," (API)",q)
            q=re.sub(r"/page\.(tsx|jsx|ts|js)$","",q)
            q=re.sub(r"\.(tsx|jsx|ts|js)$","",q)
            return "/"+q.strip("/") if q else "/"
    return p
def markdown_table(rows,headers):
    if not rows:return "- None detected"
    out=["| "+" | ".join(headers)+" |","|"+"|".join(["---"]*len(headers))+"|"]
    out += ["| "+" | ".join(str(x).replace("|","\\|").replace("\n"," ") for x in row)+" |" for row in rows]
    return "\n".join(out)

def main():
    parser=argparse.ArgumentParser(description="Generate a complete refreshed project blueprint.")
    parser.add_argument("--root",default=".",help="Repository root (defaults to current folder)")
    parser.add_argument("--output",default="",help="Output parent path; bypasses prompt")
    parser.add_argument("--no-prompt",action="store_true",help="Use default output without prompt")
    parser.add_argument("--include-uploads",action="store_true",help="Scan upload folders")
    parser.add_argument("--max-file-mb",type=int,default=20)
    parser.add_argument("--include-lockfiles",action="store_true")
    args=parser.parse_args(); root=Path(args.root).expanduser().resolve()
    if not root.is_dir(): sys.exit(f"Project folder not found: {root}")
    now=datetime.now().astimezone(); stamp=now.strftime("%Y%m%d-%H%M%S-%f"); slug=re.sub(r"[^A-Za-z0-9._-]+","-",root.name).strip("-") or "project"
    default_output=root.parent/f"{slug}-blueprints"
    parent=Path(args.output).expanduser().resolve() if args.output else (default_output if args.no_prompt else ask_output(default_output))
    parent.mkdir(parents=True,exist_ok=True)
    prev_manifest,prev_dir=latest_manifest(parent); out=parent/f"BLUEPRINT_{slug}_{stamp}"; out.mkdir(exist_ok=False)
    files,skipped=scan(root,args.max_file_mb,args.include_uploads)
    package={}; pkg=root/"package.json"
    if pkg.exists():
        raw,_=read_text(pkg)
        try: package=json.loads(raw or "{}")
        except Exception: pass
    paths=[p for p,_ in files]
    framework="Next.js" if "next" in package.get("dependencies",{}) or "next" in package.get("devDependencies",{}) or any(p.name.startswith("next.config.") for p in paths) else "React" if "react" in package.get("dependencies",{}) else "Not confidently detected"
    manager=next((x for x,n in (("pnpm","pnpm-lock.yaml"),("yarn","yarn.lock"),("npm","package-lock.json"),("bun","bun.lock"),("bun","bun.lockb")) if any(p.name==n for p in paths)),"unknown")
    inventory=[]; sources=[]; routes=[]; apis=[]; models=[]; assets=[]; todos=[]; fonts=Counter(); colors=Counter(); env_names=set(); imports_map={}; hashes={}; skipped_lock=[]; embedded=0; security_hits=[]
    for path,size in files:
        rp=rel(path,root); cat=category(path)
        if path.name in LOCKFILES and not args.include_lockfiles:
            data=path.read_bytes(); h=sha(data); hashes[rp]=h; skipped_lock.append((rp,size,h)); inventory.append((rp,cat,path.suffix,size,0,h,"lockfile summarized")); continue
        content,err=read_text(path)
        if path.suffix.lower() in BINARY_EXTS or content is None:
            data=path.read_bytes(); h=sha(data); hashes[rp]=h; inventory.append((rp,cat,path.suffix,size,0,h,"binary/unreadable; inventory only")); assets.append((rp,path.suffix,size,h,"binary file")); continue
        safe=redact(content); h=sha(content.encode("utf-8",errors="replace")); hashes[rp]=h; info=analyze(safe); embedded+=1
        env_names.update(info["env"]); fonts.update(info["fonts"]); colors.update(info["colors"]); todos.extend((rp,*t) for t in info["todos"])
        imports_map[rp]=info["imports"]
        if rp.startswith(("app/","src/app/","pages/","src/pages/")) and path.suffix.lower() in {".ts",".tsx",".js",".jsx"}: routes.append((rp,route_label(rp),info["methods"]))
        if cat=="API route": apis.append((rp,info["methods"],info["exports"]))
        if cat.startswith("model/schema"): models.append(rp)
        if cat=="asset": assets.append((rp,path.suffix,size,h,"text asset"))
        inventory.append((rp,cat,path.suffix,size,info["lines"],h,"embedded")); sources.append((rp,cat,size,info["lines"],h,safe))
        # Report suspicious credential-like lines not fully redacted by known patterns.
        for ln,line in enumerate(content.splitlines(),1):
            if re.search(r"(?i)(password|secret|token|api[_-]?key|private[_-]?key)\s*[:=]\s*['\"]?[A-Za-z0-9_\-/+=]{12,}",line):
                security_hits.append((rp,ln,"Credential-like assignment; review redaction"))
    old_hashes=(prev_manifest or {}).get("file_hashes",{})
    baseline=bool(prev_manifest and old_hashes)
    added=sorted(set(hashes)-set(old_hashes)) if baseline else []
    removed=sorted(set(old_hashes)-set(hashes)) if baseline else []
    changed=sorted(p for p in hashes.keys() & old_hashes.keys() if hashes[p]!=old_hashes[p]) if baseline else []
    gitinfo={"branch":git(root,"branch","--show-current"),"commit":git(root,"rev-parse","--short","HEAD"),"status":git(root,"status","--short"),"log":git(root,"log","-8","--oneline"),"remotes":git(root,"remote","-v")}
    dirs=set()
    for rp in hashes:
        parts=Path(rp).parts
        for i in range(1,len(parts)): dirs.add("/".join(parts[:i]) + "/")
    tree=["."]+["  "*(d.count("/")-1)+d for d in sorted(dirs)]
    # Dependency graph: local import references are mapped heuristically to discovered source paths.
    source_paths=set(imports_map); dependency_rows=[]
    for file,mods in imports_map.items():
        local=[]
        for mod in mods:
            if mod.startswith(".") or mod.startswith("@/"):
                local.append(mod)
        if local: dependency_rows.append((file,"; ".join(local)))
    overview=f"""# COMPLETE PROJECT BLUEPRINT — {root.name}

> Generated: {now.isoformat()} | Generator v{VERSION} | Fresh repository scan; project files are not modified.

## 1. Project identity
- Project: **{package.get('name') or root.name}**
- Version: {package.get('version','not declared')}
- Description: {package.get('description','not declared')}
- Root: `{root}`
- Framework: {framework}
- Package manager: {manager}

## 2. Snapshot/change detection
- Previous snapshot: `{prev_dir if prev_dir else 'No compatible prior manifest'}`
- Status: {'Compared with prior compatible manifest' if baseline else 'BASELINE — no compatible hashes; future runs will compare against this snapshot'}
- Added: {len(added)} | Modified: {len(changed)} | Removed: {len(removed)}

### Added files
{chr(10).join('- `'+p+'`' for p in added) or '- None / baseline run'}
### Modified files
{chr(10).join('- `'+p+'`' for p in changed) or '- None / baseline run'}
### Removed files
{chr(10).join('- `'+p+'`' for p in removed) or '- None / baseline run'}

## 3. Scan summary
- Discovered: {len(files)} | Text/source embedded: {embedded} | Inventory: {len(inventory)} | Assets: {len(assets)} | Skipped: {len(skipped)+len(skipped_lock)}
- TODO/FIXME/BUG/HACK: {len(todos)} | Environment variable names: {len(env_names)}

## 4. Runtime/dependency intelligence
```json
{json.dumps({'name':package.get('name'),'version':package.get('version'),'scripts':package.get('scripts',{}),'dependencies':package.get('dependencies',{}),'devDependencies':package.get('devDependencies',{}),'framework':framework,'package_manager':manager},indent=2,ensure_ascii=False)}
```

## 5. Project structure
```text
{chr(10).join(tree)}
```

## 6. Routes/pages
{markdown_table([(p,r,', '.join(m) or '—') for p,r,m in routes],['File','Detected route','HTTP methods'])}

## 7. API routes
{markdown_table([(p,', '.join(m) or 'Not detected',', '.join(e) or '—') for p,m,e in apis],['File','Methods','Exports'])}

## 8. Database models/schemas
{chr(10).join('- `'+p+'`' for p in models) or '- None detected'}

## 9. Git state
- Branch: `{gitinfo['branch']}`
- Commit: `{gitinfo['commit']}`
- Working tree: `{gitinfo['status']}`
### Recent commits
```text
{gitinfo['log']}
```
### Remotes
```text
{gitinfo['remotes']}
```

## 10. Import/dependency references (heuristic)
{markdown_table(dependency_rows,['File','Local import references'])}

## 11. Design system scan
### Fonts
{chr(10).join('- `'+f+'` — '+str(n)+' occurrence(s)' for f,n in fonts.most_common()) or '- None detected'}
### Colors
{chr(10).join('- `'+c+'` — '+str(n)+' occurrence(s)' for c,n in colors.most_common(100)) or '- None detected'}

## 12. Assets inventory
{markdown_table([(p,e,size_fmt(sz),h[:16],note) for p,e,sz,h,note in assets],['Path','Type','Size','SHA-256','Notes'])}

## 13. TODO / FIXME / BUG / HACK markers
{markdown_table([(p,line,kind,txt) for p,line,kind,txt in todos],['File','Line','Marker','Text'])}

## 14. Environment variables (names only)
{chr(10).join('- `'+n+'` — value intentionally not collected' for n in sorted(env_names)) or '- None detected'}

## 15. Security review warnings
{markdown_table(security_hits,['File','Line','Warning'])}
- Review manually before sharing. Secrets are excluded/redacted, but pattern-based detection is not guaranteed.

## 16. File inventory
{markdown_table([(p,c,e,size_fmt(sz),lines,h[:16],handling) for p,c,e,sz,lines,h,handling in inventory],['Path','Category','Ext','Size','Lines','SHA-256','Handling'])}

## 17. Excluded/skipped files
{markdown_table(skipped,['Path','Reason'])}
### Lockfiles summarized
{markdown_table([(p,size_fmt(sz),h[:16]) for p,sz,h in skipped_lock],['Path','Size','SHA-256'])}

## 18. Complete source snapshot
> Complete current text/source contents are embedded below. Binary assets are inventoried only. Secret files excluded and common secret patterns redacted. This is a freshly generated scan.
"""
    for rp,cat,size,lines,h,content in sources:
        longest=max((len(m.group(0)) for m in re.finditer(r"`+",content)),default=0); fence="`"*max(3,longest+1)
        overview+=f"\n\n### FILE: `{rp.replace('`','\\`')}`\n- Category: {cat} | Size: {size_fmt(size)} | Lines: {lines} | SHA-256: `{h}`\n\n{fence}text\n{content.rstrip()}\n{fence}\n"
    overview+="""

## 19. Analysis guide and limitations
- This is a static snapshot; it does not prove runtime behavior.
- Live database records are not queried/exported. Schema and seed files are included if present.
- Tests, lint, typecheck, and production builds are not executed.
- Binary images/videos are inventoried but not embedded; use screenshots when visual inspection is important.
- Environment variable names are captured, values are not. `.env`, key files, and private keys are excluded.
- Review security warnings and generated Markdown before sharing.
- Read the snapshot as the current source of truth; preserve working routes, APIs, data contracts, auth, integrations, and UI behavior unless the requested task changes them.
- Do not invent missing information. Clearly distinguish detected facts from inference.
- When implementing changes, use exact paths, verify imports/types, responsive behavior, security and build implications.
"""
    md=out/f"COMPLETE_BLUEPRINT_{slug}_{stamp}.md"; md.write_text(overview,encoding="utf-8")
    manifest={"generator":"Bossdent Auto Blueprint Generator","version":VERSION,"generated_at":now.isoformat(),"root":str(root),"output":str(out),"blueprint":md.name,"files_discovered":len(files),"source_files_embedded":embedded,"inventory_count":len(inventory),"skipped_count":len(skipped)+len(skipped_lock),"baseline":not baseline,"added":added,"modified":changed,"removed":removed,"file_hashes":hashes,"blueprint_sha256":sha(md.read_bytes())}
    (out/"manifest.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding="utf-8")
    print("\n=== BLUEPRINT GENERATED ===")
    print("Folder:",out); print("Markdown:",md); print("Files discovered:",len(files)); print("Source files embedded:",embedded); print("Change report:","baseline" if not baseline else f"+{len(added)} / ~{len(changed)} / -{len(removed)}"); print("Skipped:",len(skipped)+len(skipped_lock))
    print("\nUpload the complete Markdown to ChatGPT after reviewing it for sensitive content.")
    print("Your repository was not modified.")
if __name__=="__main__": main()
