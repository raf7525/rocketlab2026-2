/**
 * Cliente HTTP da API. Os caminhos são relativos a /api/v1: no `npm run dev` o Vite encaminha
 * /api para o FastAPI; no `npm run dev:mock` e nos testes, o MSW responde no lugar dele.
 */

const API_PREFIX = '/api/v1'

/** Envelope das listas paginadas. */
export type Page<T> = {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

/** Erro da API, já com uma mensagem que pode ser mostrada ao usuário. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  /** Envia um arquivo como o corpo da requisição, com o tipo dele no Content-Type. */
  upload: async <T>(path: string, file: File) =>
    request<T>('POST', path, await file.arrayBuffer(), file.type),
  delete: <T>(path: string) => request<T>('DELETE', path),
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  /** Tipo de um corpo binário (upload); sem ele, o corpo vai como JSON. */
  contentType?: string,
): Promise<T> {
  const binary = body instanceof ArrayBuffer
  const response = await fetch(new URL(API_PREFIX + path, window.location.origin), {
    method,
    headers:
      body === undefined ? undefined : { 'Content-Type': binary ? contentType! : 'application/json' },
    body: body === undefined || binary ? (body as BodyInit | undefined) : JSON.stringify(body),
  })
  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response))
  }
  // 204 No Content (ex.: remover um filme) não tem corpo.
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** O FastAPI responde `{"detail": "mensagem"}` nos erros de negócio e uma lista no 422. */
async function errorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null)
  const detail = (body as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return 'Confira os dados enviados e tente de novo.'
  return 'Não foi possível falar com o servidor. Tente de novo.'
}
