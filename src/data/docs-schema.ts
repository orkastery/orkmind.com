export type Locale = 'pt' | 'en' | 'es';
export interface Section { id: string; title: string; paragraphs: string[]; code?: string; items?: string[]; }
export interface Translation { title: string; description: string; sections: Section[]; }
export interface Article { slug: string; group: string; sources: string[]; diagram?: string; translations: Record<Locale, Translation>; }
