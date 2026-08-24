import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { generateId } from '../utils/id';
import type { AppSettings, Counter, CounterList, DailyChallenge, HistoryEntry, HistorySource, ID } from './types';

const STORE_VERSION = 3;

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  hapticsOnTap: true,
  showMinusButton: true,
  volumeButtonsEnabled: true,
  keepScreenAwake: false,
  notifications: { enabled: false, times: ['20:00'] },
};

/** Pas d'incrément proposés par défaut dans le sélecteur rapide. */
export const STEP_PRESETS = [1, 2, 5, 10, 25, 50, 100] as const;

interface CounterStoreState {
  lists: CounterList[];
  counters: Counter[];
  history: HistoryEntry[];
  settings: AppSettings;
  hasHydrated: boolean;

  // Listes
  addList: (name: string) => ID;
  renameList: (listId: ID, name: string) => void;
  removeList: (listId: ID) => void;
  archiveList: (listId: ID) => void;
  restoreList: (listId: ID) => void;
  toggleNewCounterAtTop: (listId: ID) => void;

  // Compteurs
  addCounter: (listId: ID, name: string, initialStep?: number) => ID;
  renameCounter: (counterId: ID, name: string) => void;
  removeCounter: (counterId: ID) => void;
  archiveCounter: (counterId: ID) => void;
  restoreCounter: (counterId: ID) => void;
  setCounterStep: (counterId: ID, step: number) => void;
  setCounterGoal: (counterId: ID, goal: number | null) => void;
  updateDailyChallenge: (counterId: ID, patch: Partial<DailyChallenge>) => void;
  incrementCounter: (counterId: ID, source?: HistorySource) => void;
  decrementCounter: (counterId: ID, source?: HistorySource) => void;
  resetCounter: (counterId: ID) => void;

  // Réglages
  updateSettings: (patch: Partial<AppSettings>) => void;

  // Sélecteurs dérivés (fonctions pures, pas d'état recalculé stocké)
  getListsSorted: () => CounterList[];
  getCountersForList: (listId: ID) => Counter[];
  getHistoryForCounter: (counterId: ID) => HistoryEntry[];
  getListTotals: (listId: ID) => { sum: number; average: number; count: number };
  getCountersWithGoals: () => Counter[];
  getArchivedLists: () => CounterList[];
  getArchivedCounters: () => Counter[];
}

