'use client'

import { useState } from 'react'
import { BookOpen, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const getFriendlyError = (message?: string) => {
    const value = message?.toLowerCase() || ''

    if (value.includes('invalid login credentials')) {
      return 'E-mail ou senha incorretos.'
    }

    if (value.includes('email not confirmed')) {
      return 'Seu e-mail ainda não foi confirmado. Confira sua caixa de entrada.'
    }

    if (value.includes('user already registered') || value.includes('already registered')) {
      return 'Este e-mail já possui uma conta. Use a aba Entrar.'
    }

    return message || 'Algo deu errado.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const email = form.email.trim().toLowerCase()
    const password = form.password

    if (!email) return toast.error('Informe seu e-mail.')
    if (!password) return toast.error('Informe sua senha.')

    setLoading(true)

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        if (!data.session) throw new Error('Não foi possível iniciar a sessão.')

        toast.success('Login realizado!')
        window.location.assign('/dashboard')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      })

      if (error) throw error

      if (data.session) {
        toast.success('Conta criada!')
        window.location.assign('/dashboard')
        return
      }

      toast.success('Conta criada! Verifique seu e-mail antes de entrar.')
      setMode('login')
    } catch (err: any) {
      toast.error(getFriendlyError(err?.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rune/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber/10 border border-amber/20 mb-4">
            <BookOpen className="w-8 h-8 text-amber" />
          </div>
          <h1 className="font-cinzel text-3xl text-ash-50 mb-1">Codex de Mundos</h1>
          <p className="text-ash-500 text-sm">Onde universos nascem e ganham vida.</p>
        </div>

        {/* Card */}
        <div className="bg-void-800 border border-void-600 rounded-2xl p-8 shadow-card">
          <div className="flex bg-void-700 rounded-lg p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-void-500 text-ash-50 shadow'
                  : 'text-ash-500 hover:text-ash-200'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-void-500 text-ash-50 shadow'
                  : 'text-ash-500 hover:text-ash-200'
              }`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Mail className="absolute right-3 bottom-2.5 w-4 h-4 text-ash-500 pointer-events-none" />
            </div>

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-2.5 text-ash-500 hover:text-ash-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2">
              {mode === 'login' ? 'Entrar no Codex' : 'Criar minha conta'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-ash-500 mt-6">
          Forje seus mundos. Narre suas lendas. Eternize sua criação.
        </p>
      </div>
    </div>
  )
}
