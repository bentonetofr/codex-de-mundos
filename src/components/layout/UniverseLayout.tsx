import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

interface UniverseLayoutProps {
  children: React.ReactNode
  universeId: string
  universeName: string
}

export function UniverseLayout({ children, universeId, universeName }: UniverseLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar universeId={universeId} universeName={universeName} />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav universeId={universeId} />
    </div>
  )
}
