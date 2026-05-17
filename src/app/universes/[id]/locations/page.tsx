import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UniverseLayout } from '@/components/layout/UniverseLayout'
import { LocationsClient } from '@/components/features/LocationsClient'
import type { Location, Universe } from '@/types'

interface PageProps { params: { id: string } }

export default async function LocationsPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: universe } = await supabase.from('universes').select('*').eq('id', params.id).single()
  if (!universe) notFound()

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('universe_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <UniverseLayout universeId={params.id} universeName={(universe as Universe).name}>
      <LocationsClient universeId={params.id} initialLocations={(locations || []) as Location[]} />
    </UniverseLayout>
  )
}
