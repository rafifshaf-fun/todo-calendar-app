// jest-dom matchers are imported per-test-file
// because @testing-library/jest-dom requires expect() to be available

// Polyfill Request/Response for Next.js API route tests in jsdom
if (typeof globalThis.Request === "undefined") {
  // @ts-expect-error - Request polyfill for jsdom
  globalThis.Request = class {
    url: string;
    method: string;
    headers: Headers;
    private bodyStr: string;
    constructor(input: string | URL, init?: { method?: string; headers?: Record<string, string>; body?: string }) {
      this.url = typeof input === "string" ? input : input.toString();
      this.method = init?.method || "GET";
      this.headers = new Headers(init?.headers);
      this.bodyStr = init?.body || "";
    }
    async json() {
      return JSON.parse(this.bodyStr || "{}");
    }
    text() {
      return Promise.resolve(this.bodyStr);
    }
  } as unknown as typeof Request;
}

if (typeof globalThis.Response === "undefined") {
  // @ts-expect-error - Response polyfill for jsdom
  globalThis.Response = class {
    status: number;
    statusText: string;
    headers: Headers;
    private body: unknown;
    constructor(body: unknown, init?: { status?: number; statusText?: string; headers?: Record<string, string> }) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || "";
      this.headers = new Headers(init?.headers);
    }
    async json() {
      return typeof this.body === "string" ? JSON.parse(this.body) : this.body;
    }
  } as unknown as typeof Response;
}

if (typeof globalThis.Headers === "undefined") {
  // @ts-expect-error - Headers polyfill for jsdom
  globalThis.Headers = class {
    private map = new Map<string, string>();
    constructor(init?: Record<string, string>) {
      if (init) {
        for (const [k, v] of Object.entries(init)) {
          this.map.set(k.toLowerCase(), v);
        }
      }
    }
    get(key: string) { return this.map.get(key.toLowerCase()) || null; }
    set(key: string, value: string) { this.map.set(key.toLowerCase(), value); }
  } as unknown as typeof Headers;
}
