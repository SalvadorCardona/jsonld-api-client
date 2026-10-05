import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useMercure } from "@/useClientMercure"
import { configureClient } from "@/config"

class FakeEventSource {
  static instances: FakeEventSource[] = []
  onmessage: ((event: MessageEvent<string>) => void) | null = null
  onerror: (() => void) | null = null
  closed = false
  constructor(
    public url: URL | string,
    public init?: EventSourceInit
  ) {
    FakeEventSource.instances.push(this)
  }
  close() {
    this.closed = true
  }
}

describe("useMercure", () => {
  beforeEach(() => {
    FakeEventSource.instances = []
    vi.stubGlobal("EventSource", FakeEventSource)
    configureClient({ baseUrl: "https://api.example.com", mercureProtocol: "1.0" })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("subscribes with the 1.0 protocol and exposes the parsed update", () => {
    const { result, unmount } = renderHook(() =>
      useMercure<{ id: number }>("https://api.example.com/api/books/{id}")
    )
    const [source] = FakeEventSource.instances
    expect(new URL(String(source.url)).searchParams.get("match_urlpattern")).toBe(
      "https://api.example.com/api/books/:id"
    )
    expect(source.init).toEqual({ withCredentials: true })

    act(() => {
      source.onmessage!(new MessageEvent("message", { data: '{"id":1}' }))
    })
    expect(result.current.data).toEqual({ id: 1 })

    unmount()
    expect(source.closed).toBe(true)
  })

  it("opens nothing without a topic", () => {
    renderHook(() => useMercure(undefined))
    expect(FakeEventSource.instances).toHaveLength(0)
  })
})
