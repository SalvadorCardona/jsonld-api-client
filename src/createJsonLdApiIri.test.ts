import { describe, expect, it } from "vitest"
import createJsonLdApiIri from "./createJsonLdApiIri"

describe("createJsonLdApiIri", () => {
  it("returns the resourceId unchanged when it is already an API IRI", () => {
    const iri = "/api/baskets/1ef70d90-7bab-6976-928f-e1fa89cd64d9"
    expect(createJsonLdApiIri(iri)).toBe(iri)
  })

  it("builds an IRI from a resource name and id", () => {
    const result = createJsonLdApiIri(
      "baskets",
      "1ef70d90-7bab-6976-928f-e1fa89cd64d9"
    )
    expect(result).toBe("/api/baskets/1ef70d90-7bab-6976-928f-e1fa89cd64d9")
  })

  it("does not double-prefix /api/ when resourceId starts with /api/", () => {
    const iri = "/api/calendar_events/abc-123"
    const result = createJsonLdApiIri(iri)
    expect(result).toEqual(iri)
    expect(result).not.toContain("/api/api/")
  })

  it("handles resource names with underscores", () => {
    const result = createJsonLdApiIri(
      "calendar_events",
      "1ef70d90-7bab-6976-928f-e1fa89cd64d9"
    )
    expect(result).toBe("/api/calendar_events/1ef70d90-7bab-6976-928f-e1fa89cd64d9")
  })
})
