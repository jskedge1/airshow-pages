"""Safety check for the live pages, run on every push by .github/workflows/site-check.yml.

Checks:
  1. Every .js file parses (node).
  2. Every inline <script> in every page parses (node), and JSON script blocks are valid JSON.
  3. Every .json file is valid JSON.
  4. Links and file references inside the pages point at files that exist in this repository
     (relative links and https://jskedge1.github.io/airshow-pages/... addresses).
  5. Text added by the push has no en or em dashes (Jack's no dashes rule).

Usage:
  python3 tools-sitecheck.py                 # checks 1 to 4 on everything
  python3 tools-sitecheck.py --base <sha>    # also check 5 on lines added since <sha>
  python3 tools-sitecheck.py --report out.md # also write a Markdown report

Exit code 1 when a problem is found. Uses only the Python standard library and node.
Folders that are not live pages (backups, previews, templates, build sources) are skipped.
"""
import argparse, json, os, re, subprocess, sys, tempfile
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent
SITE = "https://jskedge1.github.io/airshow-pages/"
SKIP_DIRS = {".git", ".github", "backups", "previews", "templates", "node_modules", "saved", "layouts-pt"}
SKIP_SUFFIX = "-src"  # build sources: train-routes-src, extras-src and the rest
JS_TYPES = {"", "text/javascript", "application/javascript", "module"}
JSON_TYPES = {"application/json", "application/ld+json", "importmap"}

SCRIPT_RE = re.compile(r"<script\b([^>]*)>(.*?)</script\s*>", re.S | re.I)
TAG_RE = re.compile(r"<[a-zA-Z][^<>]*>", re.S)
ATTR_RE = re.compile(r"""\s(href|src)\s*=\s*(["'])(.*?)\2""", re.I | re.S)
SITE_URL_RE = re.compile(re.escape(SITE) + r"""([^\s"'`<>)\\]*)""")
DASH_RE = re.compile("[\u2013\u2014]")  # en dash, em dash

# Known links to pages that are planned but not made yet, each switched off on its page.
# Remove a line once the page exists.
KNOWN_MISSING = {
    ("home.html", SITE + "journey-planner.html"),  # LINKS.plannerLive is false until the planner is uploaded
}


def live_files(suffixes):
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.endswith(SKIP_SUFFIX)]
        for f in filenames:
            if f.endswith(suffixes):
                yield Path(dirpath) / f


def rel(p):
    return str(Path(p).relative_to(ROOT))


def attr(attrs, name):
    m = re.search(r"\b" + name + r"""\s*=\s*(["']?)([^"'\s>]*)\1""", attrs, re.I)
    return m.group(2).strip().lower() if m else None


# ---------- 1 to 3: syntax ----------

NODE_CHECKER = r"""
const vm = require('vm'), fs = require('fs');
const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const bad = [];
for (const j of jobs) {
  const code = j.file ? fs.readFileSync(j.file, 'utf8') : j.code;
  try {
    if (j.module) new vm.SourceTextModule(code, { identifier: j.name });
    else new vm.Script(code.replace(/^#!.*/, ''), { filename: j.name });
  } catch (e) {
    if (j.module && !vm.SourceTextModule) continue;
    const where = (e.stack || '').split('\n')[0];
    bad.push({ name: j.name, error: String(e.message), where });
  }
}
process.stdout.write(JSON.stringify(bad));
"""


def check_syntax():
    problems, jobs = [], []
    for p in live_files((".js", ".mjs")):
        # Wix Velo code (velo/) uses import and export, so it is checked as a module
        jobs.append({"name": rel(p), "file": str(p), "module": p.suffix == ".mjs" or rel(p).startswith("velo/")})
    for p in live_files((".html",)):
        text = p.read_text(encoding="utf-8", errors="replace")
        for n, m in enumerate(SCRIPT_RE.finditer(text), 1):
            attrs, body = m.group(1), m.group(2)
            if attr(attrs, "src") is not None or not body.strip():
                continue
            typ = attr(attrs, "type") or ""
            line = text.count("\n", 0, m.start()) + 1
            name = f"{rel(p)} (inline script {n}, line {line})"
            if typ in JSON_TYPES:
                try:
                    json.loads(body)
                except ValueError as e:
                    problems.append(f"{name}: not valid JSON ({e})")
            elif typ in JS_TYPES:
                jobs.append({"name": name, "code": body, "module": typ == "module"})
    with tempfile.TemporaryDirectory() as tmp:
        jf, cf = Path(tmp, "jobs.json"), Path(tmp, "check.js")
        jf.write_text(json.dumps(jobs))
        cf.write_text(NODE_CHECKER)
        out = subprocess.run(["node", "--experimental-vm-modules", "--no-warnings", str(cf), str(jf)],
                             capture_output=True, text=True)
        if out.returncode != 0:
            problems.append("The script checker itself failed: " + out.stderr.strip()[:500])
        else:
            for b in json.loads(out.stdout or "[]"):
                problems.append(f"{b['name']}: script error: {b['error']}")
    for p in live_files((".json",)):
        try:
            json.loads(p.read_text(encoding="utf-8"))
        except ValueError as e:
            problems.append(f"{rel(p)}: not valid JSON ({e})")
    return problems, len(jobs)


