'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Users, Edit, Trash2, Eye, UserCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'
import type { Character, Faction } from '@/types'

interface Props {
  universeId: string
  initialCharacters: Character[]
  factions: Pick<Faction, 'id' | 'name'>[]
}

const EMPTY_FORM = {
  name: '', title: '', race: '', origin: '', description: '',
  personality: '', goals: '', allies: '', enemies: '', faction_id: '', image_url: '',
}

export function CharactersClient({ universeId, initialCharacters, factions }: Props) {
  const supabase = createClient()
  const router = useRouter()

  const [characters, setCharacters] = useState<Character[]>(initialCharacters)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editing, setEditing] = useState<Character | null>(null)
  const [viewing, setViewing] = useState<Character | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = useMemo(() =>
    characters.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.race?.toLowerCase().includes(search.toLowerCase()) ||
      c.title?.toLowerCase().includes(search.toLowerCase())
    ), [characters, search])

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }))

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setShowModal(true)
  }

  const openEdit = (char: Character) => {
    setEditing(char)
    setForm({
      name: char.name,
      title: char.title || '',
      race: char.race || '',
      origin: char.origin || '',
      description: char.description || '',
      personality: char.personality || '',
      goals: char.goals || '',
      allies: char.allies || '',
      enemies: char.enemies || '',
      faction_id: char.faction_id || '',
      image_url: char.image_url || '',
    })
    setShowModal(true)
  }

  const openView = (char: Character) => {
    setViewing(char)
    setShowViewModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Nome é obrigatório.')
    setSaving(true)

    try {
      const payload = {
        universe_id: universeId,
        name: form.name.trim(),
        title: form.title.trim() || null,
        race: form.race.trim() || null,
        origin: form.origin.trim() || null,
        description: form.description.trim() || null,
        personality: form.personality.trim() || null,
        goals: form.goals.trim() || null,
        allies: form.allies.trim() || null,
        enemies: form.enemies.trim() || null,
        faction_id: form.faction_id || null,
        image_url: form.image_url.trim() || null,
      }

      if (editing) {
        const { data, error } = await supabase
          .from('characters')
          .update(payload)
          .eq('id', editing.id)
          .select('*, faction:factions(id, name)')
          .single()
        if (error) throw error
        setCharacters(prev => prev.map(c => c.id === editing.id ? (data as Character) : c))
        toast.success('Personagem atualizado!')
      } else {
        const { data, error } = await supabase
          .from('characters')
          .insert(payload)
          .select('*, faction:factions(id, name)')
          .single()
        if (error) throw error
        setCharacters(prev => [data as Character, ...prev])
        toast.success('Personagem criado!')
      }
      setShowModal(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (char: Character) => {
    if (!confirm(`Remover "${char.name}"? Esta ação é irreversível.`)) return
    setDeleting(char.id)
    try {
      const { error } = await supabase.from('characters').delete().eq('id', char.id)
      if (error) throw error
      setCharacters(prev => prev.filter(c => c.id !== char.id))
      toast.success('Personagem removido.')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover.')
    } finally {
      setDeleting(null)
    }
  }

  const factionOptions = [
    { value: '', label: 'Sem facção' },
    ...factions.map(f => ({ value: f.id, label: f.name })),
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-8 pb-5 border-b border-void-700 bg-void-900/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-cinzel text-2xl text-ash-50">Personagens</h1>
            <p className="text-ash-500 text-sm mt-1">{characters.length} personagem{characters.length !== 1 ? 's' : ''}</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Novo
          </Button>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ash-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar personagem..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-void-700 border border-void-500 rounded-lg pl-9 pr-3 py-2 text-sm text-ash-50 placeholder:text-ash-500 focus:outline-none focus:border-amber/50 transition-colors"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title={search ? 'Nenhum resultado' : 'Nenhum personagem ainda'}
            description={search ? 'Tente outro termo.' : 'Crie o primeiro personagem deste universo.'}
            action={!search ? { label: 'Criar personagem', onClick: openCreate } : undefined}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((char, i) => (
              <div
                key={char.id}
                className="bg-void-800 border border-void-600 rounded-xl overflow-hidden card-hover group animate-slide-up"
                style={{ animationDelay: `${i * 0.04}s`, opacity: 0, animationFillMode: 'forwards' }}
              >
                {/* Avatar */}
                <div className="h-24 bg-void-700 relative overflow-hidden">
                  {char.image_url ? (
                    <img src={char.image_url} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserCircle2 className="w-12 h-12 text-void-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-void-800/60 to-transparent" />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <h3 className="font-cinzel text-ash-50 font-semibold truncate">{char.name}</h3>
                      {char.title && <p className="text-xs text-amber truncate">{char.title}</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {char.race && <Badge variant="ash">{char.race}</Badge>}
                    {char.faction && <Badge variant="rune">{(char.faction as any).name}</Badge>}
                  </div>

                  {char.description && (
                    <p className="text-xs text-ash-500 line-clamp-2 mb-3">{char.description}</p>
                  )}

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openView(char)}
                      className="flex items-center gap-1.5 text-xs text-ash-400 hover:text-ash-50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver
                    </button>
                    <button
                      onClick={() => openEdit(char)}
                      className="flex items-center gap-1.5 text-xs text-ash-400 hover:text-amber transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(char)}
                      disabled={deleting === char.id}
                      className="flex items-center gap-1.5 text-xs text-ash-400 hover:text-red-400 transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de criar/editar */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editar personagem' : 'Novo personagem'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome *" placeholder="Nome do personagem" value={form.name} onChange={e => update('name', e.target.value)} required />
            <Input label="Título" placeholder="Ex: O Eterno, Rei de..." value={form.title} onChange={e => update('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Raça / Espécie" placeholder="Humano, Elfo, Dracônico..." value={form.race} onChange={e => update('race', e.target.value)} />
            <Input label="Origem" placeholder="Reino, cidade natal..." value={form.origin} onChange={e => update('origin', e.target.value)} />
          </div>
          <Select label="Facção" options={factionOptions} value={form.faction_id} onChange={e => update('faction_id', e.target.value)} />
          <Textarea label="Descrição" placeholder="Aparência, história, contexto..." value={form.description} onChange={e => update('description', e.target.value)} rows={3} />
          <Textarea label="Personalidade" placeholder="Traços, vícios, virtudes..." value={form.personality} onChange={e => update('personality', e.target.value)} rows={2} />
          <Textarea label="Objetivos" placeholder="O que busca? O que teme?" value={form.goals} onChange={e => update('goals', e.target.value)} rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Aliados" placeholder="Nomes ou grupos" value={form.allies} onChange={e => update('allies', e.target.value)} />
            <Input label="Inimigos" placeholder="Nomes ou grupos" value={form.enemies} onChange={e => update('enemies', e.target.value)} />
          </div>
          <Input label="URL da imagem" placeholder="https://..." value={form.image_url} onChange={e => update('image_url', e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Salvar' : 'Criar personagem'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de visualização */}
      <Modal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={viewing?.name || ''}
        size="md"
      >
        {viewing && (
          <div className="space-y-4">
            {viewing.image_url && (
              <img src={viewing.image_url} alt={viewing.name} className="w-full h-48 object-cover rounded-lg" />
            )}
            {viewing.title && <p className="text-amber text-sm font-medium">{viewing.title}</p>}
            <div className="flex flex-wrap gap-2">
              {viewing.race && <Badge>{viewing.race}</Badge>}
              {viewing.origin && <Badge variant="rune">{viewing.origin}</Badge>}
            </div>
            {[
              { label: 'Descrição', value: viewing.description },
              { label: 'Personalidade', value: viewing.personality },
              { label: 'Objetivos', value: viewing.goals },
              { label: 'Aliados', value: viewing.allies },
              { label: 'Inimigos', value: viewing.enemies },
            ].filter(f => f.value).map(f => (
              <div key={f.label}>
                <h4 className="text-xs text-ash-500 uppercase tracking-wide mb-1">{f.label}</h4>
                <p className="text-sm text-ash-200">{f.value}</p>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => { setShowViewModal(false); openEdit(viewing) }}>
                <Edit className="w-3.5 h-3.5 mr-1.5" /> Editar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
