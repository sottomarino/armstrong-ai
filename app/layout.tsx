import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Armstrong E2B - Code Execution Platform',
  description: 'The ultimate code execution platform powered by E2B technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
