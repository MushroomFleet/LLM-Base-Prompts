# SEO, Metadata & AI-Friendly Discovery Plan — White Label

> **TINS Document** — There Is No Source
> Universal implementation blueprint for search engine optimization, structured metadata,
> and AI/LLM discovery files. Designed to be applied to **any static HTML website** by
> Claude Code in a single pass. The operator provides a site directory; the plan discovers
> everything else automatically.

---

## Table of Contents

1. [Operator Instructions](#1-operator-instructions)
2. [Discovery Phase — Automated Site Audit](#2-discovery-phase--automated-site-audit)
3. [Phase 1 — Enhanced HTML Metadata](#3-phase-1--enhanced-html-metadata)
4. [Phase 2 — Sitemap for Search Crawlers](#4-phase-2--sitemap-for-search-crawlers)
5. [Phase 3 — robots.txt with AI Crawler Directives](#5-phase-3--robotstxt-with-ai-crawler-directives)
6. [Phase 4 — llms.txt for AI Discovery](#6-phase-4--llmstxt-for-ai-discovery)
7. [Phase 5 — JSON-LD Structured Data](#7-phase-5--json-ld-structured-data)
8. [Phase 6 — llms-full.txt Extended Context](#8-phase-6--llms-fulltxt-extended-context)
9. [Phase 7 — Security.txt (RFC 9116)](#9-phase-7--securitytxt-rfc-9116)
10. [Phase 8 — humans.txt](#10-phase-8--humanstxt)
11. [Configuration Reference](#11-configuration-reference)
12. [Implementation Order](#12-implementation-order)
13. [Verification Checklist](#13-verification-checklist)

---

## 1. Operator Instructions

### 1.1 How to Use This Plan

This plan is executed by Claude Code (or any capable AI coding agent) in a **single pass**. The operator provides minimal configuration and the agent discovers the rest.

**Invocation — paste this into Claude Code along with this plan:**

```
Apply the SEO-metadata-AI-friendly-plan to my website.

Site directory: {path-to-web-root}
Base URL: {deployment-url}
```

**Example:**

```
Apply the SEO-metadata-AI-friendly-plan to my website.

Site directory: ./web
Base URL: https://example.github.io/my-project
```

### 1.2 Required Inputs (from operator)

| Input | Description | Example |
|-------|-------------|---------|
| `SITE_DIR` | Path to the web root directory | `./web`, `./public`, `./dist` |
| `BASE_URL` | Deployment URL (no trailing slash) | `https://example.com` |

### 1.3 Optional Inputs (auto-detected if absent)

| Input | Description | Fallback |
|-------|-------------|----------|
| `SITE_NAME` | Human-readable site name | Extracted from index.html `<title>` |
| `SITE_DESC` | One-line description | Extracted from index.html `<meta description>` |
| `AUTHOR_NAME` | Person or organization name | Extracted from existing `<meta author>` or "Site Author" |
| `AUTHOR_URL` | Author's URL | Extracted from existing links or omitted |
| `THEME_COLOR` | Hex color for browser chrome | Extracted from CSS or `#333333` |
| `TWITTER_HANDLE` | Twitter/X handle | Omitted if not found |
| `CONTACT_URL` | Security contact URL or email | GitHub issues URL if detectable, else omitted |
| `LOCALE` | OG locale | `en_US` |
| `SUPPORT_URL` | Ko-fi, Patreon, or donation link | Omitted if not found |

---

## 2. Discovery Phase — Automated Site Audit

Before any files are created or modified, the agent MUST perform a full site audit. This is the foundation of the single-pass approach — all subsequent phases use the discovery output.

### 2.1 Directory Scan

```bash
# Enumerate all HTML files recursively under SITE_DIR
find ${SITE_DIR} -name "*.html" -type f | sort
```

Store the result as `ALL_PAGES[]` — an ordered list of every HTML file path relative to `SITE_DIR`.

### 2.2 Page Classification

For each page in `ALL_PAGES[]`, read the file and extract:

| Field | Source | Required |
|-------|--------|----------|
| `rel_path` | File path relative to `SITE_DIR` | Yes |
| `title` | Content of `<title>` tag | Yes |
| `description` | Content of `<meta name="description">` | Yes |
| `og_title` | `<meta property="og:title">` if present | No |
| `og_desc` | `<meta property="og:description">` if present | No |
| `og_type` | `<meta property="og:type">` if present | No |
| `og_image` | `<meta property="og:image">` if present | No |
| `canonical` | `<link rel="canonical">` if present | No |
| `has_jsonld` | Whether a `<script type="application/ld+json">` exists | No |
| `keywords` | `<meta name="keywords">` if present | No |
| `author` | `<meta name="author">` if present | No |
| `twitter_card` | `<meta name="twitter:card">` if present | No |
| `theme_color` | `<meta name="theme-color">` if present | No |

Then classify each page into one of these roles:

| Role | Detection Heuristic |
|------|-------------------|
| `index` | File is `index.html` at the site root |
| `collection` | Page links to 3+ sibling pages AND is not the index. Typically found in directories like `/collections/`, `/categories/`, `/topics/` |
| `detail` | A leaf page — not the index and not a collection. These are the individual content pages |
| `utility` | Pages like `404.html`, `search.html`, `about.html` that are structural, not content |

Store the result as `PAGE_REGISTRY[]` — this is the master data structure used by every phase.

### 2.3 Site Identity Extraction

From the index page and any available pages, infer:

```
SITE_NAME     ← operator-provided OR <title> of index.html (cleaned of " | Home" etc.)
SITE_DESC     ← operator-provided OR <meta description> of index.html
AUTHOR_NAME   ← operator-provided OR <meta author> from any page OR git config user.name
AUTHOR_URL    ← operator-provided OR first GitHub/personal URL found in page content
THEME_COLOR   ← operator-provided OR existing <meta theme-color> OR dominant accent from CSS
TWITTER_HANDLE← operator-provided OR <meta twitter:site> from any page
CONTACT_URL   ← operator-provided OR GitHub issues URL if repo detectable
```

### 2.4 Content Grouping (for llms.txt)

Group the `detail` pages by directory structure:

```
GROUPS = {
  "collections/building-principles/" → [page1, page2, ...],
  "skills/"                          → [page3, page4, ...],
  "blog/"                            → [page5, page6, ...],
  ...
}
```

If the site has collection pages, use them as group headers. If not, group by parent directory. If all pages are flat (single directory), create a single "Pages" group.

### 2.5 Existing Asset Check

Before creating any new file, check if it already exists:

```bash
# Check for existing SEO/discovery files
for f in sitemap.xml robots.txt llms.txt llms-full.txt security.txt humans.txt; do
  [ -f "${SITE_DIR}/${f}" ] && echo "EXISTS: ${f}"
done
```

If a file exists, the agent should **merge or enhance** rather than overwrite, preserving any custom content while adding missing elements.

### 2.6 Discovery Output

The agent MUST produce an internal summary before proceeding (printed to stdout, not saved as a file):

```
=== SITE AUDIT COMPLETE ===
Site Name:    {SITE_NAME}
Description:  {SITE_DESC}
Author:       {AUTHOR_NAME}
Pages Found:  {count}
  - Index:      {count}
  - Collections:{count}
  - Detail:     {count}
  - Utility:    {count}
Existing Files: {list of already-present SEO files}
Proceeding with Phases 1-8...
```

---

## 3. Phase 1 — Enhanced HTML Metadata

### 3.1 Metadata Injection Rules

For **every** page in `PAGE_REGISTRY[]`, ensure the following meta tags exist inside `<head>`. If a tag already exists with correct content, skip it. If it exists with incorrect/incomplete content, update it. If it's missing, add it.

**Add after existing meta tags (or after `<head>` if none exist):**

#### All Pages — Universal Tags

```html
  <!-- Canonical URL -->
  <link rel="canonical" href="{BASE_URL}/{rel_path}">

  <!-- Open Graph -->
  <meta property="og:url" content="{BASE_URL}/{rel_path}">
  <meta property="og:site_name" content="{SITE_NAME}">
  <meta property="og:locale" content="{LOCALE}">

  <!-- Theme color for browser UI -->
  <meta name="theme-color" content="{THEME_COLOR}">

  <!-- Robots directive -->
  <meta name="robots" content="index, follow">
```

#### Index Page — Additional Tags

```html
  <meta property="og:type" content="website">
  <meta name="author" content="{AUTHOR_NAME}">
```

If keywords can be inferred from the site content, add:

```html
  <meta name="keywords" content="{auto-generated comma-separated keywords}">
```

If `TWITTER_HANDLE` is available:

```html
  <meta name="twitter:site" content="@{TWITTER_HANDLE}">
```

#### Collection Pages

```html
  <meta property="og:type" content="website">
```

#### Detail Pages

```html
  <meta property="og:type" content="article">
```

#### Utility Pages (404, search, etc.)

```html
  <meta name="robots" content="noindex, follow">
```

### 3.2 Injection Method

The agent should:

1. Read each HTML file
2. Identify the `<head>` section
3. Parse which target tags already exist
4. Inject only the missing tags, grouped with a comment marker:

```html
  <!-- SEO Enhancement — auto-generated -->
  {injected tags here}
  <!-- /SEO Enhancement -->
```

This marker enables future re-runs to identify and update previously injected content.

---

## 4. Phase 2 — Sitemap for Search Crawlers

### 4.1 Specification

- Format: XML Sitemap Protocol 0.9
- Omit `<priority>` and `<changefreq>` (Google ignores them)
- `<lastmod>` uses `YYYY-MM-DD` format — use today's date for all pages
- Maximum 50,000 URLs per sitemap (if exceeded, create a sitemap index — unlikely for most static sites)
- Exclude utility pages (404, search) from the sitemap

### 4.2 Generate `{SITE_DIR}/sitemap.xml`

Build programmatically from `PAGE_REGISTRY[]`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{for each page in PAGE_REGISTRY where role != "utility":}
  <url>
    <loc>{BASE_URL}/{rel_path}</loc>
    <lastmod>{TODAY_DATE}</lastmod>
  </url>
{end for}
</urlset>
```

**Ordering:** Index first, then collection pages, then detail pages (alphabetically within each group).

---

## 5. Phase 3 — robots.txt with AI Crawler Directives

### 5.1 Known AI Crawlers (2026)

| Crawler | Operator | Purpose |
|---------|----------|---------|
| GPTBot | OpenAI | ChatGPT training/search |
| OAI-SearchBot | OpenAI | ChatGPT search |
| ClaudeBot | Anthropic | Claude training |
| Claude-SearchBot | Anthropic | Claude search |
| PerplexityBot | Perplexity AI | AI search |
| Google-Extended | Google | Gemini training |
| Applebot-Extended | Apple | Apple Intelligence |
| CCBot | Common Crawl | Open dataset (used by many AI) |
| Bytespider | ByteDance | TikTok AI |
| Amazonbot | Amazon | Alexa AI |
| FacebookBot | Meta | Meta AI |
| cohere-ai | Cohere | Cohere models |

### 5.2 Generate `{SITE_DIR}/robots.txt`

```
# {SITE_NAME}
# Auto-generated SEO & AI discovery configuration

# Welcome all crawlers — this is a public site
User-agent: *
Allow: /

# Sitemap location
Sitemap: {BASE_URL}/sitemap.xml

# AI/LLM discovery files
# llms.txt: {BASE_URL}/llms.txt
# llms-full.txt: {BASE_URL}/llms-full.txt
```

**Note:** `robots.txt` must be served from the site root. If the site is deployed in a subdirectory, the hosting platform must handle this. GitHub Pages serves it from the repo root automatically.

---

## 6. Phase 4 — llms.txt for AI Discovery

### 6.1 Specification

The `llms.txt` standard (v1.1.0, January 2026) provides a structured markdown file at the site root to help AI systems understand a website. Format:

```
# Title (H1)
> Blockquote description
Optional body paragraph
## Section headers with markdown links
```

### 6.2 Generate `{SITE_DIR}/llms.txt`

Build from `PAGE_REGISTRY[]` and the content grouping from Discovery Phase:

```markdown
# {SITE_NAME}

> {SITE_DESC}

{Optional: 1-2 sentence body paragraph summarizing what the site offers, synthesized from page descriptions}

{For each GROUP in GROUPS:}
## {Group Name}

{Optional: 1-sentence group description derived from the collection page's meta description, if a collection page exists for this group}

{For each page in group:}
- [{page.title}]({BASE_URL}/{page.rel_path}): {page.description — truncated to ~120 chars}
{end for}

{end for}

## Links

- [{SITE_NAME}]({BASE_URL}/index.html): Homepage
{If AUTHOR_URL:}- [{AUTHOR_NAME}]({AUTHOR_URL}): Author
{end if}
```

### 6.3 Content Quality Rules

- Each link description should be a single sentence, max ~150 characters
- Descriptions come from each page's `<meta description>` — if too long, the agent should intelligently truncate
- Group headers should be human-readable (convert directory names like `building-principles` → `Building Principles`)
- If a page has no description, the agent should generate one from the page's `<title>` and `<h1>`

---

## 7. Phase 5 — JSON-LD Structured Data

### 7.1 Schema Selection

| Page Role | Schema Type | Notes |
|-----------|-------------|-------|
| `index` | `WebSite` | Enables sitelinks in search |
| `collection` | `CollectionPage` | Groups child pages |
| `detail` | `Article` | Individual content pages |
| `utility` | None | No structured data needed |

### 7.2 Index Page — WebSite Schema

Add before `</head>` in the index page:

```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "{SITE_NAME}",
    "description": "{SITE_DESC}",
    "url": "{BASE_URL}/index.html",
    "author": {
      "@type": "{AUTHOR_TYPE}",
      "name": "{AUTHOR_NAME}"
      {if AUTHOR_URL:},"url": "{AUTHOR_URL}"{end if}
    }
  }
  </script>
```

Where `AUTHOR_TYPE` is `"Person"` or `"Organization"` — infer from the author name (if it looks like a company/org name, use Organization; otherwise Person).

### 7.3 Collection Pages — CollectionPage Schema

```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "{page.title}",
    "description": "{page.description}",
    "url": "{BASE_URL}/{page.rel_path}",
    "isPartOf": {
      "@type": "WebSite",
      "name": "{SITE_NAME}",
      "url": "{BASE_URL}/index.html"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "{SITE_NAME}", "item": "{BASE_URL}/index.html" },
        { "@type": "ListItem", "position": 2, "name": "{page.title}" }
      ]
    }
  }
  </script>
```

### 7.4 Detail Pages — Article Schema

```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "{page.title}",
    "description": "{page.description}",
    "url": "{BASE_URL}/{page.rel_path}",
    "author": {
      "@type": "{AUTHOR_TYPE}",
      "name": "{AUTHOR_NAME}"
      {if AUTHOR_URL:},"url": "{AUTHOR_URL}"{end if}
    },
    "mainEntityOfPage": "{BASE_URL}/{page.rel_path}",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "{SITE_NAME}", "item": "{BASE_URL}/index.html" },
        {if page has parent collection:}
        { "@type": "ListItem", "position": 2, "name": "{collection.title}", "item": "{BASE_URL}/{collection.rel_path}" },
        { "@type": "ListItem", "position": 3, "name": "{page.title}" }
        {else:}
        { "@type": "ListItem", "position": 2, "name": "{page.title}" }
        {end if}
      ]
    }
  }
  </script>
```

### 7.5 JSON-LD Injection Rules

- If a page already has JSON-LD, check its `@type` — if it matches what we'd inject, skip it. If it differs or is incomplete, replace it.
- All JSON-LD blocks should be wrapped with a comment marker for idempotent re-runs:

```html
  <!-- JSON-LD Structured Data — auto-generated -->
  <script type="application/ld+json">
  ...
  </script>
  <!-- /JSON-LD -->
```

---

## 8. Phase 6 — llms-full.txt Extended Context

### 8.1 Purpose

The `llms-full.txt` file is an optional companion to `llms.txt` that provides extended context for AI systems that request deeper understanding. While `llms.txt` is a concise directory, `llms-full.txt` includes longer descriptions, key features, and metadata for each page.

### 8.2 Generate `{SITE_DIR}/llms-full.txt`

Build from `PAGE_REGISTRY[]` with enhanced extraction:

```markdown
# {SITE_NAME} — Full Reference

> {Extended site description — 2-3 sentences synthesized from index page content, expanding on SITE_DESC}

{For each GROUP in GROUPS:}
---

## {Group Name}

{Group description — from collection page meta description or synthesized from member pages}

{For each page in group:}
### {page.title}
- **URL:** {BASE_URL}/{page.rel_path}
{if page has external links (GitHub etc.):}- **Source:** {first relevant external URL found in page content}
{end if}
- **Description:** {page.description — full length, not truncated}
{if extractable from page content:}- **Key Features:** {Summarized from h2/h3 headings or key content on the page}
{end if}
{if page.keywords:}- **Tags:** {page.keywords}
{end if}

{end for}
{end for}
```

### 8.3 Content Extraction for Full Text

For each detail page, the agent should:

1. Read the full page HTML
2. Extract all `<h2>` and `<h3>` headings as a feature list
3. Extract any links to external resources (GitHub repos, documentation, etc.)
4. If the page has substantial body text, summarize the key capabilities in 2-3 bullet points
5. Include any keywords/tags from meta tags

---

## 9. Phase 7 — Security.txt (RFC 9116)

### 9.1 Purpose

`security.txt` is a standard (RFC 9116) for websites to communicate security contact information. Recommended by CISA. Placed at `/.well-known/security.txt` (with a redirect from `/security.txt`). For a static site without `.well-known` directory support, place it at the site root.

### 9.2 Generate `{SITE_DIR}/security.txt`

```
# {SITE_NAME} — Security Contact
# https://securitytxt.org/

{if CONTACT_URL:}Contact: {CONTACT_URL}{end if}
{if CONTACT_URL is missing:}Contact: {AUTHOR_URL or BASE_URL}{end if}
Preferred-Languages: en
Canonical: {BASE_URL}/security.txt
Expires: {ONE_YEAR_FROM_TODAY in ISO 8601 format, e.g. 2027-02-15T00:00:00.000Z}
```

**Note:** Update the `Expires` date annually. RFC 9116 requires it to be no more than one year in the future.

---

## 10. Phase 8 — humans.txt

### 10.1 Purpose

`humans.txt` is a lightweight standard for crediting the people behind a website. It's for humans visiting `/humans.txt`.

### 10.2 Generate `{SITE_DIR}/humans.txt`

```
/* TEAM */
Creator: {AUTHOR_NAME}
{if AUTHOR_URL:}Site: {AUTHOR_URL}{end if}
{if SUPPORT_URL:}Support: {SUPPORT_URL}{end if}

/* SITE */
Last update: {TODAY_DATE}
Standards: HTML5, CSS3
Software: Claude Code
Doctype: HTML5
Components: {page_count} Pages

/* THANKS */
SEO Plan: SEO-metadata-AI-friendly-plan (White Label)
```

The agent should enhance the `/* SITE */` section with any additional tech detected during discovery (e.g., if React/Tailwind/specific frameworks are found in the HTML, list them).

---

## 11. Configuration Reference

### 11.1 Placeholder Summary

All placeholders used throughout this plan. The agent resolves these during the Discovery Phase.

| Placeholder | Source | Description |
|-------------|--------|-------------|
| `{SITE_DIR}` | Operator input | Path to web root |
| `{BASE_URL}` | Operator input | Deployment URL, no trailing slash |
| `{SITE_NAME}` | Auto-detected or operator | Site name |
| `{SITE_DESC}` | Auto-detected or operator | Site description |
| `{AUTHOR_NAME}` | Auto-detected or operator | Author name |
| `{AUTHOR_URL}` | Auto-detected or operator | Author URL |
| `{AUTHOR_TYPE}` | Auto-inferred | `Person` or `Organization` |
| `{THEME_COLOR}` | Auto-detected or operator | Hex color |
| `{TWITTER_HANDLE}` | Auto-detected or operator | Twitter/X handle |
| `{CONTACT_URL}` | Auto-detected or operator | Security contact |
| `{LOCALE}` | Default `en_US` or operator | OG locale |
| `{SUPPORT_URL}` | Auto-detected or operator | Donation/support link |
| `{TODAY_DATE}` | Runtime | `YYYY-MM-DD` format |
| `{ONE_YEAR_FROM_TODAY}` | Runtime | ISO 8601 datetime |
| `{rel_path}` | Per-page from `PAGE_REGISTRY` | File path relative to `SITE_DIR` |

### 11.2 Comment Markers

All injected content uses comment markers for idempotent re-runs:

```html
<!-- SEO Enhancement — auto-generated -->
...
<!-- /SEO Enhancement -->

<!-- JSON-LD Structured Data — auto-generated -->
...
<!-- /JSON-LD -->
```

On subsequent runs, the agent should detect these markers and **replace** the content between them rather than duplicating.

---

## 12. Implementation Order

The agent executes these steps in order, in a **single pass**:

### Step 0: Discovery
1. Scan `SITE_DIR` for all HTML files
2. Extract metadata from each page → build `PAGE_REGISTRY[]`
3. Classify pages (index, collection, detail, utility)
4. Resolve all configuration placeholders
5. Check for existing SEO files
6. Print audit summary

### Step 1: Create root-level discovery files
1. Generate `sitemap.xml` from `PAGE_REGISTRY[]`
2. Generate `robots.txt` referencing sitemap
3. Generate `llms.txt` with concise directory
4. Generate `llms-full.txt` with extended descriptions
5. Generate `security.txt` with contact info
6. Generate `humans.txt` with credits

### Step 2: Enhance index page metadata
1. Inject missing meta tags (canonical, OG, theme-color, keywords, author, robots)
2. Add JSON-LD `WebSite` structured data

### Step 3: Enhance collection page metadata
1. Inject missing meta tags per collection page
2. Add JSON-LD `CollectionPage` structured data

### Step 4: Enhance detail page metadata (batch)
1. Inject missing meta tags per detail page
2. Add JSON-LD `Article` structured data with per-page values

### Step 5: Validate
1. Confirm `sitemap.xml` is well-formed XML with correct URL count
2. Confirm JSON-LD is valid JSON in every page
3. Confirm `robots.txt` references the sitemap
4. Confirm `llms.txt` has links for every non-utility page
5. Print final summary

---

## 13. Verification Checklist

After execution, all of the following should be true:

- [ ] `{SITE_DIR}/sitemap.xml` exists with one `<url>` per non-utility page
- [ ] `{SITE_DIR}/robots.txt` exists with `Allow: /` and `Sitemap:` directive
- [ ] `{SITE_DIR}/llms.txt` exists with H1, blockquote, and links for all content pages
- [ ] `{SITE_DIR}/llms-full.txt` exists with extended descriptions for all content pages
- [ ] `{SITE_DIR}/security.txt` exists with Contact and Expires fields
- [ ] `{SITE_DIR}/humans.txt` exists with creator and site info
- [ ] Index page has canonical, OG url, theme-color, author, JSON-LD `WebSite`
- [ ] All collection pages have OG tags, JSON-LD `CollectionPage`
- [ ] All detail pages have OG url/site_name/type, theme-color, JSON-LD `Article`
- [ ] Utility pages have `noindex, follow` robots directive
- [ ] No `{BASE_URL}`, `{SITE_NAME}`, or other unresolved placeholders remain in any file
- [ ] All JSON-LD blocks are valid JSON
- [ ] `sitemap.xml` is well-formed XML
- [ ] Comment markers are present around all injected content (idempotent re-run safe)
- [ ] No existing content was destroyed — only enhanced

---

## Appendix A — Adapting for Non-Static Sites

This plan targets static HTML sites. For other site types, the agent should adapt:

| Site Type | Adaptation |
|-----------|-----------|
| **Single-Page App (SPA)** | Generate a pre-rendered sitemap based on route definitions. Meta tags may need to go into server-side rendering config or a meta-tags framework. |
| **Static Site Generator (Hugo, Jekyll, 11ty)** | Inject templates rather than raw HTML. Create sitemap via the SSG's built-in sitemap plugin if available. |
| **Server-rendered (Next.js, Nuxt)** | Modify layout components and head configuration files rather than individual HTML pages. |
| **WordPress/CMS** | Recommend plugins (Yoast, RankMath) rather than direct file manipulation. Generate `llms.txt` and `llms-full.txt` as standalone files. |

## Appendix B — Re-Run Behavior

This plan is designed to be **idempotent**. Running it again on the same site should:

1. Detect existing comment markers and replace auto-generated content
2. Pick up new pages added since the last run
3. Update `sitemap.xml` with new pages
4. Update `llms.txt` and `llms-full.txt` with new pages
5. Refresh `<lastmod>` dates and `security.txt` expiry
6. Leave all manually-added content untouched

---

*White-label plan derived from the MushroomFleet Skills Directory SEO implementation. Applicable to any static HTML website. Designed for single-pass execution by Claude Code or equivalent AI coding agent.*
