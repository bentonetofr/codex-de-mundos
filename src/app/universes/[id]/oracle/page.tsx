import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UniverseLayout } from '@/components/layout/UniverseLayout'
import { OracleClient } from '@/components/features/OracleClient'
import type { Universe } from '@/types'

interface PageProps { params: { id: string } }

export default async function OraclePage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: universe } = await supabase.from('universes').select('*').eq('id', params.id).single()
  if (!universe) notFound()

  // Busca contexto do universo para enviar à IA
  const [{ data: characters }, { data: factions }, { data: locations }] = await Promise.all([
    supabase.from('characters').select('name, title, race').eq('universe_id', params.id).limit(20),
    supabase.from('factions').select('name, type, ideology').eq('universe_id', params.id).limit(10),
    supabase.from('locations').select('name, type').eq('universe_id', params.id).limit(10),
  ])

  const contextParts = [
    `Universo: ${universe.name} (${universe.genre})`,
    universe.description ? `Descrição: ${universe.description}` : '',
    characters?.length ? `Personagens: ${characters.map(c => `${c.name}${c.title ? ` (${c.title})` : ''}${c.race ? `, ${c.race}` : ''}`).join('; ')}` : '',
    factions?.length ? `Facções: ${factions.map(f => `${f.name}${f.type ? ` (${f.type})` : ''}`).join('; ')}` : '',
    locations?.length ? `Locais: ${locations.map(l => `${l.name} (${l.type})`).join('; ')}` : '',
  ].filter(Boolean).join('\n')

  const hasApiKey = !!process.env.GROQ_API_KEY

  return (
    <UniverseLayout universeId={params.id} universeName={(universe as Universe).name}>
      <OracleClient
        universeName={(universe as Universe).name}
        universeContext={contextParts}
        hasApiKey={hasApiKey}
      />
    </UniverseLayout>
  )
}
