import { createAnswerHandler } from '@/lib/dee/handlers'
import { createClients } from '@/lib/dee/clients'

const clients = createClients()

export const POST = createAnswerHandler({ store: clients.store, answerSecret: process.env.DEE_ANSWER_SECRET, saveAnswer: clients.saveAnswer })
