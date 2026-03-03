export function getTMDBLanguage(i18nLang: string): string {
    const languageMap: Record<string, string> = {
        'en': 'en-US',
        'en-US': 'en-US',
        'en-GB': 'en-GB',
        'zh': 'zh-CN',
        'zh-CN': 'zh-CN',
        'zh-TW': 'zh-TW',
        'zh-HK': 'zh-HK',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'es': 'es-ES',
        'es-ES': 'es-ES',
        'es-MX': 'es-MX',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'ru': 'ru-RU',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'pt-PT': 'pt-PT',
        'pt-BR': 'pt-BR',
        'tr': 'tr-TR',
        'ar': 'ar-SA',
        'ar-SA': 'ar-SA',
        'ar-EG': 'ar-EG',
        'ar-AE': 'ar-AE',
        'hi': 'hi-IN',
        'hi-IN': 'hi-IN'
    };
    
    return languageMap[i18nLang] || 'en-US';
}

export function getTMDBImageLanguage(i18nLang: string): string {
    const imageLanguageMap: Record<string, string> = {
        'en': 'en',
        'en-US': 'en',
        'en-GB': 'en',
        'zh': 'zh-CN',
        'zh-CN': 'zh-CN',
        'zh-TW': 'zh-TW',
        'zh-HK': 'zh-HK',
        'ja': 'ja',
        'ko': 'ko',
        'es': 'es',
        'es-ES': 'es',
        'es-MX': 'es',
        'fr': 'fr',
        'de': 'de',
        'ru': 'ru',
        'it': 'it',
        'pt': 'pt',
        'pt-PT': 'pt',
        'pt-BR': 'pt',
        'tr': 'tr',
        'ar': 'ar',
        'ar-SA': 'ar',
        'ar-EG': 'ar',
        'ar-AE': 'ar',
        'hi': 'hi',
        'hi-IN': 'hi'
    };
    
    return imageLanguageMap[i18nLang] || 'en';
}

export function getDateLocale(i18nLang: string): string {
    const localeMap: Record<string, string> = {
        'en': 'en-US',
        'en-US': 'en-US',
        'en-GB': 'en-GB',
        'zh': 'zh-CN',
        'zh-CN': 'zh-CN',
        'zh-TW': 'zh-TW',
        'zh-HK': 'zh-HK',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'es': 'es-ES',
        'es-ES': 'es-ES',
        'es-MX': 'es-MX',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'ru': 'ru-RU',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'pt-PT': 'pt-PT',
        'pt-BR': 'pt-BR',
        'tr': 'tr-TR',
        'ar': 'ar-SA',
        'ar-SA': 'ar-SA',
        'ar-EG': 'ar-EG',
        'ar-AE': 'ar-AE',
        'hi': 'hi-IN',
        'hi-IN': 'hi-IN'
    };
    
    return localeMap[i18nLang] || 'en-US';
}


export function getCountryCode(i18nLang: string): string {
    const countryMap: Record<string, string> = {
        'en': 'US',
        'en-US': 'US',
        'en-GB': 'GB',
        'zh': 'CN',
        'zh-CN': 'CN',
        'zh-TW': 'TW',
        'zh-HK': 'HK',
        'ja': 'JP',
        'ko': 'KR',
        'es': 'ES',
        'es-ES': 'ES',
        'es-MX': 'MX',
        'fr': 'FR',
        'de': 'DE',
        'ru': 'RU',
        'it': 'IT',
        'pt': 'PT',
        'pt-PT': 'PT',
        'pt-BR': 'BR',
        'tr': 'TR',
        'ar': 'SA',
        'ar-SA': 'SA',
        'ar-EG': 'EG',
        'ar-AE': 'AE',
        'hi': 'IN',
        'hi-IN': 'IN'
    };
    
    return countryMap[i18nLang] || 'US';
}