# ---------- 4: links ----------

def target_exists(path):
    path = unquote(path.split("#")[0].split("?")[0])
    if path == "" or path.endswith("/"):
        path += "index.html"
    t = (ROOT / path).resolve()
    if ROOT not in t.parents and t != ROOT:
        return True  # points above the repository, not ours to check
    return t.exists() or (t.with_suffix(".html").exists() if not t.suffix else False)


def skip_ref(v):
    v = v.strip()
    return (not v or v.startswith(("#", "mailto:", "tel:", "data:", "javascript:", "blob:", "sms:", "about:"))
            or re.match(r"^[a-z][a-z0-9+.-]*:", v, re.I) or v.startswith("//")
            or any(c in v for c in "{}$+'\"<>` \\") or "(" in v)


def check_links():
    problems, seen = [], 0
    for p in live_files((".html", ".js")):
        text = p.read_text(encoding="utf-8", errors="replace")
        missing = set()
        for m in SITE_URL_RE.finditer(text):
            path = m.group(1)
            if any(c in path for c in "{}$+"):
                continue
            seen += 1
            if path.split("?")[0].endswith("/") or path == "":
                # a folder address, usually a prefix the code adds a file name to
                if (ROOT / unquote(path.split("?")[0])).is_dir():
                    continue
            if not target_exists(path):
                missing.add(SITE + path)
        if p.suffix == ".html":
            tags = " ".join(TAG_RE.findall(SCRIPT_RE.sub(" ", text)))
            for m in ATTR_RE.finditer(tags):
                v = m.group(3)
                if skip_ref(v):
                    continue
                seen += 1
                base = p.parent
                full = (base / v.split("#")[0].split("?")[0]) if not v.startswith("/") else None
                if full is None:
                    continue  # site root links belong to Wix, not this repository
                try:
                    path = str(full.resolve().relative_to(ROOT))
                except ValueError:
                    continue
                if v.split("#")[0].split("?")[0].endswith("/"):
                    path += "/"
                if not target_exists(path):
                    missing.add(v)
        for v in sorted(missing - {k[1] for k in KNOWN_MISSING if k[0] == rel(p)}):
            problems.append(f"{rel(p)}: links to a file that is not in the repository: {v}")
    return problems, seen


# ---------- 5: dashes in added text ----------

COMMENT_RES = [re.compile(r"/\*.*?\*/"), re.compile(r"<!--.*?-->"), re.compile(r"(^|\s)//.*$"),
               re.compile(r"^\s*(/\*|\*|<!--).*$")]


def strip_comments(s):
    """Visitors never see comments, so dashes there are fine."""
    for r in COMMENT_RES:
        s = r.sub(" ", s)
    return s


def check_dashes(base):
    problems = []
    diff = subprocess.run(["git", "diff", "--unified=0", "--no-color", base, "HEAD", "--",
                           "*.html", "*.js", "*.json"],
                          cwd=ROOT, capture_output=True, text=True)
    if diff.returncode != 0:
        return [f"Could not compare with {base[:7]} for the dash check: {diff.stderr.strip()[:300]}"]
    fname, lineno = None, 0
    for line in diff.stdout.splitlines():
        if line.startswith("+++ "):
            fname = line[6:] if line.startswith("+++ b/") else None
            if fname and (fname.split("/")[0] in SKIP_DIRS or any(
                    part.endswith(SKIP_SUFFIX) for part in fname.split("/")[:-1])
                    or fname.startswith("velo/backend/")):  # server code, never shown to visitors
                fname = None
        elif line.startswith("@@"):
            m = re.search(r"\+(\d+)", line)
            lineno = int(m.group(1)) if m else 0
        elif line.startswith("+") and fname:
            s = strip_comments(line[1:])
            for m in DASH_RE.finditer(s):
                snip = s[max(0, m.start() - 50): m.end() + 50].strip()
                problems.append(f"{fname} line {lineno}: dash in new text: …{snip}…")
                break
            lineno += 1
    return problems


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", help="commit to compare with for the dash check")
    ap.add_argument("--report", help="write a Markdown report here")
    a = ap.parse_args()

    sections = []
    syn, nscripts = check_syntax()
    sections.append(("Script and JSON errors", syn, f"{nscripts} scripts checked"))
    links, nlinks = check_links()
    sections.append(("Missing files", links, f"{nlinks} links checked"))
    if a.base:
        sections.append(("Dashes in new text", check_dashes(a.base), f"lines added since {a.base[:7]}"))

    total = sum(len(s[1]) for s in sections)
    out = []
    for title, probs, note in sections:
        out.append(f"### {title}: {'none' if not probs else len(probs)} ({note})")
        out += [f"- {p}" for p in probs[:200]]
        if len(probs) > 200:
            out.append(f"- and {len(probs) - 200} more")
        out.append("")
    text = "\n".join(out)
    print(text)
    if a.report:
        Path(a.report).write_text(text)
    print("Site check: " + ("all clear" if total == 0 else f"{total} problem(s) found"))
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
