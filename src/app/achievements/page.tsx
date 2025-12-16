import Achievements from '@/components/Achievements'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Achievements | Portfolio',
  description: 'Professional achievements, awards, and milestones highlighting growth, impact, and craftsmanship.'
}

export default function AchievementsPage() {
  return <Achievements />
}
