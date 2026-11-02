// Dee sometimes offers to pass a question on without flagging the answer for escalation,
// which hides the "Ask Deepak" button. Any reply that makes the offer must show the button.
const OFFER = /\b(pass|send|forward|hand)\b[^.?!]{0,60}\b(to|on to)\s+(Deepak|him)\b/i

export function offersToForward(text: string): boolean {
  return OFFER.test(text)
}

// The fixed sentence for a fact Deepak hasn't given Dee, matching UrDee's wording
export const NOT_TOLD_YET = "He hasn't told me that yet, so I won't guess."
