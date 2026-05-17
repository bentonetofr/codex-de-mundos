'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ArrowLeft, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { GENRE_LABELS } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Universe, UniverseGenre } from '@/types'

const genreOptions = [
  { value: '', label: 'Selecione um gênero...' },
  ...Object.entries(GENRE_LABELS).map(([value, label]) => ({ value, label })),
]

export default function NewUniversePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    genre: '' as UniverseGenre | '',
    cover_url: '',
  })

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const ext = file.name.split('.').pop()
      const path = `covers/${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('universe-covers')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('universe-covers').getPublicUrl(path)
      update('cover_url', data.publicUrl)
      toast.success('Capa enviada!')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar capa.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Nome é obrigatório.')
    if (!form.genre) return toast.error('Selecione um gênero.')

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const { data, error } = await supabase
        .from('universes')
        .insert({
          user_id: user.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
          genre: form.genre as UniverseGenre,
          cover_url: form.cover_url || null,
        })
        .select()
        .single()

      if (error) throw error
      toast.success('Universo criado!')
      router.push(`/universes/${data.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar universo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/universes')}
          className="flex items-center gap-2 text-ash-500 hover:text-ash-200 transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="mb-8">
          <h1 className="font-cinzel text-3xl text-ash-50 mb-2">Forjar Universo</h1>
          <p className="text-ash-500">Dê vida ao seu mundo com um nome e uma visão.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Capa */}
          <div>
            <label className="block text-xs font-medium text-ash-200 uppercase tracking-wide mb-1.5">
              Imagem de capa (opcional)
            </label>
            <div className="relative h-48 bg-void-700 border-2 border-void-500 border-dashed rounded-xl overflow-hidden group hover:border-amber/40 transition-colors cursor-pointer">
              {form.cover_url ? (
                <img src={form.cover_url} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-ash-500 group-hover:text-ash-300">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm">{uploading ? 'Enviando...' : 'Clique para enviar'}</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <Input
            label="Nome do universo *"
            placeholder="Ex: Altherium, Voidreach, Nebula Vermelha..."
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />

          <Textarea
            label="Descrição"
            placeholder="Descreva brevemente a essência deste universo..."
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={4}
          />

          <Select
            label="Gênero / Tema *"
            options={genreOptions}
            value={form.genre}
            onChange={(e) => update('genre', e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/universes')}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Forjar universo
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
