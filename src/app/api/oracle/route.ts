import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Verifica auth
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key não configurada. Adicione GROQ_API_KEY no .env.local.' },
      { status: 503 }
    )
  }

  const body = await req.json()
  const { prompt, universeContext } = body as { prompt: string; universeContext: string }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt vazio' }, { status: 400 })
  }

  try {
    const systemPrompt = `Você é o Oráculo, um sábio ancestral que vive dentro do Codex de Mundos — um grimório mágico que registra universos fictícios. Você ajuda escritores, mestres de RPG e criadores de mundos a expandir suas lores.

Você responde sempre em português brasileiro, com um tom levemente arcaico e dramático — como um narrador épico, mas sem ser exagerado. Suas respostas são criativas, ricas em detalhes e prontas para uso direto na lore.

Contexto do universo atual:
${universeContext || 'Nenhum contexto adicional fornecido. Use sua criatividade para sugerir algo interessante.'}

Diretrizes:
- Seja específico e criativo
- Respostas entre 150-400 palavras, salvo pedido contrário
- Crie nomes originais que soem como do universo descrito
- Ofereça ideias acionáveis, não apenas conceitos vagos
- Quando relevante, sugira conexões com o que já existe no universo`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Erro na API')
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    return NextResponse.json({ result: text })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao consultar o Oráculo.' }, { status: 500 })
  }
}
