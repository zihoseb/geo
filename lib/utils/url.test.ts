import { describe, expect, it } from "vitest";
import { isPrivateOrLocalUrl, isValidHttpUrl } from "./url";

describe("url safety helpers", () => {
  it("accepts public http and https URLs", () => {
    expect(isValidHttpUrl("https://example.com")).toBe(true);
    expect(isValidHttpUrl("http://example.com/products")).toBe(true);
  });

  it("rejects invalid and non-http URLs", () => {
    expect(isValidHttpUrl("not a url")).toBe(false);
    expect(isValidHttpUrl("ftp://example.com")).toBe(false);
    expect(isValidHttpUrl("file:///etc/passwd")).toBe(false);
  });

  it("flags local and private URLs", () => {
    expect(isPrivateOrLocalUrl("http://localhost:3000")).toBe(true);
    expect(isPrivateOrLocalUrl("http://127.0.0.1")).toBe(true);
    expect(isPrivateOrLocalUrl("http://0.0.0.0")).toBe(true);
    expect(isPrivateOrLocalUrl("http://10.0.0.5")).toBe(true);
    expect(isPrivateOrLocalUrl("http://172.16.4.1")).toBe(true);
    expect(isPrivateOrLocalUrl("http://172.31.255.1")).toBe(true);
    expect(isPrivateOrLocalUrl("http://192.168.1.20")).toBe(true);
    expect(isPrivateOrLocalUrl("http://printer.local")).toBe(true);
  });

  it("does not flag public domains or public IPs as private", () => {
    expect(isPrivateOrLocalUrl("https://example.com")).toBe(false);
    expect(isPrivateOrLocalUrl("http://8.8.8.8")).toBe(false);
    expect(isPrivateOrLocalUrl("http://172.32.0.1")).toBe(false);
  });
});
