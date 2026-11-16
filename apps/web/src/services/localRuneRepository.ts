import {
  INITIAL_GIFTS,
  INITIAL_TIER_PROGRESS,
  INITIAL_TODAY_EXERCISES,
  SAMPLE_CALENDAR_RECORDS,
  SAMPLE_MEMBER,
  SAMPLE_TRAINER_MEMBERS,
} from '@rune-pt/core';
import type { RuneAppSnapshot, RuneDataRepository } from '@rune-pt/core';

const STORAGE_KEY = 'rpt1';
const STORAGE_VERSION = 1;

interface StoredPayload {
  version: number;
  snapshot: Partial<RuneAppSnapshot>;
}

function cloneData<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createDefaultSnapshot(): RuneAppSnapshot {
  return cloneData({
    member: SAMPLE_MEMBER,
    mode: 'volume',
    trailOrderEnabled: true,
    exercises: INITIAL_TODAY_EXERCISES,
    tierProgress: INITIAL_TIER_PROGRESS,
    gifts: INITIAL_GIFTS,
    records: SAMPLE_CALENDAR_RECORDS,
    trainerMembers: SAMPLE_TRAINER_MEMBERS,
    savedAtLabel: '자동 저장됨 · 08:10',
  });
}

function mergeWithDefaults(partial: Partial<RuneAppSnapshot> | undefined): RuneAppSnapshot {
  const defaults = createDefaultSnapshot();
  if (!partial || typeof partial !== 'object') return defaults;

  return {
    member:
      partial.member && typeof partial.member === 'object'
        ? { ...defaults.member, ...partial.member }
        : defaults.member,
    mode:
      partial.mode === 'volume' || partial.mode === 'strength' || partial.mode === 'low'
        ? partial.mode
        : defaults.mode,
    trailOrderEnabled:
      typeof partial.trailOrderEnabled === 'boolean'
        ? partial.trailOrderEnabled
        : defaults.trailOrderEnabled,
    exercises: Array.isArray(partial.exercises) ? partial.exercises : defaults.exercises,
    tierProgress: Array.isArray(partial.tierProgress)
      ? partial.tierProgress
      : defaults.tierProgress,
    gifts: Array.isArray(partial.gifts) ? partial.gifts : defaults.gifts,
    records: Array.isArray(partial.records) ? partial.records : defaults.records,
    trainerMembers: Array.isArray(partial.trainerMembers)
      ? partial.trainerMembers
      : defaults.trainerMembers,
    savedAtLabel:
      typeof partial.savedAtLabel === 'string' && partial.savedAtLabel.length > 0
        ? partial.savedAtLabel
        : defaults.savedAtLabel,
  };
}

/**
 * 브라우저 localStorage('rpt1')를 사용하는 기본 저장소 구현체.
 * 새로고침해도 오늘 운동 세트, 선물함 수령 여부, 회원 정보 변경이 그대로 유지됩니다.
 */
export const localRuneRepository: RuneDataRepository = {
  loadSnapshot(): RuneAppSnapshot {
    if (typeof window === 'undefined') {
      return createDefaultSnapshot();
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultSnapshot();
      const parsed = JSON.parse(raw) as StoredPayload;
      if (!parsed || parsed.version !== STORAGE_VERSION) {
        return createDefaultSnapshot();
      }
      return mergeWithDefaults(parsed.snapshot);
    } catch {
      return createDefaultSnapshot();
    }
  },

  saveSnapshot(snapshot: RuneAppSnapshot): void {
    if (typeof window === 'undefined') return;
    try {
      const payload: StoredPayload = {
        version: STORAGE_VERSION,
        snapshot,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // 시크릿 모드 또는 저장 공간 한도 초과 시 조용히 무시 (UI 중단 방지)
    }
  },

  resetSnapshot(): RuneAppSnapshot {
    const fresh = createDefaultSnapshot();
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    return fresh;
  },
};

/**
 * App.tsx는 이 단일 변수만 import해서 사용합니다.
 * 추후 Supabase 어댑터를 연결할 때는 이 줄만 새 구현체로 바꾸면 됩니다.
 */
export const runeRepository: RuneDataRepository = localRuneRepository;
