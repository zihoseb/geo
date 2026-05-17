# B2B AI Visibility Audit MVP Design

## Goal

Build a working MVP for a B2B AI search visibility audit tool. A user can enter a brand, website, industry, products, buyer profile, and competitors; run an audit; and view a shareable report showing AI mention visibility, competitor visibility, website content gaps, technical SEO basics, and a 30-day action plan.

The app must work locally without external credentials through a demo fallback path, while keeping production-shaped adapters for Supabase, OpenAI, and Perplexity.

## Scope

The MVP includes:

- Landing page with SaaS tool positioning and pricing preview.
- Audit project creation form at `/audit/new`.
- Project status page at `/audit/[projectId]`.
- Report page at `/audit/[projectId]/report`.
- API routes for project creation, audit start, and report retrieval.
- Buyer query generation.
- AI search result collection through Perplexity when configured, demo answers otherwise.
- Mention analysis through OpenAI when configured, rule-based/demo analysis otherwise.
- Safe website crawling through `fetch` and `cheerio` when possible, demo page content otherwise.
- Score calculation and report JSON generation.
- Supabase schema with RLS policies.
- Local demo store fallback when Supabase env vars are missing.

The MVP excludes:

- Paid subscription checkout.
- Team permissions.
- Long-term trend charts.
- Automated Google AI Overview scraping.
- Large-scale crawling.
- Gray-hat SEO automation.
- Guaranteed ranking/recommendation claims.

## Architecture

Use Next.js App Router with TypeScript, Tailwind CSS, and shadcn-style component primitives. The app will keep UI, analysis, AI, crawler, and persistence concerns separated so the demo path and production path share the same route handlers and report UI.

Persistence goes through a small store abstraction. If Supabase credentials are available, API routes use Supabase service-role access. If credentials are missing, API routes use an in-memory demo store for the current dev process.

AI and crawler integrations follow the same pattern. OpenAI and Perplexity clients expose stable functions and fall back to deterministic demo responses when API keys are unavailable or when a provider call fails in demo mode. Website crawling validates URLs to avoid SSRF, disallows private/local addresses, fetches up to 15 pages, and extracts basic metadata and text.

## User Flow

1. User opens the landing page.
2. User clicks `Run Free Audit`.
3. User fills the audit form.
4. `POST /api/projects` creates a project and competitors.
5. The browser navigates to `/audit/[projectId]`.
6. The status page calls `POST /api/audit/start`.
7. The audit route generates queries, runs AI search/analysis, crawls the website, scores the result, stores the report, and marks the project completed.
8. The status page links or redirects to `/audit/[projectId]/report`.
9. The report page loads data and displays the full audit.

## UI Design

Visual style is clean white-background SaaS software: restrained color, clear tables, compact score cards, and practical report sections. The first screen is the real product entry point, not a decorative marketing-only page.

Primary pages:

- Landing page: header, hero, how it works, sample report preview, use cases, pricing preview, FAQ.
- New audit page: focused form with brand, website, industry, target market, products, buyer type, and three competitor rows.
- Audit status page: progress states matching the audit pipeline, friendly error state, link to report on completion.
- Report page: executive score cards, brand mention analysis, query-level results table, website content gaps, recommended pages, and 30-day action plan.

## Data Model

The database follows the supplied development document:

- `profiles`
- `projects`
- `competitors`
- `audit_queries`
- `ai_results`
- `crawled_pages`
- `audit_reports`

TypeScript domain types live in `types/audit.ts`, `types/project.ts`, and `types/report.ts`.

## Demo Fallback

Demo fallback is a first-class MVP behavior, not a visual placeholder. When environment variables are missing:

- Project and report data are stored in memory.
- Buyer queries are generated from deterministic templates using the user inputs.
- AI search answers are simulated with target brand and competitor mentions distributed across queries.
- Mention analysis combines deterministic answer content with rule-based brand matching.
- Website crawling returns a synthetic crawled page based on the submitted website and industry if live crawling is unavailable.
- The final report remains realistic and clearly avoids guaranteed ranking claims.

## Error Handling And Security

The app handles:

- Invalid URLs.
- Disallowed local/private URLs.
- Website crawl failures.
- AI provider failures.
- JSON parse failures.
- Missing project/report records.
- Failed audit states.

Crawler safety rules:

- Allow only `http:` and `https:`.
- Block `localhost`, loopback, private IP ranges, `.local`, `file://`, and `ftp://`.
- Limit pages, text length per page, and total analysis text.
- Do not execute website scripts.

## Testing

Automated tests focus on core non-UI behavior:

- URL validation and SSRF guards.
- Brand normalization and mention extraction.
- Competitor mention extraction.
- Technical score and visibility score calculations.
- Demo query/report generation invariants.

Manual/browser verification covers:

- Landing page renders.
- Audit form submits.
- Demo audit completes without provider credentials.
- Report page displays scores, tables, gaps, recommended pages, and action plan.
- Responsive layout works on desktop and mobile widths.

## Acceptance Criteria

The MVP is accepted when:

- The app starts locally.
- A user can create an audit without external API credentials.
- The audit completes through the demo fallback path.
- A report page renders meaningful audit data.
- Core analysis tests pass.
- Build/lint checks pass or any environment limitation is clearly reported.
- Supabase schema and env example are included for production setup.
