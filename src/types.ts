export type Frequency = 'daily' | 'weekly' | 'as-needed';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: Frequency;
  time?: string; // e.g., "08:00"
  notes?: string;
  lastTaken?: string; // ISO string
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  homeTimeZone: string;
  destinationTimeZone: string;
}

export interface TravelAdvice {
  legality: string;
  requirements: string[];
  tips: string[];
  pharmacyInfo: string;
}
