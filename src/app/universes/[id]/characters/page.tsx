import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import { UniverseLayout } from '@/components/layout/UniverseLayout'
import { EmptyState } from '@/components/ui/EmptyState'
import { CharactersClient } from '@/components/features/CharactersClient'
import type { Character, Faction, Universe } from '@/types'

interface PageProps {
  params: { id: string }
}

export default async function CharactersPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: universe } = await supabase
    .from('universes')
    .select('*')
    .eq('id', params.id)
    .single()
  if (!universe) notFound()

  const [{ data: characters }, { data: factions }] = await Promise.all([
    supabase
      .from('characters')
      .select('*, faction:factions(id, name)')
      .eq('universe_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('factions')
      .select('id, name')
      .eq('universe_id', params.id),
  ])

  return (
    <UniverseLayout universeId={params.id} universeName={(universe as Universe).name}>
      <CharactersClient
        universeId={params.id}
        initialCharacters={(characters || []) as Character[]}
        factions={(factions || []) as Pick<Faction, 'id' | 'name'>[]}
      />
    </UniverseLayout>
  )
}
