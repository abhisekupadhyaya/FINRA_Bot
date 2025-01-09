import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ollama Chatbot',
  description: 'A chatbot powered by Ollama',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}

