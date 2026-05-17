'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, AlertTriangle, Wand2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Props {
  universeName: string
  universeContext: string
  hasApiKey: boolean
}

interface Message {
  role: 'user' | 'oracle'
  content: string
  timestamp: Date
}

const SUGGESTED_PROMPTS = [
  'Sugira um conflito épico para este universo',
  'Crie uma lenda ancestral sobre a origem do mundo',
  'Invente 5 nomes de reinos para este universo',
  'Sugira uma religião misteriosa com rituais únicos',
  'Crie um evento histórico que moldou o mundo',
  'Sugira alianças e traições entre as facções',
  'Expanda a lore de um personagem misterioso',
  'Descreva uma criatura lendária deste universo',
]

export function OracleClient({ universeName, universeContext, hasApiKey }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim() || loading) return

    const userMsg: Message = { role: 'user', content: prompt, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, universeContext }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro desconhecido')
      }

      const oracleMsg: Message = {
        role: 'oracle',
        content: data.result,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, oracleMsg])
    } catch (err: any) {
      toast.error(err.message || 'O Oráculo falhou ao responder.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 pt-8 pb-5 border-b border-void-700 bg-void-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-900/40 border border-violet-700/40 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="font-cinzel text-2xl text-ash-50">Oráculo de Lore</h1>
            <p className="text-ash-500 text-sm">IA com contexto de <span className="text-amber">{universeName}</span></p>
          </div>
        </div>
      </div>

      {/* Alerta se não tiver API key */}
      {!hasApiKey && (
        <div className="mx-6 mt-4 p-4 bg-amber/10 border border-amber/30 rounded-xl flex gap-3 shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber font-medium">API Key não configurada</p>
            <p className="text-xs text-ash-400 mt-1">
              Adicione <code className="bg-void-700 px-1 rounded text-amber">ANTHROPIC_API_KEY</code> no arquivo <code className="bg-void-700 px-1 rounded text-amber">.env.local</code> para ativar o Oráculo.
            </p>
          </div>
        </div>
      )}

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            {/* Welcome */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-violet-900/20 border border-violet-700/20 flex items-center justify-center mx-auto mb-4">
                <Wand2 className="w-10 h-10 text-violet-400" />
              </div>
              <h2 className="font-cinzel text-xl text-ash-50 mb-2">Consulte o Oráculo</h2>
              <p className="text-ash-500 text-sm">
                Ele conhece os segredos de <span className="text-amber">{universeName}</span>. Faça sua pergunta ou escolha uma sugestão abaixo.
              </p>
            </div>

            {/* Sugestões */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={!hasApiKey || loading}
                  className="text-left px-4 py-3 bg-void-800 border border-void-600 rounded-xl text-sm text-ash-300 hover:border-violet-700/40 hover:text-ash-50 hover:bg-void-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${
                  msg.role === 'user'
                    ? 'bg-amber/20 border border-amber/30 text-amber'
                    : 'bg-violet-900/40 border border-violet-700/40 text-violet-400'
                }`}>
                  {msg.role === 'user' ? 'V' : '✦'}
                </div>

                {/* Balão */}
                <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber/10 border border-amber/20 text-ash-100 rounded-tr-sm'
                      : 'bg-void-700 border border-void-600 text-ash-200 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-ash-500 mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-900/40 border border-violet-700/40 flex items-center justify-center text-violet-400">
                  ✦
                </div>
                <div className="bg-void-700 border border-void-600 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-void-700 px-6 py-4 bg-void-900/50 shrink-0">
        <div className="max-w-2xl mx-auto">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5 text-xs text-ash-500 hover:text-ash-300 mb-3 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Nova conversa
            </button>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasApiKey ? 'Pergunte ao Oráculo...' : 'Configure a API key para usar o Oráculo'}
              disabled={!hasApiKey || loading}
              rows={2}
              className="flex-1 bg-void-700 border border-void-500 rounded-xl px-4 py-3 text-sm text-ash-50 placeholder:text-ash-500 focus:outline-none focus:border-violet-700/50 resize-none transition-colors disabled:opacity-40"
            />
            <Button
              type="submit"
              disabled={!hasApiKey || loading || !input.trim()}
              loading={loading}
              className="bg-violet-800 hover:bg-violet-700 text-ash-50 self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-ash-500 mt-2">Enter para enviar · Shift+Enter para nova linha</p>
        </div>
      </div>
    </div>
  )
}
