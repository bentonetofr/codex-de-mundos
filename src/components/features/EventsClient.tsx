'use client'

import { useState } from 'react'
import { Plus, Zap, Edit, Trash2, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'
import type { HistoricalEvent } from '@/types'

interface Props {
  universeId: string
  initialEvents: HistoricalEvent[]
}

const EMPTY_FORM = {
  title: '', fictional_date: '', description: '',
  characters_involved: '', locations_involved: '', factions_involved: '',
}

export function EventsClient({ universeId, initialEvents }: Props) {
  const supabase = createClient()
  const [events, setEvents] = useState<HistoricalEvent[]>(initialEvents)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<HistoricalEvent | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }))

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowModal(true) }
  const openEdit = (ev: HistoricalEvent) => {
    setEditing(ev)
    setForm({
      title: ev.title,
      fictional_date: ev.fictional_date || '',
      description: ev.description || '',
      characters_involved: (ev.characters_involved || []).join(', '),
      locations_involved: (ev.locations_involved || []).join(', '),
      factions_involved: (ev.factions_involved || []).join(', '),
    })
    setShowModal(true)
  }

  const splitList = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Título obrigatório.')
    setSaving(true)
    try {
      const payload = {
        universe_id: universeId,
        title: form.title.trim(),
        fictional_date: form.fictional_date.trim() || null,
        description: form.description.trim() || null,
        sort_order: editing ? editing.sort_order : events.length + 1,
        characters_involved: splitList(form.characters_involved),
        locations_involved: splitList(form.locations_involved),
        factions_involved: splitList(form.factions_involved),
      }
      if (editing) {
        const { data, error } = await supabase.from('events').update(payload).eq('id', editing.id).select().single()
        if (error) throw error
        setEvents(prev => prev.map(ev => ev.id === editing.id ? (data as HistoricalEvent) : ev))
        toast.success('Evento atualizado!')
      } else {
        const { data, error } = await supabase.from('events').insert(payload).select().single()
        if (error) throw error
        setEvents(prev => [...prev, data as HistoricalEvent])
        toast.success('Evento criado!')
      }
      setShowModal(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ev: HistoricalEvent) => {
    if (!confirm(`Remover "${ev.title}"?`)) return
    try {
      await supabase.from('events').delete().eq('id', ev.id)
      setEvents(prev => prev.filter(e => e.id !== ev.id))
      toast.success('Evento removido.')
    } catch (err: any) {
      toast.error(err.message || 'Erro.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-8 pb-5 border-b border-void-700 bg-void-900/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cinzel text-2xl text-ash-50">Linha do Tempo</h1>
            <p className="text-ash-500 text-sm mt-1">{events.length} evento{events.length !== 1 ? 's' : ''} histórico{events.length !== 1 ? 's' : ''}</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Novo evento</Button>
        </div>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto">
        {events.length === 0 ? (
          <EmptyState
            icon={<Zap className="w-8 h-8" />}
            title="Nenhum evento registrado"
            description="Adicione batalhas, descobertas, nascimentos e eventos históricos."
            action={{ label: 'Adicionar evento', onClick: openCreate }}
          />
        ) : (
          <div className="relative max-w-2xl mx-auto">
            {/* Linha central da timeline */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-amber/40 via-amber/20 to-transparent" />

            <div className="space-y-0">
              {events.map((ev, i) => (
                <div
                  key={ev.id}
                  className="relative pl-16 pb-8 group animate-slide-up"
                  style={{ animationDelay: `${i * 0.06}s`, opacity: 0, animationFillMode: 'forwards' }}
                >
                  {/* Nó da timeline */}
                  <div className="absolute left-3.5 top-1 w-5 h-5 rounded-full bg-void-800 border-2 border-amber flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber" />
                  </div>

                  {/* Card do evento */}
                  <div className="bg-void-800 border border-void-600 rounded-xl p-5 hover:border-amber/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-cinzel text-ash-50 font-semibold">{ev.title}</h3>
                        {ev.fictional_date && (
                          <div className="flex items-center gap-1.5 text-xs text-amber mt-1">
                            <CalendarDays className="w-3 h-3" />
                            {ev.fictional_date}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3">
                        <button onClick={() => openEdit(ev)} className="p-1.5 rounded-md text-ash-500 hover:text-amber hover:bg-void-700 transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(ev)} className="p-1.5 rounded-md text-ash-500 hover:text-red-400 hover:bg-red-900/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {ev.description && (
                      <p className="text-sm text-ash-300 leading-relaxed mb-3">{ev.description}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-ash-500">
                      {ev.characters_involved && ev.characters_involved.length > 0 && (
                        <span>👤 {ev.characters_involved.join(', ')}</span>
                      )}
                      {ev.locations_involved && ev.locations_involved.length > 0 && (
                        <span>📍 {ev.locations_involved.join(', ')}</span>
                      )}
                      {ev.factions_involved && ev.factions_involved.length > 0 && (
                        <span>⚔️ {ev.factions_involved.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar evento' : 'Novo evento histórico'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Título *" placeholder="Nome do evento" value={form.title} onChange={e => update('title', e.target.value)} required />
          <Input label="Data fictícia" placeholder="Ex: Ano 342 da Terceira Era, Era das Sombras..." value={form.fictional_date} onChange={e => update('fictional_date', e.target.value)} />
          <Textarea label="Descrição" placeholder="O que aconteceu? Quais foram as consequências?" value={form.description} onChange={e => update('description', e.target.value)} rows={4} />
          <Input label="Personagens envolvidos" placeholder="Separe por vírgula: Aragorn, Gandalf..." value={form.characters_involved} onChange={e => update('characters_involved', e.target.value)} hint="Separados por vírgula" />
          <Input label="Locais envolvidos" placeholder="Minas Tirith, Mordor..." value={form.locations_involved} onChange={e => update('locations_involved', e.target.value)} hint="Separados por vírgula" />
          <Input label="Facções envolvidas" placeholder="Ordem dos Magos, Exército do Norte..." value={form.factions_involved} onChange={e => update('factions_involved', e.target.value)} hint="Separados por vírgula" />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Salvar' : 'Criar evento'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
