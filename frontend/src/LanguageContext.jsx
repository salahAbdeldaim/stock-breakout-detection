import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  translations,
  translateAllocation,
  translateConsensusRate,
  translateActionGuidance,
  translateRiskManagement,
  translateRationale,
  translateScreenerReason,
  translateExpertProfile
} from './i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Default to English ('en') as requested
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('qb_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('qb_lang', newLang);
    } catch (e) {
      console.warn('localStorage error:', e);
    }
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const value = {
    lang,
    setLang,
    t,
    helpers: {
      translateAllocation: (v) => translateAllocation(v, lang),
      translateConsensusRate: (v) => translateConsensusRate(v, lang),
      translateActionGuidance: (v) => translateActionGuidance(v, lang),
      translateRiskManagement: (v) => translateRiskManagement(v, lang),
      translateRationale: (v) => translateRationale(v, lang),
      translateScreenerReason: (v) => translateScreenerReason(v, lang),
      translateExpertProfile: (v) => translateExpertProfile(v, lang)
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
