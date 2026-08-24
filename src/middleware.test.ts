import { beforeEach, describe, expect, it } from "vitest"
import { apiMiddleWare } from "@/middleware"
import { configureClient } from "@/config"

/** Runs the middleware over a request and hands back the headers it set. */
const headersFor = async (method: string): Promise<Headers> => {
  const request = new Request("https://api.example.com/articles", { method })
  const result = await apiMiddleWare.onRequest!({
    request,
    schemaPath: "/articles",
    params: {},
    id: "test",
    options: {} as never,
  })
  return (result as Request).headers
}

describe("apiMiddleWare", () => {
  beforeEach(() => {
    configureClient({ getAuthToken: () => undefined, getScope: () => undefined })
  })

  it("sends no Authorization header when nobody is signed in", async () => {
    expect((await headersFor("GET")).get("Authorization")).toBeNull()
  })

  it("carries the bearer token once a session is open", async () => {
    configureClient({ getAuthToken: () => "a-token" })
    expect((await headersFor("GET")).get("Authorization")).toBe("Bearer a-token")
  })

  it("omits the scope header when the application defines none", async () => {
    expect((await headersFor("GET")).get("X-Scope")).toBeNull()
  })

  it("sends the scope header when one is configured", async () => {
    configureClient({ getScope: () => "admin" })
    expect((await headersFor("GET")).get("X-Scope")).toBe("admin")
  })

  it("uses the JSON-LD content type by default", async () => {
    expect((await headersFor("POST")).get("Content-Type")).toBe(
      "application/ld+json"
    )
  })

  it("switches to merge-patch on PATCH, as API Platform requires", async () => {
    expect((await headersFor("PATCH")).get("Content-Type")).toBe(
      "application/merge-patch+json"
    )
  })

  it("sets no content type on DELETE, which carries no body", async () => {
    expect((await headersFor("DELETE")).get("Content-Type")).toBeNull()
  })

  it("reads the token on every request rather than capturing it once", async () => {
    // A token refreshed mid-session must reach the next request; caching the
    // value at configuration time would keep sending the stale one.
    let token = "first"
    configureClient({ getAuthToken: () => token })
    expect((await headersFor("GET")).get("Authorization")).toBe("Bearer first")

    token = "second"
    expect((await headersFor("GET")).get("Authorization")).toBe("Bearer second")
  })
})
