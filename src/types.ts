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

export type Cause = 'Environment' | 'Education' | 'Health' | 'Animal Welfare' | 'Community' | 'Arts';

export interface VolunteerSite {
  id: string;
  name: string;
  location: string;
  cause: Cause;
  description: string;
  impactScore: number;
  image: string;
  distance?: string;
}

export interface VolunteerOpportunity {
  id: string;
  siteId: string;
  title: string;
  date: string;
  duration: string;
  requirements: string[];
}

export interface SiteAdvice {
  preparation: string;
  whatToBring: string[];
  safetyTips: string[];
  impactSummary: string;
}

