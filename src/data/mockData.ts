import { Transfusion, Analysis, Reminder } from './types';

export const MOCK_TRANSFUSIONS: Transfusion[] = [
  {
    id: '1',
    date: '2025-09-11',
    volume: 300,
    weight: 60,
    volumePerKg: 5.00,
    hbBefore: 90,
    hbAfter: 100,
    deltaHb: 10,
    chelator: 'Хилан 125 мг'
  },
  {
    id: '2',
    date: '2025-09-01',
    volume: 300,
    weight: 60,
    volumePerKg: 5.00,
    hbBefore: 88,
    hbAfter: 98,
    deltaHb: 10
  },
  {
    id: '3',
    date: '2025-08-20',
    volume: 300,
    weight: 59,
    volumePerKg: 5.08,
    hbBefore: 85,
    hbAfter: 95,
    deltaHb: 10
  }
];

export const MOCK_ANALYSES: Analysis[] = [
  {
    id: '1',
    date: '2025-09-10',
    items: [
      { name: 'Гемоглобин', value: '14.5', unit: 'г/дл' }, // Changed unit to match standard for 14.5 or use g/L as 145
      { name: 'Ферритин', value: '1200', unit: 'нг/мл' }
    ]
  }
];

export const MOCK_REMINDERS: Reminder[] = [
  {
    id: '1',
    title: 'Принять лекарство',
    date: '2025-09-12',
    time: '09:00',
    repeat: 'Ежедневно',
    note: 'После еды'
  }
];