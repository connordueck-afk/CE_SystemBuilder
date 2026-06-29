import type { SystemDesign } from '../types/system';
import { DEFAULT_ASSUMPTIONS } from '../data/electricalRules';

const STORAGE_KEY = 'nomadeus-system-v1';
const SAVED_SYSTEMS_KEY = 'nomadeus-saved-systems-v1';
const SAVE_FILE_VERSION = 1;

/** The running app version, injected at build time from package.json (see vite.config.ts). */
export const CURRENT_APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

export interface SystemSaveFile {
  fileType: 'nomadeus-system-builder';
  /** Save-file schema version (bump when the on-disk shape changes). */
  version: number;
  /** App version that produced this file, used for compatibility checks on load. */
  appVersion: string;
  exportedAt: string;
  system: SystemDesign;
}

export type CompatibilityStatus = 'ok' | 'newer' | 'older' | 'unknown';

export interface CompatibilityResult {
  status: CompatibilityStatus;
  /** Version the file was created with, or null if it predates version stamping. */
  sourceVersion: string | null;
  currentVersion: string;
  /** Human-readable warning to surface on load, or null when fully compatible. */
  message: string | null;
}

export interface LoadResult {
  system: SystemDesign;
  compatibility: CompatibilityResult;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function majorOf(version: string | null): number | null {
  if (!version) return null;
  const match = /^\s*v?(\d+)/.exec(version);
  return match ? Number(match[1]) : null;
}

/**
 * Compares the version a design was saved with against the running app version.
 * Compatibility is keyed off the major version: a change in major signals a
 * potentially breaking schema change. Same major (or an unstamped file) loads clean.
 */
export function checkCompatibility(sourceVersion: string | null): CompatibilityResult {
  const base = { sourceVersion, currentVersion: CURRENT_APP_VERSION };

  if (!sourceVersion) {
    return { ...base, status: 'unknown', message: null };
  }

  const sourceMajor = majorOf(sourceVersion);
  const currentMajor = majorOf(CURRENT_APP_VERSION);

  if (sourceMajor === null || currentMajor === null || sourceMajor === currentMajor) {
    return { ...base, status: 'ok', message: null };
  }

  if (sourceMajor > currentMajor) {
    return {
      ...base,
      status: 'newer',
      message: `This design was created with a newer version of System Builder (v${sourceVersion}) than the one you're running (v${CURRENT_APP_VERSION}). It has been loaded, but some parts may not appear or behave correctly. Update the app for full compatibility.`,
    };
  }

  return {
    ...base,
    status: 'older',
    message: `This design was created with an older version of System Builder (v${sourceVersion}). It has been loaded, but some parts may render or behave differently in the current app (v${CURRENT_APP_VERSION}).`,
  };
}

export function createSystemSaveFile(system: SystemDesign): SystemSaveFile {
  return {
    fileType: 'nomadeus-system-builder',
    version: SAVE_FILE_VERSION,
    appVersion: CURRENT_APP_VERSION,
    exportedAt: new Date().toISOString(),
    system,
  };
}

export function parseSystemSaveFile(raw: string): LoadResult {
  const parsed = JSON.parse(raw) as unknown;
  const isSaveFile = isObject(parsed) && parsed.fileType === 'nomadeus-system-builder';
  const candidate = isSaveFile ? parsed.system : parsed;
  const sourceVersion = isSaveFile && typeof parsed.appVersion === 'string' ? parsed.appVersion : null;

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

  const system: SystemDesign = {
    ...(candidate as unknown as SystemDesign),
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date().toISOString(),
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
    assumptions: {
      ...DEFAULT_ASSUMPTIONS,
      ...(isObject(candidate.assumptions) ? candidate.assumptions : {}),
    },
  };

  return { system, compatibility: checkCompatibility(sourceVersion) };
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