export const useCounterStore = create<CounterStoreState>()(
  persist(
    (set, get) => ({
      lists: [],
      counters: [],
      history: [],
      settings: DEFAULT_SETTINGS,
      hasHydrated: false,

      addList: (name) => {
        const id = generateId();
        const order = get().lists.length;
        const newList: CounterList = {
          id,
          name: name.trim() || 'Nouvelle liste',
          order,
          createdAt: Date.now(),
          newCounterAtTop: false,
          hideSumAndAverage: false,
          archivedAt: null,
        };
        set((s) => ({ lists: [...s.lists, newList] }));
        return id;
      },

      renameList: (listId, name) => {
        set((s) => ({
          lists: s.lists.map((l) => (l.id === listId ? { ...l, name: name.trim() || l.name } : l)),
        }));
      },

      removeList: (listId) => {
        set((s) => ({
          lists: s.lists.filter((l) => l.id !== listId),
          counters: s.counters.filter((c) => c.listId !== listId),
          history: s.history.filter((h) => {
            const counter = s.counters.find((c) => c.id === h.counterId);
            return counter ? counter.listId !== listId : true;
          }),
        }));
      },

      archiveList: (listId) => {
        const now = Date.now();
        set((s) => ({
          lists: s.lists.map((l) => (l.id === listId ? { ...l, archivedAt: now } : l)),
          // Cascade : les compteurs actifs de la liste partent en archive avec elle.
          counters: s.counters.map((c) =>
            c.listId === listId && c.archivedAt === null ? { ...c, archivedAt: now } : c
          ),
        }));
      },

      restoreList: (listId) => {
        set((s) => ({
          lists: s.lists.map((l) => (l.id === listId ? { ...l, archivedAt: null } : l)),
          // Cascade : restaure aussi les compteurs de la liste.
          counters: s.counters.map((c) => (c.listId === listId ? { ...c, archivedAt: null } : c)),
        }));
      },

      toggleNewCounterAtTop: (listId) => {
        set((s) => ({
          lists: s.lists.map((l) => (l.id === listId ? { ...l, newCounterAtTop: !l.newCounterAtTop } : l)),
        }));
      },

      addCounter: (listId, name, initialStep = 1) => {
        const id = generateId();
        const list = get().lists.find((l) => l.id === listId);
        const siblings = get().counters.filter((c) => c.listId === listId);
        const atTop = list?.newCounterAtTop ?? false;
        const order = atTop
          ? Math.min(0, ...siblings.map((c) => c.order)) - 1
          : Math.max(-1, ...siblings.map((c) => c.order)) + 1;

        const newCounter: Counter = {
          id,
          listId,
          name: name.trim() || 'Nouveau compteur',
          value: 0,
          step: initialStep,
          order,
          createdAt: Date.now(),
          resetAt: null,
          lastClickAt: null,
          goal: null,
          dailyChallenge: { enabled: false, dailyGoal: null },
          archivedAt: null,
        };
        set((s) => ({ counters: [...s.counters, newCounter] }));
        return id;
      },

      renameCounter: (counterId, name) => {
        set((s) => ({
          counters: s.counters.map((c) => (c.id === counterId ? { ...c, name: name.trim() || c.name } : c)),
        }));
      },

      removeCounter: (counterId) => {
        set((s) => ({
          counters: s.counters.filter((c) => c.id !== counterId),
          history: s.history.filter((h) => h.counterId !== counterId),
        }));
      },

      archiveCounter: (counterId) => {
        set((s) => ({
          counters: s.counters.map((c) => (c.id === counterId ? { ...c, archivedAt: Date.now() } : c)),
        }));
      },

      restoreCounter: (counterId) => {
        set((s) => ({
          counters: s.counters.map((c) => (c.id === counterId ? { ...c, archivedAt: null } : c)),
        }));
      },

      setCounterStep: (counterId, step) => {
        const safeStep = Number.isFinite(step) && step > 0 ? Math.floor(step) : 1;
        set((s) => ({
          counters: s.counters.map((c) => (c.id === counterId ? { ...c, step: safeStep } : c)),
        }));
      },

      setCounterGoal: (counterId, goal) => {
        const safeGoal = goal !== null && Number.isFinite(goal) && goal > 0 ? Math.floor(goal) : null;
        set((s) => ({
          counters: s.counters.map((c) => (c.id === counterId ? { ...c, goal: safeGoal } : c)),
        }));
      },

      updateDailyChallenge: (counterId, patch) => {
        const safePatch: Partial<DailyChallenge> = { ...patch };
        if ('dailyGoal' in safePatch) {
          const g = safePatch.dailyGoal;
          safePatch.dailyGoal = g !== null && g !== undefined && Number.isFinite(g) && g > 0 ? Math.floor(g) : null;
        }
        set((s) => ({
          counters: s.counters.map((c) =>
            c.id === counterId ? { ...c, dailyChallenge: { ...c.dailyChallenge, ...safePatch } } : c
          ),
        }));
      },

      incrementCounter: (counterId, source = 'button-plus') => {
        const now = Date.now();
        const counter = get().counters.find((c) => c.id === counterId);
        if (!counter) return;
        const nextValue = counter.value + counter.step;

        set((s) => ({
          counters: s.counters.map((c) =>
            c.id === counterId ? { ...c, value: nextValue, lastClickAt: now } : c
          ),
          history: [
            ...s.history,
            { id: generateId(), counterId, delta: counter.step, value: nextValue, timestamp: now, source },
          ],
        }));
      },

      decrementCounter: (counterId, source = 'button-minus') => {
        const now = Date.now();
        const counter = get().counters.find((c) => c.id === counterId);
        if (!counter) return;
        const nextValue = counter.value - counter.step;

        set((s) => ({
          counters: s.counters.map((c) =>
            c.id === counterId ? { ...c, value: nextValue, lastClickAt: now } : c
          ),
          history: [
            ...s.history,
            { id: generateId(), counterId, delta: -counter.step, value: nextValue, timestamp: now, source },
          ],
        }));
      },

      resetCounter: (counterId) => {
        const now = Date.now();
        set((s) => ({
          counters: s.counters.map((c) =>
            c.id === counterId ? { ...c, value: 0, resetAt: now } : c
          ),
        }));
      },

      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },

      getListsSorted: () =>
        get()
          .lists.filter((l) => l.archivedAt === null)
          .sort((a, b) => a.order - b.order),

      getCountersForList: (listId) =>
        get()
          .counters.filter((c) => c.listId === listId && c.archivedAt === null)
          .sort((a, b) => a.order - b.order),

      getHistoryForCounter: (counterId) =>
        get()
          .history.filter((h) => h.counterId === counterId)
          .sort((a, b) => b.timestamp - a.timestamp),

      getListTotals: (listId) => {
        const counters = get().counters.filter((c) => c.listId === listId && c.archivedAt === null);
        const sum = counters.reduce((acc, c) => acc + c.value, 0);
        const average = counters.length > 0 ? sum / counters.length : 0;
        return { sum, average, count: counters.length };
      },

      getCountersWithGoals: () => get().counters.filter((c) => c.goal !== null && c.archivedAt === null),

      getArchivedLists: () =>
        get()
          .lists.filter((l) => l.archivedAt !== null)
          .sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0)),

      getArchivedCounters: () =>
        get()
          .counters.filter((c) => c.archivedAt !== null)
          .sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0)),
    }),
    {
      name: 'compteur-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ lists: s.lists, counters: s.counters, history: s.history, settings: s.settings }),
      version: STORE_VERSION,
      // Des comptes existants sont déjà persistés (usage réel) : on complète les
      // listes/compteurs sauvegardés avant ces champs plutôt que de risquer un
      // crash au premier lancement après mise à jour.
      migrate: (persistedState) => {
        const state = persistedState as
          | {
              lists?: Array<Partial<CounterList>>;
              counters?: Array<Partial<Counter>>;
              settings?: Partial<AppSettings>;
            }
          | undefined;
        if (state?.counters) {
          state.counters = state.counters.map((c) => ({
            ...c,
            dailyChallenge: c.dailyChallenge ?? { enabled: false, dailyGoal: null },
            archivedAt: c.archivedAt ?? null,
          }));
        }
        if (state?.lists) {
          state.lists = state.lists.map((l) => ({
            ...l,
            archivedAt: l.archivedAt ?? null,
          }));
        }
        if (state?.settings) {
          state.settings = {
            ...state.settings,
            notifications: state.settings.notifications ?? { enabled: false, times: ['20:00'] },
          };
        }
        return state;
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    }
  )
);
