'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Globe, Users, MapPin, Sparkles, MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  universeId?: string
}

export function MobileNav({ universeId }: MobileNavProps) {
  const pathname = usePathname()

  const nav = universeId
    ? [
        { href: `/universes/${universeId}`, icon: LayoutDashboard, label: 'Visão' },
        { href: `/universes/${universeId}/characters`, icon: Users, label: 'Pers.' },
        { href: `/universes/${universeId}/locations`, icon: MapPin, label: 'Locais' },
        { href: `/universes/${universeId}/oracle`, icon: Sparkles, label: 'Oráculo' },
        { href: `/universes`, icon: Globe, label: 'Universos' },
      ]
    : [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
        { href: '/universes', icon: Globe, label: 'Universos' },
      ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-void-900/95 backdrop-blur border-t border-void-700 flex">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors',
              active ? 'text-amber' : 'text-ash-500 hover:text-ash-200'
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
