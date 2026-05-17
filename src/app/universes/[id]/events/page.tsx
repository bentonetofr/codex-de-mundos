import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UniverseLayout } from '@/components/layout/UniverseLayout'
import { EventsClient } from '@/components/features/EventsClient'
import type { HistoricalEvent, Universe } from '@/types'

interface PageProps { params: { id: string } }

export default async function EventsPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: universe } = await supabase.from('universes').select('*').eq('id', params.id).single()
  if (!universe) notFound()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('universe_id', params.id)
    .order('sort_order', { ascending: true })

  return (
    <UniverseLayout universeId={params.id} universeName={(universe as Universe).name}>
      <EventsClient universeId={params.id} initialEvents={(events || []) as HistoricalEvent[]} />
    </UniverseLayout>
  )
}
