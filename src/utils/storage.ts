import type { SystemDesign } from '../types/system';
import { DEFAULT_ASSUMPTIONS } from '../data/electricalRules';

const STORAGE_KEY = 'des-system-builder-v2';
const SAVED_SYSTEMS_KEY = 'des-saved-systems-v2';
const SAVE_FILE_VERSION = 2 as const;

/** The running app version, injected at build time from package.json (see vite.config.ts). */
export const CURRENT_APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

export interface SystemSaveFile {
  fileType: 'des-system-builder';
  version: typeof SAVE_FILE_VERSION;
  appVersion: string;
  exportedAt: string;
  system: SystemDesign;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseCurrentSystem(candidate: unknown): SystemDesign {
  if (!isObject(candidate)) throw new Error('Save file does not contain a system design.');
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    !Array.isArray(candidate.components) ||
    !Array.isArray(candidate.connections)
  ) {
    throw new Error('Save file is not a valid System Builder design.');
  }

  const assumptions = isObject(candidate.assumptions) ? candidate.assumptions : {};
  return {
    ...(candidate as unknown as SystemDesign),
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date().toISOString(),
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
    assumptions: { ...DEFAULT_ASSUMPTIONS, ...assumptions },
  };
}

export function createSystemSaveFile(system: SystemDesign): SystemSaveFile {
  return {
    fileType: 'des-system-builder',
    version: SAVE_FILE_VERSION,
    appVersion: CURRENT_APP_VERSION,
    exportedAt: new Date().toISOString(),
    system,
  };
}

export function parseSystemSaveFile(raw: string): SystemDesign {
  const parsed = JSON.parse(raw) as unknown;
  if (!isObject(parsed) || parsed.fileType !== 'des-system-builder') {
    throw new Error('This is not a current System Builder save file.');
  }
  if (parsed.version !== SAVE_FILE_VERSION) {
    throw new Error(`Unsupported save-file schema. Expected version ${SAVE_FILE_VERSION}.`);
  }
  return parseCurrentSystem(parsed.system);
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

export function saveCurrentSystem(system: SystemDesign): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(system));
    const saved = loadSavedSystems();
    const idx = saved.findIndex((candidate) => candidate.id === system.id);
    if (idx >= 0) saved[idx] = system;
    else saved.push(system);
    localStorage.setItem(SAVED_SYSTEMS_KEY, JSON.stringify(saved));
    return true;
  } catch {
    console.warn('Failed to save system to localStorage');
    return false;
  }
}

export function loadCurrentSystem(): SystemDesign | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseCurrentSystem(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function loadSavedSystems(): SystemDesign[] {
  try {
    const raw = localStorage.getItem(SAVED_SYSTEMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(parseCurrentSystem) : [];
  } catch {
    return [];
  }
}

export function deleteSavedSystem(id: string): void {
  try {
    const saved = loadSavedSystems().filter((system) => system.id !== id);
    localStorage.setItem(SAVED_SYSTEMS_KEY, JSON.stringify(saved));
  } catch {
    console.warn('Failed to delete system from localStorage');
  }
}
