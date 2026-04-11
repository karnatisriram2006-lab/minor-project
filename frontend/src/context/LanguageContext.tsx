"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../messages/en.json';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {}
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState('en');
  const [messages, setMessages] = useState<any>(enMessages);

  // Initialize locale from local storage or browser
  useEffect(() => {
     const storedLocale = localStorage.getItem('YATRA_LOCALE');
     if (storedLocale && ['en', 'hi', 'te'].includes(storedLocale)) {
        setLocale(storedLocale);
     } else {
        const browserLang = navigator.language.split('-')[0];
        if (['en', 'hi', 'te'].includes(browserLang)) {
           setLocale(browserLang);
        }
     }
  }, []);

  // Fetch messages dynamically when locale changes
  useEffect(() => {
     if (locale === 'en') {
       setMessages(enMessages);
       localStorage.setItem('YATRA_LOCALE', 'en');
       return;
     }

     import(`../messages/${locale}.json`).then((module) => {
        setMessages(module.default);
        localStorage.setItem('YATRA_LOCALE', locale);
     }).catch(err => {
        console.error(`Failed to load messages for locale: ${locale}`, err);
        setLocale('en'); // fallback
     });
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
       <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
       </NextIntlClientProvider>
    </LanguageContext.Provider>
  )
};
