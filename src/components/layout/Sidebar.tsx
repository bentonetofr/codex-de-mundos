'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen, Globe, Users, MapPin, Shield, Zap,
  Skull, Church, Swords, GitBranch, StickyNote,
  Sparkles, Download, LayoutDashboard, LogOut, ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  universeId?: string
  universeName?: string
}

const mainNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/universes', icon: Globe, label: 'Universos' },
]

function getUniverseNav(id: string) {
  const base = `/universes/${id}`
  return [
    { href: `${base}`, icon: LayoutDashboard, label: 'Visão Geral', exact: true },
    { href: `${base}/characters`, icon: Users, label: 'Personagens' },
    { href: `${base}/locations`, icon: MapPin, label: 'Locais' },
    { href: `${base}/factions`, icon: Shield, label: 'Facções' },
    { href: `${base}/events`, icon: Zap, label: 'Linha do Tempo' },
    { href: `${base}/creatures`, icon: Skull, label: 'Criaturas' },
    { href: `${base}/religions`, icon: Church, label: 'Religiões' },
    { href: `${base}/wars`, icon: Swords, label: 'Guerras' },
    { href: `${base}/lineages`, icon: GitBranch, label: 'Linhagens' },
    { href: `${base}/notes`, icon: StickyNote, label: 'Notas de Lore' },
    { href: `${base}/oracle`, icon: Sparkles, label: 'Oráculo' },
    { href: `${base}/lore-book`, icon: Download, label: 'Livro de Lore' },
  ]
}

export function Sidebar({ universeId, universeName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.assign('/auth')
  }

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-void-900 border-r border-void-700 h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-void-700">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0 group-hover:bg-amber/20 transition-colors">
            <BookOpen className="w-4.5 h-4.5 text-amber" />
          </div>
          <div>
            <p className="font-cinzel text-sm text-amber leading-tight">Codex de</p>
            <p className="font-cinzel text-base text-ash-50 leading-tight font-semibold">Mundos</p>
          </div>
        </Link>
      </div>

      {/* Nav principal */}
      <nav className="px-3 py-4 space-y-0.5">
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive(item.href)
                ? 'bg-amber/10 text-amber border-r-2 border-amber -mr-3 pr-3'
                : 'text-ash-500 hover:text-ash-200 hover:bg-void-700'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Navegação do universo */}
      {universeId && (
        <>
          <div className="px-5 py-3 border-t border-void-700">
            <button
              onClick={() => router.push('/universes')}
              className="flex items-center gap-1.5 text-xs text-ash-500 hover:text-ash-200 transition-colors mb-3"
            >
              <ChevronLeft className="w-3 h-3" />
              Todos os universos
            </button>
            <p className="text-xs text-amber uppercase tracking-widest font-semibold truncate">
              {universeName || 'Universo'}
            </p>
          </div>
          <nav className="px-3 pb-4 space-y-0.5 flex-1">
            {getUniverseNav(universeId).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive(item.href, item.exact)
                    ? 'bg-amber/10 text-amber border-r-2 border-amber -mr-3 pr-3'
                    : 'text-ash-500 hover:text-ash-200 hover:bg-void-700'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}

      {/* Footer */}
      <div className="mt-auto border-t border-void-700 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ash-500 hover:text-red-400 hover:bg-red-900/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
