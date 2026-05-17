import type { CrawledPage } from "@/types/audit";
import { isPrivateOrLocalUrl, isValidHttpUrl } from "@/lib/utils/url";
import { extractInternalLinks, extractPageContent } from "./extractPageContent";

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "B2B-AI-Visibility-Audit/0.1",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Could not fetch ${url}: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    throw new Error(`URL did not return HTML: ${url}`);
  }

  return response.text();
}

export async function crawlWebsite(inputUrl: string): Promise<CrawledPage[]> {
  if (!isValidHttpUrl(inputUrl) || isPrivateOrLocalUrl(inputUrl)) {
    throw new Error("This URL is not allowed for crawling.");
  }

  const homeHtml = await fetchHtml(inputUrl);
  const links = extractInternalLinks(inputUrl, homeHtml);
  const urls = [inputUrl, ...links].slice(0, 15);
  const pages: CrawledPage[] = [extractPageContent(inputUrl, homeHtml)];

  for (const url of urls.slice(1)) {
    try {
      const html = await fetchHtml(url);
      pages.push(extractPageContent(url, html));
    } catch {
      // Ignore failed secondary pages in the MVP crawler.
    }
  }

  return pages;
}
