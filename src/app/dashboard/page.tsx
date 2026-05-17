import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Users, MapPin, Shield, Zap, Skull, BookOpen,
  Plus, Globe, ArrowRight, Clock
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { formatDate, GENRE_LABELS } from '@/lib/utils'
import type { Universe } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: universes } = await supabase
    .from('universes')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(6)

  const recentUniverses = (universes || []) as Universe[]

  // Contagens totais do usuário
  const [
    { count: totalChars },
    { count: totalLocs },
    { count: totalFactions },
    { count: totalEvents },
  ] = await Promise.all([
    supabase.from('characters').select('*', { count: 'exact', head: true }),
    supabase.from('locations').select('*', { count: 'exact', head: true }),
    supabase.from('factions').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
  ])

  const globalStats = [
    { label: 'Personagens', count: totalChars ?? 0, icon: <Users className="w-5 h-5" />, color: 'text-amber' },
    { label: 'Locais', count: totalLocs ?? 0, icon: <MapPin className="w-5 h-5" />, color: 'text-rune-light' },
    { label: 'Facções', count: totalFactions ?? 0, icon: <Shield className="w-5 h-5" />, color: 'text-blue-400' },
    { label: 'Eventos', count: totalEvents ?? 0, icon: <Zap className="w-5 h-5" />, color: 'text-green-400' },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {/* Header */}
        <div className="px-6 pt-8 pb-6 border-b border-void-700 bg-void-900/50">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-cinzel text-2xl text-ash-50">Dashboard</h1>
              <p className="text-ash-500 text-sm mt-1">Bem-vindo de volta, Narrador.</p>
            </div>
            <Link
              href="/universes/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber text-void-950 font-semibold text-sm rounded-xl hover:bg-amber-light transition-all shadow-amber hover:shadow-amber-strong"
            >
              <Plus className="w-4 h-4" />
              Novo Universo
            </Link>
          </div>
        </div>

        <div className="px-6 py-8 max-w-5xl mx-auto space-y-10">

          {/* Stats globais */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {globalStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`bg-void-800 border border-void-600 rounded-xl p-5 shadow-card animate-slide-up stagger-${i + 1}`}
                  style={{ opacity: 0, animationFillMode: 'forwards' }}
                >
                  <div className={`mb-3 ${stat.color}`}>{stat.icon}</div>
                  <div className="text-3xl font-cinzel text-ash-50 font-bold mb-1">
                    {stat.count}
                  </div>
                  <div className="text-xs text-ash-500 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Universos recentes */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cinzel text-lg text-ash-200">Universos Recentes</h2>
              <Link
                href="/universes"
                className="text-sm text-amber hover:text-amber-light flex items-center gap-1 transition-colors"
              >
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentUniverses.length === 0 ? (
              <div className="bg-void-800 border border-void-600 border-dashed rounded-xl p-12 text-center">
                <Globe className="w-10 h-10 text-ash-500 mx-auto mb-3" />
                <h3 className="font-cinzel text-ash-300 mb-2">Nenhum universo criado ainda</h3>
                <p className="text-sm text-ash-500 mb-5">Comece forjando seu primeiro mundo.</p>
                <Link
                  href="/universes/new"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-amber/40 text-amber text-sm rounded-lg hover:bg-amber/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Criar universo
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentUniverses.map((universe) => (
                  <Link key={universe.id} href={`/universes/${universe.id}`}>
                    <div className="bg-void-800 border border-void-600 rounded-xl overflow-hidden card-hover group">
                      {/* Capa */}
                      <div className="h-32 bg-void-700 relative overflow-hidden">
                        {universe.cover_url ? (
                          <img
                            src={universe.cover_url}
                            alt={universe.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-void-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-void-800/80 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <span className="text-xs bg-amber/20 text-amber border border-amber/20 px-2 py-0.5 rounded-md font-medium">
                            {GENRE_LABELS[universe.genre]}
                          </span>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-cinzel text-ash-50 font-semibold mb-1 truncate">
                          {universe.name}
                        </h3>
                        {universe.description && (
                          <p className="text-xs text-ash-500 line-clamp-2 mb-3">
                            {universe.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-ash-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(universe.updated_at)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Card de criar novo */}
                <Link href="/universes/new">
                  <div className="bg-void-800 border border-void-600 border-dashed rounded-xl h-full min-h-[200px] flex flex-col items-center justify-center gap-3 text-ash-500 card-hover hover:text-amber hover:border-amber/30">
                    <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">Novo universo</span>
                  </div>
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
