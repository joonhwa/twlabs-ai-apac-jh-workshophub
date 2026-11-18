import { Router, IRouter, Request, Response } from 'express'
import { createRegistration, RegistrationInput } from '../services/registrationService'

type RegistrationParams = { id: string }

const router: IRouter = Router({ mergeParams: true })

router.post(
  '/',
  async (req: Request<RegistrationParams, unknown, RegistrationInput>, res: Response) => {
    try {
      const sessionId = parseInt(req.params.id, 10)
      const { name, email } = req.body

      const registration = await createRegistration(sessionId, { name, email })

      res.status(201).json(registration)
    } catch (error) {
      console.error('Error creating registration:', error)
      res.status(500).json({ error: 'Failed to create registration' })
    }
  }
)

export default router
