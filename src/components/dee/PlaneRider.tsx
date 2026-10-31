import { useId } from 'react'
import { DeeBody } from './DeeFigure'

// Drawn nose-right in a 240×160 box; DeeFlight mirrors it to fly left.
// The plane is folded from a lined build-log page with a rust check on the wing.
export const PLANE_ASPECT = 160 / 240

const WING = '18,70 232,112 70,104'
const KEEL = '70,104 232,112 96,138'
const TEE = '#1c1c1f'
const SKIN = '#94603e'
const LINE = '#1b1a17'

function Plane({ clip }: { clip: string }) {
  return <>
    <polygon points={KEEL} fill="var(--color-line)" stroke={LINE} strokeWidth="3" strokeLinejoin="round"/>
    <clipPath id={clip}><polygon points={WING}/></clipPath>
    <polygon points={WING} fill="var(--color-paper)" stroke={LINE} strokeWidth="3" strokeLinejoin="round"/>
    <g clipPath={`url(#${clip})`} stroke="var(--color-line)" strokeWidth="1.5">
      {[1, 2, 3, 4].map((k) => <path key={k} d={`M18 ${70 + 6.5 * k}L232 ${112 + 6.5 * k}`}/>)}
    </g>
    <path d="M70 92l6 6 12-12" fill="none" stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </>
}

// Right arm raised from the shoulder; it waves when DeeFlight marks the figure settled
function WavingArm() {
  return <g className="dee-wave">
    <path d="M146 188c16-14 30-34 36-62" fill="none" stroke={TEE} strokeWidth="16" strokeLinecap="round"/>
    <path d="M168 160c6-10 11-22 14-34" fill="none" stroke={SKIN} strokeWidth="11" strokeLinecap="round"/>
    <circle cx="183" cy="120" r="9" fill={SKIN} stroke={LINE} strokeWidth="3"/>
  </g>
}

export function PlaneRider({ className = '' }: { className?: string }) {
  const clip = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 240 160" aria-hidden="true">
      {/* Dee sits in the fold: drawn first so the wing hides his lower half */}
      <g transform="translate(88 16) scale(.42)"><DeeBody/></g>
      <Plane clip={`w${clip}`}/>
      <g transform="translate(88 16) scale(.42)">
        <WavingArm/>
        {/* left hand holding the wing edge */}
        <circle cx="58" cy="196" r="9" fill={SKIN} stroke={LINE} strokeWidth="3"/>
      </g>
    </svg>
  )
}

// After landing: Dee stands beside the parked plane and waves
export function LandedDee({ className = '' }: { className?: string }) {
  const clip = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 240 160" aria-hidden="true">
      <g transform="translate(10 4) scale(.65)"><DeeBody/><WavingArm/></g>
      <g transform="translate(118 72) scale(.5)"><Plane clip={`l${clip}`}/></g>
    </svg>
  )
}
