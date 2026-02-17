
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';
import ru from './ru.json';
import en from './en.json';
import uz from './uz.json';

type Language = 'ru' | 'en' | 'uz';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, any> = { ru, en, uz };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        return (localStorage.getItem('language') as Language) || 'ru';
    });

    useEffect(() => {
        const fetchUserLanguage = async () => {
            try {
                const response = await api.get('/users/language');
                const lang = response.data.data.language;
                if (lang && lang !== language) {
                    setLanguageState(lang);
                    localStorage.setItem('language', lang);
                }
            } catch (error) {
                console.error('Failed to fetch language preference', error);
            }
        };

        fetchUserLanguage();
    }, []);

    const setLanguage = async (lang: Language) => {
        try {
            await api.post('/users/language', { language: lang });
            setLanguageState(lang);
            localStorage.setItem('language', lang);
        } catch (error) {
            console.error('Failed to update language preference', error);
        }
    };

    const t = (key: string, params?: Record<string, string | number>) => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key;
            }
        }

        let text = value as string;
        if (params) {
            Object.entries(params).forEach(([key, val]) => {
                text = text.replace(new RegExp(`{${key}}`, 'g'), String(val));
            });
        }
        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
