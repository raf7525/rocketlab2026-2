import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '../../test/mocks/server'
import { api, ApiError } from './api'

describe('api', () => {
  it('devolve o JSON da resposta', async () => {
    server.use(http.get('/api/v1/teste', () => HttpResponse.json({ ok: true })))

    await expect(api.get('/teste')).resolves.toEqual({ ok: true })
  })

  it('envia o corpo como JSON', async () => {
    let body: unknown
    server.use(
      http.post('/api/v1/teste', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({}, { status: 201 })
      }),
    )

    await api.post('/teste', { nota: 8 })

    expect(body).toEqual({ nota: 8 })
  })

  it('usa a mensagem do backend nos erros', async () => {
    server.use(
      http.get('/api/v1/teste', () =>
        HttpResponse.json({ detail: 'Filme não encontrado.' }, { status: 404 }),
      ),
    )

    const error = await api.get('/teste').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, message: 'Filme não encontrado.' })
  })

  it('troca a lista de erros de validação (422) por uma mensagem em português', async () => {
    server.use(
      http.get('/api/v1/teste', () =>
        HttpResponse.json(
          { detail: [{ loc: ['body', 'nota'], msg: 'Input should be less than or equal to 10' }] },
          { status: 422 },
        ),
      ),
    )

    await expect(api.get('/teste')).rejects.toMatchObject({
      status: 422,
      message: 'Confira os dados enviados e tente de novo.',
    })
  })

  it('tem uma mensagem padrão quando o servidor não responde JSON', async () => {
    server.use(http.get('/api/v1/teste', () => new HttpResponse('erro', { status: 500 })))

    await expect(api.get('/teste')).rejects.toMatchObject({
      status: 500,
      message: 'Não foi possível falar com o servidor. Tente de novo.',
    })
  })
})
