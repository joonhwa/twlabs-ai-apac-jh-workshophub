import request from 'supertest'
import app from '../../src/app'

interface SessionSummary {
  id: number
  capacity: number
  registered: number
}

const uniqueEmail = (label: string): string =>
  `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@example.com`

const findSessionWithRoom = async (seatsNeeded: number): Promise<SessionSummary> => {
  const response = await request(app).get('/api/training-sessions')
  expect(response.status).toBe(200)
  const sessions = response.body as SessionSummary[]
  const session = sessions.find((s) => s.capacity - s.registered >= seatsNeeded)
  if (!session) {
    throw new Error(`No seeded training session has ${seatsNeeded} free seat(s); run make reset-db`)
  }
  return session
}

const getRegisteredCount = async (id: number): Promise<number> => {
  const response = await request(app).get(`/api/training-sessions/${id}`)
  expect(response.status).toBe(200)
  return (response.body as SessionSummary).registered
}

describe('POST /api/training-sessions/:id/registrations', () => {
  it('returns 201 with the registration details', async () => {
    const session = await findSessionWithRoom(1)
    const payload = { name: 'Ada Lovelace', email: uniqueEmail('ada') }

    const response = await request(app)
      .post(`/api/training-sessions/${session.id}/registrations`)
      .send(payload)

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject(payload)
  })

  it('increments the session registered count by 1', async () => {
    const session = await findSessionWithRoom(1)
    const before = await getRegisteredCount(session.id)

    const response = await request(app)
      .post(`/api/training-sessions/${session.id}/registrations`)
      .send({ name: 'Grace Hopper', email: uniqueEmail('grace') })
    expect(response.status).toBe(201)

    const after = await getRegisteredCount(session.id)
    expect(after).toBe(before + 1)
  })

  it('increments the registered count once per registration when requests run concurrently', async () => {
    const concurrent = 3
    const session = await findSessionWithRoom(concurrent)
    const before = await getRegisteredCount(session.id)

    const responses = await Promise.all(
      Array.from({ length: concurrent }, (_, i) =>
        request(app)
          .post(`/api/training-sessions/${session.id}/registrations`)
          .send({ name: `Concurrent Attendee ${i}`, email: uniqueEmail(`concurrent-${i}`) })
      )
    )

    responses.forEach((response) => expect(response.status).toBe(201))
    const after = await getRegisteredCount(session.id)
    expect(after).toBe(before + concurrent)
  })
})
