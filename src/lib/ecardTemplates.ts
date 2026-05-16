import { ThemeId } from '../types';

export interface ECardTemplate {
  id: string;
  name: string;
  th: ThemeId;
  bg?: string;
  hf?: string;
  bf?: string;
  thumbnail: string;
}

export const ECARD_TEMPLATES: ECardTemplate[] = [
  {
    id: 't1',
    name: 'Midnight Sparkle',
    th: 'elegant',
    bg: 'sparkles',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=200&h=300'
  },
  {
    id: 't2',
    name: 'Party Pop',
    th: 'party',
    bg: 'confetti',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=200&h=300'
  },
  {
    id: 't3',
    name: 'Floating Joy',
    th: 'playful',
    bg: 'balloons',
    thumbnail: 'https://images.unsplash.com/photo-1530103862676-de88bade8e48?auto=format&fit=crop&q=80&w=200&h=300'
  },
  {
    id: 't4',
    name: 'Cozy Morning',
    th: 'minimal',
    thumbnail: 'https://images.unsplash.com/photo-1507133750073-dd420a322474?auto=format&fit=crop&q=80&w=200&h=300'
  },
  {
    id: 't5',
    name: 'Grand Celebration',
    th: 'party',
    bg: 'fireworks',
    thumbnail: 'https://images.unsplash.com/photo-1498931299472-7acdef79eca3?auto=format&fit=crop&q=80&w=200&h=300'
  }
];
