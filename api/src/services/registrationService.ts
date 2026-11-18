import type { Registration } from '@prisma/client'
import prisma from '../lib/prisma'

export interface RegistrationInput {
  name: string
  email: string
}

/**
 * Registers an attendee for a training session.
 *
 * The registration insert and the session's `registered` increment run in a
 * single transaction, and the increment is an atomic `UPDATE ... SET
 * registered = registered + 1`, so concurrent registrations can never lose
 * an update or leave the count out of sync with the registration rows.
 */
export async function createRegistration(
  trainingSessionId: number,
  input: RegistrationInput
): Promise<Registration> {
  const [registration] = await prisma.$transaction([
    prisma.registration.create({
      data: {
        name: input.name,
        email: input.email,
        trainingSessionId,
      },
    }),
    prisma.trainingSession.update({
      where: { id: trainingSessionId },
      data: { registered: { increment: 1 } },
    }),
  ])

  return registration
}
