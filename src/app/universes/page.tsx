import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Plus, Clock, Globe } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { formatDate, GENRE_LABELS } from '@/lib/utils'
import type { Universe } from '@/types'

export default async function UniversesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: universes } = await supabase
    .from('universes')
    .select('*')
    .order('updated_at', { ascending: false })

  const list = (universes || []) as Universe[]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="px-6 pt-8 pb-6 border-b border-void-700 bg-void-900/50">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-cinzel text-2xl text-ash-50">Meus Universos</h1>
              <p className="text-ash-500 text-sm mt-1">{list.length} universo{list.length !== 1 ? 's' : ''} forjado{list.length !== 1 ? 's' : ''}</p>
            </div>
            <Link
              href="/universes/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber text-void-950 font-semibold text-sm rounded-xl hover:bg-amber-light transition-all shadow-amber"
            >
              <Plus className="w-4 h-4" />
              Novo Universo
            </Link>
          </div>
        </div>

        <div className="px-6 py-8 max-w-5xl mx-auto">
          {list.length === 0 ? (
            <div className="bg-void-800 border border-void-600 border-dashed rounded-2xl p-16 text-center">
              <Globe className="w-12 h-12 text-ash-500 mx-auto mb-4" />
              <h2 className="font-cinzel text-xl text-ash-300 mb-2">Nenhum universo ainda</h2>
              <p className="text-ash-500 mb-6">Crie seu primeiro mundo e comece a escrever sua lore.</p>
              <Link
                href="/universes/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber text-void-950 font-semibold rounded-xl hover:bg-amber-light transition-all"
              >
                <Plus className="w-4 h-4" />
                Criar primeiro universo
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {list.map((universe, i) => (
                <Link key={universe.id} href={`/universes/${universe.id}`}>
                  <div
                    className="bg-void-800 border border-void-600 rounded-xl overflow-hidden card-hover group animate-slide-up"
                    style={{ animationDelay: `${i * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }}
                  >
                    <div className="h-40 bg-void-700 relative overflow-hidden">
                      {universe.cover_url ? (
                        <img
                          src={universe.cover_url}
                          alt={universe.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-void-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-void-800 via-void-800/20 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs bg-amber/20 text-amber border border-amber/20 px-2.5 py-1 rounded-md font-medium">
                          {GENRE_LABELS[universe.genre]}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-cinzel text-lg text-ash-50 font-semibold mb-2 truncate">
                        {universe.name}
                      </h3>
                      {universe.description ? (
                        <p className="text-sm text-ash-500 line-clamp-2 mb-4">
                          {universe.description}
                        </p>
                      ) : (
                        <p className="text-sm text-ash-500/50 italic mb-4">Sem descrição ainda...</p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-ash-500">
                        <Clock className="w-3 h-3" />
                        Atualizado {formatDate(universe.updated_at)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              <Link href="/universes/new">
                <div className="bg-void-800 border border-void-600 border-dashed rounded-xl min-h-[240px] flex flex-col items-center justify-center gap-3 text-ash-500 card-hover hover:text-amber hover:border-amber/30">
                  <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">Novo universo</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
