export type Confidence = 'verified' | 'confirmed' | 'self-reported'
export type Claim = { id: string; text: string; confidence: Confidence; sourceLabel: string; sourceUrl: string | null; public: boolean }
export type FaqEntry = { q: string; a: string; claimIds: string[] }
export type Mode = 'recruiter' | 'founder' | 'cto' | 'interviewer'
export type Pose = 'explain' | 'code' | 'check'
export type TourStop = { id: string; sectionId: string; pose: Pose; lines: string[]; claimIds: string[] }
export type GoldenCase = { id: string; kind: 'factual' | 'unknown' | 'adversarial' | 'tone'; mode: Mode; question: string; mustCite?: string[]; mustEscalate?: boolean; mustNotContain?: string[] }
