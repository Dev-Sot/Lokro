import type { Metadata } from 'next'
import { HomeClient } from './HomeClient'

export const metadata: Metadata = { title: 'Inicio' }

export default function HomePage() {
  return <HomeClient />
}
