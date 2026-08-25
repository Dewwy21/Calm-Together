export interface WeeklyCheckIn {
  id: string;
  /** ISO string for the Monday of the week this check-in covers — used for "is one due" logic. */
  weekStartISO: string;
  caregiverMoodRating: number;
  childMoodRating: number;
  biggestWin: string;
  biggestChallenge: string;
  createdAtISO: string;
}

export type WeeklyCheckInInput = Omit<WeeklyCheckIn, 'id' | 'weekStartISO' | 'createdAtISO'>;
