# B2B AI Visibility Audit MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-runnable Next.js MVP for a B2B AI visibility audit tool with production-shaped OpenAI, Perplexity, Supabase, crawler, report, and demo fallback paths.

**Architecture:** Create a focused Next.js App Router app. Keep core business logic in testable `lib/*` modules, route handlers as orchestration, and UI components as presentation only. Use an in-memory store when Supabase env vars are absent so the app works immediately.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Vitest, Testing Library, Cheerio, OpenAI SDK, Supabase JS, lucide-react.

---

## File Structure

- Create `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `vitest.setup.ts`, `.gitignore`, `.env.local.example`.
- Create `app/layout.tsx`, `app/globals.css`, `app/(marketing)/page.tsx`, `app/page.tsx`.
- Create `app/audit/new/page.tsx`, `app/audit/[projectId]/page.tsx`, `app/audit/[projectId]/report/page.tsx`.
- Create `app/api/projects/route.ts`, `app/api/audit/start/route.ts`, `app/api/audit/[projectId]/report/route.ts`.
- Create `components/audit/AuditForm.tsx`, `components/audit/AuditProgress.tsx`, `components/audit/ReportView.tsx`.
- Create `components/landing/Hero.tsx`, `components/landing/HowItWorks.tsx`, `components/landing/UseCases.tsx`, `components/landing/PricingPreview.tsx`, `components/landing/Faq.tsx`.
- Create `components/ui/Button.tsx`, `components/ui/Card.tsx`, `components/ui/Input.tsx`, `components/ui/Textarea.tsx`, `components/ui/Badge.tsx`, `components/ui/Table.tsx`.
- Create `lib/utils/cn.ts`, `lib/utils/url.ts`, `lib/utils/url.test.ts`.
- Create `lib/analysis/extractMentions.ts`, `lib/analysis/extractMentions.test.ts`, `lib/analysis/scoreVisibility.ts`, `lib/analysis/scoreVisibility.test.ts`, `lib/analysis/generateReportJson.ts`, `lib/analysis/generateReportJson.test.ts`.
- Create `lib/ai/prompts.ts`, `lib/ai/openai.ts`, `lib/ai/perplexity.ts`, `lib/ai/demo.ts`.
- Create `lib/crawler/extractPageContent.ts`, `lib/crawler/crawlWebsite.ts`.
- Create `lib/store/types.ts`, `lib/store/memoryStore.ts`, `lib/store/supabaseStore.ts`, `lib/store/index.ts`.
- Create `lib/audit/runAudit.ts`.
- Create `lib/sample/sampleReport.ts`.
- Create `types/audit.ts`, `types/project.ts`, `types/report.ts`.
- Create `supabase/schema.sql`.

## Task 1: Scaffold Project

- [ ] Add package/config files for Next.js, Tailwind, Vitest, ESLint, TypeScript, gitignore, and env example.
- [ ] Run `npm install`.
- [ ] Run `npm run typecheck` and expect framework setup errors only if dependencies are still missing.

## Task 2: Write Core Failing Tests

- [ ] Add URL tests covering valid HTTP URLs, invalid values, localhost, loopback, private IPv4 ranges, `.local`, `file://`, and `ftp://`.
- [ ] Add mention extraction tests covering exact match, case-insensitive match, punctuation/space normalization, no-match, and competitor extraction.
- [ ] Add score tests covering mention-rate score thresholds, technical score components, and final score weighting.
- [ ] Add report generation tests covering summary counts, competitor rates, missing content, recommended pages, and action plan presence.
- [ ] Run `npm test -- --run` and verify tests fail because implementation files are not complete.

## Task 3: Implement Core Logic

- [ ] Implement `lib/utils/url.ts`.
- [ ] Implement `lib/analysis/extractMentions.ts`.
- [ ] Implement `lib/analysis/scoreVisibility.ts`.
- [ ] Implement `lib/analysis/generateReportJson.ts`.
- [ ] Run `npm test -- --run` and verify tests pass.

## Task 4: Add Domain Types And Providers

- [ ] Add `types/audit.ts`, `types/project.ts`, and `types/report.ts`.
- [ ] Add prompts in `lib/ai/prompts.ts`.
- [ ] Add OpenAI JSON helper with `safeJsonParse` and deterministic fallback behavior when no key is present.
- [ ] Add Perplexity helper with deterministic fallback behavior when no key is present.
- [ ] Add demo query, answer, website audit, and report helpers in `lib/ai/demo.ts`.

## Task 5: Add Store And Audit Orchestration

- [ ] Add store interfaces in `lib/store/types.ts`.
- [ ] Add process-local memory store in `lib/store/memoryStore.ts`.
- [ ] Add Supabase store adapter in `lib/store/supabaseStore.ts`.
- [ ] Add store selector in `lib/store/index.ts`.
- [ ] Add website extraction and crawler modules with SSRF guards and crawl limits.
- [ ] Add `lib/audit/runAudit.ts` orchestration for statuses, query generation, AI search, mention analysis, crawl, scoring, report storage, and failure handling.

## Task 6: Add API Routes

- [ ] Implement `POST /api/projects`.
- [ ] Implement `POST /api/audit/start`.
- [ ] Implement `GET /api/audit/[projectId]/report`.
- [ ] Ensure demo fallback works without Supabase, OpenAI, or Perplexity env vars.

## Task 7: Build UI

- [ ] Add global CSS and small UI primitives.
- [ ] Build landing sections and route pages.
- [ ] Build audit form with three competitor rows.
- [ ] Build audit progress page that starts the audit and links to the report.
- [ ] Build report view with score cards, brand analysis, query table, content gaps, recommended pages, and 30-day action plan.
- [ ] Add sample report data for the landing preview.

## Task 8: Add Supabase Schema

- [ ] Add `supabase/schema.sql` with all required tables and RLS policies from the dev document.

## Task 9: Verify

- [ ] Run `npm test -- --run`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Start local dev server.
- [ ] Use browser verification on desktop and mobile widths: landing page, audit form, demo audit completion, report page.
- [ ] Fix any build, runtime, console, layout, or mobile issues found.

## Self-Review

- The plan covers the approved design: landing, audit form, API, demo fallback, providers, crawler, scoring, report, Supabase schema, and verification.
- There are no deferred features inside the MVP acceptance path.
- Test-first applies to core analysis/security logic before production implementations.
