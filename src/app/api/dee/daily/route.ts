import { createDailyHandler } from '@/lib/dee/handlers'
import { createClients } from '@/lib/dee/clients'
import { DAILY_QUESTIONS } from '@/content/dee/daily-questions'

const clients = createClients()

// Called by Vercel Cron (vercel.json), once a day at 09:00 IST
export const GET = createDailyHandler({
  cronSecret: process.env.CRON_SECRET,
  answerSecret: process.env.DEE_ANSWER_SECRET,
  siteUrl: 'https://rdeepak.vercel.app',
  recentAskQuestions: clients.recentAskQuestions,
  recentChats: clients.recentChats,
  askedIds: clients.askedIds,
  markAsked: clients.markAsked,
  emailDeepak: clients.emailDeepak,
  bank: DAILY_QUESTIONS,
})
