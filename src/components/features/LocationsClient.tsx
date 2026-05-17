'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, MapPin, Edit, Trash2, Eye, Landmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'
import { LOCATION_TYPE_LABELS } from '@/lib/utils'
import type { Location, LocationType } from '@/types'

interface Props {
  universeId: string
  initialLocations: Location[]
}

const EMPTY_FORM = {
  name: '', type: 'city' as LocationType, description: '',
  culture: '', ruler: '', image_url: '',
}

const typeOptions = [
  ...Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

export function LocationsClient({ universeId, initialLocations }: Props) {
  const supabase = createClient()
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)
  const [viewing, setViewing] = useState<Location | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() =>
    locations.filter(l =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.type.includes(search.toLowerCase())
    ), [locations, search])

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }))

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowModal(true) }
  const openEdit = (loc: Location) => {
    setEditing(loc)
    setForm({ name: loc.name, type: loc.type, description: loc.description || '', culture: loc.culture || '', ruler: loc.ruler || '', image_url: loc.image_url || '' })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Nome obrigatório.')
    setSaving(true)
    try {
      const payload = {
        universe_id: universeId,
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim() || null,
        culture: form.culture.trim() || null,
        ruler: form.ruler.trim() || null,
        image_url: form.image_url.trim() || null,
      }
      if (editing) {
        const { data, error } = await supabase.from('locations').update(payload).eq('id', editing.id).select().single()
        if (error) throw error
        setLocations(prev => prev.map(l => l.id === editing.id ? (data as Location) : l))
        toast.success('Local atualizado!')
      } else {
        const { data, error } = await supabase.from('locations').insert(payload).select().single()
        if (error) throw error
        setLocations(prev => [data as Location, ...prev])
        toast.success('Local criado!')
      }
      setShowModal(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (loc: Location) => {
    if (!confirm(`Remover "${loc.name}"?`)) return
    try {
      await supabase.from('locations').delete().eq('id', loc.id)
      setLocations(prev => prev.filter(l => l.id !== loc.id))
      toast.success('Local removido.')
    } catch (err: any) {
      toast.error(err.message || 'Erro.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-8 pb-5 border-b border-void-700 bg-void-900/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-cinzel text-2xl text-ash-50">Locais</h1>
            <p className="text-ash-500 text-sm mt-1">{locations.length} local{locations.length !== 1 ? 'is' : ''}</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Novo</Button>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ash-500 pointer-events-none" />
          <input
            type="text" placeholder="Buscar local..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-void-700 border border-void-500 rounded-lg pl-9 pr-3 py-2 text-sm text-ash-50 placeholder:text-ash-500 focus:outline-none focus:border-amber/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<MapPin className="w-8 h-8" />}
            title={search ? 'Nenhum resultado' : 'Nenhum local ainda'}
            description={search ? 'Tente outro termo.' : 'Mapeie os lugares do seu universo.'}
            action={!search ? { label: 'Criar local', onClick: openCreate } : undefined}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((loc, i) => (
              <div
                key={loc.id}
                className="bg-void-800 border border-void-600 rounded-xl overflow-hidden card-hover group animate-slide-up"
                style={{ animationDelay: `${i * 0.04}s`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <div className="h-24 bg-void-700 relative">
                  {loc.image_url ? (
                    <img src={loc.image_url} alt={loc.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Landmark className="w-10 h-10 text-void-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-void-800/60 to-transparent" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-cinzel text-ash-50 font-semibold truncate">{loc.name}</h3>
                  </div>
                  <Badge variant="amber" className="mb-2">{LOCATION_TYPE_LABELS[loc.type]}</Badge>
                  {loc.ruler && <p className="text-xs text-ash-500 mb-1">Governante: {loc.ruler}</p>}
                  {loc.description && <p className="text-xs text-ash-500 line-clamp-2 mt-2">{loc.description}</p>}
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setViewing(loc) }} className="text-xs text-ash-400 hover:text-ash-50 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Ver</button>
                    <button onClick={() => openEdit(loc)} className="text-xs text-ash-400 hover:text-amber flex items-center gap-1"><Edit className="w-3.5 h-3.5" /> Editar</button>
                    <button onClick={() => handleDelete(loc)} className="text-xs text-ash-400 hover:text-red-400 flex items-center gap-1 ml-auto"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar local' : 'Novo local'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nome *" placeholder="Nome do local" value={form.name} onChange={e => update('name', e.target.value)} required />
          <Select label="Tipo" options={typeOptions} value={form.type} onChange={e => update('type', e.target.value)} />
          <Input label="Governante" placeholder="Quem controla este local?" value={form.ruler} onChange={e => update('ruler', e.target.value)} />
          <Input label="Cultura" placeholder="Descrição cultural, costumes..." value={form.culture} onChange={e => update('culture', e.target.value)} />
          <Textarea label="Descrição" placeholder="Descreva o local..." value={form.description} onChange={e => update('description', e.target.value)} rows={3} />
          <Input label="URL da imagem" placeholder="https://..." value={form.image_url} onChange={e => update('image_url', e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Salvar' : 'Criar local'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name || ''} size="md">
        {viewing && (
          <div className="space-y-4">
            {viewing.image_url && <img src={viewing.image_url} alt={viewing.name} className="w-full h-40 object-cover rounded-lg" />}
            <Badge variant="amber">{LOCATION_TYPE_LABELS[viewing.type]}</Badge>
            {[
              { label: 'Governante', value: viewing.ruler },
              { label: 'Cultura', value: viewing.culture },
              { label: 'Descrição', value: viewing.description },
            ].filter(f => f.value).map(f => (
              <div key={f.label}>
                <h4 className="text-xs text-ash-500 uppercase tracking-wide mb-1">{f.label}</h4>
                <p className="text-sm text-ash-200">{f.value}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
