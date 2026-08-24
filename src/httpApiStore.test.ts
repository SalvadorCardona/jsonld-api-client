import { beforeEach, describe, expect, it, vi } from "vitest"
import genericClient from "@/client"
import {
  fetchDataFromApiPlatform,
  getDataFromApiPlatform,
  removeDataFromApiPlatform,
} from "./httpApiStore"

vi.mock("@/client", () => ({
  default: {
    GET: vi.fn(),
  },
}))

describe("apiPlatFormStore", () => {
  beforeEach(() => {
    removeDataFromApiPlatform("/api/test/1")
    removeDataFromApiPlatform("/api/test/2")
    vi.clearAllMocks()
  })

  describe("getDataFromApiPlatform", () => {
    it("returns undefined for unknown IRI", () => {
      const result = getDataFromApiPlatform("/api/unknown/999")
      expect(result).toBeUndefined()
    })

    it("returns cached data after fetch", async () => {
      const mockData = { "@id": "/api/test/1", "@type": "Test", id: "1" }
      vi.mocked(genericClient.GET).mockResolvedValueOnce({
        data: mockData,
        error: undefined,
        response: new Response(),
      })

      await fetchDataFromApiPlatform("/api/test/1")

      const result = getDataFromApiPlatform("/api/test/1")
      expect(result).toEqual(mockData)
    })
  })

  describe("removeDataFromApiPlatform", () => {
    it("removes data from the store", async () => {
      const mockData = { "@id": "/api/test/2", "@type": "Test", id: "2" }
      vi.mocked(genericClient.GET).mockResolvedValueOnce({
        data: mockData,
        error: undefined,
        response: new Response(),
      })

      await fetchDataFromApiPlatform("/api/test/2")
      expect(getDataFromApiPlatform("/api/test/2")).toEqual(mockData)

      removeDataFromApiPlatform("/api/test/2")
      expect(getDataFromApiPlatform("/api/test/2")).toBeUndefined()
    })

    it("does not throw when removing non-existent IRI", () => {
      expect(() => removeDataFromApiPlatform("/api/nonexistent/999")).not.toThrow()
    })
  })

  describe("fetchDataFromApiPlatform", () => {
    it("fetches and caches data from the API", async () => {
      const mockData = { "@id": "/api/test/1", "@type": "Test", id: "1" }
      vi.mocked(genericClient.GET).mockResolvedValueOnce({
        data: mockData,
        error: undefined,
        response: new Response(),
      })

      const result = await fetchDataFromApiPlatform("/api/test/1")

      expect(result).toEqual(mockData)
      expect(genericClient.GET).toHaveBeenCalledWith("/api/test/1", {})
    })

    it("returns cached data without fetching again for same IRI", async () => {
      const mockData = { "@id": "/api/test/1", "@type": "Test", id: "1" }
      vi.mocked(genericClient.GET).mockResolvedValueOnce({
        data: mockData,
        error: undefined,
        response: new Response(),
      })

      await fetchDataFromApiPlatform("/api/test/1")
      await fetchDataFromApiPlatform("/api/test/1")

      expect(genericClient.GET).toHaveBeenCalledTimes(1)
    })

    it("deduplicates concurrent requests for the same IRI", async () => {
      const mockData = { "@id": "/api/test/1", "@type": "Test", id: "1" }
      vi.mocked(genericClient.GET).mockResolvedValueOnce({
        data: mockData,
        error: undefined,
        response: new Response(),
      })

      removeDataFromApiPlatform("/api/test/1")

      const [result1, result2] = await Promise.all([
        fetchDataFromApiPlatform("/api/test/1"),
        fetchDataFromApiPlatform("/api/test/1"),
      ])

      expect(genericClient.GET).toHaveBeenCalledTimes(1)
      expect(result1).toEqual(mockData)
      expect(result2).toEqual(mockData)
    })
  })
})
