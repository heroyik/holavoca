
export interface Word {
  id: string;
  spanish: string;
  gender?: 'm' | 'f' | 'm/f';
  korean: string;
  level?: number;
  mastered?: boolean;
}

export enum View {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  STUDY = 'STUDY',
  LIST = 'LIST',
  QUIZ = 'QUIZ',
  VOICE = 'VOICE'
}

export interface AppState {
  words: Word[];
  currentView: View;
  loading: boolean;
}
