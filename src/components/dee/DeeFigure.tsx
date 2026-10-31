import type { Pose } from '@/content/dee/types'

export default function DeeFigure({ pose = 'explain', className = '' }: { pose?: Pose; className?: string }) {
  const label = pose === 'check' ? 'Dee checking a result' : pose === 'code' ? 'Dee at a keyboard' : 'Dee explaining'
  return (
    <svg className={`dee-figure ${className}`} viewBox="0 0 240 240" role="img" aria-label={label}>
      {pose === 'check' && <g transform="translate(160 46)"><rect width="70" height="56" rx="8" fill="var(--color-ink)" stroke="#1b1a17" strokeWidth="3"/><path d="M9 14h38M9 26h52M9 38h27" stroke="var(--color-muted)" strokeWidth="5" strokeLinecap="round"/><circle cx="56" cy="44" r="10" fill="var(--color-accent)"/><path d="m51 44 4 4 7-8" fill="none" stroke="var(--color-paper)" strokeWidth="3" strokeLinecap="round"/></g>}
      {pose === 'explain' && <g transform="translate(168 30)" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2"><rect y="0" width="38" height="22" rx="6"/><rect y="50" width="38" height="22" rx="6"/><rect y="100" width="38" height="22" rx="6"/><path d="M18 23v25M18 73v25" fill="none" strokeDasharray="4 4"/></g>}
      {pose === 'code' && <g><rect x="146" y="56" width="88" height="70" rx="6" fill="var(--color-ink)" stroke="#1b1a17" strokeWidth="3"/><path d="M154 72h31M154 86h54M154 100h37" stroke="var(--color-muted)" strokeWidth="5" strokeLinecap="round"/><rect x="174" y="126" width="28" height="16" fill="var(--color-line)"/><rect x="160" y="142" width="56" height="6" rx="3" fill="var(--color-muted)"/><rect x="18" y="204" width="140" height="30" rx="6" fill="var(--color-line)" stroke="var(--color-ink)" strokeWidth="3"/><path d="M32 214h12m7 0h12m7 0h12m-50 11h16m8 0h28" stroke="var(--color-muted)" strokeWidth="4" strokeLinecap="round"/></g>}
      <DeeBody/>
      {pose === 'check' ? <g><path d="M146 196c16-10 22-28 24-46" fill="none" stroke="#1c1c1f" strokeWidth="16" strokeLinecap="round"/><path d="M160 177c6-10 8-18 10-27" fill="none" stroke="#94603e" strokeWidth="11" strokeLinecap="round"/><circle cx="172" cy="144" r="8" fill="#94603e" stroke="#1b1a17" strokeWidth="3"/><circle cx="186" cy="94" r="20" fill="var(--color-paper)" fillOpacity=".3" stroke="#1b1a17" strokeWidth="5"/></g> : pose === 'code' ? <g><path d="M40 192 52 208m92-16-12 16" stroke="#1c1c1f" strokeWidth="15" strokeLinecap="round"/><path d="m50 205 12 8m60-8-12 8" stroke="#94603e" strokeWidth="11" strokeLinecap="round"/></g> : <g><path d="m62 222 26-16m50 16-26-16" stroke="#1c1c1f" strokeWidth="15" strokeLinecap="round"/><path d="m78 214 14-10m46 10-14-10" stroke="#94603e" strokeWidth="11" strokeLinecap="round"/></g>}
    </svg>
  )
}

// Black tee, warm skin, stubble, dark frames and wavy hair keep Dee recognisable.
// Shared by the standing figure and the plane rider, in the same 240×240 drawing space.
export function DeeBody() {
  return <>
    <path d="M44 240c0-54 24-80 56-82 32 2 56 28 56 82z" fill="#1c1c1f" stroke="#1b1a17" strokeWidth="4"/>
    <path d="M92 144h16v18q-8 5-16 0z" fill="#94603e"/>
    <path d="M84 160q16 14 32 0" fill="none" stroke="#34343a" strokeWidth="4"/>
    <ellipse cx="54" cy="92" rx="7" ry="11" fill="#94603e" stroke="#1b1a17" strokeWidth="3"/><ellipse cx="146" cy="92" rx="7" ry="11" fill="#94603e" stroke="#1b1a17" strokeWidth="3"/>
    <path d="M56 80c0-28 20-42 44-42s44 14 44 42v24c0 28-20 44-44 44s-44-16-44-44z" fill="#94603e" stroke="#1b1a17" strokeWidth="4"/>
    <path d="M58 101c3 29 20 43 42 43s39-14 42-43c-5 21-17 32-42 32s-37-11-42-32" fill="#3a2719" opacity=".45"/>
    <path d="M50 84c-7-24 4-48 24-54 8-12 26-14 36-8 14-6 32 2 36 16 12 6 12 28 4 46-4-16-10-26-18-30-4 8-15 9-24 2-8 8-22 8-30 0-7 8-18 8-24 2-5 7-9 15-10 26z" fill="#17110d" stroke="#1b1a17" strokeWidth="3"/>
    <path d="M74 88q6-6 12 0m28 0q6-6 12 0M70 76q10-4 20 0m20 0q10-4 20 0" fill="none" stroke="#120d0a" strokeWidth="3.5" strokeLinecap="round"/>
    <rect x="64" y="78" width="32" height="22" rx="7" fill="rgba(255,255,255,.12)" stroke="#16130f" strokeWidth="4"/><rect x="104" y="78" width="32" height="22" rx="7" fill="rgba(255,255,255,.12)" stroke="#16130f" strokeWidth="4"/><path d="M96 86q4-3 8 0M64 84 54 82m82 2 10-2" fill="none" stroke="#16130f" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M99 98q-3 8 2 10m-16 9q15 14 30 0" fill="none" stroke="#3a2719" strokeWidth="3" strokeLinecap="round"/>
  </>
}
