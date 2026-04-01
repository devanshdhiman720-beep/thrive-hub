import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Subject {
  id: string;
  name: string;
  syllabusTopics: { name: string; completed: boolean }[];
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  duration: number; // minutes
  date: string;
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface HealthLog {
  id: string;
  exercise: string;
  duration: number;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  date: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDates: string[];
}

export interface Expense {
  id: string;
  amount: number;
  category: 'food' | 'travel' | 'study' | 'entertainment' | 'health' | 'other';
  description: string;
  type: 'income' | 'expense';
  date: string;
}

interface WellnessStore {
  // Academic
  subjects: Subject[];
  studySessions: StudySession[];
  assignments: Assignment[];
  addSubject: (name: string, topics: string[]) => void;
  addStudySession: (subjectId: string, duration: number) => void;
  addAssignment: (subjectId: string, title: string, deadline: string) => void;
  updateAssignmentStatus: (id: string, status: Assignment['status']) => void;
  toggleTopic: (subjectId: string, topicIndex: number) => void;

  // Health
  healthLogs: HealthLog[];
  habits: Habit[];
  addHealthLog: (exercise: string, duration: number, mood: HealthLog['mood']) => void;
  addHabit: (name: string) => void;
  toggleHabitToday: (id: string) => void;

  // Finance
  expenses: Expense[];
  addExpense: (data: Omit<Expense, 'id' | 'date'>) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().split('T')[0];

export const useWellnessStore = create<WellnessStore>()(
  persist(
    (set) => ({
      // Academic
      subjects: [],
      studySessions: [],
      assignments: [],

      addSubject: (name, topics) =>
        set((s) => ({
          subjects: [
            ...s.subjects,
            { id: uid(), name, syllabusTopics: topics.map((t) => ({ name: t, completed: false })), createdAt: today() },
          ],
        })),

      addStudySession: (subjectId, duration) =>
        set((s) => ({
          studySessions: [...s.studySessions, { id: uid(), subjectId, duration, date: today() }],
        })),

      addAssignment: (subjectId, title, deadline) =>
        set((s) => ({
          assignments: [...s.assignments, { id: uid(), subjectId, title, deadline, status: 'pending' }],
        })),

      updateAssignmentStatus: (id, status) =>
        set((s) => ({
          assignments: s.assignments.map((a) => (a.id === id ? { ...a, status } : a)),
        })),

      toggleTopic: (subjectId, topicIndex) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === subjectId
              ? {
                  ...sub,
                  syllabusTopics: sub.syllabusTopics.map((t, i) =>
                    i === topicIndex ? { ...t, completed: !t.completed } : t
                  ),
                }
              : sub
          ),
        })),

      // Health
      healthLogs: [],
      habits: [],

      addHealthLog: (exercise, duration, mood) =>
        set((s) => ({
          healthLogs: [...s.healthLogs, { id: uid(), exercise, duration, mood, date: today() }],
        })),

      addHabit: (name) =>
        set((s) => ({
          habits: [...s.habits, { id: uid(), name, streak: 0, completedDates: [] }],
        })),

      toggleHabitToday: (id) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const todayStr = today();
            const alreadyDone = h.completedDates.includes(todayStr);
            return {
              ...h,
              completedDates: alreadyDone
                ? h.completedDates.filter((d) => d !== todayStr)
                : [...h.completedDates, todayStr],
              streak: alreadyDone ? Math.max(0, h.streak - 1) : h.streak + 1,
            };
          }),
        })),

      // Finance
      expenses: [],

      addExpense: (data) =>
        set((s) => ({
          expenses: [...s.expenses, { ...data, id: uid(), date: today() }],
        })),
    }),
    { name: 'wellness-tracker' }
  )
);
