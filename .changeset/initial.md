---
"jsonld-api-client": minor
---

Initial release: a typed client for JSON-LD / Hydra APIs — openapi-fetch with
the auth, scope and content-type headers such an API expects, an IRI cache, and
Mercure subscriptions.

The base URL, the bearer token and the scope come from `configureClient` rather
than from imports, so the package stays unaware of the application hosting it
and of how its session is stored. Covered by 24 tests.
