'use client'

import { useRef, useState } from 'react'
import { Download, BookOpen, Users, MapPin, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GENRE_LABELS, LOCATION_TYPE_LABELS, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Universe, Character, Location, Faction, HistoricalEvent } from '@/types'

interface Props {
  universe: Universe
  characters: Character[]
  locations: Location[]
  factions: Faction[]
  events: HistoricalEvent[]
}

export function LoreBookClient({ universe, characters, locations, factions, events }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      if (!contentRef.current) return

      const canvas = await html2canvas(contentRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#0a0a12',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let position = 0
      let heightLeft = imgHeight

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${universe.name.replace(/\s+/g, '_')}_Livro_de_Lore.pdf`)
      toast.success('PDF exportado com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao exportar PDF. Tente novamente.')
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-8 pb-5 border-b border-void-700 bg-void-900/50 flex items-center justify-between">
        <div>
          <h1 className="font-cinzel text-2xl text-ash-50">Livro de Lore</h1>
          <p className="text-ash-500 text-sm mt-1">Seu universo em formato de documento</p>
        </div>
        <Button
          icon={<Download className="w-4 h-4" />}
          onClick={handleExportPDF}
          loading={exporting}
        >
          Exportar PDF
        </Button>
      </div>

      {/* Conteúdo do livro */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div
          ref={contentRef}
          className="max-w-3xl mx-auto space-y-12"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {/* Capa do Livro */}
          <div className="text-center py-12 border border-amber/20 rounded-2xl bg-void-800">
            {universe.cover_url && (
              <div className="h-48 mb-6 overflow-hidden rounded-xl mx-8">
                <img src={universe.cover_url} alt={universe.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="px-8">
              <div className="text-amber text-xs uppercase tracking-[0.3em] mb-3">Codex de Mundos</div>
              <h1 className="font-cinzel text-4xl text-ash-50 mb-3">{universe.name}</h1>
              <div className="w-16 h-px bg-amber/40 mx-auto mb-4" />
              <p className="text-amber text-sm">{GENRE_LABELS[universe.genre]}</p>
              {universe.description && (
                <p className="text-ash-300 text-sm mt-4 max-w-lg mx-auto leading-relaxed italic">
                  "{universe.description}"
                </p>
              )}
              <p className="text-ash-500 text-xs mt-6">Compilado em {formatDate(new Date().toISOString())}</p>
            </div>
          </div>

          {/* Personagens */}
          {characters.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-5 h-5 text-amber" />
                <h2 className="font-cinzel text-2xl text-amber">I. Personagens</h2>
                <div className="flex-1 h-px bg-amber/20" />
              </div>
              <div className="space-y-6">
                {characters.map((char) => (
                  <div key={char.id} className="bg-void-700 border border-void-500 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      {char.image_url && (
                        <img src={char.image_url} alt={char.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-cinzel text-lg text-ash-50">{char.name}</h3>
                        {char.title && <p className="text-amber text-sm mb-1">{char.title}</p>}
                        <div className="flex gap-2 flex-wrap mb-3">
                          {char.race && <span className="text-xs bg-void-600 text-ash-300 px-2 py-0.5 rounded">{char.race}</span>}
                          {char.origin && <span className="text-xs bg-void-600 text-ash-300 px-2 py-0.5 rounded">{char.origin}</span>}
                        </div>
                        {char.description && <p className="text-sm text-ash-300 leading-relaxed">{char.description}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Locais */}
          {locations.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h2 className="font-cinzel text-2xl text-blue-400">II. Locais</h2>
                <div className="flex-1 h-px bg-blue-400/20" />
              </div>
              <div className="space-y-4">
                {locations.map((loc) => (
                  <div key={loc.id} className="bg-void-700 border border-void-500 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-cinzel text-ash-50">{loc.name}</h3>
                      <span className="text-xs text-blue-400 border border-blue-400/20 px-2 py-0.5 rounded">{LOCATION_TYPE_LABELS[loc.type]}</span>
                    </div>
                    {loc.ruler && <p className="text-xs text-ash-500 mb-2">Governante: {loc.ruler}</p>}
                    {loc.description && <p className="text-sm text-ash-300 leading-relaxed">{loc.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Facções */}
          {factions.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-rune-light" />
                <h2 className="font-cinzel text-2xl text-rune-light">III. Facções</h2>
                <div className="flex-1 h-px bg-rune/20" />
              </div>
              <div className="space-y-4">
                {factions.map((f) => (
                  <div key={f.id} className="bg-void-700 border border-void-500 rounded-xl p-5">
                    <h3 className="font-cinzel text-ash-50 mb-1">{f.name}</h3>
                    {f.type && <span className="text-xs text-rune-light border border-rune/20 px-2 py-0.5 rounded">{f.type}</span>}
                    {f.leader && <p className="text-xs text-ash-500 mt-2">Líder: {f.leader}</p>}
                    {f.ideology && <p className="text-xs text-ash-500 italic">"{f.ideology}"</p>}
                    {f.description && <p className="text-sm text-ash-300 leading-relaxed mt-2">{f.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Linha do Tempo */}
          {events.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-5 h-5 text-green-400" />
                <h2 className="font-cinzel text-2xl text-green-400">IV. Linha do Tempo</h2>
                <div className="flex-1 h-px bg-green-400/20" />
              </div>
              <div className="space-y-4">
                {events.map((ev) => (
                  <div key={ev.id} className="bg-void-700 border border-void-500 rounded-xl p-5 relative pl-8">
                    <div className="absolute left-3 top-6 w-2 h-2 rounded-full bg-green-400" />
                    <h3 className="font-cinzel text-ash-50 mb-1">{ev.title}</h3>
                    {ev.fictional_date && <p className="text-xs text-green-400 mb-2">{ev.fictional_date}</p>}
                    {ev.description && <p className="text-sm text-ash-300 leading-relaxed">{ev.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Rodapé */}
          <div className="text-center pt-8 border-t border-void-600">
            <p className="text-xs text-ash-500">
              Gerado pelo <span className="text-amber">Codex de Mundos</span> · {universe.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
