import { describe, expect, it } from "vitest"
import buildTopic from "./buildTopic"

describe("buildTopic", () => {
  it("returns undefined when resourcePath is undefined", () => {
    expect(buildTopic(undefined)).toBeUndefined()
  })

  it("returns empty string when resourcePath is not a valid API IRI", () => {
    expect(buildTopic("baskets")).toBe("")
    expect(buildTopic("some/resource")).toBe("")
    expect(buildTopic("")).toBe("")
  })

  it("returns a topic URL with {id} placeholder when withId is false (default)", () => {
    const result = buildTopic("/api/baskets")
    expect(result).toContain("/api/baskets")
    expect(result).toContain("{id}")
  })

  it("returns a topic URL without {id} placeholder when withId is true", () => {
    const result = buildTopic(
      "/api/baskets/1ef70d90-7bab-6976-928f-e1fa89cd64d9",
      true
    )
    expect(result).toContain("/api/baskets/1ef70d90-7bab-6976-928f-e1fa89cd64d9")
    expect(result).not.toContain("{id}")
  })

  it("prepends the host to the IRI", () => {
    const result = buildTopic("/api/conversations")
    // In test environment (no browser), host is "http://localhost"
    expect(result).toMatch(/^http/)
    expect(result).toContain("/api/conversations")
  })
})
