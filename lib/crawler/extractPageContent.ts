import * as cheerio from "cheerio";
import type { CrawledPage } from "@/types/audit";

export function extractPageContent(url: string, html: string): CrawledPage {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();

  const title = $("title").first().text().trim();
  const metaDescription = $('meta[name="description"]').attr("content")?.trim();
  const h1 = $("h1").first().text().replace(/\s+/g, " ").trim();
  const h2 = $("h2")
    .map((_, element) => $(element).text().replace(/\s+/g, " ").trim())
    .get()
    .filter(Boolean)
    .slice(0, 20);
  const schemaJson = $('script[type="application/ld+json"]')
    .map((_, element) => {
      const text = $(element).text();
      try {
        return JSON.parse(text) as unknown;
      } catch {
        return null;
      }
    })
    .get()
    .filter(Boolean);
  const textContent = $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);

  return {
    url,
    title,
    meta_description: metaDescription,
    h1,
    h2,
    text_content: textContent,
    schema_json: schemaJson,
    word_count: textContent ? textContent.split(/\s+/).length : 0,
  };
}

export function extractInternalLinks(baseUrl: string, html: string) {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const keywords = [
    "about",
    "product",
    "products",
    "service",
    "oem",
    "odm",
    "quality",
    "certification",
    "certificates",
    "faq",
    "contact",
    "blog",
  ];

  const links = $("a[href]")
    .map((_, element) => $(element).attr("href"))
    .get()
    .filter(Boolean)
    .map((href) => {
      try {
        return new URL(href, base).toString();
      } catch {
        return "";
      }
    })
    .filter((href) => {
      if (!href) return false;
      const url = new URL(href);
      return url.origin === base.origin;
    });

  const unique = Array.from(new Set(links));
  return unique
    .sort((a, b) => {
      const aScore = keywords.some((keyword) => a.toLowerCase().includes(keyword)) ? 0 : 1;
      const bScore = keywords.some((keyword) => b.toLowerCase().includes(keyword)) ? 0 : 1;
      return aScore - bScore;
    })
    .slice(0, 14);
}
