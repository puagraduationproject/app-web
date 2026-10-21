import { ar } from './ar';
import { en, type Texts } from './en';

export type Language = 'ar' | 'en';

export const texts: Record<Language, Texts> = { ar, en };

export const direction = (language: Language) => (language === 'ar' ? 'rtl' : 'ltr');
