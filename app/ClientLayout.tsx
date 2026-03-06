'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import i18n from '../src/i18n'
import { LoadingProvider } from '../src/contexts/LoadingContext'
import LanguageSwitcher from '../src/components/LanguageSwitcher'

function RTLHandler() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const isRTL = i18n.language === 'ar' || i18n.language.startsWith('ar-')
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return null
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    router.prefetch(pathname)
  }, [pathname, router])

  const isHomePage = pathname === '/'
  const isListPage = pathname.startsWith('/lists')
  const isDiscoveryRelatedPage = pathname === '/discovery' || 
                                  pathname.startsWith('/trending/') ||
                                  pathname.startsWith('/movies/') ||
                                  pathname.startsWith('/tv-shows/') ||
                                  pathname === '/person/popular'

  return (
    <I18nextProvider i18n={i18n}>
      <RTLHandler />
      <LoadingProvider>
        {children}
        {!isListPage && !isDiscoveryRelatedPage && (
          <LanguageSwitcher variant={isHomePage ? 'fixed' : 'bottom'} />
        )}
        <Analytics />
      </LoadingProvider>
    </I18nextProvider>
  )
}
