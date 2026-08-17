import type { AdSkin } from '@/lib/ads/ad-frame'

export const adSkin: AdSkin = {
  radius: '0px',
  border: '1px solid rgba(225,18,53,0.18)',
  shadow: '0 8px 30px rgba(0,0,0,0.25)',
  background: '#16060c',
  labelClassName: 'bg-[#e11235] text-[#fff4f5]',
}

export const adSkinBySlot: Partial<Record<string, AdSkin>> = {
  sidebar: { radius: '0px', shadow: 'none', border: '1px solid rgba(225,18,53,0.12)' },
  popup: { radius: '0px' },
  header: { radius: '0px', background: '#0a0206' },
  rail: { radius: '0px' },
  feature: { radius: '0px' },
  interstitial: { radius: '0px', shadow: '0 20px 60px rgba(0,0,0,0.6)' },
  anchor: { radius: '0px', shadow: '0 6px 24px rgba(0,0,0,0.35)' },
}

export function skinFor(slot: string): AdSkin {
  return { ...adSkin, ...(adSkinBySlot[slot] ?? {}) }
}
