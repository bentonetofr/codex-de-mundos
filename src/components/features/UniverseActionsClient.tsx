'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export function UniverseActionsClient({ universeId }: { universeId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { error } = await supabase.from('universes').delete().eq('id', universeId)
      if (error) throw error
      toast.success('Universo removido.')
      router.push('/universes')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => router.push(`/universes/${universeId}/edit`)}
        className="p-2 bg-void-800/80 backdrop-blur rounded-lg border border-void-600 text-ash-400 hover:text-ash-50 hover:border-amber/30 transition-all"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => setShowDelete(true)}
        className="p-2 bg-void-800/80 backdrop-blur rounded-lg border border-void-600 text-ash-400 hover:text-red-400 hover:border-red-900 transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Remover universo"
        description="Esta ação não pode ser desfeita. Todos os dados serão perdidos."
        size="sm"
      >
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={() => setShowDelete(false)}>
            Cancelar
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            Sim, remover
          </Button>
        </div>
      </Modal>
    </>
  )
}
