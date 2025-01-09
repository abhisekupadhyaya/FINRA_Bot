'use client'

import { useState, FormEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      createdAt: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) throw new Error(response.statusText)
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1]
              if (lastMessage?.role === 'assistant') {
                return [...prev.slice(0, -1), data]
              }
              return [...prev, data]
            })
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Chatbot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((m: ChatMessage) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`rounded-lg p-4 max-w-[80%] whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-grow min-h-[40px] max-h-[200px] resize-none"
            rows={1}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Thinking...' : 'Send'}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
