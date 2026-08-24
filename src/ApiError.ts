import { ApiJsonLdError, ApiResponse } from "@/apiPlatform"

export class ApiError extends Error {
  constructor(public response: ApiResponse<ApiJsonLdError>) {
    super(response.statusText)
    this.response = response
  }
}
