import { Middleware } from "openapi-fetch"
import { getClientConfig } from "@/config"

/**
 * Attaches what a JSON-LD API expects to every request: the bearer token when
 * a session is open, the scope header when the application uses one, and the
 * content type matching the method — `merge-patch+json` for PATCH, which
 * API Platform requires.
 */
export const apiMiddleWare: Middleware = {
  async onRequest({ request }) {
    const { getAuthToken, getScope } = getClientConfig()

    const token = getAuthToken()
    if (token) {
      request.headers.set("Authorization", "Bearer " + token)
    }

    if (request.method !== "DELETE") {
      request.headers.set("Content-Type", "application/ld+json")
    }

    if (request.method === "PATCH") {
      request.headers.set("Content-Type", "application/merge-patch+json")
    }

    const scope = getScope()
    if (scope) {
      request.headers.set("X-Scope", scope)
    }

    return request
  },
}
