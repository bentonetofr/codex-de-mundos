'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Shield, Edit, Trash2, Eye, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'
import type { Faction } from '@/types'

interface Props {
  universeId: string
  initialFactions: Faction[]
}

const EMPTY_FORM = {
  name: '', type: '', ideology: '', leader: '',
  allies: '', enemies: '', description: '', symbol_url: '',
}

export function FactionsClient({ universeId, initialFactions }: Props) {
  const supabase = createClient()
  const [factions, setFactions] = useState<Faction[]>(initialFactions)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Faction | null>(null)
  const [viewing, setViewing] = useState<Faction | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() =>
    factions.filter(f => f.name.toLowerCase().includes(search.toLowerCase())), [factions, search])

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }))

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowModal(true) }
  const openEdit = (f: Faction) => {
    setEditing(f)
    setForm({
      name: f.name, type: f.type || '', ideology: f.ideology || '',
      leader: f.leader || '', allies: f.allies || '', enemies: f.enemies || '',
      description: f.description || '', symbol_url: f.symbol_url || '',
    })
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
        type: form.type.trim() || null,
        ideology: form.ideology.trim() || null,
        leader: form.leader.trim() || null,
        allies: form.allies.trim() || null,
        enemies: form.enemies.trim() || null,
        description: form.description.trim() || null,
        symbol_url: form.symbol_url.trim() || null,
      }
      if (editing) {
        const { data, error } = await supabase.from('factions').update(payload).eq('id', editing.id).select().single()
        if (error) throw error
        setFactions(prev => prev.map(f => f.id === editing.id ? (data as Faction) : f))
        toast.success('Facção atualizada!')
      } else {
        const { data, error } = await supabase.from('factions').insert(payload).select().single()
        if (error) throw error
        setFactions(prev => [data as Faction, ...prev])
        toast.success('Facção criada!')
      }
      setShowModal(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (f: Faction) => {
    if (!confirm(`Remover "${f.name}"?`)) return
    try {
      await supabase.from('factions').delete().eq('id', f.id)
      setFactions(prev => prev.filter(x => x.id !== f.id))
      toast.success('Facção removida.')
    } catch (err: any) {
      toast.error(err.message || 'Erro.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-8 pb-5 border-b border-void-700 bg-void-900/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-cinzel text-2xl text-ash-50">Facções</h1>
            <p className="text-ash-500 text-sm mt-1">{factions.length} facção{factions.length !== 1 ? 'ões' : ''}</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Nova</Button>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ash-500 pointer-events-none" />
          <input type="text" placeholder="Buscar facção..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-void-700 border border-void-500 rounded-lg pl-9 pr-3 py-2 text-sm text-ash-50 placeholder:text-ash-500 focus:outline-none focus:border-amber/50 transition-colors" />
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState icon={<Shield className="w-8 h-8" />} title="Nenhuma facção ainda"
            description="Crie guildas, impérios, cultos e organizações." action={{ label: 'Criar facção', onClick: openCreate }} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((f, i) => (
              <div key={f.id} className="bg-void-800 border border-void-600 rounded-xl p-5 card-hover group animate-slide-up"
                style={{ animationDelay: `${i * 0.04}s`, opacity: 0, animationFillMode: 'forwards' }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-rune/10 border border-rune/20 flex items-center justify-center shrink-0">
                    {f.symbol_url ? (
                      <img src={f.symbol_url} alt={f.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Flag className="w-5 h-5 text-rune-light" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-cinzel text-ash-50 font-semibold truncate">{f.name}</h3>
                    {f.type && <Badge variant="rune" className="mt-1">{f.type}</Badge>}
                  </div>
                </div>
                {f.leader && <p className="text-xs text-ash-500 mb-1">Líder: <span className="text-ash-300">{f.leader}</span></p>}
                {f.ideology && <p className="text-xs text-ash-500 line-clamp-1 mb-2">"{f.ideology}"</p>}
                {f.description && <p className="text-xs text-ash-500 line-clamp-2 mb-3">{f.description}</p>}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setViewing(f)} className="text-xs text-ash-400 hover:text-ash-50 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Ver</button>
                  <button onClick={() => openEdit(f)} className="text-xs text-ash-400 hover:text-amber flex items-center gap-1"><Edit className="w-3.5 h-3.5" /> Editar</button>
                  <button onClick={() => handleDelete(f)} className="text-xs text-ash-400 hover:text-red-400 flex items-center gap-1 ml-auto"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar facção' : 'Nova facção'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome *" value={form.name} onChange={e => update('name', e.target.value)} required />
            <Input label="Tipo" placeholder="Guilda, Império, Culto..." value={form.type} onChange={e => update('type', e.target.value)} />
          </div>
          <Input label="Líder" value={form.leader} onChange={e => update('leader', e.target.value)} />
          <Input label="Ideologia / Lema" value={form.ideology} onChange={e => update('ideology', e.target.value)} />
          <Textarea label="Descrição" value={form.description} onChange={e => update('description', e.target.value)} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Aliados" value={form.allies} onChange={e => update('allies', e.target.value)} />
            <Input label="Inimigos" value={form.enemies} onChange={e => update('enemies', e.target.value)} />
          </div>
          <Input label="URL do símbolo" placeholder="https://..." value={form.symbol_url} onChange={e => update('symbol_url', e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Salvar' : 'Criar facção'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name || ''} size="md">
        {viewing && (
          <div className="space-y-4">
            {viewing.type && <Badge variant="rune">{viewing.type}</Badge>}
            {[
              { label: 'Líder', value: viewing.leader },
              { label: 'Ideologia', value: viewing.ideology },
              { label: 'Aliados', value: viewing.allies },
              { label: 'Inimigos', value: viewing.enemies },
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
