import type { SystemDesign } from '../types/system';

const STORAGE_KEY = 'nomadeus-system-v1';
const SAVED_SYSTEMS_KEY = 'nomadeus-saved-systems-v1';

export function saveCurrentSystem(system: SystemDesign): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(system));
    const saved = loadSavedSystems();
    const idx = saved.findIndex((s) => s.id === system.id);
    if (idx >= 0) {
      saved[idx] = system;
    } else {
      saved.push(system);
    }
    localStorage.setItem(SAVED_SYSTEMS_KEY, JSON.stringify(saved));
  } catch {
    console.warn('Failed to save system to localStorage');
  }
}

export function loadCurrentSystem(): SystemDesign | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SystemDesign) : null;
  } catch {
    return null;
  }
}

export function loadSavedSystems(): SystemDesign[] {
  try {
    const raw = localStorage.getItem(SAVED_SYSTEMS_KEY);
    return raw ? (JSON.parse(raw) as SystemDesign[]) : [];
  } catch {
    return [];
  }
}

export function deleteSavedSystem(id: string): void {
  try {
    const saved = loadSavedSystems().filter((s) => s.id !== id);
    localStorage.setItem(SAVED_SYSTEMS_KEY, JSON.stringify(saved));
  } catch {
    console.warn('Failed to delete system from localStorage');
  }
}
