import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UniverseLayout } from '@/components/layout/UniverseLayout'
import { FactionsClient } from '@/components/features/FactionsClient'
import type { Faction, Universe } from '@/types'

interface PageProps { params: { id: string } }

export default async function FactionsPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: universe } = await supabase.from('universes').select('*').eq('id', params.id).single()
  if (!universe) notFound()

  const { data: factions } = await supabase
    .from('factions')
    .select('*')
    .eq('universe_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <UniverseLayout universeId={params.id} universeName={(universe as Universe).name}>
      <FactionsClient universeId={params.id} initialFactions={(factions || []) as Faction[]} />
    </UniverseLayout>
  )
}
