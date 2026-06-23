import type { SystemDesign } from '../types/system';
import { DEFAULT_ASSUMPTIONS } from '../data/electricalRules';

const STORAGE_KEY = 'nomadeus-system-v1';
const SAVED_SYSTEMS_KEY = 'nomadeus-saved-systems-v1';
const SAVE_FILE_VERSION = 1;

export interface SystemSaveFile {
  fileType: 'nomadeus-system-builder';
  version: number;
  exportedAt: string;
  system: SystemDesign;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function createSystemSaveFile(system: SystemDesign): SystemSaveFile {
  return {
    fileType: 'nomadeus-system-builder',
    version: SAVE_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    system,
  };
}

export function parseSystemSaveFile(raw: string): SystemDesign {
  const parsed = JSON.parse(raw) as unknown;
  const candidate = isObject(parsed) && parsed.fileType === 'nomadeus-system-builder'
    ? parsed.system
    : parsed;

  if (!isObject(candidate)) {
    throw new Error('Save file does not contain a system design.');
  }

  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    ![12, 24, 48].includes(candidate.nominalVoltage as number) ||
    !Array.isArray(candidate.components) ||
    !Array.isArray(candidate.connections)
  ) {
    throw new Error('Save file is not a valid System Builder design.');
  }

  return {
    ...(candidate as unknown as SystemDesign),
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date().toISOString(),
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
    assumptions: {
      ...DEFAULT_ASSUMPTIONS,
      ...(isObject(candidate.assumptions) ? candidate.assumptions : {}),
    },
  };
}

export function systemSaveFilename(system: SystemDesign): string {
  const safeName = system.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'system-design';

  return `${safeName}.system-builder.json`;
}

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
