export type ScreenName = 
  | 'AUTH_LOGIN' 
  | 'AUTH_REGISTER' 
  | 'AUTH_FORGOT'
  | 'CALENDAR' 
  | 'DATA' 
  | 'PROFILE'
  | 'ADD_TRANSFUSION'
  | 'EDIT_TRANSFUSION'
  | 'ADD_ANALYSIS'
  | 'EDIT_ANALYSIS'
  | 'ADD_REMINDER'
  | 'EDIT_REMINDER'
  | 'LEGAL_TERMS'
  | 'LEGAL_PRIVACY'
  | 'CHANGE_PASSWORD'
  | 'SHARE_DATA'
  | 'MY_DATA';

export interface Transfusion {
  id: string;
  date: string;
  volume: number; // ml
  weight: number; // kg
  volumePerKg: number;
  hbBefore: number;
  hbAfter: number;
  deltaHb: number;
  chelator?: string;
}

export interface AnalysisItem {
  name: string;
  value: string;
  unit: string;
}

export interface Analysis {
  id: string;
  date: string;
  templateName?: string;
  items: AnalysisItem[];
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string;
  repeat: string;
  note?: string;
}

export interface User {
  email: string;
  name: string;
}