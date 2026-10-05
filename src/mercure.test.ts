import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  buildMercureUrl,
  clientMercure,
  isTopicPattern,
  uriTemplateToUrlPattern,
} from "@/mercure"
import { configureClient } from "@/config"
import buildTopic from "@/buildTopic"

/** Records how each EventSource was opened; jsdom ships none. */
class FakeEventSource {
  static instances: FakeEventSource[] = []
  constructor(
    public url: URL | string,
    public init?: EventSourceInit
  ) {
    FakeEventSource.instances.push(this)
  }
  close() {}
}

describe("uriTemplateToUrlPattern", () => {
  it("turns URI Template variables into URL Pattern groups", () => {
    expect(uriTemplateToUrlPattern("https://example.com/books/{id}")).toBe(
      "https://example.com/books/:id"
    )
    expect(uriTemplateToUrlPattern("https://example.com/{shelf}/books/{id}")).toBe(
      "https://example.com/:shelf/books/:id"
    )
  })

  it("leaves an exact topic untouched", () => {
    expect(uriTemplateToUrlPattern("https://example.com/books/1")).toBe(
      "https://example.com/books/1"
    )
  })
})

describe("isTopicPattern", () => {
  it("recognises URI Templates and URL Patterns", () => {
    expect(isTopicPattern("https://example.com/books/{id}")).toBe(true)
    expect(isTopicPattern("https://example.com/books/:id")).toBe(true)
  })

  it("treats a plain URL, port included, as an exact topic", () => {
    expect(isTopicPattern("https://example.com/books/1")).toBe(false)
    expect(isTopicPattern("http://localhost:8080/books/1")).toBe(false)
  })
})

describe("buildMercureUrl", () => {
  beforeEach(() => {
    configureClient({
      baseUrl: "https://api.example.com",
      mercurePath: "/.well-known/mercure",
      mercureProtocol: "1.0",
    })
  })

  it("subscribes to an exact topic with match= in 1.0", () => {
    const url = buildMercureUrl("https://api.example.com/api/books/1")
    expect(url.origin + url.pathname).toBe(
      "https://api.example.com/.well-known/mercure"
    )
    expect([...url.searchParams]).toEqual([
      ["match", "https://api.example.com/api/books/1"],
    ])
  })

  it("subscribes to a pattern with match_urlpattern= in 1.0", () => {
    const url = buildMercureUrl(buildTopic("/api/books")!)
    expect([...url.searchParams]).toEqual([
      ["match_urlpattern", "https://api.example.com/api/books/:id"],
    ])
  })

  it("defaults to the 1.0 protocol", async () => {
    vi.resetModules()
    const { getClientConfig } = await import("@/config")
    expect(getClientConfig().mercureProtocol).toBe("1.0")
  })

  it("keeps topic= and the URI Template in 0.x", () => {
    configureClient({ mercureProtocol: "0.x" })
    const url = buildMercureUrl(buildTopic("/api/books")!)
    expect([...url.searchParams]).toEqual([
      ["topic", "https://api.example.com/api/books/{id}"],
    ])
  })
})

describe("clientMercure", () => {
  beforeEach(() => {
    FakeEventSource.instances = []
    vi.stubGlobal("EventSource", FakeEventSource)
    configureClient({ baseUrl: "https://api.example.com", mercureProtocol: "1.0" })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("sends the hub's cookie in 1.0", () => {
    clientMercure("https://api.example.com/api/books/1")
    const [source] = FakeEventSource.instances
    expect(String(source.url)).toContain("match=")
    expect(source.init).toEqual({ withCredentials: true })
  })

  it("opens the EventSource as before in 0.x", () => {
    configureClient({ mercureProtocol: "0.x" })
    clientMercure("https://api.example.com/api/books/1")
    const [source] = FakeEventSource.instances
    expect(String(source.url)).toContain("topic=")
    expect(source.init).toEqual({ withCredentials: false })
  })
})
