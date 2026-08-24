import { JsonLdCollection } from "jsonld-item"
import { BaseJsonLdItemInterface } from "jsonld-item"

export interface ApiJsonLdCollection extends JsonLdCollection {
  view?: {
    "@id"?: string
    "@type"?: string
    first?: string
    last?: string
    next?: string
  }
  search?: {
    "@type": string
    template: string
    variableRepresentation: string
    mapping: {
      "@type": string
      variable: string
      property: string | null
      required: boolean
    }[]
  }
}

export interface ApiResponse<T = unknown> {
  status: number
  statusText: string
  url: string
  data: T
}

export interface ApiJsonLdError extends BaseJsonLdItemInterface {
  readonly title?: string | null
  readonly detail?: string | null
  /**
   * @default 400
   * @example 404
   */
  status: number
  /** @description A URI reference that identifies the specific occurrence of the problem. It may or may not yield further information if dereferenced. */
  readonly instance?: string | null
  /** @description A URI reference that identifies the problem type */
  readonly type?: string
  readonly description?: string | null
  readonly violations?: {
    /** @description The property path of the violation */
    propertyPath?: string
    /** @description The message associated with the violation */
    message?: string
  }[]
}
