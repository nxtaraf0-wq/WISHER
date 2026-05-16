import { useEffect, useState } from 'react';
import { SavedWish } from '../types';

export function useSavedWishes() {
  const [wishes, setWishes] = useState<SavedWish[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('joyful_wishes');
      if (stored) setWishes(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to parse stored wishes', e);
    }
  }, []);

  const saveWish = (wish: Omit<SavedWish, 'id' | 'createdAt'>) => {
    const newWish: SavedWish = {
      ...wish,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    
    const updated = [newWish, ...wishes];
    setWishes(updated);
    try {
      localStorage.setItem('joyful_wishes', JSON.stringify(updated));
    } catch(e) {}
    
    return newWish;
  };

  const deleteWish = (id: string) => {
    const updated = wishes.filter(w => w.id !== id);
    setWishes(updated);
    try {
      localStorage.setItem('joyful_wishes', JSON.stringify(updated));
    } catch(e) {}
  };

  return { wishes, saveWish, deleteWish };
}
