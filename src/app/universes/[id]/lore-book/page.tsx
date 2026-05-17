import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UniverseLayout } from '@/components/layout/UniverseLayout'
import { LoreBookClient } from '@/components/features/LoreBookClient'
import { GENRE_LABELS } from '@/lib/utils'
import type { Universe, Character, Location, Faction, HistoricalEvent } from '@/types'

interface PageProps { params: { id: string } }

export default async function LoreBookPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: universe } = await supabase.from('universes').select('*').eq('id', params.id).single()
  if (!universe) notFound()

  const [
    { data: characters },
    { data: locations },
    { data: factions },
    { data: events },
  ] = await Promise.all([
    supabase.from('characters').select('*').eq('universe_id', params.id).order('name'),
    supabase.from('locations').select('*').eq('universe_id', params.id).order('name'),
    supabase.from('factions').select('*').eq('universe_id', params.id).order('name'),
    supabase.from('events').select('*').eq('universe_id', params.id).order('sort_order'),
  ])

  return (
    <UniverseLayout universeId={params.id} universeName={(universe as Universe).name}>
      <LoreBookClient
        universe={universe as Universe}
        characters={(characters || []) as Character[]}
        locations={(locations || []) as Location[]}
        factions={(factions || []) as Faction[]}
        events={(events || []) as HistoricalEvent[]}
      />
    </UniverseLayout>
  )
}
