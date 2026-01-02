import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Invoice Scanner & Management System',
  description: 'Professional invoice scanning and management for businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
