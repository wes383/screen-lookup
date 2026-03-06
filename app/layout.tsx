import type { Metadata } from 'next'
import '../src/index.css'
import '../src/App.css'
import '../src/mobile.css'
import ClientLayout from './ClientLayout'

export const metadata: Metadata = {
  title: 'Screen Lookup',
  description: 'Movie and TV Show Information',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
