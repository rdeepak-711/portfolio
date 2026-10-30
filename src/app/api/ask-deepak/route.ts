import { createAskHandler } from '@/lib/dee/handlers'
import { createClients } from '@/lib/dee/clients'
import { notifyDeepak } from '@/lib/dee/notify'

const clients = createClients()
const handler = createAskHandler({
  store: clients.store,
  save: clients.save,
  notify: (ask) => notifyDeepak(ask, { fetch, env: process.env }),
})

export const POST = handler
