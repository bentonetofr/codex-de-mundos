import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Users, MapPin, Shield, Zap, Skull, Church,
  Swords, GitBranch, StickyNote, Sparkles, Edit, Trash2
} from 'lucide-react'
import { UniverseLayout } from '@/components/layout/UniverseLayout'
import { Badge } from '@/components/ui/Badge'
import { GENRE_LABELS, formatDate } from '@/lib/utils'
import type { Universe } from '@/types'
import { UniverseActionsClient } from '@/components/features/UniverseActionsClient'

interface PageProps {
  params: { id: string }
}

const modules = [
  { label: 'Personagens', icon: Users, href: 'characters', color: 'text-amber' },
  { label: 'Locais', icon: MapPin, href: 'locations', color: 'text-blue-400' },
  { label: 'Facções', icon: Shield, href: 'factions', color: 'text-rune-light' },
  { label: 'Linha do Tempo', icon: Zap, href: 'events', color: 'text-green-400' },
  { label: 'Criaturas', icon: Skull, href: 'creatures', color: 'text-red-400' },
  { label: 'Religiões', icon: Church, href: 'religions', color: 'text-yellow-400' },
  { label: 'Guerras', icon: Swords, href: 'wars', color: 'text-orange-400' },
  { label: 'Linhagens', icon: GitBranch, href: 'lineages', color: 'text-pink-400' },
  { label: 'Notas de Lore', icon: StickyNote, href: 'notes', color: 'text-teal-400' },
  { label: 'Oráculo IA', icon: Sparkles, href: 'oracle', color: 'text-violet-400' },
]

export default async function UniverseOverviewPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: universe } = await supabase
    .from('universes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!universe) notFound()
  const u = universe as Universe

  // Contagens de entidades
  const countQueries = await Promise.all([
    supabase.from('characters').select('*', { count: 'exact', head: true }).eq('universe_id', params.id),
    supabase.from('locations').select('*', { count: 'exact', head: true }).eq('universe_id', params.id),
    supabase.from('factions').select('*', { count: 'exact', head: true }).eq('universe_id', params.id),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('universe_id', params.id),
    supabase.from('creatures').select('*', { count: 'exact', head: true }).eq('universe_id', params.id),
    supabase.from('religions').select('*', { count: 'exact', head: true }).eq('universe_id', params.id),
    supabase.from('wars').select('*', { count: 'exact', head: true }).eq('universe_id', params.id),
    supabase.from('lore_notes').select('*', { count: 'exact', head: true }).eq('universe_id', params.id),
  ])

  const counts = countQueries.map((r) => r.count ?? 0)
  const moduleWithCounts = modules.map((mod, i) => ({
    ...mod,
    count: counts[i] ?? 0,
  }))

  return (
    <UniverseLayout universeId={params.id} universeName={u.name}>
      {/* Hero da capa */}
      <div className="relative h-56 bg-void-700 overflow-hidden">
        {u.cover_url ? (
          <img src={u.cover_url} alt={u.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-void-600 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-void-500" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/30 to-transparent" />

        {/* Ações */}
        <div className="absolute top-4 right-4 flex gap-2">
          <UniverseActionsClient universeId={params.id} />
        </div>

        {/* Título sobre capa */}
        <div className="absolute bottom-6 left-6">
          <div className="flex items-center gap-3">
            <h1 className="font-cinzel text-3xl text-ash-50 font-bold drop-shadow-lg">{u.name}</h1>
            <Badge variant="amber">{GENRE_LABELS[u.genre]}</Badge>
          </div>
          <p className="text-ash-400 text-sm mt-1">Criado em {formatDate(u.created_at)}</p>
        </div>
      </div>

      <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">
        {/* Descrição */}
        {u.description && (
          <div className="bg-void-800 border border-void-600 rounded-xl p-5">
            <h2 className="font-cinzel text-sm text-amber uppercase tracking-widest mb-3">Sobre este universo</h2>
            <p className="text-ash-200 leading-relaxed">{u.description}</p>
          </div>
        )}

        {/* Módulos */}
        <section>
          <h2 className="font-cinzel text-lg text-ash-200 mb-4">Módulos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {moduleWithCounts.slice(0, 10).map((mod, i) => (
              <Link
                key={mod.href}
                href={`/universes/${params.id}/${mod.href}`}
                className="bg-void-800 border border-void-600 rounded-xl p-4 card-hover group animate-slide-up"
                style={{ animationDelay: `${i * 0.04}s`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <div className={`mb-3 ${mod.color} group-hover:scale-110 transition-transform`}>
                  <mod.icon className="w-6 h-6" />
                </div>
                <div className="font-cinzel text-2xl text-ash-50 font-bold mb-1">{mod.count}</div>
                <div className="text-xs text-ash-500 leading-tight">{mod.label}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </UniverseLayout>
  )
}
