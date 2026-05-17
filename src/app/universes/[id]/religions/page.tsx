import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UniverseLayout } from '@/components/layout/UniverseLayout'
import { Church } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Universe } from '@/types'

interface PageProps { params: { id: string } }

export default async function ReligionsPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: universe } = await supabase.from('universes').select('*').eq('id', params.id).single()
  if (!universe) notFound()

  return (
    <UniverseLayout universeId={params.id} universeName={(universe as Universe).name}>
      <div className="px-6 pt-8 pb-5 border-b border-void-700 bg-void-900/50">
        <h1 className="font-cinzel text-2xl text-ash-50">Religiões</h1>
        <p className="text-ash-500 text-sm mt-1">Deuses, dogmas e rituais</p>
      </div>
      <div className="px-6 py-8">
        <EmptyState icon={<Church className="w-8 h-8" />} title="Módulo em breve" description="O módulo de religiões segue o mesmo padrão dos demais. Pronto para expansão." />
      </div>
    </UniverseLayout>
  )
}
