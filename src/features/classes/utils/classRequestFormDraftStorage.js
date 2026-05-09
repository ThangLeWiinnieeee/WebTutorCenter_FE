import { MINUTES_PER_SESSION_PRESETS } from '../schemas/classRequestSchema';

const CLASS_REQUEST_FORM_DRAFT_STORAGE_KEY = 'webtutor:classRequestFormDraft:v1';

export function loadClassRequestFormDraft(baseDefaults) {
  if (typeof window === 'undefined') return baseDefaults;
  try {
    const raw = window.localStorage.getItem(CLASS_REQUEST_FORM_DRAFT_STORAGE_KEY);
    if (!raw) return baseDefaults;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return baseDefaults;
    const merged = { ...baseDefaults, ...parsed };
    const m = Number(merged.minutesPerSession);
    if (!MINUTES_PER_SESSION_PRESETS.includes(m)) {
      merged.minutesPerSession = baseDefaults.minutesPerSession;
    }
    return merged;
  } catch {
    return baseDefaults;
  }
}

export function saveClassRequestFormDraft(values) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLASS_REQUEST_FORM_DRAFT_STORAGE_KEY, JSON.stringify(values));
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function clearClassRequestFormDraft() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CLASS_REQUEST_FORM_DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
