import { createDeeHandler } from '@/lib/dee/handlers'
import { createClients } from '@/lib/dee/clients'
import { MODEL_PRICES } from '@/lib/dee/budget'

const clients = createClients()
const handler = createDeeHandler({ ...clients, price: MODEL_PRICES })

export const POST = handler
