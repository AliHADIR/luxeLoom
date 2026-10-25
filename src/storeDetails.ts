import { Language } from './types';
type Localized = Record<Language, string>;
// Publish only confirmed policy text and customer-approved testimonials.
export const STORE_DETAILS: {
  delivery?: Localized;
  returns?: Localized;
  reviews: { id: string; author: string; quote: Localized }[];
} = { reviews: [] };
